import { describe, expect, it } from 'vitest';
import {
  calculateEstimatedDesignPricing,
  type EstimatedDesignPricingInput,
} from '#/lib/estimated-design-pricing';

function input(
  overrides: Partial<EstimatedDesignPricingInput> = {},
): EstimatedDesignPricingInput {
  return {
    productId: null,
    shapeUrl: null,
    headstoneMaterialUrl: null,
    catalog: null,
    fixedSizes: [],
    widthMm: 600,
    heightMm: 800,
    uprightThickness: 80,
    showBase: false,
    baseWidthMm: 700,
    baseHeightMm: 100,
    baseThickness: 250,
    borderName: null,
    showInscriptionColor: true,
    selectedAdditions: [],
    additionOffsets: {},
    selectedMotifs: [],
    motifOffsets: {},
    motifPriceModel: null,
    selectedEmblems: [],
    selectedImages: [],
    inscriptions: [],
    inscriptionPriceModel: null,
    imageCost: 0,
    ...overrides,
  };
}

describe('calculateEstimatedDesignPricing', () => {
  it('returns a stable empty estimate when pricing data is unavailable', () => {
    expect(calculateEstimatedDesignPricing(input())).toEqual({
      totalCents: 0,
      currency: 'AUD',
      authority: 'estimate',
      breakdown: {
        headstonePrice: 0,
        basePrice: 0,
        ledgerPrice: 0,
        kerbsetPrice: 0,
        additionsPrice: 0,
        motifsPrice: 0,
        emblemsPrice: 0,
        inscriptionPrice: 0,
        imagePrice: 0,
        borderPrice: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
      },
    });
  });

  it('prices fixed full-colour plaques and applies tax once', () => {
    const quote = calculateEstimatedDesignPricing(
      input({
        productId: '32',
        widthMm: 250,
        heightMm: 200,
        fixedSizes: [{ id: 1, width: 200, height: 250, price: 648 }],
        selectedEmblems: [
          { id: 'instance-1', emblemId: 'emblem-1', imageUrl: '/emblem.svg' },
        ],
        imageCost: 50,
      }),
    );

    expect(quote.breakdown.headstonePrice).toBe(648);
    expect(quote.breakdown.emblemsPrice).toBe(109);
    expect(quote.breakdown.subtotal).toBe(807);
    expect(quote.breakdown.tax).toBeCloseTo(80.7);
    expect(quote.totalCents).toBe(88_770);
  });
});
