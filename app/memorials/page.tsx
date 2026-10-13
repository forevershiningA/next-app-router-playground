import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { memorialTypePages, type MemorialTypeSlug } from '#/lib/memorial-product-pages';

const BASE_URL = 'https://forevershining.org';

export const metadata: Metadata = {
  title: 'Memorials & Headstones Catalog | Forever Shining',
  description:
    'Explore custom memorials, headstones, grave markers, plaques, full monuments and memorial urns. Personalize with live 3D preview and online pricing.',
  alternates: {
    canonical: `${BASE_URL}/memorials`,
  },
  openGraph: {
    title: 'Memorials & Headstones Catalog | Forever Shining',
    description:
      'Explore custom memorials, headstones, grave markers, plaques, full monuments and memorial urns. Personalize with live 3D preview and online pricing.',
    url: `${BASE_URL}/memorials`,
    siteName: 'Forever Shining',
    type: 'website',
  },
};

const memorialCards: {
  slug: MemorialTypeSlug;
  title: string;
  description: string;
  image: string;
}[] = [
  {
    slug: 'headstones',
    title: 'Headstones & Grave Markers',
    description:
      'Laser-etched black granite, traditional engraved stone, and custom upright headstones tailored for cemetery requirements.',
    image: '/webp/products/APP_ID_4-medium.webp',
  },
  {
    slug: 'plaques',
    title: 'Memorial Plaques',
    description:
      'Cast bronze memorial plaques, stainless steel, laser color and traditional stone plaques for walls, gardens and cremation niches.',
    image: '/webp/products/APP_ID_5-medium.webp',
  },
  {
    slug: 'full-monuments',
    title: 'Full Monuments',
    description:
      'Complete memorial installations with matching bases, ledgers, kerbing and laser-etched or engraved headstones.',
    image: '/webp/products/APP_ID_100-medium.webp',
  },
  {
    slug: 'urns',
    title: 'Memorial Urns',
    description:
      'Personalized stainless steel and vitreous enamel memorial urns with portraits, inscriptions and custom motifs.',
    image: '/webp/products/APP_ID_2350-medium.webp',
  },
  {
    slug: 'pet-memorials',
    title: 'Pet Memorials',
    description:
      'Compact mini headstones, engraved river rocks and memorial plaques honoring beloved dogs, cats and companion animals.',
    image: '/webp/products/APP_ID_8-medium.webp',
  },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${BASE_URL}/memorials#webpage`,
      url: `${BASE_URL}/memorials`,
      name: 'Memorials & Headstones Catalog | Forever Shining',
      description:
        'Explore custom memorials, headstones, grave markers, plaques, full monuments and memorial urns.',
      isPartOf: { '@id': `${BASE_URL}#website` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/memorials#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Memorials', item: `${BASE_URL}/memorials` },
      ],
    },
    {
      '@type': 'ItemList',
      '@id': `${BASE_URL}/memorials#itemlist`,
      name: 'Memorial Categories',
      itemListElement: memorialCards.map((card, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: card.title,
        url: `${BASE_URL}/memorials/${card.slug}`,
      })),
    },
  ],
};

export default function MemorialsIndexPage() {
  return (
    <main className="min-h-screen bg-[#0c0b0a] text-white day:bg-[#f7f4ee] day:text-[#1d1a17]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="border-b border-[#bdb4a6] bg-[#eee9df] text-[#1d1a17]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <nav className="mb-4 text-sm text-[#756c62]" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-[#6f511c]">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span>Memorials</span>
          </nav>

          <header className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b7a24]">
              Memorial Products &amp; Categories
            </p>
            <h1 className="mt-2 font-serif text-3xl font-light tracking-tight text-[#1d1a17] sm:text-5xl">
              Custom Memorials &amp; Headstones
            </h1>
            <p className="mt-4 text-base font-light leading-relaxed text-[#625a51] sm:text-lg">
              Explore our range of personalized memorials. Choose a category below to browse styles, compare materials, read cemetery guidelines and design online with live 3D preview.
            </p>
          </header>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {memorialCards.map((card) => (
            <article
              key={card.slug}
              className="group flex flex-col overflow-hidden rounded-sm border border-white/10 bg-[#171717] transition-all duration-200 hover:border-[#cfac6c]/60 day:border-[#e4ddd2] day:bg-white day:shadow-sm"
            >
              <Link
                href={`/memorials/${card.slug}`}
                aria-label={`Explore ${card.title}`}
                className="relative block aspect-[4/3] overflow-hidden border-b border-white/10 bg-[#101010] day:border-[#e4ddd2] day:bg-[#f5f1e9]"
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </Link>

              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-serif text-xl font-light text-white transition-colors group-hover:text-[#f0d89f] day:text-[#1d1a17] day:group-hover:text-[#7b5a20]">
                  {card.title}
                </h2>
                <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-stone-300 day:text-[#625a51]">
                  {card.description}
                </p>
                <Link
                  href={`/memorials/${card.slug}`}
                  className="mt-6 inline-flex items-center justify-between rounded-sm border border-[#cfac6c]/60 px-4 py-2.5 text-sm font-semibold text-[#f0d89f] transition-colors hover:bg-white/5 day:border-[#bdb4a6] day:text-[#1d1a17] day:hover:border-[#7b5a20] day:hover:bg-[#f7f4ee]"
                >
                  Browse {memorialTypePages[card.slug]?.navLabel || 'Options'}
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
