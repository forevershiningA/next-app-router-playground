import 'server-only';

import { cache } from 'react';
import {
  calculatePrice,
  calculateCatalogPrice,
  calculatePricePowerLaw,
  computeQuantity,
  type CatalogData,
  type PriceModel,
} from '#/lib/xml-parser';
import { getCatalogData } from './xml-data';
import { ensureServerDomParser } from './dom-parser-polyfill';
import type { ProductPriceSample } from '#/lib/types/pricing';

const DEFAULT_HEADSTONE_DIMS = { width: 600, height: 600, depth: 120 };
const DEFAULT_BASE_DIMS = { width: 600, height: 150, depth: 120 };

export const getProductPriceSample = cache(async (productId: string): Promise<ProductPriceSample | null> => {
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

  const shape = catalog.product.shapes[0];
  const width = shape?.table.initWidth || DEFAULT_HEADSTONE_DIMS.width;
  const height = shape?.table.initHeight || DEFAULT_HEADSTONE_DIMS.height;
  const depth = shape?.table.initDepth || DEFAULT_HEADSTONE_DIMS.depth;
  const productPrice = productId === '52'
    ? calculatePricePowerLaw(product.priceModel, width * height, 'brushed')
    : calculateCatalogPrice(productId, product.priceModel, { width, height, depth });

  let basePrice = 0;
  if (product.basePriceModel && shape?.stand) {
    const baseQuantity = computeQuantity(product.basePriceModel, {
      width: shape.stand.initWidth || DEFAULT_BASE_DIMS.width,
      height: shape.stand.initHeight || DEFAULT_BASE_DIMS.height,
      depth: shape.stand.initDepth || DEFAULT_BASE_DIMS.depth,
    });
    basePrice = calculateSamplePrice(product.basePriceModel, baseQuantity);
  }

  const price = roundCurrency(productPrice + basePrice);
  if (price <= 0) {
    return null;
  }

  return {
    price,
    width,
    height,
    currency: normalizeCurrency(
      product.priceModel.currency || product.basePriceModel?.currency || 'AUD',
    ),
  };
});

export async function getProductPriceSamples(productIds: string[]) {
  const entries = await Promise.all(
    productIds.map(async (id) => {
      try {
        const sample = await getProductPriceSample(id);
        return [id, sample] as const;
      } catch (error) {
        console.error(`Failed to calculate price range for product ${id}:`, error);
        return [id, null] as const;
      }
    }),
  );

  return entries.reduce<Record<string, ProductPriceSample>>((acc, [id, sample]) => {
    if (sample) {
      acc[id] = sample;
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

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function calculateSamplePrice(priceModel: PriceModel, quantity: number) {
  const directPrice = calculatePrice(priceModel, quantity);
  if (directPrice > 0) return directPrice;

  // Some legacy catalogs use single-value tiers (for example, fixed plaque
  // sizes), while others contain gaps or inconsistent quantity bounds. For a
  // sample card, use the nearest tier rather than hiding the sample entirely.
  const nearestTier = priceModel.prices.reduce((nearest, tier) => {
    const tierQuantity = quantity < tier.startQuantity
      ? tier.startQuantity
      : tier.endQuantity > 0 && quantity > tier.endQuantity
        ? tier.endQuantity
        : tier.startQuantity;
    const nearestDistance = Math.abs(quantity - nearest.quantity);
    const tierDistance = Math.abs(quantity - tierQuantity);
    return tierDistance < nearestDistance
      ? { quantity: tierQuantity, tier }
      : nearest;
  }, {
    quantity: priceModel.prices[0]?.startQuantity ?? 0,
    tier: priceModel.prices[0],
  });

  return nearestTier.tier
    ? calculatePrice(priceModel, nearestTier.quantity)
    : 0;
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
