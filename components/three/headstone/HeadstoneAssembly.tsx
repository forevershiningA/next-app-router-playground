// components/three/headstone/HeadstoneAssembly.tsx
'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';

import ShapeSwapper from './ShapeSwapper';
import HeadstoneBaseAuto from './HeadstoneBaseAuto';
import BoxOutline from '../BoxOutline';
import { useHeadstoneStore } from '#/lib/headstone-store';

const BASE_H = 2;

export default function HeadstoneAssembly() {
  const selected = useHeadstoneStore((s) => s.selected);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
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
  const tabletRef = useRef<THREE.Object3D>(new THREE.Group());
  const baseRef = useRef<THREE.Mesh>(null!);
  const headstoneMeshRef = useRef<THREE.Mesh>(null!);

  const selectedInscription = inscriptions.find(
    (inscription) => inscription.id === selectedInscriptionId,
  );

  return (
    <>
      <group ref={assemblyRef} position={[0, BASE_H, 0]} visible={!loading}>
        <ShapeSwapper tabletRef={tabletRef} headstoneMeshRef={headstoneMeshRef} />

        <BoxOutline
          targetRef={headstoneMeshRef}
          visible={selected === 'headstone'}
          color="white"
          pad={0.004}
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
          <BoxOutline
            targetRef={selectedInscription.ref}
            visible={true}
            color="white"
            pad={0.02}
            through={false}
          />
        )}

        {selectedAdditionId && additionRefs[selectedAdditionId] && (
          <BoxOutline
            targetRef={additionRefs[selectedAdditionId]}
            visible={true}
            color="white"
            pad={0.02}
            through={false}
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
              setSelectedInscriptionId(null);
            }}
          />
        )}
      </group>
    </>
  );
}
