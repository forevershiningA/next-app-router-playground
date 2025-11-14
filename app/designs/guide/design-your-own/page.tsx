import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Design Your Own Memorial Guide | Forever Shining',
  description: 'Learn how to use our online design tool to create a personalized memorial. Step-by-step guide to customizing headstones and plaques.',
};

export default function DesignYourOwnGuide() {
  return (
    <div className="min-h-screen bg-white relative z-10">
      <div className="container mx-auto px-8 py-12 max-w-4xl relative">
        <nav className="mb-8">
          <Link href="/designs" className="text-slate-600 hover:text-slate-900 font-light">
            ← Back to Designs
          </Link>
        </nav>

        <h1 className="text-4xl font-serif font-light text-slate-900 mb-6">
          Design Your Own Memorial Guide
        </h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-700 font-light leading-relaxed mb-8">
            Our interactive design tool makes it easy to create a personalized memorial online. 
            Follow this step-by-step guide to customize your headstone or plaque with inscriptions, 
            motifs, and photos.
          </p>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            Getting Started
          </h2>
          <p className="text-slate-700 font-light mb-4">
            Begin by choosing a design template that matches your preferences. You can select from 
            various shapes, materials, and themes including mother memorials, religious designs, and more.
          </p>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            Customization Features
          </h2>
          <ul className="list-disc pl-6 text-slate-700 font-light space-y-2">
            <li>Add and edit inscriptions with 10+ professional fonts</li>
            <li>Choose from over 5,000 motifs including religious symbols, flora, and fauna</li>
            <li>Upload and position photos with laser-etching or ceramic overlay options</li>
            <li>Adjust sizes, colors, and positioning with real-time preview</li>
            <li>Save designs and return to edit later</li>
          </ul>

          <h2 className="text-2xl font-serif font-light text-slate-900 mt-12 mb-4">
            Live Preview
          </h2>
          <p className="text-slate-700 font-light mb-4">
            As you customize your memorial, you'll see changes immediately in our interactive preview. 
            This ensures your design looks exactly as you envision before ordering.
          </p>

          <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-xl font-serif font-light text-slate-900 mb-3">
              Need Help?
            </h3>
            <p className="text-slate-700 font-light">
              Our design team is here to assist you. Contact us for personalized guidance on 
              creating the perfect memorial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
