import { Metadata } from 'next';
import { getDesignsByCategory, DESIGN_CATEGORIES, type DesignCategory } from '#/lib/saved-designs-data';
import CategoryPageClient from './CategoryPageClient';

interface CategoryPageProps {
  params: Promise<{
    productType: string;
    category: string;
  }>;
}

// Enable ISR - revalidate every 24 hours
export const revalidate = 86400;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { productType: productSlug, category } = await params;

  // Format category title
  const categoryTitle = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Format product name
  const productName = productSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Get product type
  const productType = productSlug.includes('laser') ? 'Laser-Etched' : 
                     productSlug.includes('bronze') ? 'Bronze' : 
                     'Traditional Engraved';

  // Get designs count
  const categoryDesigns = getDesignsByCategory(category as DesignCategory);
  const designs = categoryDesigns.filter(d => d.productSlug === productSlug);
  const designCount = designs.length;

  // Get category description
  const categoryInfo = DESIGN_CATEGORIES[category as DesignCategory];
  const categoryDesc = categoryInfo?.description || `Memorial designs for ${categoryTitle.toLowerCase()}`;

  // Build title
  const title = `${categoryTitle} - ${productType} Headstone Designs | Forever Shining`;

  // Build description
  const description = `Browse ${designCount} ${categoryTitle.toLowerCase()} designs in ${productType.toLowerCase()}. Classic headstone shapes with space for inscriptions, verses, and decorative motifs. Black granite, custom fonts, and personalization options available.`;

  // Build keywords
  const keywords = [
    categoryTitle.toLowerCase(),
    `${categoryTitle.toLowerCase()} headstone`,
    `${categoryTitle.toLowerCase()} memorial`,
    productType.toLowerCase(),
    `${productType.toLowerCase()} headstone`,
    'headstone designs',
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
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { productType: productSlug, category } = await params;

  return <CategoryPageClient productSlug={productSlug} category={category} />;
}
