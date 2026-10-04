import { describe, expect, it } from 'vitest';
import { resolveCurrencyFromLanguages } from '#/lib/currency';

describe('resolveCurrencyFromLanguages', () => {
  it.each([
    [['en-US'], 'USD'],
    [['en-GB'], 'GBP'],
    [['en-CA'], 'CAD'],
    [['fr-CA'], 'CAD'],
    [['en-AU'], 'AUD'],
    [['de-DE'], 'EUR'],
    [['pl-PL'], 'EUR'],
  ] as const)('maps %j to %s', (languages, currency) => {
    expect(resolveCurrencyFromLanguages(languages)).toBe(currency);
  });

  it('uses the first recognized browser language and defaults to USD', () => {
    expect(resolveCurrencyFromLanguages(['', 'en-GB'])).toBe('GBP');
    expect(resolveCurrencyFromLanguages(['ja-JP'])).toBe('USD');
    expect(resolveCurrencyFromLanguages(undefined)).toBe('USD');
  });
});
