// components/three/headstone/HeadstoneAssembly.tsx
'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';

import ShapeSwapper from './ShapeSwapper';
import HeadstoneBaseAuto from './HeadstoneBaseAuto';
import BoxOutline from '../BoxOutline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';

const BASE_H = 2;

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
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const motifRefs = useHeadstoneStore((s) => s.motifRefs);
  const loading = useHeadstoneStore((s) => s.loading);
  const showBase = useHeadstoneStore((s) => s.showBase);

  const assemblyRef = useRef<THREE.Group>(null!);
  const tabletRef = useRef<THREE.Object3D>(new THREE.Group());
  const baseRef = useRef<THREE.Mesh>(null!);
  const headstoneMeshRef = useRef<THREE.Mesh>(null!);

  const selectedInscription = inscriptions.find(
    (inscription) => inscription.id === selectedInscriptionId,
  );

  // Check if selected addition is an application type (2D, flat on headstone)
  const isApplicationAddition = React.useMemo(() => {
    if (!selectedAdditionId) return false;
    
    // Extract base ID from instance ID (remove timestamp suffix)
    const baseId = selectedAdditionId.split('_')[0];
    const addition = data.additions.find((a) => a.id === baseId);
    
    // For now, show BoxOutline for ALL additions (not just 3D ones)
    // SelectionBox doesn't work well with the 3D coordinate system
    return false; // This will make BoxOutline show for all additions
  }, [selectedAdditionId]);

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
          <BoxOutline
            targetRef={selectedInscription.ref}
            visible={true}
            color="white"
            pad={0.02}
            through={false}
          />
        )}

        {/* Only show BoxOutline for 3D additions (statues, vases), not application type */}
        {selectedAdditionId && additionRefs[selectedAdditionId] && !isApplicationAddition && (
          <BoxOutline
            targetRef={additionRefs[selectedAdditionId]}
            visible={true}
            color="white"
            pad={0.02}
            through={false}
          />
        )}

        {/* Motifs are 2D, so don't show BoxOutline - they use SelectionBox instead */}
        {/* selectedMotifId && motifRefs[selectedMotifId] && (
          <BoxOutline
            targetRef={motifRefs[selectedMotifId]}
            visible={true}
            color="white"
            pad={0.02}
            through={false}
          />
        ) */}

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
