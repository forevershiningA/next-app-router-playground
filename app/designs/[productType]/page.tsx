import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import MobileNavToggle from '#/components/MobileNavToggle';
import ServerDesignsTreeNav from '#/components/ServerDesignsTreeNav';
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
  params: Promise<{
    productType: string;
  }>;
}

// Enable ISR - revalidate every 24 hours
export const revalidate = 86400;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productType: productSlug } = await params;
  
  const productInfo = getProductSeoInfo(productSlug);
  const designs = getSeoReadyDesigns().filter((design) => design.productSlug === productSlug);
  
  // Get unique categories
  const categories = Array.from(new Set(designs.map(d => d.category)));
  const categoryCount = categories.length;
  const designCount = designs.length;

  // Build title
  const title = `${productInfo.name} Designs | Forever Shining`;

  // Build description
  const description = `Browse ${designCount} ${productInfo.shortName.toLowerCase()} designs across ${categoryCount} categories. ${productInfo.description} Customise inscriptions, verses, motifs and photos online with live preview.`;

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
    ...categories.slice(0, 10).map(c => c.replace(/-/g, ' '))
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
      languages: {
        'x-default': canonicalUrl,
        'en-GB': canonicalUrl,
        'en-US': canonicalUrl,
        'en-AU': canonicalUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Forever Shining',
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: INDEXABLE_PRODUCT_SLUGS.has(productSlug)
      ? undefined
      : {
          index: false,
          follow: true,
        },
  };
}

export default async function ProductTypePage({ params }: ProductPageProps) {
  const { productType: productSlug } = await params;
  const productInfo = getProductSeoInfo(productSlug);
  const productDesigns = getSeoReadyDesigns().filter((design) => design.productSlug === productSlug);

  if (!productDesigns.length) {
    notFound();
  }

  const categoryGroups = groupDesignsByCategory(productDesigns).filter(([, designs]) =>
    isIndexableCategoryDesignSet(designs),
  );

  return (
    <>
      <MobileNavToggle>
        <ServerDesignsTreeNav />
      </MobileNavToggle>
      <aside
        className="fixed left-0 top-0 z-10 hidden h-full flex-col border-r border-slate-200 md:block"
        style={{ width: '400px' }}
      >
        <ServerDesignsTreeNav />
      </aside>

      <main className="bg-[#f7f5f0] overflow-y-auto min-h-screen md:ml-[400px]">
        <div className="container mx-auto px-4 pb-14 pt-20 md:px-8 md:py-12 max-w-7xl">
          <nav className="flex items-center gap-2 text-sm text-stone-500 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-stone-950 transition-colors font-light tracking-wide">
              Home
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
            <Link href="/designs" className="hover:text-stone-950 transition-colors font-light tracking-wide">
              Memorial Designs
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-stone-950 font-medium tracking-wide">{productInfo.name}</span>
          </nav>

          <header className="mb-12 max-w-4xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#9b7a24]">
              Browse by memorial theme
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-light text-stone-950 mb-5 tracking-tight">
              {productInfo.name} Designs
            </h1>
            <p className="text-lg md:text-xl text-stone-600 font-light max-w-3xl leading-relaxed">
              {productInfo.description} Browse by memorial theme, then personalise a design with names,
              dates, verses, motifs and photos.
            </p>
            <p className="text-sm text-stone-500 mt-5 font-light">
              {productDesigns.length.toLocaleString()} designs in {categoryGroups.length} strong categories
            </p>
          </header>

          <section aria-labelledby="product-categories-heading">
            <h2 id="product-categories-heading" className="text-2xl font-serif font-light text-stone-950 mb-6">
              Browse {productInfo.shortName} Themes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <h3 className="font-serif font-light text-xl text-stone-950 group-hover:text-[#8a6b1f] transition-colors mb-2">
                        {getCategoryTitle(category)}
                      </h3>
                      <p className="text-sm text-stone-600 font-light leading-relaxed mb-4">
                        {getCategoryDescription(category)}
                      </p>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-stone-500 font-light">
                          {designs.length.toLocaleString()} designs
                        </span>
                        <span className="inline-flex items-center text-[#8a6b1f] font-light uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                          View Designs
                          <ChevronRightIcon className="w-4 h-4 ml-1" />
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
