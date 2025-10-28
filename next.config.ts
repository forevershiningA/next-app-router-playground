import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { type CodeHikeConfig } from 'codehike/mdx';

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    inlineCss: true,
    cacheComponents: false,
    useCache: true,
    clientSegmentCache: true,
    viewTransition: true,
    prerenderEarlyExit: false,
    routerBFCache: true,
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
