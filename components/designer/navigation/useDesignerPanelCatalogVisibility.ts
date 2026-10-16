'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';
import { useDesignerNavPanelState } from '#/components/designer/navigation/useDesignerNavPanelState';

type PanelState = Pick<
  ReturnType<typeof useDesignerNavPanelState>,
  | 'activeFullscreenPanel'
  | 'forceAdditionCatalog'
  | 'forceMotifCatalog'
  | 'panelSource'
>;

type UseDesignerPanelCatalogVisibilityOptions = PanelState & {
  designerStepSlug: string | null;
};

export function useDesignerPanelCatalogVisibility({
  activeFullscreenPanel,
  forceAdditionCatalog,
  forceMotifCatalog,
  designerStepSlug,
  panelSource,
}: UseDesignerPanelCatalogVisibilityOptions) {
  const activePanel = useHeadstoneStore((state) => state.activePanel);
  const additionOffsets = useHeadstoneStore((state) => state.additionOffsets);
  const selectedAdditionId = useHeadstoneStore(
    (state) => state.selectedAdditionId,
  );
  const selectedMotifId = useHeadstoneStore((state) => state.selectedMotifId);

  const hasActiveAdditionForPanel =
    !!selectedAdditionId &&
    !!additionOffsets[selectedAdditionId] &&
    activePanel === 'addition';
  const isAdditionCatalogVisible =
    activeFullscreenPanel === 'select-additions' &&
    (forceAdditionCatalog ||
      panelSource === 'menu' ||
      (panelSource === null && designerStepSlug === 'select-additions')) &&
    !hasActiveAdditionForPanel;
  const isMotifCatalogVisible =
    activeFullscreenPanel === 'select-motifs' &&
    (forceMotifCatalog || !selectedMotifId);
  const shouldShowBackToListButton =
    (activeFullscreenPanel === 'select-additions' &&
      !isAdditionCatalogVisible) ||
    (activeFullscreenPanel === 'select-motifs' && !isMotifCatalogVisible);

  return {
    isAdditionCatalogVisible,
    isMotifCatalogVisible,
    shouldShowBackToListButton,
  };
}
