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
  headstoneStyle?: 'upright' | 'slant';
  slantThickness?: number; // Absolute thickness in mm (100-300mm)
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

function spacedOutline(shape: THREE.Shape, segments = 2048) {
  // Get spaced points to ensure uniform density along the curve
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

// Helper to calculate distance from point P to segment AB
function distToSegmentSquared(p: THREE.Vector2, a: THREE.Vector2, b: THREE.Vector2) {
  const l2 = a.distanceToSquared(b);
  if (l2 === 0) return p.distanceToSquared(a);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const px = a.x + t * (b.x - a.x);
  const py = a.y + t * (b.y - a.y);
  return (p.x - px) ** 2 + (p.y - py) ** 2;
}

// Robust projection function that avoids "stepping" artifacts
function getProjectedPerimeter(x: number, y: number, pts: THREE.Vector2[], cum: number[], total: number) {
  let bi = 0, bd2 = Infinity;
  
  // 1. Find approximate nearest point index
  for (let i = 0; i < pts.length; i++) {
    const dx = x - pts[i].x, dy = y - pts[i].y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bd2) { bd2 = d2; bi = i; }
  }

  // 2. Interpolate between segments (Prev vs Next)
  const iPrev = (bi - 1 + pts.length) % pts.length;
  const iNext = (bi + 1) % pts.length;
  const v = new THREE.Vector2(x, y);

  // Dist to PREVIOUS segment (bi-1 -> bi)
  const dPrevSq = distToSegmentSquared(v, pts[iPrev], pts[bi]);
  
  // Dist to NEXT segment (bi -> bi+1)
  const dNextSq = distToSegmentSquared(v, pts[bi], pts[iNext]);

  let baseIndex = bi;
  let nextIndex = iNext;
  
  // Choose the closer segment
  if (dPrevSq < dNextSq) {
    baseIndex = iPrev;
    nextIndex = bi;
  }

  // Project onto the chosen segment to get exact T
  const p1 = pts[baseIndex];
  const p2 = pts[nextIndex];
  const seg = new THREE.Vector2().subVectors(p2, p1);
  const len = seg.length();
  
  if (len < EPS) return cum[baseIndex] / total;

  const rel = new THREE.Vector2().subVectors(v, p1);
  const proj = rel.dot(seg.normalize()); // Distance along segment
  
  let startDist = cum[baseIndex];
  let finalDist = startDist + proj;
  
  // Normalize 0..1
  if (finalDist < 0) finalDist += total;
  if (finalDist > total) finalDist -= total;

  return total > 0 ? finalDist / total : 0;
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
  headstoneStyle = 'upright',
  slantThickness = 150, // Default 150mm
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

  // 2. Clone Textures (FIX: Enable Mipmaps and correct Filtering)
  const [clonedFaceMap, clonedSideMap] = useMemo(() => {
    const f = textures.face.clone();
    const s = textures.side.clone();
    
    [f, s].forEach(t => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      // LinearMipmapLinearFilter is essential for removing aliasing/noise at distance
      t.minFilter = THREE.LinearMipmapLinearFilter; 
      t.magFilter = THREE.LinearFilter;
      (t as any).anisotropy = 16;
      t.generateMipmaps = true; // Must be true for anisotropic filtering to work
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

  // 2b. Generate Rock Pitch Normal Map for Slant Headstones
  const rockNormalCanvas = useMemo(() => {
    if (headstoneStyle !== 'slant') return null;

    const size = 1024; // Increased resolution for better detail
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    // Pseudo-random deterministic noise
    const fract = (x: number) => x - Math.floor(x);
    const random2 = (x: number, y: number) => {
      return {
        x: fract(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453),
        y: fract(Math.sin(x * 26.345 + y * 42.123) * 31421.3551)
      };
    };

    // Voronoi-based faceted height map - increased scale for smaller chips
    const getHeight = (u: number, v: number) => {
      const scale = 20.0; // Reduced from 24.0 for balance
      const su = u * scale;
      const sv = v * scale;

      let minDist = 999;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const cellX = Math.floor(su) + dx;
          const cellY = Math.floor(sv) + dy;
          const rand = random2(cellX, cellY);
          const pointX = cellX + rand.x;
          const pointY = cellY + rand.y;
          const dist = Math.sqrt((su - pointX) ** 2 + (sv - pointY) ** 2);
          if (dist < minDist) minDist = dist;
        }
      }

      return Math.pow(1.0 - Math.min(minDist, 1.0), 0.5);
    };

    // Generate height map and convert to normal map
    const heights: number[][] = [];
    for (let y = 0; y < size; y++) {
      heights[y] = [];
      for (let x = 0; x < size; x++) {
        heights[y][x] = getHeight(x / size, y / size);
      }
    }

    // Negative strength for "pop-out" bumps
    const strength = -15.0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const xRight = (x + 1) % size;
        const yDown = (y + 1) % size;

        const h0 = heights[y][x];
        const hRight = heights[y][xRight];
        const hDown = heights[yDown][x];

        const dX = (h0 - hRight) * strength;
        const dY = (h0 - hDown) * strength;

        const norm = Math.sqrt(dX * dX + dY * dY + 1);
        const nx = dX / norm;
        const ny = dY / norm;
        const nz = 1 / norm;

        const idx = (y * size + x) * 4;
        data[idx] = ((nx * 0.5 + 0.5) * 255) | 0;
        data[idx + 1] = ((ny * 0.5 + 0.5) * 255) | 0;
        data[idx + 2] = ((nz * 0.5 + 0.5) * 255) | 0;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }, [headstoneStyle]);

  // 2c. Create normal map texture from canvas
  const rockNormalTexture = useMemo(() => {
    if (!rockNormalCanvas) return null;
    
    const tex = new THREE.CanvasTexture(rockNormalCanvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.NoColorSpace;
    tex.needsUpdate = true;
    
    return tex;
  }, [rockNormalCanvas]);

  // 2d. Cleanup rock normal texture
  React.useEffect(() => {
    return () => {
      if (rockNormalTexture) {
        rockNormalTexture.dispose();
      }
    };
  }, [rockNormalTexture]);

  // 3. Pre-calculate shape bounds and parameters
  const shapeParams = useMemo(() => {
    const shapes: THREE.Shape[] = [];
    svgData.paths.forEach((p: any) => shapes.push(...SVGLoader.createShapes(p)));
    
    if (!shapes.length) {
      return null;
    }

    const base = shapes[0];
    const { minX, maxX, minY, maxY, dx, dy } = shapeBounds(base);
    const widthW = dx * Math.abs(scale);
    const heightW = dy * Math.abs(scale);
    const wantW = targetWidth ?? widthW;
    const wantH = targetHeight ?? heightW;
    const sCore = wantW / Math.max(EPS, widthW);
    const coreH_world = heightW * sCore;
    const toSV = (w: number) => w / Math.max(EPS, Math.abs(scale) * sCore);
    const targetH_SV = preserveTop ? toSV(wantH) : dy * sCore;
    const bottomTarget_SV = minY + targetH_SV;

    return { base, minX, maxX, minY, maxY, dx, dy, widthW, heightW, wantW, wantH, sCore, coreH_world, bottomTarget_SV, targetH_SV };
  }, [svgData, scale, targetWidth, targetHeight, preserveTop]);

  // 3a. Calculate outline (now at top level)
  const outline = useMemo(() => {
    if (!shapeParams) return null;

    const { base, minX, maxX, maxY, dx, dy, wantH, coreH_world, bottomTarget_SV } = shapeParams;
    const isExpanded = preserveTop && wantH > coreH_world + 1e-4;
    
    let ptsForOutline = base.getPoints(12);
    
    if (isExpanded) {
      let idxL = -1, idxR = -1;
      let minDiffL = Infinity, minDiffR = Infinity;
      const tol = Math.max(dx, dy) * 0.05;

      ptsForOutline.forEach((p, i) => {
        const distL = Math.hypot(p.x - minX, p.y - maxY);
        const distR = Math.hypot(p.x - maxX, p.y - maxY);
        if (distL < minDiffL) { minDiffL = distL; idxL = i; }
        if (distR < minDiffR) { minDiffR = distR; idxR = i; }
      });

      if (minDiffL < tol && minDiffR < tol && idxL !== idxR) {
        const newPts: THREE.Vector2[] = [];
        const len = ptsForOutline.length;
        const fwdDist = (idxR - idxL + len) % len;
        const revDist = (idxL - idxR + len) % len;
        const pL = ptsForOutline[idxL];
        const pR = ptsForOutline[idxR];
        const pL_new = new THREE.Vector2(pL.x, bottomTarget_SV);
        const pR_new = new THREE.Vector2(pR.x, bottomTarget_SV);

        if (fwdDist < revDist) {
          let curr = idxR;
          while (curr !== idxL) {
            newPts.push(ptsForOutline[curr]);
            curr = (curr + 1) % len;
          }
          newPts.push(ptsForOutline[idxL]);
          newPts.push(pL_new);
          newPts.push(pR_new);
          newPts.push(ptsForOutline[idxR]);
        } else {
          let curr = idxL;
          while (curr !== idxR) {
            newPts.push(ptsForOutline[curr]);
            curr = (curr + 1) % len;
          }
          newPts.push(ptsForOutline[idxR]);
          newPts.push(pR_new);
          newPts.push(pL_new);
          newPts.push(ptsForOutline[idxL]);
        }
        
        const shape = new THREE.Shape(newPts);
        // Use high segment count for smooth lookup
        return spacedOutline(shape, 4096); 
      }
    }
    
    return spacedOutline(base, 4096);
  }, [shapeParams, preserveTop]);

  // 3b. Generate Geometry (with disposal cleanup)
  const { geometries, dims, meshScale, apiData, childWrapperPos, childWrapperRotation } = useMemo(() => {
    if (!shapeParams || !outline) {
      return { 
        geometries: [], 
        dims: null, 
        meshScale: [1, 1, 1] as [number, number, number],
        apiData: { frontZ: 0, unitsPerMeter: 1, version: 0, worldWidth: 1, worldHeight: 1 },
        childWrapperPos: [0, 0, 0] as [number, number, number],
        childWrapperRotation: new THREE.Quaternion() // Identity quaternion
      };
    }

    const { base, minX, maxX, minY, maxY, dx, dy, sCore, bottomTarget_SV, wantH, coreH_world } = shapeParams;

    // FOR SLANT: Create trapezoidal prism geometry
    if (headstoneStyle === 'slant') {
      const slantGeometry = new THREE.BufferGeometry();
      
      // FIX: Use absolute thickness in mm instead of ratios
      // The slantThickness parameter is now in mm (100-200mm)
      const baseThickness = slantThickness / 10; // Convert mm to cm for Three.js units
      const topThickness = baseThickness * 0.2; // 20% ratio for top (standard cemetery slant)
      
      console.log('[SvgHeadstone] SLANT MODE:', {
        slantThicknessMm: slantThickness,
        baseThicknessCm: baseThickness,
        topThicknessCm: topThickness,
      });
      
      // Calculate how far back the top-front edge starts
      const frontTopZOffset = baseThickness - topThickness;
      
      // Calculate the slant angle for rotating inscriptions/motifs in WORLD SPACE
      // We must scale the dimensions to world units before calculating atan2 
      // because sCore affects height(Y) but not depth(Z)
      const worldScaleY = Math.abs(scale) * sCore;
      const worldScaleZ = Math.abs(scale);
      
      const svgHeight = maxY - minY;
      const worldHeight = svgHeight * worldScaleY;
      
      const svgRun = frontTopZOffset;
      const worldRun = svgRun * worldScaleZ;

      const slantAngleRad = Math.atan2(worldRun, worldHeight);
      
      // Calculate the SLANT HEIGHT (diagonal length of the front face)
      // This is the actual surface length that inscriptions should span
      const worldSlantH = Math.sqrt(worldHeight ** 2 + worldRun ** 2);
      
      // Define all vertices (duplicated per face for proper UVs and normals)
      const positions: number[] = [];
      const uvs: number[] = [];
      
      // Helper to add a quad (2 triangles)
      // IMPORTANT: Ensure consistent winding order (counter-clockwise when looking from outside)
      const addQuad = (
        v0: [number, number, number], v1: [number, number, number],
        v2: [number, number, number], v3: [number, number, number],
        uv0: [number, number], uv1: [number, number],
        uv2: [number, number], uv3: [number, number]
      ) => {
        // Triangle 1: v0, v1, v2 (Counter-clockwise)
        positions.push(...v0, ...v1, ...v2);
        uvs.push(...uv0, ...uv1, ...uv2);
        
        // Triangle 2: v0, v2, v3 (Counter-clockwise)
        positions.push(...v0, ...v2, ...v3);
        uvs.push(...uv0, ...uv2, ...uv3);
      };
      
      // Define the 8 unique corner points of the trapezoidal prism
      // Naming: P_[Front/Back]_[Bottom/Top]_[Left/Right]
      // Z-axis: 0 is front, -depth is back.
      // Y-axis: minY is bottom, maxY is top.
      // X-axis: minX is left, maxX is right.

      // Front Face Corners (z=0 at bottom, z=-frontTopZOffset at top)
      const P_FBL = new THREE.Vector3(minX, minY, 0);                 // Front Bottom Left
      const P_FBR = new THREE.Vector3(maxX, minY, 0);                 // Front Bottom Right
      const P_FTL = new THREE.Vector3(minX, maxY, -frontTopZOffset);  // Front Top Left
      const P_FTR = new THREE.Vector3(maxX, maxY, -frontTopZOffset);  // Front Top Right

      // Back Face Corners (z=-baseThickness for both bottom and top)
      const P_BBL = new THREE.Vector3(minX, minY, -baseThickness);            // Back Bottom Left
      const P_BBR = new THREE.Vector3(maxX, minY, -baseThickness);            // Back Bottom Right
      const P_BTL = new THREE.Vector3(minX, maxY, -baseThickness);            // Back Top Left
      const P_BTR = new THREE.Vector3(maxX, maxY, -baseThickness);            // Back Top Right
      
      // --- Faces ---

      // 1. FRONT FACE (polished) - Group 0
      // Vertices: P_FBL, P_FBR, P_FTR, P_FTL (viewed from front, counter-clockwise)
      const frontFaceStartIdx = positions.length / 3; // Record start index for material group
      addQuad(
        P_FBL.toArray() as [number, number, number],   // V0 (Bottom Left)
        P_FBR.toArray() as [number, number, number],  // V1 (Bottom Right)
        P_FTR.toArray() as [number, number, number],  // V2 (Top Right)
        P_FTL.toArray() as [number, number, number],  // V3 (Top Left)
        [0, 0], [1, 0], [1, 1], [0, 1] // UVs (normalized for this face)
      );
      const frontFaceEndIdx = positions.length / 3;

      // 2. BACK FACE (rock pitch) - Group 1
      // Vertices: P_BBR, P_BBL, P_BTL, P_BTR (viewed from back, counter-clockwise)
      addQuad(
        P_BBR.toArray() as [number, number, number],   // V0 (Bottom Right)
        P_BBL.toArray() as [number, number, number],  // V1 (Bottom Left)
        P_BTL.toArray() as [number, number, number],  // V2 (Top Left)
        P_BTR.toArray() as [number, number, number],  // V3 (Top Right)
        [0, 0], [1, 0], [1, 1], [0, 1] // UVs (normalized for this face)
      );
      
      // 3. TOP FACE (rock pitch) - Group 1
      // Vertices: P_FTL, P_FTR, P_BTR, P_BTL (viewed from top, counter-clockwise)
      addQuad(
        P_FTL.toArray() as [number, number, number],  // V0 (Front Top Left)
        P_FTR.toArray() as [number, number, number],  // V1 (Front Top Right)
        P_BTR.toArray() as [number, number, number],  // V2 (Back Top Right)
        P_BTL.toArray() as [number, number, number],  // V3 (Back Top Left)
        [0, 0], [1, 0], [1, 1], [0, 1] // UVs (normalized for this face)
      );
      
      // 4. BOTTOM FACE (rock pitch) - Group 1
      // Vertices: P_FBR, P_FBL, P_BBL, P_BBR (viewed from bottom, counter-clockwise)
      addQuad(
        P_FBR.toArray() as [number, number, number],  // V0 (Front Bottom Right)
        P_FBL.toArray() as [number, number, number],  // V1 (Front Bottom Left)
        P_BBL.toArray() as [number, number, number],  // V2 (Back Bottom Left)
        P_BBR.toArray() as [number, number, number],  // V3 (Back Bottom Right)
        [0, 0], [1, 0], [1, 1], [0, 1] // UVs (normalized for this face)
      );
      
      // 5. LEFT SIDE FACE (rock pitch) - Group 1
      // Vertices: P_FBL, P_FTL, P_BTL, P_BBL (viewed from left, counter-clockwise)
      addQuad(
        P_FBL.toArray() as [number, number, number],  // V0 (Front Bottom Left)
        P_FTL.toArray() as [number, number, number],  // V1 (Front Top Left)
        P_BTL.toArray() as [number, number, number],  // V2 (Back Top Left)
        P_BBL.toArray() as [number, number, number],  // V3 (Back Bottom Left)
        [0, 0], [1, 0], [1, 1], [0, 1] // UVs (normalized for this face)
      );
      
      // 6. RIGHT SIDE FACE (rock pitch) - Group 1
      // Vertices: P_FBR, P_BBR, P_BTR, P_FTR (viewed from right, counter-clockwise)
      addQuad(
        P_FBR.toArray() as [number, number, number],  // V0 (Front Bottom Right)
        P_BBR.toArray() as [number, number, number],  // V1 (Back Bottom Right)
        P_BTR.toArray() as [number, number, number],  // V2 (Back Top Right)
        P_FTR.toArray() as [number, number, number],  // V3 (Front Top Right)
        [0, 0], [1, 0], [1, 1], [0, 1] // UVs (normalized for this face)
      );
      
      slantGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
      slantGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
      slantGeometry.computeVertexNormals();
      
      // =========================================================
      // GEOMETRY NORMALIZATION (BAKE TO Y-UP) for SLANT
      // =========================================================
      // Translate geometry so:
      // 1. X is centered
      // 2. Bottom (minY) is at Y=0
      // 3. Z translation: Align back edge with BASE back edge
      //    
      //    CRITICAL ISSUE: 'depth' prop is for UPRIGHT headstones (fixed, e.g., 20cm)
      //    But SLANT thickness varies (100mm to 300mm = 10cm to 30cm)
      //    We can't use 'depth' for slant alignment!
      //    
      //    SOLUTION: Align slant back to SAME position as upright back
      //    - Upright back is at: -depth/2 (e.g., -10cm)
      //    - Slant back should ALSO be at: -depth/2 (FIXED, regardless of slant thickness)
      //    - Current slant back is at: -baseThickness (varies with thickness)
      //    - Translation needed: -depth/2 - (-baseThickness) = baseThickness - depth/2
      //    
      //    When thickness increases from 100mm (10cm) to 300mm (30cm):
      //    - Back starts at -10cm → -30cm
      //    - Translation1 = 10 - 10 = 0
      //    - Translation2 = 30 - 10 = 20
      //    - Final back position1 = -10 + 0 = -10 ✓
      //    - Final back position2 = -30 + 20 = -10 ✓ (Still at -10, CORRECT!)
      //    
      //    Math is CORRECT! But maybe the issue is the base back position isn't actually at -depth/2?
      //    Or the depth prop value is wrong?
      const zTranslation = baseThickness - depth / 2;
      
      console.log('[SvgHeadstone] SLANT Z-TRANSLATION DEBUG:', {
        slantThicknessMm: slantThickness,
        baseThicknessCm: baseThickness,
        depthPropCm: depth,
        zTranslation,
        backBeforeTranslation: -baseThickness,
        backAfterTranslation: -baseThickness + zTranslation,
        targetBackPosition: -depth / 2,
        shouldMatch: Math.abs((-baseThickness + zTranslation) - (-depth / 2)) < 0.001
      });
      
      slantGeometry.translate(-(minX + maxX) / 2, -minY, zTranslation);
      slantGeometry.computeVertexNormals();
      
      // Material groups: 0 = front, 1 = everything else
      slantGeometry.clearGroups();
      slantGeometry.addGroup(0, (frontFaceEndIdx - frontFaceStartIdx), 0); // Front face
      slantGeometry.addGroup((frontFaceEndIdx - frontFaceStartIdx), (positions.length / 3) - (frontFaceEndIdx - frontFaceStartIdx), 1); // All other faces
      
      // =========================================================
      // Calculate world dimensions BEFORE UV mapping
      const worldW = dx * Math.abs(scale) * sCore;
      const worldH = (maxY - minY) * Math.abs(scale) * sCore;
      const worldDepth = depth * Math.abs(scale);
      
      // UV MAPPING (Recalculate based on normalized geometry)
      // =========================================================
      slantGeometry.computeBoundingBox();
      const bb = slantGeometry.boundingBox!;
      const bb_dx = bb.max.x - bb.min.x;
      const bb_dy = bb.max.y - bb.min.y;
      
      const posAttr = slantGeometry.getAttribute('position') as THREE.BufferAttribute;
      const uvAttr = slantGeometry.getAttribute('uv') as THREE.BufferAttribute;
      const localFrontZ = bb.max.z;
      const localBackZ = bb.min.z;
      
      // Texture density for rock pitch - baked into UVs
      const textureDensity = 20.0;
      
      for (let triIdx = 0; triIdx < posAttr.count / 3; triIdx++) {
        const i = triIdx * 3;
        let isFrontFace = false;
        
        for (let g = 0; g < slantGeometry.groups.length; g++) {
          const group = slantGeometry.groups[g];
          if (i >= group.start && i < group.start + group.count) {
            isFrontFace = (group.materialIndex === 0);
            break;
          }
        }
        
        if (isFrontFace) {
          // Front face: Standard UV mapping for text texture (0-1 range)
          for (let j = 0; j < 3; j++) {
            const x = posAttr.getX(i + j);
            const y = posAttr.getY(i + j);
            uvAttr.setXY(i + j,
              (x - bb.min.x) / bb_dx,  // U: 0-1 across width
              (y - bb.min.y) / bb_dy   // V: 0-1 across height
            );
          }
        } else {
          // Other faces: BAKE density into UVs for uniform rock pitch without distortion
          const v0 = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
          const v1 = new THREE.Vector3(posAttr.getX(i + 1), posAttr.getY(i + 1), posAttr.getZ(i + 1));
          const v2 = new THREE.Vector3(posAttr.getX(i + 2), posAttr.getY(i + 2), posAttr.getZ(i + 2));
          
          const edge1 = new THREE.Vector3().subVectors(v1, v0);
          const edge2 = new THREE.Vector3().subVectors(v2, v0);
          const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
          
          for (let j = 0; j < 3; j++) {
            const x = posAttr.getX(i + j);
            const y = posAttr.getY(i + j);
            const z = posAttr.getZ(i + j);
            
            // Determine UV orientation based on dominant normal direction
            if (Math.abs(normal.x) > Math.abs(normal.y) && Math.abs(normal.x) > Math.abs(normal.z)) {
              // Side face: U=Depth(Z), V=Height(Y) MULTIPLIED by world dimensions * density
              // Use (localFrontZ - z) to flip direction so texture flows front-to-back
              uvAttr.setXY(i + j,
                ((localFrontZ - z) / (localFrontZ - localBackZ)) * worldDepth * textureDensity,
                ((y - bb.min.y) / bb_dy) * worldH * textureDensity
              );
            } else if (Math.abs(normal.y) > Math.abs(normal.x) && Math.abs(normal.y) > Math.abs(normal.z)) {
              // Top/Bottom face: U=Width(X), V=Depth(Z) MULTIPLIED by world dimensions * density
              // Use (localFrontZ - z) to flip direction
              uvAttr.setXY(i + j,
                ((x - bb.min.x) / bb_dx) * worldW * textureDensity,
                ((localFrontZ - z) / (localFrontZ - localBackZ)) * worldDepth * textureDensity
              );
            } else {
              // Back face: U=Width(X), V=Height(Y) MULTIPLIED by world dimensions * density
              uvAttr.setXY(i + j,
                ((x - bb.min.x) / bb_dx) * worldW * textureDensity,
                ((y - bb.min.y) / bb_dy) * worldH * textureDensity
              );
            }
          }
        }
      }
      uvAttr.needsUpdate = true;
      
      // World dimensions and final values (already calculated above before UV mapping)
      const perim = 2 * (worldW + worldH);
      const finalScale: [number, number, number] = [scale * sCore, scale * sCore, scale];
      
      // Scale-aware epsilon for z-offset (~0.5mm in world space)
      const worldUnit = Math.abs(scale) * sCore;
      const frontZEps = Math.max(0.0005, 0.5e-3);
      
      // Build quaternion that aligns wrapper's local +Z to the front face normal
      // Top of face recedes in -Z as Y increases → outward normal has +Z and +Y (faces up/out)
      // FIX: Y component should be positive for a face leaning back
      const frontNormal = new THREE.Vector3(0, Math.sin(slantAngleRad), Math.cos(slantAngleRad)).normalize();
      const wrapperQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), frontNormal);
      
      return {
        geometries: [slantGeometry],
        dims: { worldW, worldH, worldPerim: perim, worldDepth },
        meshScale: finalScale,
        apiData: {
          frontZ: frontZEps, // Scale-aware offset to prevent z-fighting
          unitsPerMeter: 1 / Math.max(EPS, scale * sCore),
          version: Math.random(),
          worldWidth: worldW,
          worldHeight: worldSlantH // CRITICAL: Report slant height so children fit the slanted surface
        },
        childWrapperPos: [0, 0, zTranslation * scale] as [number, number, number], // Match geometry translation
        childWrapperRotation: wrapperQuaternion // Return THREE.Quaternion object, not array
      };
    }

    // NORMAL UPRIGHT HEADSTONE (existing code)

    // Build extrudes
    const extrudeSettings = {
      depth,
      steps: 1,
      bevelEnabled: bevel,
      bevelSegments: bevel ? 2 : 0,
      bevelSize: bevel ? 0.8 : 0,
      bevelThickness: bevel ? 0.8 : 0,
      curveSegments: 32 // Ensure smooth geometry curve
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
      // Check if all three vertices are at front or back
      const z0 = pos.getZ(i0), z1 = pos.getZ(i1), z2 = pos.getZ(i2);
      const cap = (Math.abs(z0 - zFront) <= zTol && Math.abs(z1 - zFront) <= zTol && Math.abs(z2 - zFront) <= zTol) || 
                  (Math.abs(z0 - zBack) <= zTol && Math.abs(z1 - zBack) <= zTol && Math.abs(z2 - zBack) <= zTol);
      
      const matIndex = cap ? 0 : 1;
      if (currentMat === -1) currentMat = matIndex;
      if (matIndex !== currentMat) { flush(); currentMat = matIndex; }
      count += 3;
    }
    flush();

    // =========================================================
    // UV MAPPING (Normalized 0..1 Strategy)
    // =========================================================
    merged.computeBoundingBox();
    const bb = merged.boundingBox!;
    const x0 = bb.min.x, dxU = bb.max.x - bb.min.x;
    const y0 = bb.min.y, dyU = bb.max.y - bb.min.y;
    
    const uvArr = new Float32Array(pos.count * 2);
    const centerX = (minX + maxX) / 2;
    const svgTotalHeight = bottomTarget_SV - minY;

    // Calculate Physical World Dimensions (Used for Repeats, not UV baking)
    const worldW = (maxX - minX) * Math.abs(scale) * sCore;
    const worldH = (bottomTarget_SV - minY) * Math.abs(scale) * sCore;
    const worldPerimeterLen = outline.total * Math.abs(scale) * sCore;
    // Important: worldDepth is physical thickness
    const worldZDepth = Math.abs(depth * scale); 

    for (let i = 0; i < pos.count; i += 3) {
      const z0 = pos.getZ(i), z1 = pos.getZ(i+1), z2 = pos.getZ(i+2);
      const isCap = (Math.abs(z0 - zFront) <= zTol && Math.abs(z1 - zFront) <= zTol && Math.abs(z2 - zFront) <= zTol) || 
                    (Math.abs(z0 - zBack) <= zTol && Math.abs(z1 - zBack) <= zTol && Math.abs(z2 - zBack) <= zTol);
      
      if (isCap) {
        // Front/Back: Normalized 0..1
        for (let j = 0; j < 3; j++) {
          const u = (pos.getX(i + j) - x0) / dxU;
          const v = (pos.getY(i + j) - y0) / dyU; 
          uvArr[2 * (i + j)] = u;
          uvArr[2 * (i + j) + 1] = v;
        }
      } else {
        // Sides: Normalized 0..1
        // U = Perimeter Fraction
        // V = Depth Fraction
        const rawUVs: {s: number, v: number}[] = [];
        
        for (let j = 0; j < 3; j++) {
          const px = pos.getX(i + j);
          const py = pos.getY(i + j);
          const pz = pos.getZ(i + j);
          
          const originalSvgY = svgTotalHeight - py + minY;
          const s = getProjectedPerimeter(px + centerX, originalSvgY, outline.pts, outline.cum, outline.total);
          
          // Map depth to 0..1
          const v = (pz - zBack) / (zFront - zBack);
          
          rawUVs.push({ s, v });
        }

        // Seam Fix: If we cross the 1.0 -> 0.0 boundary
        const s0 = rawUVs[0].s;
        const s1 = rawUVs[1].s;
        const s2 = rawUVs[2].s;
        if (Math.abs(s0 - s1) > 0.5 || Math.abs(s1 - s2) > 0.5 || Math.abs(s2 - s0) > 0.5) {
           if (s0 < 0.5) rawUVs[0].s += 1;
           if (s1 < 0.5) rawUVs[1].s += 1;
           if (s2 < 0.5) rawUVs[2].s += 1;
        }

        // Write UVs (NO SCALE APPLIED HERE)
        for (let j = 0; j < 3; j++) {
           uvArr[2 * (i + j)] = rawUVs[j].s;
           uvArr[2 * (i + j) + 1] = rawUVs[j].v;
        }
      }
    }
    merged.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));

    // Stats & Output
    const worldPerim = worldPerimeterLen;
    const worldDepth = worldZDepth;

    // Standard Scale (1,1,1) because geometry is normalized
    const finalScale: [number, number, number] = [scale * sCore, scale * sCore, scale];

    // =========================================================
    // CHILD WRAPPER POSITION
    // =========================================================
    // Move wrapper to front face surface (prevent double Z-offset)
    // Wrapper positioned at face, children use small epsilon
    
    const wrapperX = 0;  
    const wrapperY = 0;  
    const wrapperZ = (depth / 2) * scale; // Position wrapper at front face

    return {
      geometries: [merged],
      dims: { worldW, worldH, worldPerim, worldDepth },
      meshScale: finalScale,
      apiData: {
        frontZ: 0.0005, // Epsilon only - wrapper is already at the face
        unitsPerMeter: 1 / Math.max(EPS, scale * sCore),
        version: Math.random(),
        worldWidth: worldW,
        worldHeight: worldH
      },
      childWrapperPos: [wrapperX, wrapperY, wrapperZ] as [number, number, number],
      childWrapperRotation: new THREE.Quaternion() // Identity quaternion for upright
    };
  }, [shapeParams, outline, depth, bevel, scale, headstoneStyle, slantThickness]);

  // 4. Handle Repeats via Texture Matrix (Just like the old version)
  useLayoutEffect(() => {
    if (!dims) return;
    
    const usePhysical = autoRepeat || tileSize != null || sideTileSize != null;
    const faceTile = Math.max(0.001, tileSize ?? 0.1);
    const sideTile = Math.max(0.001, sideTileSize ?? tileSize ?? 0.1);

    const repFaceX = usePhysical ? Math.max(1, dims.worldW / faceTile) : (faceRepeatX ?? 6);
    const repFaceY = usePhysical ? Math.max(1, dims.worldH / faceTile) : (faceRepeatY ?? 6);

    const repSideX = usePhysical 
      ? Math.max(1, (headstoneStyle === 'slant' ? dims.worldW : dims.worldPerim) / sideTile) 
      : (sideRepeatX ?? 8);
    const repSideY = usePhysical ? Math.max(1, dims.worldDepth / sideTile) : (sideRepeatY ?? 1);

    clonedFaceMap.repeat.set(repFaceX, repFaceY);
    clonedSideMap.repeat.set(repSideX, repSideY);
    
    clonedFaceMap.needsUpdate = true;
    clonedSideMap.needsUpdate = true;
    
    if (headstoneStyle === 'slant' && rockNormalTexture) {
      rockNormalTexture.repeat.set(1, 1);
      rockNormalTexture.needsUpdate = true;
    }
  }, [dims, autoRepeat, tileSize, sideTileSize, faceRepeatX, faceRepeatY, sideRepeatX, sideRepeatY, clonedFaceMap, clonedSideMap, headstoneStyle, rockNormalTexture]);

  // 5. Create Materials (FIX: Return data from useMemo, not JSX)
  const materials = useMemo(() => {
    // Polished granite settings - very reflective with crystalline sparkle
    const common = {
      color: new THREE.Color(headstoneStyle === 'slant' ? 0x444444 : 0x555555),
      roughness: headstoneStyle === 'slant' ? 0.08 : 0.08, // Very low for polished granite sparkle (was 0.65/0.12)
      metalness: 0.0,
      side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
      envMapIntensity: headstoneStyle === 'slant' ? 2.0 : 2.5, // Strong reflections for sparkle (was 1.0/2.0)
    };
    
    // For slant headstones, apply rock pitch normal map to side material
    if (headstoneStyle === 'slant' && rockNormalTexture) {
      return [
        new THREE.MeshPhysicalMaterial({ 
          ...common, 
          map: clonedFaceMap,
          clearcoat: 1.0, // Full clearcoat for polish layer
          clearcoatRoughness: 0.05, // Shiny polish finish
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        }),
        new THREE.MeshPhysicalMaterial({ 
          ...common, 
          map: clonedSideMap,
          normalMap: rockNormalTexture,
          normalScale: new THREE.Vector2(2.5, 2.5), // Enhanced for crystalline detail (was 2.0)
          clearcoat: 1.0, // Full clearcoat for polish layer
          clearcoatRoughness: 0.05, // Shiny polish finish
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        })
      ];
    }
    
    return [
      new THREE.MeshPhysicalMaterial({ 
        ...common, 
        map: clonedFaceMap,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05, // Mirror-like polish for granite sparkle
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
      new THREE.MeshPhysicalMaterial({ 
        ...common, 
        map: clonedSideMap,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05, // Mirror-like polish for granite sparkle
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      })
    ];
  }, [clonedFaceMap, clonedSideMap, doubleSided, headstoneStyle, rockNormalTexture]);

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
  
  // Force-apply quaternion to ensure it sticks (R3F prop diffing issue workaround)
  useLayoutEffect(() => {
    if (scaledWrapperRef.current && childWrapperRotation) {
      scaledWrapperRef.current.quaternion.copy(childWrapperRotation);
    }
  }, [childWrapperRotation]);
  
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
  }), [apiData]);

  if (!geometries.length || !dims) return null;

  // Fixed: Position at origin as geometry is already normalized to ground
  // The slantGeometry.translate(-(minX + maxX) / 2, -minY, 0) already positions base at Y=0
  const groupPosition: [number, number, number] = [0, 0, 0];

  // 6. Return JSX (FIX: JSX in return, not useMemo)
  // CRITICAL FIX: Move scale from group to individual meshes to prevent base inheritance
  return (
    <group ref={groupRef} position={groupPosition}>
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
         For slant: Uses quaternion to align local +Z to face normal
         Outer group handles position and quaternion, inner group handles scale
      */}
      <group 
        ref={scaledWrapperRef}
        position={childWrapperPos}
        quaternion={childWrapperRotation}
      >
        {/* Lock children to slant face (prevents billboard/lookAt from standing them up) */}
        {headstoneStyle === 'slant' ? (
          <group position-z={apiData?.frontZ || 0.001}>
            <group renderOrder={10} scale={meshScale}>
               {typeof children === 'function' && children(childApi, selectedAdditions)}
            </group>
          </group>
        ) : (
          <group position-z={apiData?.frontZ || 0}>
            <group renderOrder={10} scale={meshScale}>
               {typeof children === 'function' && children(childApi, selectedAdditions)}
            </group>
          </group>
        )}
      </group>
    </group>
  );
});

SvgHeadstone.displayName = 'SvgHeadstone';

export default SvgHeadstone;
