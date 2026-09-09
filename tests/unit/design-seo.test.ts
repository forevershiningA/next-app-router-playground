import { describe, expect, it } from 'vitest';
import sitemap from '../../app/sitemap';
import {
  getSeoReadyDesigns,
  groupDesignsByCategory,
  groupDesignsByProduct,
  isIndexableCategoryDesignSet,
} from '../../lib/design-seo';

describe('design gallery indexing policy', () => {
  const designs = getSeoReadyDesigns();

  it('retains the teacher collection with demonstrated search traffic', () => {
    const teachers = designs.filter(d =>
      d.productSlug === 'stainless-steel-plaque' && d.category === 'teacher-memorial');
    expect(teachers.length).toBeGreaterThan(0);
    expect(teachers.length).toBeLessThan(5);
    expect(isIndexableCategoryDesignSet(teachers)).toBe(true);
  });

  it('does not index empty or retired product collections', () => {
    expect(isIndexableCategoryDesignSet([])).toBe(false);
    expect(isIndexableCategoryDesignSet(
      Array.from({ length: 5 }, () => ({ ...designs[0], productSlug: 'legacy-product' })),
    )).toBe(false);
  });

  it('keeps sitemap categories consistent with the page indexing policy', () => {
    const urls = new Set(sitemap().map(entry => entry.url));
    for (const [product, productDesigns] of groupDesignsByProduct(designs)) {
      for (const [category, categoryDesigns] of groupDesignsByCategory(productDesigns)) {
        expect(urls.has(`https://forevershining.org/designs/${product}/${category}`))
          .toBe(isIndexableCategoryDesignSet(categoryDesigns));
      }
    }
    for (const design of designs) {
      expect(urls.has(`https://forevershining.org/designs/${design.productSlug}/${design.category}/${design.slug}`))
        .toBe(true);
    }
  });
});
