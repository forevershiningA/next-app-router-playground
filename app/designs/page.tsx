import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import MobileNavToggle from '#/components/MobileNavToggle';
import DesignsTreeNav from '#/components/DesignsTreeNav';
import { PRODUCT_STATS } from '#/lib/saved-designs-data';
import {
  getCategoryTitle,
  getProductSeoInfo,
  getSeoReadyDesigns,
  groupDesignsByCategory,
  groupDesignsByProduct,
} from '#/lib/design-seo';
import DesignsPageClient from './DesignsPageClient';

export const revalidate = 86400;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const hasSearchQuery = Boolean(q?.trim());
  const totalDesigns = Object.values(PRODUCT_STATS).reduce((sum, n) => sum + n, 0);
  
  const title = 'Memorial Designs - Headstones, Plaques & Monuments | Forever Shining';
  const description = `Explore ${totalDesigns.toLocaleString()} premium memorial designs including traditional headstones, laser-etched monuments, and bronze plaques. Customize with inscriptions, granite colors, and motifs. View in 3D before ordering.`;
  
  // Generate keywords from actual data
  const keywords = [
    'memorial designs',
    'headstone designs',
    'memorial plaque gallery',
    'traditional engraved headstone',
    'laser etched memorial',
    'bronze memorial plaque',
    'custom headstone',
    'granite headstone designs',
    'cemetery monument',
    'personalized memorial',
    'headstone inscriptions',
    'memorial motifs',
    '3D headstone preview',
    'cemetery headstone',
    'grave marker designs',
    'memorial stone design',
    'forever shining australia',
  ];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://forevershining.org';
  const canonicalUrl = `${baseUrl}/designs`;

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Forever Shining',
      locale: 'en_AU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-GB': `${baseUrl}/designs`,
        'en-US': `${baseUrl}/designs`,
        'en-AU': `${baseUrl}/designs`,
        'x-default': `${baseUrl}/designs`,
      },
    },
    robots: hasSearchQuery
      ? {
          index: false,
          follow: true,
        }
      : undefined,
  };
}

export default async function DesignsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  if (q?.trim()) {
    return <DesignsPageClient initialQuery={q} />;
  }

  const designs = getSeoReadyDesigns();
  const productGroups = groupDesignsByProduct(designs);
  const topCategories = groupDesignsByCategory(designs).slice(0, 12);
  const quickSearches = [
    'flowers',
    'religious',
    'simple',
    'veteran',
    'photo',
    'heart',
  ];

  return (
    <>
      <MobileNavToggle>
        <DesignsTreeNav />
      </MobileNavToggle>

      <main className="bg-[#f7f5f0] min-h-screen md:ml-[400px]">
        <div className="container mx-auto px-4 pb-14 pt-20 md:px-8 md:py-12 max-w-7xl">
          <nav className="flex items-center gap-2 text-sm text-stone-500 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-stone-950 transition-colors font-light tracking-wide">
              Home
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-stone-950 font-medium tracking-wide">Memorial Designs</span>
          </nav>

          <header className="mb-8 max-w-5xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#9b7a24]">
              Customisable memorial templates
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-light text-stone-950 mb-5 tracking-tight">
              Memorial Design Collection
            </h1>
            <p className="text-lg md:text-xl text-stone-700 font-light max-w-3xl leading-relaxed">
              Browse headstone, plaque and monument designs by product, tribute theme, material and finish.
              Each template can be personalised online with inscriptions, motifs, photos and a live preview.
            </p>
            <p className="text-sm text-stone-600 mt-5 font-light">
              {designs.length.toLocaleString()} design templates across {productGroups.length} curated collections
            </p>
          </header>

          <section aria-labelledby="design-search-heading" className="mb-12">
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm md:p-5">
              <h2 id="design-search-heading" className="sr-only">
                Search memorial designs
              </h2>
              <form action="/designs" method="get" className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="design-search" className="sr-only">
                  Search by product, theme, motif or style
                </label>
                <div className="relative flex-1">
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500"
                    aria-hidden="true"
                  />
                  <input
                    id="design-search"
                    name="q"
                    type="search"
                    placeholder="Search by flower, religious, photo, veteran, heart..."
                    className="h-12 w-full rounded-lg border border-stone-300 bg-[#fbfaf7] pl-12 pr-4 text-base text-stone-950 outline-none transition-colors placeholder:text-stone-500 focus:border-[#9b7a24] focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-stone-950 bg-stone-950 px-6 text-sm font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#8a6b1f] hover:border-[#8a6b1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950"
                >
                  Search
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                {quickSearches.map((query) => (
                  <Link
                    key={query}
                    href={`/designs?q=${encodeURIComponent(query)}`}
                    className="rounded-full border border-stone-200 bg-[#f7f5f0] px-3 py-1.5 text-sm text-stone-700 transition-colors hover:border-[#d8c487] hover:text-stone-950"
                  >
                    {query.charAt(0).toUpperCase() + query.slice(1)}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section aria-labelledby="design-products-heading" className="mb-16">
            <div className="flex items-end justify-between gap-6 mb-6">
              <div>
                <h2 id="design-products-heading" className="text-2xl font-serif font-light text-stone-950">
                  Browse by Product
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                  Start with the memorial type, then choose a theme and individual layout.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {productGroups.map(([productSlug, productDesigns]) => {
                const product = getProductSeoInfo(productSlug);
                const categories = new Set(productDesigns.map((design) => design.category));
                const preview = productDesigns[0];

                return (
                  <Link
                    key={productSlug}
                    href={`/designs/${productSlug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white transition-all duration-300 hover:border-[#d8c487] hover:shadow-lg"
                  >
                    <div className="relative aspect-[5/4] bg-[radial-gradient(circle_at_50%_28%,#ffffff_0%,#f4f0e7_52%,#e6e0d3_100%)]">
                      <Image
                        src={`/screenshots/v2026-3d/${preview.id}_small.png`}
                        alt={`${product.name} design preview`}
                        fill
                        className="object-contain p-6"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-serif font-light text-2xl text-stone-950 group-hover:text-[#8a6b1f] transition-colors mb-2">
                        {product.name}
                      </h3>
                      <p className="text-stone-600 font-light text-sm leading-relaxed mb-5">
                        {product.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-4 border-t border-stone-100 pt-4 text-sm">
                        <span className="text-stone-600 font-light">
                          {productDesigns.length.toLocaleString()} designs in {categories.size} categories
                        </span>
                        <span className="inline-flex items-center rounded-full border border-[#d8c487] px-3 py-1.5 text-[#8a6b1f] font-medium uppercase tracking-[0.14em] transition-colors group-hover:bg-[#8a6b1f] group-hover:text-white">
                          Browse
                          <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="design-categories-heading" className="mb-12">
            <h2 id="design-categories-heading" className="text-2xl font-serif font-light text-stone-950 mb-6">
              Popular Memorial Themes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCategories.map(([category, categoryDesigns]) => {
                const firstDesign = categoryDesigns[0];
                return (
                  <Link
                    key={category}
                    href={`/designs/${firstDesign.productSlug}/${category}`}
                    className="group bg-white border border-stone-200 rounded-lg p-5 hover:border-[#d8c487] hover:shadow-md transition-all"
                  >
                    <h3 className="font-serif text-xl font-light text-stone-950 group-hover:text-[#8a6b1f] transition-colors mb-1">
                      {getCategoryTitle(category)}
                    </h3>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <p className="text-sm text-stone-600 font-light">
                        {categoryDesigns.length.toLocaleString()} matching designs
                      </p>
                      <span className="inline-flex items-center text-sm font-medium text-[#8a6b1f]">
                        View
                        <ChevronRightIcon className="ml-1 h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="border-t border-stone-200 pt-10">
            <h2 className="text-2xl font-serif font-light text-stone-950 mb-4">
              Design Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                ['Buying Guide', '/designs/guide/buying-guide'],
                ['Pricing Guide', '/designs/guide/pricing'],
                ['Cemetery Regulations', '/designs/guide/cemetery-regulations'],
                ['Design Your Own', '/designs/guide/design-your-own'],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="bg-white border border-stone-200 rounded-lg p-5 text-stone-800 hover:border-[#d8c487] hover:shadow-md transition-all"
                >
                  <span className="font-light">{label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
