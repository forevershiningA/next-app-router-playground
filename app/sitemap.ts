import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { getAllSavedDesigns, PRODUCT_STATS } from '#/lib/saved-designs-data';
import { productSEOData } from '#/lib/seo-templates';

const BASE_URL = 'https://forevershining.org';

// ISR: cache for 24 hours — data is static, regenerating on every crawl wastes budget
export const revalidate = 86400;

// Approximate date the design gallery launched (from GSC indexing chart)
const SITE_LAUNCH_DATE = new Date('2026-02-13');

/** IDs of designs that have a real screenshot on disk — avoids broken image entries in sitemap */
function getScreenshotIds(): Set<string> {
  const dir = path.join(process.cwd(), 'public', 'screenshots', 'v2026-3d');
  if (!fs.existsSync(dir)) return new Set();
  return new Set(
    fs.readdirSync(dir)
      .filter((f) => f.endsWith('.png') && !f.includes('_small'))
      .map((f) => f.replace('.png', ''))
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const designs = getAllSavedDesigns();
  const screenshotIds = getScreenshotIds();

  // Only include designs that have a screenshot — skip broken image entries
  const indexableDesigns = screenshotIds.size > 0
    ? designs.filter((d) => screenshotIds.has(d.id))
    : designs;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: SITE_LAUNCH_DATE, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/designs`, lastModified: SITE_LAUNCH_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/select-size`, lastModified: SITE_LAUNCH_DATE, changeFrequency: 'monthly', priority: 0.8 },
  ];

  const guidePages: MetadataRoute.Sitemap = [
    'buying-guide',
    'cemetery-regulations',
    'design-your-own',
    'pricing',
  ].map((slug) => ({
    url: `${BASE_URL}/designs/guide/${slug}`,
    lastModified: SITE_LAUNCH_DATE,
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }));

  const seoProductPages: MetadataRoute.Sitemap = Object.keys(productSEOData).map((productSlug) => ({
    url: `${BASE_URL}/products/${productSlug}`,
    lastModified: SITE_LAUNCH_DATE,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

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

  // Individual design pages — only designs with screenshots to avoid broken image entries
  const designPages: MetadataRoute.Sitemap = indexableDesigns.map((design) => ({
    url: `${BASE_URL}/designs/${design.productSlug}/${design.category}/${design.slug}`,
    lastModified: new Date(parseInt(design.id)),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
    images: [`${BASE_URL}/screenshots/v2026-3d/${design.id}.png`],
  }));

  return [
    ...staticPages,
    ...guidePages,
    ...seoProductPages,
    ...productPages,
    ...categoryPages,
    ...designPages,
  ];
}
