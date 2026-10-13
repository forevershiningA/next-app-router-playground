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
        '/select-shape',
        '/select-border',
        '/select-fastening',
        '/select-material',
        '/select-size',
        '/select-motifs',
        '/select-images',
        '/select-emblems',
        '/select-additions',
        '/inscriptions',
        '/check-price',
        '/design-menu',
        '/ml/',
      ],
    },
    sitemap: 'https://forevershining.org/sitemap.xml',
  };
}
