import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getMemorialTypePageData,
  isMemorialTypeSlug,
  memorialTypePages,
  type MemorialTypeSlug,
} from '#/lib/memorial-product-pages';
import { getDesignerProductSlug } from '#/lib/designer-product-routes';
import MemorialHeaderGallery from './MemorialHeaderGallery';

type PageProps = {
  params: Promise<{ type: string }>;
};

const BASE_URL = 'https://forevershining.org';

const productOfferRanges: Record<string, { lowPrice: string; highPrice: string }> = {
  '1': { lowPrice: '603', highPrice: '11496' },
  '4': { lowPrice: '966', highPrice: '11496' },
  '5': { lowPrice: '346', highPrice: '5666' },
  '8': { lowPrice: '255', highPrice: '4418' },
  '9': { lowPrice: '255', highPrice: '4418' },
  '22': { lowPrice: '603', highPrice: '11496' },
  '23': { lowPrice: '603', highPrice: '11496' },
  '30': { lowPrice: '255', highPrice: '4418' },
  '32': { lowPrice: '255', highPrice: '4418' },
  '34': { lowPrice: '255', highPrice: '4418' },
  '52': { lowPrice: '255', highPrice: '4418' },
  '100': { lowPrice: '966', highPrice: '11496' },
  '101': { lowPrice: '603', highPrice: '11496' },
  '124': { lowPrice: '603', highPrice: '11496' },
  '135': { lowPrice: '255', highPrice: '4418' },
  '2350': { lowPrice: '1742', highPrice: '2608' },
};

const productCategoryLabels: Record<string, string> = {
  headstones: 'Memorial headstone',
  plaques: 'Memorial plaque',
  monuments: 'Full monument',
  urns: 'Memorial urn',
  'pet-memorials': 'Pet memorial',
};

function productDesignerUrl(productId: string) {
  const slug = getDesignerProductSlug(productId);
  return slug ? `/${slug}/select-shape` : `/select-shape?productId=${productId}`;
}

function productOffer(productId: string, url: string) {
  const range = productOfferRanges[productId] ?? { lowPrice: '255', highPrice: '11496' };

  return {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: range.lowPrice,
    highPrice: range.highPrice,
    offerCount: 1,
    availability: 'https://schema.org/InStock',
    url,
  };
}

export function generateStaticParams() {
  return Object.keys(memorialTypePages).map((type) => ({ type }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  if (!isMemorialTypeSlug(type)) {
    return { title: 'Product Type Not Found' };
  }

  const page = getMemorialTypePageData(type);
  const url = `${BASE_URL}/memorials/${type}`;

  return {
    title: `${page.title} | Forever Shining`,
    description: page.intro,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${page.title} | Forever Shining`,
      description: page.intro,
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

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#webpage`,
        url,
        name: `${page.title} | Forever Shining`,
        description: page.intro,
        primaryImageOfPage: page.gallery[0]
          ? {
              '@type': 'ImageObject',
              url: page.gallery[0].src,
              caption: page.gallery[0].alt,
            }
          : undefined,
        isPartOf: {
          '@id': `${BASE_URL}#website`,
        },
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
            category: productCategoryLabels[product.category] ?? product.category,
            image: `${BASE_URL}/webp/products/${product.image}`,
            description: product.description,
            url: `${BASE_URL}${productDesignerUrl(product.id)}`,
            offers: productOffer(product.id, `${BASE_URL}${productDesignerUrl(product.id)}`),
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
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: page.title,
            item: url,
          },
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

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white day:bg-stone-100 day:text-gray-900" data-seo-page="true">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productTypeJsonLd(page)) }}
      />

      <PublicHeader />

      <section className="border-b border-white/10 bg-[#111] day:border-gray-200 day:bg-white">
        <div className="mx-auto max-w-7xl px-6 py-7 lg:px-8">
          <nav className="mb-5 text-sm text-gray-400 day:text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white day:hover:text-gray-900">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span>{page.title}</span>
          </nav>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#cfac6c]">
                Product type
              </p>
              <h1 className="max-w-3xl font-serif text-4xl leading-none text-white sm:text-5xl day:text-gray-900">
                {page.title}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-gray-300 day:text-gray-600">
                {page.intro}
              </p>
            </div>

            <MemorialHeaderGallery title={page.title} images={page.gallery} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white day:text-gray-900">
              Choose a product
            </h2>
            <p className="mt-1 text-sm text-gray-400 day:text-gray-600">
              Each card opens the Designer with that product selected.
            </p>
          </div>
          <Link
            href="/select-product"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#cfac6c]/60 hover:bg-white/5 day:border-gray-300 day:text-gray-800 day:hover:bg-white"
          >
            View all products
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {page.products.map((product) => (
            <Link
              key={product.id}
              href={productDesignerUrl(product.id)}
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-[#171717] transition-all hover:-translate-y-0.5 hover:border-[#cfac6c]/60 hover:shadow-lg hover:shadow-[#cfac6c]/10 day:border-gray-200 day:bg-white"
            >
              <div className="relative aspect-[4/3] border-b border-white/10 bg-[#101010] day:border-gray-200 day:bg-gray-50">
                <Image
                  src={`/webp/products/${product.image}`}
                  alt={product.displayName}
                  fill
                  className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#cfac6c]">
                    Product ID {product.id}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white day:text-gray-900">
                    {product.displayName}
                  </h3>
                </div>

                <p className="text-sm leading-6 text-gray-300 day:text-gray-600">
                  {product.description}
                </p>

                {product.sizeText ? (
                  <p className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-gray-400 day:border-gray-200 day:bg-gray-50 day:text-gray-600">
                    {product.sizeText}
                  </p>
                ) : null}

                {product.shapes.length > 0 ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                      Catalog shapes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.shapes.slice(0, 5).map((shape) => (
                        <span
                          key={`${product.id}-${shape.name}-${shape.code}`}
                          className="rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-300 day:border-gray-200 day:text-gray-700"
                        >
                          {shape.code || shape.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <span className="mt-auto inline-flex min-h-10 items-center justify-center rounded-lg bg-[#cfac6c] px-4 py-2 text-sm font-semibold text-slate-950 transition-colors group-hover:bg-[#d7b979]">
                  Open in Designer
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {page.tutorialNotes.length > 0 ? (
        <section className="border-t border-white/10 bg-[#101010] day:border-gray-200 day:bg-white">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <h2 className="text-2xl font-semibold text-white day:text-gray-900">
              Designer guidance from product data
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {page.tutorialNotes.map((note, index) => (
                <article
                  key={`${page.slug}-note-${index}`}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-4 day:border-gray-200 day:bg-gray-50"
                >
                  <p className="text-sm leading-6 text-gray-300 day:text-gray-600">
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

function PublicHeader() {
  return (
    <header className="border-b border-white/10 bg-[#0b0b0b]/95 day:border-gray-200 day:bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <Link href="/" className="block w-40 sm:w-44" aria-label="Forever Shining home">
          <Image
            src="/ico/forever-transparent-logo.png"
            alt="Forever Shining - Design Online"
            width={320}
            height={100}
            className="h-auto w-full"
            priority
          />
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="rounded-lg border border-white/10 px-3 py-2 text-gray-200 transition-colors hover:border-[#cfac6c]/60 hover:text-white day:border-gray-200 day:text-gray-700 day:hover:bg-gray-50">
            Home
          </Link>
          <Link href="/memorials/plaques" className="rounded-lg border border-white/10 px-3 py-2 text-gray-200 transition-colors hover:border-[#cfac6c]/60 hover:text-white day:border-gray-200 day:text-gray-700 day:hover:bg-gray-50">
            Plaques
          </Link>
          <Link href="/memorials/headstones" className="rounded-lg border border-white/10 px-3 py-2 text-gray-200 transition-colors hover:border-[#cfac6c]/60 hover:text-white day:border-gray-200 day:text-gray-700 day:hover:bg-gray-50">
            Headstones
          </Link>
          <Link href="/memorials/full-monuments" className="rounded-lg border border-white/10 px-3 py-2 text-gray-200 transition-colors hover:border-[#cfac6c]/60 hover:text-white day:border-gray-200 day:text-gray-700 day:hover:bg-gray-50">
            Full Monuments
          </Link>
          <Link href="/memorials/urns" className="rounded-lg border border-white/10 px-3 py-2 text-gray-200 transition-colors hover:border-[#cfac6c]/60 hover:text-white day:border-gray-200 day:text-gray-700 day:hover:bg-gray-50">
            Urns
          </Link>
          <Link href="/memorials/pet-memorials" className="rounded-lg border border-white/10 px-3 py-2 text-gray-200 transition-colors hover:border-[#cfac6c]/60 hover:text-white day:border-gray-200 day:text-gray-700 day:hover:bg-gray-50">
            Pet Memorials
          </Link>
          <Link href="/select-product" className="rounded-lg bg-[#cfac6c] px-4 py-2 font-semibold text-slate-950 transition-colors hover:bg-[#d7b979]">
            Start Designing
          </Link>
        </nav>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050402] day:border-gray-200 day:bg-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 text-white sm:grid-cols-2 lg:grid-cols-[1fr_0.75fr_0.85fr_2.1fr] day:text-gray-900">
          <div>
            <Link href="/" className="block w-52" aria-label="Forever Shining home">
              <Image
                src="/ico/forever-transparent-logo.png"
                alt="Forever Shining - Design Online"
                width={320}
                height={100}
                className="h-auto w-full"
              />
            </Link>
            <p className="mt-4 text-sm leading-6 text-white/70 day:text-gray-600">
              Crafting lasting tributes for families around the world since 2005.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a href="https://www.instagram.com/forevershiningaus/" target="_blank" rel="noreferrer" aria-label="Forever Shining on Instagram" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-[#cfac6c] hover:text-[#cfac6c] day:border-gray-300 day:text-gray-500">
                IG
              </a>
              <a href="https://www.facebook.com/ForeverShiningAustralia/" target="_blank" rel="noreferrer" aria-label="Forever Shining on Facebook" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-[#cfac6c] hover:text-[#cfac6c] day:border-gray-300 day:text-gray-500">
                FB
              </a>
              <a href="https://www.pinterest.com/forevershining1/" target="_blank" rel="noreferrer" aria-label="Forever Shining on Pinterest" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-[#cfac6c] hover:text-[#cfac6c] day:border-gray-300 day:text-gray-500">
                PI
              </a>
              <a href="https://twitter.com/ForeverShiningA" target="_blank" rel="noreferrer" aria-label="Forever Shining on X" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-[#cfac6c] hover:text-[#cfac6c] day:border-gray-300 day:text-gray-500">
                X
              </a>
              <a href="https://www.youtube.com/@forevershining/featured" target="_blank" rel="noreferrer" aria-label="Forever Shining on YouTube" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-[#cfac6c] hover:text-[#cfac6c] day:border-gray-300 day:text-gray-500">
                YT
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#cfac6c]">
              Memorials
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/70 day:text-gray-600">
              <li><Link href="/memorials/headstones" className="hover:text-white day:hover:text-gray-900">Headstones</Link></li>
              <li><Link href="/memorials/plaques" className="hover:text-white day:hover:text-gray-900">Plaques</Link></li>
              <li><Link href="/memorials/urns" className="hover:text-white day:hover:text-gray-900">Urns</Link></li>
              <li><Link href="/memorials/full-monuments" className="hover:text-white day:hover:text-gray-900">Full Monuments</Link></li>
              <li><Link href="/memorials/pet-memorials" className="hover:text-white day:hover:text-gray-900">Pet Memorials</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#cfac6c]">
              Help & Guides
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/70 day:text-gray-600">
              <li><Link href="/designs/guide/design-your-own" className="hover:text-white day:hover:text-gray-900">How it Works</Link></li>
              <li><Link href="/designs/guide/pricing" className="hover:text-white day:hover:text-gray-900">Pricing Guide</Link></li>
              <li><Link href="/designs/guide/cemetery-regulations" className="hover:text-white day:hover:text-gray-900">Cemetery Regulations</Link></li>
              <li><Link href="/designs/guide/buying-guide" className="hover:text-white day:hover:text-gray-900">Buying Guide</Link></li>
            </ul>
          </div>

          <div className="lg:min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#cfac6c]">
              Get in Touch
            </p>
            <div className="mt-4 text-sm text-white/75 day:text-gray-600">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <a href="tel:+16473880931" className="block text-lg font-semibold text-white hover:text-[#cfac6c] day:text-gray-900">
                    (+1) 647 388 0931
                  </a>
                  <a href="mailto:admin@bronze-plaque.com" className="mt-2 block hover:text-[#cfac6c]">
                    admin@bronze-plaque.com
                  </a>
                  <p className="mt-2 leading-6">
                    1101 Eagle Ridge Drive<br />Oshawa Ontario L1K 0L8
                  </p>
                </div>
                <div className="border-t border-white/10 pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 day:border-gray-200">
                  <a href="tel:+61861910396" className="block text-lg font-semibold text-white hover:text-[#cfac6c] day:text-gray-900">
                    +61 8 6191 0396
                  </a>
                  <a href="mailto:admin@forevershining.com.au" className="mt-2 block hover:text-[#cfac6c]">
                    admin@forevershining.com.au
                  </a>
                  <p className="mt-2 leading-6">
                    1/44 Port Kembla Dve<br />Bibra Lake WA 6163
                  </p>
                </div>
              </div>
              <p className="mt-4 leading-6 text-white/55 day:text-gray-500">
                Serving Australia, the United States, Canada, and Europe for Bronze Plaques, Memorial Plaques, and Headstones.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-xs text-white/50 day:border-gray-200 day:text-gray-500">
          © 2026 Forever Shining. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
