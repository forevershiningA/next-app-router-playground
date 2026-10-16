'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { fullscreenPanelSlugs } from '#/components/designer/navigation/designer-navigation-config';

type UseDesignerCanvasStepNavigationOptions = {
  designerHref: (slug: string) => string;
  designerStepSlug: string | null;
  isCanvasVisible: boolean;
  isImageCropActive: boolean;
  canSelectStainlessGraniteBaseMaterial: boolean;
  openFullscreenPanel: (slug: string) => void;
  openSaveDesign: () => Promise<void>;
  setIsLoadingPanel: (isLoading: boolean) => void;
};

export function useDesignerCanvasStepNavigation({
  designerHref,
  designerStepSlug,
  isCanvasVisible,
  isImageCropActive,
  canSelectStainlessGraniteBaseMaterial,
  openFullscreenPanel,
  openSaveDesign,
  setIsLoadingPanel,
}: UseDesignerCanvasStepNavigationOptions) {
  const router = useRouter();
  const setActivePanel = useHeadstoneStore((state) => state.setActivePanel);
  const setEditingObject = useHeadstoneStore((state) => state.setEditingObject);
  const setSelected = useHeadstoneStore((state) => state.setSelected);

  const handleNavigateToPanel = useCallback(
    async (slug: string) => {
      if (isImageCropActive && slug !== 'select-images') return;
      if (fullscreenPanelSlugs.has(slug)) setIsLoadingPanel(true);

      if (slug === 'save-design') {
        await openSaveDesign();
        return;
      }
      if (slug === 'check-price') {
        setActivePanel('checkprice');
        return;
      }
      if (slug === 'select-shape' && isCanvasVisible) {
        openFullscreenPanel(slug);
        return;
      }

      if (slug === 'select-material' && canSelectStainlessGraniteBaseMaterial) {
        setEditingObject('base');
        setSelected('base');
      }

      if (designerStepSlug !== slug) {
        router.push(designerHref(slug));
      } else {
        openFullscreenPanel(slug);
      }
    },
    [
      canSelectStainlessGraniteBaseMaterial,
      designerHref,
      designerStepSlug,
      isCanvasVisible,
      isImageCropActive,
      openFullscreenPanel,
      openSaveDesign,
      router,
      setActivePanel,
      setEditingObject,
      setIsLoadingPanel,
      setSelected,
    ],
  );

  const navigationHandlerRef = useRef(handleNavigateToPanel);
  navigationHandlerRef.current = handleNavigateToPanel;

  useEffect(() => {
    const handleCanvasStepNavigation = (event: Event) => {
      const customEvent = event as CustomEvent<{ slug?: string }>;
      const slug = customEvent.detail?.slug;
      if (!slug) return;

      if (slug === 'select-product' || slug === 'corners' || slug === 'holes') {
        router.push(designerHref(slug));
        return;
      }

      void navigationHandlerRef.current(slug);
    };

    window.addEventListener('navigateDesignerStep', handleCanvasStepNavigation);
    return () =>
      window.removeEventListener(
        'navigateDesignerStep',
        handleCanvasStepNavigation,
      );
  }, [designerHref, router]);

  return handleNavigateToPanel;
}
