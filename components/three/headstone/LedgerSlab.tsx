// components/three/headstone/LedgerSlab.tsx
'use client';

import React, {
  useRef,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
  Suspense,
} from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { TEX_BASE, DEFAULT_TEX, EPSILON } from '#/lib/headstone-constants';
import {
  createPolishedGraniteMaterial,
  GRANITE_TILE_SIZE_M,
} from '#/lib/granite-material';
import { useMobileNavStore } from '#/lib/mobile-nav-store';

type LedgerSlabProps = { onClick?: (e: any) => void };

function createLedgerMaterials(
  texture: THREE.Texture,
  width: number,
  height: number,
  depth: number,
) {
  const createTexture = (repeatX: number, repeatY: number) => {
    const next = texture.clone();
    next.colorSpace = THREE.SRGBColorSpace;
    next.wrapS = next.wrapT = THREE.RepeatWrapping;
    next.repeat.set(Math.max(1, repeatX), Math.max(1, repeatY));
    next.anisotropy = 16;
    next.needsUpdate = true;
    return next;
  };

  const sideTexture = createTexture(
    depth / GRANITE_TILE_SIZE_M,
    height / GRANITE_TILE_SIZE_M,
  );
  const topTexture = createTexture(
    width / GRANITE_TILE_SIZE_M,
    depth / GRANITE_TILE_SIZE_M,
  );
  const faceTexture = createTexture(
    width / GRANITE_TILE_SIZE_M,
    height / GRANITE_TILE_SIZE_M,
  );

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
    const materialIndex =
      Math.abs(nx) > Math.abs(ny) && Math.abs(nx) > Math.abs(nz)
        ? nx > 0
          ? 0
          : 1
        : Math.abs(ny) > Math.abs(nx) && Math.abs(ny) > Math.abs(nz)
          ? ny > 0
            ? 2
            : 3
          : nz > 0
            ? 4
            : 5;
    geometry.addGroup(i, 3, materialIndex);
  }
}

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
}) {
  const texture = useTexture(texUrl);
  const isSizeAdjustmentActive = useMobileNavStore(
    (state) => state.isSizeAdjustmentActive,
  );
  // Keep one texture/material set; live dimensions are represented by scale.
  const [materialDimensions] = React.useState(() => ({
    widthMm: ledgerWidthMm,
    heightMm: ledgerHeightMm,
    depthMm: ledgerDepthMm,
  }));

  const geometry = useMemo(() => {
    const next = new RoundedBoxGeometry(1, 1, 1, 2, 0.004);
    assignBoxFaceGroups(next);
    return next;
  }, []);

  const w = ledgerWidthMm / 1000;
  const h = ledgerHeightMm / 1000;
  const d = ledgerDepthMm / 1000;
  const materialSet = useMemo(
    () =>
      createLedgerMaterials(
        texture,
        materialDimensions.widthMm / 1000,
        materialDimensions.heightMm / 1000,
        materialDimensions.depthMm / 1000,
      ),
    [texture, materialDimensions],
  );
  const isDimensionPreviewActive =
    materialDimensions.widthMm !== ledgerWidthMm ||
    materialDimensions.heightMm !== ledgerHeightMm ||
    materialDimensions.depthMm !== ledgerDepthMm;

  useEffect(() => {
    return () => {
      [...new Set(materialSet.materials)].forEach((material) =>
        material.dispose(),
      );
      materialSet.textures.forEach((materialTexture) =>
        materialTexture.dispose(),
      );
    };
  }, [materialSet]);

  // Geometry is dimension-independent: the mesh is resized through scale.
  // Dispose it only when this ledger mesh unmounts, not every time a texture
  // repeat/material set is recreated for a new dimension.
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Start at base front face: -(uprightThickness/2) + baseThickness (all in metres)
  const standBackZ = -(uprightThickness / 1000) / 2 + baseThickness / 1000;
  const kerbH = kerbHeightMm / 1000;

  const targetPos = useRef(
    new THREE.Vector3(0, kerbH + h / 2 + EPSILON, standBackZ + d / 2),
  );
  const targetScale = useRef(new THREE.Vector3(w, h, d));

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const newW = ledgerWidthMm / 1000;
    const newH = ledgerHeightMm / 1000;
    const newD = ledgerDepthMm / 1000;
    const newStandBackZ = -(uprightThickness / 1000) / 2 + baseThickness / 1000;
    const newKerbH = kerbHeightMm / 1000;
    targetPos.current.set(
      0,
      newKerbH + newH / 2 + EPSILON,
      newStandBackZ + newD / 2,
    );
    targetScale.current.set(newW, newH, newD);
    const stillMoving =
      meshRef.current.position.distanceToSquared(targetPos.current) > 1e-10 ||
      meshRef.current.scale.distanceToSquared(targetScale.current) > 1e-10;
    if (stillMoving) {
      const alpha =
        isSizeAdjustmentActive || isDimensionPreviewActive
          ? 1
          : 1 - Math.exp(-14 * delta);
      meshRef.current.position.lerp(targetPos.current, alpha);
      meshRef.current.scale.lerp(targetScale.current, alpha);
      state.gl.shadowMap.needsUpdate = true;
      state.invalidate();
    }
  });

  return (
    <mesh
      ref={meshRef as React.RefObject<THREE.Mesh>}
      geometry={geometry}
      material={materialSet.materials}
      onClick={onClick}
      name="ledger"
    />
  );
}

function PreloadTexture({
  url,
  onReady,
}: {
  url: string;
  onReady: () => void;
}) {
  useTexture.preload(url);
  useTexture(url);
  useEffect(() => {
    const frame = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(frame);
  }, [onReady]);
  return null;
}

const LedgerSlab = forwardRef<THREE.Mesh, LedgerSlabProps>(function LedgerSlab(
  { onClick },
  ref,
) {
  const internalRef = useRef<THREE.Mesh>(null!);
  useImperativeHandle(ref, () => internalRef.current);

  const ledgerWidthMm = useHeadstoneStore((s) => s.ledgerWidthMm);
  const ledgerHeightMm = useHeadstoneStore((s) => s.ledgerHeightMm);
  const ledgerDepthMm = useHeadstoneStore((s) => s.ledgerDepthMm);
  const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
  const kerbHeightMm = useHeadstoneStore((s) => s.kerbHeightMm);
  const baseThickness = useHeadstoneStore((s) => s.baseThickness);
  const ledgerMaterialUrl = useHeadstoneStore((s) => s.ledgerMaterialUrl);

  const texUrl = ledgerMaterialUrl
    ? ledgerMaterialUrl.startsWith('/')
      ? ledgerMaterialUrl
      : `/${ledgerMaterialUrl}`
    : `${TEX_BASE}${DEFAULT_TEX}`;
  const [visibleTexUrl, setVisibleTexUrl] = React.useState(texUrl);
  const pendingTextureSwap = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pendingTextureSwap.current) clearTimeout(pendingTextureSwap.current);
    };
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <LedgerMesh
          texUrl={visibleTexUrl}
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
      {texUrl !== visibleTexUrl && (
        <Suspense fallback={null}>
          <PreloadTexture
            url={texUrl}
            onReady={() => {
              if (pendingTextureSwap.current)
                clearTimeout(pendingTextureSwap.current);
              pendingTextureSwap.current = setTimeout(() => {
                setVisibleTexUrl(texUrl);
                pendingTextureSwap.current = null;
              }, 300);
            }}
          />
        </Suspense>
      )}
    </>
  );
});

export default LedgerSlab;
