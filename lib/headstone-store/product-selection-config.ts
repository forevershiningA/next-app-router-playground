import type { HeadstoneState } from '#/lib/headstone-store.types';
import type { CatalogData } from '#/lib/xml-parser';

type PreviousProductSelection = Pick<
  HeadstoneState,
  'catalog' | 'widthMm' | 'heightMm'
>;

export function deriveProductSelectionConfig(
  catalog: CatalogData,
  previous: PreviousProductSelection,
) {
  const productType = catalog.product.type;
  const isPlaque = productType === 'plaque';
  const isHeadstoneLike =
    productType === 'headstone' || productType === 'mini-headstone';
  const showBase =
    isHeadstoneLike ||
    productType === 'monument' ||
    productType === 'full-monument' ||
    productType === 'urn';
  const isFullMonument = productType === 'full-monument';
  const showInscriptionColor =
    catalog.product.laser !== '1' && catalog.product.color !== '0';
  const productDefaultColor =
    catalog.product.defaultColor ||
    (catalog.product.laser === '1' ? '#ffffff' : '#c99d44');

  const previousProductType = previous.catalog?.product?.type;
  const previousWasPlaque =
    previousProductType === 'plaque' || previousProductType === 'bronze_plaque';
  const previousWasSquare610 =
    Math.abs(previous.widthMm - previous.heightMm) <= 5 &&
    Math.abs(previous.widthMm - 610) <= 20 &&
    Math.abs(previous.heightMm - 610) <= 20;

  return {
    isPlaque,
    showBase,
    isFullMonument,
    showInscriptionColor,
    productDefaultColor,
    shouldForceSquarePlaque:
      isPlaque && (previousWasSquare610 || !previousWasPlaque),
    supportsBorder: isPlaque && catalog.product.border === '1',
    isFullColourPlaque: catalog.product.id === '32',
    isBronzePlaqueProduct: catalog.product.id === '5',
    isUrnProduct: productType === 'urn',
  };
}
