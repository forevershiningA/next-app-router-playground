import type { SupportedCurrency } from '#/lib/currency';

export type StandardSizeTarget = 'headstone' | 'base';

export type StandardMemorialSize = { widthMm: number; heightMm: number };

type MarketSizes = {
  market: string;
  headstone: readonly StandardMemorialSize[];
  base: readonly StandardMemorialSize[];
};

// Store whole millimetres, matching the dimension setters. Display units are
// independent of the market: only USD currently uses inches in the designer.
const mm = (widthMm: number, heightMm: number): StandardMemorialSize => ({
  widthMm,
  heightMm,
});
const inches = (width: number, height: number): StandardMemorialSize =>
  mm(Math.round(width * 25.4), Math.round(height * 25.4));

// Representative catalogue sizes, not national cemetery specifications.
// Sources and dimension conventions: docs/standard-memorial-sizes.md.
export const STANDARD_MEMORIAL_SIZES: Record<SupportedCurrency, MarketSizes> = {
  USD: {
    market: 'US',
    headstone: [
      inches(18, 24),
      inches(24, 18),
      inches(24, 24),
      inches(36, 24),
      inches(42, 24),
    ],
    base: [
      inches(30, 6),
      inches(32, 6),
      inches(36, 6),
      inches(40, 6),
      inches(48, 6),
    ],
  },
  GBP: {
    market: 'UK',
    headstone: [inches(17, 24), inches(21, 27), inches(24, 30)],
    base: [mm(600, 100), mm(750, 100), mm(600, 150)],
  },
  EUR: {
    market: 'Europe',
    headstone: [mm(500, 800), mm(800, 900), mm(1000, 800), mm(1000, 1000)],
    base: [mm(600, 150), mm(1000, 150), mm(1200, 190)],
  },
  AUD: {
    market: 'Australia',
    headstone: [mm(650, 700), mm(750, 460), mm(950, 500)],
    base: [mm(950, 100), mm(1000, 100), mm(1200, 100)],
  },
  CAD: {
    market: 'Canada',
    headstone: [inches(30, 24), inches(24, 30), inches(26, 36), inches(36, 24)],
    base: [inches(32, 6), inches(36, 6), inches(44, 6)],
  },
};

export type StandardSizeLimits = {
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
};

export function isStandardSizeAvailable(
  size: StandardMemorialSize,
  limits: StandardSizeLimits,
) {
  return (
    size.widthMm >= limits.minWidthMm &&
    size.widthMm <= limits.maxWidthMm &&
    size.heightMm >= limits.minHeightMm &&
    size.heightMm <= limits.maxHeightMm
  );
}

/** Choose a regional base with roughly 10% overhang on each side. */
export function getMatchingBaseSize(
  currency: SupportedCurrency,
  headstoneWidthMm: number,
  headstoneDepthMm: number,
  limits: StandardSizeLimits & { minDepthMm: number; maxDepthMm: number },
) {
  const minWidth = Math.max(limits.minWidthMm, headstoneWidthMm);
  const maxWidth = Math.max(minWidth, limits.maxWidthMm);
  const desiredWidth = Math.round(headstoneWidthMm * 1.2);
  const candidates = [...STANDARD_MEMORIAL_SIZES[currency].base]
    .filter((size) =>
      isStandardSizeAvailable(size, { ...limits, minWidthMm: minWidth }),
    )
    .sort((a, b) => a.widthMm - b.widthMm);
  const preferred =
    candidates.find((size) => size.widthMm >= desiredWidth) ??
    candidates.at(-1);
  const widthMm =
    preferred?.widthMm ?? Math.max(minWidth, Math.min(maxWidth, desiredWidth));
  const heightMm =
    preferred?.heightMm ??
    Math.max(limits.minHeightMm, Math.min(limits.maxHeightMm, 150));
  const depthMm = Math.max(
    limits.minDepthMm,
    Math.min(
      limits.maxDepthMm,
      Math.round(Math.max(widthMm * 0.3, headstoneDepthMm + 100)),
    ),
  );
  return { widthMm, heightMm, depthMm };
}
