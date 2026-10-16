'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';

type UseDesignerBackToMenuOptions = {
  closeFullscreenPanel: () => void;
  designerHref: (slug: string) => string;
  designerStepSlug: string | null;
  pathname: string | null;
};

export function useDesignerBackToMenu({
  closeFullscreenPanel,
  designerHref,
  designerStepSlug,
  pathname,
}: UseDesignerBackToMenuOptions) {
  const router = useRouter();
  const setCropCanvasData = useHeadstoneStore(
    (state) => state.setCropCanvasData,
  );

  return useCallback(() => {
    setCropCanvasData(null);
    closeFullscreenPanel();
    if (designerStepSlug && designerStepSlug !== 'design-menu' && pathname) {
      sessionStorage.setItem('designer:return-from-menu', pathname);
    }
    router.push(designerHref('design-menu'));
  }, [
    closeFullscreenPanel,
    designerHref,
    designerStepSlug,
    pathname,
    router,
    setCropCanvasData,
  ]);
}
