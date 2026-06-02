import { describe, it, expect } from 'vitest';
import { calculateMotifPrice } from '#/lib/motif-pricing';
import type { MotifPriceModel } from '#/lib/motif-pricing';

function makeMotifPriceModel(
  quantityType: string,
  prices: MotifPriceModel['prices'],
): MotifPriceModel {
  return { code: 'MOTIF', name: 'Test', quantityType, currency: 'AUD', prices };
}

function makePrice(
  model: string,
  start: number,
  end: number,
  retail: number,
  note = '',
): MotifPriceModel['prices'][0] {
  return { id: '1', nr: '1', name: 'price', code: 'P', model, startQuantity: start, endQuantity: end, retailMultiplier: retail, wholesale: 0, note };
}

describe('calculateMotifPrice', () => {
  it('returns 0 for laser products (free motifs)', () => {
    const model = makeMotifPriceModel('Surfacearea', [
      makePrice('100+0($q-1)', 0, 0, 1.3),
    ]);
    expect(calculateMotifPrice(100, '#000000', model, true)).toBe(0);
  });

  it('returns 0 for empty price model', () => {
    const model = makeMotifPriceModel('Surfacearea', []);
    expect(calculateMotifPrice(100, '#000000', model)).toBe(0);
  });

  it('calculates standard (no color) price for Surfacearea type', () => {
    // quantity = heightMm = 100
    // model: "136.90+0($q-1)" → price = 136.90 * 1.3 ≈ 177.97
    const model = makeMotifPriceModel('Surfacearea', [
      makePrice('136.90+0($q-1)', 0, 0, 1.3, 'Standard'),
    ]);
    expect(calculateMotifPrice(100, '#000000', model)).toBeCloseTo(136.9 * 1.3, 2);
  });

  it('selects Gold Gilding price tier for gold color', () => {
    const model = makeMotifPriceModel('Surfacearea', [
      makePrice('100+0($q-1)', 0, 0, 1.0, 'Standard'),
      makePrice('200+0($q-1)', 0, 0, 1.0, 'Gold Gilding'),
    ]);
    expect(calculateMotifPrice(100, '#c99d44', model)).toBeCloseTo(200, 2);
  });

  it('selects Silver Gilding price tier for silver color', () => {
    const model = makeMotifPriceModel('Surfacearea', [
      makePrice('100+0($q-1)', 0, 0, 1.0, 'Standard'),
      makePrice('150+0($q-1)', 0, 0, 1.0, 'Silver Gilding'),
    ]);
    expect(calculateMotifPrice(100, '#eeeeee', model)).toBeCloseTo(150, 2);
  });

  it('selects Paint Fill for any non-standard, non-gold, non-silver color', () => {
    const model = makeMotifPriceModel('Surfacearea', [
      makePrice('100+0($q-1)', 0, 0, 1.0, 'Standard'),
      makePrice('175+0($q-1)', 0, 0, 1.0, 'Paint Fill'),
    ]);
    expect(calculateMotifPrice(100, '#ff0000', model)).toBeCloseTo(175, 2);
  });

  it('falls back to Standard note when color-specific note not found', () => {
    const model = makeMotifPriceModel('Surfacearea', [
      makePrice('100+0($q-1)', 0, 0, 1.0, ''),
    ]);
    // Gold color but no Gold Gilding tier → falls back to empty note
    expect(calculateMotifPrice(100, '#c99d44', model)).toBeCloseTo(100, 2);
  });

  it('uses Units quantity type (always 1)', () => {
    // For Units, quantity = 1
    // model: "50+10($q-1)" → (50 + 10 * (1 - 1)) * 1 = 50
    const model = makeMotifPriceModel('Units', [
      makePrice('50+10($q-1)', 0, 0, 1.0, 'Standard'),
    ]);
    expect(calculateMotifPrice(100, '#000000', model)).toBeCloseTo(50, 2);
  });

  it('applies retail multiplier correctly', () => {
    const model = makeMotifPriceModel('Surfacearea', [
      makePrice('100+0($q-1)', 0, 0, 1.5, 'Standard'),
    ]);
    expect(calculateMotifPrice(80, '#000000', model)).toBeCloseTo(150, 2);
  });
});
