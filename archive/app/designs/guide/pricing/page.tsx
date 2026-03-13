import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Memorial Pricing Guide | Forever Shining',
  description: 'Transparent pricing for headstones, plaques, and memorials. Understand what\'s included and how customization affects cost.',
};

export default function PricingGuide() {
  return (
    <div className="min-h-screen bg-white relative z-10">
      <div className="container mx-auto px-8 py-12 max-w-4xl relative">
        <nav className="mb-8">
          <Link href="/designs" className="text-slate-600 hover:text-slate-900 font-light">
            ← Back to Designs
          </Link>
        </nav>

        <h1 className="text-4xl font-serif font-light text-slate-900 mb-6">
          Memorial Pricing Guide
        </h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-700 font-light leading-relaxed mb-8">
            We believe in transparent pricing. Understand exactly what you're paying for and 
            what's included with your memorial purchase.
          </p>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            What's Included
          </h2>
          <ul className="list-disc pl-6 text-slate-700 font-light space-y-2">
            <li>Professional design consultation and unlimited revisions</li>
            <li>High-quality materials (granite, bronze, or stainless steel)</li>
            <li>Inscriptions in your choice of fonts at no additional cost</li>
            <li>First motif free (laser-etched products)</li>
            <li>Delivery to mainland Australia or continental US</li>
            <li>10-year manufacturer warranty</li>
          </ul>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            Factors Affecting Price
          </h2>
          <p className="text-slate-700 font-light mb-4">
            Memorial pricing varies based on several factors:
          </p>
          <ul className="list-disc pl-6 text-slate-700 font-light space-y-2">
            <li><strong>Size:</strong> Larger memorials require more material and processing time</li>
            <li><strong>Material:</strong> Laser-etched granite, bronze, and traditional engraving have different costs</li>
            <li><strong>Customization:</strong> Additional motifs, photos, and complex designs may add to the cost</li>
            <li><strong>Finish:</strong> Polished edges, borders, and special finishes affect pricing</li>
          </ul>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            Get an Instant Quote
          </h2>
          <p className="text-slate-700 font-light mb-4">
            Use our online design tool to see real-time pricing as you customize your memorial. 
            The price updates automatically as you add features, so there are no surprises.
          </p>

          <div className="mt-12 p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-xl font-serif font-light text-slate-900 mb-3">
              Price Match Guarantee
            </h3>
            <p className="text-slate-700 font-light">
              We offer competitive pricing and a price match guarantee. Contact us if you find 
              a comparable memorial for less.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
