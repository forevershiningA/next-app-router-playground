import type { Metadata } from 'next';
import Link from 'next/link';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import MemorialPublicHeader from '#/components/MemorialPublicHeader';
import HomeFooter from '#/app/_ui/HomeFooter';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Memorial Specialists | Forever Shining',
  description:
    'Contact Forever Shining for compassionate guidance choosing a memorial, personalizing a design, cemetery permits, or pricing. Speak with our teams in North America and Australia.',
  alternates: { canonical: 'https://forevershining.org/contact' },
  openGraph: {
    title: 'Contact Memorial Specialists | Forever Shining',
    description:
      'Personal, no-pressure guidance with your memorial, from 3D design to cemetery delivery.',
    url: 'https://forevershining.org/contact',
    type: 'website',
  },
};

const offices = [
  {
    region: 'United States & Canada',
    badge: 'North American Hub',
    phone: '(+1) 647 388 0931',
    phoneHref: 'tel:+16473880931',
    email: 'admin@bronze-plaque.com',
    address: ['1101 Eagle Ridge Drive', 'Oshawa, Ontario L1K 0L8', 'Canada'],
    hours: 'Mon – Fri: 9:00 AM – 5:00 PM EST',
  },
  {
    region: 'Australia & International',
    badge: 'Head Office & Foundry',
    phone: '+61 8 6191 0396',
    phoneHref: 'tel:+61861910396',
    email: 'admin@forevershining.com.au',
    address: ['1/44 Port Kembla Dve', 'Bibra Lake WA 6163', 'Australia'],
    hours: 'Mon – Fri: 8:00 AM – 4:30 PM AWST',
  },
];

const CONTACT_PILLARS = [
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'No-Pressure Consultation',
    description: 'Compassionate advice tailored to your family',
  },
  {
    icon: CheckCircleIcon,
    title: '100% Cemetery Compliant',
    description: 'Direct liaison with cemetery authorities',
  },
  {
    icon: SparklesIcon,
    title: 'Architectural 3D Proof',
    description: 'Realistic render & unlimited text revisions',
  },
  {
    icon: ShieldCheckIcon,
    title: '24-Hour Response',
    description: 'Prompt personal attention from our specialists',
  },
];

const CONTACT_FAQS = [
  {
    q: 'Do you handle cemetery permit applications and approvals?',
    a: 'Yes. Every cemetery has specific bylaws regarding allowable heights, widths, granite finishes, and inscription margins. We liaise directly with your cemetery administration, verify exact specifications, and provide certified dimensioned drawings for permit approval before manufacturing begins.',
  },
  {
    q: 'Can I design and preview my memorial online before contacting you?',
    a: 'Absolutely. Our interactive 3D studio lets you choose materials, shapes, inscriptions, motifs, and portraits with real-time pricing. If you save your design or request help, our team can open your exact project to assist with layout adjustments.',
  },
  {
    q: 'What is the typical manufacturing and delivery timeframe?',
    a: 'Cast bronze plaques typically take 4–6 weeks from final proof approval. Traditional and laser-etched granite headstones take approximately 6–10 weeks depending on custom stonework and cemetery foundation scheduling. We coordinate delivery directly to your designated cemetery or stonemason.',
  },
  {
    q: 'What guarantees and durability standards do you provide?',
    a: 'All Forever Shining memorials are engineered for permanent outdoor durability. Our cast bronze carries a 30-year guarantee against defect, and our premium absolute black granite will endure for generations without fading or deterioration.',
  },
];

export default function ContactPage() {
  const baseUrl = 'https://forevershining.org';
  const canonicalUrl = `${baseUrl}/contact`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: 'Contact Forever Shining Memorial Specialists',
        description:
          'Contact Forever Shining for help choosing a memorial, personalizing a design, pricing, or delivery.',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Contact',
            item: canonicalUrl,
          },
        ],
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        name: 'Forever Shining',
        url: baseUrl,
        telephone: '+61 8 6191 0396',
        email: 'admin@forevershining.com.au',
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+1-647-388-0931',
            contactType: 'customer service',
            areaServed: ['US', 'CA'],
            availableLanguage: ['English'],
          },
          {
            '@type': 'ContactPoint',
            telephone: '+61-8-6191-0396',
            contactType: 'customer service',
            areaServed: ['AU', 'Global'],
            availableLanguage: ['English'],
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MemorialPublicHeader activeType="contact" />

      <main
        id="main-content"
        className="day:bg-[#f8f6f0] day:text-[#1d1a17] min-h-screen bg-[#0d0c0b] text-white transition-colors"
      >
        {/* ========================================================================= */}
        {/* 1. HERO HEADER                                                            */}
        {/* ========================================================================= */}
        <section className="day:border-[#e2dad0] day:bg-none day:bg-[#f1ede3] relative border-b border-white/10 bg-gradient-to-b from-[#171614] to-[#0f0e0c]">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
            <nav
              className="day:text-[#756c62] mb-6 flex items-center gap-2 text-sm text-[#8c8275]"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="day:hover:text-[#1d1a17] transition-colors hover:text-[#cfac6c]"
              >
                Home
              </Link>
              <span className="day:text-[#a89d8d] mx-2 text-[#635c52]" aria-hidden="true">
                /
              </span>
              <span className="day:text-[#1d1a17] font-medium text-[#e4dbcd]">
                Contact
              </span>
            </nav>

            <div className="max-w-4xl">
              <span className="day:border-[#d0c2ad] day:bg-[#e8e0d1] day:text-[#74551d] mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#cfac6c]/40 bg-[#cfac6c]/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#e6cb8b] uppercase">
                <SparklesIcon className="size-3.5" />
                Direct Family Support · Global Memorial Specialists
              </span>

              <h1 className="day:text-[#1d1a17] m-0 max-w-3xl p-0 font-serif text-3xl leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl">
                Let’s talk about your memorial
              </h1>

              <p className="day:text-[#5c544a] mt-4 max-w-3xl text-base leading-relaxed text-[#c3bbb0] sm:text-lg sm:leading-8">
                Whether you have a design in mind or need compassionate guidance
                getting started, our team of memorial specialists will walk you
                through dimensions, cemetery regulations, inscriptions, and
                transparent pricing.
              </p>
            </div>

            {/* 4 Pillars of Assurance */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {CONTACT_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="day:border-[#e4ddd2] day:bg-white/80 flex items-start gap-3 rounded-sm border border-white/10 bg-[#141311]/80 p-3.5 backdrop-blur-sm"
                  >
                    <div className="day:border-[#d0c2ad] day:bg-[#f1ece2] flex size-8 shrink-0 items-center justify-center rounded-sm border border-white/15 bg-white/5 text-[#cfac6c]">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <div className="day:text-[#1d1a17] text-xs font-semibold text-white">
                        {pillar.title}
                      </div>
                      <div className="day:text-[#756c62] text-[11px] text-[#a89d8d]">
                        {pillar.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. MAIN CONTACT SECTION (FORM + OFFICE HUBS)                              */}
        {/* ========================================================================= */}
        <section
          aria-label="Contact and consultation options"
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
        >
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left: Consultation Form */}
            <div className="lg:col-span-7">
              <div className="day:border-[#e4ddd2] day:bg-white day:shadow-sm rounded-sm border border-white/10 bg-[#141311] p-6 sm:p-8">
                <div className="mb-6">
                  <span className="day:text-[#8a651f] text-xs font-semibold tracking-wider text-[#cfac6c] uppercase">
                    Personalized Guidance
                  </span>
                  <h2 className="day:text-[#1d1a17] mt-1 font-serif text-2xl font-normal text-white sm:text-3xl">
                    Request a Consultation or Quote
                  </h2>
                  <p className="day:text-[#5c544a] mt-2 text-sm leading-relaxed text-[#c3bbb0]">
                    Tell us what you have in mind. We will review your memorial
                    details and reply with pricing, recommendations, and next
                    steps.
                  </p>
                </div>

                <ContactForm />
              </div>
            </div>

            {/* Right: Studio Hubs & Advisory */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              {/* Studio Hubs */}
              {offices.map((office) => (
                <article
                  key={office.region}
                  className="day:border-[#e4ddd2] day:bg-white day:shadow-sm rounded-sm border border-white/10 bg-[#141311] p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="day:border-[#d0c2ad] day:bg-[#e8e0d1] day:text-[#74551d] rounded-full border border-[#cfac6c]/40 bg-[#cfac6c]/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-[#e6cb8b] uppercase">
                      {office.badge}
                    </span>
                  </div>

                  <h3 className="day:text-[#1d1a17] mt-3 font-serif text-xl font-normal text-white">
                    {office.region}
                  </h3>

                  <div className="mt-5 space-y-3">
                    <a
                      href={office.phoneHref}
                      className="day:text-[#1d1a17] day:hover:text-[#8a651f] flex items-center gap-3 text-sm font-semibold text-white transition-colors hover:text-[#cfac6c]"
                    >
                      <div className="day:bg-[#f1ece2] flex size-7 shrink-0 items-center justify-center rounded-sm bg-white/10 text-[#cfac6c]">
                        <PhoneIcon className="size-3.5" />
                      </div>
                      <span>{office.phone}</span>
                    </a>

                    <a
                      href={`mailto:${office.email}`}
                      className="day:text-[#5c544a] day:hover:text-[#8a651f] flex items-center gap-3 text-sm text-[#c3bbb0] transition-colors hover:text-[#cfac6c]"
                    >
                      <div className="day:bg-[#f1ece2] flex size-7 shrink-0 items-center justify-center rounded-sm bg-white/10 text-[#cfac6c]">
                        <EnvelopeIcon className="size-3.5" />
                      </div>
                      <span className="break-all">{office.email}</span>
                    </a>

                    <div className="day:text-[#756c62] flex items-start gap-3 text-xs leading-relaxed text-[#a89d8d]">
                      <div className="day:bg-[#f1ece2] flex size-7 shrink-0 items-center justify-center rounded-sm bg-white/10 text-[#cfac6c]">
                        <MapPinIcon className="size-3.5" />
                      </div>
                      <div>
                        {office.address.map((line) => (
                          <div key={line}>{line}</div>
                        ))}
                      </div>
                    </div>

                    <div className="day:text-[#756c62] flex items-center gap-3 text-xs text-[#a89d8d]">
                      <div className="day:bg-[#f1ece2] flex size-7 shrink-0 items-center justify-center rounded-sm bg-white/10 text-[#cfac6c]">
                        <ClockIcon className="size-3.5" />
                      </div>
                      <span>{office.hours}</span>
                    </div>
                  </div>
                </article>
              ))}

              {/* Already Started a Design Advisory */}
              <div className="day:border-[#d0c2ad] day:bg-[#f4efe6] day:text-[#1d1a17] rounded-sm border border-[#cfac6c]/30 bg-[#cfac6c]/5 p-6">
                <span className="day:text-[#8a651f] text-xs font-semibold tracking-wider text-[#cfac6c] uppercase">
                  Already Designing Online?
                </span>
                <h3 className="day:text-[#1d1a17] mt-1 font-serif text-lg font-normal text-white">
                  Have a design link or cemetery specs?
                </h3>
                <p className="day:text-[#5c544a] mt-2 text-xs leading-relaxed text-[#c3bbb0]">
                  If you have already started a design in our 3D configurator,
                  include your project link or design ID in your message. If your
                  cemetery gave you an application form, send it through and we
                  will verify all specifications for you.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/designs"
                    className="day:border-[#bdb4a6] day:hover:border-[#8a651f] day:text-[#1d1a17] inline-flex items-center text-xs font-semibold text-[#cfac6c] underline transition-colors hover:text-white"
                  >
                    Browse Ready Designs →
                  </Link>
                  <Link
                    href="/select-product"
                    className="day:border-[#bdb4a6] day:hover:border-[#8a651f] day:text-[#1d1a17] inline-flex items-center text-xs font-semibold text-[#cfac6c] underline transition-colors hover:text-white"
                  >
                    Open 3D Studio →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. FREQUENTLY ASKED QUESTIONS                                             */}
          {/* ========================================================================= */}
          <div className="mt-16 pt-12 border-t border-white/10 day:border-[#e2dad0]">
            <div className="max-w-3xl mb-8">
              <span className="day:text-[#8a651f] text-xs font-semibold tracking-wider text-[#cfac6c] uppercase">
                Common Questions
              </span>
              <h2 className="day:text-[#1d1a17] mt-1 font-serif text-2xl font-normal text-white sm:text-3xl">
                Frequently Asked Consultation Questions
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {CONTACT_FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="day:border-[#e4ddd2] day:bg-white day:shadow-sm rounded-sm border border-white/10 bg-[#141311] p-6"
                >
                  <h3 className="day:text-[#1d1a17] font-serif text-lg font-normal text-white">
                    {faq.q}
                  </h3>
                  <p className="day:text-[#5c544a] mt-3 text-xs leading-relaxed text-[#c3bbb0]">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </>
  );
}
