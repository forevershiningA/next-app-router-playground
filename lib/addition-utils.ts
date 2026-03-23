import * as THREE from 'three';

export const normalizeAdditionBaseId = (instanceId: string) => {
  const parts = instanceId.split('_');
  const hasTimestampSuffix =
    parts.length > 1 && !Number.isNaN(Number(parts[parts.length - 1]));
  return hasTimestampSuffix ? parts.slice(0, -1).join('_') : instanceId;
};

export type DepthRange = { min: number; max: number };
export type BoundsLike = {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
};
export type InteractionClampBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
};
export type XYCenter = { x: number; y: number };
export type BaseSurfaceSamples = {
  surfaceZ: number;
  topY: number;
  depthRange: DepthRange;
};

export const clampValue = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const getBoundsCenter = (bounds: BoundsLike) => ({
  x: (bounds.min.x + bounds.max.x) / 2,
  y: (bounds.min.y + bounds.max.y) / 2,
  z: (bounds.min.z + bounds.max.z) / 2,
});

export const getHeadstoneCenterXY = (bounds: BoundsLike): XYCenter => {
  const center = getBoundsCenter(bounds);
  return { x: center.x, y: center.y };
};

export const getInteractionClampBounds = (
  bounds: BoundsLike,
  inset = 0.01,
  depthInsetRatio = 0.08,
  maxDepthInset = 0.01,
  yInsetRatio = 0.04,
): InteractionClampBounds => {
  const spanY = bounds.max.y - bounds.min.y;
  const depthSpan = bounds.max.z - bounds.min.z;
  const depthInset = Math.min(depthSpan * depthInsetRatio, maxDepthInset);
  return {
    minX: bounds.min.x + inset,
    maxX: bounds.max.x - inset,
    minY: bounds.min.y + inset + yInsetRatio * spanY,
    maxY: bounds.max.y - inset,
    minZ: bounds.min.z + depthInset,
    maxZ: bounds.max.z - depthInset,
  };
};

export const convertPointBetweenMeshLocals = (
  point: THREE.Vector3,
  fromMesh: THREE.Object3D,
  toMesh: THREE.Object3D,
) => {
  const worldPoint = fromMesh.localToWorld(point.clone());
  return toMesh.worldToLocal(worldPoint.clone());
};

export const getMeshBoundingBox = (mesh: THREE.Mesh) => {
  if (!mesh.geometry.boundingBox) {
    mesh.geometry.computeBoundingBox();
  }
  return mesh.geometry.boundingBox?.clone() ?? null;
};

export const sampleBaseSurfaceMetrics = (
  baseMesh: THREE.Mesh,
  headstoneMesh: THREE.Mesh,
): BaseSurfaceSamples | null => {
  const bbox = getMeshBoundingBox(baseMesh);
  if (!bbox) return null;

  const center = getBoundsCenter(bbox);
  const topY = bbox.max.y;
  const depthInset = Math.min((bbox.max.z - bbox.min.z) * 0.08, 0.01);

  const topFrontPoint = new THREE.Vector3(0, topY, bbox.max.z);
  const topCenterPoint = new THREE.Vector3(center.x, topY, center.z);
  const backPoint = new THREE.Vector3(0, topY, bbox.min.z + depthInset);
  const frontPoint = new THREE.Vector3(0, topY, bbox.max.z - depthInset);

  const headTopFront = convertPointBetweenMeshLocals(
    topFrontPoint,
    baseMesh,
    headstoneMesh,
  );
  const headTopCenter = convertPointBetweenMeshLocals(
    topCenterPoint,
    baseMesh,
    headstoneMesh,
  );
  const headBack = convertPointBetweenMeshLocals(backPoint, baseMesh, headstoneMesh)
    .z;
  const headFront = convertPointBetweenMeshLocals(
    frontPoint,
    baseMesh,
    headstoneMesh,
  ).z;

  return {
    surfaceZ: headTopFront.z,
    topY: headTopCenter.y,
    depthRange: {
      min: Math.min(headBack, headFront),
      max: Math.max(headBack, headFront),
    },
  };
};

export const clampDepthWithinRange = (
  zValue: number,
  range: DepthRange,
  halfDepth: number,
  headFrontZ: number,
  padding: number,
) => {
  const clearance = Math.max(halfDepth, padding);
  const safeMin = Math.max(range.min + clearance, headFrontZ + clearance);
  const safeMax = range.max - clearance;
  if (safeMax > safeMin) {
    return Math.max(safeMin, Math.min(safeMax, zValue));
  }
  return safeMin;
};
