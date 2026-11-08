import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CubeIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import PublicHeader from '#/components/MemorialPublicHeader';
import {
  getMemorialTypePageData,
  isMemorialTypeSlug,
  memorialTypePages,
  type MemorialTypeSlug,
} from '#/lib/memorial-product-pages';
import { getDesignerProductSlug } from '#/lib/designer-product-routes';
import { getProductPriceSamples } from '#/lib/server/product-pricing';
import type { ProductPriceSample } from '#/lib/types/pricing';
import {
  CATEGORY_DETAILS,
  PRODUCT_BADGES,
} from '#/lib/memorial-category-details';
import MemorialFaqAccordion from './MemorialFaqAccordion';
import MemorialCemeteryGallery, {
  type GalleryImage,
} from './MemorialCemeteryGallery';
import homeGalleryData from '#/app/_internal/home-gallery.json';

type PageProps = { params: Promise<{ type: string }> };

const BASE_URL = 'https://forevershining.org';

const productCategoryLabels: Record<string, string> = {
  headstones: 'Memorial headstone',
  plaques: 'Memorial plaque',
  monuments: 'Full monument',
  urns: 'Memorial urn',
  'pet-memorials': 'Pet memorial',
};

const memorialBuyingGuidance: Record<
  MemorialTypeSlug,
  { summary: string; points: string[] }
> = {
  headstones: {
    summary:
      'Compare headstone shapes, granite finishes, inscription space and cemetery requirements before starting a design. Upright headstones usually need clear lettering, durable material choices and proportions approved by the cemetery.',
    points: [
      'Choose black granite for detailed laser-etched portraits, landscapes and fine artwork.',
      'Use traditional engraved granite when the priority is classic lettering and long-term readability.',
      'Check cemetery rules for maximum height, base requirements and permitted accessories before approval.',
    ],
  },
  plaques: {
    summary:
      'Memorial plaques are commonly chosen for cemetery niches, walls, gardens, cremation memorials and compact grave markers. Compare bronze, stainless steel, laser color and engraved stone options by finish, size and installation setting.',
    points: [
      'Bronze plaques suit formal cemetery markers with raised lettering and decorative borders.',
      'Laser color and full color plaques are stronger choices when a portrait or image-led tribute matters.',
      'Stainless steel plaques suit modern memorial walls, garden markers and clean reflective finishes.',
    ],
  },
  'full-monuments': {
    summary:
      'Full monuments combine an upright memorial with base, ledger, kerb or matching stone components. They need more planning than a single headstone because proportions, installation and cemetery approval all affect the final design.',
    points: [
      'Use full monuments when the family wants a larger memorial presence and matching stonework.',
      'Confirm cemetery rules for kerbs, ledgers, foundations and maximum plot coverage.',
      'Keep the inscription hierarchy clear so names and dates remain readable across the larger layout.',
    ],
  },
  urns: {
    summary:
      'Personalized memorial urns can include vitreous enamel backgrounds, photos, names, dates and symbolic artwork. They are useful when families want a smaller keepsake or cremation memorial with a finished visual design.',
    points: [
      'Photo and background choices have the biggest effect on the look of a personalized urn.',
      'Shorter inscriptions usually work better on curved or compact urn surfaces.',
      'Match motifs and colors to the person, service theme or family remembrance setting.',
    ],
  },
  'pet-memorials': {
    summary:
      'Pet memorials include mini headstones, plaques and rocks for dogs, cats, horses and other companion animals. The best layouts usually keep the pet photo or animal motif prominent while leaving enough space for a short inscription.',
    points: [
      'Use pet plaques for compact garden memorials, walls or small remembrance spaces.',
      'Choose pet mini headstones when the memorial needs a more traditional grave marker shape.',
      'Horse and companion animal designs work well with landscape artwork, silhouettes and simple wording.',
    ],
  },
};

function productDesignerUrl(productId: string) {
  const slug = getDesignerProductSlug(productId);
  return slug
    ? `/${slug}/select-shape`
    : `/select-shape?productId=${productId}`;
}

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

export function generateStaticParams() {
  return Object.keys(memorialTypePages).map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { type } = await params;
  if (!isMemorialTypeSlug(type)) {
    return { title: 'Product Type Not Found' };
  }

  const page = getMemorialTypePageData(type);
  const url = `${BASE_URL}/memorials/${type}`;
  const guidance = memorialBuyingGuidance[type];
  const categoryDetails = CATEGORY_DETAILS[type];

  const title = categoryDetails
    ? `${categoryDetails.heroHeadline} | Forever Shining`
    : `${page.title} | Forever Shining`;
  const description = categoryDetails
    ? categoryDetails.heroSubheadline
    : guidance
      ? guidance.summary
      : page.intro;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Forever Shining',
      type: 'website',
      images: page.gallery.map((image) => ({
        url: image.src,
        width: 705,
        height: 705,
        alt: image.alt,
      })),
    },
  };
}

function productTypeJsonLd(page: ReturnType<typeof getMemorialTypePageData>) {
  const url = `${BASE_URL}/memorials/${page.slug}`;
  const guidance = memorialBuyingGuidance[page.slug];
  const description = guidance ? guidance.summary : page.intro;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#webpage`,
        url,
        name: `${page.title} | Forever Shining`,
        description,
        primaryImageOfPage: page.gallery[0]
          ? {
              '@type': 'ImageObject',
              url: page.gallery[0].src,
              caption: page.gallery[0].alt,
            }
          : undefined,
        isPartOf: { '@id': `${BASE_URL}#website` },
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#products`,
        name: `${page.title} products`,
        itemListElement: page.products.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: product.displayName,
            category:
              productCategoryLabels[product.category] ?? product.category,
            image: `${BASE_URL}/webp/products/${product.image}`,
            description: product.description,
            url: `${BASE_URL}${productDesignerUrl(product.id)}`,
          },
        })),
      },
      {
        '@type': 'ImageGallery',
        '@id': `${url}#gallery`,
        name: `${page.title} gallery examples`,
        image: page.gallery.map((image) => ({
          '@type': 'ImageObject',
          url: image.src,
          caption: image.alt,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: page.title, item: url },
        ],
      },
    ],
  };
}

export default async function MemorialTypePage({ params }: PageProps) {
  const { type } = await params;
  if (!isMemorialTypeSlug(type)) {
    notFound();
  }

  const page = getMemorialTypePageData(type as MemorialTypeSlug);
  const guidance = memorialBuyingGuidance[page.slug];
  const categoryDetails = CATEGORY_DETAILS[type] ?? CATEGORY_DETAILS.headstones;

  const productIds = page.products.map((p) => p.id);
  const priceSamples = await getProductPriceSamples(productIds);

  const flagshipId = categoryDetails.flagshipProductId || page.products[0]?.id;
  const flagshipProduct =
    page.products.find((p) => p.id === flagshipId) || page.products[0];
  const flagshipPrice = priceSamples[flagshipId];
  const flagshipBadge =
    categoryDetails.flagshipBadge ||
    PRODUCT_BADGES[flagshipId]?.label ||
    'Featured Style';

  const catGallery = homeGalleryData.find((g) => g.id === type)?.images || [];
  const cemeteryImages: GalleryImage[] = catGallery
    .slice(0, 6)
    .map((img) => ({
      src: img.src,
      thumbnail: img.thumbnail || img.src,
      alt: img.alt || `${page.title} memorial installation`,
      width: img.width || 1200,
      height: img.height || 1200,
    }));

  return (
    <main
      className="day:bg-[#f8f6f0] day:text-[#1d1a17] min-h-screen bg-[#0d0c0b] text-white"
      data-seo-page="true"
      data-memorials-page="true"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productTypeJsonLd(page)),
        }}
      />

      <PublicHeader activeType={page.slug} />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="day:border-[#e2dad0] day:bg-none day:bg-[#f1ede3] relative border-b border-white/10 bg-gradient-to-b from-[#171614] to-[#0f0e0c]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          {/* Breadcrumb */}
          <nav className="day:text-[#756c62] mb-6 text-sm text-[#8c8275]" aria-label="Breadcrumb">
            <Link
              href="/"
              className="day:hover:text-[#1d1a17] transition-colors hover:text-[#cfac6c]"
            >
              Home
            </Link>
            <span className="day:text-[#a89d8d] mx-2 text-[#635c52]" aria-hidden="true">
              /
            </span>
            <Link
              href="/memorials"
              className="day:hover:text-[#1d1a17] transition-colors hover:text-[#cfac6c]"
            >
              Memorials
            </Link>
            <span className="day:text-[#a89d8d] mx-2 text-[#635c52]" aria-hidden="true">
              /
            </span>
            <span className="day:text-[#1d1a17] font-medium text-[#e4dbcd]">
              {page.title}
            </span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-14">
            {/* Left Column: Headline, Description & CTAs */}
            <div className="flex flex-col items-start">
              <span className="day:border-[#d0c2ad] day:bg-[#e8e0d1] day:text-[#74551d] inline-flex items-center gap-1.5 rounded-full border border-[#cfac6c]/40 bg-[#cfac6c]/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#e6cb8b] uppercase">
                <SparklesIcon className="size-3.5" />
                Handcrafted Precision · 3D Online Studio
              </span>

              <h1 className="day:text-[#1d1a17] mt-4 max-w-2xl font-serif text-3xl leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl">
                {categoryDetails.heroHeadline}
              </h1>

              <p className="day:text-[#5c544a] mt-5 max-w-xl text-base leading-relaxed text-[#c3bbb0] sm:text-lg sm:leading-8">
                {categoryDetails.heroSubheadline}
              </p>

              {/* Dual Action Buttons */}
              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                {flagshipProduct && (
                  <Link
                    href={productDesignerUrl(flagshipProduct.id)}
                    className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#342e26] inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#cfac6c] px-6 py-3 text-sm font-semibold text-[#181611] shadow-sm transition-all hover:bg-[#dfc185]"
                  >
                    <span>Start in 3D Configurator</span>
                    <ArrowRightIcon className="size-4" aria-hidden="true" />
                  </Link>
                )}

                <Link
                  href="#choose-product"
                  className="day:border-[#c8beaf] day:text-[#1d1a17] day:hover:bg-[#e4ddcf] inline-flex min-h-12 items-center justify-center rounded-sm border border-white/20 bg-transparent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                  Browse Styles & Prices ↓
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="day:border-[#dcd3c4] mt-10 grid w-full grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4 sm:gap-4">
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
            </div>

            {/* Right Column: Flagship Visual Card */}
            {flagshipProduct && (
              <div className="day:border-[#e2dad0] day:bg-white day:shadow-xl relative overflow-hidden rounded-sm border border-white/12 bg-[#161513] p-5 shadow-2xl">
                <div className="day:border-[#ece5d9] day:bg-[#f6f3ed] relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-white/10 bg-[#0e0d0c]">
                  <Image
                    src={`/webp/products/${flagshipProduct.image}`}
                    alt={flagshipProduct.displayName}
                    fill
                    priority
                    className="object-contain p-4 transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                  <div className="day:border-[#d5c9b7] day:bg-white/90 day:text-[#70521c] absolute top-3 left-3 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#e8cf94] uppercase backdrop-blur-xs">
                    {flagshipBadge}
                  </div>
                </div>

                <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div>
                    <h3 className="day:text-[#1d1a17] font-serif text-lg font-medium text-white sm:text-xl">
                      {flagshipProduct.displayName}
                    </h3>
                    <p className="day:text-[#6a6053] mt-1 text-xs text-white/60">
                      {PRODUCT_BADGES[flagshipProduct.id]?.highlight ||
                        flagshipProduct.description}
                    </p>
                  </div>

                  {flagshipPrice && (
                    <div className="text-right">
                      <span className="day:text-[#7a7063] block text-[11px] uppercase tracking-wider text-white/50">
                        Starting from
                      </span>
                      <span className="day:text-[#1d1a17] font-serif text-xl font-semibold text-[#f0d89f]">
                        {formatSamplePrice(flagshipPrice)}
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={productDesignerUrl(flagshipProduct.id)}
                  className="day:border-[#1d1a17] day:bg-[#1d1a17] day:text-white day:hover:bg-[#342e26] day:hover:text-white mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-sm border border-[#cfac6c]/60 bg-[#cfac6c]/15 px-4 py-2.5 text-xs font-semibold tracking-wider text-[#f5dfae] uppercase transition-colors hover:bg-[#cfac6c] hover:text-[#14120f]"
                >
                  <span>Customize this Style in 3D</span>
                  <ArrowRightIcon className="size-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CHOOSE A STYLE (PRODUCTS GRID)                                         */}
      {/* ========================================================================= */}
      <section
        id="choose-product"
        className="mx-auto max-w-7xl scroll-mt-12 px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="mb-10 max-w-3xl">
          <span className="day:text-[#8a651f] text-xs font-semibold tracking-widest text-[#cfac6c] uppercase">
            Available Designs & Profiles
          </span>
          <h2 className="day:text-[#1d1a17] mt-1 font-serif text-2xl font-normal text-white sm:text-3xl lg:text-4xl">
            Choose a Style to Customize
          </h2>
          <p className="day:text-[#625a51] mt-3 text-base leading-relaxed text-white/70">
            Select any foundation below to launch our online 3D Studio. Adjust
            dimensions, stones, inscribed fonts, photorealistic portraits, and
            accessories in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {page.products.map((product) => {
            const badge = PRODUCT_BADGES[product.id];
            const priceSample = priceSamples[product.id];

            return (
              <article
                key={product.id}
                className="group day:border-[#e4ddd2] day:bg-white day:shadow-sm day:hover:shadow-md flex h-full flex-col overflow-hidden rounded-sm border border-white/10 bg-[#141311] transition-all duration-300 hover:border-[#cfac6c]/60"
              >
                {/* Visual Image Card */}
                <Link
                  href={productDesignerUrl(product.id)}
                  aria-label={`Design your custom ${product.displayName}`}
                  className="day:border-[#e8e2d7] day:bg-[#f6f3ed] relative block aspect-[4/3] overflow-hidden border-b border-white/10 bg-[#0e0d0c] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#cfac6c]"
                >
                  <Image
                    src={`/webp/products/${product.image}`}
                    alt={product.displayName}
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

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex-1">
                    <h3 className="day:text-[#1d1a17] font-serif text-xl font-normal text-white">
                      {product.displayName}
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

                  {/* Pricing and Action */}
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
                    </div>

                    <Link
                      href={productDesignerUrl(product.id)}
                      className="day:border-[#1d1a17] day:bg-[#1d1a17] day:text-white day:hover:bg-[#342e26] day:hover:text-white day:group-hover:bg-[#342e26] day:group-hover:text-white inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-sm border border-[#cfac6c]/60 bg-transparent px-4 py-2.5 text-sm font-semibold text-[#f0d89f] transition-all group-hover:bg-[#cfac6c] group-hover:text-[#14120f]"
                    >
                      <span>Customize in 3D</span>
                      <ArrowRightIcon className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MATERIAL & CRAFTSMANSHIP COMPARISON                                    */}
      {/* ========================================================================= */}
      {categoryDetails.comparisons &&
        categoryDetails.comparisons.length > 0 && (
          <section className="day:border-[#e2dad0] day:bg-[#f1ede3] border-t border-b border-white/10 bg-[#121110] py-14 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 max-w-3xl">
                <span className="day:text-[#8a651f] text-xs font-semibold tracking-widest text-[#cfac6c] uppercase">
                  Engineering & Materials
                </span>
                <h2 className="day:text-[#1d1a17] mt-1 font-serif text-2xl font-normal text-white sm:text-3xl lg:text-4xl">
                  Compare Finishes & Craftsmanship
                </h2>
                <p className="day:text-[#625a51] mt-3 text-base leading-relaxed text-white/70">
                  Select the technology that matches your cemetery’s bylaws,
                  aesthetic preferences, and inscription details.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categoryDetails.comparisons.map((item) => (
                  <div
                    key={item.title}
                    className="day:border-[#e0d8cb] day:bg-white day:shadow-sm flex flex-col rounded-sm border border-white/10 bg-[#171614] p-6"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="day:text-[#1d1a17] font-serif text-xl font-medium text-white">
                        {item.title}
                      </h3>
                      <span className="day:border-[#cfbfa9] day:bg-[#ece4d4] day:text-[#7b5a20] rounded-full border border-[#cfac6c]/30 bg-[#cfac6c]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#f0d89f]">
                        {item.badge}
                      </span>
                    </div>

                    <p className="day:text-[#625a51] mt-3 text-sm leading-relaxed text-white/70">
                      {item.description}
                    </p>

                    <div className="day:border-[#e8e1d5] my-5 border-t border-white/10" />

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="day:text-[#1d1a17] font-semibold text-white/90">
                          Recommended For:{' '}
                        </span>
                        <span className="day:text-[#625a51] text-white/70">
                          {item.bestFor}
                        </span>
                      </div>
                      <div>
                        <span className="day:text-[#1d1a17] font-semibold text-white/90">
                          Outdoor Durability:{' '}
                        </span>
                        <span className="day:text-[#625a51] text-white/70">
                          {item.durability}
                        </span>
                      </div>
                    </div>

                    <ul className="day:border-[#e8e1d5] mt-6 space-y-2 border-t border-white/10 pt-4 text-xs">
                      {item.features.map((feat) => (
                        <li
                          key={feat}
                          className="day:text-[#423c34] flex items-center gap-2 text-white/80"
                        >
                          <CheckCircleIcon className="day:text-[#8a651f] size-4 shrink-0 text-[#cfac6c]" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS                                                           */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="day:text-[#8a651f] text-xs font-semibold tracking-widest text-[#cfac6c] uppercase">
            Simple 3-Step Process
          </span>
          <h2 className="day:text-[#1d1a17] mt-1 font-serif text-2xl font-normal text-white sm:text-3xl lg:text-4xl">
            How Your Memorial is Created
          </h2>
          <p className="day:text-[#625a51] mx-auto mt-3 max-w-2xl text-base text-white/70">
            From your online 3D design to cemetery verification and precision
            stonemasonry.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="day:border-[#e4ddd2] day:bg-white day:shadow-sm relative rounded-sm border border-white/10 bg-[#141311] p-6">
            <span className="day:text-[#8a651f] font-serif text-3xl font-semibold text-[#cfac6c]">
              01
            </span>
            <h3 className="day:text-[#1d1a17] mt-3 font-serif text-xl font-normal text-white">
              Choose Style & Dimensions
            </h3>
            <p className="day:text-[#625a51] mt-2 text-sm leading-relaxed text-white/70">
              Browse upright monuments, cemetery wall plaques, or urns. Pick
              your foundation profile and enter cemetery plot dimensions.
            </p>
          </div>

          <div className="day:border-[#e4ddd2] day:bg-white day:shadow-sm relative rounded-sm border border-white/10 bg-[#141311] p-6">
            <span className="day:text-[#8a651f] font-serif text-3xl font-semibold text-[#cfac6c]">
              02
            </span>
            <h3 className="day:text-[#1d1a17] mt-3 font-serif text-xl font-normal text-white">
              Personalize in Real-time 3D
            </h3>
            <p className="day:text-[#625a51] mt-2 text-sm leading-relaxed text-white/70">
              Upload photos, position engraved names and verses, add emblems,
              and rotate your tribute in realistic lighting with instant
              pricing.
            </p>
          </div>

          <div className="day:border-[#e4ddd2] day:bg-white day:shadow-sm relative rounded-sm border border-white/10 bg-[#141311] p-6">
            <span className="day:text-[#8a651f] font-serif text-3xl font-semibold text-[#cfac6c]">
              03
            </span>
            <h3 className="day:text-[#1d1a17] mt-3 font-serif text-xl font-normal text-white">
              Cemetery Check & Delivery
            </h3>
            <p className="day:text-[#625a51] mt-2 text-sm leading-relaxed text-white/70">
              Our specialists verify cemetery regulations, provide an
              architectural proof for your sign-off, and craft your memorial
              with a 30-year warranty.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. REAL CEMETERY INSTALLATIONS GALLERY                                    */}
      {/* ========================================================================= */}
      {cemeteryImages.length > 0 && (
        <section className="day:border-[#e2dad0] day:bg-[#f1ede3] border-t border-b border-white/10 bg-[#121110] py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="day:text-[#8a651f] text-xs font-semibold tracking-widest text-[#cfac6c] uppercase">
                  Genuine Installations
                </span>
                <h2 className="day:text-[#1d1a17] mt-1 font-serif text-2xl font-normal text-white sm:text-3xl">
                  Completed {page.title} Across the World
                </h2>
                <p className="day:text-[#625a51] mt-2 text-sm text-white/70">
                  Real photos of memorials crafted in our stonemasonry workshop
                  and installed in public & private cemeteries.
                </p>
              </div>

              <Link
                href="/memorials"
                className="day:border-[#beb4a5] day:text-[#1d1a17] day:hover:bg-[#e4ddcf] inline-flex items-center gap-2 rounded-sm border border-white/20 px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:bg-white/10"
              >
                <span>View Full Catalog</span>
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </div>

            <MemorialCemeteryGallery
              title={page.title}
              images={cemeteryImages}
            />
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. FAQ & BUYING GUIDANCE ACCORDION                                       */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* Left: Guidance & Specialist Consultation Card */}
          <div>
            <span className="day:text-[#8a651f] text-xs font-semibold tracking-widest text-[#cfac6c] uppercase">
              Guidance & Cemetery Rules
            </span>
            <h2 className="day:text-[#1d1a17] mt-1 font-serif text-2xl font-normal text-white sm:text-3xl">
              What to Consider Before Designing
            </h2>

            {guidance && (
              <div className="mt-4">
                <p className="day:text-[#625a51] text-base leading-relaxed text-white/70">
                  {guidance.summary}
                </p>

                <ul className="mt-6 space-y-3">
                  {guidance.points.map((point) => (
                    <li
                      key={point}
                      className="day:border-[#cfac6c] day:text-[#50483f] border-l-2 border-[#cfac6c] pl-4 text-sm leading-relaxed text-white/80"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Need Help Card */}
            <div className="day:border-[#e2dad0] day:bg-white day:shadow-sm mt-8 rounded-sm border border-white/10 bg-[#161513] p-6">
              <h3 className="day:text-[#1d1a17] font-serif text-lg font-medium text-white">
                Unsure About Your Cemetery’s Regulations?
              </h3>
              <p className="day:text-[#625a51] mt-2 text-xs leading-relaxed text-white/70">
                Provide us your cemetery name and plot number. Our memorial
                architects will review plot guidelines, height restrictions, and
                foundation requirements on your behalf.
              </p>

              <div className="mt-5 space-y-2 text-xs">
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

          {/* Right: Accordion FAQ */}
          <div>
            <h2 className="day:text-[#1d1a17] mb-6 font-serif text-2xl font-normal text-white sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <MemorialFaqAccordion faqs={categoryDetails.faqs} />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PRE-FOOTER CONSULTATION BANNER                                         */}
      {/* ========================================================================= */}
      <section className="day:border-[#e2dad0] day:bg-[#ede7dc] border-t border-white/10 bg-[#161513] py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="day:text-[#1d1a17] font-serif text-2xl font-normal text-white sm:text-3xl lg:text-4xl">
            Design a Lasting Tribute with Complete Confidence
          </h2>
          <p className="day:text-[#625a51] mx-auto mt-3 max-w-2xl text-base text-white/70">
            Enjoy complete peace of mind with 30-year material warranties,
            guaranteed cemetery approval, and compassionate personal service.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            {flagshipProduct && (
              <Link
                href={productDesignerUrl(flagshipProduct.id)}
                className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#342e26] inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#cfac6c] px-8 py-3 text-sm font-semibold text-[#181611] transition-colors hover:bg-[#e2c688]"
              >
                <span>Start Designing Now</span>
                <ArrowRightIcon className="size-4" />
              </Link>
            )}
            <Link
              href="#choose-product"
              className="day:border-[#b8ad9e] day:text-[#1d1a17] day:hover:bg-[#dfd7c9] inline-flex min-h-12 items-center justify-center rounded-sm border border-white/20 bg-transparent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              Browse All {page.title} Styles
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function PublicFooter() {
  return (
    <footer className="day:border-gray-200 day:bg-gray-100 border-t border-white/10 bg-[#050402]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="day:text-gray-900 grid grid-cols-1 gap-10 text-white sm:grid-cols-2 lg:grid-cols-[1fr_0.75fr_0.85fr_2.1fr]">
          <div>
            <Link
              href="/"
              className="font-serif text-2xl tracking-wide"
              aria-label="Forever Shining home"
            >
              Forever Shining
            </Link>
            <Image
              src="/webp/forever-logo.webp"
              alt="Forever Shining - Design Online"
              width={200}
              height={120}
              className="mt-4 h-[100px] w-auto select-none"
              sizes="167px"
              draggable={false}
            />
            <p className="day:text-gray-600 mt-4 text-sm leading-6 text-white/70">
              Crafting lasting tributes for families around the world since
              2005.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a
                href="https://www.instagram.com/forevershiningaus/"
                target="_blank"
                rel="noreferrer"
                aria-label="Forever Shining on Instagram"
                className="day:border-gray-300 day:text-gray-500 flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-[#cfac6c] hover:text-[#cfac6c]"
              >
                IG
              </a>
              <a
                href="https://www.facebook.com/ForeverShiningAustralia/"
                target="_blank"
                rel="noreferrer"
                aria-label="Forever Shining on Facebook"
                className="day:border-gray-300 day:text-gray-500 flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-[#cfac6c] hover:text-[#cfac6c]"
              >
                FB
              </a>
              <a
                href="https://www.pinterest.com/forevershining1/"
                target="_blank"
                rel="noreferrer"
                aria-label="Forever Shining on Pinterest"
                className="day:border-gray-300 day:text-gray-500 flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-[#cfac6c] hover:text-[#cfac6c]"
              >
                PI
              </a>
              <a
                href="https://twitter.com/ForeverShiningA"
                target="_blank"
                rel="noreferrer"
                aria-label="Forever Shining on X"
                className="day:border-gray-300 day:text-gray-500 flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-[#cfac6c] hover:text-[#cfac6c]"
              >
                X
              </a>
              <a
                href="https://www.youtube.com/@forevershining/featured"
                target="_blank"
                rel="noreferrer"
                aria-label="Forever Shining on YouTube"
                className="day:border-gray-300 day:text-gray-500 flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-[#cfac6c] hover:text-[#cfac6c]"
              >
                YT
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[#cfac6c] uppercase">
              Memorials
            </p>
            <ul className="day:text-gray-600 mt-4 space-y-2 text-sm text-white/70">
              <li>
                <Link
                  href="/memorials"
                  className="day:hover:text-gray-900 font-medium hover:text-white"
                >
                  All Memorials Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/memorials/headstones"
                  className="day:hover:text-gray-900 hover:text-white"
                >
                  Headstones
                </Link>
              </li>
              <li>
                <Link
                  href="/memorials/plaques"
                  className="day:hover:text-gray-900 hover:text-white"
                >
                  Plaques
                </Link>
              </li>
              <li>
                <Link
                  href="/memorials/urns"
                  className="day:hover:text-gray-900 hover:text-white"
                >
                  Urns
                </Link>
              </li>
              <li>
                <Link
                  href="/memorials/full-monuments"
                  className="day:hover:text-gray-900 hover:text-white"
                >
                  Full Monuments
                </Link>
              </li>
              <li>
                <Link
                  href="/memorials/pet-memorials"
                  className="day:hover:text-gray-900 hover:text-white"
                >
                  Pet Memorials
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[#cfac6c] uppercase">
              Help & Guides
            </p>
            <ul className="day:text-gray-600 mt-4 space-y-2 text-sm text-white/70">
              <li>
                <Link
                  href="/designs/guide/design-your-own"
                  className="day:hover:text-gray-900 hover:text-white"
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="/designs/guide/pricing"
                  className="day:hover:text-gray-900 hover:text-white"
                >
                  Pricing Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/designs/guide/cemetery-regulations"
                  className="day:hover:text-gray-900 hover:text-white"
                >
                  Cemetery Regulations
                </Link>
              </li>
              <li>
                <Link
                  href="/designs/guide/buying-guide"
                  className="day:hover:text-gray-900 hover:text-white"
                >
                  Buying Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="day:hover:text-gray-900 hover:text-white"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="day:hover:text-gray-900 hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:min-w-0">
            <p className="text-sm font-semibold tracking-[0.24em] text-[#cfac6c] uppercase">
              Get in Touch
            </p>
            <div className="day:text-gray-600 mt-4 text-sm text-white/75">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <a
                    href="tel:+16473880931"
                    className="day:text-gray-900 block text-lg font-semibold text-white hover:text-[#cfac6c]"
                  >
                    (+1) 647 388 0931
                  </a>
                  <a
                    href="mailto:admin@bronze-plaque.com"
                    className="mt-2 block hover:text-[#cfac6c]"
                  >
                    admin@bronze-plaque.com
                  </a>
                  <p className="mt-2 leading-6">
                    1101 Eagle Ridge Drive
                    <br />
                    Oshawa Ontario L1K 0L8
                  </p>
                </div>
                <div className="day:border-gray-200 border-t border-white/10 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
                  <a
                    href="tel:+61861910396"
                    className="day:text-gray-900 block text-lg font-semibold text-white hover:text-[#cfac6c]"
                  >
                    +61 8 6191 0396
                  </a>
                  <a
                    href="mailto:admin@forevershining.com.au"
                    className="mt-2 block hover:text-[#cfac6c]"
                  >
                    admin@forevershining.com.au
                  </a>
                  <p className="mt-2 leading-6">
                    1/44 Port Kembla Dve
                    <br />
                    Bibra Lake WA 6163
                  </p>
                </div>
              </div>
              <p className="day:text-gray-500 mt-4 leading-6 text-white/55">
                Serving families across the United States and Canada, with
                international support available for Australia and Europe.
              </p>
            </div>
          </div>
        </div>

        <div className="day:border-gray-200 day:text-gray-500 mt-10 border-t border-white/10 pt-5 text-xs text-white/50">
          © 2026 Forever Shining. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
