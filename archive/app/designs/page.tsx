import type { Metadata } from 'next';
import { SAVED_DESIGNS } from '#/lib/saved-designs-data';
import DesignsPageClient from './DesignsPageClient';

export async function generateMetadata(): Promise<Metadata> {
  const allDesigns = Object.values(SAVED_DESIGNS);
  const totalDesigns = allDesigns.length;
  
  // Group by product type
  const productTypes = new Set(allDesigns.map(d => d.productSlug));
  const productCount = productTypes.size;
  
  // Get top categories
  const categoryCount = new Set(allDesigns.map(d => d.category || 'uncategorized')).size;
  
  const title = 'Memorial Designs - Headstones, Plaques & Monuments | Forever Shining';
  const description = `Explore ${totalDesigns.toLocaleString()} premium memorial designs including traditional headstones, laser-etched monuments, and bronze plaques. Customize with inscriptions, granite colors, and motifs. View in 3D before ordering.`;
  
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
    'forever shining australia',
  ];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://forevershining.com.au';
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
      locale: 'en_AU',
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
        'en-GB': `${baseUrl}/designs`,
        'en-US': `${baseUrl}/designs`,
        'en-AU': `${baseUrl}/designs`,
        'x-default': `${baseUrl}/designs`,
      },
    },
  };
}

export default function DesignsPage() {
  return <DesignsPageClient />;
}
