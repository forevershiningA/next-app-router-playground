import { describe, it, expect } from 'vitest';
import { calculatePrice, calculatePricePowerLaw, computeQuantity } from '#/lib/xml-parser';
import type { PriceModel } from '#/lib/xml-parser';

// Helper to build a minimal PriceModel
function makePriceModel(
  prices: Array<{
    model: string;
    startQuantity: number;
    endQuantity: number;
    retailMultiplier: number;
    note?: string;
  }>,
  quantityType = 'Width + Height',
): PriceModel {
  return {
    id: 'test',
    code: 'TEST',
    name: 'Test Model',
    quantityType,
    currency: 'AUD',
    prices: prices.map((p, i) => ({ id: `p${i}`, ...p })),
  };
}

describe('calculatePrice', () => {
  it('applies the linear formula correctly', () => {
    // model: "410.00+0.78($q-600)", quantity=700
    // price = (410 + 0.78 * (700 - 600)) * 1.5 = (410 + 78) * 1.5 = 732
    const model = makePriceModel([
      { model: '410.00+0.78($q-600)', startQuantity: 0, endQuantity: 0, retailMultiplier: 1.5 },
    ]);
    expect(calculatePrice(model, 700)).toBeCloseTo(732, 2);
  });

  it('handles zero-rate (flat price) formula', () => {
    // model: "136.90+0($q-1)", retailMultiplier: 1.3 → 136.90 * 1.3 = 177.97
    const model = makePriceModel([
      { model: '136.90+0($q-1)', startQuantity: 0, endQuantity: 0, retailMultiplier: 1.3 },
    ]);
    expect(calculatePrice(model, 500)).toBeCloseTo(136.9 * 1.3, 2);
  });

  it('returns 0 when no price tier matches', () => {
    const model = makePriceModel([
      { model: '100+1($q-0)', startQuantity: 500, endQuantity: 1000, retailMultiplier: 1 },
    ]);
    expect(calculatePrice(model, 200)).toBe(0);
  });

  it('respects endQuantity upper bound', () => {
    const model = makePriceModel([
      { model: '50+0($q-0)', startQuantity: 0, endQuantity: 100, retailMultiplier: 1 },
      { model: '100+0($q-0)', startQuantity: 101, endQuantity: 0, retailMultiplier: 1 },
    ]);
    expect(calculatePrice(model, 50)).toBeCloseTo(50, 2);
    expect(calculatePrice(model, 200)).toBeCloseTo(100, 2);
  });

  it('endQuantity === 0 means no upper limit', () => {
    const model = makePriceModel([
      { model: '200+0($q-0)', startQuantity: 0, endQuantity: 0, retailMultiplier: 1 },
    ]);
    expect(calculatePrice(model, 999999)).toBeCloseTo(200, 2);
  });

  it('filters by noteFilter', () => {
    const model = makePriceModel([
      { model: '100+0($q-0)', startQuantity: 0, endQuantity: 0, retailMultiplier: 1, note: 'Standard' },
      { model: '200+0($q-0)', startQuantity: 0, endQuantity: 0, retailMultiplier: 1, note: 'Gold Gilding' },
    ]);
    expect(calculatePrice(model, 100, 'gold')).toBeCloseTo(200, 2);
    expect(calculatePrice(model, 100, 'standard')).toBeCloseTo(100, 2);
  });

  it('falls back to simple number model when formula does not match', () => {
    const model = makePriceModel([
      { model: '99.99', startQuantity: 0, endQuantity: 0, retailMultiplier: 1 },
    ]);
    expect(calculatePrice(model, 100)).toBeCloseTo(99.99, 2);
  });
});

describe('calculatePricePowerLaw', () => {
  it('computes q1 * x^q2 + q4 with x = value / 100', () => {
    // model: "1+0.5($q-0)" → q1=1, q2=0.5, q4=0
    // value = 40000 → x = 400 (>= 300, no surcharge)
    // price = 1 * sqrt(400) + 0 = 20 * retailMultiplier
    const model = makePriceModel([
      {
        model: '1+0.5($q-0)',
        startQuantity: 0,
        endQuantity: 0,
        retailMultiplier: 2,
        note: 'polished',
      },
    ]);
    expect(calculatePricePowerLaw(model, 40000, 'polished')).toBeCloseTo(40, 4);
  });

  it('adds minimum-size surcharge for polished plaques (x < 300)', () => {
    // value = 10000 → x = 100 < 300, polished (a=0)
    // model: "1+1($q-0)" → q1=1, q2=1, q4=0
    // base = 1 * 100^1 + 0 = 100
    // surcharge = (300 - 100) / (5 + 0) = 40
    // total before retail = 140, retailMultiplier = 1
    const model = makePriceModel([
      { model: '1+1($q-0)', startQuantity: 0, endQuantity: 0, retailMultiplier: 1, note: 'polished' },
    ]);
    expect(calculatePricePowerLaw(model, 10000, 'polished')).toBeCloseTo(140, 2);
  });

  it('adds smaller surcharge for brushed plaques (x < 300)', () => {
    // same as above but brushed (a=1)
    // surcharge = (300 - 100) / (5 + 1) = 200/6 ≈ 33.33
    // total before retail = 133.33
    const model = makePriceModel([
      { model: '1+1($q-0)', startQuantity: 0, endQuantity: 0, retailMultiplier: 1, note: 'brushed' },
    ]);
    expect(calculatePricePowerLaw(model, 10000, 'brushed')).toBeCloseTo(
      100 + 200 / 6,
      2,
    );
  });

  it('returns 0 when no matching price row is found', () => {
    const model = makePriceModel([
      { model: '1+1($q-0)', startQuantity: 0, endQuantity: 0, retailMultiplier: 1, note: 'brushed' },
    ]);
    expect(calculatePricePowerLaw(model, 40000, 'polished')).toBe(0);
  });
});

describe('computeQuantity', () => {
  const dims = { width: 600, height: 900, depth: 150 };

  it('"Width + Height" adds all three dimensions', () => {
    const model = makePriceModel([], 'Width + Height');
    expect(computeQuantity(model, dims)).toBe(600 + 900 + 150);
  });

  it('"Width * Height" returns area', () => {
    const model = makePriceModel([], 'Width * Height');
    expect(computeQuantity(model, dims)).toBe(600 * 900);
  });

  it('"area" variant returns area', () => {
    const model = makePriceModel([], 'Area');
    expect(computeQuantity(model, dims)).toBe(600 * 900);
  });

  it('"Width" adds width + depth', () => {
    const model = makePriceModel([], 'Width');
    expect(computeQuantity(model, dims)).toBe(600 + 150);
  });

  it('"Height" returns height only', () => {
    const model = makePriceModel([], 'Height');
    expect(computeQuantity(model, dims)).toBe(900);
  });

  it('"Units" always returns 1', () => {
    const model = makePriceModel([], 'Units');
    expect(computeQuantity(model, dims)).toBe(1);
  });

  it('defaults to width + height + depth for unknown type', () => {
    const model = makePriceModel([], 'Unknown');
    expect(computeQuantity(model, dims)).toBe(600 + 900 + 150);
  });
});
