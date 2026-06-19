import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/account/',
        '/my-account/',
        '/orders/',
        '/design/',
        '/shared/',
        '/login',
        '/select-size/checkout/',
        '/ml/',
        '/_hooks/',
        '/_patterns/',
      ],
    },
    sitemap: 'https://forevershining.org/sitemap.xml',
  };
}
