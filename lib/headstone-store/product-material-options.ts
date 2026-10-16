import { data } from '#/app/_internal/_data';
import type { FixedSize, Material } from '#/lib/headstone-store.types';

interface ProductMaterialOptionsInput {
  isFullColourPlaque: boolean;
  isUrnProduct: boolean;
  isBronzePlaqueProduct: boolean;
}

interface ProductMaterialOptions {
  materials: Material[];
  fixedSizes: FixedSize[];
}

export async function loadProductMaterialOptions({
  isFullColourPlaque,
  isUrnProduct,
  isBronzePlaqueProduct,
}: ProductMaterialOptionsInput): Promise<ProductMaterialOptions> {
  let materials: Material[];
  let fixedSizes: FixedSize[] = [];

  if (isFullColourPlaque || isUrnProduct) {
    try {
      const response = await fetch('/api/catalog/backgrounds');
      materials = response.ok ? await response.json() : [];
    } catch {
      materials = [];
    }

    if (isFullColourPlaque) {
      try {
        const response = await fetch(
          '/api/catalog/sizes?productCode=full-colour-plaque',
        );
        fixedSizes = response.ok ? await response.json() : [];
      } catch {
        fixedSizes = [];
      }
    }
  } else {
    materials = isBronzePlaqueProduct
      ? data.bronzes.map(({ id, name, image, category }) => ({
          id,
          name,
          image,
          category,
        }))
      : data.materials.map((material) => ({ ...material }));
  }

  return { materials, fixedSizes };
}
