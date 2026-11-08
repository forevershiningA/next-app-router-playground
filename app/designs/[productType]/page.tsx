import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import MobileNavToggle from '#/components/shared/MobileNavToggle';
import ServerDesignsTreeNav from '#/components/designs/ServerDesignsTreeNav';
import { ThemeToggle } from '#/components/theme/ThemeToggle';
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
        className="day:border-[#e2dad0] fixed top-0 left-0 z-10 hidden h-full flex-col border-r border-white/10 md:block"
        style={{ width: '400px' }}
      >
        <ServerDesignsTreeNav />
      </aside>

      <main className="day:bg-[#f8f6f0] day:text-[#1d1a17] min-h-screen overflow-y-auto bg-[#0d0c0b] text-white md:ml-[400px]">
        <div className="container mx-auto max-w-7xl px-4 pt-20 pb-16 md:px-8 md:py-12">
          <div className="mb-8 flex items-center justify-between gap-4">
            <nav
              className="flex items-center gap-2 text-sm text-[#756c62]"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="day:hover:text-[#1d1a17] transition-colors hover:text-[#cfac6c]"
              >
                Home
              </Link>
              <ChevronRightIcon className="h-3.5 w-3.5 text-[#a89d8d]" />
              <Link
                href="/designs"
                className="day:hover:text-[#1d1a17] transition-colors hover:text-[#cfac6c]"
              >
                Memorial Designs
              </Link>
              <ChevronRightIcon className="h-3.5 w-3.5 text-[#a89d8d]" />
              <span className="day:text-[#1d1a17] font-medium text-[#c0b39f]">
                {productInfo.name}
              </span>
            </nav>
            <ThemeToggle inline />
          </div>

          <header className="mb-12 max-w-4xl">
            <span className="day:border-[#d0c2ad] day:bg-[#e8e0d1] day:text-[#74551d] inline-flex items-center gap-1.5 rounded-full border border-[#cfac6c]/40 bg-[#cfac6c]/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#e6cb8b] uppercase">
              Browse by Memorial Theme
            </span>
            <h1 className="day:text-[#1d1a17] mt-4 font-serif text-3xl leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl">
              {productInfo.name} Designs
            </h1>
            <p className="day:text-[#5c544a] mt-4 max-w-3xl text-base leading-relaxed text-[#c3bbb0] sm:text-lg">
              {productInfo.description} Browse by memorial theme, then
              personalize a design with names, dates, verses, motifs and photos.
            </p>
            <p className="day:text-[#756c62] mt-4 text-xs text-white/50">
              {productDesigns.length.toLocaleString()} designs in{' '}
              {categoryGroups.length} strong categories
            </p>
          </header>

          <section aria-labelledby="product-categories-heading">
            <div className="mb-6">
              <span className="day:text-[#8a651f] text-xs font-semibold tracking-widest text-[#cfac6c] uppercase">
                Curated Themes
              </span>
              <h2
                id="product-categories-heading"
                className="day:text-[#1d1a17] mt-1 font-serif text-2xl font-normal text-white sm:text-3xl"
              >
                Browse {productInfo.shortName} Themes
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categoryGroups.map(([category, designs]) => {
                const preview = designs[0];
                return (
                  <Link
                    key={category}
                    href={`/designs/${productSlug}/${category}`}
                    className="group day:border-[#e4ddd2] day:bg-white day:shadow-sm day:hover:shadow-md flex h-full flex-col overflow-hidden rounded-sm border border-white/10 bg-[#141311] transition-all duration-300 hover:border-[#cfac6c]/60"
                  >
                    <div className="day:border-[#e8e2d7] day:bg-[#f6f3ed] relative aspect-[4/3] overflow-hidden border-b border-white/10 bg-[#0e0d0c]">
                      <Image
                        src={`/screenshots/v2026-3d/${preview.id}_small.png`}
                        alt={`${getCategoryTitle(category)} ${productInfo.shortName} preview`}
                        fill
                        className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="day:text-[#1d1a17] day:group-hover:text-[#8a651f] font-serif text-xl font-normal text-white transition-colors group-hover:text-[#f0d89f]">
                        {getCategoryTitle(category)}
                      </h3>
                      <p className="day:text-[#625a51] mt-2 text-sm leading-relaxed text-white/70">
                        {getCategoryDescription(category)}
                      </p>
                      <div className="day:border-[#ebe4da] mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                        <span className="day:text-[#756c62] text-white/50">
                          {designs.length.toLocaleString()} designs
                        </span>
                        <span className="day:text-[#8a651f] inline-flex items-center font-semibold tracking-wider text-[#cfac6c] uppercase transition-transform group-hover:translate-x-1">
                          View Designs
                          <ChevronRightIcon className="ml-1 h-3.5 w-3.5" />
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
