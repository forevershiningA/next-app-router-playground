import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms and conditions for ordering custom memorial products from Forever Shining.',
  alternates: { canonical: '/terms' },
};

const sections = [
  {
    title: '1. About these terms',
    paragraphs: [
      'These Terms & Conditions apply when you use the Forever Shining website, request a design or quotation, or place an order for a memorial product. By approving a proof or placing an order, you confirm that you have reviewed and accepted these terms.',
      'A quotation or order confirmation may contain product-specific conditions. If those conditions conflict with this page, the conditions in the accepted quotation or order confirmation take precedence for that order.',
    ],
  },
  {
    title: '2. Designs, proofs and customer approval',
    paragraphs: [
      'The online designer is a visual aid. Screen colors, material patterns, scale and three-dimensional previews are illustrative and may differ from the finished product. Natural stone and other materials can vary in color, grain and texture.',
      'You are responsible for checking all names, dates, spelling, dimensions, artwork, photographs, layout and installation requirements before approving a proof. Production begins only after any required approval and payment have been received.',
    ],
  },
  {
    title: '3. Prices and payment',
    paragraphs: [
      'Prices displayed online are estimates until confirmed in writing. The final quotation will identify the applicable currency, taxes, shipping, installation and any additional work. Payment must be made using an accepted payment method and may be subject to fraud-prevention checks.',
      'We may correct an obvious pricing or specification error before accepting an order. If payment has already been collected, you may accept the corrected order or receive a refund of the affected payment.',
    ],
  },
  {
    title: '4. Custom products, changes and cancellations',
    paragraphs: [
      'Most memorial products are personalized and made to order. Changes or cancellations requested after proof approval or production has started may not be possible and may incur costs already committed for design, materials, manufacturing or shipping.',
      'Contact us as soon as possible if you need to change or cancel an order. We will explain which work has begun and whether any refund or credit is available. Nothing in these terms limits rights that cannot lawfully be excluded.',
    ],
  },
  {
    title: '5. Production and delivery',
    paragraphs: [
      'Production and delivery dates are estimates unless we expressly confirm a guaranteed date in writing. Delays can arise from proof revisions, material availability, carrier disruption, customs, weather or cemetery approvals.',
      'You must provide a complete delivery address and tell us about access restrictions. Inspect the shipment promptly. Record visible damage on the carrier documentation, keep the packaging, take photographs and contact us as soon as reasonably possible.',
    ],
  },
  {
    title: '6. Installation and cemetery requirements',
    paragraphs: [
      'Cemeteries and local authorities may impose rules concerning size, material, foundations, permits and installation. Unless installation or approval services are expressly included in your quotation, you are responsible for confirming those requirements before ordering and for arranging a qualified installer.',
      'We are not responsible for refusal or additional costs caused by requirements that were not supplied to us before production. Dimensions should be independently checked where a product must fit an existing foundation, recess or structure.',
    ],
  },
  {
    title: '7. Quality issues and warranty claims',
    paragraphs: [
      'If you believe a product is defective or does not match the approved specification, contact us promptly with the order number, a description of the issue and clear photographs. Do not install, alter or discard the product until we have reviewed the claim.',
      'A confirmed remedy may include repair, replacement, re-performance or refund, depending on the issue and applicable law. Normal material variation, expected weathering, customer-supplied errors, improper handling or installation, and damage caused after delivery are not manufacturing defects.',
    ],
  },
  {
    title: '8. Customer content and intellectual property',
    paragraphs: [
      'You confirm that you have permission to use every photograph, inscription, logo and artwork you submit. You grant us permission to reproduce that content only as needed to prepare, manufacture and support your order.',
      'The website, software, product imagery and original design assets remain the property of their respective owners and may not be copied or commercially reused without permission.',
    ],
  },
  {
    title: '9. Website availability and liability',
    paragraphs: [
      'We work to keep the website and designer accurate and available, but do not guarantee uninterrupted or error-free operation. Save important order information and rely on the specifications in your confirmed quotation and approved proof.',
      'To the extent permitted by law, neither party is liable for indirect or consequential loss. Our liability is not excluded where exclusion is prohibited, including liability arising from fraud, willful misconduct or non-excludable consumer rights.',
    ],
  },
  {
    title: '10. Privacy, contact and updates',
    paragraphs: [
      'Our Privacy Policy explains how personal information is handled. Questions about these terms or an order can be sent using the contact details displayed on this website or included in your quotation or order confirmation.',
      'We may update these terms for future orders. The version published when your order is accepted applies to that order. These terms were last updated on October 12, 2026.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="day:bg-stone-100 day:text-gray-900 relative min-h-screen bg-[#050301] text-[#E5E5EA]">
      <div
        className="day:hidden pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.18),_transparent_40%)]"
        aria-hidden
      />
      <main className="relative mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <Link
          href="/"
          className="day:text-gray-500 day:hover:text-gray-900 mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to home
        </Link>

        <article className="day:border-gray-200 day:bg-white day:shadow-lg rounded-2xl border border-white/10 bg-[#0c0805]/85 px-4 pt-6 pb-20 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:rounded-[32px] sm:px-6 lg:px-10 lg:pt-8">
          <header className="day:border-gray-200 mb-8 border-b border-white/10 pb-6">
            <p className="day:text-amber-700 mb-2 text-sm font-semibold tracking-[0.16em] text-[#D4A84F] uppercase">
              Forever Shining
            </p>
            <h1 className="day:text-gray-900 text-3xl font-semibold tracking-tight sm:text-4xl">
              Terms &amp; Conditions
            </h1>
            <p className="day:text-gray-500 mt-3 text-sm text-white/55">
              Last updated October 12, 2026
            </p>
          </header>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="day:text-gray-900 text-xl font-semibold text-[#F2F2F7]">
                  {section.title}
                </h2>
                <div className="day:text-gray-600 mt-3 space-y-3 leading-relaxed text-[#D1D1D6]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <footer className="day:border-gray-200 day:text-gray-600 mt-10 border-t border-white/10 pt-6 text-sm text-white/65">
            Read our{' '}
            <Link
              href="/privacy"
              className="day:text-amber-700 text-[#D4A84F] hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </footer>
        </article>
      </main>
    </div>
  );
}
