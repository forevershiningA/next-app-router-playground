import type { PricingBreakdown } from './project-schemas';

/**
 * Shared quote shape for previews and finalized order pricing.
 * `authority` makes it explicit that a client estimate is not a payment total.
 */
export type QuoteAuthority = 'estimate' | 'confirmed';

export type DesignQuote<Authority extends QuoteAuthority = QuoteAuthority> = {
  totalCents: number;
  currency: string;
  breakdown: PricingBreakdown;
  authority: Authority;
};
