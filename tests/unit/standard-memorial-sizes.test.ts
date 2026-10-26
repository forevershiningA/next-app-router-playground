import { describe, expect, it } from 'vitest';
import { SUPPORTED_CURRENCIES } from '#/lib/currency';
import {
  STANDARD_MEMORIAL_SIZES,
  isStandardSizeAvailable,
  getMatchingBaseSize,
} from '#/lib/standard-memorial-sizes';
import {
  displayLengthValueFromMm,
  formatDimensionPair,
} from '#/lib/unit-system';

describe('standard memorial sizes', () => {
  const baseLimits = {
    minWidthMm: 300,
    maxWidthMm: 1200,
    minHeightMm: 100,
    maxHeightMm: 200,
    minDepthMm: 250,
    maxDepthMm: 400,
  };

  it('shrinks and grows the base with the selected headstone', () => {
    expect(getMatchingBaseSize('EUR', 500, 100, baseLimits)).toEqual({
      widthMm: 600,
      heightMm: 150,
      depthMm: 250,
    });
    expect(getMatchingBaseSize('EUR', 800, 100, baseLimits)).toEqual({
      widthMm: 1000,
      heightMm: 150,
      depthMm: 300,
    });
    expect(getMatchingBaseSize('EUR', 1000, 100, baseLimits)).toEqual({
      widthMm: 1200,
      heightMm: 190,
      depthMm: 360,
    });
  });

  it('uses product limits when regional base presets do not fit', () => {
    expect(
      getMatchingBaseSize('AUD', 500, 100, { ...baseLimits, maxWidthMm: 700 }),
    ).toEqual({ widthMm: 600, heightMm: 150, depthMm: 250 });
    expect(getMatchingBaseSize('EUR', 1100, 350, baseLimits)).toEqual({
      widthMm: 1200,
      heightMm: 190,
      depthMm: 400,
    });
  });
  it.each(SUPPORTED_CURRENCIES)(
    '%s offers 3–5 distinct sizes for each target',
    (currency) => {
      for (const target of ['headstone', 'base'] as const) {
        const sizes = STANDARD_MEMORIAL_SIZES[currency][target];
        expect(sizes.length).toBeGreaterThanOrEqual(3);
        expect(sizes.length).toBeLessThanOrEqual(5);
        expect(
          new Set(sizes.map((size) => `${size.widthMm}:${size.heightMm}`)).size,
        ).toBe(sizes.length);
        for (const size of sizes) {
          expect(Number.isInteger(size.widthMm) && size.widthMm > 0).toBe(true);
          expect(Number.isInteger(size.heightMm) && size.heightMm > 0).toBe(
            true,
          );
        }
      }
    },
  );

  it('rejects a base narrower than the headstone instead of silently resizing it', () => {
    const limits = {
      minWidthMm: 950,
      maxWidthMm: 1200,
      minHeightMm: 100,
      maxHeightMm: 200,
    };
    expect(
      isStandardSizeAvailable({ widthMm: 914, heightMm: 152 }, limits),
    ).toBe(false);
    expect(
      isStandardSizeAvailable({ widthMm: 1000, heightMm: 100 }, limits),
    ).toBe(true);
    expect(
      isStandardSizeAvailable({ widthMm: 1219, heightMm: 152 }, limits),
    ).toBe(false);
    expect(
      isStandardSizeAvailable({ widthMm: 1000, heightMm: 76 }, limits),
    ).toBe(false);
    expect(
      isStandardSizeAvailable({ widthMm: 1000, heightMm: 203 }, limits),
    ).toBe(false);
  });

  it('keeps inch presets consistent with the integer-mm store and number controls', () => {
    expect(formatDimensionPair(610, 610, 'imperial')).toBe('24" × 24"');
    expect(displayLengthValueFromMm(610, 'imperial')).toBe(24);
    expect(displayLengthValueFromMm(813, 'imperial')).toBe(32);
    expect(displayLengthValueFromMm(611, 'imperial')).toBe(25);
    expect(formatDimensionPair(610, 762, 'metric')).toBe('610 × 762 mm');
  });
});
