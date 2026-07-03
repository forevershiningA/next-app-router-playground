import type { Metadata } from 'next';
import HomeSplash from './_ui/HomeSplash';

export const metadata: Metadata = {
  title: 'Design Your Own Headstone Online | Forever Shining',
  description: 'Create custom Headstones, Plaques and Monuments. Choose stone, shape, size, inscriptions and motifs. Transparent pricing, world-wide delivery.',
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

const faqItems = [
  {
    question: 'Can I design a memorial online before placing an order?',
    answer:
      'Yes. The Forever Shining design studio lets you choose a memorial type, shape, material, inscription, motifs, and additions with a live 3D preview before you request pricing or place an order. Bronze Plaques, Memorial Plaques, and Headstones are core products for international customers.',
  },
  {
    question: 'Can I save and share a headstone design with family?',
    answer:
      'Yes. You can save a draft, review it later, and share the design proof with family members so everyone can approve the wording and layout before production.',
  },
  {
    question: 'Do cemetery requirements affect the memorial design?',
    answer:
      'Yes. Cemeteries can set rules for size, material, foundation, and installation. We recommend checking with the cemetery office before final approval and can help review the requirements for your design.',
  },
  {
    question: 'What details can be personalised?',
    answer:
      'You can personalise inscriptions, dates, verses, fonts, motifs, photo etching, shapes, materials, sizes, and selected accessories depending on the memorial product.',
  },
  {
    question: 'Which countries and regions do you serve?',
    answer:
      'Forever Shining serves customers in Australia, the United States, Canada, and Europe, with a strong focus on Bronze Plaques and other Memorial Plaques as well as selected Headstones.',
  },
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
      parentOrganization: {
        '@id': 'https://forevershining.org#organization',
      },
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
          itemOffered: {
            '@type': 'Product',
            name: 'Bronze Plaques',
            category: 'Memorial plaque',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Memorial Plaques',
            category: 'Plaque',
          },
        },
        {
          '@type': 'Offer',
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
      publisher: {
        '@id': 'https://forevershining.org#organization',
      },
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
      name: 'Design Your Own Headstone Online | Forever Shining',
      description:
        'Create custom Bronze Plaques, Memorial Plaques, Headstones and Monuments. Choose stone, shape, size, inscriptions and motifs with live 3D preview.',
      isPartOf: {
        '@id': 'https://forevershining.org#website',
      },
      about: {
        '@id': 'https://forevershining.org#localbusiness',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://forevershining.org#faq',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
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
