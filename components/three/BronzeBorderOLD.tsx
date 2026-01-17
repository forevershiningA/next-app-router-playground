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

const RELIEF_DEPTH = 0.3; // Fixed 3mm raised border
const BORDER_SCALE = 1.3; // Enlarge decorative border by 30%

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
  }, [svgData, shouldRender, localWidth, localHeight, depth, color, frontZ, disposeResources]);

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
  },
): {
  group: THREE.Group;
  geometries: THREE.BufferGeometry[];
  material: THREE.MeshStandardMaterial;
} | null {
  const { plaqueWidth, plaqueHeight, depth, color, frontZ } = params;
  const width = Math.max(1e-3, Math.abs(plaqueWidth));
  const height = Math.max(1e-3, Math.abs(plaqueHeight));

  const reliefDepth = RELIEF_DEPTH;
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
      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      tempGeometries.push(geom);
    }
  }

  if (!tempGeometries.length) {
    return null;
  }

  const merged = mergeGeometries(tempGeometries, false);
  if (!merged) {
    tempGeometries.forEach((geom) => geom.dispose());
    return null;
  }

  merged.computeBoundingBox();
  const bounds = merged.boundingBox;
  if (!bounds) {
    merged.dispose();
    tempGeometries.forEach((geom) => geom.dispose());
    return null;
  }

  const originalWidth = Math.max(1e-3, bounds.max.x - bounds.min.x);
  const originalHeight = Math.max(1e-3, bounds.max.y - bounds.min.y);
  const centerX = (bounds.min.x + bounds.max.x) / 2;
  const centerY = (bounds.min.y + bounds.max.y) / 2;

  merged.translate(-centerX, -centerY, 0);

  const cornerScale = Math.min(width, height) * 0.12 * BORDER_SCALE;
  const baseScale = cornerScale / Math.max(originalWidth, originalHeight);
  merged.scale(baseScale, baseScale, 1);
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  const scaledBounds = merged.boundingBox!;
  const cornerSpanX = scaledBounds.max.x - scaledBounds.min.x;
  const cornerSpanY = scaledBounds.max.y - scaledBounds.min.y;

  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.85,
    roughness: 0.35,
    envMapIntensity: 1.25,
    side: THREE.DoubleSide,
  });

  let topEdgeStartX: number | null = null;
  let topEdgeEndX: number | null = null;
  let bottomEdgeStartX: number | null = null;
  let bottomEdgeEndX: number | null = null;
  let leftEdgeTopY: number | null = null;
  let leftEdgeBottomY: number | null = null;
  let rightEdgeTopY: number | null = null;
  let rightEdgeBottomY: number | null = null;

  const group = new THREE.Group();
  const resourceGeometries: THREE.BufferGeometry[] = [...tempGeometries, merged];
  const SURFACE_Z = frontZ + 0.0001;

  const createCornerMesh = (
    source: THREE.BufferGeometry,
    alignX: 'left' | 'right',
    alignY: 'top' | 'bottom',
  ) => {
    const geom = source.clone();
    const flipX = alignX === 'right' || (alignX === 'left' && alignY === 'bottom');
    const flipY = true; // All corners flipped vertically to match reference detailing
    if (flipX) geom.scale(-1, 1, 1);
    if (flipY) geom.scale(1, -1, 1);
    if (flipX || flipY) geom.computeVertexNormals();
    resourceGeometries.push(geom);
    geom.computeBoundingBox();
    const bounds = geom.boundingBox!;
    const posX =
      alignX === 'left'
        ? -width / 2 - bounds.min.x
        : width / 2 - bounds.max.x;
    const posY =
      alignY === 'top'
        ? height - bounds.max.y
        : -bounds.min.y;
    const worldMinX = posX + bounds.min.x;
    const worldMaxX = posX + bounds.max.x;
    const worldMinY = posY + bounds.min.y;
    const worldMaxY = posY + bounds.max.y;

    if (alignY === 'top') {
      const innerY = worldMinY;
      if (alignX === 'left') {
        topEdgeStartX = worldMaxX;
        leftEdgeTopY = innerY;
      } else {
        topEdgeEndX = worldMinX;
        rightEdgeTopY = innerY;
      }
    } else {
      const innerY = worldMaxY;
      if (alignX === 'left') {
        bottomEdgeStartX = worldMaxX;
        leftEdgeBottomY = innerY;
      } else {
        bottomEdgeEndX = worldMinX;
        rightEdgeBottomY = innerY;
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

  const edgeThickness = Math.max(0.01, Math.min(width, height) * 0.02 * BORDER_SCALE);
  const lineThickness = edgeThickness * 0.4;
  const lineGap = lineThickness * 0.6;

  const fallbackTopStartX = -width / 2 + cornerSpanX;
  const fallbackTopEndX = width / 2 - cornerSpanX;
  const fallbackBottomStartX = fallbackTopStartX;
  const fallbackBottomEndX = fallbackTopEndX;
  const fallbackLeftTopY = height - cornerSpanY;
  const fallbackLeftBottomY = cornerSpanY;
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

  const topContactY = Math.min(leftTopY, rightTopY);
  const bottomContactY = Math.max(leftBottomY, rightBottomY);
  const leftContactX = Math.max(topStartX, bottomStartX);
  const rightContactX = Math.min(topEndX, bottomEndX);

  const clampSpan = (value: number) => Math.max(lineThickness * 2, Math.max(0.001, value));

  const topSpan = clampSpan(topEndX - topStartX);
  const bottomSpan = clampSpan(bottomEndX - bottomStartX);
  const leftSpan = clampSpan(leftTopY - leftBottomY);
  const rightSpan = clampSpan(rightTopY - rightBottomY);

  const topCenterX = (topStartX + topEndX) / 2;
  const bottomCenterX = (bottomStartX + bottomEndX) / 2;
  const leftCenterY = (leftTopY + leftBottomY) / 2;
  const rightCenterY = (rightTopY + rightBottomY) / 2;

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

  const topLineGeom = new THREE.BoxGeometry(topSpan, lineThickness, RELIEF_DEPTH);
  topLineGeom.translate(0, 0, RELIEF_DEPTH / 2);
  resourceGeometries.push(topLineGeom);
  const bottomLineGeom = new THREE.BoxGeometry(bottomSpan, lineThickness, RELIEF_DEPTH);
  bottomLineGeom.translate(0, 0, RELIEF_DEPTH / 2);
  resourceGeometries.push(bottomLineGeom);

  const leftLineGeom = new THREE.BoxGeometry(lineThickness, leftSpan, RELIEF_DEPTH);
  leftLineGeom.translate(0, 0, RELIEF_DEPTH / 2);
  resourceGeometries.push(leftLineGeom);
  const rightLineGeom = new THREE.BoxGeometry(lineThickness, rightSpan, RELIEF_DEPTH);
  rightLineGeom.translate(0, 0, RELIEF_DEPTH / 2);
  resourceGeometries.push(rightLineGeom);

  const topOuterY = topContactY - lineThickness / 2;
  const topInnerY = topOuterY - (lineThickness + lineGap);
  addEdgeBar(topLineGeom, topCenterX, topOuterY);
  const topInnerGeom = new THREE.BoxGeometry(topSpan, lineThickness, RELIEF_DEPTH);
  topInnerGeom.translate(0, 0, RELIEF_DEPTH / 2);
  resourceGeometries.push(topInnerGeom);
  addEdgeBar(topInnerGeom, topCenterX, topInnerY);

  const bottomOuterY = bottomContactY + lineThickness / 2;
  const bottomInnerY = bottomOuterY + (lineThickness + lineGap);
  addEdgeBar(bottomLineGeom, bottomCenterX, bottomOuterY);
  const bottomInnerGeom = new THREE.BoxGeometry(bottomSpan, lineThickness, RELIEF_DEPTH);
  bottomInnerGeom.translate(0, 0, RELIEF_DEPTH / 2);
  resourceGeometries.push(bottomInnerGeom);
  addEdgeBar(bottomInnerGeom, bottomCenterX, bottomInnerY);

  const leftOuterX = leftLineAnchorX + lineThickness / 2;
  const leftInnerX = leftOuterX + lineThickness + lineGap;
  addEdgeBar(leftLineGeom, leftOuterX, leftCenterY);
  const leftInnerGeom = new THREE.BoxGeometry(lineThickness, leftSpan, RELIEF_DEPTH);
  leftInnerGeom.translate(0, 0, RELIEF_DEPTH / 2);
  resourceGeometries.push(leftInnerGeom);
  addEdgeBar(leftInnerGeom, leftInnerX, leftCenterY);

  const rightOuterX = rightLineAnchorX - lineThickness / 2;
  const rightInnerX = rightOuterX - (lineThickness + lineGap);
  addEdgeBar(rightLineGeom, rightOuterX, rightCenterY);
  const rightInnerGeom = new THREE.BoxGeometry(lineThickness, rightSpan, RELIEF_DEPTH);
  rightInnerGeom.translate(0, 0, RELIEF_DEPTH / 2);
  resourceGeometries.push(rightInnerGeom);
  addEdgeBar(rightInnerGeom, rightInnerX, rightCenterY);

  return {
    group,
    geometries: resourceGeometries,
    material,
  };
}
