'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { useHeadstoneStore } from '#/lib/headstone-store';
import {
  createPolishedGraniteMaterial,
  configureGraniteTexture,
} from '#/lib/granite-material';
import { DEFAULT_TEX, TEX_BASE } from '#/lib/headstone-constants';
import { FULL_MONUMENT_GROUP_NAME, UPRIGHT_ASSEMBLY_NAME } from '../constants';

const BLACK_GRANITE_URL = `${TEX_BASE}Noble-Black.webp`;
function resolveTextureUrl(url: string | null) {
  if (!url) return `${TEX_BASE}${DEFAULT_TEX}`;
  if (url.startsWith('/') || url.startsWith('http')) return url;
  return `/${url}`;
}

type StoneBoxProps = {
  name: string;
  position: [number, number, number];
  scale: [number, number, number];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
};

function StoneBox({
  name,
  position,
  scale,
  geometry,
  material,
  onClick,
}: StoneBoxProps) {
  return (
    <mesh
      name={name}
      position={position}
      scale={scale}
      geometry={geometry}
      material={material}
      castShadow
      receiveShadow
      onClick={onClick}
    />
  );
}

/**
 * Parametric Polish two-place monument.
 *
 * The proportions deliberately follow a contemporary Polish construction:
 * two stepped foundation courses, a raised tomb body, two independent lids,
 * and a three-part upright with a taller contrasting centre panel.
 */
export default function PolishMonumentAssembly() {
  const catalog = useHeadstoneStore((state) => state.catalog);
  const ledgerWidthMm = useHeadstoneStore((state) => state.ledgerWidthMm);
  const ledgerHeightMm = useHeadstoneStore((state) => state.ledgerHeightMm);
  const ledgerDepthMm = useHeadstoneStore((state) => state.ledgerDepthMm);
  const kerbWidthMm = useHeadstoneStore((state) => state.kerbWidthMm);
  const kerbHeightMm = useHeadstoneStore((state) => state.kerbHeightMm);
  const kerbDepthMm = useHeadstoneStore((state) => state.kerbDepthMm);
  const widthMm = useHeadstoneStore((state) => state.widthMm);
  const heightMm = useHeadstoneStore((state) => state.heightMm);
  const uprightThickness = useHeadstoneStore((state) => state.uprightThickness);
  const baseHeightMm = useHeadstoneStore((state) => state.baseHeightMm);
  const baseMaterialUrl = useHeadstoneStore((state) => state.baseMaterialUrl);
  const ledgerMaterialUrl = useHeadstoneStore((state) => state.ledgerMaterialUrl);
  const headstoneMaterialUrl = useHeadstoneStore(
    (state) => state.headstoneMaterialUrl,
  );
  const setSelected = useHeadstoneStore((state) => state.setSelected);
  const setEditingObject = useHeadstoneStore((state) => state.setEditingObject);
  const setLoading = useHeadstoneStore((state) => state.setLoading);

  const bodyTextureUrl = resolveTextureUrl(
    ledgerMaterialUrl ?? baseMaterialUrl ?? headstoneMaterialUrl,
  );
  const uprightTextureUrl = resolveTextureUrl(
    headstoneMaterialUrl ?? ledgerMaterialUrl ?? baseMaterialUrl,
  );
  const [bodyTexture, uprightTexture, blackTexture] = useTexture([
    bodyTextureUrl,
    uprightTextureUrl,
    BLACK_GRANITE_URL,
  ]);

  const geometry = useMemo(
    () => new RoundedBoxGeometry(1, 1, 1, 2, 0.012),
    [],
  );

  const materials = useMemo(() => {
    const bodyMap = bodyTexture.clone();
    const uprightMap = uprightTexture.clone();
    const blackMap = blackTexture.clone();
    configureGraniteTexture(bodyMap, { repeatX: 5, repeatY: 5 });
    configureGraniteTexture(uprightMap, { repeatX: 3, repeatY: 3 });
    configureGraniteTexture(blackMap, { repeatX: 2, repeatY: 2 });

    return {
      body: createPolishedGraniteMaterial({
        texture: bodyMap,
        roughness: 0.22,
        envMapIntensity: 1.35,
      }),
      upright: createPolishedGraniteMaterial({
        texture: uprightMap,
        roughness: 0.16,
        envMapIntensity: 1.65,
      }),
      black: createPolishedGraniteMaterial({
        texture: blackMap,
        roughness: 0.12,
        envMapIntensity: 1.9,
      }),
    };
  }, [blackTexture, bodyTexture, uprightTexture]);

  useEffect(
    () => () => {
      geometry.dispose();
      Object.values(materials).forEach((material) => {
        material.map?.dispose();
        material.dispose();
      });
    },
    [geometry, materials],
  );

  // This assembly loads its textures directly instead of going through
  // ShapeSwapper. Releasing the shared loading gate re-enables OrbitControls.
  useEffect(() => {
    setLoading(false);
  }, [materials, setLoading]);

  const monumentRef = useRef<THREE.Group>(null);
  const uprightRef = useRef<THREE.Group>(null);

  const bodyWidth = kerbWidthMm / 1000;
  const bodyDepth = kerbDepthMm / 1000;
  const bodyHeight = kerbHeightMm / 1000;
  const lidWidth = Math.min(ledgerWidthMm / 1000, bodyWidth - 0.08);
  const lidDepth = Math.min(ledgerDepthMm / 1000, bodyDepth - 0.08);
  const lidHeight = ledgerHeightMm / 1000;
  const tabletWidth = Math.min(widthMm / 1000, bodyWidth - 0.16);
  // The catalog height remains the editable manufacturing dimension, while
  // this collection uses a lower, wider Polish silhouette than a headstone.
  const sidePanelHeight = (heightMm / 1000) * 0.72;
  const centrePanelHeight = sidePanelHeight * 1.18;
  const tabletDepth = uprightThickness / 1000;
  const lowerStepHeight = Math.max(0.09, baseHeightMm / 1000 * 0.48);
  const upperStepHeight = Math.max(0.07, baseHeightMm / 1000 * 0.36);
  const foundationHeight = lowerStepHeight + upperStepHeight;
  const bodyBottom = foundationHeight;
  const bodyTop = bodyBottom + bodyHeight;
  const lidTop = bodyTop + lidHeight;
  const plinthHeight = Math.max(0.11, baseHeightMm / 1000 * 0.52);
  const plinthDepth = Math.max(0.26, tabletDepth + 0.16);
  const plinthZ = -bodyDepth / 2 + plinthDepth / 2 + 0.03;
  const panelBottom = lidTop + plinthHeight;
  const panelZ = -bodyDepth / 2 + tabletDepth / 2 + 0.015;
  const assemblyZOffset = -lidDepth;
  const lidGap = Math.max(0.024, lidWidth * 0.018);
  const halfLidWidth = (lidWidth - lidGap) / 2;
  const sideWidth = tabletWidth * 0.36;
  const centreWidth = tabletWidth * 0.22;
  const panelGap = Math.max(0.018, tabletWidth * 0.012);
  const sideX = centreWidth / 2 + panelGap + sideWidth / 2;

  const select = (part: 'headstone' | 'base' | 'ledger' | 'kerbset') =>
    (event: ThreeEvent<MouseEvent>) => {
      if (event.delta > 4) return;
      event.stopPropagation();
      setEditingObject(part);
      setSelected(part);
    };

  if (catalog?.product.assembly !== 'polish-traditional-double') return null;

  return (
    <group
      ref={monumentRef}
      name={FULL_MONUMENT_GROUP_NAME}
      position={[0, -0.018, assemblyZOffset]}
    >
      <StoneBox
        name="polish-foundation-lower"
        position={[0, lowerStepHeight / 2, bodyDepth / 2]}
        scale={[bodyWidth + 0.28, lowerStepHeight, bodyDepth + 0.24]}
        geometry={geometry}
        material={materials.body}
        onClick={select('base')}
      />
      <StoneBox
        name="polish-foundation-upper"
        position={[0, lowerStepHeight + upperStepHeight / 2, bodyDepth / 2]}
        scale={[bodyWidth + 0.14, upperStepHeight, bodyDepth + 0.12]}
        geometry={geometry}
        material={materials.body}
        onClick={select('base')}
      />

      <StoneBox
        name="polish-tomb-body"
        position={[0, bodyBottom + bodyHeight / 2, bodyDepth / 2]}
        scale={[bodyWidth, bodyHeight, bodyDepth]}
        geometry={geometry}
        material={materials.body}
        onClick={select('kerbset')}
      />
      <StoneBox
        name="polish-shadow-course"
        position={[0, bodyTop - 0.025, bodyDepth / 2 + 0.012]}
        scale={[bodyWidth + 0.025, 0.045, bodyDepth + 0.025]}
        geometry={geometry}
        material={materials.black}
        onClick={select('kerbset')}
      />

      {([-1, 1] as const).map((direction) => (
        <StoneBox
          key={direction}
          name={direction < 0 ? 'polish-lid-left' : 'polish-lid-right'}
          position={[
            direction * (halfLidWidth / 2 + lidGap / 2),
            bodyTop + lidHeight / 2,
            bodyDepth / 2,
          ]}
          scale={[halfLidWidth, lidHeight, lidDepth]}
          geometry={geometry}
          material={materials.upright}
          onClick={select('ledger')}
        />
      ))}

      <group ref={uprightRef} name={UPRIGHT_ASSEMBLY_NAME}>
        <StoneBox
          name="polish-upright-plinth"
          position={[0, lidTop + plinthHeight / 2, plinthZ]}
          scale={[tabletWidth + 0.18, plinthHeight, plinthDepth]}
          geometry={geometry}
          material={materials.upright}
          onClick={select('base')}
        />
        <StoneBox
          name="polish-tablet-left"
          position={[-sideX, panelBottom + sidePanelHeight / 2, panelZ]}
          scale={[sideWidth, sidePanelHeight, tabletDepth]}
          geometry={geometry}
          material={materials.upright}
          onClick={select('headstone')}
        />
        <StoneBox
          name="polish-tablet-centre"
          position={[0, panelBottom + centrePanelHeight / 2, panelZ - 0.02]}
          scale={[centreWidth, centrePanelHeight, tabletDepth + 0.025]}
          geometry={geometry}
          material={materials.black}
          onClick={select('headstone')}
        />
        <StoneBox
          name="polish-tablet-right"
          position={[sideX, panelBottom + sidePanelHeight / 2, panelZ]}
          scale={[sideWidth, sidePanelHeight, tabletDepth]}
          geometry={geometry}
          material={materials.upright}
          onClick={select('headstone')}
        />
      </group>
    </group>
  );
}

