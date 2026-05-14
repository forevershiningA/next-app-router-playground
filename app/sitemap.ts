import { MetadataRoute } from 'next';
import { getAllSavedDesigns, PRODUCT_STATS } from '#/lib/saved-designs-data';

const BASE_URL = 'https://forevershining.org';

// ISR: cache for 24 hours — data is static, regenerating on every crawl wastes budget
export const revalidate = 86400;

// Approximate date the design gallery launched (from GSC indexing chart)
const SITE_LAUNCH_DATE = new Date('2026-02-13');

export default function sitemap(): MetadataRoute.Sitemap {
  const designs = getAllSavedDesigns();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: SITE_LAUNCH_DATE, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/designs`, lastModified: SITE_LAUNCH_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/select-size`, lastModified: SITE_LAUNCH_DATE, changeFrequency: 'monthly', priority: 0.8 },
  ];

  // Product type pages
  const productPages: MetadataRoute.Sitemap = Object.keys(PRODUCT_STATS).map((productSlug) => ({
    url: `${BASE_URL}/designs/${productSlug}`,
    lastModified: SITE_LAUNCH_DATE,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Category pages — track the most recent design date per category for accurate lastModified
  const categoryLatest = new Map<string, Date>();
  for (const design of designs) {
    const key = `${design.productSlug}/${design.category}`;
    const designDate = new Date(parseInt(design.id));
    const existing = categoryLatest.get(key);
    if (!existing || designDate > existing) {
      categoryLatest.set(key, designDate);
    }
  }
  const categoryPages: MetadataRoute.Sitemap = Array.from(categoryLatest.entries()).map(([key, date]) => ({
    url: `${BASE_URL}/designs/${key}`,
    lastModified: date,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Individual design pages — use the design's own timestamp ID as the actual creation date
  // Also include the screenshot image so Google Images can index the design preview
  const designPages: MetadataRoute.Sitemap = designs.map((design) => ({
    url: `${BASE_URL}/designs/${design.productSlug}/${design.category}/${design.slug}`,
    lastModified: new Date(parseInt(design.id)),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
    images: [`${BASE_URL}/screenshots/v2026-3d/${design.id}.png`],
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...designPages];
}
