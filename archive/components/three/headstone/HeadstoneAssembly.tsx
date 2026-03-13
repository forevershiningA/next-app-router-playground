// components/three/headstone/HeadstoneAssembly.tsx
'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';

import ShapeSwapper from './ShapeSwapper';
import HeadstoneBaseAuto from './HeadstoneBaseAuto';
import RotatingBoxOutline from '../RotatingBoxOutline';
import SelectionBox from '../SelectionBox';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';

export default function HeadstoneAssembly() {
  const selected = useHeadstoneStore((s) => s.selected);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const selectedInscriptionId = useHeadstoneStore(
    (s) => s.selectedInscriptionId,
  );
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);
  const setSelectedInscriptionId = useHeadstoneStore(
    (s) => s.setSelectedInscriptionId,
  );
  const loading = useHeadstoneStore((s) => s.loading);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const baseHeightMm = useHeadstoneStore((s) => s.baseHeightMm);
  const headstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const baseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const productType = useHeadstoneStore((s) => s.catalog?.product.type);
  const borderName = useHeadstoneStore((s) => s.borderName);
  const isPlaque = productType === 'plaque';
  const hasBorder =
    isPlaque && borderName ? !borderName.toLowerCase().includes('no border') : false;
  const headstoneOutlinePad = isPlaque ? 0.0012 : 0.006;
  const headstoneOutlineDepthPad = isPlaque
    ? hasBorder
      ? 0.0018
      : 0.0009
    : 0.0008;
  const headstoneOutlineLineLength = isPlaque ? 0.12 : 0.15;
  const headstoneOutlineThrough = false;
  const headstoneBottomLift = isPlaque ? 0.002 : 0.009;
  const headstoneFrontExtension = hasBorder ? 0.0055 : 0;
  const baseOutlinePad = isPlaque ? 0.001 : 0.004;
  const baseOutlineDepthPad = isPlaque ? 0.0009 : 0.0006;
  const baseOutlineLineLength = isPlaque ? 0.12 : 0.15;
  const baseOutlineThrough = false;
  const baseBottomLift = isPlaque ? 0.002 : 0.006;
  
  // Convert base height from mm to meters
  const baseHeightMeters = baseHeightMm / 1000;

  const assemblyRef = useRef<THREE.Group>(null!);
  const tabletRef = useRef<THREE.Object3D>(null!);
  const baseRef = useRef<THREE.Mesh>(null!);
  const headstoneMeshRef = useRef<THREE.Mesh>(null!);

  const selectedInscription = inscriptions.find(
    (inscription) => inscription.id === selectedInscriptionId,
  );

  return (
    <>
      <group ref={assemblyRef} position={[0, baseHeightMeters, 0]}>
        <ShapeSwapper tabletRef={tabletRef} headstoneMeshRef={headstoneMeshRef} />

        {/* Elegant Selection Indicators - Viewfinder Corners */}
        <RotatingBoxOutline
          targetRef={headstoneMeshRef}
          visible={selected === 'headstone'}
          color="#ffffff"
          pad={headstoneOutlinePad}
          depthPad={headstoneOutlineDepthPad}
          frontExtension={headstoneFrontExtension}
          through={headstoneOutlineThrough}
          lineLength={headstoneOutlineLineLength}
          bottomLift={headstoneBottomLift}
          animateOnShow
          animationDuration={520}
        />

        <RotatingBoxOutline
          targetRef={baseRef}
          visible={selected === 'base'}
          color="#ffffff"
          pad={baseOutlinePad}
          depthPad={baseOutlineDepthPad}
          through={baseOutlineThrough}
          lineLength={baseOutlineLineLength}
          bottomLift={baseBottomLift}
          animateOnShow
          animationDuration={520}
        />

        {selectedInscription && (
          <SelectionBox
            targetRef={selectedInscription.ref}
            visible={true}
            color="#4CAF50"
            pad={0.02}
            through={true}
            showHandles={true}
            handleSize={0.05}
          />
        )}

        {showBase && (
          <HeadstoneBaseAuto
            ref={baseRef}
            headstoneObject={tabletRef}
            wrapper={assemblyRef}
            name="base"
            height={baseHeightMeters}
            onClick={(e) => {
              e.stopPropagation();
              setSelected('base');
              setEditingObject('base');
              setSelectedInscriptionId(null);
            }}
          />
        )}
      </group>
    </>
  );
}
