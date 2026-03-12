// components/three/headstone/LedgerSlab.tsx
'use client';

import React, { useRef, useMemo, useLayoutEffect, forwardRef, useImperativeHandle, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { TEX_BASE, DEFAULT_TEX, LERP_FACTOR, EPSILON } from '#/lib/headstone-constants';

type LedgerSlabProps = {
  onClick?: (e: any) => void;
};

function LedgerMesh({
  texUrl,
  ledgerWidthMm,
  ledgerHeightMm,
  ledgerDepthMm,
  uprightThickness,
  baseThickness,
  kerbHeightMm,
  onClick,
  meshRef,
}: {
  texUrl: string;
  ledgerWidthMm: number;
  ledgerHeightMm: number;
  ledgerDepthMm: number;
  uprightThickness: number;
  baseThickness: number;
  kerbHeightMm: number;
  onClick?: (e: any) => void;
  meshRef: React.RefObject<THREE.Mesh | null>;
}){
  const texture = useTexture(texUrl);

  useLayoutEffect(() => {
    if (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3, 1);
      texture.anisotropy = 16;
      texture.needsUpdate = true;
    }
  }, [texture]);

  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.004), []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.25,
        metalness: 0.05,
      }),
    [texture],
  );

  const w = ledgerWidthMm / 1000;
  const h = ledgerHeightMm / 1000;
  const d = ledgerDepthMm / 1000;
  // Start at base front face: -(uprightThickness/2) + baseThickness (all in metres)
  const standBackZ = -(uprightThickness / 1000) / 2 + baseThickness / 1000;
  const kerbH = kerbHeightMm / 1000;

  const targetPos = useRef(new THREE.Vector3(0, kerbH + h / 2 + EPSILON, standBackZ + d / 2));
  const targetScale = useRef(new THREE.Vector3(w, h, d));

  useFrame(() => {
    if (!meshRef.current) return;
    const newW = ledgerWidthMm / 1000;
    const newH = ledgerHeightMm / 1000;
    const newD = ledgerDepthMm / 1000;
    const newStandBackZ = -(uprightThickness / 1000) / 2 + baseThickness / 1000;
    const newKerbH = kerbHeightMm / 1000;
    targetPos.current.set(0, newKerbH + newH / 2 + EPSILON, newStandBackZ + newD / 2);
    targetScale.current.set(newW, newH, newD);
    meshRef.current.position.lerp(targetPos.current, LERP_FACTOR);
    meshRef.current.scale.lerp(targetScale.current, LERP_FACTOR);
  });

  return (
    <mesh
      ref={meshRef as React.RefObject<THREE.Mesh>}
      geometry={geometry}
      material={material}
      onClick={onClick}
      name="ledger"
    />
  );
}

const LedgerSlab = forwardRef<THREE.Mesh, LedgerSlabProps>(function LedgerSlab({ onClick }, ref) {
  const internalRef = useRef<THREE.Mesh>(null!);
  useImperativeHandle(ref, () => internalRef.current);

  const ledgerWidthMm = useHeadstoneStore((s) => s.ledgerWidthMm);
  const ledgerHeightMm = useHeadstoneStore((s) => s.ledgerHeightMm);
  const ledgerDepthMm = useHeadstoneStore((s) => s.ledgerDepthMm);
  const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
  const kerbHeightMm = useHeadstoneStore((s) => s.kerbHeightMm);
  const baseThickness = useHeadstoneStore((s) => s.baseThickness);
  const baseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);

  const texUrl = baseMaterialUrl
    ? baseMaterialUrl.startsWith('/')
      ? baseMaterialUrl
      : `/${baseMaterialUrl}`
    : `${TEX_BASE}${DEFAULT_TEX}`;

  return (
    <Suspense fallback={null}>
      <LedgerMesh
        texUrl={texUrl}
        ledgerWidthMm={ledgerWidthMm}
        ledgerHeightMm={ledgerHeightMm}
        ledgerDepthMm={ledgerDepthMm}
        uprightThickness={uprightThickness}
        baseThickness={baseThickness}
        kerbHeightMm={kerbHeightMm}
        onClick={onClick}
        meshRef={internalRef}
      />
    </Suspense>
  );
});

export default LedgerSlab;
