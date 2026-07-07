'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getDesignerProductStepHref } from '#/lib/designer-product-routes';
import { getDesignerStepSlug } from '#/lib/designer-route-state';
import { useHeadstoneStore } from '#/lib/headstone-store';

export function useSelectSizePanelOpener() {
  const router = useRouter();
  const pathname = usePathname();
  const productId = useHeadstoneStore((s) => s.productId);

  return useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('openFullscreenPanel', {
          detail: { panel: 'select-size' },
        }),
      );
    }

    if (getDesignerStepSlug(pathname) !== 'select-size') {
      router.push(getDesignerProductStepHref('select-size', productId));
    }
  }, [pathname, productId, router]);
}
