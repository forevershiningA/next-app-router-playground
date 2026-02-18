/**
 * Bronze Plaque Border Component
 * Renders decorative 3D borders using extruded SVG geometry at plaque scale
 */

'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
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
}

type ScratchType = 'pos' | 'uv' | 'norm';

const sliceScratchBuffers: Record<ScratchType, Float32Array> = {
  pos: new Float32Array(0),
  uv: new Float32Array(0),
  norm: new Float32Array(0),
};

function ensureScratchCapacity(type: ScratchType, required: number) {
  const current = sliceScratchBuffers[type];
  if (current.length >= required) {
    return current;
  }
  let nextSize = current.length || 1;
  while (nextSize < required) {
    nextSize *= 2;
  }
  sliceScratchBuffers[type] = new Float32Array(nextSize);
  return sliceScratchBuffers[type];
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


const BORDER_SCALE = 0.75; // Smaller decorative border for compact plaques
const BORDER_THICKNESS_SCALE = 1.5; // Border thickness increased to 150%
const BORDER_RELIEF_SCALE = 0.33; // Border relief depth reduced to 33%
const OVERLAP_BUFFER = 1.0; // Overlap slice by 1mm to prevent visual gaps

// Performance tuning - reducing these values massively improves slice performance during drag
const CURVE_SEGMENTS = 6; // Was 24. 6 is enough for textured metal (~75% fewer triangles)
const BEVEL_SEGMENTS = 1; // Keep minimal bevel
const UNIT_BOX_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);

function buildScaledBoxGeometry(width: number, height: number, depth: number) {
  const geom = UNIT_BOX_GEOMETRY.clone();
  geom.scale(width, height, depth);
  geom.translate(0, 0, depth / 2);
  return geom;
}

interface BronzeTextures {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

interface BuiltState {
  group: THREE.Group | null;
  dims: { w: number; h: number };
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
  const maxVerts = Math.max(1, Math.floor(count * 1.2)); 
  
  const outPos = ensureScratchCapacity('pos', maxVerts * 3);
  const outUV = ensureScratchCapacity('uv', maxVerts * 2);
  const outNorm = ensureScratchCapacity('norm', maxVerts * 3);
  
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
  const [builtState, setBuiltState] = useState<BuiltState>({ group: null, dims: { w: localWidth, h: localHeight } });

  const resourcesRef = useRef<BorderResources | null>(null);
  const svgCacheRef = useRef<Record<string, SVGResult>>({});
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  const getMaterial = useCallback(() => {
    if (!materialRef.current) {
      materialRef.current = new THREE.MeshPhysicalMaterial({
        metalness: 0.95,
        roughness: 0.28,
        envMapIntensity: 1.5,
        clearcoat: 0.7,
        clearcoatRoughness: 0.18,
        side: THREE.DoubleSide,
        clippingPlanes: [],
      });
    }
    return materialRef.current;
  }, []);

  // Debounce state for performance optimization
  const [debouncedDims, setDebouncedDims] = useState({ w: localWidth, h: localHeight });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const disposeResources = useCallback(() => {
    if (!resourcesRef.current) return;
    resourcesRef.current.geometries.forEach((geom) => geom.dispose());
    resourcesRef.current = null;
  }, []);

  useEffect(() => disposeResources, [disposeResources]);

  useEffect(() => {
    const material = getMaterial();
    material.color.set(color);
  }, [color, getMaterial]);

  useEffect(() => {
    const material = getMaterial();
    material.map = bronzeTextures?.map ?? null;
    material.roughnessMap = bronzeTextures?.roughnessMap ?? null;
    material.needsUpdate = true;
  }, [bronzeTextures, getMaterial]);

  useEffect(() => () => {
    materialRef.current?.dispose();
    materialRef.current = null;
  }, []);

  // Handle Resize Debouncing (Fast Path: scale, Slow Path: rebuild geometry)
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setDebouncedDims({ w: localWidth, h: localHeight });
    }, 150);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [localWidth, localHeight]);

  useLayoutEffect(() => {
    if (!groupRef.current || !builtState.group) return;
    const { w, h } = builtState.dims;
    const safeW = w || 1;
    const safeH = h || 1;
    groupRef.current.scale.set(localWidth / safeW, localHeight / safeH, 1);
  }, [localWidth, localHeight, builtState]);

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
      setBuiltState({ group: null, dims: { w: localWidth, h: localHeight } });
      return;
    }

    const material = getMaterial();

    const built = buildBorderGroup(svgData, {
      plaqueWidth: debouncedDims.w,
      plaqueHeight: debouncedDims.h,
      depth,
      frontZ,
      unitScale,
      textures: bronzeTextures ?? undefined,
      integratedRails: usesIntegratedRails,
      material,
      borderSlug: resolvedSlug,
    });

    if (!built) {
      disposeResources();
      setBuiltState({ group: null, dims: { w: debouncedDims.w, h: debouncedDims.h } });
      return;
    }

    disposeResources();
    resourcesRef.current = {
      geometries: built.geometries,
    };
    setBuiltState({ group: built.group, dims: { w: debouncedDims.w, h: debouncedDims.h } });
  }, [svgData, shouldRender, debouncedDims, depth, frontZ, bronzeTextures, disposeResources, usesIntegratedRails, getMaterial, localWidth, localHeight, resolvedSlug]);

  if (!builtState.group) {
    return null;
  }

  return <primitive object={builtState.group} ref={groupRef} />;
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
    frontZ: number;
    unitScale?: number;
    textures?: BronzeTextures;
    integratedRails?: boolean;
    material: THREE.MeshPhysicalMaterial;
    borderSlug?: string | null;
  },
): {
  group: THREE.Group;
  geometries: THREE.BufferGeometry[];
} | null {
  const {
    plaqueWidth,
    plaqueHeight,
    depth,
    frontZ,
    unitScale,
    textures,
    integratedRails = false,
    material,
    borderSlug,
  } = params;
  const safeUnitScale = Math.max(1e-6, unitScale ?? 1);
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

  const minDimension = Math.max(1e-3, Math.min(width, height));
  const maxDimension = Math.max(width, height);
  const minDimensionMm = Math.max(1, (minDimension / safeUnitScale) * 1000);
  const maxDimensionMm = Math.max(minDimensionMm, (maxDimension / safeUnitScale) * 1000);
  const aspectRatio = minDimensionMm / Math.max(1, maxDimensionMm);
  let squareScale = 1;
  if (aspectRatio >= 0.95) squareScale = 0.35;
  else if (aspectRatio >= 0.9) squareScale = 0.5;
  else if (aspectRatio >= 0.8) squareScale = 0.7;

  const sizeCompression = Math.min(1, minDimensionMm / 500);
  const borderScaleFactor = BORDER_SCALE * squareScale * sizeCompression;

  // Calculate line thickness first so we can match corner size to it (work in mm then convert back)
  const edgeThicknessMmBase = Math.max(1.5, minDimensionMm * 0.012 * borderScaleFactor);
  const edgeThickness = Math.max(
    0.0005 * safeUnitScale,
    (edgeThicknessMmBase / 1000) * safeUnitScale * (BORDER_THICKNESS_SCALE * (0.45 + 0.25 * sizeCompression)),
  );
  const lineThicknessMm = Math.max(0.9, edgeThicknessMmBase * (0.18 + 0.22 * sizeCompression));
  const lineThickness = Math.max(0.00025 * safeUnitScale, (lineThicknessMm / 1000) * safeUnitScale);
  const lineGapMm = Math.max(0.6, lineThicknessMm * (0.2 + 0.12 * sizeCompression));
  const lineGap = Math.max(0.00015 * safeUnitScale, (lineGapMm / 1000) * safeUnitScale);

  // Scale decorative corner detail. Integrated rail SVGs should stretch to full width/height.
  const INTEGRATED_SCALE_OVERRIDES: Record<string, number> = {
    border1a: 4,
  };

  if (integratedRails) {
    let uniformScale = Math.min(width / originalWidth, height / originalHeight);
    if (borderSlug && INTEGRATED_SCALE_OVERRIDES[borderSlug]) {
      const rawOverride = INTEGRATED_SCALE_OVERRIDES[borderSlug];
      const smallPlaqueFactor = clamp01((minDimensionMm - 320) / 480);
      const lerpedOverride = THREE.MathUtils.lerp(1, rawOverride, smallPlaqueFactor);
      uniformScale *= lerpedOverride;
    }
    uniformScale *= 2.5;
    merged.scale(uniformScale, uniformScale, 1);
  } else {
    const targetCornerSpanMm = Math.max(lineThicknessMm * 4, minDimensionMm * 0.16 * borderScaleFactor);
    const targetCornerSpan = (targetCornerSpanMm / 1000) * safeUnitScale;
    const baseScale = (targetCornerSpan / Math.max(originalWidth, originalHeight)) * 0.65;
    merged.scale(baseScale, baseScale, 1);
  }
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  let scaledBounds = merged.boundingBox!;

  if (integratedRails && borderSlug !== 'border1a' && width > 0 && height > 0) {
    const coverageX = (scaledBounds.max.x - scaledBounds.min.x) / width;
    const coverageY = (scaledBounds.max.y - scaledBounds.min.y) / height;
    const coverageLerp = clamp01((minDimensionMm - 320) / 520);
    const minTargetCoverage = 0.78;
    const maxTargetCoverage = 0.9;
    const targetCoverage = THREE.MathUtils.lerp(minTargetCoverage, maxTargetCoverage, coverageLerp);
    const dominantCoverage = Math.max(coverageX, coverageY);

    if (dominantCoverage > targetCoverage) {
      const shrink = Math.max(0.25, targetCoverage / Math.max(1e-6, dominantCoverage));
      merged.scale(shrink, shrink, 1);
      merged.computeBoundingBox();
      scaledBounds = merged.boundingBox!;
    }
  }

  const cornerSpanX = scaledBounds.max.x - scaledBounds.min.x;
  const cornerSpanY = scaledBounds.max.y - scaledBounds.min.y;

  const textureRepeatX = Math.max(1, width / 120);
  const textureRepeatY = Math.max(1, height / 120);

  if (textures?.map && material.map !== textures.map) {
    material.map = textures.map;
  }
  if (textures?.roughnessMap && material.roughnessMap !== textures.roughnessMap) {
    material.roughnessMap = textures.roughnessMap;
  }

  if (material.map) {
    material.map.repeat.set(textureRepeatX, textureRepeatY);
    material.map.needsUpdate = true;
  }

  if (material.roughnessMap instanceof THREE.Texture) {
    material.roughnessMap.repeat.set(textureRepeatX, textureRepeatY);
    material.roughnessMap.needsUpdate = true;
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

  const insetScale = Math.min(0.35, squareScale * 0.6);
  const fallbackTopStartX = -width / 2 + cornerSpanX * insetScale;
  const fallbackTopEndX = width / 2 - cornerSpanX * insetScale;
  const fallbackBottomStartX = fallbackTopStartX;
  const fallbackBottomEndX = fallbackTopEndX;
  const fallbackTopInnerY = height - cornerSpanY * insetScale;
  const fallbackBottomInnerY = cornerSpanY * insetScale;
  const fallbackLeftTopInnerY = fallbackTopInnerY;
  const fallbackLeftBottomInnerY = fallbackBottomInnerY;
  const fallbackRightTopInnerY = fallbackTopInnerY;
  const fallbackRightBottomInnerY = fallbackBottomInnerY;
  const fallbackLeftInnerX = -width / 2 + cornerSpanX * insetScale;
  const fallbackRightInnerX = width / 2 - cornerSpanX * insetScale;

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
      const isHorizontal = orientation === 'horizontal';
      const railWidth = isHorizontal ? length : lineThickness;
      const railHeight = isHorizontal ? lineThickness : length;
      
      // Create two parallel lines with a gap (matching legacy visual style)
      const outerLine = buildScaledBoxGeometry(railWidth, railHeight, reliefDepth);
      const innerLine = buildScaledBoxGeometry(railWidth, railHeight, reliefDepth);
      rails.push(outerLine, innerLine);
      
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

  if (railParts.length > 0) {
    const mergedRails = mergeGeometries(railParts, false);
    railParts.forEach((g) => g.dispose());
    if (mergedRails) {
      const railMesh = new THREE.Mesh(mergedRails, material);
      railMesh.castShadow = false;
      railMesh.receiveShadow = false;
      railMesh.renderOrder = 3;
      group.add(railMesh);
      resourceGeometries.push(mergedRails);
    }
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
  };
}
