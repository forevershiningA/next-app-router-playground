// components/SvgHeadstone.tsx
'use client';

import * as React from 'react';
import { useMemo, useLayoutEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import type { ThreeElements } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Edges, useTexture } from '@react-three/drei';
import { Line } from '#/lib/headstone-store';

export type HeadstoneAPI = {
  group: React.RefObject<THREE.Group>;
  mesh: React.RefObject<THREE.Mesh>;
  frontZ: number;
  unitsPerMeter: number;
  version: number;
  worldWidth: number;
  worldHeight: number;
};

const EPS = 1e-9;

type Props = {
  url: string;
  depth: number;
  scale?: number;
  faceTexture: string;
  sideTexture?: string;
  autoRepeat?: boolean;
  tileSize?: number;
  sideTileSize?: number;
  topTileSize?: number;
  faceRepeatX?: number;
  faceRepeatY?: number;
  sideRepeatX?: number;
  sideRepeatY?: number;
  targetHeight?: number;
  targetWidth?: number;
  preserveTop?: boolean;
  bevel?: boolean;
  doubleSided?: boolean;
  showEdges?: boolean;
  meshProps?: ThreeElements['mesh'];
  children?: (api: HeadstoneAPI, selectedAdditions: string[]) => React.ReactNode;
  selectedAdditions?: string[];
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
  return {
    minX, maxX, minY, maxY,
    dx: Math.max(EPS, maxX - minX),
    dy: Math.max(EPS, maxY - minY),
  };
}

function spacedOutline(shape: THREE.Shape, segments = 1024) {
  const pts = shape.getSpacedPoints(segments).map((p) => new THREE.Vector2(p.x, p.y));
  const cum = new Array<number>(pts.length).fill(0);
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    L += pts[i].distanceTo(pts[i - 1]);
    cum[i] = L;
  }
  L += pts[0].distanceTo(pts[pts.length - 1]);
  return { pts, cum, total: L };
}

function nearestS(x: number, y: number, pts: THREE.Vector2[], cum: number[], total: number) {
  let bi = 0, bd2 = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const dx = x - pts[i].x, dy = y - pts[i].y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bd2) { bd2 = d2; bi = i; }
  }
  return total > 0 ? cum[bi] / total : 0;
}

const SvgHeadstone = React.forwardRef<THREE.Group, Props>(({
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
  selectedAdditions = [],
}, ref) => {
  
  // 1. Load SVG and Textures
  const svgData = useLoader(SVGLoader, url);
  const textures = useTexture({
    face: faceTexture,
    side: sideTexture ?? faceTexture
  });

  // 2. Clone Textures (FIX: Texture Mutation Bug)
  const [clonedFaceMap, clonedSideMap] = useMemo(() => {
    const f = textures.face.clone();
    const s = textures.side.clone();
    
    [f, s].forEach(t => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      (t as any).anisotropy = 8;
      t.generateMipmaps = true;
      t.needsUpdate = true;
    });
    
    return [f, s];
  }, [textures.face, textures.side]);

  // 2a. Dispose cloned textures on cleanup
  React.useEffect(() => {
    return () => {
      clonedFaceMap.dispose();
      clonedSideMap.dispose();
    };
  }, [clonedFaceMap, clonedSideMap]);

  // 3. Generate Geometry (with disposal cleanup)
  const { geometries, dims, meshScale, apiData, childWrapperPos } = useMemo(() => {
    const shapes: THREE.Shape[] = [];
    svgData.paths.forEach((p: any) => shapes.push(...SVGLoader.createShapes(p)));
    
    if (!shapes.length) {
      return { 
        geometries: [], 
        dims: null, 
        meshScale: [1, 1, 1] as [number, number, number],
        apiData: { frontZ: 0, unitsPerMeter: 1, version: 0, worldWidth: 1, worldHeight: 1 },
        childWrapperPos: [0, 0, 0] as [number, number, number]
      };
    }

    const base = shapes[0];
    const outline = spacedOutline(base, 1024);
    
    // Bounds and world size
    const { minX, maxX, minY, maxY, dx, dy } = shapeBounds(base);
    const widthW = dx * Math.abs(scale);
    const heightW = dy * Math.abs(scale);

    // Targets
    const wantW = targetWidth ?? widthW;
    const wantH = targetHeight ?? heightW;

    // Uniform scale (width)
    const sCore = wantW / Math.max(EPS, widthW);
    const coreH_world = heightW * sCore;

    // Bottom target (top fixed) in SVG space
    const toSV = (w: number) => w / Math.max(EPS, Math.abs(scale) * sCore);
    const targetH_SV = preserveTop ? toSV(wantH) : dy * sCore;
    const bottomTarget_SV = minY + targetH_SV;

    // Build extrudes
    const extrudeSettings = {
      depth,
      steps: 1,
      bevelEnabled: bevel,
      bevelSegments: bevel ? 2 : 0,
      bevelSize: bevel ? 0.8 : 0,
      bevelThickness: bevel ? 0.8 : 0,
    };

    let coreGeom = new THREE.ExtrudeGeometry(base, extrudeSettings);
    const geoms: THREE.BufferGeometry[] = [coreGeom];

    // Preserve top logic
    if (preserveTop && wantH > coreH_world + 1e-9) {
      const s = new THREE.Shape();
      s.moveTo(minX, maxY);
      s.lineTo(maxX, maxY);
      s.lineTo(maxX, bottomTarget_SV);
      s.lineTo(minX, bottomTarget_SV);
      s.closePath();
      const band = new THREE.ExtrudeGeometry(s, extrudeSettings);
      geoms.push(band);
    } else if (preserveTop && wantH < coreH_world - 1e-9) {
      const pos = coreGeom.getAttribute('position') as THREE.BufferAttribute;
      const P = pos.array as Float32Array;
      for (let i = 0; i < P.length; i += 3)
        if (P[i + 1] > bottomTarget_SV) P[i + 1] = bottomTarget_SV;
      pos.needsUpdate = true;
    }

    // Merge geometries if needed
    let merged: THREE.BufferGeometry;
    if (geoms.length > 1) {
      merged = BufferGeometryUtils.mergeGeometries(geoms);
    } else {
      merged = geoms[0];
    }

    // Convert to non-indexed for material groups
    if (merged.index) merged = merged.toNonIndexed();

    // =========================================================
    // GEOMETRY NORMALIZATION (BAKE TO Y-UP)
    // =========================================================
    
    // 1. Center X. 
    //    Align "SVG Bottom" (maxY in most cases, but we use calculated bottomTarget_SV) to Y=0.
    //    This temporarily puts the shape upside down sitting on 0 (range 0 to -Height).
    //    Center Z to 0.
    merged.translate(-(minX + maxX) / 2, -bottomTarget_SV, -depth / 2);

    // 2. Flip Y.
    //    The shape flips vertically. 
    //    Previously: Base at 0, Top at -Height.
    //    Now: Base at 0, Top at +Height.
    //    This creates the correct Upright orientation.
    merged.scale(1, -1, 1);

    // 3. FIX WINDING ORDER.
    //    Scaling by -1 on one axis (Y) inverts the winding order (Inside-Out).
    //    We swap vertices 1 and 2 to restore correct Outward facing normals.
    const posAttr = merged.getAttribute('position');
    for (let i = 0; i < posAttr.count; i += 3) {
       const x1 = posAttr.getX(i + 1), y1 = posAttr.getY(i + 1), z1 = posAttr.getZ(i + 1);
       const x2 = posAttr.getX(i + 2), y2 = posAttr.getY(i + 2), z2 = posAttr.getZ(i + 2);
       // Swap
       posAttr.setXYZ(i + 1, x2, y2, z2);
       posAttr.setXYZ(i + 2, x1, y1, z1);
    }
    
    // Recompute normals for correct lighting
    merged.computeVertexNormals();

    // =========================================================
    // MATERIAL GROUPS
    // =========================================================
    // Front face is at +depth/2 (since we centered Z at step 1)
    const zFront = depth / 2;
    const zBack = -depth / 2;
    const zTol = Math.max(0.25, Math.abs(depth) * 0.01);
    
    merged.clearGroups();
    const pos = merged.getAttribute('position') as THREE.BufferAttribute;
    const triCount = Math.floor(pos.count / 3);
    let currentMat = -1, start = 0, count = 0;

    const flush = () => {
      if (count > 0) {
        merged.addGroup(start, count, currentMat);
        start += count;
        count = 0;
      }
    };

    for (let t = 0; t < triCount; t++) {
      const i0 = t * 3, i1 = i0 + 1, i2 = i0 + 2;
      // Front is now at +zFront due to centering
      const z0 = pos.getZ(i0);
      const cap = (Math.abs(z0 - zFront) <= zTol) || (Math.abs(z0 - zBack) <= zTol);
      
      const matIndex = cap ? 0 : 1;
      if (currentMat === -1) currentMat = matIndex;
      if (matIndex !== currentMat) { flush(); currentMat = matIndex; }
      count += 3;
    }
    flush();

    // =========================================================
    // UV MAPPING
    // =========================================================
    merged.computeBoundingBox();
    const bb = merged.boundingBox!;
    const x0 = bb.min.x, dxU = bb.max.x - bb.min.x;
    
    // Geometry is Y-Up [0, Height]. Texture is V-Up [0, 1].
    // Direct mapping works perfectly now.
    const y0 = bb.min.y; 
    const dyU = bb.max.y - bb.min.y;
    
    const uvArr = new Float32Array(pos.count * 2);
    const centerX = (minX + maxX) / 2;
    
    // Total visual height in SVG units
    const svgTotalHeight = bottomTarget_SV - minY;

    for (let i = 0; i < pos.count; i += 3) {
      const z0 = pos.getZ(i), z1 = pos.getZ(i+1);
      const isCap = (Math.abs(z0 - zFront) <= zTol) || (Math.abs(z0 - zBack) <= zTol);
      
      if (isCap) {
        for (let j = 0; j < 3; j++) {
          const u = (pos.getX(i + j) - x0) / dxU;
          const v = (pos.getY(i + j) - y0) / dyU; 
          uvArr[2 * (i + j)] = u;
          uvArr[2 * (i + j) + 1] = v;
        }
      } else {
        for (let j = 0; j < 3; j++) {
          const px = pos.getX(i + j);
          const py = pos.getY(i + j);
          const pz = pos.getZ(i + j);
          
          // Map 3D Y (0 to H) back to SVG Y (H to 0) for side wrapping
          // Original SVG Y = TotalH - GeomY + minY
          const originalSvgY = svgTotalHeight - py + minY;
          
          const s = nearestS(px + centerX, originalSvgY, outline.pts, outline.cum, outline.total);
          // Map Z from [-d/2, +d/2] to [0, 1]
          const t = (pz - zBack) / depth; 
          uvArr[2 * (i + j)] = s;
          uvArr[2 * (i + j) + 1] = t;
        }
      }
    }
    merged.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));

    // Stats & Output
    const worldW = (maxX - minX) * Math.abs(scale) * sCore;
    const worldH = (bottomTarget_SV - minY) * Math.abs(scale) * sCore;
    const worldPerim = outline.total * Math.abs(scale) * sCore;
    const worldDepth = Math.abs(depth * scale);

    // Standard Scale (1,1,1) because geometry is normalized
    const finalScale: [number, number, number] = [scale * sCore, scale * sCore, scale];

    // =========================================================
    // CHILD WRAPPER POSITION
    // =========================================================
    // Children use mesh-local coordinates from raycasting.
    // Raycaster returns coords in geometry's coordinate system (Y-up, base at 0).
    // Wrapper should be at origin with identity transform.
    
    const wrapperX = 0;  
    const wrapperY = 0;  
    const wrapperZ = 0;

    return {
      geometries: [merged],
      dims: { worldW, worldH, worldPerim, worldDepth },
      meshScale: finalScale,
      apiData: {
        frontZ: depth / 2, // Z Position of the front face in local space
        unitsPerMeter: 1 / Math.max(EPS, scale * sCore),
        version: Math.random(),
        worldWidth: worldW,
        worldHeight: worldH
      },
      childWrapperPos: [wrapperX, wrapperY, wrapperZ] as [number, number, number]
    };
  }, [svgData, depth, bevel, scale, targetWidth, targetHeight, preserveTop]);

  // 4. Update Texture Repeats (Side Effect)
  useLayoutEffect(() => {
    if (!dims) return;
    
    const usePhysical = autoRepeat || tileSize != null || sideTileSize != null;
    const faceTile = tileSize ?? 0.1;
    const sideTile = sideTileSize ?? faceTile;

    const repFaceX = usePhysical ? Math.max(1, dims.worldW / faceTile) : (faceRepeatX ?? 6);
    const repFaceY = usePhysical ? Math.max(1, dims.worldH / faceTile) : (faceRepeatY ?? 6);
    const repSideX = usePhysical ? Math.max(1, dims.worldPerim / sideTile) : (sideRepeatX ?? 8);
    const repSideY = usePhysical ? Math.max(1, dims.worldDepth / sideTile) : (sideRepeatY ?? 1);

    clonedFaceMap.repeat.set(repFaceX, repFaceY);
    clonedSideMap.repeat.set(repSideX, repSideY);
    clonedFaceMap.needsUpdate = true;
    clonedSideMap.needsUpdate = true;
  }, [dims, autoRepeat, tileSize, sideTileSize, faceRepeatX, faceRepeatY, sideRepeatX, sideRepeatY, clonedFaceMap, clonedSideMap]);

  // 5. Create Materials (FIX: Return data from useMemo, not JSX)
  const materials = useMemo(() => {
    const common = {
      roughness: 0.15,
      metalness: 0.1,
      color: new THREE.Color(0xffffff),
      side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
      envMapIntensity: 1.5,
    };
    return [
      new THREE.MeshStandardMaterial({ ...common, map: clonedFaceMap }),
      new THREE.MeshStandardMaterial({ ...common, map: clonedSideMap })
    ];
  }, [clonedFaceMap, clonedSideMap, doubleSided]);

  // 5a. Dispose geometries and materials on cleanup
  React.useEffect(() => {
    return () => {
      geometries.forEach(geom => geom.dispose());
      materials.forEach(mat => mat.dispose());
    };
  }, [geometries, materials]);

  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const scaledWrapperRef = useRef<THREE.Group>(null!);
  
  // Force re-render after mount to ensure children can access populated meshRef
  const [isReady, setIsReady] = useState(false);
  useLayoutEffect(() => {
    setIsReady(true);
  }, []);

  useImperativeHandle(ref, () => groupRef.current);

  // Stable API for children
  // Note: api.group points to the scaled wrapper for proper child alignment
  const childApi = useMemo(() => ({
    group: scaledWrapperRef,
    mesh: meshRef,
    frontZ: apiData?.frontZ ?? 0,
    unitsPerMeter: apiData?.unitsPerMeter ?? 100,
    version: apiData?.version ?? 0,
    worldWidth: apiData?.worldWidth ?? 1,
    worldHeight: apiData?.worldHeight ?? 1
  }), [apiData, isReady]); // Include isReady to ensure update after mount

  if (!geometries.length || !dims) return null;

  // 6. Return JSX (FIX: JSX in return, not useMemo)
  // CRITICAL FIX: Move scale from group to individual meshes to prevent base inheritance
  return (
    <group ref={groupRef}>
      {/* Apply SVG scale only to headstone mesh */}
      {geometries.map((geom, i) => (
        <mesh
          key={`hs-${i}`}
          ref={i === 0 ? meshRef : undefined}
          geometry={geom}
          material={materials}
          scale={meshScale}
          castShadow
          receiveShadow
          {...meshProps}
        >
          {showEdges && <Edges scale={1.002} threshold={15} color="white" />}
        </mesh>
      ))}

      {/* 
         CHILDREN WRAPPER:
         Apply SVG scale here so children (inscriptions/motifs) align with headstone.
         Raycasting returns mesh-local coords which are already in geometry space.
         API.group points to this scaled wrapper for proper child alignment.
      */}
      <group ref={scaledWrapperRef} position={childWrapperPos} scale={meshScale}>
         {typeof children === 'function' && children(childApi, selectedAdditions)}
      </group>
    </group>
  );
});

SvgHeadstone.displayName = 'SvgHeadstone';

export default SvgHeadstone;
