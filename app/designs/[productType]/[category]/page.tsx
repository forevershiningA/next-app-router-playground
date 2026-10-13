import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import DesignsIndexMobileNavToggle from '#/components/designs/DesignsIndexMobileNavToggle';
import ServerDesignsTreeNav from '#/components/designs/ServerDesignsTreeNav';
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
      <DesignsIndexMobileNavToggle />
      <aside
        className="fixed top-0 left-0 z-10 hidden h-full flex-col border-r border-slate-200 md:block"
        style={{ width: '400px' }}
      >
        <ServerDesignsTreeNav maxDesignLinksPerCategory={0} />
      </aside>

      <main className="min-h-screen overflow-y-auto bg-[#f7f5f0] md:ml-[400px]">
        <div className="container mx-auto max-w-7xl px-4 pt-20 pb-14 md:px-8 md:py-12">
          <nav
            className="mb-8 flex items-center gap-2 text-sm text-stone-500"
            aria-label="Breadcrumb"
          >
            <Link
              href="/designs"
              className="font-light tracking-wide transition-colors hover:text-stone-950"
            >
              Memorial Designs
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <Link
              href={`/designs/${productSlug}`}
              className="font-light tracking-wide transition-colors hover:text-stone-950"
            >
              {productInfo.name}
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="font-medium tracking-wide text-stone-950">
              {categoryTitle}
            </span>
          </nav>

          <header className="mb-12 max-w-4xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-[#9b7a24] uppercase">
              Choose a starting layout
            </p>
            <h1 className="mb-5 font-serif text-4xl font-light tracking-tight text-stone-950 md:text-6xl">
              {categoryTitle} {productInfo.shortName} Designs
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed font-light text-stone-600 md:text-xl">
              {categoryDescription} These {productInfo.kind} templates can be
              personalized with names, dates, verses, motifs and photos before
              ordering.
            </p>
            <p className="mt-5 text-sm font-light text-stone-500">
              {designs.length.toLocaleString()} design templates to personalize
            </p>
          </header>

          {categorySeoCopy && (
            <section
              aria-labelledby="category-guide-heading"
              className="mb-12 max-w-4xl"
            >
              <h2
                id="category-guide-heading"
                className="mb-4 font-serif text-2xl font-light text-stone-950"
              >
                Choosing {categoryTitle.toLowerCase()} {productInfo.kind}{' '}
                designs
              </h2>
              <p className="mb-5 text-base leading-8 font-light text-stone-600">
                {categorySeoCopy.intro}
              </p>
              <ul className="grid gap-3 text-sm leading-7 text-stone-600 md:grid-cols-3">
                {categorySeoCopy.points.map((point) => (
                  <li key={point} className="border-l border-[#d8c487] pl-4">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {designs.map((design) => {
                const title = formatDesignTitle(design);
                const motifs = design.motifNames.slice(0, 4);

                return (
                  <Link
                    key={design.id}
                    href={`/designs/${design.productSlug}/${design.category}/${design.slug}`}
                    className="group overflow-hidden rounded-lg border border-stone-200 bg-white transition-all duration-300 hover:border-[#d8c487] hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_50%_28%,#ffffff_0%,#f4f0e7_52%,#e6e0d3_100%)]">
                      <Image
                        src={`/screenshots/v2026-3d/${design.id}_small.png`}
                        alt={`${title} memorial design preview`}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    </div>

                    <div className="p-6">
                      <h3 className="mb-2 font-serif text-xl font-light text-stone-950 transition-colors group-hover:text-[#8a6b1f]">
                        {title}
                      </h3>
                      <p className="mb-4 text-sm leading-relaxed font-light text-stone-600">
                        {designDescription(
                          design,
                          productInfo.finish,
                          categoryTitle,
                          productInfo.kind,
                        )}
                      </p>

                      {motifs.length > 0 && (
                        <p className="mb-4 text-sm font-light text-stone-500">
                          Motifs: {motifs.join(', ')}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-4 border-t border-stone-100 pt-4">
                        <span className="text-xs font-light text-stone-500">
                          {design.inscriptionCount} inscription{' '}
                          {design.inscriptionCount === 1 ? 'area' : 'areas'}
                        </span>
                        <span className="inline-flex items-center text-sm font-light tracking-wider text-[#8a6b1f] uppercase transition-transform group-hover:translate-x-1">
                          View Design
                          <ChevronRightIcon className="ml-1 h-4 w-4" />
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
