// components/three/headstone/KerbsetBorder.tsx
'use client';

import React, { useRef, useMemo, useLayoutEffect, forwardRef, useImperativeHandle, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { TEX_BASE, DEFAULT_TEX, LERP_FACTOR, EPSILON } from '#/lib/headstone-constants';

type KerbsetBorderProps = {
  onClick?: (e: any) => void;
};

const WALL_MM = 100;

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

  useLayoutEffect(() => {
    if (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 1);
      texture.anisotropy = 16;
      texture.needsUpdate = true;
    }
  }, [texture]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.4,
        metalness: 0.05,
      }),
    [texture],
  );

  // 4 bar geometries (reused for each bar via scale)
  const barGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

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

  const targetGroupY = useRef(centerY);
  const targetGroupZ = useRef(kerbCenterZ);

  useFrame(() => {
    if (!groupRef.current) return;
    const newKD = kerbDepthMm / 1000;
    const newKH = kerbHeightMm / 1000;
    const newStandBackZ = -(uprightThickness / 1000) / 2 + baseThickness / 1000;
    targetGroupY.current = newKH / 2 + EPSILON;
    targetGroupZ.current = newStandBackZ + newKD / 2;
    groupRef.current.position.lerp(
      new THREE.Vector3(0, targetGroupY.current, targetGroupZ.current),
      LERP_FACTOR,
    );
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
        geometry={barGeo}
        material={material}
        scale={[kW, kH, wall]}
        position={[0, 0, -(kD / 2 - wall / 2)]}
      />
      {/* Front bar (foot end) */}
      <mesh
        geometry={barGeo}
        material={material}
        scale={[kW, kH, wall]}
        position={[0, 0, kD / 2 - wall / 2]}
      />
      {/* Left side bar */}
      <mesh
        geometry={barGeo}
        material={material}
        scale={[wall, kH, innerDepth]}
        position={[-(kW / 2 - wall / 2), 0, 0]}
      />
      {/* Right side bar */}
      <mesh
        geometry={barGeo}
        material={material}
        scale={[wall, kH, innerDepth]}
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
