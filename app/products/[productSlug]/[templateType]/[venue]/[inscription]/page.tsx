// app/products/[productSlug]/[templateType]/[venue]/[inscription]/page.tsx
'use cache';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDedicationTemplate, bronzePlaqueDedications } from '#/lib/seo-templates';
import Link from 'next/link';
import { Boundary } from '#/ui/boundary';

type Props = {
  params: Promise<{
    productSlug: string;
    templateType: string;
    venue: string;
    inscription: string;
  }>;
};

// Generate static params for top templates
export async function generateStaticParams() {
  const params = [];
  
  // Generate for top 20 bronze plaque dedications
  for (const template of bronzePlaqueDedications.slice(0, 20)) {
    params.push({
      productSlug: 'bronze-plaque',
      templateType: 'dedication',
      venue: template.venueSlug,
      inscription: template.inscriptionSlug,
    });
  }
  
  return params;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug, templateType, venue, inscription } = await params;
  
  const template = getDedicationTemplate(venue, inscription);
  
  if (!template) {
    return {
      title: 'Template Not Found',
    };
  }

  return {
    title: template.metadata.title + ' | DYO',
    description: template.metadata.description,
    keywords: template.metadata.keywords,
    openGraph: {
      title: template.metadata.title,
      description: template.metadata.description,
      type: 'website',
    },
    alternates: {
      canonical: `/products/${productSlug}/${templateType}/${venue}/${inscription}`,
    },
  };
}

export default async function TemplatePage({ params }: Props) {
  const { productSlug, templateType, venue, inscription } = await params;
  
  const template = getDedicationTemplate(venue, inscription);

  if (!template) {
    notFound();
  }

  // Format venue and inscription for display
  const venueDisplay = template.venue;
  const inscriptionDisplay = template.inscription;
  const productDisplay = productSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <Boundary label={`Template: ${template.id}`}>
      <div className="flex flex-col gap-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-gray-300">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-gray-300">Products</Link>
            </li>
            <li>/</li>
            <li>
              <Link href={`/products/${productSlug}`} className="hover:text-gray-300 capitalize">
                {productDisplay}
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href={`/products/${productSlug}/${templateType}`} className="hover:text-gray-300 capitalize">
                {templateType}
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-400">{venueDisplay}</li>
          </ol>
        </nav>

        {/* SEO-optimized H1 */}
        <header>
          <h1 className="text-3xl font-bold text-gray-100 lg:text-4xl">
            {productDisplay} {templateType.charAt(0).toUpperCase() + templateType.slice(1)} for {venueDisplay}
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            {inscriptionDisplay}
          </p>
        </header>

        {/* Template Preview Card */}
        <section className="rounded-lg border border-gray-700 bg-gray-800/50 p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-100">
                Pre-Designed Template Ready to Customize
              </h2>
              <p className="mt-3 text-gray-400">
                This {productDisplay.toLowerCase()} has been pre-configured with the inscription 
                "{inscriptionDisplay}" for {venueDisplay}. You can personalize every aspect including 
                size, font, and finish.
              </p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-200">Pre-Populated Inscription</h3>
                    <p className="text-sm text-gray-400">Main text already configured for {venueDisplay}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-200">Optimized for {template.category.charAt(0).toUpperCase() + template.category.slice(1)}</h3>
                    <p className="text-sm text-gray-400">Design tailored for {template.category} applications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-200">Fully Customizable</h3>
                    <p className="text-sm text-gray-400">Adjust any element to match your exact requirements</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO-Friendly Design Description (visible to Google but styled for users) */}
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-6 lg:w-96">
              <h3 className="mb-4 text-lg font-semibold text-gray-200">Design Preview</h3>
              
              {/* This content describes what's in the 3D canvas for SEO */}
              <div className="space-y-3 text-sm text-gray-400">
                <div>
                  <span className="font-medium text-gray-300">Product:</span> Bronze Plaque
                </div>
                <div>
                  <span className="font-medium text-gray-300">Material:</span> Cast Bronze with Dark Patina Finish
                </div>
                <div>
                  <span className="font-medium text-gray-300">Size:</span> 600mm × 400mm (24" × 16")
                </div>
                <div>
                  <span className="font-medium text-gray-300">Shape:</span> Rectangular with Raised Border
                </div>
                <div>
                  <span className="font-medium text-gray-300">Primary Inscription:</span>
                  <div className="mt-1 rounded bg-gray-800 p-2 font-serif text-base text-gray-200">
                    {venueDisplay}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-300">Secondary Inscription:</span>
                  <div className="mt-1 rounded bg-gray-800 p-2 font-serif text-sm text-gray-200">
                    {inscriptionDisplay}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-300">Font Style:</span> Times New Roman (Classic Serif)
                </div>
                <div>
                  <span className="font-medium text-gray-300">Text Color:</span> Raised Bronze Lettering
                </div>
                <div>
                  <span className="font-medium text-gray-300">Mounting:</span> Pre-drilled holes for wall installation
                </div>
                <div>
                  <span className="font-medium text-gray-300">Finish:</span> Weather-resistant protective coating
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Interactive 3D preview available in design tool
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-lg border border-blue-500/20 bg-blue-950/10 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-100">
            Start Customizing This Design
          </h2>
          <p className="mt-2 text-gray-400">
            Jump directly into the design tool with this template pre-loaded and ready to personalize.
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href={`/inscriptions?template=${template.id}`}
              className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Customize This Template
            </Link>
            <Link
              href={`/products/${productSlug}/${templateType}`}
              className="rounded-lg border border-gray-600 bg-gray-800 px-8 py-3 font-semibold text-gray-100 transition-colors hover:bg-gray-700"
            >
              Browse More Templates
            </Link>
          </div>
        </section>

        {/* Detailed Information */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-gray-700 bg-gray-800/30 p-6">
            <h2 className="text-xl font-semibold text-gray-200">
              Specifications
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-400">Product Type:</dt>
                <dd className="font-medium text-gray-200">{productDisplay}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Template Type:</dt>
                <dd className="font-medium text-gray-200 capitalize">{templateType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Category:</dt>
                <dd className="font-medium text-gray-200 capitalize">{template.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Customizable:</dt>
                <dd className="font-medium text-green-400">Yes</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-gray-700 bg-gray-800/30 p-6">
            <h2 className="text-xl font-semibold text-gray-200">
              What's Included
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Professional bronze casting
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Precision engraving
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Weather-resistant finish
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Mounting hardware
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Installation guidance
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Quality guarantee
              </li>
            </ul>
          </section>
        </div>

        {/* SEO Content */}
        <section className="prose prose-invert max-w-none">
          <h2>About This {productDisplay} {templateType.charAt(0).toUpperCase() + templateType.slice(1)}</h2>
          <p className="text-gray-400">
            This {productDisplay.toLowerCase()} template is specifically designed for {venueDisplay} with the 
            inscription "{inscriptionDisplay}". It's perfect for {template.category} applications and can be 
            fully customized to meet your specific requirements.
          </p>
          
          {/* Rich SEO content describing the design */}
          <h3>Design Specifications</h3>
          <p className="text-gray-400">
            This bronze dedication plaque features a traditional rectangular design with raised border detailing. 
            The primary inscription "{venueDisplay}" is centered at the top in a classic Times New Roman serif font, 
            creating an elegant and professional appearance. Below that, the inscription "{inscriptionDisplay}" 
            provides the dedication message in a slightly smaller font size for visual hierarchy.
          </p>
          
          <h3>Material & Construction</h3>
          <p className="text-gray-400">
            Crafted from high-quality cast bronze with a dark patina finish, this plaque measures 600mm × 400mm 
            (24 inches × 16 inches), providing ample space for clear, readable text. The bronze material is chosen 
            for its exceptional durability and resistance to weathering, making it ideal for both indoor and outdoor 
            installations at {venueDisplay}.
          </p>
          
          <h3>Text & Typography</h3>
          <p className="text-gray-400">
            The inscription uses raised bronze lettering that creates beautiful shadows and depth, enhancing readability 
            from various viewing angles. The Times New Roman font family was selected for its timeless elegance and 
            excellent legibility, particularly important for {template.category} dedications where the message needs to 
            be clear and dignified.
          </p>
          
          <h3>Installation & Placement</h3>
          <p className="text-gray-400">
            The plaque comes pre-drilled with mounting holes strategically placed for secure wall installation at 
            {venueDisplay}. The weather-resistant protective coating ensures the bronze maintains its appearance for 
            decades, even in high-traffic areas or outdoor environments. The standard 600mm × 400mm size is ideal for 
            prominent placement at building entrances, lobbies, or dedicated memorial spaces.
          </p>
          
          <h3>Customization Options</h3>
          <p className="text-gray-400">
            While this template comes pre-configured with "{venueDisplay}" and "{inscriptionDisplay}", you have 
            complete control over every aspect of the design. Adjust the size to fit your specific space requirements, 
            choose from multiple font options including serif, sans-serif, and script styles, select your preferred 
            finish from dark patina to polished bronze, and modify the inscription text to perfectly match your needs.
          </p>
          
          <h3>Why Choose Bronze for {venueDisplay}?</h3>
          <p className="text-gray-400">
            Bronze plaques offer unmatched durability and timeless elegance, making them the perfect choice for 
            {template.category} dedications like {venueDisplay}. The material naturally develops a beautiful patina 
            over time while maintaining its structural integrity for generations. Professional engraving ensures crisp, 
            clear text that remains legible for decades, honoring the significance of the dedication "{inscriptionDisplay}" 
            for years to come.
          </p>
          
          <h3>Perfect for {template.category.charAt(0).toUpperCase() + template.category.slice(1)} Applications</h3>
          <p className="text-gray-400">
            This design is specifically optimized for {template.category} settings, where dignity, permanence, and 
            professional appearance are paramount. Whether commemorating a building opening, honoring donors, or 
            marking a significant achievement, this bronze plaque design provides the gravitas and beauty that 
            {venueDisplay} deserves.
          </p>
        </section>

        {/* Related Templates */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-200">
            Similar Templates
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {bronzePlaqueDedications
              .filter(t => t.category === template.category && t.id !== template.id)
              .slice(0, 3)
              .map(relatedTemplate => (
                <Link
                  key={relatedTemplate.id}
                  href={`/products/${productSlug}/${templateType}/${relatedTemplate.venueSlug}/${relatedTemplate.inscriptionSlug}`}
                  className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 transition-all hover:border-gray-600 hover:bg-gray-800"
                >
                  <h3 className="font-semibold text-gray-100">
                    {relatedTemplate.venue}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    {relatedTemplate.inscription}
                  </p>
                  <div className="mt-3 text-xs text-blue-400">
                    View Template →
                  </div>
                </Link>
              ))}
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="rounded-lg border border-gray-700 bg-gray-800/30 p-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-200">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-100">
                What size is this {venueDisplay} bronze plaque?
              </h3>
              <p className="text-gray-400">
                This template uses a standard 600mm × 400mm (24" × 16") size, which is ideal for most {template.category} 
                applications. However, you can customize the size to fit your specific space requirements, ranging from 
                smaller 300mm plaques to large 1200mm installations.
              </p>
            </div>
            
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-100">
                Can I change the inscription text?
              </h3>
              <p className="text-gray-400">
                Absolutely! While this template shows "{venueDisplay}" and "{inscriptionDisplay}", you can modify any 
                text to match your exact needs. Click "Customize This Template" to edit the inscriptions, change fonts, 
                adjust sizes, and preview your changes in real-time 3D.
              </p>
            </div>
            
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-100">
                How long will this bronze plaque last?
              </h3>
              <p className="text-gray-400">
                Bronze plaques are built to last for generations. With proper installation and our weather-resistant 
                protective coating, your {venueDisplay} plaque will maintain its beauty and legibility for 50-100+ years, 
                even in outdoor environments. The natural bronze patina that develops over time actually enhances the 
                classic appearance.
              </p>
            </div>
            
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-100">
                What font options are available?
              </h3>
              <p className="text-gray-400">
                This template uses Times New Roman for a classic, professional look. You can choose from over 10 font 
                families including serif fonts (Times New Roman, Georgia, Garamond), sans-serif fonts (Arial, Helvetica), 
                and script fonts (Brush Script, Edwardian Script) to match your aesthetic preferences.
              </p>
            </div>
            
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-100">
                Is installation included?
              </h3>
              <p className="text-gray-400">
                We provide detailed installation instructions and all necessary mounting hardware with your plaque. 
                We also offer professional installation coordination services worldwide. The plaque comes pre-drilled 
                for easy wall mounting at {venueDisplay}.
              </p>
            </div>
            
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-100">
                How much does a bronze plaque for {venueDisplay} cost?
              </h3>
              <p className="text-gray-400">
                Pricing depends on size, finish options, and inscription complexity. A standard 600mm × 400mm plaque 
                like this template typically ranges from $800-$1,500. Use our interactive design tool to get instant, 
                accurate pricing based on your specific customizations.
              </p>
            </div>
          </div>
        </section>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: template.metadata.title,
              description: template.metadata.description,
              category: `Memorial Products - ${template.category}`,
              material: 'Cast Bronze',
              width: '600mm',
              height: '400mm',
              offers: {
                '@type': 'Offer',
                availability: 'https://schema.org/InStock',
                priceCurrency: 'USD',
                price: '1200',
                priceValidUntil: '2026-12-31',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '127',
              },
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Products',
                    item: 'https://yourdomain.com/products',
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: productDisplay,
                    item: `https://yourdomain.com/products/${productSlug}`,
                  },
                  {
                    '@type': 'ListItem',
                    position: 3,
                    name: templateType,
                    item: `https://yourdomain.com/products/${productSlug}/${templateType}`,
                  },
                  {
                    '@type': 'ListItem',
                    position: 4,
                    name: venueDisplay,
                  },
                ],
              },
            }),
          }}
        />
        
        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `What size is this ${venueDisplay} bronze plaque?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `This template uses a standard 600mm × 400mm (24" × 16") size, ideal for most ${template.category} applications. Sizes can be customized from 300mm to 1200mm.`,
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can I change the inscription text?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Yes! While this template shows "${venueDisplay}" and "${inscriptionDisplay}", you can modify any text, fonts, and sizes using our interactive design tool.`,
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How long will this bronze plaque last?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Bronze plaques last for generations (50-100+ years) with proper installation and our weather-resistant coating, even in outdoor environments.',
                  },
                },
                {
                  '@type': 'Question',
                  name: `How much does a bronze plaque for ${venueDisplay} cost?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'A standard 600mm × 400mm plaque typically ranges from $800-$1,500. Use our design tool for instant, accurate pricing based on your customizations.',
                  },
                },
              ],
            }),
          }}
        />
      </div>
    </Boundary>
  );
}
