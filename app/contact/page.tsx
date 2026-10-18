import type { Metadata } from 'next';
import Link from 'next/link';
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import MemorialPublicHeader from '#/components/MemorialPublicHeader';
import HomeFooter from '#/app/_ui/HomeFooter';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Forever Shining for help choosing a memorial, personalizing a design, pricing, or delivery. Speak with our teams in Canada and Australia.',
  alternates: { canonical: 'https://forevershining.org/contact' },
  openGraph: {
    title: 'Contact Forever Shining',
    description: 'Personal help with your memorial, from design to delivery.',
    url: 'https://forevershining.org/contact',
    type: 'website',
  },
};

const offices = [
  {
    region: 'United States & Canada',
    phone: '(+1) 647 388 0931',
    phoneHref: 'tel:+16473880931',
    email: 'admin@bronze-plaque.com',
    address: ['1101 Eagle Ridge Drive', 'Oshawa, Ontario L1K 0L8', 'Canada'],
  },
  {
    region: 'Australia & international enquiries',
    phone: '+61 8 6191 0396',
    phoneHref: 'tel:+61861910396',
    email: 'admin@forevershining.com.au',
    address: ['1/44 Port Kembla Dve', 'Bibra Lake WA 6163', 'Australia'],
  },
];

export default function ContactPage() {
  return (
    <>
      <MemorialPublicHeader activeType="contact" />
      <main id="main-content" className="bg-white text-[#1d1a17]">
        <section className="border-b border-[#bdb4a6] bg-[#eee9df]">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
            <nav
              className="mb-6 text-sm text-[#756c62]"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-[#6f511c]">
                Home
              </Link>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <span aria-current="page">Contact</span>
            </nav>
            <h1 className="m-0 p-0 font-serif text-[2.5rem] leading-[1.08] tracking-[-0.025em] sm:text-5xl lg:text-[3.5rem]">
              Let’s talk about your memorial
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#625a51] sm:text-lg sm:leading-8">
              Whether you have a design in mind or need help getting started,
              our team can guide you through materials, wording, pricing, and
              delivery.
            </p>
          </div>
        </section>

        <section
          aria-label="Contact our team"
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16"
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {offices.map((office) => (
              <article
                key={office.region}
                className="border-t border-[#d8cdb9] pt-6"
              >
                <h2 className="font-serif text-2xl sm:text-3xl">
                  {office.region}
                </h2>
                <div className="mt-6 flex flex-col items-start gap-4">
                  <a
                    href={office.phoneHref}
                    className="inline-flex min-h-11 items-center gap-3 text-lg font-semibold hover:text-[#6f511c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6f511c]"
                  >
                    <PhoneIcon
                      className="h-5 w-5 shrink-0 text-[#8a651f]"
                      aria-hidden="true"
                    />
                    {office.phone}
                  </a>
                  <a
                    href={`mailto:${office.email}`}
                    className="inline-flex min-h-11 max-w-full items-center gap-3 text-sm hover:text-[#6f511c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6f511c] sm:text-base"
                  >
                    <EnvelopeIcon
                      className="h-5 w-5 shrink-0 text-[#8a651f]"
                      aria-hidden="true"
                    />
                    <span className="break-all">{office.email}</span>
                  </a>
                </div>
                <address className="mt-6 text-sm leading-7 text-[#625a51] not-italic">
                  {office.address.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </address>
              </article>
            ))}
          </div>
          <aside className="mt-12 border-l-2 border-[#cfac6c] bg-[#f7f4ee] p-6 sm:p-8">
            <h2 className="font-serif text-2xl">Already started a design?</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#625a51]">
              Include your design link or order reference when you email us. If
              you are asking about delivery or cemetery requirements, share the
              destination and any guidelines you have so we can help with the
              next step.
            </p>
            <Link
              href="/designs"
              className="mt-5 inline-flex min-h-11 items-center border-b border-[#9a742f] text-sm font-semibold text-[#6f511c] hover:text-[#1d1a17]"
            >
              Browse ready designs
            </Link>
          </aside>
        </section>
      </main>
      <HomeFooter />
    </>
  );
}
