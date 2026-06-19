import type { Metadata } from 'next';

const BASE_URL = 'https://forevershining.org';

type GuideSeoInput = {
  slug: string;
  title: string;
  description: string;
};

export function guideMetadata({ slug, title, description }: GuideSeoInput): Metadata {
  const url = `${BASE_URL}/designs/guide/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Forever Shining',
      type: 'article',
      images: [
        {
          url: '/api/og?title=Forever%20Shining%20Memorial%20Guide',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og?title=Forever%20Shining%20Memorial%20Guide'],
    },
  };
}

export function GuideStructuredData({ slug, title, description }: GuideSeoInput) {
  const url = `${BASE_URL}/designs/guide/${slug}`;
  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: title,
        description,
        mainEntityOfPage: url,
        publisher: {
          '@id': `${BASE_URL}#organization`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Memorial Designs',
            item: `${BASE_URL}/designs`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: title.replace(' | Forever Shining', ''),
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
