"use client";

import * as React from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { Edges } from "@react-three/drei";

type HeadstoneAPI = {
  group: React.RefObject<THREE.Group>;
  mesh: React.RefObject<THREE.Mesh>; // first mesh
  frontZ: number;
  unitsPerMeter: number;
};

const EPS = 1e-9;

type Props = {
  url: string;
  depth: number;
  scale?: number;

  faceTexture: string;
  sideTexture?: string;

  autoRepeat?: boolean;
  tileSize?: number;      // meters/tile on caps (default 0.10)
  sideTileSize?: number;  // meters/tile on sides (default = tileSize)

  faceRepeatX?: number;   // used when not using physical tiling
  faceRepeatY?: number;
  sideRepeatX?: number;
  sideRepeatY?: number;

  targetHeight?: number;
  targetWidth?: number;

  preserveTop?: boolean;
  bevel?: boolean;
  doubleSided?: boolean;
  showEdges?: boolean;

  meshProps?: JSX.IntrinsicElements["mesh"];
  children?: (api: HeadstoneAPI) => React.ReactNode;
};

/* ---------------- helpers ---------------- */

function shapeBounds(shape: THREE.Shape) {
  const pts = shape.getPoints(256);
  let minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY, dx: Math.max(EPS, maxX - minX), dy: Math.max(EPS, maxY - minY) };
}

// Dense outline + cumulative length (for perimeter 's' on sides)
function spacedOutline(shape: THREE.Shape, segments = 1024) {
  const pts = shape.getSpacedPoints(segments).map(p => new THREE.Vector2(p.x, p.y));
  const cum = new Array<number>(pts.length).fill(0);
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    L += pts[i].distanceTo(pts[i - 1]);
    cum[i] = L;
  }
  L += pts[0].distanceTo(pts[pts.length - 1]); // close loop
  return { pts, cum, total: L };
}

function nearestS(x: number, y: number, pts: THREE.Vector2[], cum: number[], total: number) {
  let bi = 0, bd2 = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const dx = x - pts[i].x, dy = y - pts[i].y;
    const d2 = dx*dx + dy*dy;
    if (d2 < bd2) { bd2 = d2; bi = i; }
  }
  return total > 0 ? cum[bi] / total : 0;
}

/* ---------------- component ---------------- */

export default function SvgHeadstone({
  url,
  depth,
  scale = 0.01,
  faceTexture,
  sideTexture,
  autoRepeat = false,
  tileSize = 0.10,
  sideTileSize,
  faceRepeatX = 6,
  faceRepeatY = 6,
  sideRepeatX = 8,
  sideRepeatY = 6,
  targetHeight,
  targetWidth,
  preserveTop = true,
  bevel = false,
  doubleSided = false,
  showEdges = false,
  meshProps,
  children,
}: Props) {
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

  const groupRef = React.useRef<THREE.Group>(null!);
  const firstMeshRef = React.useRef<THREE.Mesh>(null!);

  const node = React.useMemo(() => {
    // Base shape & dense outline
    const shapes: THREE.Shape[] = [];
    svg.paths.forEach((p: any) => shapes.push(...SVGLoader.createShapes(p)));
    if (!shapes.length) return null;
    const base = shapes[0];
    const outline = spacedOutline(base, 1024);

    // Bounds & raw world size
    const { minX, maxX, minY, maxY, dx, dy } = shapeBounds(base);
    const widthW  = dx * Math.abs(scale);
    const heightW = dy * Math.abs(scale);

    // Targets (world)
    const wantW = targetWidth  ?? widthW;
    const wantH = targetHeight ?? heightW;

    // Uniform scale by WIDTH → serpentine preserved
    const sCore = wantW / Math.max(EPS, widthW);
    const coreH_world = heightW * sCore;

    // Bottom target in SVG space (top fixed)
    const toSV = (w: number) => w / Math.max(EPS, Math.abs(scale) * sCore);
    const targetH_SV = preserveTop ? toSV(wantH) : dy * sCore;
    const bottomTarget_SV = minY + targetH_SV;

    // Build core extrude
    let coreGeom = new THREE.ExtrudeGeometry(base, {
      depth,
      steps: 1,
      bevelEnabled: bevel,
      bevelSegments: bevel ? 2 : 0,
      bevelSize: bevel ? 0.8 : 0,
      bevelThickness: bevel ? 0.8 : 0,
    });

    const geoms: THREE.BufferGeometry[] = [coreGeom];

    // Extend/crop bottom
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
      const pos = coreGeom.getAttribute("position") as THREE.BufferAttribute;
      const P = pos.array as Float32Array;
      for (let i = 0; i < P.length; i += 3) if (P[i + 1] > bottomTarget_SV) P[i + 1] = bottomTarget_SV;
      pos.needsUpdate = true;
      coreGeom.computeVertexNormals();
    }

    // De-index so caps & sides can have independent UVs
    for (let i = 0; i < geoms.length; i++) {
      if (geoms[i].index) geoms[i] = geoms[i].toNonIndexed();
    }

    // Anchor (pre-group): bottom at y=0; center X; center Z
    const tx = - (minX + maxX) / 2;
    const ty = - bottomTarget_SV;
    const tz = - depth / 2;
    for (const g of geoms) {
      g.translate(tx, ty, tz);
      g.computeVertexNormals();
    }

    // Outline in same local space
    const outlinePts = outline.pts.map(p => new THREE.Vector2(p.x + tx, p.y + ty));
    const outlineCum = outline.cum.slice();
    const outlineTotal = outline.total;

    // UVs: classify by Z (caps = z≈±depth/2; sides = everything else)
    const zFront = -depth / 2;
    const zBack  =  depth / 2;
    const zTol   = Math.max(0.25, Math.abs(depth) * 0.01);

    const x0 = minX + tx, x1 = maxX + tx;
    const y0 = minY + ty, y1 = bottomTarget_SV + ty;
    const dxU = Math.max(EPS, x1 - x0);
    const dyU = Math.max(EPS, y1 - y0);

    for (const geom of geoms) {
      const pos = geom.getAttribute("position") as THREE.BufferAttribute;
      let uv = geom.getAttribute("uv") as THREE.BufferAttribute | null;
      if (!uv || uv.count !== pos.count) {
        uv = new THREE.BufferAttribute(new Float32Array(pos.count * 2), 2);
        geom.setAttribute("uv", uv);
      }
      const U = uv.array as Float32Array;

      const H = Math.max(EPS, y1 - y0);

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        if (Math.abs(z - zFront) <= zTol || Math.abs(z - zBack) <= zTol) {
          // CAP → planar 0..1
          U[2 * i]     = (x - x0) / dxU;
          U[2 * i + 1] = (y - y0) / dyU;
        } else {
          // SIDE/TOP → (perimeter s × height)
          const s = nearestS(x, y, outlinePts, outlineCum, outlineTotal); // 0..1
          U[2 * i]     = s;
          U[2 * i + 1] = (y - y0) / H;
        }
      }

      uv.needsUpdate = true;
    }

    // Repeats (physical if requested)
    const worldW        = (maxX - minX) * Math.abs(scale) * sCore;
    const worldH        = (bottomTarget_SV - minY) * Math.abs(scale) * sCore;
    const worldPerim    = outlineTotal * Math.abs(scale) * sCore;

    const usePhysical   = autoRepeat || tileSize != null || sideTileSize != null;
    const faceTile      = tileSize ?? 0.10;
    const sideTile      = sideTileSize ?? faceTile;

    const repFaceX      = usePhysical ? Math.max(1, worldW / faceTile)    : faceRepeatX;
    const repFaceY      = usePhysical ? Math.max(1, worldH / faceTile)    : faceRepeatY;
    const repSideX      = usePhysical ? Math.max(1, worldPerim / sideTile): sideRepeatX ?? 8;
    const repSideY      = usePhysical ? Math.max(1, worldH / sideTile)    : sideRepeatY ?? 6;

    faceMap.repeat.set(repFaceX, repFaceY);
    sideMap.repeat.set(repSideX, repSideY);
    faceMap.needsUpdate = true;
    sideMap.needsUpdate = true;

    // Materials: caps use face texture, sides/top use side texture
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

    // Two-material trick without relying on groups:
    // build two meshes sharing the same geometry but different materials;
    // each mesh uses a different shader to discard the other set of faces
    // …or simpler: render each geometry twice with different materials and
    // rely on our per-vertex UV classification (caps vs sides) to drive textures.
    // Since both materials map everywhere, the visual result is correct.

    const meshes = geoms.map((g, i) => (
      <mesh
        key={`hs-${i}`}
        ref={i === 0 ? firstMeshRef : undefined}
        geometry={g}
        // IMPORTANT: provide both materials so caps and sides both render textured
        material={[capMat, sideMat]}
        castShadow
        receiveShadow
        {...meshProps}
      >
        {showEdges ? <Edges scale={1.002} /> : null}
      </mesh>
    ));

    return (
      <group ref={groupRef} scale={[scale * sCore, -scale * sCore, scale]}>
        {meshes}
        {typeof children === "function" &&
          children({
            group: groupRef,
            mesh: firstMeshRef,
            frontZ: depth / 2,
            unitsPerMeter: 1 / Math.max(EPS, scale * sCore),
          })}
      </group>
    );
  }, [
    svg, depth, scale,
    faceMap, sideMap,
    autoRepeat, tileSize, sideTileSize,
    faceRepeatX, faceRepeatY, sideRepeatX, sideRepeatY,
    targetHeight, targetWidth,
    preserveTop, bevel, doubleSided,
    showEdges, meshProps, children,
  ]);

  return node;
}
