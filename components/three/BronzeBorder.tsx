/**
 * Bronze Plaque Border Component
 * Renders decorative 3D borders using extruded SVG geometry at plaque scale
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const shouldRender = Boolean(slug && localWidth > 0 && localHeight > 0);

  const bronzeTextures = React.useMemo(() => createBronzeTextures(color), [color]);

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

  const disposeResources = useCallback(() => {
    if (!resourcesRef.current) return;
    resourcesRef.current.geometries.forEach((geom) => geom.dispose());
    resourcesRef.current.material?.dispose();
    resourcesRef.current = null;
  }, []);

  useEffect(() => disposeResources, [disposeResources]);

  useEffect(() => {
    if (!slug) {
      setSvgData(null);
      return;
    }

    if (svgCacheRef.current[slug]) {
      setSvgData(svgCacheRef.current[slug]);
      return;
    }

    let cancelled = false;
    const loader = new SVGLoader();

    loader.load(
      `/shapes/borders/${slug}.svg`,
      (data) => {
        if (cancelled) return;
        svgCacheRef.current[slug] = data;
        setSvgData(data);
      },
      undefined,
      (error) => {
        if (cancelled) return;
        console.warn(`Failed to load border SVG ${slug}`, error);
        setSvgData(null);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!shouldRender || !svgData) {
      disposeResources();
      setBorderGroup(null);
      return;
    }

    const built = buildBorderGroup(svgData, {
      plaqueWidth: localWidth,
      plaqueHeight: localHeight,
      depth,
      color,
      frontZ,
      textures: bronzeTextures ?? undefined,
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
  }, [svgData, shouldRender, localWidth, localHeight, depth, color, frontZ, bronzeTextures, disposeResources]);

  if (!borderGroup) {
    return null;
  }

  return <primitive object={borderGroup} />;
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
    forceFrame?: boolean;
    textures?: BronzeTextures;
  },
): {
  group: THREE.Group;
  geometries: THREE.BufferGeometry[];
  material: THREE.MeshStandardMaterial;
} | null {
  const { plaqueWidth, plaqueHeight, depth, color, frontZ, textures } = params;
  const width = Math.max(1e-3, Math.abs(plaqueWidth));
  const height = Math.max(1e-3, Math.abs(plaqueHeight));

  const reliefDepthBase = Math.max(0.001, Math.min(width, height) * 0.003);
  const reliefDepth = reliefDepthBase * BORDER_RELIEF_SCALE;
  const extrudeSettings = {
    depth: reliefDepth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: reliefDepth * 0.35,
    bevelThickness: reliefDepth * 0.35,
    steps: 1,
    curveSegments: 24,
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

  // Make corner details the same thickness as the lines
  // We want the corner to be about lineThickness in size
  const cornerScale = lineThickness;
  const baseScale = cornerScale / Math.max(originalWidth, originalHeight);
  merged.scale(baseScale, baseScale, 1);
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
  let leftEdgeTopY: number | null = null;
  let leftEdgeBottomY: number | null = null;
  let rightEdgeTopY: number | null = null;
  let rightEdgeBottomY: number | null = null;
  let leftEdgeOuterX: number | null = null;
  let rightEdgeOuterX: number | null = null;

  const group = new THREE.Group();
  const resourceGeometries: THREE.BufferGeometry[] = [...tempGeometries, merged];
  const SURFACE_Z = frontZ + 0.0001;

  const createCornerMesh = (
    source: THREE.BufferGeometry,
    alignX: 'left' | 'right',
    alignY: 'top' | 'bottom',
  ) => {
    const geom = source.clone();
    
    // Border SVG is designed for top-left corner
    // Top corners: Y-flip to correct SVG coordinates
    // Bottom corners: Same as top but without the Y-flip (double negative = no flip)
    const flipX = alignX === 'right';
    const flipY = alignY === 'top'; // Only flip Y for top corners
    
    if (flipX) geom.scale(-1, 1, 1);
    if (flipY) geom.scale(1, -1, 1);
    
    geom.computeVertexNormals();
    resourceGeometries.push(geom);
    geom.computeBoundingBox();
    const bounds = geom.boundingBox!;
    const posX =
      alignX === 'left'
        ? -width / 2 - bounds.min.x
        : width / 2 - bounds.max.x;
    const posY =
      alignY === 'top'
        ? height - bounds.max.y  // Top of plaque at Y = height
        : 0 - bounds.min.y;      // Bottom of plaque at Y = 0
    const worldMinX = posX + bounds.min.x;
    const worldMaxX = posX + bounds.max.x;
    const worldMinY = posY + bounds.min.y;
    const worldMaxY = posY + bounds.max.y;

    if (alignY === 'top') {
      const innerY = worldMinY; // Bottom edge of top corners (inner edge)
      const outerY = worldMaxY; // Top edge of top corners (outer edge)
      if (alignX === 'left') {
        topEdgeStartX = worldMaxX; // Right edge of left corner (inner edge)
        const outerX = worldMinX; // Left edge of left corner (outer edge)
        leftEdgeTopY = outerY; // Use OUTER edge (top of corner)
        if (leftEdgeOuterX === null) leftEdgeOuterX = outerX;
        console.log('[Corner] Top-Left outerY:', outerY, 'outerX:', outerX);
      } else {
        topEdgeEndX = worldMinX; // Left edge of right corner (inner edge)
        const outerX = worldMaxX; // Right edge of right corner (outer edge)
        rightEdgeTopY = outerY; // Use OUTER edge (top of corner)
        if (rightEdgeOuterX === null) rightEdgeOuterX = outerX;
        console.log('[Corner] Top-Right outerY:', outerY, 'outerX:', outerX);
      }
    } else {
      const innerY = worldMaxY; // Top edge of bottom corners (inner edge)
      const outerY = worldMinY; // Bottom edge of bottom corners (outer edge)
      if (alignX === 'left') {
        bottomEdgeStartX = worldMaxX; // Right edge of left corner (inner edge)
        const outerX = worldMinX; // Left edge of left corner (outer edge)
        leftEdgeBottomY = outerY; // Use OUTER edge (bottom of corner)
        if (leftEdgeOuterX === null) leftEdgeOuterX = outerX;
        console.log('[Corner] Bottom-Left outerY:', outerY, 'outerX:', outerX);
      } else {
        bottomEdgeEndX = worldMinX; // Left edge of right corner (inner edge)
        const outerX = worldMaxX; // Right edge of right corner (outer edge)
        rightEdgeBottomY = outerY; // Use OUTER edge (bottom of corner)
        if (rightEdgeOuterX === null) rightEdgeOuterX = outerX;
        console.log('[Corner] Bottom-Right outerY:', outerY, 'outerX:', outerX);
      }
    }

    const mesh = new THREE.Mesh(geom, material);
    mesh.position.set(posX, posY, SURFACE_Z);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = 3;
    group.add(mesh);
  };

  createCornerMesh(merged, 'left', 'top');
  createCornerMesh(merged, 'right', 'top');
  createCornerMesh(merged, 'left', 'bottom');
  createCornerMesh(merged, 'right', 'bottom');

  const fallbackTopStartX = -width / 2 + cornerSpanX;
  const fallbackTopEndX = width / 2 - cornerSpanX;
  const fallbackBottomStartX = fallbackTopStartX;
  const fallbackBottomEndX = fallbackTopEndX;
  const fallbackLeftTopY = height - cornerSpanY;  // Top at Y = height
  const fallbackLeftBottomY = 0 + cornerSpanY;    // Bottom at Y = 0
  const fallbackRightTopY = fallbackLeftTopY;
  const fallbackRightBottomY = fallbackLeftBottomY;

  const topStartX = topEdgeStartX ?? fallbackTopStartX;
  const topEndX = topEdgeEndX ?? fallbackTopEndX;
  const bottomStartX = bottomEdgeStartX ?? fallbackBottomStartX;
  const bottomEndX = bottomEdgeEndX ?? fallbackBottomEndX;

  const leftTopY = leftEdgeTopY ?? fallbackLeftTopY;
  const leftBottomY = leftEdgeBottomY ?? fallbackLeftBottomY;
  const rightTopY = rightEdgeTopY ?? fallbackRightTopY;
  const rightBottomY = rightEdgeBottomY ?? fallbackRightBottomY;

  // Use the actual corner edge positions for line alignment
  // Lines should be at the plaque edges
  // IMPORTANT: Check if plaque is centered or bottom-anchored
  // If centered: top = height/2, bottom = -height/2
  // If bottom-anchored: top = height, bottom = 0
  const topLineY = height; // Top edge of plaque (assuming bottom-anchored at Y=0)
  const bottomLineY = 0; // Bottom edge of plaque (assuming bottom-anchored at Y=0)
  
  console.log('[Lines] topLineY (plaque top):', topLineY, 'height:', height);
  console.log('[Lines] bottomLineY (plaque bottom):', bottomLineY);
  console.log('[Lines] Fallback values - top:', fallbackLeftTopY, 'bottom:', fallbackLeftBottomY);
  
  const leftContactX = Math.max(topStartX, bottomStartX);
  const rightContactX = Math.min(topEndX, bottomEndX);

  const clampSpan = (value: number) => Math.max(lineThickness * 2, Math.max(0.001, value));

  const topSpan = clampSpan(topEndX - topStartX);
  const bottomSpan = clampSpan(bottomEndX - bottomStartX);
  // Vertical lines should span between the horizontal line positions
  const leftSpan = clampSpan(topLineY - bottomLineY);
  const rightSpan = clampSpan(topLineY - bottomLineY);

  const topCenterX = (topStartX + topEndX) / 2;
  const bottomCenterX = (bottomStartX + bottomEndX) / 2;
  // Vertical lines centered between top and bottom line positions
  const leftCenterY = (topLineY + bottomLineY) / 2;
  const rightCenterY = (topLineY + bottomLineY) / 2;
  
  console.log('[Vertical Lines] leftSpan:', leftSpan, 'leftCenterY:', leftCenterY);
  console.log('[Vertical Lines] leftTopY:', leftTopY, 'leftBottomY:', leftBottomY);
  console.log('🔥🔥🔥 NEW CODE IS RUNNING - CHECK THIS 🔥🔥🔥');
  console.log('[NEW] topLineY:', topLineY, 'bottomLineY:', bottomLineY);
  console.log('[NEW] leftSpan calculation: topLineY - bottomLineY =', topLineY, '-', bottomLineY, '=', topLineY - bottomLineY);

  const leftLineAnchorX = leftContactX;
  const rightLineAnchorX = rightContactX;

  const addEdgeBar = (geom: THREE.BufferGeometry, x: number, y: number) => {
    const mesh = new THREE.Mesh(geom, material);
    mesh.position.set(x, y, SURFACE_Z);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = 2;
    group.add(mesh);
  };

  const topLineGeom = new THREE.BoxGeometry(topSpan, lineThickness, reliefDepth);
  topLineGeom.translate(0, 0, reliefDepth / 2);
  resourceGeometries.push(topLineGeom);
  const bottomLineGeom = new THREE.BoxGeometry(bottomSpan, lineThickness, reliefDepth);
  bottomLineGeom.translate(0, 0, reliefDepth / 2);
  resourceGeometries.push(bottomLineGeom);

  const leftLineGeom = new THREE.BoxGeometry(lineThickness, leftSpan, reliefDepth);
  leftLineGeom.translate(0, 0, reliefDepth / 2);
  resourceGeometries.push(leftLineGeom);
  const rightLineGeom = new THREE.BoxGeometry(lineThickness, rightSpan, reliefDepth);
  rightLineGeom.translate(0, 0, reliefDepth / 2);
  resourceGeometries.push(rightLineGeom);

  const topOuterY = topLineY - lineThickness / 2;
  const topInnerY = topOuterY - (lineThickness + lineGap);
  console.log('[Line Position] Top outer line Y:', topOuterY, 'topLineY:', topLineY);
  addEdgeBar(topLineGeom, topCenterX, topOuterY);
  const topInnerGeom = new THREE.BoxGeometry(topSpan, lineThickness, reliefDepth);
  topInnerGeom.translate(0, 0, reliefDepth / 2);
  resourceGeometries.push(topInnerGeom);
  addEdgeBar(topInnerGeom, topCenterX, topInnerY);

  const bottomOuterY = bottomLineY + lineThickness / 2;
  const bottomInnerY = bottomOuterY + (lineThickness + lineGap);
  console.log('[Line Position] Bottom outer line Y:', bottomOuterY, 'bottomLineY:', bottomLineY);
  addEdgeBar(bottomLineGeom, bottomCenterX, bottomOuterY);
  const bottomInnerGeom = new THREE.BoxGeometry(bottomSpan, lineThickness, reliefDepth);
  bottomInnerGeom.translate(0, 0, reliefDepth / 2);
  resourceGeometries.push(bottomInnerGeom);
  addEdgeBar(bottomInnerGeom, bottomCenterX, bottomInnerY);

  const fallbackLeftOuterX = -width / 2; // Left edge of plaque (centered)
  const fallbackRightOuterX = width / 2; // Right edge of plaque (centered)
  
  const leftLineX = leftEdgeOuterX ?? fallbackLeftOuterX;
  const rightLineX = rightEdgeOuterX ?? fallbackRightOuterX;
  
  console.log('[Lines] leftLineX:', leftLineX, 'width/2:', width/2);
  console.log('[Lines] rightLineX:', rightLineX, 'width/2:', width/2);

  const leftOuterX = leftLineX + lineThickness / 2;
  const leftInnerX = leftOuterX + lineThickness + lineGap;
  console.log('[Line Position] Left outer line X:', leftOuterX, 'leftLineX:', leftLineX);
  addEdgeBar(leftLineGeom, leftOuterX, leftCenterY);
  const leftInnerGeom = new THREE.BoxGeometry(lineThickness, leftSpan, reliefDepth);
  leftInnerGeom.translate(0, 0, reliefDepth / 2);
  resourceGeometries.push(leftInnerGeom);
  addEdgeBar(leftInnerGeom, leftInnerX, leftCenterY);

  const rightOuterX = rightLineX - lineThickness / 2;
  const rightInnerX = rightOuterX - (lineThickness + lineGap);
  console.log('[Line Position] Right outer line X:', rightOuterX, 'rightLineX:', rightLineX);
  addEdgeBar(rightLineGeom, rightOuterX, rightCenterY);
  const rightInnerGeom = new THREE.BoxGeometry(lineThickness, rightSpan, reliefDepth);
  rightInnerGeom.translate(0, 0, reliefDepth / 2);
  resourceGeometries.push(rightInnerGeom);
  addEdgeBar(rightInnerGeom, rightInnerX, rightCenterY);

  return {
    group,
    geometries: resourceGeometries,
    material,
  };
}
