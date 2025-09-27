// components/SvgHeadstone.tsx
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import type { ThreeElements } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { Edges } from '@react-three/drei';
import { Line } from '#/lib/headstone-store';

export type HeadstoneAPI = {
  group: React.RefObject<THREE.Group>;
  mesh: React.RefObject<THREE.Mesh>;
  frontZ: number;
  unitsPerMeter: number;
};

const EPS = 1e-9;

type Props = {
  url: string; // SVG with single outer path
  depth: number; // thickness in SVG units (pre-world)
  scale?: number; // SVG→world (e.g. 0.01 => 100 SVG = 1 m)

  faceTexture: string; // front/back texture
  sideTexture?: string; // side/top texture (defaults to faceTexture)

  autoRepeat?: boolean; // if true or tileSize given → physical tiling
  tileSize?: number; // meters/tile for caps (default 0.10)
  sideTileSize?: number; // meters/tile for sides (default = tileSize)
  topTileSize?: number;

  faceRepeatX?: number; // used when not physically tiling (default 6)
  faceRepeatY?: number; // default 6
  sideRepeatX?: number; // default 8
  sideRepeatY?: number; // default 1 (for depth)

  targetHeight?: number; // world height (meters)
  targetWidth?: number; // world width (meters)

  preserveTop?: boolean; // keep top; adjust bottom only
  bevel?: boolean;
  doubleSided?: boolean;
  showEdges?: boolean;

  meshProps?: ThreeElements['mesh'];
  children?: (
    api: HeadstoneAPI,
    selectedAdditions: string[],
  ) => React.ReactNode;
  inscriptions: Line[];
  selectedAdditions?: string[];
};

/* ---------------- helpers ---------------- */

function shapeBounds(shape: THREE.Shape) {
  const pts = shape.getPoints(256);
  let minX = +Infinity,
    maxX = -Infinity,
    minY = +Infinity,
    maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return {
    minX,
    maxX,
    minY,
    maxY,
    dx: Math.max(EPS, maxX - minX),
    dy: Math.max(EPS, maxY - minY),
  };
}

// Dense outline + cumulative length for perimeter param
function spacedOutline(shape: THREE.Shape, segments = 1024) {
  const pts = shape
    .getSpacedPoints(segments)
    .map((p) => new THREE.Vector2(p.x, p.y));
  const cum = new Array<number>(pts.length).fill(0);
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    L += pts[i].distanceTo(pts[i - 1]);
    cum[i] = L;
  }
  L += pts[0].distanceTo(pts[pts.length - 1]); // close loop
  return { pts, cum, total: L };
}
function nearestS(
  x: number,
  y: number,
  pts: THREE.Vector2[],
  cum: number[],
  total: number,
) {
  let bi = 0,
    bd2 = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const dx = x - pts[i].x,
      dy = y - pts[i].y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bd2) {
      bd2 = d2;
      bi = i;
    }
  }
  return total > 0 ? cum[bi] / total : 0;
}

/** After toNonIndexed, rebuild material groups:
 *  triangles whose 3 vertices sit on z≈±depth/2 → caps (mat 0), else sides (mat 1).
 */
function rebuildGroupsByZ(
  geom: THREE.BufferGeometry,
  zFront: number,
  zBack: number,
  tol: number,
) {
  geom.clearGroups();
  const pos = geom.getAttribute('position') as THREE.BufferAttribute;
  // non-indexed triangles:
  const triCount = Math.floor(pos.count / 3);
  let currentMat = -1;
  let start = 0;
  let count = 0;

  const flush = () => {
    if (count > 0) {
      geom.addGroup(start, count, currentMat);
      start += count;
      count = 0;
    }
  };

  for (let t = 0; t < triCount; t++) {
    const i0 = t * 3,
      i1 = i0 + 1,
      i2 = i0 + 2;
    const z0 = pos.getZ(i0),
      z1 = pos.getZ(i1),
      z2 = pos.getZ(i2);
    const cap =
      (Math.abs(z0 - zFront) <= tol &&
        Math.abs(z1 - zFront) <= tol &&
        Math.abs(z2 - zFront) <= tol) ||
      (Math.abs(z0 - zBack) <= tol &&
        Math.abs(z1 - zBack) <= tol &&
        Math.abs(z2 - zBack) <= tol);
    const mat = cap ? 0 : 1;

    if (currentMat === -1) currentMat = mat;
    if (mat !== currentMat) {
      flush();
      currentMat = mat;
    }
    count += 3;
  }
  flush();
}

/* ---------------- component ---------------- */

const SvgHeadstone = React.forwardRef<THREE.Group, Props>(
  (
    {
      url,
      depth,
      scale = 0.01,
      faceTexture,
      sideTexture,
      autoRepeat = false,
      tileSize = 0.1,
      sideTileSize,
      faceRepeatX = 6,
      faceRepeatY = 6,
      sideRepeatX = 8,
      sideRepeatY = 1,
      targetHeight,
      targetWidth,
      preserveTop = true,
      bevel = false,
      doubleSided = false,
      showEdges = false,
      meshProps,
      children,
      inscriptions,
      selectedAdditions = [],
    },
    ref,
  ) => {
    const svg = useLoader(SVGLoader, url) as any;

    const faceMap = useLoader(THREE.TextureLoader, faceTexture);
    const sideMap = useLoader(THREE.TextureLoader, sideTexture ?? faceTexture);
    for (const t of [faceMap, sideMap]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      (t as any).anisotropy = 8;
      t.generateMipmaps = true;
      t.needsUpdate = true;
    }

    const firstMeshRef = React.useRef<THREE.Mesh>(null!);

    const node = React.useMemo(() => {
      // Shape + outline
      const shapes: THREE.Shape[] = [];
      svg.paths.forEach((p: any) => shapes.push(...SVGLoader.createShapes(p)));
      if (!shapes.length) return null;
      const base = shapes[0];
      const outline = spacedOutline(base, 1024);

      // Bounds and world size
      const { minX, maxX, minY, maxY, dx, dy } = shapeBounds(base);
      const widthW = dx * Math.abs(scale);
      const heightW = dy * Math.abs(scale);

      // Targets
      const wantW = targetWidth ?? widthW;
      const wantH = targetHeight ?? heightW;

      // Uniform scale (width) → serpentine preserved
      const sCore = wantW / Math.max(EPS, widthW);
      const coreH_world = heightW * sCore;

      // Bottom target (top fixed) in SVG space
      const toSV = (w: number) => w / Math.max(EPS, Math.abs(scale) * sCore);
      const targetH_SV = preserveTop ? toSV(wantH) : dy * sCore;
      const bottomTarget_SV = minY + targetH_SV;

      // Build extrudes (without material groups; we'll rebuild groups ourselves)
      let coreGeom = new THREE.ExtrudeGeometry(base, {
        depth,
        steps: 1,
        bevelEnabled: bevel,
        bevelSegments: bevel ? 2 : 0,
        bevelSize: bevel ? 0.8 : 0,
        bevelThickness: bevel ? 0.8 : 0,
      });

      const geoms: THREE.BufferGeometry[] = [coreGeom];

      if (preserveTop && wantH > coreH_world + 1e-9) {
        const s = new THREE.Shape();
        s.moveTo(minX, maxY);
        s.lineTo(maxX, maxY);
        s.lineTo(maxX, bottomTarget_SV);
        s.lineTo(minX, bottomTarget_SV);
        s.closePath();
        const band = new THREE.ExtrudeGeometry(s, {
          depth,
          steps: 1,
          bevelEnabled: bevel,
          bevelSegments: bevel ? 2 : 0,
          bevelSize: bevel ? 0.8 : 0,
          bevelThickness: bevel ? 0.8 : 0,
        });
        geoms.push(band);
      } else if (preserveTop && wantH < coreH_world - 1e-9) {
        const pos = coreGeom.getAttribute('position') as THREE.BufferAttribute;
        const P = pos.array as Float32Array;
        for (let i = 0; i < P.length; i += 3)
          if (P[i + 1] > bottomTarget_SV) P[i + 1] = bottomTarget_SV;
        pos.needsUpdate = true;
        coreGeom.computeVertexNormals();
      }

      // De-index, translate/anchor, compute normals
      for (let i = 0; i < geoms.length; i++) {
        if (geoms[i].index) geoms[i] = geoms[i].toNonIndexed();
        geoms[i].translate(-(minX + maxX) / 2, -bottomTarget_SV, -depth / 2);
        geoms[i].computeVertexNormals();
      }

      // Rebuild groups (caps=0, sides=1) and write UVs for every vertex
      const zFront = -depth / 2;
      const zBack = depth / 2;
      const zTol = Math.max(0.25, Math.abs(depth) * 0.01);

      const x0 = -(maxX - minX) / 2; // after translate
      const x1 = (maxX - minX) / 2;
      const y0 = -(bottomTarget_SV - minY); // after translate
      const y1 = 0;

      const dxU = Math.max(EPS, x1 - x0);
      const dyU = Math.max(EPS, y1 - y0);

      const outlinePts = outline.pts.map(
        (p) =>
          new THREE.Vector2(p.x - (minX + maxX) / 2, p.y - bottomTarget_SV),
      );
      const outlineCum = outline.cum.slice();
      const outlineTotal = outline.total;

      for (const g of geoms) {
        rebuildGroupsByZ(g, zFront, zBack, zTol);

        const pos = g.getAttribute('position') as THREE.BufferAttribute;
        let uv = g.getAttribute('uv') as THREE.BufferAttribute | null;
        if (!uv || uv.count !== pos.count) {
          uv = new THREE.BufferAttribute(new Float32Array(pos.count * 2), 2);
          g.setAttribute('uv', uv);
        }
        const U = uv.array as Float32Array;

        // FIX: The UV generation logic is now done on a per-triangle basis.
        // This correctly distinguishes between cap faces and side faces, which the
        // old per-vertex logic failed to do when `steps: 1`.
        const numTriangles = pos.count / 3;
        for (let i = 0; i < numTriangles; i++) {
          const i0 = i * 3,
            i1 = i0 + 1,
            i2 = i0 + 2;

          const z_v0 = pos.getZ(i0);
          const z_v1 = pos.getZ(i1);
          const z_v2 = pos.getZ(i2);

          // Determine if this triangle belongs to a cap face (all vertices on front or back plane)
          const isCapFace =
            (Math.abs(z_v0 - zFront) <= zTol &&
              Math.abs(z_v1 - zFront) <= zTol &&
              Math.abs(z_v2 - zFront) <= zTol) ||
            (Math.abs(z_v0 - zBack) <= zTol &&
              Math.abs(z_v1 - zBack) <= zTol &&
              Math.abs(z_v2 - zBack) <= zTol);

          if (isCapFace) {
            // Planar UV mapping for front/back caps
            for (const vertIndex of [i0, i1, i2]) {
              const x = pos.getX(vertIndex);
              const y = pos.getY(vertIndex);
              U[2 * vertIndex] = (x - x0) / dxU;
              U[2 * vertIndex + 1] = (y - y0) / dyU;
            }
          } else {
            // Cylindrical unwrap UV mapping for sides/top
            const depthRange = zBack - zFront;
            for (const vertIndex of [i0, i1, i2]) {
              const x = pos.getX(vertIndex);
              const y = pos.getY(vertIndex);
              const z = pos.getZ(vertIndex);

              const s = nearestS(x, y, outlinePts, outlineCum, outlineTotal);
              const t = depthRange > EPS ? (z - zFront) / depthRange : 0.5;

              U[2 * vertIndex] = s; // U: perimeter
              U[2 * vertIndex + 1] = t; // V: depth
            }
          }
        }
        uv.needsUpdate = true;
      }

      // Repeats (physical if requested)
      const worldW = (maxX - minX) * Math.abs(scale) * sCore;
      const worldH = (bottomTarget_SV - minY) * Math.abs(scale) * sCore;
      const worldPerim = outlineTotal * Math.abs(scale) * sCore;
      const worldDepth = Math.abs(depth * scale);

      const usePhysical =
        autoRepeat || tileSize != null || sideTileSize != null;
      const faceTile = tileSize ?? 0.1;
      const sideTile = sideTileSize ?? faceTile;

      const repFaceX = usePhysical
        ? Math.max(1, worldW / faceTile)
        : (faceRepeatX ?? 6);
      const repFaceY = usePhysical
        ? Math.max(1, worldH / faceTile)
        : (faceRepeatY ?? 6);

      // FIX: Side repeat Y now corresponds to depth, not height.
      const repSideX = usePhysical
        ? Math.max(1, worldPerim / sideTile)
        : (sideRepeatX ?? 8);
      const repSideY = usePhysical
        ? Math.max(1, worldDepth / sideTile)
        : (sideRepeatY ?? 1);

      faceMap.repeat.set(repFaceX, repFaceY);
      sideMap.repeat.set(repSideX, repSideY);
      faceMap.needsUpdate = true;
      sideMap.needsUpdate = true;

      // Materials (caps index 0, sides index 1)
      const capMat = new THREE.MeshStandardMaterial({
        map: faceMap,
        roughness: 0.92,
        metalness: 0.03,
        color: 0xffffff,
        side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
      });
      const sideMat = new THREE.MeshStandardMaterial({
        map: sideMap,
        roughness: 0.95,
        metalness: 0.02,
        color: 0xffffff,
        side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
      });

      const meshes = geoms.map((geom, i) => (
        <mesh
          key={`hs-${i}`}
          ref={i === 0 ? firstMeshRef : undefined}
          geometry={geom}
          material={[capMat, sideMat]}
          castShadow
          receiveShadow
          {...meshProps}
        >
          {showEdges ? <Edges scale={1.002} /> : null}
        </mesh>
      ));

      return (
        <group ref={ref} scale={[scale * sCore, -scale * sCore, scale]}>
          {meshes}
          {typeof children === 'function' &&
            children(
              {
                group: ref as React.RefObject<THREE.Group>,
                mesh: firstMeshRef,
                frontZ: depth / 2,
                unitsPerMeter: 1 / Math.max(EPS, scale * sCore),
              },
              selectedAdditions,
            )}
        </group>
      );
    }, [
      svg,
      depth,
      scale,
      faceMap,
      sideMap,
      autoRepeat,
      tileSize,
      sideTileSize,
      faceRepeatX,
      faceRepeatY,
      sideRepeatX,
      sideRepeatY,
      targetHeight,
      targetWidth,
      preserveTop,
      bevel,
      doubleSided,
      showEdges,
      meshProps,
      children,
      inscriptions,
      selectedAdditions,
    ]);

    return node;
  },
);

SvgHeadstone.displayName = 'SvgHeadstone';

export default SvgHeadstone;
