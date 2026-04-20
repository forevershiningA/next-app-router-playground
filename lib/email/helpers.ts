/**
 * Shared helpers for email integration triggers.
 */

import type { PricingBreakdown } from '#/lib/project-schemas';
import type { QuoteLineItem } from './types';

/**
 * Converts a PricingBreakdown into an array of QuoteLineItems for email templates.
 */
export function breakdownToQuoteItems(
  breakdown: PricingBreakdown | null | undefined,
): QuoteLineItem[] {
  if (!breakdown) return [];

  const items: QuoteLineItem[] = [];

  const mapping: { key: keyof PricingBreakdown; label: string }[] = [
    { key: 'headstonePrice', label: 'Headstone' },
    { key: 'basePrice', label: 'Base' },
    { key: 'ledgerPrice', label: 'Ledger Slab' },
    { key: 'kerbsetPrice', label: 'Kerbset Border' },
    { key: 'inscriptionPrice', label: 'Inscriptions' },
    { key: 'motifsPrice', label: 'Motifs' },
    { key: 'emblemsPrice', label: 'Emblems' },
    { key: 'imagePrice', label: 'Images' },
    { key: 'additionsPrice', label: 'Additions' },
  ];

  for (const { key, label } of mapping) {
    const value = breakdown[key];
    if (typeof value === 'number' && value > 0) {
      const cents = Math.round(value * 100);
      items.push({
        description: label,
        unitPriceCents: cents,
        totalCents: cents,
      });
    }
  }

  return items;
}

/**
 * Maps a country string (e.g. "Australia") to a 2-letter code for email config.
 * Defaults to 'au' when unknown.
 */
export function countryToCode(country: string | null | undefined): string {
  if (!country) return 'au';
  const lower = country.toLowerCase().trim();
  const map: Record<string, string> = {
    australia: 'au',
    'united states': 'us',
    usa: 'us',
    'united kingdom': 'uk',
    uk: 'uk',
    canada: 'ca',
    'new zealand': 'nz',
    poland: 'pl',
    'papua new guinea': 'pg',
  };
  return map[lower] ?? 'au';
}
