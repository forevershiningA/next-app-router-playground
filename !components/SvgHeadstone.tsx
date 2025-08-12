"use client";

import * as React from "react";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Edges } from "@react-three/drei";

const EPS = 1e-9;

export type HeadstoneAPI = {
  group: React.RefObject<THREE.Group>;
  mesh: React.RefObject<THREE.Mesh>;
  frontZ: number;          // local z of the front face (pre group scale)
  unitsPerMeter: number;   // = 1 / scale
};

type Props = {
  url: string;
  depth: number;                // SVG units
  scale?: number;               // SVG -> world (0.01 => 100 SVG = 1 m)
  faceTexture: string;
  sideTexture?: string;

  tileSize?: number;            // caps (world meters per tile)
  sideTileSize?: number;        // vertical sides
  topTileSize?: number;         // top / bevel

  targetHeight?: number;        // world meters
  preserveTop?: boolean;        // add height at bottom, keep serpentine top
  bevel?: boolean;              // bevel both parts or none
  doubleSided?: boolean;
  meshProps?: JSX.IntrinsicElements["mesh"]; // events from parent (click/dblclick)
  showEdges?: boolean;                        // outline toggle
  children?: (api: HeadstoneAPI) => React.ReactNode;
};

export default function SvgHeadstone({
  url,
  depth,
  scale = 0.01,
  faceTexture,
  sideTexture,
  tileSize = 0.10,
  sideTileSize,
  topTileSize,
  targetHeight,
  preserveTop = true,
  bevel = false,
  doubleSided = false,
  meshProps,
  showEdges = false,
  children
}: Props) {
  const svg = useLoader(SVGLoader, url);
  const faceMap = useLoader(THREE.TextureLoader, faceTexture);
  const sideMap = useLoader(THREE.TextureLoader, sideTexture ?? faceTexture);

  useEffect(() => {
    [faceMap, sideMap].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8;
      t.needsUpdate = true;
    });
  }, [faceMap, sideMap]);

  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  const node = useMemo(() => {
    // ----- Build shape & bounds (SVG units)
    const shapes: THREE.Shape[] = [];
    svg.paths.forEach((p) => shapes.push(...SVGLoader.createShapes(p)));
    const shape = shapes[0];

    const pts = shape.getPoints(256);
    let minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    // ----- World sizes
    const widthW  = (maxX - minX) * Math.abs(scale);
    const heightW = (maxY - minY) * Math.abs(scale);
    const wantH   = targetHeight ?? heightW;
    const extraH  = preserveTop ? Math.max(0, wantH - heightW) : 0;         // world
    const extraSV = extraH / Math.max(1e-9, Math.abs(scale));               // SVG

    const sideSz = sideTileSize ?? tileSize;
    const topSz  = topTileSize  ?? sideSz;

    // ----- UV generator
    const UVGenerator = {
      // caps (front/back): planar XY; extend Y domain if we add a bottom skirt
      generateTopUV: (_: any, v: number[], a: number, b: number, c: number) => {
        const normXY = (i: number) => ([
          (v[i * 3] - minX) / (maxX - minX),
          (v[i * 3 + 1] - minY) / ((maxY + (preserveTop ? extraSV : 0)) - minY),
        ] as const);
        const [ax, ay] = normXY(a), [bx, by] = normXY(b), [cx, cy] = normXY(c);
        const rx = Math.max(1, widthW / tileSize);
        const ry = Math.max(1, wantH / tileSize);
        return [
          new THREE.Vector2(ax * rx, ay * ry),
          new THREE.Vector2(bx * rx, by * ry),
          new THREE.Vector2(cx * rx, cy * ry),
        ];
      },
      // sides: normal-aware box projection (top/bevel → XZ; vertical → ZY/XY)
      generateSideWallUV: (_: any, v: number[], a: number, b: number, c: number, d: number) => {
        const P = [a, b, c, d].map(i => new THREE.Vector3(v[i*3], v[i*3+1], v[i*3+2]));
        const n = new THREE.Vector3().subVectors(P[1], P[0]).cross(new THREE.Vector3().subVectors(P[3], P[0])).normalize();
        const abs = { x: Math.abs(n.x), y: Math.abs(n.y), z: Math.abs(n.z) };
        const min = P.reduce((m,p)=>m.min(p.clone()), new THREE.Vector3(+Infinity,+Infinity,+Infinity));
        const max = P.reduce((m,p)=>m.max(p.clone()), new THREE.Vector3(-Infinity,-Infinity,-Infinity));
        const size = new THREE.Vector3().subVectors(max, min).multiplyScalar(Math.abs(scale));

        let ax1: "x"|"y"|"z", ax2: "x"|"y"|"z", t1: number, t2: number;
        if (abs.y >= abs.x && abs.y >= abs.z) { ax1 = "x"; ax2 = "z"; t1 = t2 = topSz; }   // top/bevel
        else if (abs.x >= abs.z)              { ax1 = "z"; ax2 = "y"; t1 = t2 = sideSz; } // ±X sides
        else                                  { ax1 = "x"; ax2 = "y"; t1 = t2 = sideSz; } // ±Z sides

        const rep1 = Math.max(1, (size as any)[ax1] / t1);
        const rep2 = Math.max(1, (size as any)[ax2] / t2);
        const norm = (val:number, mn:number, mx:number)=> (mx-mn<1e-6 ? 0 : (val - mn) / (mx - mn));
        const n1 = (p:THREE.Vector3,k:"x"|"y"|"z") => norm((p as any)[k], (min as any)[k], (max as any)[k]);

        return [
          new THREE.Vector2(n1(P[0], ax1) * rep1, n1(P[0], ax2) * rep2),
          new THREE.Vector2(n1(P[1], ax1) * rep1, n1(P[1], ax2) * rep2),
          new THREE.Vector2(n1(P[2], ax1) * rep1, n1(P[2], ax2) * rep2),
          new THREE.Vector2(n1(P[3], ax1) * rep1, n1(P[3], ax2) * rep2),
        ];
      },
    };

    const extrudeOpts = (withBevel: boolean) => ({
      depth,
      steps: 1,
      bevelEnabled: withBevel,
      bevelSegments: withBevel ? 2 : 0,
      bevelSize: withBevel ? 0.8 : 0,
      bevelThickness: withBevel ? 0.8 : 0,
      material: 0,
      extrudeMaterial: 1,
      UVGenerator,
    });

    // ----- Main body
    const mainGeom = new THREE.ExtrudeGeometry(shape, extrudeOpts(bevel));

    // ----- Optional bottom skirt (at SVG bottom = maxY). After Y-flip it becomes world base.
    let skirtGeom: THREE.ExtrudeGeometry | null = null;
    if (preserveTop && extraSV > 0) {
      const y0 = maxY;
      const y1 = maxY + extraSV;
      const r = new THREE.Shape();
      r.moveTo(minX, y0); r.lineTo(maxX, y0); r.lineTo(maxX, y1); r.lineTo(minX, y1); r.closePath();
      skirtGeom = new THREE.ExtrudeGeometry(r, extrudeOpts(bevel));
      skirtGeom.translate(0, -1e-4, 0); // tiny overlap so weld succeeds
    }

    // ----- Merge + weld + normals
    const merged = mergeGeometries([mainGeom, ...(skirtGeom ? [skirtGeom] : [])], true);
    const welded = mergeVertices(merged, 1e-4);
    welded.computeVertexNormals();

    // ----- Anchor so that AFTER Y-flip, the base sits on y=0
    // Pre-flip put top at 0 (bb.max.y = 0). After flip, bottom = 0.
    welded.computeBoundingBox();
    const bb = welded.boundingBox!;
    const tx = - (bb.min.x + bb.max.x) / 2;
    // ✅ set bottom (pre-flip) to 0 so after flip the base sits on y=0
    const ty = -bb.max.y;
    const tz = -depth / 2;
    welded.translate(tx, ty, tz);

    // ----- Materials
    const capMat = new THREE.MeshStandardMaterial({
      map: faceMap, roughness: 0.92, metalness: 0.03,
      side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    });
    const sideMat = new THREE.MeshStandardMaterial({
      map: sideMap, roughness: 0.92, metalness: 0.03,
      side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    });
    const maxIdx = Math.max(...welded.groups.map(g => g.materialIndex));
    const mats = maxIdx >= 2 ? [capMat, capMat, sideMat] : [capMat, sideMat];

    return (
    <group ref={groupRef} scale={[scale, -scale, scale]}>
      <mesh ref={meshRef} geometry={welded} material={mats} castShadow receiveShadow {...meshProps}>
        {showEdges ? <Edges scale={1.002} color="#ffdf70" /> : null}
      </mesh>
      {typeof children === "function" ? children({ group: groupRef, mesh: meshRef, frontZ: depth/2, unitsPerMeter: 1/Math.max(1e-9, scale) }) : null}
    </group>
  );

  // include only stable deps
  }, [svg, depth, scale, faceMap, sideMap, tileSize, sideTileSize, topTileSize, targetHeight, preserveTop, bevel, doubleSided, children]);

  return node;
}
