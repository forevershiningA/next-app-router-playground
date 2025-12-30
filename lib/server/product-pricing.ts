import 'server-only';

import { cache } from 'react';
import { calculatePrice, type CatalogData, type PriceModel } from '#/lib/xml-parser';
import { getCatalogData } from './xml-data';
import { ensureServerDomParser } from './dom-parser-polyfill';
import type { ProductPriceRange } from '#/lib/types/pricing';

const DEFAULT_HEADSTONE_DIMS = { width: 600, height: 600, depth: 120 };
const DEFAULT_BASE_DIMS = { width: 600, height: 150, depth: 120 };

type DimensionSet = {
  width: number;
  height: number;
  depth: number;
};

export const getProductPriceRange = cache(async (productId: string): Promise<ProductPriceRange | null> => {
  await ensureServerDomParser();

  const xmlContent = await getCatalogData(productId);
  if (!xmlContent) {
    return null;
  }

  const catalog = await parseCatalog(xmlContent, productId);
  if (!catalog) {
    return null;
  }

  const { product } = catalog;
  if (!product.priceModel || product.priceModel.prices.length === 0) {
    return null;
  }

  const bounds = calculateCatalogPriceBounds(catalog);
  const minPrice = roundCurrency(bounds.headstoneMin + bounds.baseMin);
  const maxPrice = roundCurrency(bounds.headstoneMax + bounds.baseMax);

  if (minPrice === 0 && maxPrice === 0) {
    return null;
  }

  return {
    minPrice,
    maxPrice: Math.max(maxPrice, minPrice),
    currency: normalizeCurrency(
      product.priceModel.currency || product.basePriceModel?.currency || 'AUD',
    ),
  };
});

export async function getProductPriceRanges(productIds: string[]) {
  const entries = await Promise.all(
    productIds.map(async (id) => {
      try {
        const range = await getProductPriceRange(id);
        return [id, range] as const;
      } catch (error) {
        console.error(`Failed to calculate price range for product ${id}:`, error);
        return [id, null] as const;
      }
    }),
  );

  return entries.reduce<Record<string, ProductPriceRange>>((acc, [id, range]) => {
    if (range) {
      acc[id] = range;
    }
    return acc;
  }, {});
}

async function parseCatalog(xmlContent: string, productId: string): Promise<CatalogData | null> {
  try {
    const { parseCatalogXML } = await import('#/lib/xml-parser');
    return await parseCatalogXML(xmlContent, productId);
  } catch (error) {
    console.error('Failed to parse catalog XML:', error);
    return null;
  }
}

function calculateCatalogPriceBounds(catalog: CatalogData) {
  const shapes = catalog.product.shapes.length ? catalog.product.shapes : [undefined];
  let headstoneMin = Number.POSITIVE_INFINITY;
  let headstoneMax = 0;
  let baseMin = catalog.product.basePriceModel ? Number.POSITIVE_INFINITY : 0;
  let baseMax = catalog.product.basePriceModel ? 0 : 0;

  for (const shape of shapes) {
    const tableSection = shape?.table;
    const standSection = shape?.stand;

    if (catalog.product.priceModel) {
      const minDims = getSectionDimensions(tableSection, 'min', DEFAULT_HEADSTONE_DIMS);
      const maxDims = getSectionDimensions(tableSection, 'max', DEFAULT_HEADSTONE_DIMS);

      const minQuantity = computeQuantityFromDims(catalog.product.priceModel, minDims);
      const maxQuantity = computeQuantityFromDims(catalog.product.priceModel, maxDims);

      const minPrice = safeCalculate(catalog.product.priceModel, minQuantity);
      const maxPrice = safeCalculate(catalog.product.priceModel, Math.max(maxQuantity, minQuantity));

      headstoneMin = Math.min(headstoneMin, minPrice);
      headstoneMax = Math.max(headstoneMax, maxPrice);
    }

    if (catalog.product.basePriceModel) {
      const baseDims = getSectionDimensions(standSection, 'min', DEFAULT_BASE_DIMS);
      const baseMaxDims = getSectionDimensions(standSection, 'max', DEFAULT_BASE_DIMS);

      const minQuantity = computeQuantityFromDims(catalog.product.basePriceModel, baseDims);
      const maxQuantity = computeQuantityFromDims(catalog.product.basePriceModel, baseMaxDims);

      const minPrice = safeCalculate(catalog.product.basePriceModel, minQuantity);
      const maxPrice = safeCalculate(catalog.product.basePriceModel, Math.max(maxQuantity, minQuantity));

      baseMin = Math.min(baseMin, minPrice);
      baseMax = Math.max(baseMax, maxPrice);
    }
  }

  if (!isFinite(headstoneMin)) {
    headstoneMin = 0;
  }
  if (headstoneMax < headstoneMin) {
    headstoneMax = headstoneMin;
  }
  if (!isFinite(baseMin)) {
    baseMin = 0;
  }
  if (baseMax < baseMin) {
    baseMax = baseMin;
  }

  return {
    headstoneMin,
    headstoneMax,
    baseMin,
    baseMax,
  };
}

function getSectionDimensions(
  section: {
    minWidth?: number;
    maxWidth?: number;
    initWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    initHeight?: number;
    minDepth?: number;
    maxDepth?: number;
    initDepth?: number;
  } | undefined,
  bound: 'min' | 'max',
  defaults: DimensionSet,
): DimensionSet {
  if (!section) {
    return defaults;
  }

  const width = pickDimension(section, bound, 'Width', defaults.width);
  const height = pickDimension(section, bound, 'Height', defaults.height);
  const depth = pickDimension(section, bound, 'Depth', defaults.depth);

  return { width, height, depth };
}

function pickDimension(
  section: Record<string, number | undefined>,
  bound: 'min' | 'max',
  dimension: 'Width' | 'Height' | 'Depth',
  fallbackValue: number,
) {
  const primaryKey = `${bound}${dimension}`;
  const alternateKey = `${bound === 'min' ? 'max' : 'min'}${dimension}`;
  const initKey = `init${dimension}`;

  const candidates = [primaryKey, initKey, alternateKey] as const;
  for (const key of candidates) {
    const value = section[key];
    if (typeof value === 'number' && value > 0) {
      return value;
    }
  }

  return fallbackValue;
}

function computeQuantityFromDims(priceModel: PriceModel, dims: DimensionSet) {
  const quantityType = (priceModel.quantityType || '').toLowerCase();

  if (quantityType.includes('width + height')) {
    return dims.width + dims.height;
  }

  if (quantityType.includes('perimeter')) {
    return 2 * (dims.width + dims.height);
  }

  if (quantityType.includes('width * height') || quantityType.includes('surface') || quantityType.includes('area')) {
    return dims.width * dims.height;
  }

  if (quantityType.includes('width') && quantityType.includes('depth')) {
    return dims.width + dims.depth;
  }

  if (quantityType === 'width') {
    return dims.width + dims.depth;
  }

  if (quantityType === 'height') {
    return dims.height;
  }

  if (quantityType.includes('units')) {
    return Math.max(dims.width, dims.height);
  }

  return dims.width * dims.height;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function safeCalculate(priceModel: PriceModel, quantity: number) {
  if (!priceModel || priceModel.prices.length === 0) {
    return 0;
  }

  const directPrice = calculatePrice(priceModel, quantity);
  if (directPrice > 0) {
    return directPrice;
  }

  const minTier = Math.min(...priceModel.prices.map((p) => p.startQuantity));
  const maxTier = Math.max(
    ...priceModel.prices.map((p) => (p.endQuantity && p.endQuantity > 0 ? p.endQuantity : Number.MAX_SAFE_INTEGER)),
  );

  if (quantity < minTier) {
    return calculatePrice(priceModel, minTier);
  }

  if (maxTier !== Number.MAX_SAFE_INTEGER && quantity > maxTier) {
    return calculatePrice(priceModel, maxTier);
  }

  // If we still couldn't compute a price, fall back to first tier
  return calculatePrice(priceModel, priceModel.prices[0].startQuantity);
}

function normalizeCurrency(value?: string) {
  if (!value) {
    return 'AUD';
  }

  const upper = value.toUpperCase();
  if (upper.includes('USD')) return 'USD';
  if (upper.includes('AUD') || upper.includes('DOLLAR')) return 'AUD';
  if (upper.includes('NZD')) return 'NZD';
  if (upper.includes('CAD')) return 'CAD';
  if (upper.includes('GBP') || upper.includes('POUND')) return 'GBP';
  if (upper.includes('EUR') || upper.includes('EURO')) return 'EUR';
  return upper.slice(0, 3);
}
