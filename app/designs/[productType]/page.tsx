import { Metadata } from 'next';
import { getAllSavedDesigns } from '#/lib/saved-designs-data';
import ProductPageClient from './ProductPageClient';

interface ProductPageProps {
  params: Promise<{
    productType: string;
  }>;
}

// Enable ISR - revalidate every 24 hours
export const revalidate = 86400;

// Helper function to get product type display name and metadata
function getProductMetadata(productSlug: string) {
  const productMap: Record<string, {
    name: string;
    shortName: string;
    description: string;
    type: string;
  }> = {
    'traditional-headstone': {
      name: 'Traditional Engraved Headstone',
      shortName: 'Traditional Engraved',
      description: 'Timeless granite memorials with sandblasted inscriptions and hand-painted lettering. Available in Black Granite, Blue Pearl, and 25+ premium stones.',
      type: 'Headstone'
    },
    'laser-etched-headstone': {
      name: 'Laser-Etched Black Granite Headstone',
      shortName: 'Laser-Etched',
      description: 'Photo-realistic laser engraving on polished black granite. Perfect for detailed portraits, landscapes, and custom artwork with exceptional clarity.',
      type: 'Headstone'
    },
    'bronze-plaque': {
      name: 'Bronze Memorial Plaque',
      shortName: 'Bronze',
      description: 'Cast bronze memorial plaques with decorative borders. Weather-resistant finish designed to last 200+ years. Available in rectangle, oval, and circle shapes.',
      type: 'Plaque'
    },
    'laser-etched-plaque': {
      name: 'Laser-Etched Black Granite Plaque',
      shortName: 'Laser-Etched Plaque',
      description: 'Compact memorial plaques with precision laser etching on black granite. Ideal for cremation memorials and garden remembrance.',
      type: 'Plaque'
    },
    'traditional-plaque': {
      name: 'Traditional Engraved Plaque',
      shortName: 'Traditional Plaque',
      description: 'Classic engraved plaques with sandblasted lettering. Elegant memorial markers for cremation niches and memorial walls.',
      type: 'Plaque'
    }
  };

  return productMap[productSlug] || {
    name: productSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    shortName: productSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: 'Memorial designs for lasting tributes.',
    type: 'Memorial'
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productType: productSlug } = await params;
  
  const productInfo = getProductMetadata(productSlug);
  const allDesigns = getAllSavedDesigns();
  const designs = allDesigns.filter(d => d.productSlug === productSlug);
  
  // Get unique categories
  const categories = Array.from(new Set(designs.map(d => d.category)));
  const categoryCount = categories.length;
  const designCount = designs.length;

  // Build title
  const title = `${productInfo.name} Designs | Forever Shining`;

  // Build description
  const description = `Browse ${designCount} ${productInfo.shortName.toLowerCase()} designs across ${categoryCount} categories. ${productInfo.description} Fully customizable with inscriptions, verses, motifs, and photos. Free design proofs and fast delivery.`;

  // Build keywords
  const keywords = [
    productInfo.name.toLowerCase(),
    `${productInfo.shortName.toLowerCase()} ${productInfo.type.toLowerCase()}`,
    `${productInfo.shortName.toLowerCase()} memorial`,
    `${productInfo.shortName.toLowerCase()} designs`,
    'headstone designs',
    'memorial designs',
    'custom headstone',
    'personalized memorial',
    'granite headstone',
    'memorial stone',
    'cemetery marker',
    'grave marker',
    'headstone inscriptions',
    'memorial quotes',
    'headstone motifs',
    ...categories.slice(0, 10).map(c => c.replace(/-/g, ' '))
  ].join(', ');

  // Build canonical URL
  const baseUrl = 'https://forevershining.org';
  const canonicalUrl = `${baseUrl}/designs/${productSlug}`;

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

export default async function ProductTypePage({ params }: ProductPageProps) {
  const { productType: productSlug } = await params;
  
  return <ProductPageClient productSlug={productSlug} />;
}
