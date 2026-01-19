/**
 * Bronze Plaque Border Component
 * Renders decorative 3D borders using extruded SVG geometry at plaque scale
 */

'use client';

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { SVGLoader, type SVGResult } from 'three/examples/jsm/loaders/SVGLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface BronzeBorderProps {
  borderName: string | null;
  plaqueWidth: number;
  plaqueHeight: number;
  unitsPerMeter: number;
  frontZ: number;
  color: string;
  depth: number;
}

interface BorderResources {
  geometries: THREE.BufferGeometry[];
  material?: THREE.Material;
}

const BORDER_SLUG_ALIASES: Record<string, string> = {
  bar: 'border1',
  square: 'border2',
  solidoutline: 'border3',
  solid: 'border4',
  notch: 'border5',
  scallop: 'border6',
  roundoutline: 'border7',
  floral: 'border8',
  decorative: 'border9',
  squareangular: 'border10',
};


const BORDER_SCALE = 1.3; // Enlarge decorative border by 30%
const BORDER_THICKNESS_SCALE = 1.5; // Border thickness increased to 150%
const BORDER_RELIEF_SCALE = 0.33; // Border relief depth reduced to 33%
const OVERLAP_BUFFER = 1.0; // Overlap slice by 1mm to prevent visual gaps

// Performance tuning - reducing these values massively improves slice performance during drag
const CURVE_SEGMENTS = 6; // Was 24. 6 is enough for textured metal (~75% fewer triangles)
const BEVEL_SEGMENTS = 1; // Keep minimal bevel

interface BronzeTextures {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

function normalizeGeometry(geometry: THREE.BufferGeometry) {
  let geom = geometry;
  if (geom.index) {
    const nonIndexed = geom.toNonIndexed();
    geom.dispose();
    geom = nonIndexed;
  }

  if (!geom.getAttribute('normal')) {
    geom.computeVertexNormals();
  }

  if (!geom.getAttribute('uv')) {
    const position = geom.getAttribute('position') as THREE.BufferAttribute;
    const uvs = new Float32Array(position.count * 2);
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  }

  geom.computeBoundingBox();
  return geom;
}

/**
 * HIGH PERFORMANCE SLICER
 * Uses TypedArrays directly to avoid Garbage Collection pauses during drag.
 * Eliminates all object allocation inside the loop.
 */
function sliceGeometryAxis(
  geometry: THREE.BufferGeometry, 
  axis: 'x' | 'y', 
  limit: number, 
  keepCondition: 'less' | 'greater'
): THREE.BufferGeometry {
  const posAttr = geometry.getAttribute('position');
  const uvAttr = geometry.getAttribute('uv');
  const normAttr = geometry.getAttribute('normal');
  const count = posAttr.count;

  // Pre-allocate output buffers
  // In worst case (heavy fragmentation), size could grow, but 1.2x is usually safe
  const maxVerts = Math.floor(count * 1.2); 
  
  const outPos = new Float32Array(maxVerts * 3);
  const outUV = new Float32Array(maxVerts * 2);
  const outNorm = new Float32Array(maxVerts * 3);
  
  let vIdx = 0; // Vertex index pointer

  const axisIdx = axis === 'x' ? 0 : 1;
  const isKept = (val: number) => keepCondition === 'less' ? val < limit : val > limit;

  // Temporary registers to avoid object creation
  let ax, ay, az, bx, by, bz, cx, cy, cz;
  let au, av, bu, bv, cu, cv;
  let anx, any, anz, bnx, bny, bnz, cnx, cny, cnz;
  let ka, kb, kc; // keep flags
  let t;

  // Helper to push vertex to buffer
  const pushV = (x:number, y:number, z:number, u:number, v:number, nx:number, ny:number, nz:number) => {
    if (vIdx >= maxVerts) return; // Safety check
    const i3 = vIdx * 3;
    const i2 = vIdx * 2;
    outPos[i3] = x; outPos[i3+1] = y; outPos[i3+2] = z;
    outUV[i2] = u; outUV[i2+1] = v;
    outNorm[i3] = nx; outNorm[i3+1] = ny; outNorm[i3+2] = nz;
    vIdx++;
  };

  // Helper to interpolate and push
  const interpPush = (
    x1:number, y1:number, z1:number, u1:number, v1:number, nx1:number, ny1:number, nz1:number,
    x2:number, y2:number, z2:number, u2:number, v2:number, nx2:number, ny2:number, nz2:number,
    val1:number, val2:number
  ) => {
    t = (limit - val1) / (val2 - val1);
    pushV(
      x1 + (x2-x1)*t, y1 + (y2-y1)*t, z1 + (z2-z1)*t,
      u1 + (u2-u1)*t, v1 + (v2-v1)*t,
      nx1 + (nx2-nx1)*t, ny1 + (ny2-ny1)*t, nz1 + (nz2-nz1)*t
    );
  };

  for (let i = 0; i < count; i += 3) {
    // 1. Load Triangle Data
    ax = posAttr.getX(i);   ay = posAttr.getY(i);   az = posAttr.getZ(i);
    bx = posAttr.getX(i+1); by = posAttr.getY(i+1); bz = posAttr.getZ(i+1);
    cx = posAttr.getX(i+2); cy = posAttr.getY(i+2); cz = posAttr.getZ(i+2);

    ka = isKept(axisIdx === 0 ? ax : ay);
    kb = isKept(axisIdx === 0 ? bx : by);
    kc = isKept(axisIdx === 0 ? cx : cy);

    // Fast Path: All Out
    if (!ka && !kb && !kc) continue;

    // Load attributes only if needed
    au = uvAttr.getX(i);   av = uvAttr.getY(i);
    bu = uvAttr.getX(i+1); bv = uvAttr.getY(i+1);
    cu = uvAttr.getX(i+2); cv = uvAttr.getY(i+2);

    anx = normAttr.getX(i);   any = normAttr.getY(i);   anz = normAttr.getZ(i);
    bnx = normAttr.getX(i+1); bny = normAttr.getY(i+1); bnz = normAttr.getZ(i+1);
    cnx = normAttr.getX(i+2); cny = normAttr.getY(i+2); cnz = normAttr.getZ(i+2);

    // Fast Path: All In
    if (ka && kb && kc) {
      pushV(ax, ay, az, au, av, anx, any, anz);
      pushV(bx, by, bz, bu, bv, bnx, bny, bnz);
      pushV(cx, cy, cz, cu, cv, cnx, cny, cnz);
      continue;
    }

    // Clipping Needed - Determine configuration
    // 1 vertex In cases
    if (ka && !kb && !kc) { 
      // A in, B out, C out (Triangle -> 1 Triangle)
      pushV(ax, ay, az, au, av, anx, any, anz);
      interpPush(ax,ay,az,au,av,anx,any,anz, bx,by,bz,bu,bv,bnx,bny,bnz, axisIdx===0?ax:ay, axisIdx===0?bx:by);
      interpPush(ax,ay,az,au,av,anx,any,anz, cx,cy,cz,cu,cv,cnx,cny,cnz, axisIdx===0?ax:ay, axisIdx===0?cx:cy);
    }
    else if (!ka && kb && !kc) {
      // B in (Rotate B->A)
      pushV(bx, by, bz, bu, bv, bnx, bny, bnz);
      interpPush(bx,by,bz,bu,bv,bnx,bny,bnz, cx,cy,cz,cu,cv,cnx,cny,cnz, axisIdx===0?bx:by, axisIdx===0?cx:cy);
      interpPush(bx,by,bz,bu,bv,bnx,bny,bnz, ax,ay,az,au,av,anx,any,anz, axisIdx===0?bx:by, axisIdx===0?ax:ay);
    }
    else if (!ka && !kb && kc) {
      // C in (Rotate C->A)
      pushV(cx, cy, cz, cu, cv, cnx, cny, cnz);
      interpPush(cx,cy,cz,cu,cv,cnx,cny,cnz, ax,ay,az,au,av,anx,any,anz, axisIdx===0?cx:cy, axisIdx===0?ax:ay);
      interpPush(cx,cy,cz,cu,cv,cnx,cny,cnz, bx,by,bz,bu,bv,bnx,bny,bnz, axisIdx===0?cx:cy, axisIdx===0?bx:by);
    }
    // 2 vertices In cases
    else if (ka && kb && !kc) {
      // A, B in, C out (Quad -> 2 Triangles)
      // Tri 1
      pushV(ax, ay, az, au, av, anx, any, anz);
      pushV(bx, by, bz, bu, bv, bnx, bny, bnz);
      interpPush(bx,by,bz,bu,bv,bnx,bny,bnz, cx,cy,cz,cu,cv,cnx,cny,cnz, axisIdx===0?bx:by, axisIdx===0?cx:cy);
      // Tri 2
      pushV(ax, ay, az, au, av, anx, any, anz);
      interpPush(bx,by,bz,bu,bv,bnx,bny,bnz, cx,cy,cz,cu,cv,cnx,cny,cnz, axisIdx===0?bx:by, axisIdx===0?cx:cy);
      interpPush(ax,ay,az,au,av,anx,any,anz, cx,cy,cz,cu,cv,cnx,cny,cnz, axisIdx===0?ax:ay, axisIdx===0?cx:cy);
    }
    else if (!ka && kb && kc) {
      // B, C in, A out
      // Tri 1
      pushV(bx, by, bz, bu, bv, bnx, bny, bnz);
      pushV(cx, cy, cz, cu, cv, cnx, cny, cnz);
      interpPush(cx,cy,cz,cu,cv,cnx,cny,cnz, ax,ay,az,au,av,anx,any,anz, axisIdx===0?cx:cy, axisIdx===0?ax:ay);
      // Tri 2
      pushV(bx, by, bz, bu, bv, bnx, bny, bnz);
      interpPush(cx,cy,cz,cu,cv,cnx,cny,cnz, ax,ay,az,au,av,anx,any,anz, axisIdx===0?cx:cy, axisIdx===0?ax:ay);
      interpPush(bx,by,bz,bu,bv,bnx,bny,bnz, ax,ay,az,au,av,anx,any,anz, axisIdx===0?bx:by, axisIdx===0?ax:ay);
    }
    else if (ka && !kb && kc) {
      // A, C in, B out
      // Tri 1
      pushV(ax, ay, az, au, av, anx, any, anz);
      interpPush(ax,ay,az,au,av,anx,any,anz, bx,by,bz,bu,bv,bnx,bny,bnz, axisIdx===0?ax:ay, axisIdx===0?bx:by);
      pushV(cx, cy, cz, cu, cv, cnx, cny, cnz);
      // Tri 2
      interpPush(ax,ay,az,au,av,anx,any,anz, bx,by,bz,bu,bv,bnx,bny,bnz, axisIdx===0?ax:ay, axisIdx===0?bx:by);
      interpPush(cx,cy,cz,cu,cv,cnx,cny,cnz, bx,by,bz,bu,bv,bnx,bny,bnz, axisIdx===0?cx:cy, axisIdx===0?bx:by);
      pushV(cx, cy, cz, cu, cv, cnx, cny, cnz);
    }
  }

  const newGeom = new THREE.BufferGeometry();
  // Trim arrays to actual used size
  newGeom.setAttribute('position', new THREE.BufferAttribute(outPos.slice(0, vIdx * 3), 3));
  newGeom.setAttribute('uv', new THREE.BufferAttribute(outUV.slice(0, vIdx * 2), 2));
  newGeom.setAttribute('normal', new THREE.BufferAttribute(outNorm.slice(0, vIdx * 3), 3));
  
  return newGeom;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function shiftLuminance(hex: string, delta: number) {
  const color = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  const next = new THREE.Color();
  next.setHSL(hsl.h, clamp01(hsl.s + delta * 0.15), clamp01(hsl.l + delta));
  return `#${next.getHexString()}`;
}

function createBronzeTextures(baseHex: string): BronzeTextures | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = mapCanvas.height = 512;
  const mapCtx = mapCanvas.getContext('2d');
  if (!mapCtx) return null;

  const gradient = mapCtx.createLinearGradient(0, 0, 0, mapCanvas.height);
  gradient.addColorStop(0, shiftLuminance(baseHex, 0.2));
  gradient.addColorStop(0.45, shiftLuminance(baseHex, 0.08));
  gradient.addColorStop(0.6, baseHex);
  gradient.addColorStop(1, shiftLuminance(baseHex, -0.2));
  mapCtx.fillStyle = gradient;
  mapCtx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);

  mapCtx.globalAlpha = 0.08;
  mapCtx.strokeStyle = 'rgba(255,255,255,0.6)';
  for (let y = 0; y < mapCanvas.height; y += 2) {
    mapCtx.beginPath();
    const jitter = Math.random() * 1.5;
    mapCtx.moveTo(0, y + jitter);
    mapCtx.lineTo(mapCanvas.width, y + Math.random() * 1.5);
    mapCtx.stroke();
  }
  mapCtx.globalAlpha = 0.12;
  mapCtx.strokeStyle = 'rgba(0,0,0,0.4)';
  for (let y = 1; y < mapCanvas.height; y += 3) {
    mapCtx.beginPath();
    mapCtx.moveTo(0, y + Math.random());
    mapCtx.lineTo(mapCanvas.width, y + Math.random());
    mapCtx.stroke();
  }

  const mapTexture = new THREE.CanvasTexture(mapCanvas);
  mapTexture.wrapS = mapTexture.wrapT = THREE.RepeatWrapping;
  mapTexture.anisotropy = 8;
  mapTexture.needsUpdate = true;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = roughCanvas.height = 256;
  const roughCtx = roughCanvas.getContext('2d');
  if (!roughCtx) {
    return {
      map: mapTexture,
      roughnessMap: mapTexture.clone() as THREE.CanvasTexture,
    };
  }
  const roughData = roughCtx.createImageData(roughCanvas.width, roughCanvas.height);
  for (let i = 0; i < roughData.data.length; i += 4) {
    const shade = 130 + Math.random() * 90;
    roughData.data[i] = roughData.data[i + 1] = roughData.data[i + 2] = shade;
    roughData.data[i + 3] = 255;
  }
  roughCtx.putImageData(roughData, 0, 0);
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.anisotropy = 4;
  roughnessMap.needsUpdate = true;

  return { map: mapTexture, roughnessMap };
}

export function BronzeBorder({
  borderName,
  plaqueWidth,
  plaqueHeight,
  unitsPerMeter,
  frontZ,
  color,
  depth,
}: BronzeBorderProps) {
  const unitScale = Math.max(1e-6, Math.abs(unitsPerMeter) || 1);
  const localWidth = Math.max(1e-3, Math.abs(plaqueWidth) * unitScale);
  const localHeight = Math.max(1e-3, Math.abs(plaqueHeight) * unitScale);

  const normalizedName = borderName?.toLowerCase() ?? '';
  const effectiveName = normalizedName.includes('no border') ? null : borderName;
  const slug = effectiveName ? toBorderSlug(effectiveName) : null;
  const resolvedSlug = slug ? `${slug}a` : null;
  const usesIntegratedRails = Boolean(resolvedSlug);
  const shouldRender = Boolean(resolvedSlug && localWidth > 0 && localHeight > 0);

  const bronzeTextures = useMemo(() => createBronzeTextures(color), [color]);

  useEffect(() => {
    return () => {
      bronzeTextures?.map.dispose();
      bronzeTextures?.roughnessMap.dispose();
    };
  }, [bronzeTextures]);

  const [svgData, setSvgData] = useState<SVGResult | null>(null);
  const [borderGroup, setBorderGroup] = useState<THREE.Group | null>(null);

  const resourcesRef = useRef<BorderResources | null>(null);
  const svgCacheRef = useRef<Record<string, SVGResult>>({});
  const groupRef = useRef<THREE.Group>(null);

  // Debounce state for performance optimization
  const [debouncedDims, setDebouncedDims] = useState({ w: localWidth, h: localHeight });
  const [isResizing, setIsResizing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const disposeResources = useCallback(() => {
    if (!resourcesRef.current) return;
    resourcesRef.current.geometries.forEach((geom) => geom.dispose());
    resourcesRef.current.material?.dispose();
    resourcesRef.current = null;
  }, []);

  useEffect(() => disposeResources, [disposeResources]);

  // Handle Resize Debouncing (Fast Path: scale, Slow Path: rebuild geometry)
  useEffect(() => {
    setIsResizing(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // While resizing, we just scale the group (handled in next useEffect)
    // We only trigger a full geometry rebuild after 150ms of silence
    timeoutRef.current = setTimeout(() => {
      setDebouncedDims({ w: localWidth, h: localHeight });
      setIsResizing(false);
    }, 150);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [localWidth, localHeight]);

  // Visual scaling during resize (Fast Path)
  useEffect(() => {
    if (groupRef.current && isResizing && debouncedDims.w > 0 && debouncedDims.h > 0) {
      // Approximate scaling to keep the border visually responsive
      // This distorts the geometry slightly during drag, but keeps 60fps
      const currentScaleX = localWidth / debouncedDims.w;
      const currentScaleY = localHeight / debouncedDims.h;
      groupRef.current.scale.set(currentScaleX, currentScaleY, 1);
    } else if (groupRef.current && !isResizing) {
      // Reset scale when geometry is rebuilt
      groupRef.current.scale.set(1, 1, 1);
    }
  }, [localWidth, localHeight, isResizing, debouncedDims]);

  useEffect(() => {
    if (!resolvedSlug) {
      setSvgData(null);
      return;
    }

    if (svgCacheRef.current[resolvedSlug]) {
      setSvgData(svgCacheRef.current[resolvedSlug]);
      return;
    }

    let cancelled = false;
    const loader = new SVGLoader();

    loader.load(
      `/shapes/borders/${resolvedSlug}.svg`,
      (data) => {
        if (cancelled) return;
        svgCacheRef.current[resolvedSlug] = data;
        setSvgData(data);
      },
      undefined,
      (error) => {
        if (cancelled) return;
        console.warn(`Failed to load border SVG ${resolvedSlug}`, error);
        setSvgData(null);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [resolvedSlug]);

  useEffect(() => {
    if (!shouldRender || !svgData) {
      disposeResources();
      setBorderGroup(null);
      return;
    }

    // HEAVY COMPUTATION - Only runs when debouncedDims changes (user stops dragging)
    const built = buildBorderGroup(svgData, {
      plaqueWidth: debouncedDims.w,
      plaqueHeight: debouncedDims.h,
      depth,
      color,
      frontZ,
      textures: bronzeTextures ?? undefined,
      integratedRails: usesIntegratedRails,
    });

    if (!built) {
      disposeResources();
      setBorderGroup(null);
      return;
    }

    disposeResources();
    resourcesRef.current = {
      geometries: built.geometries,
      material: built.material,
    };
    setBorderGroup(built.group);
  }, [svgData, shouldRender, debouncedDims, depth, color, frontZ, bronzeTextures, disposeResources, usesIntegratedRails]);

  if (!borderGroup) {
    return null;
  }

  return <primitive object={borderGroup} ref={groupRef} />;
}

function toBorderSlug(name: string) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const alias = BORDER_SLUG_ALIASES[normalized];
  if (alias) {
    return alias;
  }
  const match = name.match(/\d+/);
  if (match) {
    return `border${match[0]}`;
  }
  return normalized || 'border1';
}

function buildBorderGroup(
  data: SVGResult,
  params: {
    plaqueWidth: number;
    plaqueHeight: number;
    depth: number;
    color: string;
    frontZ: number;
    textures?: BronzeTextures;
    integratedRails?: boolean;
  },
): {
  group: THREE.Group;
  geometries: THREE.BufferGeometry[];
  material: THREE.MeshStandardMaterial;
} | null {
  const { plaqueWidth, plaqueHeight, depth, color, frontZ, textures, integratedRails = false } = params;
  const width = Math.max(1e-3, Math.abs(plaqueWidth));
  const height = Math.max(1e-3, Math.abs(plaqueHeight));

  const reliefDepthBase = Math.max(0.001, Math.min(width, height) * 0.003);
  const reliefDepth = reliefDepthBase * BORDER_RELIEF_SCALE;
  const extrudeSettings = {
    depth: reliefDepth,
    bevelEnabled: true,
    bevelSegments: BEVEL_SEGMENTS,
    bevelSize: reliefDepth * 0.35,
    bevelThickness: reliefDepth * 0.35,
    steps: 1,
    curveSegments: CURVE_SEGMENTS,
  } satisfies THREE.ExtrudeGeometryOptions;

  const tempGeometries: THREE.BufferGeometry[] = [];

  for (const path of data.paths) {
    const shapes = SVGLoader.createShapes(path);
    for (const shape of shapes) {
      if (!shape.curves.length) continue;
      const raw = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const geom = normalizeGeometry(raw);
      tempGeometries.push(geom);
    }
  }

  if (!tempGeometries.length || tempGeometries.some((geom) => !geom.getAttribute('position'))) {
    tempGeometries.forEach((geom) => geom.dispose());
    return null;
  }

  const merged = mergeGeometries(tempGeometries, false);
  if (!merged) {
    tempGeometries.forEach((geom) => geom.dispose());
    return null;
  }

  merged.computeBoundingBox();
  const centeredBounds = merged.boundingBox;
  if (!centeredBounds) {
    merged.dispose();
    tempGeometries.forEach((geom) => geom.dispose());
    return null;
  }

  const originalWidth = Math.max(1e-3, centeredBounds.max.x - centeredBounds.min.x);
  const originalHeight = Math.max(1e-3, centeredBounds.max.y - centeredBounds.min.y);
  const centerX = (centeredBounds.min.x + centeredBounds.max.x) / 2;
  const centerY = (centeredBounds.min.y + centeredBounds.max.y) / 2;

  merged.translate(-centerX, -centerY, 0);

  // Calculate line thickness first so we can match corner size to it
  const edgeThicknessBase = Math.max(0.01, Math.min(width, height) * 0.02 * BORDER_SCALE);
  const edgeThickness = edgeThicknessBase * BORDER_THICKNESS_SCALE;
  const lineThickness = edgeThickness * 0.4;
  const lineGap = lineThickness * 0.6;

  // Scale decorative corner detail. Integrated rail SVGs should stretch to full width/height.
  if (integratedRails) {
    const uniformScale = Math.min(width / originalWidth, height / originalHeight);
    merged.scale(uniformScale, uniformScale, 1);
  } else {
    const targetCornerSpan = Math.max(lineThickness * 6, Math.min(width, height) * 0.25);
    const baseScale = (targetCornerSpan / Math.max(originalWidth, originalHeight)) * 0.7;
    merged.scale(baseScale, baseScale, 1);
  }
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  const scaledBounds = merged.boundingBox!;
  const cornerSpanX = scaledBounds.max.x - scaledBounds.min.x;
  const cornerSpanY = scaledBounds.max.y - scaledBounds.min.y;

  const textureRepeatX = Math.max(1, width / 120);
  const textureRepeatY = Math.max(1, height / 120);

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: 0.95,
    roughness: 0.28,
    envMapIntensity: 1.5,
    clearcoat: 0.7,
    clearcoatRoughness: 0.18,
    side: THREE.DoubleSide,
  });

  // NOTE: Clipping planes are set per-corner below in createCornerMesh
  material.clippingPlanes = [];

  if (textures?.map) {
    textures.map.repeat.set(textureRepeatX, textureRepeatY);
    textures.map.needsUpdate = true;
    material.map = textures.map;
  }

  if (textures?.roughnessMap) {
    textures.roughnessMap.repeat.set(textureRepeatX, textureRepeatY);
    textures.roughnessMap.needsUpdate = true;
    material.roughnessMap = textures.roughnessMap;
  }

  let topEdgeStartX: number | null = null;
  let topEdgeEndX: number | null = null;
  let bottomEdgeStartX: number | null = null;
  let bottomEdgeEndX: number | null = null;
  let topInnerEdgeY: number | null = null;
  let bottomInnerEdgeY: number | null = null;
  let leftEdgeTopInnerY: number | null = null;
  let leftEdgeBottomInnerY: number | null = null;
  let rightEdgeTopInnerY: number | null = null;
  let rightEdgeBottomInnerY: number | null = null;
  let leftInnerEdgeX: number | null = null;
  let rightInnerEdgeX: number | null = null;

  const group = new THREE.Group();
  const resourceGeometries: THREE.BufferGeometry[] = [];
  const SURFACE_Z = frontZ + 0.0001;
  const cornerParts: THREE.BufferGeometry[] = []; // Separate corners for clipping
  const railParts: THREE.BufferGeometry[] = [];   // Rails don't need clipping
  const lineAnchors = {
    top: null as [number, number] | null,
    bottom: null as [number, number] | null,
    left: null as [number, number] | null,
    right: null as [number, number] | null,
  };

  const axisTolerance = Math.max(width, height) * 0.0005;

  const extractUniqueAxisValues = (geom: THREE.BufferGeometry, axis: 'x' | 'y') => {
    const attr = geom.getAttribute('position') as THREE.BufferAttribute;
    const values: number[] = [];
    for (let i = 0; i < attr.count; i += 1) {
      values.push(axis === 'x' ? attr.getX(i) : attr.getY(i));
    }
    values.sort((a, b) => a - b);
    const uniques: number[] = [];
    for (const value of values) {
      if (!uniques.length || Math.abs(uniques[uniques.length - 1] - value) > axisTolerance) {
        uniques.push(value);
      }
    }
    return uniques;
  };

  const captureAnchors = (
    geom: THREE.BufferGeometry,
    alignX: 'left' | 'right',
    alignY: 'top' | 'bottom',
  ) => {
    const toPair = (values: number[], reverse = false): [number, number] | null => {
      if (!values.length) {
        return null;
      }
      const list = reverse ? [...values].reverse() : values;
      if (list.length === 1) {
        return [list[0], list[0]];
      }
      return [list[0], list[1]];
    };

    const yValues = extractUniqueAxisValues(geom, 'y');
    if (alignY === 'top' && !lineAnchors.top) {
      const anchors = toPair(yValues.slice(-2), true);
      if (anchors) {
        lineAnchors.top = anchors;
      }
    }
    if (alignY === 'bottom' && !lineAnchors.bottom) {
      const anchors = toPair(yValues.slice(0, 2));
      if (anchors) {
        lineAnchors.bottom = anchors;
      }
    }

    const xValues = extractUniqueAxisValues(geom, 'x');
    if (alignX === 'left' && !lineAnchors.left) {
      const anchors = toPair(xValues.slice(0, 2));
      if (anchors) {
        lineAnchors.left = anchors;
      }
    }
    if (alignX === 'right' && !lineAnchors.right) {
      const anchors = toPair(xValues.slice(-2), true);
      if (anchors) {
        lineAnchors.right = anchors;
      }
    }
  };

  const createCornerMesh = (
    source: THREE.BufferGeometry,
    alignX: 'left' | 'right',
    alignY: 'top' | 'bottom',
  ) => {
    let geom = source.clone();
    
    // 1. Flip for Orientation
    const flipX = alignX === 'right';
    const flipY = alignY === 'top';
    if (flipX) geom.scale(-1, 1, 1);
    if (flipY) geom.scale(1, -1, 1);
    
    // FIX: Correct winding order if geometry was inverted (asymmetrical flip)
    // This fixes the "dark/grey" lighting issue on one side of the plaque
    if (flipX !== flipY) {
      const pos = geom.getAttribute('position');
      // Swap vertices 2 and 3 of each triangle to flip winding order
      for (let i = 0; i < pos.count; i += 3) {
        const x2 = pos.getX(i + 1), y2 = pos.getY(i + 1), z2 = pos.getZ(i + 1);
        const x3 = pos.getX(i + 2), y3 = pos.getY(i + 2), z3 = pos.getZ(i + 2);
        pos.setXYZ(i + 1, x3, y3, z3);
        pos.setXYZ(i + 2, x2, y2, z2);
      }
    }
    
    // Ensure non-indexed for slicing
    geom = normalizeGeometry(geom);

    // 2. Position Geometry at Corner
    geom.computeBoundingBox();
    const bounds = geom.boundingBox!;
    const posX = alignX === 'left' ? -width / 2 - bounds.min.x : width / 2 - bounds.max.x;
    const posY = alignY === 'top' ? height - bounds.max.y : 0 - bounds.min.y;
    
    geom.translate(posX, posY, SURFACE_Z);
    
    // Regenerate UVs based on final world position to ensure uniform texture gradient
    const posAttr = geom.getAttribute('position');
    const uvs = geom.getAttribute('uv');
    for (let i = 0; i < posAttr.count; i++) {
        uvs.setXY(i, posAttr.getX(i), posAttr.getY(i));
    }
    uvs.needsUpdate = true;

    // 3. Slice Geometry to Prevent Overlap (Geometric Masking)
    // Plaque coordinate system: X: -width/2 to width/2 (center at 0), Y: 0 to height (center at height/2)
    // Cut logic based on quadrants:
    // Optimized Slicing with overlap buffer to prevent gaps
    // We add OVERLAP_BUFFER to the limit to ensure slight overlap at seams
    
    // X Slice
    if (alignX === 'left') {
      // Keep x < +buffer (left side with overlap)
      geom = sliceGeometryAxis(geom, 'x', OVERLAP_BUFFER, 'less');
    } else {
      // Keep x > -buffer (right side with overlap)
      geom = sliceGeometryAxis(geom, 'x', -OVERLAP_BUFFER, 'greater');
    }

    // Y Slice
    if (alignY === 'top') {
      // Keep y > center - buffer (top half with overlap)
      geom = sliceGeometryAxis(geom, 'y', (height / 2) - OVERLAP_BUFFER, 'greater');
    } else {
      // Keep y < center + buffer (bottom half with overlap)
      geom = sliceGeometryAxis(geom, 'y', (height / 2) + OVERLAP_BUFFER, 'less');
    }

    // Recompute normals after all manipulations
    geom.computeVertexNormals();
    
    captureAnchors(geom, alignX, alignY);
    cornerParts.push(geom);
  };

  createCornerMesh(merged, 'left', 'top');
  createCornerMesh(merged, 'right', 'top');
  createCornerMesh(merged, 'left', 'bottom');
  createCornerMesh(merged, 'right', 'bottom');

  const fallbackTopStartX = -width / 2 + cornerSpanX;
  const fallbackTopEndX = width / 2 - cornerSpanX;
  const fallbackBottomStartX = fallbackTopStartX;
  const fallbackBottomEndX = fallbackTopEndX;
  const fallbackTopInnerY = height - cornerSpanY;
  const fallbackBottomInnerY = cornerSpanY;
  const fallbackLeftTopInnerY = fallbackTopInnerY;
  const fallbackLeftBottomInnerY = fallbackBottomInnerY;
  const fallbackRightTopInnerY = fallbackTopInnerY;
  const fallbackRightBottomInnerY = fallbackBottomInnerY;
  const fallbackLeftInnerX = -width / 2 + cornerSpanX;
  const fallbackRightInnerX = width / 2 - cornerSpanX;

  const clampEdgeXValue = (value: number | null) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    return Math.min(width / 2, Math.max(-width / 2, value));
  };

  const clampEdgeYValue = (value: number | null) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    return Math.min(height, Math.max(0, value));
  };


  const sortedFallbackTop: readonly [number, number] = [
    Math.min(fallbackTopStartX, fallbackTopEndX),
    Math.max(fallbackTopStartX, fallbackTopEndX),
  ];
  const sortedFallbackBottom: readonly [number, number] = [
    Math.min(fallbackBottomStartX, fallbackBottomEndX),
    Math.max(fallbackBottomStartX, fallbackBottomEndX),
  ];

  const resolveSpan = (
    start: number | null,
    end: number | null,
    fallback: readonly [number, number],
  ): readonly [number, number] => {
    if (start == null || end == null) {
      return fallback;
    }
    const left = Math.min(start, end);
    const right = Math.max(start, end);
    if (!Number.isFinite(left) || !Number.isFinite(right) || right - left < lineThickness * 1.25) {
      return fallback;
    }
    return [left, right] as const;
  };

  const [topStartX, topEndX] = resolveSpan(
    clampEdgeXValue(topEdgeStartX),
    clampEdgeXValue(topEdgeEndX),
    sortedFallbackTop,
  );
  const [bottomStartX, bottomEndX] = resolveSpan(
    clampEdgeXValue(bottomEdgeStartX),
    clampEdgeXValue(bottomEdgeEndX),
    sortedFallbackBottom,
  );

  const resolvedTopInnerY = clampEdgeYValue(topInnerEdgeY) ?? fallbackTopInnerY;
  const resolvedBottomInnerY = clampEdgeYValue(bottomInnerEdgeY) ?? fallbackBottomInnerY;
  const leftTopY = clampEdgeYValue(leftEdgeTopInnerY) ?? fallbackLeftTopInnerY;
  const leftBottomY = clampEdgeYValue(leftEdgeBottomInnerY) ?? fallbackLeftBottomInnerY;
  const rightTopY = clampEdgeYValue(rightEdgeTopInnerY) ?? fallbackRightTopInnerY;
  const rightBottomY = clampEdgeYValue(rightEdgeBottomInnerY) ?? fallbackRightBottomInnerY;
  const resolvedLeftInnerX = clampEdgeXValue(leftInnerEdgeX) ?? fallbackLeftInnerX;
  const resolvedRightInnerX = clampEdgeXValue(rightInnerEdgeX) ?? fallbackRightInnerX;

  const clampSpan = (value: number) => Math.max(lineThickness * 2, Math.max(0.001, value));

  const topSpan = clampSpan(topEndX - topStartX);
  const bottomSpan = clampSpan(bottomEndX - bottomStartX);
  const sortedLeftTopY = Math.max(leftTopY, leftBottomY);
  const sortedLeftBottomY = Math.min(leftTopY, leftBottomY);
  const sortedRightTopY = Math.max(rightTopY, rightBottomY);
  const sortedRightBottomY = Math.min(rightTopY, rightBottomY);
  const leftSpan = clampSpan(sortedLeftTopY - sortedLeftBottomY);
  const rightSpan = clampSpan(sortedRightTopY - sortedRightBottomY);

  const topCenterX = (topStartX + topEndX) / 2;
  const bottomCenterX = (bottomStartX + bottomEndX) / 2;
  const leftCenterY = (sortedLeftTopY + sortedLeftBottomY) / 2;
  const rightCenterY = (sortedRightTopY + sortedRightBottomY) / 2;

  const addEdgeBar = (geom: THREE.BufferGeometry, x: number, y: number) => {
    const part = geom.clone().toNonIndexed();
    part.translate(x, y, SURFACE_Z);
    railParts.push(part); // Add to rails, not borderParts
  };

  if (!integratedRails) {
    const clampY = (value: number) => Math.min(height, Math.max(0, value));
    const clampX = (value: number) => Math.min(width / 2, Math.max(-width / 2, value));

    const topLineY = clampY(resolvedTopInnerY);
    const bottomLineY = clampY(resolvedBottomInnerY);
    const leftLineX = clampX(resolvedLeftInnerX);
    const rightLineX = clampX(resolvedRightInnerX);

    const resolveAnchors = (
      anchors: [number, number] | null,
      fallbackOuter: number,
      fallbackInner: number,
    ): [number, number] => {
      if (anchors) {
        return anchors;
      }
      return [fallbackOuter, fallbackInner];
    };

    const [topOuterCenterY, topInnerCenterY] = resolveAnchors(
      lineAnchors.top,
      clampY(topLineY + lineThickness / 2),
      clampY(topLineY + lineThickness / 2 - (lineThickness + lineGap)),
    );
    const [bottomOuterCenterY, bottomInnerCenterY] = resolveAnchors(
      lineAnchors.bottom,
      clampY(bottomLineY - lineThickness / 2),
      clampY(bottomLineY - lineThickness / 2 + (lineThickness + lineGap)),
    );
    const [leftOuterCenterX, leftInnerCenterX] = resolveAnchors(
      lineAnchors.left,
      clampX(leftLineX - lineThickness / 2),
      clampX(leftLineX - lineThickness / 2 + (lineThickness + lineGap)),
    );
    const [rightOuterCenterX, rightInnerCenterX] = resolveAnchors(
      lineAnchors.right,
      clampX(rightLineX + lineThickness / 2),
      clampX(rightLineX + lineThickness / 2 - (lineThickness + lineGap)),
    );

    /**
     * Create decorative rails using simple dual-line pattern
     * This mimics the legacy 2D system which used repeating bitmap fills
     */
    const createDecorativeRails = (
      length: number,
      orientation: 'horizontal' | 'vertical'
    ): THREE.BufferGeometry[] => {
      const rails: THREE.BufferGeometry[] = [];
      
      // Create two parallel lines with a gap (matching legacy visual style)
      const outerLine = orientation === 'horizontal' ?
        new THREE.BoxGeometry(length, lineThickness, reliefDepth) :
        new THREE.BoxGeometry(lineThickness, length, reliefDepth);
      outerLine.translate(0, 0, reliefDepth / 2);
      rails.push(outerLine);
      
      const innerLine = orientation === 'horizontal' ?
        new THREE.BoxGeometry(length, lineThickness, reliefDepth) :
        new THREE.BoxGeometry(lineThickness, length, reliefDepth);
      innerLine.translate(0, 0, reliefDepth / 2);
      rails.push(innerLine);
      
      return rails;
    };

    // Create rails for each edge
    const topRails = createDecorativeRails(topSpan, 'horizontal');
    const bottomRails = createDecorativeRails(bottomSpan, 'horizontal');
    const leftRails = createDecorativeRails(leftSpan, 'vertical');
    const rightRails = createDecorativeRails(rightSpan, 'vertical');

    addEdgeBar(topRails[0], topCenterX, topOuterCenterY);
    addEdgeBar(topRails[1], topCenterX, topInnerCenterY);
    resourceGeometries.push(...topRails);

    addEdgeBar(bottomRails[0], bottomCenterX, bottomOuterCenterY);
    addEdgeBar(bottomRails[1], bottomCenterX, bottomInnerCenterY);
    resourceGeometries.push(...bottomRails);

    addEdgeBar(leftRails[0], leftOuterCenterX, leftCenterY);
    addEdgeBar(leftRails[1], leftInnerCenterX, leftCenterY);
    resourceGeometries.push(...leftRails);

    addEdgeBar(rightRails[0], rightOuterCenterX, rightCenterY);
    addEdgeBar(rightRails[1], rightInnerCenterX, rightCenterY);
    resourceGeometries.push(...rightRails);
  }

  // Merge all corner geometries
  if (cornerParts.length > 0) {
    const mergedCorners = mergeGeometries(cornerParts, false);
    cornerParts.forEach(g => g.dispose());
    
    if (mergedCorners) {
      const mesh = new THREE.Mesh(mergedCorners, material);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.renderOrder = 3;
      group.add(mesh);
      resourceGeometries.push(mergedCorners);
    }
  }

  merged.dispose();

  return {
    group,
    geometries: resourceGeometries,
    material,
  };
}
