import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms and conditions for ordering custom memorial products from Forever Shining.',
  alternates: { canonical: 'https://forevershining.org/terms' },
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
    <div className="min-h-screen bg-[#0c0b0a] text-white day:bg-[#f7f4ee] day:text-[#1a1714]">
      {/* Studio Header */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#161412] day:border-[#dfd7ca] day:bg-[#f5f1e8]">
        <div className="absolute inset-0 bg-radial-gradient-to-r from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#c49a45]/35 bg-[#c49a45]/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-[#c49a45] uppercase day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#78541c]">
                Legal &amp; Compliance · Terms
              </div>
              <h1 className="font-serif text-3xl font-normal tracking-tight text-white day:text-[#1a1714] sm:text-4xl lg:text-[40px]">
                Terms &amp; Conditions
              </h1>
              <p className="mt-2 text-sm text-stone-300 day:text-[#5a5248]">
                Last updated October 12, 2026 · Ordering custom memorial products from Forever Shining
              </p>
            </div>
            <Link
              href="/my-account"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/10 day:border-[#dfd7ca] day:bg-[#eee8dc]/70 day:text-[#1a1714] day:hover:bg-[#e7e0d2]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 pt-6 pb-20 md:px-6 md:pt-8 lg:px-8">
        <article className="rounded-xl border border-white/10 bg-[#161412] p-6 day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)] sm:p-10">
          <div className="divide-y divide-white/10 day:divide-[#dfd7ca]">
            {sections.map((section, index) => (
              <section key={section.title} className={`py-6 ${index === 0 ? 'pt-0' : ''} last:pb-0`}>
                <h2 className="font-serif text-lg font-normal text-[#c49a45] day:text-[#9a742f]">
                  {section.title}
                </h2>
                <div className="mt-2 space-y-3 text-sm leading-relaxed text-stone-300 day:text-[#5a5248]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <footer className="mt-8 border-t border-white/10 pt-6 text-sm text-stone-400 day:border-[#dfd7ca] day:text-[#786e61]">
            Read our{' '}
            <Link
              href="/privacy"
              className="text-[#c49a45] underline decoration-[#c49a45]/40 underline-offset-2 transition hover:text-[#d5ad55] day:text-[#9a742f] day:decoration-[#9a742f]/40 day:hover:text-[#78541c]"
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
