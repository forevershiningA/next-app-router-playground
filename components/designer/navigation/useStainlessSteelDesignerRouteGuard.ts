'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { useDesignerNavPanelState } from '#/components/designer/navigation/useDesignerNavPanelState';

type PanelState = Pick<
  ReturnType<typeof useDesignerNavPanelState>,
  'setActiveFullscreenPanel' | 'setPanelSource'
>;

type UseStainlessSteelDesignerRouteGuardOptions = PanelState & {
  canSelectStainlessGraniteBaseMaterial: boolean;
  designerHref: (slug: string) => string;
  designerStepSlug: string | null;
  isStainlessSteelHeadstone: boolean;
};

export function useStainlessSteelDesignerRouteGuard({
  canSelectStainlessGraniteBaseMaterial,
  designerHref,
  designerStepSlug,
  isStainlessSteelHeadstone,
  setActiveFullscreenPanel,
  setPanelSource,
}: UseStainlessSteelDesignerRouteGuardOptions) {
  const router = useRouter();
  const activePanel = useHeadstoneStore((state) => state.activePanel);
  const setActivePanel = useHeadstoneStore((state) => state.setActivePanel);

  useEffect(() => {
    if (
      !isStainlessSteelHeadstone ||
      (designerStepSlug !== 'select-material' &&
        designerStepSlug !== 'select-additions')
    ) {
      return;
    }

    if (
      designerStepSlug === 'select-material' &&
      canSelectStainlessGraniteBaseMaterial
    ) {
      return;
    }

    if (activePanel === 'addition') setActivePanel(null);
    setActiveFullscreenPanel(null);
    setPanelSource(null);
    router.replace(designerHref('select-size'));
  }, [
    activePanel,
    canSelectStainlessGraniteBaseMaterial,
    designerHref,
    designerStepSlug,
    isStainlessSteelHeadstone,
    router,
    setActiveFullscreenPanel,
    setActivePanel,
    setPanelSource,
  ]);
}
