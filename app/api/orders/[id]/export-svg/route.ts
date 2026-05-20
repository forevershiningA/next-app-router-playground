import { type NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { eq } from 'drizzle-orm';
import { db } from '#/lib/db/index';
import { orders, projects } from '#/lib/db/schema';
import { getServerSession } from '#/lib/auth/session';
import type { DesignerSnapshot } from '#/lib/project-schemas';

const PUBLIC_DIR = join(process.cwd(), 'public');

function readPublicSvg(urlPath: string): string | null {
  const clean = urlPath.replace(/^\//, '');
  const fullPath = join(PUBLIC_DIR, clean);
  if (!existsSync(fullPath)) return null;
  try { return readFileSync(fullPath, 'utf-8'); } catch { return null; }
}

function extractViewBox(svg: string): [number, number, number, number] {
  const m = svg.match(/viewBox="([^"]+)"/);
  if (!m) return [0, 0, 400, 400];
  const [x, y, w, h] = m[1].trim().split(/[\s,]+/).map(Number);
  return [x ?? 0, y ?? 0, w ?? 400, h ?? 400];
}

function extractPaths(svg: string): Array<{ d: string; fill?: string }> {
  const results: Array<{ d: string; fill?: string }> = [];
  const re = /<path([^>]*?)(?:\/>|>)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(svg)) !== null) {
    const attrs = m[1];
    const dMatch = attrs.match(/\bd="([^"]+)"/);
    const fillMatch = attrs.match(/\bfill="([^"]+)"/);
    if (dMatch) results.push({ d: dMatch[1], fill: fillMatch?.[1] });
  }
  return results;
}

/**
 * Approximate bounding box of SVG path data by treating all number pairs as (X, Y) coordinates.
 * This works accurately for paths using only M, L, Q, C commands (typical headstone shapes).
 * Arc commands (A) are NOT supported.
 */
function computePathBounds(paths: Array<{ d: string }>) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const { d } of paths) {
    const nums = (d.match(/-?[\d]*\.?[\d]+(?:[eE][-+]?[\d]+)?/g) ?? []).map(Number);
    for (let i = 0; i + 1 < nums.length; i += 2) {
      xs.push(nums[i]);
      ys.push(nums[i + 1]);
    }
  }
  if (xs.length === 0) return null;
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX, maxX, minY, maxY,
    dx: maxX - minX,
    dy: maxY - minY,
    centerX: (minX + maxX) / 2,
  };
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const [row] = await db
    .select({ invoiceNumber: orders.invoiceNumber, designState: projects.designState })
    .from(orders)
    .leftJoin(projects, eq(orders.projectId, projects.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const ds = row.designState as DesignerSnapshot | null;
  if (!ds) return NextResponse.json({ error: 'No design state for this order' }, { status: 404 });

  const stoneW = ds.widthMm ?? 600;
  const stoneH = ds.heightMm ?? 900;
  const cx = stoneW / 2;
  const cy = stoneH / 2;
  const PAD = 15; // mm margin around stone

  // ── Stone shape ──────────────────────────────────────────────────────────
  // After parsing the shape SVG, we compute the ACTUAL path bounding-box width (dx)
  // so geoToMm = widthMm/dx is the true isotropic scale factor used by Three.js
  // (SvgHeadstone sets sCore=widthMm/(10*dx), meshScale=[scale*sCore,scale*sCore,scale]).
  //
  // Using shapeViewW (viewBox width, always 400) as dx introduces up to ~5% error for
  // paths that don't fill the viewBox, shifting inscriptions by ~20mm on a 900mm stone.
  let shapeLayer = `<rect width="${stoneW}" height="${stoneH}" rx="2" fill="#e0e0e0" stroke="#444" stroke-width="1.5"/>`;

  // geoToMm: geometry-local units → mm.  Corrected below when a real shape is available.
  let geoToMm = stoneW / 400; // fallback for no shape (default square SVG, dx≈400)

  if (ds.shapeUrl) {
    const svgSrc = readPublicSvg(ds.shapeUrl);
    if (svgSrc) {
      const [vx, vy, vw, vh] = extractViewBox(svgSrc);
      const shapeViewW = vw - vx;
      const shapeViewH = vh - vy;
      const paths = extractPaths(svgSrc);
      const pathBounds = computePathBounds(paths.filter(p => p.fill !== 'none'));

      if (pathBounds && paths.length > 0) {
        const { minX, maxX, minY, dx, centerX } = pathBounds;

        // Isotropic scale: same factor for X and Y (matching Three.js geometry pipeline)
        geoToMm = stoneW / dx;

        // Correct isotropic SVG transform:
        //   path (centerX, minY)                          → export (cx, 0)      ← stone top
        //   path (centerX, minY + stoneH*dx/stoneW)       → export (cx, stoneH) ← stone bottom
        const tx = cx - centerX * geoToMm;
        const ty = -minY * geoToMm;

        shapeLayer =
          `<g transform="translate(${tx.toFixed(4)},${ty.toFixed(4)}) scale(${geoToMm.toFixed(6)},${geoToMm.toFixed(6)})" fill="#e0e0e0" stroke="#444" stroke-width="${(1.5 / geoToMm).toFixed(4)}">` +
          paths.map((p) => `<path d="${p.d}"/>`).join('') +
          '</g>';

        // Add bottom rectangular extension so the stone outline reaches stoneH.
        // SvgHeadstone extends the path with a band when wantH > coreH (preserveTop=true).
        const pathBottom = (pathBounds.maxY - minY) * geoToMm; // where path ends in export coords
        if (pathBottom < stoneH - 1) {
          const bandLeft = (minX - centerX) * geoToMm + cx;
          const bandRight = (maxX - centerX) * geoToMm + cx;
          shapeLayer +=
            `\n    <rect x="${bandLeft.toFixed(3)}" y="${pathBottom.toFixed(3)}"` +
            ` width="${(bandRight - bandLeft).toFixed(3)}" height="${(stoneH - pathBottom).toFixed(3)}"` +
            ` fill="#e0e0e0" stroke="#444" stroke-width="1.5"/>`;
        }
      } else if (paths.length > 0) {
        // Fallback: no usable path bounds — use non-isotropic viewBox scale
        const sx = stoneW / shapeViewW;
        const sy = stoneH / shapeViewH;
        geoToMm = stoneW / shapeViewW;
        shapeLayer =
          `<g transform="scale(${sx.toFixed(6)},${sy.toFixed(6)})" fill="#e0e0e0" stroke="#444" stroke-width="${(1.5 / Math.max(sx, sy)).toFixed(4)}">` +
          paths.map((p) => `<path d="${p.d}"/>`).join('') +
          '</g>';
      }
    }
  }

  // Conversion: geometry-local units (from Three.js worldToLocal) → mm.
  // Three.js applies ONE isotropic scale factor (scale × sCore = widthMm / (1000 × dx)) to BOTH
  // X and Y axes.  The stone height is achieved by making the geometry taller in Y-units
  // (targetH_SV = heightMm × dx / widthMm), not by a separate Y scale.
  // Therefore both axes share the same mm-per-local-unit ratio: widthMm / dx.
  // geoToMm is set above; expose as both axes for clarity.
  const geoToMmX = geoToMm;
  const geoToMmY = geoToMm; // same isotropic scale — do NOT use stoneH / shapeViewH

  // Convert a position stored in one of the three coordinate spaces used by MotifModel /
  // HeadstoneInscription to SVG mm coordinates (origin = stone top-left corner).
  //
  //  'mm-center'  – xPos/yPos are mm offsets from stone centre, Y-up.
  //                 Canonical loaded designs use this; HeadstoneInscription does NOT update
  //                 the store for mm-center motifs, so they stay as mm.
  //  'absolute'   – xPos/yPos are Three.js geometry-local coords (same space as worldToLocal).
  //                 X centred at 0; Y from 0 (bottom) to ~vhApprox (top).
  //  'offset'     – xPos is geometry-local offset from centre X (= 0, same as absolute X).
  //                 yPos is the negation of the Y offset from the geometry centre: yPos = -(y – vy/2).
  //  undefined    – for inscriptions: default (0,0) means "stone centre"; any other value
  //                 was written by the drag handler as absolute geometry-local coords.
  function geoToSvg(
    xPos: number,
    yPos: number,
    coordinateSpace: 'mm-center' | 'absolute' | 'offset' | undefined,
    isDefaultZero = false,
  ): [number, number] {
    if (isDefaultZero) return [cx, cy];

    if (coordinateSpace === 'mm-center') {
      // mm offset from centre, Y-up → SVG top-left origin
      return [cx + xPos, cy - yPos];
    }

    if (coordinateSpace === 'offset') {
      // xPos = geo-local offset from center X (same scale as absolute)
      // yPos = -(geo-local offset from center Y)  →  geo-local Y = vhApprox/2 − yPos
      const svgX = cx + xPos * geoToMmX;
      const svgY = cy + yPos * geoToMmY; // yPos already negated, so adding moves down
      return [svgX, svgY];
    }

    // 'absolute' or unknown: full geometry-local coords, Y from bottom
    // svgY = stoneH − yPos*geoToMmY  because geo Y=0 is stone bottom, Y=vhApprox is top.
    const svgX = cx + xPos * geoToMmX;
    const svgY = stoneH - yPos * geoToMmY;
    return [svgX, svgY];
  }

  // ── Motifs ────────────────────────────────────────────────────────────────
  const motifLayers: string[] = [];
  for (const motif of ds.selectedMotifs ?? []) {
    const offset = ds.motifOffsets?.[motif.id];
    const heightMmMotif = offset?.heightMm ?? 100;
    const mxPos = offset?.xPos ?? 0;
    const myPos = offset?.yPos ?? 0;
    const coordSpace = offset?.coordinateSpace ??
      (offset?.target !== undefined ? 'absolute' : 'offset');

    const [mx, my] = geoToSvg(mxPos, myPos, coordSpace);

    if (motif.svgPath) {
      const motifSrc = readPublicSvg(motif.svgPath);
      if (motifSrc) {
        const [, , mvw, mvh] = extractViewBox(motifSrc);
        const aspect = mvh > 0 ? mvw / mvh : 1;
        const motifW = heightMmMotif * aspect;
        const scale = heightMmMotif / (mvh || 1);
        const paths = extractPaths(motifSrc);
        const color = motif.color || '#000000';
        const flipX = offset?.flipX ? -1 : 1;
        const flipY = offset?.flipY ? -1 : 1;
        motifLayers.push(
          `<g transform="translate(${mx.toFixed(3)},${my.toFixed(3)}) scale(${flipX},${flipY}) translate(${-(motifW / 2).toFixed(3)},${-(heightMmMotif / 2).toFixed(3)}) scale(${scale.toFixed(6)})" fill="${color}">` +
          paths.map((p) => `<path d="${p.d}"/>`).join('') +
          '</g>',
        );
      } else {
        // Fallback: labelled placeholder
        const motifW = heightMmMotif;
        motifLayers.push(
          `<rect x="${(mx - motifW / 2).toFixed(3)}" y="${(my - heightMmMotif / 2).toFixed(3)}" width="${motifW}" height="${heightMmMotif}" fill="none" stroke="#999" stroke-width="0.5" stroke-dasharray="3,2"/>`,
          `<text x="${mx.toFixed(3)}" y="${my.toFixed(3)}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="5" fill="#999">[${esc(motif.svgPath.split('/').pop() ?? 'motif')}]</text>`,
        );
      }
    }
  }

  // ── Inscriptions ──────────────────────────────────────────────────────────
  // After the Three.js designer runs, HeadstoneInscription converts mm-centre positions to
  // geometry-local absolute coords and writes them back to the store (xPos=absX, yPos=absY,
  // coordinateSpace=undefined).  The one exception: xPos=0 yPos=0 means "stone centre".
  // Rarely, a snapshot may still carry coordinateSpace='mm-center' if the 3D scene hadn't
  // converted the value yet — handle that explicitly.
  const inscriptionLayers: string[] = [];
  for (const ins of ds.inscriptions ?? []) {
    if (!ins.text?.trim()) continue;
    const xPos = ins.xPos ?? 0;
    const yPos = ins.yPos ?? 0;
    const isDefaultCenter = xPos === 0 && yPos === 0;
    // coordinateSpace is not declared on SavedInscription but may be present at runtime
    const coordSpace = (ins as Record<string, unknown>).coordinateSpace as
      'mm-center' | 'absolute' | undefined;
    const [ix, iy] = geoToSvg(xPos, yPos, coordSpace ?? 'absolute', isDefaultCenter);
    const fontSize = ins.sizeMm ?? 20;
    const font = ins.font || 'Times New Roman';
    const color = ins.color || '#000000';
    const rot = -(ins.rotationDeg ?? 0); // Three.js rot → SVG rot (flip sign)
    inscriptionLayers.push(
      `<text x="${ix.toFixed(3)}" y="${iy.toFixed(3)}"` +
      ` font-family="${esc(font)}" font-size="${fontSize}"` +
      ` fill="${color}" text-anchor="middle" dominant-baseline="middle"` +
      (rot !== 0 ? ` transform="rotate(${rot},${ix.toFixed(3)},${iy.toFixed(3)})"` : '') +
      `>${esc(ins.text)}</text>`,
    );
  }

  // ── Compose SVG ───────────────────────────────────────────────────────────
  const svgW = stoneW + PAD * 2;
  const svgH = stoneH + PAD * 2;
  const orderLabel = row.invoiceNumber || id.slice(0, 8).toUpperCase();

  const svg = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`,
    `  width="${svgW}mm" height="${svgH}mm" viewBox="0 0 ${svgW} ${svgH}">`,
    `  <!-- Forever Shining – Order ${orderLabel} | Stone ${stoneW}×${stoneH}mm -->`,
    `  <g transform="translate(${PAD},${PAD})">`,
    `    <!-- Stone outline -->`,
    `    ${shapeLayer}`,
    motifLayers.length ? `    <!-- Motifs -->\n    ${motifLayers.join('\n    ')}` : '',
    inscriptionLayers.length ? `    <!-- Inscriptions -->\n    ${inscriptionLayers.join('\n    ')}` : '',
    `  </g>`,
    `</svg>`,
  ]
    .filter(Boolean)
    .join('\n');

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="order-${orderLabel}.svg"`,
    },
  });
}
