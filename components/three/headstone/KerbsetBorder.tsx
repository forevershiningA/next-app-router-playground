// components/three/headstone/KerbsetBorder.tsx
'use client';

import React, { useRef, useMemo, useEffect, forwardRef, useImperativeHandle, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { TEX_BASE, DEFAULT_TEX, LERP_FACTOR, EPSILON } from '#/lib/headstone-constants';
import { createPolishedGraniteMaterial, GRANITE_TILE_SIZE_M } from '#/lib/granite-material';

type KerbsetBorderProps = {
  onClick?: (e: any) => void;
};

const WALL_MM = 100;

function assignBoxFaceGroups(geometry: THREE.BufferGeometry) {
  if (!geometry.index) return;

  geometry.clearGroups();
  const normal = geometry.attributes.normal;
  const index = geometry.index;

  for (let i = 0; i < index.count; i += 3) {
    const vertex = index.getX(i);
    const nx = normal.getX(vertex);
    const ny = normal.getY(vertex);
    const nz = normal.getZ(vertex);
    const materialIndex = Math.abs(nx) > Math.abs(ny) && Math.abs(nx) > Math.abs(nz)
      ? (nx > 0 ? 0 : 1)
      : Math.abs(ny) > Math.abs(nx) && Math.abs(ny) > Math.abs(nz)
        ? (ny > 0 ? 2 : 3)
        : (nz > 0 ? 4 : 5);
    geometry.addGroup(i, 3, materialIndex);
  }
}

function createKerbBarGeometry(width: number, height: number, depth: number) {
  // 3 mm is a real, restrained arris on a polished kerb. Geometry is made at
  // its physical size so the bevel does not become elliptical after scaling.
  const geometry = new RoundedBoxGeometry(width, height, depth, 3, 0.003);
  assignBoxFaceGroups(geometry);
  return geometry;
}

function createKerbBoxMaterials(texture: THREE.Texture, width: number, height: number, depth: number) {
  const createTexture = (repeatX: number, repeatY: number) => {
    const next = texture.clone();
    next.colorSpace = THREE.SRGBColorSpace;
    next.wrapS = next.wrapT = THREE.RepeatWrapping;
    next.repeat.set(Math.max(1, repeatX), Math.max(1, repeatY));
    next.anisotropy = 16;
    next.needsUpdate = true;
    return next;
  };

  const sideTexture = createTexture(depth / GRANITE_TILE_SIZE_M, height / GRANITE_TILE_SIZE_M);
  const topTexture = createTexture(width / GRANITE_TILE_SIZE_M, depth / GRANITE_TILE_SIZE_M);
  const faceTexture = createTexture(width / GRANITE_TILE_SIZE_M, height / GRANITE_TILE_SIZE_M);

  const horizontal = createPolishedGraniteMaterial({
    texture: topTexture,
    envMapIntensity: 2.4,
    roughness: 0.15,
    clearcoatRoughness: 0.1,
  });
  const side = createPolishedGraniteMaterial({
    texture: sideTexture,
    envMapIntensity: 2.4,
    roughness: 0.15,
    clearcoatRoughness: 0.1,
  });
  side.emissive.set(0xffffff);
  side.emissiveMap = sideTexture;
  side.emissiveIntensity = 0.85;

  const face = createPolishedGraniteMaterial({
    texture: faceTexture,
    envMapIntensity: 2.4,
    roughness: 0.15,
    clearcoatRoughness: 0.1,
  });
  face.emissive.set(0xffffff);
  face.emissiveMap = faceTexture;
  face.emissiveIntensity = 0.85;

  return {
    materials: [side, side, horizontal, horizontal, face, face],
    textures: [sideTexture, topTexture, faceTexture],
  };
}

function KerbMesh({
  texUrl,
  kerbWidthMm,
  kerbHeightMm,
  kerbDepthMm,
  uprightThickness,
  baseThickness,
  onClick,
  groupRef,
}: {
  texUrl: string;
  kerbWidthMm: number;
  kerbHeightMm: number;
  kerbDepthMm: number;
  uprightThickness: number;
  baseThickness: number;
  onClick?: (e: any) => void;
  groupRef: React.RefObject<THREE.Group | null>;
}) {
  const texture = useTexture(texUrl);

  const kW = kerbWidthMm / 1000;
  const kH = kerbHeightMm / 1000;
  const kD = kerbDepthMm / 1000;
  const wall = WALL_MM / 1000;
  // Start at base front face: -(uprightThickness/2) + baseThickness (all in metres)
  const standBackZ = -(uprightThickness / 1000) / 2 + baseThickness / 1000;
  const kerbCenterZ = standBackZ + kD / 2;
  const centerY = kH / 2 + EPSILON;

  // Inner depth (between the two end bars)
  const innerDepth = kD - wall * 2;

  const endBar = useMemo(
    () => createKerbBoxMaterials(texture, kW, kH, wall),
    [texture, kW, kH, wall],
  );
  const sideBar = useMemo(
    () => createKerbBoxMaterials(texture, wall, kH, innerDepth),
    [texture, wall, kH, innerDepth],
  );

  const endBarGeometry = useMemo(
    () => createKerbBarGeometry(kW, kH, wall),
    [kW, kH, wall],
  );
  const sideBarGeometry = useMemo(
    () => createKerbBarGeometry(wall, kH, innerDepth),
    [wall, kH, innerDepth],
  );

  useEffect(() => {
    return () => {
      [...new Set([...endBar.materials, ...sideBar.materials])].forEach((material) => material.dispose());
      [...endBar.textures, ...sideBar.textures].forEach((materialTexture) => materialTexture.dispose());
      endBarGeometry.dispose();
      sideBarGeometry.dispose();
    };
  }, [endBar, endBarGeometry, sideBar, sideBarGeometry]);

  const targetGroupY = useRef(centerY);
  const targetGroupZ = useRef(kerbCenterZ);
  const targetPosition = useRef(new THREE.Vector3(0, centerY, kerbCenterZ));

  useFrame((state) => {
    if (!groupRef.current) return;
    const newKD = kerbDepthMm / 1000;
    const newKH = kerbHeightMm / 1000;
    const newStandBackZ = -(uprightThickness / 1000) / 2 + baseThickness / 1000;
    targetGroupY.current = newKH / 2 + EPSILON;
    targetGroupZ.current = newStandBackZ + newKD / 2;
    targetPosition.current.set(0, targetGroupY.current, targetGroupZ.current);
    if (groupRef.current.position.distanceToSquared(targetPosition.current) > 1e-10) {
      groupRef.current.position.lerp(targetPosition.current, LERP_FACTOR);
      state.gl.shadowMap.needsUpdate = true;
      state.invalidate();
    }
  });

  return (
    <group
      ref={groupRef as React.RefObject<THREE.Group>}
      position={[0, centerY, kerbCenterZ]}
      onClick={onClick}
      name="kerbset"
    >
      {/* Back bar (head end) */}
      <mesh
        geometry={endBarGeometry}
        material={endBar.materials}
        position={[0, 0, -(kD / 2 - wall / 2)]}
      />
      {/* Front bar (foot end) */}
      <mesh
        geometry={endBarGeometry}
        material={endBar.materials}
        position={[0, 0, kD / 2 - wall / 2]}
      />
      {/* Left side bar */}
      <mesh
        geometry={sideBarGeometry}
        material={sideBar.materials}
        position={[-(kW / 2 - wall / 2), 0, 0]}
      />
      {/* Right side bar */}
      <mesh
        geometry={sideBarGeometry}
        material={sideBar.materials}
        position={[kW / 2 - wall / 2, 0, 0]}
      />
    </group>
  );
}

const KerbsetBorder = forwardRef<THREE.Group, KerbsetBorderProps>(function KerbsetBorder(
  { onClick },
  ref,
) {
  const internalRef = useRef<THREE.Group>(null!);
  useImperativeHandle(ref, () => internalRef.current as unknown as THREE.Group);

  const kerbWidthMm = useHeadstoneStore((s) => s.kerbWidthMm);
  const kerbHeightMm = useHeadstoneStore((s) => s.kerbHeightMm);
  const kerbDepthMm = useHeadstoneStore((s) => s.kerbDepthMm);
  const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
  const baseThickness = useHeadstoneStore((s) => s.baseThickness);
  const kerbsetMaterialUrl = useHeadstoneStore((s) => s.kerbsetMaterialUrl);

  const texUrl = kerbsetMaterialUrl
    ? kerbsetMaterialUrl.startsWith('/')
      ? kerbsetMaterialUrl
      : `/${kerbsetMaterialUrl}`
    : `${TEX_BASE}${DEFAULT_TEX}`;

  return (
    <Suspense fallback={null}>
      <KerbMesh
        texUrl={texUrl}
        kerbWidthMm={kerbWidthMm}
        kerbHeightMm={kerbHeightMm}
        kerbDepthMm={kerbDepthMm}
        uprightThickness={uprightThickness}
        baseThickness={baseThickness}
        onClick={onClick}
        groupRef={internalRef}
      />
    </Suspense>
  );
});

export default KerbsetBorder;
