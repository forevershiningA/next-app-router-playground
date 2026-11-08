import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  CubeIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import DesignsIndexMobileNavToggle from '#/components/designs/DesignsIndexMobileNavToggle';
import ServerDesignsTreeNav from '#/components/designs/ServerDesignsTreeNav';
import { ThemeToggle } from '#/components/theme/ThemeToggle';
import { data } from '#/app/_internal/_data';
import { PRODUCT_STATS } from '#/lib/saved-designs-data';
import {
  getCategoryTitle,
  getProductSeoInfo,
  getSeoReadyDesigns,
  groupDesignsByCategory,
  groupDesignsByProduct,
} from '#/lib/design-seo';
import { PRODUCT_BADGES } from '#/lib/memorial-category-details';
import { getProductPriceSamples } from '#/lib/server/product-pricing';
import type { ProductPriceSample } from '#/lib/types/pricing';

export const revalidate = 86400;

const PRODUCT_SLUG_TO_ID: Record<string, string> = {
  'laser-etched-headstone': '4',
  'traditional-headstone': '124',
  'bronze-plaque': '5',
  'traditional-plaque': '34',
  'laser-colour-plaque': '30',
  'full-colour-plaque': '32',
  'stainless-steel-plaque': '52',
  'traditional-monument': '101',
  'laser-monument': '100',
  'mini-headstone': '22',
  pets: '8',
};

function formatSamplePrice(sample?: ProductPriceSample) {
  if (!sample || !sample.price) return null;
  const currency = sample.currency || 'AUD';
  const prefix =
    currency === 'EUR'
      ? '€'
      : currency === 'GBP'
        ? '£'
        : currency === 'USD'
          ? 'US$'
          : '$';
  return `${prefix}${Math.round(sample.price).toLocaleString('en-US')}`;
}

function matchesDesignSearch(
  design: ReturnType<typeof getSeoReadyDesigns>[number],
  query: string,
): boolean {
  const needle = query.toLowerCase();
  return [
    design.title,
    design.slug,
    design.productName,
    design.productSlug,
    design.category,
    design.shapeName ?? '',
    ...design.motifNames,
  ]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

const selectProductImageById = new Map(
  data.products.map((product) => [product.id, product.image] as const),
);

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const hasSearchQuery = Boolean(q?.trim());
  const totalDesigns = Object.values(PRODUCT_STATS).reduce((sum, n) => sum + n, 0);
  
  const title = 'Headstone & Grave Marker Designs | Forever Shining USA';
  const description = `Browse ${totalDesigns.toLocaleString()} custom headstone, grave marker and memorial plaque designs for US families. Personalize inscriptions, motifs and photos online with live 3D preview.`;
  
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
    'headstone designer usa',
    'custom grave markers usa',
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
      locale: 'en_US',
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
        'en-US': `${baseUrl}/designs`,
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
    const query = q.trim();
    const designs = getSeoReadyDesigns();
    const results = designs.filter((design) => matchesDesignSearch(design, query)).slice(0, 120);

    return (
      <>
        <DesignsIndexMobileNavToggle />
        <aside
          className="fixed left-0 top-0 z-10 hidden h-full flex-col border-r border-slate-200 md:block"
          style={{ width: '400px' }}
        >
          <ServerDesignsTreeNav maxDesignLinksPerCategory={0} />
        </aside>

        <main className="min-h-screen bg-[#f7f5f0] md:ml-[400px]">
          <div className="container mx-auto max-w-7xl px-4 pb-14 pt-20 md:px-8 md:py-12">
            <nav className="mb-8 flex items-center gap-2 text-sm text-stone-500" aria-label="Breadcrumb">
              <Link href="/" className="font-light tracking-wide transition-colors hover:text-stone-950">
                Home
              </Link>
              <ChevronRightIcon className="h-4 w-4" />
              <Link href="/designs" className="font-light tracking-wide transition-colors hover:text-stone-950">
                Memorial Designs
              </Link>
              <ChevronRightIcon className="h-4 w-4" />
              <span className="font-medium tracking-wide text-stone-950">Search</span>
            </nav>

            <header className="mb-8 max-w-4xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#9b7a24]">
                Search memorial designs
              </p>
              <h1 className="mb-5 font-serif text-4xl font-light tracking-tight text-stone-950 md:text-6xl">
                Custom Headstone & Memorial Design Results for &quot;{query}&quot;
              </h1>
              <p className="max-w-3xl text-lg font-light leading-relaxed text-stone-700 md:text-xl">
                Browse matching custom headstone, grave marker and memorial plaque templates. Open a design to personalize
                inscriptions, photos, motifs and layout details.
              </p>
              <p className="mt-5 text-sm font-light text-stone-600">
                {results.length.toLocaleString()} matching designs shown
              </p>
            </header>

            <section aria-labelledby="design-search-heading" className="mb-10">
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
                      defaultValue={query}
                      placeholder="Search by flower, religious, photo, veteran, heart..."
                      className="h-12 w-full rounded-lg border border-stone-300 bg-[#fbfaf7] pl-12 pr-4 text-base text-stone-950 outline-none transition-colors placeholder:text-stone-500 focus:border-[#9b7a24] focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-stone-950 bg-stone-950 px-6 text-sm font-medium uppercase tracking-[0.16em] text-white transition-colors hover:border-[#8a6b1f] hover:bg-[#8a6b1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950"
                  >
                    Search
                  </button>
                </form>
              </div>
            </section>

            {results.length === 0 ? (
              <div className="rounded-lg border border-stone-200 bg-white p-8">
                <p className="text-lg font-light text-stone-700">No designs matched this search.</p>
                <Link
                  href="/designs"
                  className="mt-5 inline-flex rounded-lg border border-stone-950 bg-stone-950 px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white transition-colors hover:border-[#8a6b1f] hover:bg-[#8a6b1f]"
                >
                  Browse all designs
                </Link>
              </div>
            ) : (
              <section aria-labelledby="search-results-heading">
                <h2 id="search-results-heading" className="sr-only">
                  Matching memorial designs
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {results.map((design) => {
                    const categoryTitle = getCategoryTitle(design.category);
                    const product = getProductSeoInfo(design.productSlug);

                    return (
                      <Link
                        key={design.id}
                        href={`/designs/${design.productSlug}/${design.category}/${design.slug}`}
                        className="group overflow-hidden rounded-lg border border-stone-200 bg-white transition-all duration-300 hover:border-[#d8c487] hover:shadow-lg"
                      >
                        <div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_50%_28%,#ffffff_0%,#f4f0e7_52%,#e6e0d3_100%)]">
                          <Image
                            src={`/screenshots/v2026-3d/${design.id}_small.png`}
                            alt={`${design.title} memorial design preview`}
                            fill
                            className="object-contain p-4"
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          />
                        </div>
                        <div className="p-6">
                          <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[#8a6b1f]">
                            {product.shortName}
                          </p>
                          <h3 className="mb-2 font-serif text-xl font-light text-stone-950 transition-colors group-hover:text-[#8a6b1f]">
                            {design.title}
                          </h3>
                          <p className="text-sm font-light leading-relaxed text-stone-600">
                            {categoryTitle} template with {design.inscriptionCount} inscription{' '}
                            {design.inscriptionCount === 1 ? 'area' : 'areas'}
                            {design.motifNames.length > 0 ? ` and motifs including ${design.motifNames.slice(0, 3).join(', ')}` : ''}.
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </main>
      </>
    );
  }

  const designs = getSeoReadyDesigns();
  const productGroups = groupDesignsByProduct(designs);
  const topCategories = groupDesignsByCategory(designs).slice(0, 12);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://forevershining.org';
  const quickSearches = [
    'flowers',
    'religious',
    'simple',
    'veteran',
    'photo',
    'heart',
  ];

  const allProductIds = Object.values(PRODUCT_SLUG_TO_ID);
  const priceSamples = await getProductPriceSamples(allProductIds);

  const faqItems = [
    {
      question: 'Can each memorial design be personalized?',
      answer:
        'Yes. Each design can be customized with names, dates, inscriptions, verses, motifs, photos, materials and layout adjustments before a proof is prepared for production.',
    },
    {
      question: 'What types of memorials are included in the design gallery?',
      answer:
        'The collection includes headstone designs, bronze plaque designs, traditional engraved plaques, laser-etched monuments, pet memorials and other cemetery memorial templates.',
    },
    {
      question: 'Can I preview a headstone or plaque before ordering?',
      answer:
        'Yes. Designs can be opened in the online designer to review the layout, personalize the wording and preview the memorial before requesting a proof or placing an order.',
    },
  ];
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Custom Headstone & Memorial Designs',
      description:
        'Browse customizable headstone, grave marker, plaque and monument designs by product, memorial theme, material and finish.',
      url: `${baseUrl}/designs`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: productGroups.map(([productSlug, productDesigns], index) => {
          const product = getProductSeoInfo(productSlug);
          return {
            '@type': 'ListItem',
            position: index + 1,
            name: product.name,
            url: `${baseUrl}/designs/${productSlug}`,
            numberOfItems: productDesigns.length,
          };
        }),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
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
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <DesignsIndexMobileNavToggle />
      <aside
        className="day:border-[#e2dad0] fixed left-0 top-0 z-10 hidden h-full flex-col border-r border-white/10 md:block"
        style={{ width: '400px' }}
      >
        <ServerDesignsTreeNav maxDesignLinksPerCategory={0} />
      </aside>

      <main className="day:bg-[#f8f6f0] day:text-[#1d1a17] min-h-screen bg-[#0d0c0b] text-white md:ml-[400px]">
        <div className="container mx-auto max-w-7xl px-4 pt-20 pb-16 md:px-8 md:py-12">
          {/* Breadcrumb & Theme Toggle */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <nav className="flex items-center gap-2 text-sm text-[#756c62]" aria-label="Breadcrumb">
              <Link href="/" className="day:hover:text-[#1d1a17] transition-colors hover:text-[#cfac6c]">
                Home
              </Link>
              <ChevronRightIcon className="h-3.5 w-3.5 text-[#a89d8d]" />
              <span className="day:text-[#1d1a17] font-medium text-[#c0b39f]">Memorial Designs</span>
            </nav>
            <ThemeToggle inline />
          </div>

          {/* Header */}
          <header className="mb-10 max-w-4xl">
            <span className="day:border-[#d0c2ad] day:bg-[#e8e0d1] day:text-[#74551d] inline-flex items-center gap-1.5 rounded-full border border-[#cfac6c]/40 bg-[#cfac6c]/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#e6cb8b] uppercase">
              <SparklesIcon className="size-3.5" />
              Curated 3D Design Collections
            </span>

            <h1 className="day:text-[#1d1a17] mt-4 font-serif text-3xl leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl">
              Headstone, Grave Marker & Memorial Plaque Designs
            </h1>

            <p className="day:text-[#5c544a] mt-4 max-w-3xl text-base leading-relaxed text-[#c3bbb0] sm:text-lg">
              Browse {designs.length.toLocaleString()} custom memorial designs across {productGroups.length} curated
              collections. Each template can be personalized online with inscriptions, motifs, photos and an instant 3D preview.
            </p>

            {/* 4 Pillars of Assurance */}
            <div className="day:border-[#dcd3c4] mt-8 grid w-full grid-cols-2 gap-3.5 border-t border-white/10 pt-5 sm:grid-cols-4">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="day:text-[#8a651f] size-5 shrink-0 text-[#cfac6c]" />
                <span className="day:text-[#38332d] text-xs font-medium text-white/90">
                  30-Year Guarantee
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardDocumentCheckIcon className="day:text-[#8a651f] size-5 shrink-0 text-[#cfac6c]" />
                <span className="day:text-[#38332d] text-xs font-medium text-white/90">
                  Cemetery Approval
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CubeIcon className="day:text-[#8a651f] size-5 shrink-0 text-[#cfac6c]" />
                <span className="day:text-[#38332d] text-xs font-medium text-white/90">
                  Full 3D Real-time
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="day:text-[#8a651f] size-5 shrink-0 text-[#cfac6c]" />
                <span className="day:text-[#38332d] text-xs font-medium text-white/90">
                  Architectural Proof
                </span>
              </div>
            </div>
          </header>

          {/* Search Box */}
          <section aria-labelledby="design-search-heading" className="mb-14">
            <div className="day:border-[#e2dad0] day:bg-white day:shadow-sm rounded-sm border border-white/10 bg-[#141210] p-4 md:p-5">
              <h2 id="design-search-heading" className="sr-only">
                Search memorial designs
              </h2>
              <form action="/designs" method="get" className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="design-search" className="sr-only">
                  Search by product, theme, motif or style
                </label>
                <div className="relative flex-1">
                  <MagnifyingGlassIcon
                    className="day:text-stone-400 pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50"
                    aria-hidden="true"
                  />
                  <input
                    id="design-search"
                    name="q"
                    type="search"
                    placeholder="Search by flower, religious, photo, veteran, heart..."
                    className="day:border-[#dcd3c4] day:bg-[#fbf9f5] day:text-[#1d1a17] day:placeholder:text-stone-400 day:focus:border-[#8a651f] h-12 w-full rounded-sm border border-white/15 bg-white/5 pl-12 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-[#cfac6c]"
                  />
                </div>
                <button
                  type="submit"
                  className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#342e26] inline-flex h-12 items-center justify-center rounded-sm bg-[#cfac6c] px-6 text-xs font-semibold uppercase tracking-wider text-[#14120e] transition-colors hover:bg-[#e0c48c]"
                >
                  Search
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                {quickSearches.map((query) => (
                  <Link
                    key={query}
                    href={`/designs?q=${encodeURIComponent(query)}`}
                    className="day:border-[#e4ddd2] day:bg-[#f6f2ea] day:text-[#6f511c] day:hover:border-[#cfac6c] rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 transition-colors hover:border-[#cfac6c] hover:text-[#f0d89f]"
                  >
                    {query.charAt(0).toUpperCase() + query.slice(1)}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Browse by Product */}
          <section aria-labelledby="design-products-heading" className="mb-16">
            <div className="mb-8">
              <span className="day:text-[#8a651f] text-xs font-semibold tracking-widest text-[#cfac6c] uppercase">
                Available Product Collections
              </span>
              <h2 id="design-products-heading" className="day:text-[#1d1a17] mt-1 font-serif text-2xl font-normal text-white sm:text-3xl">
                Browse by Product
              </h2>
              <p className="day:text-[#625a51] mt-2 text-sm text-white/70">
                Start with the memorial type, then choose a theme and individual layout.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {productGroups.map(([productSlug, productDesigns]) => {
                const product = getProductSeoInfo(productSlug);
                const categories = new Set(productDesigns.map((design) => design.category));
                const productId = PRODUCT_SLUG_TO_ID[productSlug] || '4';
                const badge = PRODUCT_BADGES[productId];
                const priceSample = priceSamples[productId];
                const imageSrc = `/webp/products/APP_ID_${productId}-big.webp`;

                return (
                  <article
                    key={productSlug}
                    className="group day:border-[#e4ddd2] day:bg-white day:shadow-sm day:hover:shadow-md flex h-full flex-col overflow-hidden rounded-sm border border-white/10 bg-[#141311] transition-all duration-300 hover:border-[#cfac6c]/60"
                  >
                    <Link
                      href={`/designs/${productSlug}`}
                      className="day:border-[#e8e2d7] day:bg-[#f6f3ed] relative block aspect-[4/3] overflow-hidden border-b border-white/10 bg-[#0e0d0c] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#cfac6c]"
                    >
                      <Image
                        src={imageSrc}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {badge && (
                        <span className="day:border-[#d5c9b7] day:bg-white/95 day:text-[#6f511c] absolute top-3 right-3 rounded-full border border-white/20 bg-black/75 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#e6cb8b] uppercase backdrop-blur-xs">
                          {badge.label}
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex-1">
                        <h3 className="day:text-[#1d1a17] font-serif text-xl font-normal text-white">
                          {product.name}
                        </h3>
                        <p className="day:text-[#625a51] mt-2 text-sm leading-relaxed text-white/70">
                          {product.description}
                        </p>
                        {badge?.highlight && (
                          <p className="day:text-[#8a651f] mt-2 text-xs font-medium text-[#cfac6c]/90">
                            ✦ {badge.highlight}
                          </p>
                        )}
                      </div>

                      <div className="day:border-[#ebe4da] mt-6 border-t border-white/10 pt-4">
                        <div className="mb-3 flex items-baseline justify-between">
                          {priceSample ? (
                            <div>
                              <span className="day:text-[#756c62] block text-[11px] uppercase tracking-wider text-white/50">
                                Starting from
                              </span>
                              <span className="day:text-[#1d1a17] text-xl font-semibold text-white">
                                {formatSamplePrice(priceSample)}
                              </span>
                              <span className="day:text-[#756c62] ml-1.5 text-xs text-white/50">
                                ({priceSample.width} × {priceSample.height} mm)
                              </span>
                            </div>
                          ) : (
                            <span className="day:text-[#756c62] text-xs text-white/50">
                              Custom sizing available
                            </span>
                          )}
                          <span className="day:text-[#756c62] text-xs text-white/60">
                            {productDesigns.length.toLocaleString()} designs
                          </span>
                        </div>

                        <Link
                          href={`/designs/${productSlug}`}
                          className="day:border-[#1d1a17] day:bg-[#1d1a17] day:text-white day:hover:bg-[#342e26] day:hover:text-white day:group-hover:bg-[#342e26] day:group-hover:text-white inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-sm border border-[#cfac6c]/60 bg-transparent px-4 py-2.5 text-sm font-semibold text-[#f0d89f] transition-all group-hover:bg-[#cfac6c] group-hover:text-[#14120f]"
                        >
                          <span>Browse {categories.size} Categories</span>
                          <ArrowRightIcon className="size-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Popular Memorial Themes */}
          <section aria-labelledby="design-categories-heading" className="mb-14">
            <div className="mb-6">
              <span className="day:text-[#8a651f] text-xs font-semibold tracking-widest text-[#cfac6c] uppercase">
                Curated Themes
              </span>
              <h2 id="design-categories-heading" className="day:text-[#1d1a17] mt-1 font-serif text-2xl font-normal text-white sm:text-3xl">
                Popular Memorial Themes
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topCategories.map(([category, categoryDesigns]) => {
                const [productSlug, linkedDesigns] = groupDesignsByProduct(categoryDesigns)[0];
                return (
                  <Link
                    key={category}
                    href={`/designs/${productSlug}/${category}`}
                    className="group day:border-[#e4ddd2] day:bg-white day:shadow-sm flex flex-col justify-between rounded-sm border border-white/10 bg-[#141311] p-5 transition-all hover:border-[#cfac6c]/60"
                  >
                    <div>
                      <h3 className="day:text-[#1d1a17] day:group-hover:text-[#8a651f] font-serif text-lg font-medium text-white transition-colors group-hover:text-[#f0d89f]">
                        {getCategoryTitle(category)}
                      </h3>
                      <p className="day:text-[#625a51] mt-2 text-xs text-white/60">
                        {linkedDesigns.length.toLocaleString()} {getProductSeoInfo(productSlug).shortName.toLowerCase()} designs
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-end">
                      <span className="day:text-[#8a651f] inline-flex items-center text-xs font-semibold tracking-wider text-[#cfac6c] uppercase">
                        <span>View</span>
                        <ChevronRightIcon className="ml-1 h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Design Guides */}
          <section className="day:border-[#e2dad0] border-t border-white/10 pt-10">
            <h2 className="day:text-[#1d1a17] mb-4 font-serif text-2xl font-normal text-white">
              Design & Cemetery Guides
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                ['Buying Guide', '/designs/guide/buying-guide'],
                ['Pricing Guide', '/designs/guide/pricing'],
                ['Cemetery Regulations', '/designs/guide/cemetery-regulations'],
                ['Design Your Own', '/designs/guide/design-your-own'],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="day:border-[#e4ddd2] day:bg-white day:shadow-sm rounded-sm border border-white/10 bg-[#141311] p-5 text-sm font-medium transition-all hover:border-[#cfac6c]/60"
                >
                  <span className="day:text-[#1d1a17] text-white/90">{label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Consultation & FAQ */}
          <section className="day:border-[#e2dad0] mt-14 grid gap-10 border-t border-white/10 pt-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h2 className="day:text-[#1d1a17] mb-4 font-serif text-2xl font-normal text-white">
                Custom Memorial Designs for Headstones, Plaques and Monuments
              </h2>
              <div className="day:text-[#625a51] space-y-4 text-sm leading-relaxed text-white/70">
                <p>
                  Forever Shining memorial designs are built as practical starting points for families choosing
                  a personalized cemetery memorial. Browse custom memorial designs by product type, tribute theme,
                  material and finish, then open any layout in the online design tool to adjust the inscription,
                  motif placement, photos and overall balance.
                </p>
                <p>
                  The gallery includes laser-etched black granite headstones, traditional engraved headstones,
                  bronze memorial plaques, stainless steel plaques, stone plaques, monuments and pet memorials.
                  Each template is designed to help you compare proportions, headstone motifs and wording before
                  a final proof is prepared for manufacture and delivery.
                </p>
              </div>

              {/* Consultation Card */}
              <div className="day:border-[#e2dad0] day:bg-white day:shadow-sm mt-8 rounded-sm border border-white/10 bg-[#161513] p-6">
                <h3 className="day:text-[#1d1a17] font-serif text-lg font-medium text-white">
                  Need Help or Cemetery Bylaw Advice?
                </h3>
                <p className="day:text-[#625a51] mt-2 text-xs leading-relaxed text-white/70">
                  Our memorial consultants are here to help verify guidelines and ensure 100% cemetery approval.
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <a
                    href="tel:+16473880931"
                    className="day:text-[#1d1a17] flex items-center gap-2 font-medium text-white transition-colors hover:text-[#cfac6c]"
                  >
                    <PhoneIcon className="day:text-[#8a651f] size-4 text-[#cfac6c]" />
                    <span>North America: (+1) 647 388 0931</span>
                  </a>
                  <a
                    href="tel:+61861910396"
                    className="day:text-[#1d1a17] flex items-center gap-2 font-medium text-white transition-colors hover:text-[#cfac6c]"
                  >
                    <PhoneIcon className="day:text-[#8a651f] size-4 text-[#cfac6c]" />
                    <span>Australia & International: +61 8 6191 0396</span>
                  </a>
                  <a
                    href="mailto:admin@forevershining.com.au"
                    className="day:text-[#1d1a17] flex items-center gap-2 font-medium text-white transition-colors hover:text-[#cfac6c]"
                  >
                    <EnvelopeIcon className="day:text-[#8a651f] size-4 text-[#cfac6c]" />
                    <span>admin@forevershining.com.au</span>
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h2 className="day:text-[#1d1a17] mb-4 font-serif text-2xl font-normal text-white">
                Memorial Design Questions
              </h2>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="day:border-[#e4ddd2] day:bg-white rounded-sm border border-white/10 bg-[#141311] p-5 transition-colors"
                  >
                    <summary className="day:text-[#1d1a17] cursor-pointer text-sm font-medium text-white focus:outline-none">
                      {item.question}
                    </summary>
                    <p className="day:text-[#625a51] mt-3 text-sm leading-relaxed text-white/70">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
