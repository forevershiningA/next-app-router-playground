'use client';

import { usePathname } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import InscriptionEditPanel from '#/components/designer/panels/InscriptionEditPanel';
import MaterialSelector from '#/components/designer/selectors/MaterialSelector';
import ShapeSelector from '#/components/designer/selectors/ShapeSelector';
import BorderSelector from '#/components/designer/selectors/BorderSelector';
import FixingSelector from '#/components/designer/selectors/FixingSelector';
import ImageSelector from '#/components/designer/selectors/ImageSelector';
import SelectAdditionsPanel from '#/components/designer/navigation/SelectAdditionsPanel';
import SelectMotifsPanel from '#/components/designer/navigation/SelectMotifsPanel';
import SelectEmblemsPanel from '#/components/designer/navigation/SelectEmblemsPanel';
import SelectSizePanel from '#/components/designer/navigation/SelectSizePanel';
import { useDesignerProductCapabilities } from '#/components/designer/navigation/useDesignerProductCapabilities';
import { getDesignerStepSlug } from '#/lib/designer-route-state';

type PanelSource = 'menu' | 'canvas' | null;

type FullscreenDesignerPanelContentProps = {
  activePanel: string | null;
  isLoading: boolean;
  panelSource: PanelSource;
  forceAdditionCatalog: boolean;
  forceMotifCatalog: boolean;
};

function PanelLoading({ label }: { label: string }) {
  return (
    <div role="status" className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          aria-hidden="true"
          className="day:border-[#d8cfbf] day:border-t-[#9a742f] h-12 w-12 animate-spin rounded-full border-4 border-[#3A3A3A] border-t-white"
        />
        <p className="day:text-[#625a51] text-sm text-white/60">
          Loading {label}…
        </p>
      </div>
    </div>
  );
}

export default function FullscreenDesignerPanelContent({
  activePanel,
  isLoading,
  panelSource,
  forceAdditionCatalog,
  forceMotifCatalog,
}: FullscreenDesignerPanelContentProps) {
  const pathname = usePathname();
  const stepSlug = getDesignerStepSlug(pathname);
  const productId = useHeadstoneStore((state) => state.productId);
  const materials = useHeadstoneStore((state) => state.materials);
  const shapes = useHeadstoneStore((state) => state.shapes);
  const borders = useHeadstoneStore((state) => state.borders);
  const {
    isPlaque,
    isUrn,
    isStainlessSteelHeadstone,
    supportsFlowerPots,
    canSelectStainlessGraniteBaseMaterial,
  } = useDesignerProductCapabilities({ productId });

  return (
    <>
      {activePanel === 'select-size' && (
        <SelectSizePanel
          isPlaque={isPlaque}
          isStainlessSteelHeadstone={isStainlessSteelHeadstone}
          supportsFlowerPots={supportsFlowerPots}
        />
      )}
      {activePanel === 'select-shape' &&
        (isLoading ? (
          <PanelLoading label="shapes" />
        ) : (
          <div className="space-y-6">
            <ShapeSelector shapes={shapes} navigateAfterSelect={false} />
          </div>
        ))}
      {activePanel === 'select-material' &&
        (isLoading ? (
          <PanelLoading
            label={productId === '32' || isUrn ? 'backgrounds' : 'materials'}
          />
        ) : (
          <div className="space-y-6">
            <MaterialSelector
              materials={materials}
              forceTarget={
                canSelectStainlessGraniteBaseMaterial ? 'base' : undefined
              }
            />
          </div>
        ))}
      {activePanel === 'select-border' &&
        (isLoading ? (
          <PanelLoading label="borders" />
        ) : (
          <div className="space-y-6">
            <div className="day:border-[#ddd2c2] day:bg-[#f4f1eb]/95 overflow-hidden rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-3 shadow-xl backdrop-blur-sm md:h-[calc(100vh-220px)] md:p-4">
              <div className="overflow-y-auto pr-1 md:h-full">
                <BorderSelector
                  borders={borders}
                  disableInternalScroll
                  isPlaque={isPlaque}
                />
              </div>
            </div>
          </div>
        ))}
      {activePanel === 'select-fastening' && (
        <div className="space-y-6">
          <div className="day:border-[#ddd2c2] day:bg-[#f4f1eb]/95 overflow-hidden rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-3 shadow-xl backdrop-blur-sm md:p-4">
            <FixingSelector />
          </div>
        </div>
      )}
      {activePanel === 'inscriptions' &&
        (isLoading ? (
          <PanelLoading label="inscriptions" />
        ) : (
          <div className="space-y-6">
            <InscriptionEditPanel />
          </div>
        ))}
      {activePanel === 'select-additions' &&
        (isLoading ? (
          <PanelLoading label="additions" />
        ) : (
          <SelectAdditionsPanel
            forceAdditionCatalog={forceAdditionCatalog}
            panelSource={panelSource}
            isSelectAdditionsPage={stepSlug === 'select-additions'}
          />
        ))}
      {activePanel === 'select-images' &&
        (isLoading ? (
          <PanelLoading label="images" />
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex-1">
              <ImageSelector />
            </div>
          </div>
        ))}
      {activePanel === 'select-motifs' &&
        (isLoading ? (
          <PanelLoading label="motifs" />
        ) : (
          <SelectMotifsPanel
            activeFullscreenPanel={activePanel}
            forceMotifCatalog={forceMotifCatalog}
            isStainlessSteelHeadstone={isStainlessSteelHeadstone}
          />
        ))}
      {activePanel === 'select-emblems' &&
        (isLoading ? <PanelLoading label="emblems" /> : <SelectEmblemsPanel />)}
    </>
  );
}
