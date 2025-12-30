import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { type CodeHikeConfig } from 'codehike/mdx';

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    inlineCss: true,
    cacheComponents: false,
    useCache: true,
    clientSegmentCache: true,
    viewTransition: true,
    prerenderEarlyExit: false,
    routerBFCache: true,
  },
  // Exclude large static assets from serverless functions
  // NOTE: These files are still publicly accessible, just not bundled with serverless functions
  outputFileTracingExcludes: {
    '*': [
      // 'public/ml/**/*',  // REMOVED: Design screenshots need to be accessible
      'public/shapes/**/*',
      'public/additions/**/*',
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
