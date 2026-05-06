'use client';
import * as React from 'react';
import * as THREE from 'three';
import type { HeadstoneAPI } from '#/components/SvgHeadstone';

// Stainless steel border width in millimetres
const BORDER_MM = 20;

type Props = {
  api: HeadstoneAPI;
  textureUrl: string | null;
};

/**
 * Inset a polygon by `dist` using per-vertex miter-bisector normals.
 *
 * Each vertex moves inward along the bisector of its two adjacent edge normals,
 * scaled so the perpendicular distance to each edge equals `dist`.
 * The miter is capped at 4× dist to avoid explosion at very sharp corners.
 *
 * Winding direction is auto-detected from signed area so the function works
 * whether the outline is CW or CCW in Three.js Y-up space.
 */
/**
 * Inset a polygon by `dist` with three modes per vertex:
 *
 * 1. Straight (sl ≈ 0):      push along incoming edge normal n1.
 * 2. Concave (cosH ≤ 0):     bisector points outward — use n1 instead to
 *                             avoid self-intersection at reflex vertices
 *                             (e.g. the top cleft of the heart).
 * 3. Sharp convex (miter > 2×dist, i.e. cosH < 0.5): bevel — emit TWO
 *                             points (one per edge normal) instead of a
 *                             single long miter spike
 *                             (e.g. bottom V-tip and lobe tips).
 * 4. Normal convex:           standard miter.
 */
function insetPolygon(pts: THREE.Vector2[], dist: number): THREE.Vector2[] {
  const n = pts.length;
  if (n < 3) return pts;

  // Signed area: positive → CCW (Y-up); negative → CW
  let area2 = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    area2 += a.x * b.y - b.x * a.y;
  }
  // CCW: inward normal = (-ey, ex); CW: inward normal = (ey, -ex)
  const s = area2 >= 0 ? 1 : -1;

  // Centroid — used as guaranteed-interior fallback direction when two adjacent
  // edge normals are nearly anti-parallel (sl ≈ 0). This happens at hairpin
  // vertices created by downsampling smooth curves (e.g. the lobe peak of the
  // heart when many intermediate SVG points are skipped).  Pushing toward the
  // centroid is always inward, preventing the vertex from being ejected outside
  // the outer shape.
  let cx = 0, cy = 0;
  for (const p of pts) { cx += p.x; cy += p.y; }
  cx /= n; cy /= n;

  const out: THREE.Vector2[] = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];

    const ax = curr.x - prev.x, ay = curr.y - prev.y;
    const la = Math.sqrt(ax * ax + ay * ay);
    const eax = la > 1e-9 ? ax / la : 1, eay = la > 1e-9 ? ay / la : 0;

    const bx = next.x - curr.x, by = next.y - curr.y;
    const lb = Math.sqrt(bx * bx + by * by);
    const ebx = lb > 1e-9 ? bx / lb : 1, eby = lb > 1e-9 ? by / lb : 0;

    const n1x = -s * eay, n1y = s * eax;
    const n2x = -s * eby, n2y = s * ebx;

    const sx = n1x + n2x, sy = n1y + n2y;
    const sl = Math.sqrt(sx * sx + sy * sy);

    if (sl < 0.1) {
      // n1 ≈ −n2: adjacent edges are nearly anti-parallel (hairpin vertex from
      // downsampling a tight curve). Push toward the polygon centroid — always
      // inward — rather than along n1 which may point outward at these vertices.
      const tcx = cx - curr.x, tcy = cy - curr.y;
      const tc = Math.sqrt(tcx * tcx + tcy * tcy);
      if (tc > 1e-9) {
        out.push(new THREE.Vector2(curr.x + tcx / tc * dist, curr.y + tcy / tc * dist));
      } else {
        out.push(new THREE.Vector2(curr.x + n1x * dist, curr.y + n1y * dist));
      }
      continue;
    }

    const nx = sx / sl, ny = sy / sl;
    const cosH = nx * n1x + ny * n1y;

    if (cosH <= 0) {
      // Concave (reflex) vertex — bisector points outward.
      // Fall back to n1 offset to prevent self-intersection void.
      out.push(new THREE.Vector2(curr.x + n1x * dist, curr.y + n1y * dist));
    } else if (cosH < 0.5) {
      // Sharp convex corner (miter would exceed 2× dist) → bevel.
      // Emit two points, one per adjacent edge normal.
      out.push(new THREE.Vector2(curr.x + n1x * dist, curr.y + n1y * dist));
      out.push(new THREE.Vector2(curr.x + n2x * dist, curr.y + n2y * dist));
    } else {
      // Normal miter
      const miter = dist / cosH;
      out.push(new THREE.Vector2(curr.x + nx * miter, curr.y + ny * miter));
    }
  }
  return out;
}

/**
 * Return the intersection point of open segments (p1,p2) and (p3,p4),
 * or null if they are parallel or do not cross within both segments.
 */
function segIntersect(
  p1: THREE.Vector2, p2: THREE.Vector2,
  p3: THREE.Vector2, p4: THREE.Vector2,
): THREE.Vector2 | null {
  const d1x = p2.x - p1.x, d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x, d2y = p4.y - p3.y;
  const denom = d1x * d2y - d1y * d2x;
  if (Math.abs(denom) < 1e-12) return null;
  const dx = p3.x - p1.x, dy = p3.y - p1.y;
  const t = (dx * d2y - dy * d2x) / denom;
  const u = (dx * d1y - dy * d1x) / denom;
  const eps = 1e-6;
  if (t > eps && t < 1 - eps && u > eps && u < 1 - eps) {
    return new THREE.Vector2(p1.x + t * d1x, p1.y + t * d1y);
  }
  return null;
}

/** Return twice the absolute area of a polygon (avoids a divide by 2). */
function polygonArea2(p: THREE.Vector2[]): number {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const ai = p[i], bi = p[(i + 1) % p.length];
    a += ai.x * bi.y - bi.x * ai.y;
  }
  return Math.abs(a);
}

/**
 * Remove self-intersecting loops from a polygon.
 *
 * When two non-adjacent edges cross (e.g. the edges approaching the heart's
 * top cleft from each lobe), earcut triangulates them incorrectly and produces
 * spurious triangles all over the mesh.
 *
 * At each iteration we collect ALL crossings and pick the one whose intersection
 * point is closest to X=0 (the shape's axis of symmetry), so the cleft joint
 * collapses symmetrically at the center rather than drifting to one side.
 * We then keep whichever of the two sub-polygons (outer or inner loop) has the
 * larger area.  This ensures:
 *   - Heart/oval: the main lobe body (outer, large) is kept over the tiny
 *     cleft artifact (inner, small).  Same behaviour as before.
 *   - Triangle: the inset-edge paths for the left and right sides cross each
 *     other just below the apex, splitting the polygon into the small "shoulder"
 *     wedge above the crossing (outer, tiny) and the correct triangle body
 *     below it (inner, large).  Keeping the larger portion fixes the invisible
 *     inlay without touching the inset algorithm itself.
 */
function removeLoops(pts: THREE.Vector2[]): THREE.Vector2[] {
  let cur = pts.slice();
  for (let iter = 0; iter < 20; iter++) {
    const n = cur.length;

    let bestI = -1, bestJ = -1;
    let bestIx: THREE.Vector2 | null = null;
    let bestDist = Infinity;

    for (let i = 0; i < n; i++) {
      const i1 = (i + 1) % n;
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue; // skip adjacent wrap-around pair
        const j1 = (j + 1) % n;
        const ix = segIntersect(cur[i], cur[i1], cur[j], cur[j1]);
        if (ix) {
          // Prefer crossings closest to X=0 so the cleft joint lands on the
          // symmetry axis of the heart rather than drifting to one side.
          const d = Math.abs(ix.x);
          if (d < bestDist) {
            bestDist = d;
            bestI = i;
            bestJ = j;
            bestIx = ix;
          }
        }
      }
    }

    if (bestI < 0 || !bestIx) break;

    // Split at the crossing into outer and inner sub-polygons, keep the larger.
    const outer = [...cur.slice(0, bestI + 1), bestIx, ...cur.slice(bestJ + 1)];
    const inner = [...cur.slice(bestI + 1, bestJ + 1), bestIx];
    cur = polygonArea2(outer) >= polygonArea2(inner) ? outer : inner;
  }
  return cur;
}

/**
 * Renders a vitreous enamel inlay panel inset from the urn face.
 *
 * Architecture:
 * - Polygon inset: each outline vertex moves inward by BORDER_MM along its
 *   per-vertex normal bisector → uniform visual border on all sides including
 *   the heart notch.
 * - ShapeGeometry UV normalised to [0,1] (Three.js sets raw coords by default).
 * - MeshBasicMaterial (unlit) with background texture fills the shape.
 * - THREE.TextureLoader (not drei) to support blob: / data: URLs.
 *
 * Rendered inside SvgHeadstone children callback (pre-meshScale space).
 * outlinePoints are centred at X=0; Y goes from 0 (bottom) to outH (top).
 * cy = outH/2 centres the inlay mesh on the urn face.
 * z = 0.5 places it just in front of the urn surface.
 */
export default function UrnEnamelInlay({ api, textureUrl }: Props) {
  const [tex, setTex] = React.useState<THREE.Texture | null>(null);

  const geomData = React.useMemo(() => {
    const pts = api.outlinePoints;
    if (!pts || pts.length < 3) return null;

    let minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const outH = maxY - minY;
    const cy = outH / 2; // centre of urn face in children-group Y

    const borderPU = BORDER_MM * api.unitsPerMeter / 1000; // mm → pre-meshScale units

    // Strip trailing seam-duplicate(s) before downsampling.
    //
    // getSpacedPoints(N) returns N+1 points where pts[0] === pts[N] (the seam).
    // SVGLoader also sets autoClose = true on every closed path (those ending with Z),
    // causing getSpacedPoints to push pts[0] again → N+2 total.
    //
    // For linear-closed shapes (rectangle, triangle) the closing LineCurve evaluates
    // its endpoint exactly via floating-point arithmetic, so pts[N] === pts[0] with
    // zero distance. For bezier-closed shapes (oval, heart) floating-point
    // rounding gives ~1e-8 distance. We strip any trailing point within 0.1 SVG
    // units of pts[0]; the nearest real perimeter neighbour is always ≥ 4 units away.
    let unique = pts.length;
    while (unique > 3) {
      const dx = pts[unique - 1].x - pts[0].x, dy = pts[unique - 1].y - pts[0].y;
      if (dx * dx + dy * dy > 0.01) break; // > 0.1 SVG units → not a seam duplicate
      unique--;
    }
    const step = Math.max(1, Math.floor(unique / 256));
    const sampled: THREE.Vector2[] = [];
    for (let i = 0; i < unique; i += step) {
      sampled.push(new THREE.Vector2(
        pts[i].x,
        pts[i].y - minY - cy, // centre Y at 0
      ));
    }

    // Per-vertex normal inset → equal visual border on every side of the shape.
    // Then remove any self-intersecting loops (e.g. the heart's top cleft
    // causes the two approaching offset edges to cross, which makes earcut
    // emit spurious triangles across the whole mesh).
    const inset = removeLoops(insetPolygon(sampled, borderPU));

    const shape = new THREE.Shape(inset);
    const geom = new THREE.ShapeGeometry(shape);

    // THREE.ShapeGeometry sets UV = raw vertex XY coords (not normalised to [0,1]).
    // Normalise so the texture fills the entire inlay bounding box.
    geom.computeBoundingBox();
    const bb = geom.boundingBox!;
    const bbW = bb.max.x - bb.min.x;
    const bbH = bb.max.y - bb.min.y;
    const uvAttr = geom.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uvAttr.count; i++) {
      uvAttr.setXY(
        i,
        (uvAttr.getX(i) - bb.min.x) / bbW,
        (uvAttr.getY(i) - bb.min.y) / bbH,
      );
    }
    uvAttr.needsUpdate = true;

    return { geom, cy, bbW, bbH };
  }, [api.outlinePoints, api.unitsPerMeter]);

  // Load background texture with TextureLoader (not canvas).
  // After loading, apply "cover" repeat/offset so the texture fills the inlay
  // without stretching — maintains the image's natural aspect ratio.
  React.useEffect(() => {
    if (!textureUrl || !geomData) {
      setTex(null);
      return;
    }

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(
      textureUrl,
      (loaded) => {
        if (cancelled) { loaded.dispose(); return; }
        loaded.colorSpace = THREE.SRGBColorSpace;

        // Aspect-ratio correction: CSS "cover" semantics.
        // UV is normalised to the inlay bounding box (bbW × bbH).
        // Without correction the texture is stretched to fill whatever
        // aspect ratio the inlay has.  We scale the repeat axis that
        // would be over-stretched so both axes stay proportional.
        const imgW: number = loaded.image.width;
        const imgH: number = loaded.image.height;
        if (imgW > 0 && imgH > 0) {
          const texAspect = imgW / imgH;
          const inlayAspect = geomData.bbW / geomData.bbH;
          if (texAspect > inlayAspect) {
            // Texture is wider than the inlay — crop sides, fill height.
            const rx = inlayAspect / texAspect;
            loaded.repeat.set(rx, 1);
            loaded.offset.set((1 - rx) / 2, 0);
          } else {
            // Texture is taller than the inlay — crop top/bottom, fill width.
            const ry = texAspect / inlayAspect;
            loaded.repeat.set(1, ry);
            loaded.offset.set(0, (1 - ry) / 2);
          }
        }

        setTex(prev => { prev?.dispose(); return loaded; });
      },
      undefined,
      () => { if (!cancelled) setTex(null); },
    );

    return () => { cancelled = true; };
  }, [textureUrl, geomData]);

  const material = React.useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.88, 0.88, 0.88),
        toneMapped: false,
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    [],
  );

  React.useEffect(() => {
    material.map = tex ?? null;
    material.needsUpdate = true;
  }, [tex, material]);

  React.useEffect(() => {
    return () => {
      geomData?.geom.dispose();
      material.dispose();
      tex?.dispose();
    };
  }, [geomData, material, tex]);

  if (!geomData || !tex) return null;

  return (
    <mesh
      geometry={geomData.geom}
      material={material}
      position={[0, geomData.cy, api.frontZ]}
      renderOrder={5}
    />
  );
}

