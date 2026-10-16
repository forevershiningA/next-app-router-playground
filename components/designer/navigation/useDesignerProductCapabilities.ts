'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';
import { stainlessSteelHeadstoneProductIds } from '#/components/designer/navigation/designer-navigation-config';

type UseDesignerProductCapabilitiesOptions = { productId: string | null };

export function useDesignerProductCapabilities({
  productId,
}: UseDesignerProductCapabilitiesOptions) {
  const catalog = useHeadstoneStore((state) => state.catalog);
  const baseMaterialUrl = useHeadstoneStore((state) => state.baseMaterialUrl);
  const editingObject = useHeadstoneStore((state) => state.editingObject);
  const showBase = useHeadstoneStore((state) => state.showBase);

  const isPlaque = catalog?.product.type === 'plaque';
  const isUrn = catalog?.product.type === 'urn';
  const hasBorder = catalog?.product?.border === '1';
  const isStainlessSteelHeadstone =
    stainlessSteelHeadstoneProductIds.has(productId ?? '') ||
    (catalog?.product?.type === 'headstone' &&
      catalog.product.name.toLowerCase().includes('stainless steel'));
  const supportsFlowerPots =
    catalog?.product.type === 'headstone' &&
    productId !== '8' &&
    productId !== '22';
  const isStainlessSteelBase =
    showBase && (baseMaterialUrl ?? '').includes('ss-swatch');
  const isGraniteBase = showBase && !isStainlessSteelBase;
  const canSelectStainlessGraniteBaseMaterial =
    isStainlessSteelHeadstone && isGraniteBase && editingObject === 'base';
  const mustShowMaterialStep = productId === '124';
  const shouldHideMaterialStep =
    !mustShowMaterialStep &&
    ((catalog?.product?.laser === '1' &&
      !canSelectStainlessGraniteBaseMaterial) ||
      (isStainlessSteelHeadstone && !canSelectStainlessGraniteBaseMaterial));

  return {
    isPlaque,
    isUrn,
    hasBorder,
    isStainlessSteelHeadstone,
    supportsFlowerPots,
    productLaser: catalog?.product?.laser,
    canSelectStainlessGraniteBaseMaterial,
    shouldHideMaterialStep,
  };
}
