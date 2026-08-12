'use client';
import * as React from 'react';
import * as THREE from 'three';
import type { HeadstoneAPI } from '#/components/SvgHeadstone';

// Stainless steel border width in millimetres
const BORDER_MM = 20;

type Props = {
  api: HeadstoneAPI;
  textureUrl: string | null;
  shapeUrl: string | null;
};

/**
 * Offset a sampled contour by a fixed perpendicular distance.
 * Sharp joins are deliberately bevelled/rounded. An unlimited miter at the
 * heart cleft or the lower tip creates a long spike and an earcut sliver.
 */
function parallelOffsetPolygon(pts: THREE.Vector2[], dist: number): THREE.Vector2[] {
  const n = pts.length;
  if (n < 3) return pts;

  let area2 = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    area2 += a.x * b.y - b.x * a.y;
  }
  const winding = area2 >= 0 ? 1 : -1;
  const out: THREE.Vector2[] = [];

  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    const ax = curr.x - prev.x, ay = curr.y - prev.y;
    const bx = next.x - curr.x, by = next.y - curr.y;
    const al = Math.hypot(ax, ay), bl = Math.hypot(bx, by);
    if (al < 1e-8 || bl < 1e-8) { out.push(curr.clone()); continue; }

    const eax = ax / al, eay = ay / al;
    const ebx = bx / bl, eby = by / bl;
    const n1 = new THREE.Vector2(-winding * eay, winding * eax);
    const n2 = new THREE.Vector2(-winding * eby, winding * ebx);
    const p1 = curr.clone().addScaledVector(n1, dist);
    const p2 = curr.clone().addScaledVector(n2, dist);
    const cross = eax * eby - eay * ebx;
    if (Math.abs(cross) < 1e-8) {
      const fallback = n1.clone().add(n2);
      if (fallback.lengthSq() > 1e-12) fallback.normalize().multiplyScalar(dist);
      else fallback.copy(n1).multiplyScalar(dist);
      out.push(curr.clone().add(fallback));
      continue;
    }

    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const t = (dx * eby - dy * ebx) / cross;
    out.push(new THREE.Vector2(p1.x + eax * t, p1.y + eay * t));
  }
  return out;
}

/** Remove the legacy SVG's tiny three-point flat at the bottom cusp. */
function collapseHeartBottomCusp(points: THREE.Vector2[]): THREE.Vector2[] {
  if (points.length < 3) return points;
  let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
  for (const p of points) {
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
  }
  const cx = (minX + maxX) / 2;
  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const candidates = points.map((p, i) => i).filter((i) =>
    Math.abs(points[i].x - cx) < spanX * 0.035 &&
    points[i].y < minY + spanY * 0.035,
  );
  if (candidates.length < 2) return points;
  const first = Math.min(...candidates);
  const last = Math.max(...candidates);
  const tip = new THREE.Vector2(
    candidates.reduce((sum, i) => sum + points[i].x, 0) / candidates.length,
    Math.min(...candidates.map((i) => points[i].y)),
  );
  return [...points.slice(0, first), tip, ...points.slice(last + 1)];
}

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
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) { cx += p.x; cy += p.y; }
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  cx /= n; cy /= n;
  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);

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

    const isCentralHeartCleft =
      cosH <= 0 &&
      Math.abs(curr.x - cx) < spanX * 0.12 &&
      curr.y > minY + spanY * 0.65;

    if (isCentralHeartCleft) {
      // The heart's cleft is a reflex corner. Offsetting it with one edge
      // normal creates the visible deep triangular wedge in the inlay. Join
      // the two offset edges with a short, shallow quadratic arc instead.
      const p1 = new THREE.Vector2(curr.x + n1x * dist, curr.y + n1y * dist);
      const p2 = new THREE.Vector2(curr.x + n2x * dist, curr.y + n2y * dist);
      const control = new THREE.Vector2(curr.x, curr.y + dist * 0.25);
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        const a = p1.clone().lerp(control, t);
        const b = control.clone().lerp(p2, t);
        out.push(a.lerp(b, t));
      }
    } else if (cosH <= 0) {
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
export default function UrnEnamelInlay({ api, textureUrl, shapeUrl }: Props) {
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
    // The heart SVG contains a genuine cusp at the cleft. Use intersections
    // of parallel offset edges there so the border remains constant-width.
    const inset = shapeUrl?.toLowerCase().endsWith('/heart.svg')
      ? parallelOffsetPolygon(collapseHeartBottomCusp(sampled), borderPU)
      : removeLoops(insetPolygon(sampled, borderPU));

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
  }, [api.outlinePoints, api.unitsPerMeter, shapeUrl]);

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

