import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Privacy Policy | Forever Shining',
  description:
    'Learn how Forever Shining collects, uses, stores, and protects personal information.',
  alternates: {
    canonical: 'https://forevershining.org/privacy',
  },
};

const sections = [
  {
    title: 'About this policy',
    content: (
      <p>
        Stainless Steel Monument Company Pty Ltd operates ForeverShining.org.
        We take privacy seriously and handle personal information for the
        purposes described here and as required by applicable law. This policy
        covers information collected through our website, account features,
        design tools, and services.
      </p>
    ),
  },
  {
    title: 'Information we collect',
    content: (
      <div className="space-y-3">
        <p>
          Depending on how you use the site, we may collect your name, email
          address, telephone number, delivery and billing details, account
          information, messages to our team, and information you add to a
          memorial design. This can include inscriptions, uploaded images, and
          saved design or order details.
        </p>
        <p>
          When you browse the site, our systems may also process technical
          information such as your IP address, browser and device details,
          requested pages, referring page, and access time. We use this
          information to operate and protect the service and to diagnose
          technical problems.
        </p>
        <p>
          Payments are handled by the payment provider shown at checkout. For
          Stripe checkout, payment-card details are entered with Stripe; we
          receive transaction and payment status information needed to process
          your order, not your full card number.
        </p>
      </div>
    ),
  },
  {
    title: 'How we use information',
    content: (
      <p>
        We use information to provide and maintain the website, manage accounts
        and saved designs, prepare quotations and orders, process payments,
        respond to enquiries, provide customer support, prevent misuse, and meet
        legal or record-keeping obligations. We may also send service updates
        about an account or order. Where we send optional promotional messages,
        you can ask us to stop.
      </p>
    ),
  },
  {
    title: 'Service providers and disclosures',
    content: (
      <p>
        We do not sell or rent customer lists. We may share the information
        needed to provide a service with trusted providers, including payment,
        hosting, database, email, delivery, and technical monitoring providers.
        These providers may process information on our behalf or under their
        own terms when you use their services. We may also disclose information
        when required by law or when reasonably necessary to protect people,
        the site, or our legal rights.
      </p>
    ),
  },
  {
    title: 'Cookies and similar technologies',
    content: (
      <div className="space-y-3">
        <p>
          We use cookies needed for functions such as keeping you signed in,
          protecting account sessions, and remembering site preferences such as
          your selected measurement system. A payment provider may use its own
          cookies on its checkout pages.
        </p>
        <p>
          You can manage cookies through your browser settings. Blocking
          essential cookies may prevent account, checkout, or preference
          features from working correctly.
        </p>
      </div>
    ),
  },
  {
    title: 'Diagnostics and security',
    content: (
      <p>
        We use Sentry to monitor application errors and performance so we can
        diagnose failures. The application is configured to avoid sending
        account identifiers, cookies, request bodies, and URL query parameters
        in Sentry events. Sentry may process technical request information,
        including an IP address that can be used to infer an approximate
        location. We use reasonable safeguards to protect information from
        loss, misuse, and unauthorised access or disclosure.
      </p>
    ),
  },
  {
    title: 'Access, correction, and retention',
    content: (
      <p>
        You may contact us to request access to or correction of personal
        information we hold about you. We may need to verify your identity
        before responding and may retain records where required for legal,
        accounting, security, or legitimate business purposes. We take
        reasonable steps to delete or de-identify information when it is no
        longer needed.
      </p>
    ),
  },
  {
    title: 'Children',
    content: (
      <p>
        Our services are not directed to children under 13, and we do not
        knowingly collect their personal information. A parent or guardian who
        believes a child has provided information to us can contact us to
        request its removal.
      </p>
    ),
  },
  {
    title: 'Changes and contact',
    content: (
      <div className="space-y-3">
        <p>
          We may update this policy as our services or practices change. The
          current version will be published on this page.
        </p>
        <p>
          For privacy questions, access or correction requests, or complaints,
          contact us at{' '}
          <a
            href="mailto:admin@forevershining.com.au"
            className="text-[#c49a45] underline decoration-[#c49a45]/40 underline-offset-2 transition hover:text-[#d5ad55] day:text-[#9a742f] day:decoration-[#9a742f]/40 day:hover:text-[#78541c]"
          >
            admin@forevershining.com.au
          </a>{' '}
          or call{' '}
          <a
            href="tel:+61861910396"
            className="text-[#c49a45] underline decoration-[#c49a45]/40 underline-offset-2 transition hover:text-[#d5ad55] day:text-[#9a742f] day:decoration-[#9a742f]/40 day:hover:text-[#78541c]"
          >
            (08) 6191 0396
          </a>
          . We will review and respond to your enquiry.
        </p>
      </div>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0c0b0a] text-white day:bg-[#f7f4ee] day:text-[#1a1714]">
      {/* Studio Header */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#161412] day:border-[#dfd7ca] day:bg-[#f5f1e8]">
        <div className="absolute inset-0 bg-radial-gradient-to-r from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#c49a45]/35 bg-[#c49a45]/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-[#c49a45] uppercase day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#78541c]">
                Legal &amp; Compliance · Policy
              </div>
              <h1 className="font-serif text-3xl font-normal tracking-tight text-white day:text-[#1a1714] sm:text-4xl lg:text-[40px]">
                Privacy Policy
              </h1>
              <p className="mt-2 text-sm text-stone-300 day:text-[#5a5248]">
                How Forever Shining collects, uses, and safeguards your personal data
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
            {sections.map(({ title, content }, index) => (
              <section key={title} className={`py-6 ${index === 0 ? 'pt-0' : ''} last:pb-0`}>
                <h2 className="font-serif text-lg font-normal text-[#c49a45] day:text-[#9a742f]">
                  {title}
                </h2>
                <div className="mt-2 text-sm leading-relaxed text-stone-300 day:text-[#5a5248]">
                  {content}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
