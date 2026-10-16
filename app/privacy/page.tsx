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
      <>
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
      </>
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
      <>
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
      </>
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
      <>
        <p>
          We may update this policy as our services or practices change. The
          current version will be published on this page.
        </p>
        <p>
          For privacy questions, access or correction requests, or complaints,
          contact us at{' '}
          <a href="mailto:admin@forevershining.com.au">
            admin@forevershining.com.au
          </a>{' '}
          or call (08) 6191 0396. We will review and respond to your enquiry.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-[#050301] text-[#E5E5EA] day:bg-stone-100 day:text-gray-900">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.18),_transparent_40%)] day:hidden"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <Link
          href="/my-account"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white day:text-gray-500 day:hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to My Account
        </Link>

        <article className="rounded-2xl border border-white/10 bg-[#0c0805]/85 px-4 pt-6 pb-32 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl day:border-gray-200 day:bg-white day:shadow-lg sm:rounded-[32px] sm:px-6 lg:px-10 lg:pt-8">
          <header className="mb-6 border-b border-white/10 pb-6 day:border-gray-200">
            <h1 className="text-3xl font-semibold tracking-tight day:text-gray-900">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-white/60 day:text-gray-500">
              How Forever Shining collects, uses, and protects your information
            </p>
          </header>

          <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-[#D1D1D6] prose-h2:mt-9 prose-h2:mb-3 prose-h2:text-lg prose-h2:font-semibold prose-h2:text-[#F2F2F7] prose-a:text-[#D4A84F] prose-a:no-underline hover:prose-a:underline day:prose-invert-none day:prose-p:text-gray-600 day:prose-h2:text-gray-900 day:prose-a:text-amber-600">
            {sections.map(({ title, content }) => (
              <section key={title}>
                <h2>{title}</h2>
                {content}
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
