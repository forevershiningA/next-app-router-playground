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
          pad={0.02}
          through={false}
          lineLength={0.15}
        />

        <RotatingBoxOutline
          targetRef={baseRef}
          visible={selected === 'base'}
          color="#ffffff"
          pad={0.01}
          through={false}
          lineLength={0.15}
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
