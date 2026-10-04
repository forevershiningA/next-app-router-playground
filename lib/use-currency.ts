'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  FALLBACK_AUD_RATES,
  isSupportedCurrency,
  resolveCurrencyFromLanguages,
  type AudExchangeRates,
  type SupportedCurrency,
} from '#/lib/currency';

const CURRENCY_CHANGED_EVENT = 'currency-changed';
const CURRENCY_SESSION_KEY = 'display_currency';
let ratesPromise: Promise<AudExchangeRates> | null = null;
let inMemoryCurrency: SupportedCurrency | null = null;

function readSessionCurrency(): SupportedCurrency {
  if (typeof window === 'undefined') return 'USD';
  if (inMemoryCurrency) return inMemoryCurrency;

  try {
    const value = window.sessionStorage
      .getItem(CURRENCY_SESSION_KEY)
      ?.toUpperCase();
    if (value && isSupportedCurrency(value)) return value;
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }

  return resolveCurrencyFromLanguages(
    navigator.languages ?? [navigator.language],
  );
}

function loadRates() {
  if (!ratesPromise) {
    ratesPromise = fetch('/api/exchange-rates')
      .then(async (response) => {
        if (!response.ok) throw new Error('Exchange rates unavailable');
        const payload = (await response.json()) as { rates?: AudExchangeRates };
        return payload.rates ?? FALLBACK_AUD_RATES;
      })
      .catch(() => FALLBACK_AUD_RATES);
  }
  return ratesPromise;
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<SupportedCurrency>('USD');
  const [rates, setRates] = useState<AudExchangeRates>(FALLBACK_AUD_RATES);

  useEffect(() => {
    const handleCurrencyChanged = () => setCurrencyState(readSessionCurrency());
    handleCurrencyChanged();
    void loadRates().then(setRates);
    window.addEventListener(CURRENCY_CHANGED_EVENT, handleCurrencyChanged);
    return () =>
      window.removeEventListener(CURRENCY_CHANGED_EVENT, handleCurrencyChanged);
  }, []);

  return { currency, rates };
}

export function useSetCurrency() {
  return useCallback((currency: SupportedCurrency) => {
    inMemoryCurrency = currency;
    try {
      window.sessionStorage.setItem(CURRENCY_SESSION_KEY, currency);
    } catch {
      // Keep the selection active for mounted listeners even without storage.
    }
    window.dispatchEvent(new CustomEvent(CURRENCY_CHANGED_EVENT));
  }, []);
}
