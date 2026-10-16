'use client';

import { useCallback, useMemo } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import {
  getGuidedQuickNavSlugs,
  getNavigablePanelSlugs,
  menuItems,
} from '#/components/designer/navigation/designer-navigation-config';

interface UseGuidedNavigationOptions {
  productId: string | null;
  isPlaque: boolean;
  isUrn: boolean;
  isStainlessSteelHeadstone: boolean;
  hasBorder: boolean;
  shouldHideMaterialStep: boolean;
  productLaser: string | undefined;
  activeFullscreenPanel: string | null;
  designerStepSlug: string | null;
}

export function useGuidedNavigation({
  productId,
  isPlaque,
  isUrn,
  isStainlessSteelHeadstone,
  hasBorder,
  shouldHideMaterialStep,
  productLaser,
  activeFullscreenPanel,
  designerStepSlug,
}: UseGuidedNavigationOptions) {
  const cropCanvasData = useHeadstoneStore((state) => state.cropCanvasData);
  const navigablePanelSlugs = useMemo(
    () =>
      getNavigablePanelSlugs({
        productId,
        isPlaque,
        isStainlessSteelHeadstone,
        hasBorder,
        shouldHideMaterialStep,
        productLaser,
      }),
    [
      hasBorder,
      isPlaque,
      isStainlessSteelHeadstone,
      productId,
      productLaser,
      shouldHideMaterialStep,
    ],
  );

  const guidedQuickNavSlugs = useMemo(
    () => getGuidedQuickNavSlugs(navigablePanelSlugs),
    [navigablePanelSlugs],
  );

  const currentSlugFromPathname = designerStepSlug ?? '';
  const currentPanelIndex = activeFullscreenPanel
    ? navigablePanelSlugs.indexOf(activeFullscreenPanel)
    : navigablePanelSlugs.indexOf(currentSlugFromPathname);
  const prevPanelSlug =
    currentPanelIndex > 0 ? navigablePanelSlugs[currentPanelIndex - 1] : null;
  const nextPanelSlug =
    currentPanelIndex >= 0 && currentPanelIndex < navigablePanelSlugs.length - 1
      ? navigablePanelSlugs[currentPanelIndex + 1]
      : null;
  const isImageCropActive =
    activeFullscreenPanel === 'select-images' && Boolean(cropCanvasData);

  const getPanelDisplayName = useCallback(
    (slug: string | null) =>
      slug === 'select-material' &&
      (productId === '5' || productId === '32' || isUrn)
        ? 'Select Background'
        : menuItems.find((item) => item.slug === slug)?.name,
    [isUrn, productId],
  );

  return {
    navigablePanelSlugs,
    guidedQuickNavSlugs,
    currentSlugFromPathname,
    currentPanelIndex,
    prevPanelSlug,
    nextPanelSlug,
    isImageCropActive,
    prevPanelTitle: prevPanelSlug
      ? getPanelDisplayName(prevPanelSlug)
      : undefined,
    nextPanelTitle: nextPanelSlug
      ? getPanelDisplayName(nextPanelSlug)
      : undefined,
    getPanelDisplayName,
  };
}
