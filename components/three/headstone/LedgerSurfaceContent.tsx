'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import HeadstoneInscription from '../../HeadstoneInscription';
import MotifModel from '../MotifModel';
import ImageModel from '../ImageModel';
import AdditionModel from '../AdditionModel';
import type { HeadstoneAPI } from '../../SvgHeadstone';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';
import { useRouter, usePathname } from 'next/navigation';

type Props = { ledgerRef: React.RefObject<THREE.Mesh> };

const FONT_MAP: Record<string, string> = data.fonts.reduce(
  (map, font) => {
    map[font.name] = `/fonts/${font.image}`;
    return map;
  },
  {} as Record<string, string>,
);

export default function LedgerSurfaceContent({ ledgerRef }: Props) {
  const ledgerWidthMm = useHeadstoneStore((s) => s.ledgerWidthMm);
  const ledgerDepthMm = useHeadstoneStore((s) => s.ledgerDepthMm);
  const ledgerHeightMm = useHeadstoneStore((s) => s.ledgerHeightMm);
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const selectedImages = useHeadstoneStore((s) => s.selectedImages);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const additionOffsets = useHeadstoneStore((s) => s.additionOffsets);
  const selectedInscriptionId = useHeadstoneStore(
    (s) => s.selectedInscriptionId,
  );
  const setSelectedInscriptionId = useHeadstoneStore(
    (s) => s.setSelectedInscriptionId,
  );
  const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);
  const setSelectedAdditionId = useHeadstoneStore(
    (s) => s.setSelectedAdditionId,
  );
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  const groupRef = React.useRef<THREE.Group>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Force a re-render once the ledger mesh mounts so content is visible on initial load
  const [meshReady, setMeshReady] = React.useState(false);
  useFrame(() => {
    if (!meshReady && ledgerRef.current) {
      setMeshReady(true);
    }
  });

  const headstoneApi = React.useMemo<HeadstoneAPI>(() => {
    const worldWidth = (ledgerWidthMm || 0) / 1000;
    const worldHeight = (ledgerDepthMm || 0) / 1000;

    return {
      group: groupRef as React.RefObject<THREE.Group>,
      mesh: ledgerRef,
      frontZ: 0,
      unitsPerMeter: 1,
      version: 1,
      worldWidth,
      worldHeight,
    };
  }, [ledgerDepthMm, ledgerHeightMm, ledgerRef, ledgerWidthMm]);

  const ledgerInscriptions = React.useMemo(
    () => inscriptions.filter((line) => line.target === 'ledger'),
    [inscriptions],
  );

  const ledgerMotifs = React.useMemo(
    () =>
      selectedMotifs.filter(
        (motif) => motifOffsets[motif.id]?.target === 'ledger',
      ),
    [motifOffsets, selectedMotifs],
  );

  const ledgerImages = React.useMemo(
    () =>
      selectedImages.filter(
        (image) => (image.target ?? 'headstone') === 'ledger',
      ),
    [selectedImages],
  );

  const ledgerAdditionIds = React.useMemo(
    () =>
      selectedAdditions.filter(
        (id) =>
          (additionOffsets[id]?.targetSurface ?? 'headstone') === 'ledger',
      ),
    [additionOffsets, selectedAdditions],
  );

  const canRenderLedgerContent = !!ledgerRef.current || meshReady;

  return (
    <group ref={groupRef}>
      {canRenderLedgerContent &&
        ledgerInscriptions.map((line, index) => {
          const zBump = (ledgerInscriptions.length - 1 - index) * 0.00005;
          return (
            <React.Suspense key={line.id} fallback={null}>
              <HeadstoneInscription
                ref={line.ref}
                id={line.id}
                headstone={headstoneApi}
                surface="ledger"
                font={FONT_MAP[line.font] || `/fonts/${line.font}.woff2`}
                editable
                selected={selectedInscriptionId === line.id}
                onSelectInscription={() => {
                  setSelected('ledger');
                  setSelectedMotifId(null);
                  setSelectedAdditionId(null);
                  setSelectedInscriptionId(line.id);
                  setActivePanel('inscription');

                  if (pathname !== '/inscriptions') {
                    router.push('/inscriptions');
                  }

                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                      new CustomEvent('openFullscreenPanel', {
                        detail: { panel: 'inscriptions' },
                      }),
                    );
                  }
                }}
                color={line.color}
                lift={0.002}
                xPos={line.xPos}
                yPos={line.yPos}
                coordinateSpace={line.coordinateSpace}
                rotationDeg={line.rotationDeg}
                height={line.sizeMm}
                text={line.text}
                zBump={zBump}
              />
            </React.Suspense>
          );
        })}

      {canRenderLedgerContent &&
        ledgerMotifs.map((motif, index) => (
          <React.Suspense key={`${motif.id}-${index}`} fallback={null}>
            <MotifModel
              id={motif.id}
              svgPath={motif.svgPath}
              color={motif.color}
              headstone={headstoneApi}
              surface="ledger"
              index={index}
            />
          </React.Suspense>
        ))}

      {canRenderLedgerContent &&
        ledgerImages.map((image, index) => (
          <React.Suspense key={`${image.id}-${index}`} fallback={null}>
            <ImageModel
              id={image.id}
              imageUrl={image.imageUrl}
              widthMm={image.widthMm}
              heightMm={image.heightMm}
              xPos={image.xPos}
              yPos={image.yPos}
              rotationZ={image.rotationZ}
              typeId={image.typeId}
              maskShape={image.maskShape}
              headstone={headstoneApi}
              surface="ledger"
              index={index}
              coordinateSpace={image.coordinateSpace}
            />
          </React.Suspense>
        ))}

      {canRenderLedgerContent &&
        ledgerAdditionIds.map((additionId, index) => (
          <React.Suspense key={`${additionId}-${index}`} fallback={null}>
            <AdditionModel
              id={additionId}
              headstone={headstoneApi}
              surface="ledger"
              index={index}
            />
          </React.Suspense>
        ))}
    </group>
  );
}
