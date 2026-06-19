import type { Metadata } from 'next';
import HomeSplash from './_ui/HomeSplash';

export const metadata: Metadata = {
  title: 'Design Your Own Headstone Online | Forever Shining',
  description: 'Create custom headstones, plaques and monuments. Choose stone, shape, size, inscriptions and motifs. Transparent pricing, world-wide delivery.',
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://forevershining.org#organization',
      name: 'Forever Shining',
      url: 'https://forevershining.org',
      logo: {
        '@type': 'ImageObject',
        url: 'https://forevershining.org/ico/forever-transparent-logo.png',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+61-8-6191-0396',
          contactType: 'customer service',
          availableLanguage: ['English'],
        },
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1/44 Port Kembla Dve',
        addressLocality: 'Bibra Lake',
        addressRegion: 'WA',
        postalCode: '6163',
        addressCountry: 'AU',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://forevershining.org#website',
      url: 'https://forevershining.org',
      name: 'Forever Shining',
      publisher: {
        '@id': 'https://forevershining.org#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://forevershining.org/designs?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeSplash />
    </>
  );
}
