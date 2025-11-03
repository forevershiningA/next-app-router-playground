import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getSavedDesign, extractDesignIdFromSlug } from '#/lib/saved-designs-data';
import { getProductFromId } from '#/lib/product-utils';
import DesignPageClient from './DesignPageClient';

interface SavedDesignPageProps {
  params: Promise<{
    productType: string; // Actually productSlug: 'bronze-plaque' | 'laser-etched-headstone' etc.
    category: string;    // 'memorial', 'in-loving-memory', 'pet-memorial', etc.
    slug: string;        // Format: {id}_{description}
  }>;
}

// Generate static params for popular designs
export async function generateStaticParams() {
  // In production, this would generate paths for all designs
  return [];
}

export async function generateMetadata({ params }: SavedDesignPageProps): Promise<Metadata> {
  const { productType: productSlug, category, slug } = await params;

  // Extract design ID from slug
  const designId = extractDesignIdFromSlug(slug);
  const design = designId ? getSavedDesign(designId) : null;
  
  if (!design) {
    return {
      title: 'Design Not Found',
    };
  }

  const product = getProductFromId(design.productId);
  const title = design.title || 'Memorial Design';
  const categoryTitle = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${title} | ${product?.name || 'Design'} | DYO`,
    description: `${categoryTitle} design for ${product?.name}. Customize this design with your own inscriptions, motifs, and additions.`,
    openGraph: {
      title: `${title} - ${product?.name}`,
      description: `${categoryTitle} design`,
    },
  };
}

export default async function SavedDesignPage({ params }: SavedDesignPageProps) {
  const { productType: productSlug, category, slug } = await params;

  // Extract design ID from slug (format: {id}_{description})
  const designId = extractDesignIdFromSlug(slug);
  
  if (!designId) {
    notFound();
  }

  const design = getSavedDesign(designId);
  
  if (!design) {
    notFound();
  }

  return (
    <DesignPageClient 
      productSlug={productSlug}
      category={category} 
      slug={slug} 
      designId={designId}
      design={design}
    />
  );
}
