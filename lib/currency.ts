export const SUPPORTED_CURRENCIES = [
  'USD',
  'GBP',
  'EUR',
  'AUD',
  'CAD',
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export type AudExchangeRates = Record<SupportedCurrency, number>;

const EUROPEAN_LANGUAGE_CODES = new Set([
  'bg',
  'cs',
  'da',
  'de',
  'el',
  'es',
  'et',
  'fi',
  'fr',
  'ga',
  'hr',
  'hu',
  'is',
  'it',
  'lt',
  'lv',
  'mt',
  'nl',
  'no',
  'pl',
  'pt',
  'ro',
  'sk',
  'sl',
  'sv',
]);

export function resolveCurrencyFromLanguages(
  languages: readonly string[] | null | undefined,
): SupportedCurrency {
  for (const language of languages ?? []) {
    const normalized = language.trim().replace('_', '-');
    if (!normalized) continue;

    const parts = normalized.split('-');
    const languageCode = parts[0]?.toLowerCase();
    const regionCode = parts
      .find((part, index) => index > 0 && /^(?:[a-z]{2}|\d{3})$/i.test(part))
      ?.toUpperCase();

    if (regionCode === 'GB') return 'GBP';
    if (regionCode === 'CA') return 'CAD';
    if (regionCode === 'AU' || regionCode === 'NZ') return 'AUD';
    if (regionCode === 'US') return 'USD';
    if (languageCode && EUROPEAN_LANGUAGE_CODES.has(languageCode)) return 'EUR';
  }

  return 'USD';
}

// Used immediately while the daily server-side rates are loading, and as a
// resilient fallback if the external reference-rate service is unavailable.
export const FALLBACK_AUD_RATES: AudExchangeRates = {
  AUD: 1,
  USD: 0.6942,
  GBP: 0.52449,
  EUR: 0.6148,
  CAD: 0.98756,
};

export function isSupportedCurrency(value: string): value is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(value as SupportedCurrency);
}

export function convertFromAud(
  amountAud: number,
  currency: SupportedCurrency,
  rates: AudExchangeRates,
) {
  return amountAud * rates[currency];
}

export function formatAudPrice(
  amountAud: number,
  currency: SupportedCurrency,
  rates: AudExchangeRates,
  maximumFractionDigits = 2,
) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits,
  }).format(convertFromAud(amountAud, currency, rates));
}
