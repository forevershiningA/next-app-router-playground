import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
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

          <header className="mb-12 max-w-4xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#9b7a24]">
              Customisable memorial templates
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-light text-stone-950 mb-5 tracking-tight">
              Memorial Design Collection
            </h1>
            <p className="text-lg md:text-xl text-stone-600 font-light max-w-3xl leading-relaxed">
              Browse headstone, plaque and monument designs by product, tribute theme, material and finish.
              Each template can be personalised online with inscriptions, motifs, photos and a live preview.
            </p>
            <p className="text-sm text-stone-500 mt-5 font-light">
              {designs.length.toLocaleString()} design templates across {productGroups.length} curated collections
            </p>
          </header>

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
                    className="group overflow-hidden rounded-lg border border-stone-200 bg-white transition-all duration-300 hover:border-[#d8c487] hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_50%_28%,#ffffff_0%,#f4f0e7_52%,#e6e0d3_100%)]">
                      <Image
                        src={`/screenshots/v2026-3d/${preview.id}_small.png`}
                        alt={`${product.name} design preview`}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        unoptimized
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-serif font-light text-2xl text-stone-950 group-hover:text-[#8a6b1f] transition-colors mb-2">
                        {product.name}
                      </h3>
                      <p className="text-stone-600 font-light text-sm leading-relaxed mb-5">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-stone-500 font-light">
                          {productDesigns.length.toLocaleString()} designs in {categories.size} categories
                        </span>
                        <span className="inline-flex items-center text-[#8a6b1f] font-light uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                          Explore
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
                    <p className="text-sm text-stone-500 font-light">
                      {categoryDesigns.length.toLocaleString()} matching designs
                    </p>
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
