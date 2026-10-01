import type { Metadata } from 'next';
import HomeSplash from './_ui/HomeSplash';
import { homeFaqItems } from './_internal/home-content';

export const metadata: Metadata = {
  title: {
    absolute:
      'Custom Headstones, Memorial Plaques & Monuments | Forever Shining',
  },
  description:
    'Forever Shining helps families design and buy custom headstones, plaques, full monuments, urns and pet memorials online with live preview and pricing.',
  alternates: { canonical: 'https://forevershining.org' },
  openGraph: {
    title: 'Custom Headstones, Memorial Plaques & Monuments | Forever Shining',
    description:
      'Design and buy custom headstones, plaques, monuments, urns and pet memorials online with a live preview and pricing.',
    url: 'https://forevershining.org',
    siteName: 'Forever Shining',
    type: 'website',
  },
};

const businessContacts = [
  {
    name: 'Australia',
    telephone: '+61-8-6191-0396',
    email: 'admin@forevershining.com.au',
    streetAddress: '1/44 Port Kembla Dve',
    addressLocality: 'Bibra Lake',
    addressRegion: 'WA',
    postalCode: '6163',
    addressCountry: 'AU',
  },
  {
    name: 'North America',
    telephone: '+1-647-388-0931',
    email: 'admin@bronze-plaque.com',
    streetAddress: '1101 Eagle Ridge Drive',
    addressLocality: 'Oshawa',
    addressRegion: 'Ontario',
    postalCode: 'L1K 0L8',
    addressCountry: 'CA',
  },
];

const primaryContact = businessContacts[0];

const socialProfiles = [
  'https://www.facebook.com/ForeverShiningAustralia/',
  'https://www.instagram.com/forevershiningaus/',
  'https://twitter.com/ForeverShiningA',
  'https://www.pinterest.com/forevershining1/',
  'https://www.youtube.com/@forevershining/featured',
];

function aggregateOffer(
  url: string,
  lowPrice: string,
  highPrice: string,
  offerCount: number,
) {
  return {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice,
    highPrice,
    offerCount,
    availability: 'https://schema.org/InStock',
    url,
  };
}

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
      sameAs: socialProfiles,
      contactPoint: businessContacts.map((contact) => ({
        '@type': 'ContactPoint',
        telephone: contact.telephone,
        contactType: 'customer service',
        email: contact.email,
        areaServed: contact.name,
        availableLanguage: ['English'],
      })),
      address: businessContacts.map((contact) => ({
        '@type': 'PostalAddress',
        streetAddress: contact.streetAddress,
        addressLocality: contact.addressLocality,
        addressRegion: contact.addressRegion,
        postalCode: contact.postalCode,
        addressCountry: contact.addressCountry,
      })),
    },
    {
      '@type': ['LocalBusiness', 'Store'],
      '@id': 'https://forevershining.org#localbusiness',
      name: 'Forever Shining',
      url: 'https://forevershining.org',
      telephone: primaryContact.telephone,
      email: primaryContact.email,
      priceRange: '$$-$$$$',
      parentOrganization: { '@id': 'https://forevershining.org#organization' },
      address: {
        '@type': 'PostalAddress',
        streetAddress: primaryContact.streetAddress,
        addressLocality: primaryContact.addressLocality,
        addressRegion: primaryContact.addressRegion,
        postalCode: primaryContact.postalCode,
        addressCountry: primaryContact.addressCountry,
      },
      areaServed: [
        { '@type': 'Country', name: 'Australia' },
        { '@type': 'Country', name: 'United States' },
        { '@type': 'Country', name: 'Canada' },
        { '@type': 'Place', name: 'Europe' },
      ],
      makesOffer: [
        {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          url: 'https://forevershining.org/bronze-plaque/select-shape',
          itemOffered: {
            '@type': 'Product',
            name: 'Bronze Plaques',
            category: 'Memorial plaque',
            offers: aggregateOffer(
              'https://forevershining.org/bronze-plaque/select-shape',
              '346',
              '5666',
              3,
            ),
          },
        },
        {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          url: 'https://forevershining.org/memorials/plaques',
          itemOffered: {
            '@type': 'Product',
            name: 'Memorial Plaques',
            category: 'Plaque',
            offers: aggregateOffer(
              'https://forevershining.org/memorials/plaques',
              '255',
              '4418',
              4,
            ),
          },
        },
        {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          url: 'https://forevershining.org/memorials/headstones',
          itemOffered: {
            '@type': 'Product',
            name: 'Headstones',
            category: 'Memorial headstone',
            offers: aggregateOffer(
              'https://forevershining.org/memorials/headstones',
              '603',
              '11496',
              4,
            ),
          },
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://forevershining.org#website',
      url: 'https://forevershining.org',
      name: 'Forever Shining',
      publisher: { '@id': 'https://forevershining.org#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://forevershining.org/designs?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://forevershining.org#webpage',
      url: 'https://forevershining.org',
      name: 'Custom Headstones, Memorial Plaques & Monuments | Forever Shining',
      description:
        'Forever Shining helps families design and buy custom headstones, plaques, full monuments, urns and pet memorials online with live preview and pricing.',
      isPartOf: { '@id': 'https://forevershining.org#website' },
      about: { '@id': 'https://forevershining.org#localbusiness' },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://forevershining.org#faq',
      mainEntity: homeFaqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
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
