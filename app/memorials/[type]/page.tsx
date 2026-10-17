import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import PublicHeader from '#/components/MemorialPublicHeader';
import {
  getMemorialTypePageData,
  isMemorialTypeSlug,
  memorialTypePages,
  type MemorialTypeSlug,
} from '#/lib/memorial-product-pages';
import { getDesignerProductSlug } from '#/lib/designer-product-routes';
import MemorialHeaderGallery from './MemorialHeaderGallery';

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

  return {
    title: `${page.title} | Forever Shining`,
    description: guidance ? guidance.summary : page.intro,
    alternates: { canonical: url },
    openGraph: {
      title: `${page.title} | Forever Shining`,
      description: guidance ? guidance.summary : page.intro,
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
  const mobileBrowseLabel = 'Explore options for a personal tribute';

  return (
    <main
      className="day:bg-[#f7f4ee] day:text-[#1d1a17] min-h-screen bg-[#0c0b0a] text-white"
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

      <section className="border-b border-[#bdb4a6] bg-[#eee9df] text-[#1d1a17]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <div className="mb-6 flex items-center justify-between gap-4">
            <nav className="text-sm text-[#756c62]" aria-label="Breadcrumb">
              <Link href="/" className="transition-colors hover:text-[#6f511c]">
                Home
              </Link>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <span>{page.title}</span>
            </nav>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-12">
            <div className="flex max-w-xl flex-col items-start">
              <h1 className="m-0 max-w-3xl p-0 font-serif text-[2.5rem] leading-[1.08] tracking-[-0.025em] text-[#1d1a17] sm:text-5xl lg:text-[3.5rem]">
                {page.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#625a51] sm:text-lg sm:leading-8">
                {page.intro}
              </p>
              <Link
                href="#choose-product"
                className="mt-7 inline-flex min-h-12 items-center justify-center rounded-sm bg-[#1d1a17] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3a332c]"
              >
                {mobileBrowseLabel}
              </Link>
            </div>

            <MemorialHeaderGallery title={page.title} images={page.gallery} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        {guidance && (
          <section
            aria-labelledby="buying-guidance-heading"
            className="day:border-[#d8cdb9] mb-12 border-b border-white/10 pb-12"
          >
            <div className="max-w-4xl">
              <h2
                id="buying-guidance-heading"
                className="day:text-[#1d1a17] font-serif text-3xl text-white"
              >
                What to compare before designing
              </h2>
              <p className="day:text-[#625a51] mt-4 text-base leading-7 text-gray-300">
                {guidance.summary}
              </p>
            </div>
            <ul className="day:text-[#625a51] mt-7 grid gap-5 text-sm leading-7 text-gray-300 md:grid-cols-3">
              {guidance.points.map((point) => (
                <li key={point} className="border-l border-[#cfac6c] pl-4">
                  {point}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div id="choose-product" className="mb-5 scroll-mt-5">
          <h2 className="day:text-[#1d1a17] font-serif text-3xl text-white">
            Choose a style
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {page.products.map((product) => (
            <article
              key={product.id}
              className="group day:border-[#e4ddd2] day:bg-white day:shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex h-full flex-col overflow-hidden rounded-sm border border-white/10 bg-[#171717] transition-colors hover:border-[#cfac6c]/60"
            >
              <Link
                href={productDesignerUrl(product.id)}
                aria-label={`Design your own ${product.displayName}`}
                className="day:border-[#e4ddd2] day:bg-[#f5f1e9] relative block aspect-[5/4] overflow-hidden border-b border-white/10 bg-[#101010] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#cfac6c] sm:aspect-[4/3]"
              >
                <Image
                  src={`/webp/products/${product.image}`}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:object-contain sm:p-5"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </Link>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <h3 className="day:text-[#1d1a17] font-serif text-xl text-white">
                  {product.displayName}
                </h3>
                <p className="day:text-[#625a51] text-[15px] leading-6 text-gray-300">
                  {product.description}
                </p>

                <Link
                  href={productDesignerUrl(product.id)}
                  className="day:border-[#bdb4a6] day:text-[#1d1a17] day:hover:border-[#7b5a20] day:hover:bg-[#f7f4ee] mt-auto inline-flex min-h-11 items-center justify-between gap-3 rounded-sm border border-[#cfac6c]/60 px-4 py-2 text-sm font-semibold text-[#f0d89f] transition-colors hover:bg-white/5"
                >
                  Design now
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {page.tutorialNotes.length > 0 ? (
        <section className="day:border-[#d8cdb9] day:bg-[#eee9df] border-t border-white/10 bg-[#101010]">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
            <h2 className="day:text-[#1d1a17] font-serif text-3xl text-white">
              Designer guidance from product data
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {page.tutorialNotes.map((note, index) => (
                <article
                  key={`${page.slug}-note-${index}`}
                  className="day:border-[#e4ddd2] day:bg-white day:shadow-[0_10px_30px_rgba(0,0,0,0.03)] rounded-sm border border-white/10 bg-white/[0.03] p-5"
                >
                  <p className="day:text-[#625a51] text-sm leading-6 text-gray-300">
                    {note}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

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
