import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) =>
  readFileSync(resolve(process.cwd(), path), 'utf8');

describe('structured data policy', () => {
  it('does not publish self-serving organization ratings', () => {
    const homepage = readSource('app/page.tsx');

    expect(homepage).not.toContain('aggregateRating');
  });

  it('does not publish prices that are unavailable in the visible page content', () => {
    const pages = [
      'app/designs/[productType]/[category]/[slug]/page.tsx',
      'app/memorials/[type]/page.tsx',
      'app/products/[productSlug]/[templateType]/[venue]/[inscription]/page.tsx',
    ];

    for (const page of pages) {
      const source = readSource(page);
      expect(source).not.toContain('AggregateOffer');
      expect(source).not.toContain('priceValidUntil');
    }
  });

  it('does not attach FAQ schema to the hydrated design-detail shell', () => {
    const designPage = readSource(
      'app/designs/[productType]/[category]/[slug]/page.tsx',
    );

    expect(designPage).not.toContain('FAQPage');
    expect(designPage).not.toContain('faqSchema');
  });
});
