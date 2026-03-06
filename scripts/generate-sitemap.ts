import { writeFileSync } from 'fs';
import { join } from 'path';
import { getAllSavedDesigns, DESIGN_CATEGORIES, PRODUCT_STATS } from '../lib/saved-designs-data';

const BASE_URL = 'https://forevershining.org';
const TODAY = new Date().toISOString().split('T')[0];

interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}

const designs = getAllSavedDesigns();

const entries: SitemapEntry[] = [];

// Static pages
entries.push(
  { url: BASE_URL, lastmod: TODAY, changefreq: 'weekly', priority: 1.0 },
  { url: `${BASE_URL}/designs`, lastmod: TODAY, changefreq: 'weekly', priority: 0.9 },
  { url: `${BASE_URL}/select-size`, lastmod: TODAY, changefreq: 'monthly', priority: 0.8 },
);

// Product type pages
for (const productSlug of Object.keys(PRODUCT_STATS)) {
  entries.push({ url: `${BASE_URL}/designs/${productSlug}`, lastmod: TODAY, changefreq: 'weekly', priority: 0.8 });
}

// Category pages — unique productSlug/category combinations
const categoryKeys = new Set<string>();
for (const design of designs) {
  categoryKeys.add(`${design.productSlug}/${design.category}`);
}
for (const key of categoryKeys) {
  entries.push({ url: `${BASE_URL}/designs/${key}`, lastmod: TODAY, changefreq: 'weekly', priority: 0.7 });
}

// Individual design pages
for (const design of designs) {
  entries.push({
    url: `${BASE_URL}/designs/${design.productSlug}/${design.category}/${design.slug}`,
    lastmod: TODAY,
    changefreq: 'monthly',
    priority: 0.6,
  });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const outPath = join(__dirname, '..', 'public', 'sitemap.xml');
writeFileSync(outPath, xml, 'utf-8');
console.log(`✅ sitemap.xml written to public/sitemap.xml (${entries.length} URLs)`);
