import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getSavedDesign, getDesignFromSlug, getCanonicalSlugForDesign, extractDesignIdFromSlug, DESIGN_CATEGORIES } from '#/lib/saved-designs-data';
import { getProductFromId } from '#/lib/product-utils';
import DesignPageClient from './DesignPageClient';

/**
 * Format slug for display - convert kebab-case to Title Case
 */
function formatSlugForDisplay(slug: string): string {
  if (!slug) return 'Memorial Design';

  return slug
    .split('-')
    .map((word, index) => {
      // Don't capitalize very short words unless first word
      if (word.length <= 2 && index > 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Extract shape name from design data
 */
async function getDesignShape(designId: string, mlDir: string): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/ml/${mlDir}/saved-designs/json/${designId}.json`);
    if (!response.ok) return null;
    
    const data = await response.json();
    const headstoneItem = data.find((item: any) => item.type === 'Headstone' || item.type === 'Plaque');
    
    if (headstoneItem?.shape) {
      let extractedShape = headstoneItem.shape;
      
      // Remove "Headstone" or "Plaque" prefix and numbers
      extractedShape = extractedShape
        .replace(/^(headstone|plaque)\s+\d+$/i, '')
        .replace(/^(headstone|plaque)_\d+$/i, '')
        .trim();
      
      // If we have a named shape, use it
      if (extractedShape && extractedShape.length > 0 && !/^\d+$/.test(extractedShape)) {
        const formattedShape = extractedShape
          .replace(/_/g, ' ')
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return formattedShape;
      } else {
        // Map common numbered shapes
        const shapeFile = headstoneItem.shape.toLowerCase().replace(/\s+/g, '_');
        const shapeMap: Record<string, string> = {
          'headstone_27': 'Heart',
          'pet_heart': 'Heart',
          'serpentine': 'Serpentine',
          'gable': 'Gable',
          'peak': 'Peak',
          'curved_peak': 'Curved Peak',
          'square': 'Square',
          'landscape': 'Landscape',
          'portrait': 'Portrait',
        };
        return shapeMap[shapeFile] || null;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get simplified product type for metadata
 */
function getSimplifiedProductType(productName: string): string {
  const name = productName.toLowerCase();
  
  if (name.includes('laser-etched') || name.includes('laser etched')) {
    if (name.includes('colour') || name.includes('color')) {
      return 'Laser-Etched Colour';
    }
    return 'Laser-Etched Black Granite';
  }
  
  if (name.includes('bronze')) return 'Bronze';
  if (name.includes('stainless steel')) return 'Stainless Steel';
  if (name.includes('traditional')) return 'Traditional Engraved';
  if (name.includes('full colour') || name.includes('full color')) return 'Full Colour';
  
  return productName;
}

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

  // Try new slug lookup first, then fall back to old format
  let design = getDesignFromSlug(slug);

  if (!design) {
    return {
      title: 'Design Not Found',
    };
  }

  const product = getProductFromId(design.productId);
  const productName = product?.name || 'Design';
  const simplifiedProduct = getSimplifiedProductType(productName);
  
  // Get category display name
  const categoryInfo = DESIGN_CATEGORIES[design.category];
  const categoryTitle = categoryInfo?.name || category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  // Determine product type for title
  const productTypeDisplay = design.productType === 'headstone' ? 'Headstone' : 
                            design.productType === 'plaque' ? 'Plaque' : 'Monument';
  
  // Build enhanced title
  // Format: "Mother Memorial – Laser-Etched Black Granite Headstone | Forever Shining"
  const pageTitle = `${categoryTitle} – ${simplifiedProduct} ${productTypeDisplay} | Forever Shining`;
  
  // Get shape name if available
  const shapeName = design.id ? await getDesignShape(design.id, design.mlDir) : null;
  
  // Build H1 equivalent (used in OpenGraph)
  // Format: "Mother Memorial – Laser-Etched Black Granite (Heart)"
  const h1Title = `${categoryTitle} – ${simplifiedProduct}${shapeName ? ` (${shapeName})` : ''}`;
  
  // Build meta description (140-160 chars)
  // Format: "Design a heart-shaped Mother Memorial in laser-etched black granite. Add name, verse, motifs and preview live. Fast proofing & delivery."
  let description = `Design a ${categoryTitle.toLowerCase()} in ${simplifiedProduct.toLowerCase()}.`;
  
  // Add features based on design content
  const features: string[] = [];
  if (design.inscriptionCount > 0) features.push('inscriptions');
  if (design.hasMotifs) features.push('motifs');
  if (design.hasPhoto) features.push('photos');
  
  if (features.length > 0) {
    description += ` Add ${features.join(', ')}.`;
  } else {
    description += ' Fully customizable.';
  }
  
  description += ' Preview live. Fast proofing & delivery.';
  
  // Ensure description is within 140-160 chars
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  // Build canonical URL with clean slug
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://forevershining.org';
  const canonicalSlug = design.slug; // Use the clean, SEO-friendly slug from metadata
  const currentPath = `/designs/${productSlug}/${category}/${canonicalSlug}`;
  
  // Map mlDir to primary domain
  const getDomainForRegion = (mlDir: string) => {
    if (mlDir === 'forevershining') return 'https://forevershining.com.au';
    if (mlDir === 'bronze-plaque') return 'https://bronze-plaque.com';
    return 'https://headstonesdesigner.com';
  };

  const alternateLanguages = {
    'en-AU': `${getDomainForRegion('forevershining')}${currentPath}`,
    'en-US': `${getDomainForRegion('bronze-plaque')}${currentPath}`,
    'en-GB': `${baseUrl}${currentPath}`, // UK version on main domain
  };

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: `${baseUrl}${currentPath}`,
      languages: alternateLanguages,
    },
    openGraph: {
      title: h1Title,
      description,
      url: `${baseUrl}${currentPath}`,
      locale: design.mlDir === 'forevershining' ? 'en_AU' : 'en_US',
      alternateLocale: ['en_AU', 'en_US', 'en_GB'].filter(
        locale => locale !== (design.mlDir === 'forevershining' ? 'en_AU' : 'en_US')
      ),
      images: design.preview ? [
        {
          url: design.preview,
          width: 1200,
          height: 630,
          alt: `${categoryTitle} design preview`,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: h1Title,
      description,
      images: design.preview ? [design.preview] : undefined,
    },
  };
}

export default async function SavedDesignPage({ params }: SavedDesignPageProps) {
  const { productType: productSlug, category, slug } = await params;

  // Try new slug lookup first
  let design = getDesignFromSlug(slug);
  
  if (!design) {
    notFound();
  }

  // Check if this is an old timestamp_description format and redirect to clean URL
  const isOldFormat = /^\d+_/.test(slug);
  const canonicalSlug = design.slug; // Clean SEO-friendly slug
  
  if (isOldFormat && slug !== canonicalSlug) {
    // 301 redirect from old format to new clean URL
    const canonicalUrl = `/designs/${productSlug}/${category}/${canonicalSlug}`;
    redirect(canonicalUrl);
  }

  const designId = design.id;

  // Generate structured data for SEO
  const product = getProductFromId(design.productId);
  const productName = product?.name || design.productName;
  const simplifiedProduct = getSimplifiedProductType(productName);
  const categoryInfo = DESIGN_CATEGORIES[design.category];
  const categoryTitle = categoryInfo?.name || category.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const productTypeDisplay = design.productType.charAt(0).toUpperCase() + design.productType.slice(1);
  const shapeName = designId ? await getDesignShape(designId, design.mlDir) : null;
  
  // Build product title for structured data
  const productTitle = `${categoryTitle} – ${shapeName ? `${shapeName}-Shaped ` : ''}${simplifiedProduct} ${productTypeDisplay}`;
  
  // Determine material and color
  const material = simplifiedProduct.toLowerCase().includes('granite') ? 'Black granite' : 
                  simplifiedProduct.toLowerCase().includes('bronze') ? 'Bronze' :
                  simplifiedProduct.toLowerCase().includes('stainless') ? 'Stainless steel' : 'Granite';
  
  const color = simplifiedProduct.toLowerCase().includes('black') ? 'Black' : 
               simplifiedProduct.toLowerCase().includes('bronze') ? 'Bronze' :
               simplifiedProduct.toLowerCase().includes('stainless') ? 'Silver' : 'Black';
  
  const finish = simplifiedProduct.toLowerCase().includes('laser') ? 'Laser-etched' :
                simplifiedProduct.toLowerCase().includes('traditional') ? 'Traditional engraved' : 'Laser-etched';
  
  // Generate SKU
  const sku = `FS-${design.productType.toUpperCase()}-${shapeName ? shapeName.toUpperCase().replace(/\s+/g, '-') : 'STANDARD'}-${simplifiedProduct.toUpperCase().replace(/\s+/g, '-')}-${category.toUpperCase()}`;
  
  // Build canonical URL with clean slug
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://forevershining.com.au';
  const canonicalUrl = `${baseUrl}/designs/${productSlug}/${category}/${canonicalSlug}`;
  
  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // Product Schema
      {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        "name": productTitle,
        "description": `Design online: add inscriptions, verses and motifs with live preview. ${categoryTitle.toLowerCase()} in ${simplifiedProduct.toLowerCase()}.`,
        "brand": {
          "@type": "Brand",
          "name": "Forever Shining"
        },
        "category": productTypeDisplay,
        "material": material,
        "color": color,
        "additionalProperty": [
          { "@type": "PropertyValue", "name": "Shape", "value": shapeName || "Standard" },
          { "@type": "PropertyValue", "name": "Finish", "value": finish },
          { "@type": "PropertyValue", "name": "Personalisation", "value": "Inscriptions, verses, motifs" },
          ...(design.hasMotifs ? [{ "@type": "PropertyValue", "name": "Motifs", "value": "Available" }] : []),
          ...(design.hasPhoto ? [{ "@type": "PropertyValue", "name": "Photo", "value": "Photo placement available" }] : []),
        ],
        "image": design.preview ? [`${baseUrl}${design.preview}`] : [],
        "sku": sku,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "AUD",
          "price": "495.00",
          "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "availability": "https://schema.org/InStock",
          "url": canonicalUrl,
          "seller": {
            "@type": "Organization",
            "name": "Forever Shining"
          }
        }
      },
      // BreadcrumbList Schema
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Memorial Designs",
            "item": `${baseUrl}/designs`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": `${productTypeDisplay}s`,
            "item": `${baseUrl}/designs/${design.productType}`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": productName,
            "item": `${baseUrl}/designs/${productSlug}`
          },
          {
            "@type": "ListItem",
            "position": 5,
            "name": categoryTitle,
            "item": `${baseUrl}/designs/${productSlug}/${category}`
          },
          {
            "@type": "ListItem",
            "position": 6,
            "name": design.title,
            "item": canonicalUrl
          }
        ]
      },
      // ImageObject Schema (if preview exists)
      ...(design.preview ? [{
        "@type": "ImageObject",
        "@id": `${canonicalUrl}#image`,
        "url": `${baseUrl}${design.preview}`,
        "contentUrl": `${baseUrl}${design.preview}`,
        "name": `${productTitle} Preview`,
        "description": `Preview of ${categoryTitle.toLowerCase()} design`,
        "width": "1200",
        "height": "630"
      }] : [])
    ]
  };

  // Generate FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What inscription length fits on the ${categoryTitle} ${shapeName ? `(${shapeName})` : ''}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `This ${categoryTitle.toLowerCase()} design accommodates ${design.inscriptionCount <= 2 ? 'short to medium' : design.inscriptionCount <= 4 ? 'medium length' : 'multiple'} inscriptions comfortably. You can add names, dates, verses, and personal messages. The design tool provides real-time preview so you can see exactly how your text will appear. We recommend keeping individual lines to 30-40 characters for optimal readability.`
        }
      },
      {
        "@type": "Question",
        "name": "Can I change fonts and motifs on this design?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Absolutely! This design is fully customizable. You can choose from 10+ professional fonts suitable for memorials, adjust text sizes, and select from over 5,000 motifs including religious symbols, flora, fauna, and custom imagery. ${design.hasMotifs ? 'This design already includes motifs which you can keep, replace, or remove.' : 'You can easily add motifs to personalize your memorial.'} All changes are made through our interactive design tool with instant preview.`
        }
      },
      {
        "@type": "Question",
        "name": `How long does ${simplifiedProduct.toLowerCase().includes('laser') ? 'laser-etched black granite' : simplifiedProduct.toLowerCase().includes('bronze') ? 'bronze' : simplifiedProduct.toLowerCase()} last outdoors?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": simplifiedProduct.toLowerCase().includes('laser')
            ? "Laser-etched black granite memorials are exceptionally durable with an expected lifespan exceeding 100-200 years. The laser etching penetrates 0.5-1mm deep into the granite surface, creating permanent markings that resist weathering, fading, and environmental damage. Granite has a Mohs hardness rating of 6-7, making it highly resistant to erosion. With minimal maintenance (annual gentle wash), your memorial will maintain its appearance for generations."
            : simplifiedProduct.toLowerCase().includes('bronze')
            ? "Bronze memorials can last 200+ years when properly maintained. Bronze naturally develops a protective patina over time that actually enhances longevity. The cast bronze construction is highly resistant to corrosion and weathering. Regular cleaning with mild soap maintains the finish, and professional refinishing services can restore original luster if desired."
            : `${simplifiedProduct} memorials are built for lasting durability in outdoor conditions. With proper care and maintenance, expect a lifespan of 50+ years. The materials are selected specifically for weather resistance and longevity in cemetery environments.`
        }
      },
      {
        "@type": "Question",
        "name": "What's the typical lead time and delivery process?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Standard production time is 2-3 weeks for ${simplifiedProduct.toLowerCase().includes('laser') ? 'laser-etched granite' : simplifiedProduct.toLowerCase().includes('bronze') ? 'bronze' : 'this'} ${productTypeDisplay.toLowerCase()}s, with express 1-week service available. After you finalize your design online, we provide detailed proofs for your approval before manufacturing begins. ${design.mlDir === 'forevershining' ? 'Delivery is included to mainland Australia. For heavy products over 25kg, delivery is to a postal or shipping depot for collection.' : 'Delivery is included within the continental United States.'} Professional installation can be arranged through our network of certified installers. We'll keep you updated throughout the entire process.`
        }
      }
    ]
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <DesignPageClient
        productSlug={productSlug}
        category={category}
        slug={canonicalSlug}
        designId={designId}
        design={design}
      />
    </>
  );
}