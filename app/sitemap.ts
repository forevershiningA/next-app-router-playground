import { MetadataRoute } from 'next';
import { productSEOData } from '#/lib/seo-templates';
import { memorialTypePages } from '#/lib/memorial-product-pages';
import {
  getSeoReadyDesigns,
  groupDesignsByCategory,
  groupDesignsByProduct,
  MIN_INDEXABLE_CATEGORY_DESIGNS,
} from '#/lib/design-seo';

const BASE_URL = 'https://forevershining.org';

// ISR: cache for 24 hours — data is static, regenerating on every crawl wastes budget
export const revalidate = 86400;

// Approximate date the design gallery launched (from GSC indexing chart)
const SITE_LAUNCH_DATE = new Date('2026-02-13');

export default function sitemap(): MetadataRoute.Sitemap {
  const designs = getSeoReadyDesigns();
  const productGroups = groupDesignsByProduct(designs);

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

  const memorialTypePagesSitemap: MetadataRoute.Sitemap = Object.keys(memorialTypePages).map((typeSlug) => ({
    url: `${BASE_URL}/memorials/${typeSlug}`,
    lastModified: SITE_LAUNCH_DATE,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // Product type pages
  const productPages: MetadataRoute.Sitemap = productGroups.map(([productSlug]) => ({
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
  const categoryDesignCounts = new Map<string, number>(
    productGroups.flatMap(([productSlug, productDesigns]) =>
      groupDesignsByCategory(productDesigns).map(([category, categoryDesigns]) => [
        `${productSlug}/${category}`,
        categoryDesigns.length,
      ] as const),
    ),
  );
  const categoryPages: MetadataRoute.Sitemap = Array.from(categoryLatest.entries())
    .filter(([key]) => (categoryDesignCounts.get(key) ?? 0) >= MIN_INDEXABLE_CATEGORY_DESIGNS)
    .map(([key, date]) => ({
      url: `${BASE_URL}/designs/${key}`,
      lastModified: date,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // Individual design pages — only curated products with regenerated screenshots
  const designPages: MetadataRoute.Sitemap = designs.map((design) => ({
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
    ...memorialTypePagesSitemap,
    ...productPages,
    ...categoryPages,
    ...designPages,
  ];
}
