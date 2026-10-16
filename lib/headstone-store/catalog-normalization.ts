import type { CatalogData } from '#/lib/xml-parser';
import { normalizeThreeColorValue } from '#/lib/headstone-store/color-utils';

export function normalizeCatalogData(catalog: CatalogData): CatalogData {
  return {
    ...catalog,
    product: {
      ...catalog.product,
      defaultColor: catalog.product.defaultColor
        ? normalizeThreeColorValue(catalog.product.defaultColor)
        : undefined,
    },
  };
}
