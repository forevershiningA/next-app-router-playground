import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cemetery Regulations Guide | Forever Shining',
  description: 'Understand cemetery memorial regulations in Australia and the United States. Size restrictions, material requirements, and compliance information.',
};

export default function CemeteryRegulationsGuide() {
  return (
    <div className="min-h-screen bg-white relative z-10">
      <div className="container mx-auto px-8 py-12 max-w-4xl relative">
        <nav className="mb-8">
          <Link href="/designs" className="text-slate-600 hover:text-slate-900 font-light">
            ← Back to Designs
          </Link>
        </nav>

        <h1 className="text-4xl font-serif font-light text-slate-900 mb-6">
          Cemetery Regulations Guide
        </h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-700 font-light leading-relaxed mb-8">
            Cemetery regulations vary by location and individual cemetery. This guide helps you 
            understand common requirements and ensure your memorial meets local standards.
          </p>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            Australian Cemetery Compliance
          </h2>
          <p className="text-slate-700 font-light mb-4">
            Most Australian cemeteries require memorials to be made of durable materials like 
            granite or bronze with specific size restrictions varying by cemetery. Common requirements include:
          </p>
          <ul className="list-disc pl-6 text-slate-700 font-light space-y-2">
            <li>Height restrictions typically between 600mm and 1200mm</li>
            <li>Width restrictions based on plot size and cemetery section</li>
            <li>Thickness requirements for structural stability</li>
            <li>Foundation or base installation requirements</li>
            <li>Approved materials (usually granite, marble, or bronze)</li>
          </ul>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            United States Cemetery Compliance
          </h2>
          <p className="text-slate-700 font-light mb-4">
            Cemetery regulations in the United States vary significantly by state and individual 
            cemetery. Common requirements include:
          </p>
          <ul className="list-disc pl-6 text-slate-700 font-light space-y-2">
            <li>Maximum height and width dimensions</li>
            <li>Foundation specifications and installation methods</li>
            <li>Material approvals (granite, bronze, marble typically accepted)</li>
            <li>Inscription content guidelines</li>
            <li>Installation timeline requirements</li>
          </ul>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            Before You Order
          </h2>
          <p className="text-slate-700 font-light mb-4">
            We strongly recommend checking with your local cemetery office before finalizing 
            your memorial design. Ask about:
          </p>
          <ul className="list-disc pl-6 text-slate-700 font-light space-y-2">
            <li>Specific dimension requirements for your plot</li>
            <li>Approved materials and finishes</li>
            <li>Foundation and installation procedures</li>
            <li>Inscription content restrictions (if any)</li>
            <li>Timeline for installation permissions</li>
          </ul>

          <div className="mt-12 p-6 bg-amber-50 rounded-lg border border-amber-200">
            <h3 className="text-xl font-serif font-light text-slate-900 mb-3">
              We're Here to Help
            </h3>
            <p className="text-slate-700 font-light">
              Our team has extensive experience with cemetery regulations across multiple 
              jurisdictions. We can help ensure your memorial meets all local requirements. 
              Contact us with your cemetery information for personalized guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
