'use client';

import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { fullscreenPanelSlugs } from '#/components/designer/navigation/designer-navigation-config';

type UseDesignerMenuClickOptions = {
  canSelectStainlessGraniteBaseMaterial: boolean;
  designerHref: (slug: string) => string;
  designerStepSlug: string | null;
  isCanvasVisible: boolean;
  openFullscreenPanel: (slug: string) => void;
  openSaveDesign: () => Promise<void>;
  setIsLoadingPanel: (isLoading: boolean) => void;
};

export function useDesignerMenuClick({
  canSelectStainlessGraniteBaseMaterial,
  designerHref,
  designerStepSlug,
  isCanvasVisible,
  openFullscreenPanel,
  openSaveDesign,
  setIsLoadingPanel,
}: UseDesignerMenuClickOptions) {
  const router = useRouter();
  const setActivePanel = useHeadstoneStore((state) => state.setActivePanel);
  const setEditingObject = useHeadstoneStore((state) => state.setEditingObject);
  const setSelected = useHeadstoneStore((state) => state.setSelected);

  return useCallback(
    async (slug: string, event: MouseEvent) => {
      if (fullscreenPanelSlugs.has(slug)) {
        event.preventDefault();
        setIsLoadingPanel(true);
        if (
          slug === 'select-material' &&
          canSelectStainlessGraniteBaseMaterial
        ) {
          setEditingObject('base');
          setSelected('base');
        }

        const keepCanvasVisibleForShape =
          slug === 'select-shape' && isCanvasVisible;
        if (!keepCanvasVisibleForShape && designerStepSlug !== slug) {
          // Navigate first so route synchronization opens the panel on the new route.
          router.push(designerHref(slug));
        } else {
          openFullscreenPanel(slug);
        }
        return;
      }

      if (slug === 'check-price') {
        event.preventDefault();
        setActivePanel('checkprice');
      }

      if (slug === 'save-design') {
        event.preventDefault();
        await openSaveDesign();
      }
    },
    [
      canSelectStainlessGraniteBaseMaterial,
      designerHref,
      designerStepSlug,
      isCanvasVisible,
      openFullscreenPanel,
      openSaveDesign,
      router,
      setActivePanel,
      setEditingObject,
      setIsLoadingPanel,
      setSelected,
    ],
  );
}
