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
  getCategorySeoCopy,
  getCategoryTitle,
  getProductSeoInfo,
  getSeoReadyDesigns,
  isIndexableCategoryDesignSet,
} from '#/lib/design-seo';

interface CategoryPageProps {
  params: Promise<{ productType: string; category: string }>;
}

// Enable ISR - revalidate every 24 hours
export const revalidate = 86400;

// There are hundreds of valid product/category pairs. Returning an empty list
// makes Next.js generate each category statically on first request and retain
// it in the ISR cache without adding all categories to the deployment build.
export function generateStaticParams() {
  return [];
}

export const dynamicParams = true;

function formatSlugForDisplay(slug: string): string {
  if (!slug) return 'Memorial Design';

  return slug
    .split('-')
    .map((word, index) => {
      if (word.length <= 2 && index > 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function formatShapeName(shapeName: string): string {
  return shapeName
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDesignTitle(design: {
  slug: string;
  shapeName?: string;
}): string {
  if (!design.shapeName) return formatSlugForDisplay(design.slug);

  const shapeWords = design.shapeName
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .split('-');
  const slugWords = design.slug.split('-');
  const hasShapePrefix = shapeWords.every(
    (word, index) => slugWords[index] === word,
  );

  if (!hasShapePrefix) return formatSlugForDisplay(design.slug);

  const rest = slugWords.slice(shapeWords.length);
  const shapePart = formatShapeName(design.shapeName);
  const restPart = rest
    .map((word, index) => {
      if (word.length <= 2 && index > 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  return restPart ? `${shapePart} - ${restPart}` : shapePart;
}

function designDescription(
  design: { id: string; shapeName?: string },
  finish: string,
  categoryTitle: string,
  productKind: string,
): string {
  const shapeName = design.shapeName
    ? formatShapeName(design.shapeName)
    : 'Classic';
  const hash = design.id
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const descriptions = [
    `A ${shapeName.toLowerCase()} ${finish} ${productKind} layout for ${categoryTitle.toLowerCase()} inscriptions and personal wording.`,
    `This ${shapeName.toLowerCase()} memorial design gives ${categoryTitle.toLowerCase()} tributes a balanced layout with space for names, dates and verses.`,
    `A refined ${shapeName.toLowerCase()} design suited to ${categoryTitle.toLowerCase()} memorials, with clear proportions for readable inscriptions.`,
  ];

  return descriptions[hash % descriptions.length];
}

function getCategorySearchTitle(
  category: string,
  productKind: ReturnType<typeof getProductSeoInfo>['kind'],
  fallback: string,
): string {
  if (category === 'butterfly-memorial' && productKind === 'headstone') {
    return 'Butterfly Headstone Designs';
  }

  if (category === 'floral-memorial' && productKind === 'headstone') {
    return 'Flower Headstone Engraving Designs';
  }

  return fallback;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { productType: productSlug, category } = await params;

  const categoryTitle = getCategoryTitle(category);
  const productInfo = getProductSeoInfo(productSlug);

  // Get designs count
  const designs = getSeoReadyDesigns().filter(
    (design) =>
      design.productSlug === productSlug && design.category === category,
  );
  const designCount = designs.length;

  // Get category description
  const categoryDesc = getCategoryDescription(category);

  // Build title
  const searchTitle = getCategorySearchTitle(
    category,
    productInfo.kind,
    `${categoryTitle} ${productInfo.shortName} Designs`,
  );
  const title = `${searchTitle} | Forever Shining`;

  // Build description
  const description = `Browse ${designCount} ${categoryTitle.toLowerCase()} ${productInfo.kind} designs in ${productInfo.finish}. ${categoryDesc} Customize online with inscriptions, motifs, photos and live preview.`;

  // Build keywords
  const keywords = [
    categoryTitle.toLowerCase(),
    `${categoryTitle.toLowerCase()} ${productInfo.kind}`,
    `${categoryTitle.toLowerCase()} memorial`,
    productInfo.finish,
    productInfo.shortName.toLowerCase(),
    `${productInfo.kind} designs`,
    'memorial designs',
    'granite headstone',
    'black granite',
    'custom headstone',
    'personalized memorial',
    'cemetery headstone',
    'grave marker',
    'memorial stone',
    'headstone inscriptions',
  ].join(', ');

  // Build canonical URL
  const baseUrl = 'https://forevershining.org';
  const canonicalUrl = `${baseUrl}/designs/${productSlug}/${category}`;

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
    robots: isIndexableCategoryDesignSet(designs)
      ? undefined
      : { index: false, follow: true },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { productType: productSlug, category } = await params;
  const productInfo = getProductSeoInfo(productSlug);
  const categoryTitle = getCategoryTitle(category);
  const categoryDescription = getCategoryDescription(category);
  const categorySeoCopy = getCategorySeoCopy(category);
  const designs = getSeoReadyDesigns()
    .filter(
      (design) =>
        design.productSlug === productSlug && design.category === category,
    )
    .sort((a, b) => formatDesignTitle(a).localeCompare(formatDesignTitle(b)));

  if (!designs.length) {
    notFound();
  }

  const baseUrl = 'https://forevershining.org';
  const canonicalUrl = `${baseUrl}/designs/${productSlug}/${category}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collection`,
        url: canonicalUrl,
        name: `${categoryTitle} ${productInfo.shortName} Designs`,
        description: categoryDescription,
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
            item: `${baseUrl}/designs/${productSlug}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: categoryTitle,
            item: canonicalUrl,
          },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#itemlist`,
        name: `${categoryTitle} ${productInfo.shortName} Designs`,
        numberOfItems: designs.length,
        itemListElement: designs.slice(0, 30).map((design, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: formatDesignTitle(design),
          url: `${baseUrl}/designs/${design.productSlug}/${design.category}/${design.slug}`,
          image: `${baseUrl}/screenshots/v2026-3d/${design.id}.png`,
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
              <Link
                href={`/designs/${productSlug}`}
                className="day:hover:text-[#1d1a17] transition-colors hover:text-[#cfac6c]"
              >
                {productInfo.name}
              </Link>
              <ChevronRightIcon className="h-3.5 w-3.5 text-[#a89d8d]" />
              <span className="day:text-[#1d1a17] font-medium text-[#c0b39f]">
                {categoryTitle}
              </span>
            </nav>
            <ThemeToggle inline />
          </div>

          <header className="mb-12 max-w-4xl">
            <span className="day:border-[#d0c2ad] day:bg-[#e8e0d1] day:text-[#74551d] inline-flex items-center gap-1.5 rounded-full border border-[#cfac6c]/40 bg-[#cfac6c]/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#e6cb8b] uppercase">
              Choose a Starting Layout
            </span>
            <h1 className="day:text-[#1d1a17] mt-4 font-serif text-3xl leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl">
              {categoryTitle} {productInfo.shortName} Designs
            </h1>
            <p className="day:text-[#5c544a] mt-4 max-w-3xl text-base leading-relaxed text-[#c3bbb0] sm:text-lg">
              {categoryDescription} These {productInfo.kind} templates can be
              personalized with names, dates, verses, motifs and photos before
              ordering in real-time 3D.
            </p>
            <p className="day:text-[#756c62] mt-4 text-xs text-white/50">
              {designs.length.toLocaleString()} design templates to personalize
            </p>
          </header>

          {categorySeoCopy && (
            <section
              aria-labelledby="category-guide-heading"
              className="day:border-[#e4ddd2] day:bg-white/80 mb-12 max-w-4xl rounded-sm border border-white/10 bg-[#141311]/80 p-6 sm:p-8 backdrop-blur-sm"
            >
              <h2
                id="category-guide-heading"
                className="day:text-[#1d1a17] mb-3 font-serif text-xl font-normal text-white sm:text-2xl"
              >
                Choosing {categoryTitle.toLowerCase()} {productInfo.kind}{' '}
                designs
              </h2>
              <p className="day:text-[#5c544a] mb-6 text-sm leading-relaxed text-[#c3bbb0]">
                {categorySeoCopy.intro}
              </p>
              <ul className="grid gap-3 text-xs leading-relaxed md:grid-cols-3">
                {categorySeoCopy.points.map((point) => (
                  <li
                    key={point}
                    className="day:border-[#cfac6c] day:text-[#5c544a] border-l-2 border-[#cfac6c] pl-3 text-[#c3bbb0]"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="category-designs-heading">
            <h2 id="category-designs-heading" className="sr-only">
              {categoryTitle} design templates
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map((design) => {
                const title = formatDesignTitle(design);
                const motifs = design.motifNames.slice(0, 4);

                return (
                  <Link
                    key={design.id}
                    href={`/designs/${design.productSlug}/${design.category}/${design.slug}`}
                    className="group day:border-[#e4ddd2] day:bg-white day:shadow-sm day:hover:shadow-md flex h-full flex-col overflow-hidden rounded-sm border border-white/10 bg-[#141311] transition-all duration-300 hover:border-[#cfac6c]/60"
                  >
                    <div className="day:border-[#e8e2d7] day:bg-[#f6f3ed] relative aspect-[4/3] overflow-hidden border-b border-white/10 bg-[#0e0d0c]">
                      <Image
                        src={`/screenshots/v2026-3d/${design.id}_small.png`}
                        alt={`${title} memorial design preview`}
                        fill
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                      <div className="day:border-[#d0c2ad] day:bg-[#e8e0d1]/90 day:text-[#74551d] absolute top-3 right-3 rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-sm">
                        {design.inscriptionCount}{' '}
                        {design.inscriptionCount === 1
                          ? 'inscription'
                          : 'inscriptions'}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-2">
                        <span className="day:text-[#8a651f] text-[11px] font-semibold tracking-wider text-[#cfac6c] uppercase">
                          {productInfo.shortName}
                        </span>
                        <h3 className="day:text-[#1d1a17] day:group-hover:text-[#8a651f] mt-1 font-serif text-lg font-normal text-white transition-colors group-hover:text-[#e6cb8b]">
                          {title}
                        </h3>
                      </div>
                      <p className="day:text-[#5c544a] mb-4 flex-1 text-xs leading-relaxed text-[#c3bbb0]">
                        {designDescription(
                          design,
                          productInfo.finish,
                          categoryTitle,
                          productInfo.kind,
                        )}
                      </p>

                      {motifs.length > 0 && (
                        <div className="day:border-[#ebe5da] mb-4 flex flex-wrap gap-1 border-t border-white/5 pt-3">
                          {motifs.map((motif) => (
                            <span
                              key={motif}
                              className="day:bg-[#f1ece2] day:text-[#5c544a] rounded px-2 py-0.5 text-[10px] text-white/60"
                            >
                              {motif}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="day:border-[#ebe5da] mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="day:text-[#756c62] text-xs text-white/50">
                          Personalize in 3D
                        </span>
                        <span className="day:text-[#8a651f] inline-flex items-center text-xs font-semibold tracking-wider text-[#cfac6c] uppercase transition-transform group-hover:translate-x-1">
                          Customize
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
