import { NextResponse } from 'next/server';
import {
  FALLBACK_AUD_RATES,
  type AudExchangeRates,
  type SupportedCurrency,
} from '#/lib/currency';

type FrankfurterRate = {
  date: string;
  base: string;
  quote: string;
  rate: number;
};

const QUOTES = ['USD', 'GBP', 'EUR', 'CAD'] as const;

export async function GET() {
  const rates: AudExchangeRates = { ...FALLBACK_AUD_RATES, AUD: 1 };
  let rateDate: string | null = null;

  const results = await Promise.allSettled(
    QUOTES.map(async (quote) => {
      const response = await fetch(
        `https://api.frankfurter.dev/v2/rate/aud/${quote.toLowerCase()}`,
        { next: { revalidate: 86_400 } },
      );
      if (!response.ok) throw new Error(`Rate request failed: ${quote}`);
      return (await response.json()) as FrankfurterRate;
    }),
  );

  results.forEach((result) => {
    if (result.status !== 'fulfilled') return;
    const quote = result.value.quote.toUpperCase() as SupportedCurrency;
    if (Number.isFinite(result.value.rate) && result.value.rate > 0) {
      rates[quote] = result.value.rate;
      rateDate = result.value.date;
    }
  });

  return NextResponse.json(
    { base: 'AUD', date: rateDate, rates },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    },
  );
}
