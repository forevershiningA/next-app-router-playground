'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { data } from '#/app/_internal/_data';
import { getDesignerProductStepHref } from '#/lib/designer-product-routes';
import {
  getDesignerStepSlug,
  isDesignerStepSlug,
} from '#/lib/designer-route-state';

type UseDesignerProductConversionOptions = { productId: string | null };

export function useDesignerProductConversion({
  productId,
}: UseDesignerProductConversionOptions) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const designerStepSlug = getDesignerStepSlug(pathname);

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!productId) setIsOpen(false);
  }, [productId]);

  const toggle = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!productId) return;
    setIsOpen((previous) => !previous);
  };

  const close = () => setIsOpen(false);

  const selectProduct = (selectedProductId: string) => {
    if (!selectedProductId) return;
    setIsOpen(false);
    const currentStep = isDesignerStepSlug(designerStepSlug)
      ? designerStepSlug
      : 'design-menu';
    router.replace(getDesignerProductStepHref(currentStep, selectedProductId));
  };

  return {
    isOpen,
    toggle,
    close,
    selectProduct,
    products: data.products || [],
  };
}
