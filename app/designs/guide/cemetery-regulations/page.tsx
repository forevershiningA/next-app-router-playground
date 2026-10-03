import Link from 'next/link';
import { GuideStructuredData, guideMetadata } from '../_seo';

const seo = {
  slug: 'cemetery-regulations',
  title: 'Cemetery Regulations Guide | Forever Shining',
  description: 'Understand cemetery headstone and grave marker regulations in the United States, including size, material, foundation and installation requirements.',
};

export const metadata = guideMetadata(seo);

export default function CemeteryRegulationsGuide() {
  return (
    <div className="min-h-screen bg-white relative z-10">
      <GuideStructuredData {...seo} />
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
            United States Cemetery Requirements
          </h2>
          <p className="text-slate-700 font-light mb-4">
            Cemetery rules in the United States vary by state, cemetery, section and plot. Before
            choosing a headstone or grave marker, ask the cemetery for its current written rules.
            Common requirements include:
          </p>
          <ul className="list-disc pl-6 text-slate-700 font-light space-y-2">
            <li>Maximum height, width and thickness for the plot</li>
            <li>Upright monument or flat grave marker restrictions by section</li>
            <li>Required granite, bronze or other approved materials</li>
            <li>Foundation specifications and approved installation methods</li>
            <li>Application, permit and installer requirements</li>
          </ul>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            Preparing a Design for Approval
          </h2>
          <p className="text-slate-700 font-light mb-4">
            A digital design is a useful starting point, but the cemetery must approve the final
            dimensions, material and installation plan. Keep these details ready when requesting approval:
          </p>
          <ul className="list-disc pl-6 text-slate-700 font-light space-y-2">
            <li>The cemetery name, city, state and plot section</li>
            <li>Memorial dimensions in inches</li>
            <li>Material, finish, base and foundation details</li>
            <li>Inscription, emblem and photo placement</li>
            <li>The cemetery's approved installer requirements</li>
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
