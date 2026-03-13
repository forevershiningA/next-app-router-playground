// app/products/[productSlug]/page.tsx
'use cache';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productSEOData, type ProductSEO } from '#/lib/seo-templates';
import Link from 'next/link';
import { Boundary } from '#/ui/boundary';

type Props = {
  params: Promise<{ productSlug: string }>;
};

// Generate static params for all products
export async function generateStaticParams() {
  return Object.keys(productSEOData).map(slug => ({
    productSlug: slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const seoData = productSEOData[productSlug];
  
  if (!seoData) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: seoData.metaTitle,
    description: seoData.metaDescription,
    keywords: seoData.keywords,
    openGraph: {
      title: seoData.metaTitle,
      description: seoData.metaDescription,
      type: 'website',
    },
    alternates: {
      canonical: `/products/${productSlug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { productSlug } = await params;
  const seoData: ProductSEO = productSEOData[productSlug];

  if (!seoData) {
    notFound();
  }

  return (
    <Boundary label={`Product: ${productSlug}`}>
      <div className="flex flex-col gap-8">
        {/* SEO-optimized H1 */}
        <header>
          <h1 className="text-3xl font-bold text-gray-100 lg:text-4xl">
            {seoData.h1}
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            {seoData.metaDescription}
          </p>
        </header>

        {/* Featured Keywords */}
        <div className="flex flex-wrap gap-2">
          {seoData.featuredKeywords.map(keyword => (
            <span
              key={keyword}
              className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* Template Types */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-200">
            {seoData.h2}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {seoData.templateTypes.map(templateType => (
              <Link
                key={templateType}
                href={`/products/${productSlug}/${templateType}`}
                className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 transition-all hover:border-gray-600 hover:bg-gray-800"
              >
                <h3 className="text-lg font-semibold capitalize text-gray-100">
                  {templateType} Templates
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Browse {templateType} designs and templates
                </p>
                <div className="mt-4 text-sm font-medium text-blue-400">
                  Explore {templateType}s →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-200">
            Popular Use Cases
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {seoData.useCases.map(useCase => (
              <div
                key={useCase.slug}
                className="rounded-lg border border-gray-700 bg-gray-800/50 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-100">
                  {useCase.name}
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  {useCase.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {useCase.keywords.slice(0, 3).map(keyword => (
                    <span
                      key={keyword}
                      className="text-xs text-gray-500"
                    >
                      #{keyword.replace(/\s+/g, '')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-lg border border-blue-500/20 bg-blue-950/10 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-100">
            Start Designing Your Custom {seoData.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </h2>
          <p className="mt-2 text-gray-400">
            Use our interactive 3D design tool to create the perfect memorial or dedication.
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href={`/select-shape`}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Start Design Process
            </Link>
            <Link
              href={`/products/${productSlug}/dedication`}
              className="rounded-lg border border-gray-600 bg-gray-800 px-6 py-3 font-semibold text-gray-100 transition-colors hover:bg-gray-700"
            >
              Browse Templates
            </Link>
          </div>
        </section>

        {/* SEO Content */}
        <section className="prose prose-invert max-w-none">
          <h2>About {seoData.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h2>
          <p className="text-gray-400">
            Our {seoData.slug.split('-').join(' ')} are crafted with precision and care, designed to create
            lasting memorials and dedications. Using the finest materials and professional engraving techniques,
            we ensure your tribute stands the test of time.
          </p>
          <h3>Features & Benefits</h3>
          <ul className="text-gray-400">
            <li>Professional quality engraving and craftsmanship</li>
            <li>Worldwide shipping and installation services</li>
            <li>Interactive 3D design preview</li>
            <li>Custom sizes and shapes available</li>
            <li>Premium materials built to last</li>
            <li>Instant pricing calculator</li>
          </ul>
          <h3>Design Process</h3>
          <p className="text-gray-400">
            Creating your custom {seoData.slug.split('-').join(' ')} is simple. Choose from our templates
            or start from scratch using our interactive design tool. Preview your design in 3D, make adjustments
            in real-time, and get instant pricing. When you're satisfied, place your order and we'll handle the rest.
          </p>
        </section>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: seoData.h1,
              description: seoData.metaDescription,
              category: 'Memorial Products',
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
            }),
          }}
        />
      </div>
    </Boundary>
  );
}
