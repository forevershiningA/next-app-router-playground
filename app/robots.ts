import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/my-account/'],
    },
    sitemap: 'https://forevershining.org/sitemap.xml',
  };
}
