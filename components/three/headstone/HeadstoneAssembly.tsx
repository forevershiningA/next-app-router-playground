// components/three/headstone/HeadstoneAssembly.tsx
'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';

import ShapeSwapper from './ShapeSwapper';
import HeadstoneBaseAuto from './HeadstoneBaseAuto';
import BoxOutline from '../BoxOutline';
import SelectionBox from '../SelectionBox';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';

const BASE_H = 0.1;

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
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const additionRefs = useHeadstoneStore((s) => s.additionRefs);
  const loading = useHeadstoneStore((s) => s.loading);
  const showBase = useHeadstoneStore((s) => s.showBase);

  const assemblyRef = useRef<THREE.Group>(null!);
  const tabletRef = useRef<THREE.Object3D>(null!);
  const baseRef = useRef<THREE.Mesh>(null!);
  const headstoneMeshRef = useRef<THREE.Mesh>(null!);

  const selectedInscription = inscriptions.find(
    (inscription) => inscription.id === selectedInscriptionId,
  );
  
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const motifRefs = useHeadstoneStore((s) => s.motifRefs);

  return (
    <>
      <group ref={assemblyRef} position={[0, BASE_H, 0]} visible={!loading}>
        <ShapeSwapper tabletRef={tabletRef} headstoneMeshRef={headstoneMeshRef} />

        <BoxOutline
          targetRef={headstoneMeshRef}
          visible={selected === 'headstone'}
          color="white"
          pad={0.01}
          through={false}
        />

        <BoxOutline
          targetRef={baseRef}
          visible={selected === 'base'}
          color="white"
          pad={0.004}
          through={false}
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

        {/* Show SelectionBox for selected motif */}
        {selectedMotifId && motifRefs[selectedMotifId] && (
          <SelectionBox
            targetRef={motifRefs[selectedMotifId]}
            visible={true}
            color="#FF9800"
            pad={0.02}
            through={true}
            showHandles={true}
            handleSize={0.05}
          />
        )}

        {/* Show SelectionBox for selected addition */}
        {selectedAdditionId && additionRefs[selectedAdditionId] && (
          <SelectionBox
            targetRef={additionRefs[selectedAdditionId]}
            visible={true}
            color="#2196F3"
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
            height={BASE_H}
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
