import { MetadataRoute } from 'next';
import { getAllSavedDesigns, DESIGN_CATEGORIES, PRODUCT_STATS } from '#/lib/saved-designs-data';

const BASE_URL = 'https://forevershining.org';

// Generate at request time — the 3114-design dataset is too large to bundle into SSG workers
export const dynamic = 'force-dynamic';
export default function sitemap(): MetadataRoute.Sitemap {
  const designs = getAllSavedDesigns();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/designs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/select-size`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];

  // Product type pages
  const productPages: MetadataRoute.Sitemap = Object.keys(PRODUCT_STATS).map((productSlug) => ({
    url: `${BASE_URL}/designs/${productSlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Category pages — unique productSlug/category combinations
  const categoryKeys = new Set<string>();
  for (const design of designs) {
    categoryKeys.add(`${design.productSlug}/${design.category}`);
  }
  const categoryPages: MetadataRoute.Sitemap = Array.from(categoryKeys).map((key) => ({
    url: `${BASE_URL}/designs/${key}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Individual design pages
  const designPages: MetadataRoute.Sitemap = designs.map((design) => ({
    url: `${BASE_URL}/designs/${design.productSlug}/${design.category}/${design.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...designPages];
}
