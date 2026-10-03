import type { Metadata } from 'next';
import HomeSplash from './_ui/HomeSplash';
import { homeFaqItems } from './_internal/home-content';

export const metadata: Metadata = {
  title: {
    absolute: 'Custom Headstones & Grave Markers | Forever Shining USA',
  },
  description:
    'Design custom headstones, grave markers and memorial plaques online in the USA. Personalize inscriptions, photos and motifs with live 3D preview and clear pricing.',
  alternates: {
    canonical: 'https://forevershining.org',
    languages: {
      'en-US': 'https://forevershining.org',
      'x-default': 'https://forevershining.org',
    },
  },
  openGraph: {
    title: 'Custom Headstones & Grave Markers | Forever Shining USA',
    description:
      'Design custom headstones, grave markers and memorial plaques online in the USA with live 3D preview and clear pricing.',
    url: 'https://forevershining.org',
    siteName: 'Forever Shining',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/backgrounds/tree-2916763_1920.webp',
        width: 1920,
        height: 1139,
        alt: 'A peaceful memorial landscape by Forever Shining',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Headstones & Grave Markers | Forever Shining USA',
    description:
      'Design custom headstones, grave markers and memorial plaques online in the USA with live 3D preview and clear pricing.',
    images: ['/backgrounds/tree-2916763_1920.webp'],
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

const businessContactsByPriority = [businessContacts[1], businessContacts[0]];
const primaryContact = businessContactsByPriority[0];

const socialProfiles = [
  'https://www.facebook.com/ForeverShiningAustralia/',
  'https://www.instagram.com/forevershiningaus/',
  'https://twitter.com/ForeverShiningA',
  'https://www.pinterest.com/forevershining1/',
  'https://www.youtube.com/@forevershining/featured',
];

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
      contactPoint: businessContactsByPriority.map((contact) => ({
        '@type': 'ContactPoint',
        telephone: contact.telephone,
        contactType: 'customer service',
        email: contact.email,
        areaServed: contact.name,
        availableLanguage: ['English'],
      })),
      address: businessContactsByPriority.map((contact) => ({
        '@type': 'PostalAddress',
        streetAddress: contact.streetAddress,
        addressLocality: contact.addressLocality,
        addressRegion: contact.addressRegion,
        postalCode: contact.postalCode,
        addressCountry: contact.addressCountry,
      })),
    },
    {
      '@type': 'OnlineStore',
      '@id': 'https://forevershining.org#store',
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
        { '@type': 'Country', name: 'United States' },
        { '@type': 'Country', name: 'Canada' },
        { '@type': 'Country', name: 'Australia' },
        { '@type': 'Place', name: 'Europe' },
      ],
      makesOffer: [
        {
          '@type': 'Offer',
          url: 'https://forevershining.org/bronze-plaque/select-shape',
          itemOffered: {
            '@type': 'Product',
            name: 'Bronze Plaques',
            category: 'Memorial plaque',
          },
        },
        {
          '@type': 'Offer',
          url: 'https://forevershining.org/memorials/plaques',
          itemOffered: {
            '@type': 'Product',
            name: 'Memorial Plaques',
            category: 'Plaque',
          },
        },
        {
          '@type': 'Offer',
          url: 'https://forevershining.org/memorials/headstones',
          itemOffered: {
            '@type': 'Product',
            name: 'Headstones',
            category: 'Memorial headstone',
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
      name: 'Custom Headstones & Grave Markers | Forever Shining USA',
      description:
        'Design custom headstones, grave markers and memorial plaques online in the USA with live 3D preview, personalized inscriptions and clear pricing.',
      isPartOf: { '@id': 'https://forevershining.org#website' },
      about: { '@id': 'https://forevershining.org#store' },
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
