'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { getDesignerProductStepHref } from '#/lib/designer-product-routes';
import {
  getDesignerStepSlug,
  isDesignerStepSlug,
} from '#/lib/designer-route-state';

export function useDesignerNavigationRoute() {
  const pathname = usePathname();
  const router = useRouter();
  const designerStepSlug = getDesignerStepSlug(pathname);
  const productId = useHeadstoneStore((state) => state.productId);
  const designerHref = useCallback(
    (slug: string) =>
      isDesignerStepSlug(slug)
        ? getDesignerProductStepHref(slug, productId)
        : `/${slug}`,
    [productId],
  );

  return { pathname, router, designerStepSlug, productId, designerHref };
}
