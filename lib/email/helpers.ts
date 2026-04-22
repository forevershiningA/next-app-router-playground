/**
 * Shared helpers for email integration triggers.
 */

import type { DesignerSnapshot, PricingBreakdown } from '#/lib/project-schemas';
import { buildPdfQuoteFromProject } from '#/lib/design-quote';
import type { QuoteLineItem } from './types';

/**
 * Converts a PricingBreakdown into an array of QuoteLineItems for email templates.
 * Kept for non-designer emails (e.g. order flows) that only have aggregate totals.
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
 * Builds a detailed, per-item QuoteLineItem list mirroring the in-app price
 * popup: one row per inscription, per motif, per addition (with descriptive
 * metadata such as text, size, colour, variant).
 */
export function detailedQuoteItems(args: {
  breakdown: PricingBreakdown | null | undefined;
  designState: DesignerSnapshot | null | undefined;
  totalCents?: number | null;
  currency?: string | null;
}): QuoteLineItem[] {
  const { breakdown, designState, totalCents, currency } = args;
  if (!designState) return breakdownToQuoteItems(breakdown);

  const quote = buildPdfQuoteFromProject({
    totalPriceCents: totalCents ?? null,
    currency: currency ?? null,
    pricingBreakdown: breakdown ?? null,
    designState: designState as unknown as Parameters<typeof buildPdfQuoteFromProject>[0]['designState'],
  });

  const toCents = (v: number) => Math.round(v * 100);
  const items: QuoteLineItem[] = [];

  const headstone = quote.items.find((i) => i.label === 'Headstone');
  if (headstone && headstone.amount > 0) {
    items.push({
      description: 'Headstone',
      quantity: 1,
      unitPriceCents: toCents(headstone.amount),
      totalCents: toCents(headstone.amount),
    });
  }

  const base = quote.items.find((i) => i.label === 'Base');
  if (base && base.amount > 0) {
    items.push({
      description: 'Base',
      quantity: 1,
      unitPriceCents: toCents(base.amount),
      totalCents: toCents(base.amount),
    });
  }

  for (const line of quote.inscriptions) {
    const meta = [line.font, line.sizeMm ? `${line.sizeMm}mm` : null, line.colorName]
      .filter(Boolean)
      .join(', ');
    items.push({
      description: `Inscription: "${line.text}"${meta ? ` (${meta})` : ''}`,
      quantity: 1,
      unitPriceCents: toCents(line.amount),
      totalCents: toCents(line.amount),
    });
  }

  for (const motif of quote.motifs) {
    const meta = [motif.heightMm ? `${motif.heightMm}mm` : null, motif.colorName]
      .filter(Boolean)
      .join(', ');
    items.push({
      description: `Motif: ${motif.name}${meta ? ` (${meta})` : ''}`,
      quantity: 1,
      unitPriceCents: toCents(motif.amount),
      totalCents: toCents(motif.amount),
    });
  }

  for (const addition of quote.additions) {
    const meta = [addition.type, addition.variant ? `variant ${addition.variant}` : null]
      .filter(Boolean)
      .join(', ');
    items.push({
      description: `Addition: ${addition.name}${meta ? ` (${meta})` : ''}`,
      quantity: 1,
      unitPriceCents: toCents(addition.amount),
      totalCents: toCents(addition.amount),
    });
  }

  const imagesLine = quote.items.find((i) => i.label === 'Images');
  if (imagesLine && imagesLine.amount > 0) {
    items.push({
      description: 'Images',
      quantity: imagesLine.quantity,
      unitPriceCents: toCents(imagesLine.amount / Math.max(1, imagesLine.quantity)),
      totalCents: toCents(imagesLine.amount),
    });
  }

  // Fall back to aggregate view if nothing was produced (e.g. empty snapshot).
  if (items.length === 0) return breakdownToQuoteItems(breakdown);

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
