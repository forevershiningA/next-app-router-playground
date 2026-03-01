import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { type CodeHikeConfig } from 'codehike/mdx';

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    // Re-enabled useCache as it's required by 'use cache' directives in code
    useCache: true,
    // Other experimental features disabled for faster builds
    // inlineCss: true,
    // cacheComponents: false,
    // clientSegmentCache: true,
    // viewTransition: true,
    // prerenderEarlyExit: false,
    // routerBFCache: true,
  },
  // Exclude large static assets from serverless functions
  // NOTE: These files are still publicly accessible, just not bundled with serverless functions
  outputFileTracingExcludes: {
    '*': [
      'public/ml/**/*',
      'public/shapes/**/*',
      'public/additions/**/*',
      'public/png/**/*',           // 343 MB motifs + 34 MB emblems
      'public/emblems/**/*',       // 33 MB
      'public/hdri/**/*',          // 27 MB HDR files
      'public/saved-designs/**/*', // 20 MB screenshots
      'public/textures/**/*',      // 17 MB
      'public/json/firstnames_*.json', // 15 MB
      'public/backgrounds/**/*',   // Large background images
      'public/xml/**/*',           // Large XML files
      'public/data/**/*',          // Design data
      'node_modules/@img/**/*',    // Sharp dependencies (32 MB)
    ],
  },
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90, 100],
  },
  // Enable compression
  compress: true,
  // Performance monitoring
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Headers for caching static assets
  async headers() {
    return [
      {
        source: '/xml/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/json/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/shapes/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/ml/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=2592000', // 1 week cache, 30 day stale
          },
        ],
      },
    ];
  },
} satisfies NextConfig;

const codeHikeConfig = {
  components: { code: 'MyCode', inlineCode: 'MyInlineCode' },
} satisfies CodeHikeConfig;

const withMDX = createMDX({
  options: {
    remarkPlugins: [['remark-codehike', codeHikeConfig]],
    recmaPlugins: [['recma-codehike', codeHikeConfig]],
  },
});

export default withMDX(nextConfig);
