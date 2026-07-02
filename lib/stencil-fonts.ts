import type { CatalogData } from '#/lib/xml-parser';

export const STAINLESS_LIGHT_TRANSMITTING_PRODUCT_ID = '1';
export const STAINLESS_LIGHT_REFLECTIVE_PRODUCT_ID = '23';
export const STAINLESS_DEFAULT_INSCRIPTION_FONT = 'Franklin Gothic Stencil';
export const DEFAULT_INSCRIPTION_FONT = 'Garamond';
const STAINLESS_HEADSTONE_PRODUCT_IDS = new Set([
  STAINLESS_LIGHT_TRANSMITTING_PRODUCT_ID,
  STAINLESS_LIGHT_REFLECTIVE_PRODUCT_ID,
]);

export function isStainlessHeadstoneProduct(
  productId: string | null | undefined,
  catalog: CatalogData | null | undefined,
) {
  if (STAINLESS_HEADSTONE_PRODUCT_IDS.has(productId ?? '')) return true;

  const productName = catalog?.product.name.toLowerCase() ?? '';
  return (
    catalog?.product.type === 'headstone' &&
    (productName.includes('stainless steel') || catalog.product.formula === 'Steel')
  );
}

export function getDefaultInscriptionFont(
  productId: string | null | undefined,
  catalog: CatalogData | null | undefined,
) {
  return isStainlessHeadstoneProduct(productId, catalog)
    ? STAINLESS_DEFAULT_INSCRIPTION_FONT
    : DEFAULT_INSCRIPTION_FONT;
}

export function isStencilFontName(fontName: string | null | undefined) {
  return (fontName ?? '').toLowerCase().endsWith(' stencil');
}
