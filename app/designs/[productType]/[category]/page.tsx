import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import MobileNavToggle from '#/components/MobileNavToggle';
import DesignsTreeNav from '#/components/DesignsTreeNav';
import {
  getCategoryDescription,
  getCategoryTitle,
  getProductSeoInfo,
  getSeoReadyDesigns,
  isIndexableCategoryDesignSet,
} from '#/lib/design-seo';

interface CategoryPageProps {
  params: Promise<{
    productType: string;
    category: string;
  }>;
}

// Enable ISR - revalidate every 24 hours
export const revalidate = 86400;

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

function formatDesignTitle(design: { slug: string; shapeName?: string }): string {
  if (!design.shapeName) return formatSlugForDisplay(design.slug);

  const shapeWords = design.shapeName.toLowerCase().replace(/[\s_]+/g, '-').split('-');
  const slugWords = design.slug.split('-');
  const hasShapePrefix = shapeWords.every((word, index) => slugWords[index] === word);

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
  const shapeName = design.shapeName ? formatShapeName(design.shapeName) : 'Classic';
  const hash = design.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const descriptions = [
    `A ${shapeName.toLowerCase()} ${finish} ${productKind} layout for ${categoryTitle.toLowerCase()} inscriptions and personal wording.`,
    `This ${shapeName.toLowerCase()} memorial design gives ${categoryTitle.toLowerCase()} tributes a balanced layout with space for names, dates and verses.`,
    `A refined ${shapeName.toLowerCase()} design suited to ${categoryTitle.toLowerCase()} memorials, with clear proportions for readable inscriptions.`,
  ];

  return descriptions[hash % descriptions.length];
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { productType: productSlug, category } = await params;

  const categoryTitle = getCategoryTitle(category);
  const productInfo = getProductSeoInfo(productSlug);

  // Get designs count
  const designs = getSeoReadyDesigns().filter(
    (design) => design.productSlug === productSlug && design.category === category,
  );
  const designCount = designs.length;

  // Get category description
  const categoryDesc = getCategoryDescription(category);

  // Build title
  const title = `${categoryTitle} ${productInfo.shortName} Designs | Forever Shining`;

  // Build description
  const description = `Browse ${designCount} ${categoryTitle.toLowerCase()} ${productInfo.kind} designs in ${productInfo.finish}. ${categoryDesc} Customise online with inscriptions, motifs, photos and live preview.`;

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
    'headstone inscriptions'
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
    robots: isIndexableCategoryDesignSet(designs)
      ? undefined
      : {
          index: false,
          follow: true,
        },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { productType: productSlug, category } = await params;
  const productInfo = getProductSeoInfo(productSlug);
  const categoryTitle = getCategoryTitle(category);
  const categoryDescription = getCategoryDescription(category);
  const designs = getSeoReadyDesigns()
    .filter((design) => design.productSlug === productSlug && design.category === category)
    .sort((a, b) => formatDesignTitle(a).localeCompare(formatDesignTitle(b)));

  if (!designs.length) {
    notFound();
  }

  return (
    <>
      <MobileNavToggle>
        <DesignsTreeNav />
      </MobileNavToggle>

      <main className="bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-y-auto min-h-screen md:ml-[400px]">
        <div className="container mx-auto px-6 md:px-8 py-10 md:py-12 max-w-7xl">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-10" aria-label="Breadcrumb">
            <Link href="/designs" className="hover:text-slate-900 transition-colors font-light tracking-wide">
              Memorial Designs
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
            <Link
              href={`/designs/${productSlug}`}
              className="hover:text-slate-900 transition-colors font-light tracking-wide"
            >
              {productInfo.name}
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-slate-900 font-medium tracking-wide">{categoryTitle}</span>
          </nav>

          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-light text-slate-900 mb-4 tracking-tight">
              {categoryTitle} {productInfo.shortName} Designs
            </h1>
            <div className="w-24 h-px bg-slate-300 mx-auto mb-6" />
            <p className="text-lg md:text-xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed">
              {categoryDescription} These {productInfo.kind} templates can be personalised with names,
              dates, verses, motifs and photos before ordering.
            </p>
            <p className="text-sm text-slate-500 mt-4 font-light">
              {designs.length.toLocaleString()} crawlable design templates
            </p>
          </header>

          <section aria-labelledby="category-designs-heading">
            <h2 id="category-designs-heading" className="sr-only">
              {categoryTitle} design templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => {
                const title = formatDesignTitle(design);
                const motifs = design.motifNames.slice(0, 4);

                return (
                  <Link
                    key={design.id}
                    href={`/designs/${design.productSlug}/${design.category}/${design.slug}`}
                    className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] bg-slate-100">
                      <Image
                        src={`/screenshots/v2026-3d/${design.id}_small.png`}
                        alt={`${title} memorial design preview`}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        unoptimized
                      />
                    </div>

                    <div className="p-6">
                      <h3 className="font-serif font-light text-xl text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                        {title}
                      </h3>
                      <p className="text-slate-600 font-light text-sm mb-4 leading-relaxed">
                        {designDescription(design, productInfo.finish, categoryTitle, productInfo.kind)}
                      </p>

                      {motifs.length > 0 && (
                        <p className="text-sm text-slate-500 font-light mb-4">
                          Motifs: {motifs.join(', ')}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                        <span className="text-xs text-slate-500 font-light">
                          {design.inscriptionCount} inscription {design.inscriptionCount === 1 ? 'area' : 'areas'}
                        </span>
                        <span className="inline-flex items-center text-slate-700 font-light text-sm uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                          View Design
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
