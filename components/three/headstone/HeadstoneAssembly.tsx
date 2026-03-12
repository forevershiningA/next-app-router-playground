// components/three/headstone/HeadstoneAssembly.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePathname } from 'next/navigation';

import ShapeSwapper from './ShapeSwapper';
import HeadstoneBaseAuto from './HeadstoneBaseAuto';
import LedgerSlab from './LedgerSlab';
import KerbsetBorder from './KerbsetBorder';
import RotatingBoxOutline from '../RotatingBoxOutline';
import SelectionBox from '../SelectionBox';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { useSelectSizePanelOpener } from '#/lib/useSelectSizePanelOpener';
import { FULL_MONUMENT_GROUP_NAME } from '../constants';
import { data } from '#/app/_internal/_data';
import LedgerSurfaceContent from './LedgerSurfaceContent';

export default function HeadstoneAssembly() {
  const pathname = usePathname();
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
  const showLedger = useHeadstoneStore((s) => s.showLedger);
  const showKerbset = useHeadstoneStore((s) => s.showKerbset);
  const baseHeightMm = useHeadstoneStore((s) => s.baseHeightMm);
  const ledgerDepthMm = useHeadstoneStore((s) => s.ledgerDepthMm);
  const headstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const baseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const productType = useHeadstoneStore((s) => s.catalog?.product.type);
  const borderName = useHeadstoneStore((s) => s.borderName);
  const isPlaque = productType === 'plaque';
  const isFullMonument = productType === 'full-monument';
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

  const ledgerOutlinePad = 0.004;
  const ledgerOutlineDepthPad = 0.002;
  const ledgerOutlineLineLength = 0.12;

  const kerbsetOutlinePad = 0.005;
  const kerbsetOutlineDepthPad = 0.003;
  const kerbsetOutlineLineLength = 0.10;
  const isSelectSizeRoute = pathname === '/select-size';
  const isSelectMaterialRoute = pathname === '/select-material';
  const shouldKeepPanelOpen = isSelectSizeRoute || isSelectMaterialRoute;
  const openSelectSizePanel = useSelectSizePanelOpener();

  // For full monument, shift the whole assembly back so the ledger/kerbset
  // is centred in view. Shifting by the full ledger depth places the headstone
  // behind the camera target and the ledger stretching forward into the scene.
  const zGroupOffset = isFullMonument ? -(ledgerDepthMm / 1000) : 0;
  
  // Convert base height from mm to meters
  const baseHeightMeters = baseHeightMm / 1000;

  const monumentGroupRef = useRef<THREE.Group>(null);
  const assemblyRef = useRef<THREE.Group>(null!);
  const tabletRef = useRef<THREE.Object3D>(null!);
  const baseRef = useRef<THREE.Mesh>(null!);
  const headstoneMeshRef = useRef<THREE.Mesh>(null!);
  const ledgerRef = useRef<THREE.Mesh>(null!);
  const kerbsetRef = useRef<THREE.Group>(null!);

  const selectedInscription = inscriptions.find(
    (inscription) => inscription.id === selectedInscriptionId,
  );

  useEffect(() => {
    if (!monumentGroupRef.current) return;
    monumentGroupRef.current.name = FULL_MONUMENT_GROUP_NAME;
  }, [isFullMonument]);

  return (
    <group ref={monumentGroupRef} position={[0, 0, zGroupOffset]}>
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
              if (!shouldKeepPanelOpen) {
                window.dispatchEvent(new CustomEvent('closeFullscreenPanel'));
              }
              openSelectSizePanel();
            }}
          />
        )}
      </group>

      {/* Ledger and kerbset sit at ground level; their Z is offset forward past the base */}
      <group>
        {showLedger && (
          <LedgerSlab
            ref={ledgerRef}
            onClick={(e) => {
              e.stopPropagation();
              setSelected('ledger');
              setEditingObject('ledger');
              setSelectedInscriptionId(null);
              if (!shouldKeepPanelOpen) {
                window.dispatchEvent(new CustomEvent('closeFullscreenPanel'));
              }
              openSelectSizePanel();
            }}
          />
        )}

        {showLedger && <LedgerSurfaceContent ledgerRef={ledgerRef} />}

        {showLedger && (
          <RotatingBoxOutline
            targetRef={ledgerRef}
            visible={selected === 'ledger'}
            color="#ffffff"
            pad={ledgerOutlinePad}
            depthPad={ledgerOutlineDepthPad}
            through={false}
            lineLength={ledgerOutlineLineLength}
            animateOnShow
            animationDuration={520}
          />
        )}

        {showKerbset && (
          <KerbsetBorder
            ref={kerbsetRef}
            onClick={(e) => {
              e.stopPropagation();
              setSelected('kerbset');
              setEditingObject('kerbset');
              setSelectedInscriptionId(null);
              if (!shouldKeepPanelOpen) {
                window.dispatchEvent(new CustomEvent('closeFullscreenPanel'));
              }
              openSelectSizePanel();
            }}
          />
        )}

        {showKerbset && (
          <RotatingBoxOutline
            targetRef={kerbsetRef}
            visible={selected === 'kerbset'}
            color="#ffffff"
            pad={kerbsetOutlinePad}
            depthPad={kerbsetOutlineDepthPad}
            through={false}
            lineLength={kerbsetOutlineLineLength}
            animateOnShow
            animationDuration={520}
          />
        )}
      </group>
    </group>
  );
}
