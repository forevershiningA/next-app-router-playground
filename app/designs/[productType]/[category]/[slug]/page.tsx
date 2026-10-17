import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getProductFromId } from '#/lib/product-utils';
import { isDesignIndexable } from '#/lib/design-publication';
import { getDesignPresentation } from '#/lib/design-presentation';
import StartSavedDesignButton from './StartSavedDesignButton';
import DesignPageClient from './DesignPageClient';

const BRONZE_PLAQUE_FINISH = 'Clear lacquer seal over natural aluminium';

/**
 * Format slug for display - convert kebab-case to Title Case
 */
function formatSlugForDisplay(slug: string): string {
  if (!slug) return 'Memorial Design';

  return slug
    .split('-')
    .map((word, index) => {
      // Don't capitalize very short words unless first word
      if (word.length <= 2 && index > 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Extract shape name from design data
 */
/**
 * Format a raw shape name (from metadata) into Title Case for display.
 * e.g. "curved gable" → "Curved Gable", "headstone_27" → null
 */
function formatShapeName(raw: string | undefined): string | null {
  if (!raw) return null;
  // Discard pure-number or generic "headstone_N" / "plaque_N" entries
  const cleaned = raw
    .replace(/^(headstone|plaque)[_\s]\d+$/i, '')
    .replace(/_/g, ' ')
    .trim();
  if (!cleaned || /^\d+$/.test(cleaned)) return null;
  return cleaned
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Get simplified product type for metadata
 */
function getSimplifiedProductType(productName: string): string {
  const name = productName.toLowerCase();

  if (name.includes('laser-etched') || name.includes('laser etched')) {
    if (name.includes('colour') || name.includes('color')) {
      return 'Laser-Etched Color';
    }
    return 'Laser-Etched Black Granite';
  }

  if (name.includes('bronze')) return 'Bronze';
  if (name.includes('stainless steel')) return 'Stainless Steel';
  if (name.includes('traditional')) return 'Traditional Engraved';
  if (name.includes('full colour') || name.includes('full color'))
    return 'Full Color';

  return productName;
}

function buildDesignSeoTitle({
  shapeName,
  categoryTitle,
  simplifiedProduct,
  productTypeDisplay,
  phraseFromSlug,
  motifList,
}: {
  shapeName: string | null;
  categoryTitle: string;
  simplifiedProduct: string;
  productTypeDisplay: string;
  phraseFromSlug: string | null;
  motifList: string | null;
}): string {
  const productDescriptor = `${simplifiedProduct} ${productTypeDisplay}`;
  // Slugs are privacy-safe catalog labels; remove numeric duplicate suffixes.
  const detail =
    phraseFromSlug?.replace(/\s+\d+$/, '') || motifList || categoryTitle;
  return `${shapeName ? `${shapeName} ` : ''}${productDescriptor} – ${detail}`;
}

function buildDesignDescription({
  seoTitle,
  phraseFromSlug,
  motifList,
}: {
  seoTitle: string;
  phraseFromSlug: string | null;
  motifList: string | null;
}): string {
  const motifText = motifList ? ` Motifs: ${motifList}.` : '';
  const phraseText =
    phraseFromSlug && !seoTitle.includes(phraseFromSlug)
      ? ` Layout: ${phraseFromSlug.replace(/\s+\d+$/, '')}.`
      : '';
  return `${seoTitle}.${motifText}${phraseText} Personalize inscriptions and preview your memorial online before requesting a proof.`;
}

function truncateMetaDescription(description: string): string {
  return description.length > 160
    ? `${description.substring(0, 157)}...`
    : description;
}

interface SavedDesignPageProps {
  params: Promise<{
    productType: string; // Actually productSlug: 'bronze-plaque' | 'laser-etched-headstone' etc.
    category: string; // 'memorial', 'in-loving-memory', 'pet-memorial', etc.
    slug: string; // Format: {id}_{description}
  }>;
}

// Render design detail pages on demand and cache them with ISR.
// Pre-rendering hundreds of heavy saved-design pages makes production builds hang.
export async function generateStaticParams() {
  return [];
}

// Enable ISR - revalidate every 24 hours
export const revalidate = 86400;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: SavedDesignPageProps): Promise<Metadata> {
  const { productType: productSlug, category, slug } = await params;

  // Try new slug lookup first, then fall back to old format
  const { getDesignFromSlug, DESIGN_CATEGORIES } = await import(
    '#/lib/saved-designs-data'
  );
  const design = getDesignFromSlug(slug, { productSlug, category });

  if (!design) {
    return { title: 'Design Not Found' };
  }

  const product = getProductFromId(design.productId);
  const productName = product?.name || 'Design';
  const simplifiedProduct = getSimplifiedProductType(productName);

  // Get category display name
  const categoryInfo = DESIGN_CATEGORIES[design.category];
  const categoryTitle =
    categoryInfo?.name ||
    category
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  // Determine product type for title
  const productTypeDisplay =
    design.productType === 'headstone'
      ? 'Headstone'
      : design.productType === 'plaque'
        ? 'Plaque'
        : 'Monument';

  // Use shapeName directly from design metadata (no extra fetch needed)
  const shapeDisplay = formatShapeName(design.shapeName);

  // Extract the unique verse/phrase from the slug by stripping the shape prefix
  // e.g. "curved-gable-may-heavens-eternal-happiness-be-thine" → "May Heavens Eternal Happiness Be Thine"
  const shapeSlugPrefix = design.shapeName
    ? design.shapeName.toLowerCase().replace(/[\s_]+/g, '-') + '-'
    : '';
  const phraseFromSlug =
    slug.startsWith(shapeSlugPrefix) && shapeSlugPrefix
      ? formatSlugForDisplay(slug.slice(shapeSlugPrefix.length))
      : null;

  // Design-specific meta description using shape, motifs and verse from slug
  const motifList =
    design.motifNames?.length > 0
      ? design.motifNames
          .slice(0, 3)
          .join(', ')
          .replace(/,([^,]*)$/, ' and$1')
      : null;

  const seoTitle = buildDesignSeoTitle({
    shapeName: shapeDisplay,
    categoryTitle,
    simplifiedProduct,
    productTypeDisplay,
    phraseFromSlug,
    motifList,
  });
  const description = truncateMetaDescription(
    buildDesignDescription({ seoTitle, phraseFromSlug, motifList }),
  );
  const pageTitle = `${seoTitle} | Forever Shining`;

  // Build canonical URL with clean slug
  const baseUrl = 'https://forevershining.org';
  const canonicalSlug = design.slug; // Use the clean, SEO-friendly slug from metadata
  const currentPath = `/designs/${design.productSlug}/${design.category}/${canonicalSlug}`;
  const canonicalUrl = `${baseUrl}${currentPath}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: { 'x-default': canonicalUrl, 'en-US': canonicalUrl },
    },
    openGraph: {
      title: seoTitle,
      description,
      url: canonicalUrl,
      siteName: 'Forever Shining',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: `/screenshots/v2026-3d/${design.id}.png`,
          width: 1200,
          height: 630,
          alt: `${seoTitle} preview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description,
      images: [`/screenshots/v2026-3d/${design.id}.png`],
    },
    robots: isDesignIndexable(design)
      ? undefined
      : { index: false, follow: true },
  };
}

export default async function SavedDesignPage({
  params,
}: SavedDesignPageProps) {
  const { productType: productSlug, category, slug } = await params;

  // Lookup design by clean slug
  const { getDesignFromSlug, DESIGN_CATEGORIES } = await import(
    '#/lib/saved-designs-data'
  );
  const design = getDesignFromSlug(slug, { productSlug, category });

  if (!design) {
    notFound();
  }

  const canonicalPath = `/designs/${design.productSlug}/${design.category}/${design.slug}`;
  const requestedPath = `/designs/${productSlug}/${category}/${slug}`;

  if (requestedPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  const designId = design.id;
  const presentation = getDesignPresentation(design);

  // Generate structured data for SEO
  const product = getProductFromId(design.productId);
  const productName = product?.name || design.productName;
  const simplifiedProduct = getSimplifiedProductType(productName);
  const isBronzePlaqueDesign =
    design.productSlug === 'bronze-plaque' ||
    productSlug === 'bronze-plaque' ||
    design.productId === '5';
  const categoryInfo = DESIGN_CATEGORIES[design.category];
  const categoryTitle =
    categoryInfo?.name ||
    category
      .split('-')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  const productTypeDisplay =
    design.productType.charAt(0).toUpperCase() + design.productType.slice(1);
  const shapeName = formatShapeName(design.shapeName);

  // Extract verse/phrase from slug by stripping shape prefix
  const shapeSlugPrefix = design.shapeName
    ? design.shapeName.toLowerCase().replace(/[\s_]+/g, '-') + '-'
    : '';
  const phraseFromSlug =
    slug.startsWith(shapeSlugPrefix) && shapeSlugPrefix
      ? formatSlugForDisplay(slug.slice(shapeSlugPrefix.length))
      : null;

  // Motif summary for display
  const motifList =
    design.motifNames?.length > 0
      ? design.motifNames
          .slice(0, 3)
          .join(', ')
          .replace(/,([^,]*)$/, ' and$1')
      : null;

  // Determine material and color
  const material = simplifiedProduct.toLowerCase().includes('granite')
    ? 'Black granite'
    : simplifiedProduct.toLowerCase().includes('bronze')
      ? 'Bronze'
      : simplifiedProduct.toLowerCase().includes('stainless')
        ? 'Stainless steel'
        : 'Granite';

  const color = simplifiedProduct.toLowerCase().includes('black')
    ? 'Black'
    : simplifiedProduct.toLowerCase().includes('bronze')
      ? 'Bronze'
      : simplifiedProduct.toLowerCase().includes('stainless')
        ? 'Silver'
        : 'Black';

  const finish = isBronzePlaqueDesign
    ? BRONZE_PLAQUE_FINISH
    : simplifiedProduct.toLowerCase().includes('laser')
      ? 'Laser-etched'
      : simplifiedProduct.toLowerCase().includes('traditional')
        ? 'Traditional engraved'
        : 'Laser-etched';

  // Generate SKU
  const sku = `FS-${design.productType.toUpperCase()}-${shapeName ? shapeName.toUpperCase().replace(/\s+/g, '-') : 'STANDARD'}-${simplifiedProduct.toUpperCase().replace(/\s+/g, '-')}-${category.toUpperCase()}`;

  // Build canonical URL with clean slug
  const baseUrl = 'https://forevershining.org';
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  const previewScreenshotSrc = `/screenshots/v2026-3d/${design.id}.png`;

  const formattedH1 = buildDesignSeoTitle({
    shapeName,
    categoryTitle,
    simplifiedProduct,
    productTypeDisplay,
    phraseFromSlug,
    motifList,
  });
  const shortDesignName =
    shapeName && phraseFromSlug
      ? `${shapeName} – ${phraseFromSlug}`
      : shapeName
        ? `${shapeName} – ${categoryTitle}`
        : formatSlugForDisplay(slug);
  const description = buildDesignDescription({
    seoTitle: formattedH1,
    phraseFromSlug,
    motifList,
  });
  const productTitle = formattedH1;

  // JSON-LD Structured Data
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      // Product Schema
      {
        '@type': 'Product',
        '@id': `${canonicalUrl}#product`,
        name: productTitle,
        description: description,
        brand: { '@type': 'Brand', name: 'Forever Shining' },
        category: productTypeDisplay,
        material: material,
        color: color,
        additionalProperty: [
          {
            '@type': 'PropertyValue',
            name: 'Shape',
            value: shapeName || 'Standard',
          },
          { '@type': 'PropertyValue', name: 'Finish', value: finish },
          {
            '@type': 'PropertyValue',
            name: 'Personalisation',
            value: 'Inscriptions, verses, motifs',
          },
          ...(design.hasMotifs
            ? [{ '@type': 'PropertyValue', name: 'Motifs', value: 'Available' }]
            : []),
          ...(design.hasPhoto
            ? [
                {
                  '@type': 'PropertyValue',
                  name: 'Photo',
                  value: 'Photo placement available',
                },
              ]
            : []),
        ],
        image: [`${baseUrl}/screenshots/v2026-3d/${design.id}.png`],
        sku: sku,
        mpn: sku,
      },
      // BreadcrumbList Schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Memorial Designs',
            item: `${baseUrl}/designs`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: productName,
            item: `${baseUrl}/designs/${productSlug}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: categoryTitle,
            item: `${baseUrl}/designs/${productSlug}/${category}`,
          },
          {
            '@type': 'ListItem',
            position: 5,
            name: shortDesignName,
            item: canonicalUrl,
          },
        ],
      },
      // ImageObject Schema
      {
        '@type': 'ImageObject',
        '@id': `${canonicalUrl}#image`,
        url: `${baseUrl}/screenshots/v2026-3d/${design.id}.png`,
        contentUrl: `${baseUrl}/screenshots/v2026-3d/${design.id}.png`,
        name: `${productTitle} Preview`,
        description: `Preview of ${formattedH1.toLowerCase()}`,
        width: '1200',
        height: '630',
      },
      // Organization Schema
      {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        name: 'Forever Shining',
        url: baseUrl,
        logo: { '@type': 'ImageObject', url: `${baseUrl}/logo.png` },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          availableLanguage: ['English'],
        },
      },
    ],
  };

  return (
    <>
      {/* Preload hero image for LCP optimization */}
      <link
        rel="preload"
        as="image"
        href={previewScreenshotSrc}
        fetchPriority="high"
      />

      {/* Preconnect to asset domains for faster resource loading */}
      <link rel="preconnect" href={process.env.NEXT_PUBLIC_BASE_URL || ''} />
      <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_BASE_URL || ''} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* SSR-visible content for search engine indexing — hidden once client hydrates */}
      <div
        id="design-ssr-content"
        className="min-h-screen bg-white md:ml-[400px]"
      >
        <div className="border-b border-slate-200 bg-white/80">
          <div className="container mx-auto max-w-7xl px-4 py-3 md:px-8 md:py-6">
            <nav
              className="mb-6 flex items-center gap-2 text-sm text-slate-500"
              aria-label="Breadcrumb"
            >
              <Link href="/designs">Memorial Designs</Link>
              <span aria-hidden="true">›</span>
              <Link href={`/designs/${productSlug}`}>{productName}</Link>
              <span aria-hidden="true">›</span>
              <Link href={`/designs/${productSlug}/${category}`}>
                {categoryTitle}
              </Link>
              <span aria-hidden="true">›</span>
              <span>{shortDesignName}</span>
            </nav>

            <h1 className="mb-2 font-serif text-2xl font-light tracking-tight text-slate-900 md:mb-4 md:text-4xl">
              {formattedH1}
            </h1>

            <p className="mb-3 text-base font-light text-slate-500 md:mb-6 md:text-lg">
              {categoryTitle} · {simplifiedProduct} {productTypeDisplay}
            </p>

            <p className="mb-6 max-w-2xl text-slate-600">{description}</p>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div className="mx-auto mb-8 flex justify-center">
            <div className="relative aspect-[1200/630] w-full max-w-3xl overflow-hidden rounded-lg bg-stone-50 shadow-md">
              <Image
                src={previewScreenshotSrc}
                alt={`${formattedH1} preview`}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          </div>

          <section
            aria-labelledby="about-design-heading"
            className="mb-8 max-w-3xl"
          >
            <h2
              id="about-design-heading"
              className="mb-3 text-xl font-semibold text-slate-800"
            >
              About This Custom Memorial Design
            </h2>
            <div className="space-y-3 text-sm leading-7 text-slate-600">
              <p>
                This {categoryTitle.toLowerCase()} layout is a starting point
                for a personalized {simplifiedProduct.toLowerCase()}{' '}
                {productTypeDisplay.toLowerCase()}. Use it to compare the shape,
                inscription balance and decorative detail before opening the
                design tool for final changes.
              </p>
              <p>
                You can adjust the wording, choose memorial fonts, add or remove
                headstone motifs, upload photos where supported and review a
                live 3D preview before requesting a proof.
              </p>
              <p>
                Browse more{' '}
                <Link
                  href={`/designs/${productSlug}/${category}`}
                  className="font-medium text-slate-900 underline underline-offset-4"
                >
                  {categoryTitle.toLowerCase()} designs
                </Link>
                , compare other{' '}
                <Link
                  href={`/designs/${productSlug}`}
                  className="font-medium text-slate-900 underline underline-offset-4"
                >
                  {simplifiedProduct.toLowerCase()} templates
                </Link>
                , or read the{' '}
                <Link
                  href="/designs/guide/buying-guide"
                  className="font-medium text-slate-900 underline underline-offset-4"
                >
                  memorial buying guide
                </Link>
                .
              </p>
            </div>
          </section>

          {/* Design Specifications */}
          <section aria-labelledby="specs-heading-ssr" className="mb-8">
            <h2
              id="specs-heading-ssr"
              className="mb-4 text-xl font-semibold text-slate-800"
            >
              Design Specifications
            </h2>
            <dl className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
              <div className="flex justify-between bg-slate-50 px-4 py-3">
                <dt className="font-medium text-slate-500">Material</dt>
                <dd className="font-semibold text-slate-900">{material}</dd>
              </div>
              {shapeName && (
                <div className="flex justify-between px-4 py-3">
                  <dt className="font-medium text-slate-500">Shape</dt>
                  <dd className="text-slate-900">{shapeName}</dd>
                </div>
              )}
              <div
                className={`flex justify-between px-4 py-3${shapeName ? 'bg-slate-50' : ''}`}
              >
                <dt className="font-medium text-slate-500">Finish</dt>
                <dd className="text-slate-900">{finish}</dd>
              </div>
              <div
                className={`flex justify-between px-4 py-3${shapeName ? '' : 'bg-slate-50'}`}
              >
                <dt className="font-medium text-slate-500">Type</dt>
                <dd className="text-slate-900">
                  {simplifiedProduct} {productTypeDisplay}
                </dd>
              </div>
              <div
                className={`flex justify-between px-4 py-3${shapeName ? 'bg-slate-50' : ''}`}
              >
                <dt className="font-medium text-slate-500">Category</dt>
                <dd className="text-slate-900">{categoryTitle}</dd>
              </div>
              <div
                className={`flex justify-between px-4 py-3${shapeName ? '' : 'bg-slate-50'}`}
              >
                <dt className="font-medium text-slate-500">
                  Inscription areas
                </dt>
                <dd className="text-slate-900">
                  {design.inscriptionCount} text{' '}
                  {design.inscriptionCount === 1 ? 'area' : 'areas'}
                </dd>
              </div>
              {design.hasMotifs && motifList && (
                <div className="flex justify-between bg-slate-50 px-4 py-3">
                  <dt className="font-medium text-slate-500">
                    Decorative motifs
                  </dt>
                  <dd className="text-slate-900">{motifList}</dd>
                </div>
              )}
              {design.hasPhoto && (
                <div className="flex justify-between px-4 py-3">
                  <dt className="font-medium text-slate-500">Photo portrait</dt>
                  <dd className="text-slate-900">
                    Ceramic / enamel photo placement
                  </dd>
                </div>
              )}
              {design.hasAdditions && (
                <div className="flex justify-between bg-slate-50 px-4 py-3">
                  <dt className="font-medium text-slate-500">3D additions</dt>
                  <dd className="text-slate-900">Statues and vases</dd>
                </div>
              )}
              <div className="flex justify-between px-4 py-3">
                <dt className="font-medium text-slate-500">Typical size</dt>
                <dd className="text-slate-900">
                  {design.productType === 'monument'
                    ? '36×24 in headstone + full base, ledger and curb set'
                    : design.productType === 'plaque'
                      ? '18×12 in – 36×24 in (many standard sizes)'
                      : '24×18 in – 72×36 in (custom sizes available)'}
                </dd>
              </div>
              <div className="flex justify-between bg-slate-50 px-4 py-3">
                <dt className="font-medium text-slate-500">Delivery</dt>
                <dd className="text-slate-900">Confirmed with quote</dd>
              </div>
            </dl>
          </section>

          {/* Price Guide */}
          <section aria-labelledby="price-heading-ssr" className="mb-8">
            <h2
              id="price-heading-ssr"
              className="mb-1 text-xl font-semibold text-slate-800"
            >
              Price Guide
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Indicative components only. Exact pricing is generated in the
              design tool or confirmed with your quote.
            </p>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Component
                    </th>
                    <th className="w-40 px-4 py-3 text-right font-semibold text-slate-700">
                      Quote
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 text-slate-700">
                      {simplifiedProduct} {productTypeDisplay}
                      {shapeName ? ` — ${shapeName} shape` : ''}
                      {', '}
                      {material.toLowerCase()}, {finish.toLowerCase()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      Calculated in designer
                    </td>
                  </tr>
                  {design.productType === 'monument' && (
                    <tr>
                      <td className="px-4 py-3 pl-8 text-slate-500">
                        Includes matching base, ledger slab &amp; kerb set
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        incl.
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="px-4 py-3 text-slate-700">
                      Inscriptions — {design.inscriptionCount} text{' '}
                      {design.inscriptionCount === 1 ? 'area' : 'areas'}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      Based on lettering
                    </td>
                  </tr>
                  {design.hasMotifs && (
                    <tr>
                      <td className="px-4 py-3 text-slate-700">
                        Decorative motifs{motifList ? ` — ${motifList}` : ''}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        Confirmed in quote
                      </td>
                    </tr>
                  )}
                  {design.hasPhoto && (
                    <tr>
                      <td className="px-4 py-3 text-slate-700">
                        Ceramic / enamel photo portrait
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        Confirmed in quote
                      </td>
                    </tr>
                  )}
                  {design.hasAdditions && (
                    <tr>
                      <td className="px-4 py-3 text-slate-700">
                        3D additions (statues, vases)
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        Confirmed in quote
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="px-4 py-3 text-slate-700">
                      Design proof (before manufacture)
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      Free
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-700">
                      Delivery and installation options
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      Confirmed with quote
                    </td>
                  </tr>
                  <tr className="border-t-2 border-slate-300 bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      Calculated in designer
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <ul className="mb-8 space-y-1.5 text-sm text-slate-600">
            <li>✓ Live 3D preview — see every change in real time</li>
            <li>✓ Unlimited revisions before you approve</li>
            <li>✓ Free digital proof before manufacturing</li>
            <li>✓ Delivery options confirmed with your quote</li>
            <li>✓ Clear itemised pricing before manufacture</li>
          </ul>

          <StartSavedDesignButton
            designId={designId}
            expectedProductId={String(design.productId)}
            personalization={presentation.personalization}
            className="inline-block rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Personalize This Design
          </StartSavedDesignButton>
        </div>
      </div>

      <DesignPageClient
        productSlug={productSlug}
        category={category}
        slug={slug}
        designId={designId}
        design={design}
        personalization={presentation.personalization}
      />
    </>
  );
}
