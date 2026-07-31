import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getProductFromId } from '#/lib/product-utils';
import { INDEXABLE_PRODUCT_SLUGS } from '#/lib/design-seo';
import StartSavedDesignButton from './StartSavedDesignButton';

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
/**
 * Format a raw shape name (from metadata) into Title Case for display.
 * e.g. "curved gable" → "Curved Gable", "headstone_27" → null
 */
function formatShapeName(raw: string | undefined): string | null {
  if (!raw) return null;
  // Discard pure-number or generic "headstone_N" / "plaque_N" entries
  const cleaned = raw
    .replace(/^(headstone|plaque)[_\s]\d+$/i, '')
    .replace(/_/g, ' ')
    .trim();
  if (!cleaned || /^\d+$/.test(cleaned)) return null;
  return cleaned
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
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

function buildDesignSeoTitle({
  shapeName,
  categoryTitle,
  simplifiedProduct,
  productTypeDisplay,
}: {
  shapeName: string | null;
  categoryTitle: string;
  simplifiedProduct: string;
  productTypeDisplay: string;
}): string {
  const productDescriptor =
    productTypeDisplay === 'Headstone'
      ? productTypeDisplay
      : `${simplifiedProduct} ${productTypeDisplay}`;

  return shapeName
    ? `${shapeName} ${categoryTitle} ${productDescriptor} Design`
    : `${categoryTitle} ${productDescriptor} Design`;
}

function buildDesignDescription({
  seoTitle,
  phraseFromSlug,
  motifList,
}: {
  seoTitle: string;
  phraseFromSlug: string | null;
  motifList: string | null;
}): string {
  const motifText = motifList ? ` Features decorative motifs including ${motifList}.` : '';
  const phraseText = phraseFromSlug ? ` Inspired by the wording "${phraseFromSlug}".` : '';
  return `${seoTitle}. Personalise this memorial online with inscriptions, photos, motifs and a live 3D preview before proofing and manufacture.${motifText}${phraseText}`;
}

function truncateMetaDescription(description: string): string {
  return description.length > 160 ? `${description.substring(0, 157)}...` : description;
}

interface SavedDesignPageProps {
  params: Promise<{
    productType: string; // Actually productSlug: 'bronze-plaque' | 'laser-etched-headstone' etc.
    category: string;    // 'memorial', 'in-loving-memory', 'pet-memorial', etc.
    slug: string;        // Format: {id}_{description}
  }>;
}

// Render design detail pages on demand and cache them with ISR.
// Pre-rendering hundreds of heavy saved-design pages makes production builds hang.
export async function generateStaticParams() {
  return [];
}

// Enable ISR - revalidate every 24 hours
export const revalidate = 86400;
export const dynamicParams = true;

export async function generateMetadata({ params }: SavedDesignPageProps): Promise<Metadata> {
  const { category, slug } = await params;

  // Try new slug lookup first, then fall back to old format
  const { getDesignFromSlug, DESIGN_CATEGORIES } = await import('#/lib/saved-designs-data');
  const design = getDesignFromSlug(slug);

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

  // Use shapeName directly from design metadata (no extra fetch needed)
  const shapeDisplay = design.shapeName
    ? design.shapeName.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : null;

  // Extract the unique verse/phrase from the slug by stripping the shape prefix
  // e.g. "curved-gable-may-heavens-eternal-happiness-be-thine" → "May Heavens Eternal Happiness Be Thine"
  const shapeSlugPrefix = design.shapeName
    ? design.shapeName.toLowerCase().replace(/\s+/g, '-') + '-'
    : '';
  const phraseFromSlug = slug.startsWith(shapeSlugPrefix) && shapeSlugPrefix
    ? formatSlugForDisplay(slug.slice(shapeSlugPrefix.length))
    : null;

  // Design-specific meta description using shape, motifs and verse from slug
  const motifList = design.motifNames?.length > 0
    ? design.motifNames.slice(0, 3).join(', ').replace(/,([^,]*)$/, ' and$1')
    : null;

  const seoTitle = buildDesignSeoTitle({
    shapeName: shapeDisplay,
    categoryTitle,
    simplifiedProduct,
    productTypeDisplay,
  });
  const description = truncateMetaDescription(
    buildDesignDescription({
      seoTitle,
      phraseFromSlug,
      motifList,
    }),
  );
  const pageTitle = `${seoTitle} | Forever Shining`;

  // Build canonical URL with clean slug
  const baseUrl = 'https://forevershining.org';
  const canonicalSlug = design.slug; // Use the clean, SEO-friendly slug from metadata
  const currentPath = `/designs/${design.productSlug}/${design.category}/${canonicalSlug}`;
  const canonicalUrl = `${baseUrl}${currentPath}`;

  return {
    title: pageTitle,
    description,
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
      title: seoTitle,
      description,
      url: canonicalUrl,
      siteName: 'Forever Shining',
      locale: 'en_GB',
      type: 'website',
      images: [
        {
          url: `/screenshots/v2026-3d/${design.id}.png`,
          width: 1200,
          height: 630,
          alt: `${seoTitle} preview`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description,
      images: [`/screenshots/v2026-3d/${design.id}.png`],
    },
    robots: INDEXABLE_PRODUCT_SLUGS.has(design.productSlug)
      ? undefined
      : {
          index: false,
          follow: true,
        },
  };
}

export default async function SavedDesignPage({ params }: SavedDesignPageProps) {
  const { productType: productSlug, category, slug } = await params;

  // Lookup design by clean slug
  const { getDesignFromSlug, DESIGN_CATEGORIES } = await import('#/lib/saved-designs-data');
  const design = getDesignFromSlug(slug);
  
  if (!design) {
    notFound();
  }

  const canonicalPath = `/designs/${design.productSlug}/${design.category}/${design.slug}`;
  const requestedPath = `/designs/${productSlug}/${category}/${slug}`;

  if (requestedPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  const designId = design.id;

  // Generate structured data for SEO
  const product = getProductFromId(design.productId);
  const productName = product?.name || design.productName;
  const simplifiedProduct = getSimplifiedProductType(productName);
  const categoryInfo = DESIGN_CATEGORIES[design.category];
  const categoryTitle = categoryInfo?.name || category.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const productTypeDisplay = design.productType.charAt(0).toUpperCase() + design.productType.slice(1);
  const shapeName = formatShapeName(design.shapeName);

  // Extract verse/phrase from slug by stripping shape prefix
  const shapeSlugPrefix = design.shapeName
    ? design.shapeName.toLowerCase().replace(/\s+/g, '-') + '-'
    : '';
  const phraseFromSlug = slug.startsWith(shapeSlugPrefix) && shapeSlugPrefix
    ? formatSlugForDisplay(slug.slice(shapeSlugPrefix.length))
    : null;

  // Motif summary for display
  const motifList = design.motifNames?.length > 0
    ? design.motifNames.slice(0, 3).join(', ').replace(/,([^,]*)$/, ' and$1')
    : null;

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

  // Starting price by product type (AUD) — used for AggregateOffer lowPrice/highPrice
  const lowPriceAud = simplifiedProduct.toLowerCase().includes('bronze') ? '895' :
                      simplifiedProduct.toLowerCase().includes('stainless') ? '795' :
                      design.productType === 'monument' ? '2495' : '695';
  const highPriceAud = simplifiedProduct.toLowerCase().includes('bronze') ? '4995' :
                       simplifiedProduct.toLowerCase().includes('stainless') ? '3995' :
                       design.productType === 'monument' ? '9995' : '3495';
  
  // Build canonical URL with clean slug
  const baseUrl = 'https://forevershining.org';
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  const previewScreenshotSrc = `/screenshots/v2026-3d/${design.id}_small.png`;
  
  const formattedH1 = buildDesignSeoTitle({
    shapeName,
    categoryTitle,
    simplifiedProduct,
    productTypeDisplay,
  });
  const shortDesignName = shapeName && phraseFromSlug
    ? `${shapeName} – ${phraseFromSlug}`
    : shapeName
    ? `${shapeName} – ${categoryTitle}`
    : formatSlugForDisplay(slug);
  const description = buildDesignDescription({
    seoTitle: formattedH1,
    phraseFromSlug,
    motifList,
  });
  const productTitle = formattedH1;

  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // Product Schema
      {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        "name": productTitle,
        "description": description,
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
        "image": [`${baseUrl}/screenshots/v2026-3d/${design.id}.png`],
        "sku": sku,
        "mpn": sku,
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "AUD",
          "lowPrice": lowPriceAud,
          "highPrice": highPriceAud,
          "offerCount": "1",
          "availability": "https://schema.org/InStock",
          "url": canonicalUrl,
          "seller": {
            "@type": "Organization",
            "name": "Forever Shining",
            "url": baseUrl
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": ["AU", "GB", "US", "CA"],
            "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted",
            "merchantReturnDays": 0
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0",
              "currency": "AUD"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": ["AU", "GB", "US", "CA"]
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 2,
                "maxValue": 3,
                "unitCode": "WEE"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": 1,
                "maxValue": 2,
                "unitCode": "WEE"
              }
            }
          }
        },
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
            "name": productName,
            "item": `${baseUrl}/designs/${productSlug}`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": categoryTitle,
            "item": `${baseUrl}/designs/${productSlug}/${category}`
          },
          {
            "@type": "ListItem",
            "position": 5,
            "name": shortDesignName,
            "item": canonicalUrl
          }
        ]
      },
      // ImageObject Schema
      {
        "@type": "ImageObject",
        "@id": `${canonicalUrl}#image`,
        "url": `${baseUrl}/screenshots/v2026-3d/${design.id}.png`,
        "contentUrl": `${baseUrl}/screenshots/v2026-3d/${design.id}.png`,
        "name": `${productTitle} Preview`,
        "description": `Preview of ${formattedH1.toLowerCase()}`,
        "width": "1200",
        "height": "630"
      },
      // Organization Schema
      {
        "@type": "Organization",
        "@id": `${baseUrl}#organization`,
        "name": "Forever Shining",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Service",
          "availableLanguage": ["English"]
        }
      }
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
      {/* Preload hero image for LCP optimization */}
      <link
        rel="preload"
        as="image"
        href={previewScreenshotSrc}
        fetchPriority="high"
      />
      
      {/* Preconnect to asset domains for faster resource loading */}
      <link rel="preconnect" href={process.env.NEXT_PUBLIC_BASE_URL || ''} />
      <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_BASE_URL || ''} />
      
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
      
      {/* SSR-visible content for search engine indexing — hidden once client hydrates */}
      <div id="design-ssr-content" className="bg-white md:ml-[400px] min-h-screen">
        <div className="border-b border-slate-200 bg-white/80">
          <div className="container mx-auto px-4 md:px-8 py-3 md:py-6 max-w-7xl">
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
              <Link href="/designs">Memorial Designs</Link>
              <span aria-hidden="true">›</span>
              <Link href={`/designs/${productSlug}`}>{productName}</Link>
              <span aria-hidden="true">›</span>
              <Link href={`/designs/${productSlug}/${category}`}>{categoryTitle}</Link>
              <span aria-hidden="true">›</span>
              <span>{shortDesignName}</span>
            </nav>

            <h1 className="text-2xl md:text-4xl font-serif font-light text-slate-900 tracking-tight mb-2 md:mb-4">
              {formattedH1}
            </h1>

            <p className="text-base md:text-lg text-slate-500 font-light mb-3 md:mb-6">
              {categoryTitle} · {simplifiedProduct} {productTypeDisplay}
            </p>

            <p className="text-slate-600 mb-6 max-w-2xl">
              {description}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewScreenshotSrc}
            alt={`${formattedH1} preview`}
            width={600}
            height={400}
            className="rounded-lg shadow-md mb-8 max-w-full h-auto"
            loading="eager"
          />

          <section aria-labelledby="about-design-heading" className="mb-8 max-w-3xl">
            <h2 id="about-design-heading" className="text-xl font-semibold text-slate-800 mb-3">
              About This Custom Memorial Design
            </h2>
            <div className="space-y-3 text-sm leading-7 text-slate-600">
              <p>
                This {categoryTitle.toLowerCase()} layout is a starting point for a personalised{' '}
                {simplifiedProduct.toLowerCase()} {productTypeDisplay.toLowerCase()}. Use it to compare the
                shape, inscription balance and decorative detail before opening the design tool for final changes.
              </p>
              <p>
                You can adjust the wording, choose memorial fonts, add or remove headstone motifs, upload photos
                where supported and review a live 3D preview before requesting a proof.
              </p>
              <p>
                Browse more{' '}
                <Link href={`/designs/${productSlug}/${category}`} className="font-medium text-slate-900 underline underline-offset-4">
                  {categoryTitle.toLowerCase()} designs
                </Link>
                , compare other{' '}
                <Link href={`/designs/${productSlug}`} className="font-medium text-slate-900 underline underline-offset-4">
                  {simplifiedProduct.toLowerCase()} templates
                </Link>
                , or read the{' '}
                <Link href="/designs/guide/buying-guide" className="font-medium text-slate-900 underline underline-offset-4">
                  memorial buying guide
                </Link>
                .
              </p>
            </div>
          </section>

          {/* Design Specifications */}
          <section aria-labelledby="specs-heading-ssr" className="mb-8">
            <h2 id="specs-heading-ssr" className="text-xl font-semibold text-slate-800 mb-4">Design Specifications</h2>
            <dl className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-sm bg-white">
              <div className="flex justify-between px-4 py-3 bg-slate-50">
                <dt className="text-slate-500 font-medium">Material</dt>
                <dd className="text-slate-900 font-semibold">{material}</dd>
              </div>
              {shapeName && (
                <div className="flex justify-between px-4 py-3">
                  <dt className="text-slate-500 font-medium">Shape</dt>
                  <dd className="text-slate-900">{shapeName}</dd>
                </div>
              )}
              <div className={`flex justify-between px-4 py-3${shapeName ? ' bg-slate-50' : ''}`}>
                <dt className="text-slate-500 font-medium">Finish</dt>
                <dd className="text-slate-900">{finish}</dd>
              </div>
              <div className={`flex justify-between px-4 py-3${shapeName ? '' : ' bg-slate-50'}`}>
                <dt className="text-slate-500 font-medium">Type</dt>
                <dd className="text-slate-900">{simplifiedProduct} {productTypeDisplay}</dd>
              </div>
              <div className={`flex justify-between px-4 py-3${shapeName ? ' bg-slate-50' : ''}`}>
                <dt className="text-slate-500 font-medium">Category</dt>
                <dd className="text-slate-900">{categoryTitle}</dd>
              </div>
              <div className={`flex justify-between px-4 py-3${shapeName ? '' : ' bg-slate-50'}`}>
                <dt className="text-slate-500 font-medium">Inscription areas</dt>
                <dd className="text-slate-900">
                  {design.inscriptionCount} text {design.inscriptionCount === 1 ? 'area' : 'areas'}
                </dd>
              </div>
              {design.hasMotifs && motifList && (
                <div className="flex justify-between px-4 py-3 bg-slate-50">
                  <dt className="text-slate-500 font-medium">Decorative motifs</dt>
                  <dd className="text-slate-900">{motifList}</dd>
                </div>
              )}
              {design.hasPhoto && (
                <div className="flex justify-between px-4 py-3">
                  <dt className="text-slate-500 font-medium">Photo portrait</dt>
                  <dd className="text-slate-900">Ceramic / enamel photo placement</dd>
                </div>
              )}
              {design.hasAdditions && (
                <div className="flex justify-between px-4 py-3 bg-slate-50">
                  <dt className="text-slate-500 font-medium">3D additions</dt>
                  <dd className="text-slate-900">Statues and vases</dd>
                </div>
              )}
              <div className="flex justify-between px-4 py-3">
                <dt className="text-slate-500 font-medium">Typical size</dt>
                <dd className="text-slate-900">
                  {design.productType === 'monument'
                    ? '900×600mm headstone + full base, ledger & kerb set'
                    : design.productType === 'plaque'
                    ? '457×305mm – 914×610mm (many standard sizes)'
                    : '600×450mm – 1800×900mm (custom sizes available)'}
                </dd>
              </div>
              <div className="flex justify-between px-4 py-3 bg-slate-50">
                <dt className="text-slate-500 font-medium">Delivery</dt>
                <dd className="text-slate-900">Included — mainland Australia</dd>
              </div>
            </dl>
          </section>

          {/* Price Guide */}
          <section aria-labelledby="price-heading-ssr" className="mb-8">
            <h2 id="price-heading-ssr" className="text-xl font-semibold text-slate-800 mb-1">Price Guide</h2>
            <p className="text-sm text-slate-500 mb-4">
              Indicative pricing in AUD inc. GST. Exact price generated in the design tool.
            </p>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-sm bg-white">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Component</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-700 w-36">Price (AUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 text-slate-700">
                      {simplifiedProduct} {productTypeDisplay}
                      {shapeName ? ` — ${shapeName} shape` : ''}
                      {', '}{material.toLowerCase()}, {finish.toLowerCase()}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900 font-medium">from ${lowPriceAud}</td>
                  </tr>
                  {design.productType === 'monument' && (
                    <tr>
                      <td className="px-4 py-3 text-slate-500 pl-8">Includes matching base, ledger slab &amp; kerb set</td>
                      <td className="px-4 py-3 text-right text-slate-500">incl.</td>
                    </tr>
                  )}
                  <tr>
                    <td className="px-4 py-3 text-slate-700">
                      Inscriptions — {design.inscriptionCount} text {design.inscriptionCount === 1 ? 'area' : 'areas'}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">priced per character</td>
                  </tr>
                  {design.hasMotifs && (
                    <tr>
                      <td className="px-4 py-3 text-slate-700">
                        Decorative motifs{motifList ? ` — ${motifList}` : ''}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">from $180 each</td>
                    </tr>
                  )}
                  {design.hasPhoto && (
                    <tr>
                      <td className="px-4 py-3 text-slate-700">Ceramic / enamel photo portrait</td>
                      <td className="px-4 py-3 text-right text-slate-500">from $350</td>
                    </tr>
                  )}
                  {design.hasAdditions && (
                    <tr>
                      <td className="px-4 py-3 text-slate-700">3D additions (statues, vases)</td>
                      <td className="px-4 py-3 text-right text-slate-500">from $75 each</td>
                    </tr>
                  )}
                  <tr>
                    <td className="px-4 py-3 text-slate-700">Design proof (before manufacture)</td>
                    <td className="px-4 py-3 text-right text-slate-500">Free</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-700">Delivery to mainland Australia</td>
                    <td className="px-4 py-3 text-right text-slate-500">Included</td>
                  </tr>
                  <tr className="bg-slate-50 border-t-2 border-slate-300">
                    <td className="px-4 py-3 text-slate-900 font-semibold">Total (indicative starting price)</td>
                    <td className="px-4 py-3 text-right text-slate-900 font-semibold">from ${lowPriceAud}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <ul className="text-slate-600 space-y-1.5 text-sm mb-8">
            <li>✓ Live 3D preview — see every change in real time</li>
            <li>✓ Unlimited revisions before you approve</li>
            <li>✓ Free digital proof before manufacturing</li>
            <li>✓ Delivery included to mainland Australia</li>
            <li>✓ Prices inc. GST — no hidden fees</li>
          </ul>

          <StartSavedDesignButton
            designId={designId}
            className="inline-block rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Personalise This Design
          </StartSavedDesignButton>
        </div>
      </div>
    </>
  );
}
