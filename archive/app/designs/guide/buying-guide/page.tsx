import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Memorial Buying Guide | Forever Shining',
  description: 'Complete guide to ordering your memorial online. From design to delivery, understand the entire process.',
};

export default function BuyingGuide() {
  return (
    <div className="min-h-screen bg-white relative z-10">
      <div className="container mx-auto px-8 py-12 max-w-4xl relative">
        <nav className="mb-8">
          <Link href="/designs" className="text-slate-600 hover:text-slate-900 font-light">
            ← Back to Designs
          </Link>
        </nav>

        <h1 className="text-4xl font-serif font-light text-slate-900 mb-6">
          Memorial Buying Guide
        </h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-700 font-light leading-relaxed mb-8">
            Ordering a memorial online is straightforward with our step-by-step process. 
            Here's everything you need to know from design to installation.
          </p>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            Step 1: Design Your Memorial
          </h2>
          <p className="text-slate-700 font-light mb-4">
            Browse our design templates or start from scratch. Use our interactive tool to:
          </p>
          <ul className="list-disc pl-6 text-slate-700 font-light space-y-2">
            <li>Select your preferred shape and material</li>
            <li>Add personalized inscriptions and verses</li>
            <li>Choose from thousands of motifs</li>
            <li>Upload photos for laser-etching or ceramic overlay</li>
            <li>See real-time pricing as you customize</li>
          </ul>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            Step 2: Review and Approve Proofs
          </h2>
          <p className="text-slate-700 font-light mb-4">
            After you place your order, we create detailed digital proofs for your approval. 
            You can request unlimited revisions until you're completely satisfied with the design.
          </p>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            Step 3: Manufacturing
          </h2>
          <p className="text-slate-700 font-light mb-4">
            Once you approve the final design, we begin manufacturing your memorial. Production times:
          </p>
          <ul className="list-disc pl-6 text-slate-700 font-light space-y-2">
            <li>Laser-etched granite: 2-3 weeks (express 1-week available)</li>
            <li>Bronze plaques: 6-8 weeks</li>
            <li>Traditional engraved: 8-15 weeks</li>
          </ul>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            Step 4: Delivery and Installation
          </h2>
          <p className="text-slate-700 font-light mb-4">
            Delivery is included in the price. For heavy headstones, we deliver to a shipping 
            depot for collection. Professional installation can be arranged through our network 
            of certified installers.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-xl font-serif font-light text-slate-900 mb-3">
                10-Year Warranty
              </h3>
              <p className="text-slate-700 font-light text-sm">
                All memorials include a comprehensive 10-year manufacturer warranty 
                covering defects in materials and workmanship.
              </p>
            </div>

            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-xl font-serif font-light text-slate-900 mb-3">
                Secure Payment
              </h3>
              <p className="text-slate-700 font-light text-sm">
                We accept all major credit cards and offer secure payment processing. 
                Payment plans available for larger orders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
