'use client';

export type ImagePriceTier = {
  id: string;
  nr: string;
  name: string;
  code: string;
  model: string;
  startQuantity: number;
  endQuantity: number;
  retailMultiplier: number;
  note: string;
};

export type ImagePriceModel = {
  code: string;
  name: string;
  quantityType: string;
  currency: string;
  prices: ImagePriceTier[];
};

export type ImageProduct = {
  id: string;
  code: string;
  name: string;
  type: string;
  priceModel: ImagePriceModel;
};

export type ImagePricingMap = Record<string, ImageProduct>;

const DEFAULT_LOCALE = 'en_EN';
let pricingCache: ImagePricingMap | null = null;
let pricingPromise: Promise<ImagePricingMap> | null = null;

function evaluatePriceFormula(formula: string, value: number): number {
  try {
    const parts1 = formula.split('+');
    if (parts1.length !== 2) return 0;

    const q1 = Number(parts1[0]);
    const parts2 = parts1[1].split('(');
    if (parts2.length !== 2) return 0;

    const q2 = Number(parts2[0]);
    const parts3 = parts2[1].split('-');
    if (parts3.length !== 2) return 0;

    const q4 = Number(parts3[1].replace(')', ''));
    const q3 = value;

    const result = q1 + q2 * (q3 - q4);
    return parseFloat(result.toFixed(2));
  } catch {
    return 0;
  }
}

function resolveQuantity(quantityType: string, widthMm: number, heightMm: number): number {
  switch (quantityType) {
    case 'Width + Height':
      return widthMm + heightMm;
    case 'Width * Height':
      return widthMm * heightMm;
    case 'Units':
      return 1;
    default:
      return widthMm + heightMm;
  }
}

function normalizeColorNote(colorMode?: 'full' | 'bw' | 'sepia'): string {
  if (colorMode === 'bw') return 'bw';
  return 'color';
}

function findApplicableTier(
  prices: ImagePriceTier[],
  quantity: number,
  notePreference: string
): ImagePriceTier | null {
  if (!prices.length) return null;

  const noteMatch = prices.find(
    (price) =>
      quantity >= price.startQuantity &&
      (price.endQuantity === 0 || quantity <= price.endQuantity) &&
      price.note.toLowerCase() === notePreference
  );
  if (noteMatch) return noteMatch;

  const rangeMatch = prices.find(
    (price) =>
      quantity >= price.startQuantity &&
      (price.endQuantity === 0 || quantity <= price.endQuantity)
  );
  if (rangeMatch) return rangeMatch;

  return prices[prices.length - 1];
}

export async function fetchImagePricing(locale: string = DEFAULT_LOCALE): Promise<ImagePricingMap> {
  if (pricingCache) return pricingCache;
  if (pricingPromise) return pricingPromise;

  pricingPromise = (async () => {
    const response = await fetch(`/xml/${locale}/images.xml`);
    if (!response.ok) {
      throw new Error('Failed to load image pricing');
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const productElements = Array.from(xmlDoc.querySelectorAll('product'));
    const result: ImagePricingMap = {};

    for (const productEl of productElements) {
      const id = productEl.getAttribute('id');
      const priceModelEl = productEl.querySelector('price_model');
      if (!id || !priceModelEl) continue;

      const prices = Array.from(priceModelEl.querySelectorAll('price')).map((priceEl) => ({
        id: priceEl.getAttribute('id') || '',
        nr: priceEl.getAttribute('nr') || '',
        name: priceEl.getAttribute('name') || '',
        code: priceEl.getAttribute('code') || '',
        model: priceEl.getAttribute('model') || '0',
        startQuantity: parseFloat(priceEl.getAttribute('start_quantity') || '0'),
        endQuantity: parseFloat(priceEl.getAttribute('end_quantity') || '0'),
        retailMultiplier: parseFloat(priceEl.getAttribute('retail_multiplier') || '1'),
        note: (priceEl.getAttribute('note') || '').toLowerCase(),
      }));

      if (!prices.length) continue;

      result[id] = {
        id,
        code: productEl.getAttribute('code') || '',
        name: productEl.getAttribute('name') || '',
        type: productEl.getAttribute('type') || '',
        priceModel: {
          code: priceModelEl.getAttribute('code') || '',
          name: priceModelEl.getAttribute('name') || '',
          currency: priceModelEl.getAttribute('currency') || 'USD',
          quantityType: priceModelEl.getAttribute('quantity_type') || 'Width + Height',
          prices,
        },
      };
    }

    pricingCache = result;
    pricingPromise = null;
    return result;
  })().catch((error) => {
    pricingPromise = null;
    throw error;
  });

  return pricingPromise;
}

export function calculateImagePrice(
  product: ImageProduct | undefined,
  widthMm: number,
  heightMm: number,
  colorMode?: 'full' | 'bw' | 'sepia'
): number {
  if (!product) return 0;
  const { priceModel } = product;
  if (!priceModel || !priceModel.prices.length) return 0;

  const quantity = resolveQuantity(priceModel.quantityType, widthMm, heightMm);
  const notePref = normalizeColorNote(colorMode);
  const tier = findApplicableTier(priceModel.prices, quantity, notePref) || priceModel.prices[0];

  const basePrice = evaluatePriceFormula(tier.model, quantity);
  const finalPrice = basePrice * (tier.retailMultiplier || 1);
  return parseFloat(finalPrice.toFixed(2));
}
