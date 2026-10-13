import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import MobileNavToggle from '#/components/shared/MobileNavToggle';
import ServerDesignsTreeNav from '#/components/designs/ServerDesignsTreeNav';
import {
  getCategoryDescription,
  getCategoryTitle,
  getProductSeoInfo,
  getSeoReadyDesigns,
  groupDesignsByCategory,
  INDEXABLE_PRODUCT_SLUGS,
  isIndexableCategoryDesignSet,
} from '#/lib/design-seo';

interface ProductPageProps {
  params: Promise<{ productType: string }>;
}

// Enable ISR - revalidate every 24 hours
export const revalidate = 86400;

export function generateStaticParams() {
  const productSlugs = new Set(
    getSeoReadyDesigns()
      .map((design) => design.productSlug)
      .filter((productSlug) => INDEXABLE_PRODUCT_SLUGS.has(productSlug)),
  );

  return [...productSlugs].map((productType) => ({ productType }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productType: productSlug } = await params;

  const productInfo = getProductSeoInfo(productSlug);
  const designs = getSeoReadyDesigns().filter(
    (design) => design.productSlug === productSlug,
  );

  // Get unique categories
  const categories = Array.from(new Set(designs.map((d) => d.category)));
  const categoryCount = categories.length;
  const designCount = designs.length;

  // Build title
  const title = `${productInfo.name} Designs | Forever Shining`;

  // Build description
  const description = `Browse ${designCount} ${productInfo.shortName.toLowerCase()} designs across ${categoryCount} categories. ${productInfo.description} Customize inscriptions, verses, motifs and photos online with live preview.`;

  // Build keywords
  const keywords = [
    productInfo.name.toLowerCase(),
    `${productInfo.shortName.toLowerCase()} ${productInfo.kind}`,
    `${productInfo.shortName.toLowerCase()} memorial`,
    `${productInfo.shortName.toLowerCase()} designs`,
    'headstone designs',
    'memorial designs',
    'custom headstone',
    'personalized memorial',
    'granite headstone',
    'memorial stone',
    'cemetery marker',
    'grave marker',
    'headstone inscriptions',
    'memorial quotes',
    'headstone motifs',
    ...categories.slice(0, 10).map((c) => c.replace(/-/g, ' ')),
  ].join(', ');

  // Build canonical URL
  const baseUrl = 'https://forevershining.org';
  const canonicalUrl = `${baseUrl}/designs/${productSlug}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: { 'x-default': canonicalUrl, 'en-US': canonicalUrl },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Forever Shining',
      locale: 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: INDEXABLE_PRODUCT_SLUGS.has(productSlug)
      ? undefined
      : { index: false, follow: true },
  };
}

export default async function ProductTypePage({ params }: ProductPageProps) {
  const { productType: productSlug } = await params;
  const productInfo = getProductSeoInfo(productSlug);
  const productDesigns = getSeoReadyDesigns().filter(
    (design) => design.productSlug === productSlug,
  );

  if (!productDesigns.length) {
    notFound();
  }

  const categoryGroups = groupDesignsByCategory(productDesigns).filter(
    ([, designs]) => isIndexableCategoryDesignSet(designs),
  );

  const baseUrl = 'https://forevershining.org';
  const canonicalUrl = `${baseUrl}/designs/${productSlug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collection`,
        url: canonicalUrl,
        name: `${productInfo.name} Designs`,
        description: productInfo.description,
        isPartOf: { '@id': `${baseUrl}#website` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Memorial Designs',
            item: `${baseUrl}/designs`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: productInfo.name,
            item: canonicalUrl,
          },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#itemlist`,
        name: `${productInfo.name} Categories`,
        numberOfItems: categoryGroups.length,
        itemListElement: categoryGroups.map(([catSlug], index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: getCategoryTitle(catSlug),
          url: `${baseUrl}/designs/${productSlug}/${catSlug}`,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MobileNavToggle>
        <ServerDesignsTreeNav />
      </MobileNavToggle>
      <aside
        className="fixed top-0 left-0 z-10 hidden h-full flex-col border-r border-slate-200 md:block"
        style={{ width: '400px' }}
      >
        <ServerDesignsTreeNav />
      </aside>

      <main className="min-h-screen overflow-y-auto bg-[#f7f5f0] md:ml-[400px]">
        <div className="container mx-auto max-w-7xl px-4 pt-20 pb-14 md:px-8 md:py-12">
          <nav
            className="mb-8 flex items-center gap-2 text-sm text-stone-500"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="font-light tracking-wide transition-colors hover:text-stone-950"
            >
              Home
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <Link
              href="/designs"
              className="font-light tracking-wide transition-colors hover:text-stone-950"
            >
              Memorial Designs
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="font-medium tracking-wide text-stone-950">
              {productInfo.name}
            </span>
          </nav>

          <header className="mb-12 max-w-4xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-[#9b7a24] uppercase">
              Browse by memorial theme
            </p>
            <h1 className="mb-5 font-serif text-4xl font-light tracking-tight text-stone-950 md:text-6xl">
              {productInfo.name} Designs
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed font-light text-stone-600 md:text-xl">
              {productInfo.description} Browse by memorial theme, then
              personalize a design with names, dates, verses, motifs and photos.
            </p>
            <p className="mt-5 text-sm font-light text-stone-500">
              {productDesigns.length.toLocaleString()} designs in{' '}
              {categoryGroups.length} strong categories
            </p>
          </header>

          <section aria-labelledby="product-categories-heading">
            <h2
              id="product-categories-heading"
              className="mb-6 font-serif text-2xl font-light text-stone-950"
            >
              Browse {productInfo.shortName} Themes
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categoryGroups.map(([category, designs]) => {
                const preview = designs[0];
                return (
                  <Link
                    key={category}
                    href={`/designs/${productSlug}/${category}`}
                    className="group overflow-hidden rounded-lg border border-stone-200 bg-white transition-all duration-300 hover:border-[#d8c487] hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_50%_28%,#ffffff_0%,#f4f0e7_52%,#e6e0d3_100%)]">
                      <Image
                        src={`/screenshots/v2026-3d/${preview.id}_small.png`}
                        alt={`${getCategoryTitle(category)} ${productInfo.shortName} preview`}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 font-serif text-xl font-light text-stone-950 transition-colors group-hover:text-[#8a6b1f]">
                        {getCategoryTitle(category)}
                      </h3>
                      <p className="mb-4 text-sm leading-relaxed font-light text-stone-600">
                        {getCategoryDescription(category)}
                      </p>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="font-light text-stone-500">
                          {designs.length.toLocaleString()} designs
                        </span>
                        <span className="inline-flex items-center font-light tracking-wider text-[#8a6b1f] uppercase transition-transform group-hover:translate-x-1">
                          View Designs
                          <ChevronRightIcon className="ml-1 h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
