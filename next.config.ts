import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { type CodeHikeConfig } from 'codehike/mdx';
import { createRequire } from 'node:module';

const sentryConfig = createRequire(`${process.cwd()}/next.config.ts`)(
  '@sentry/nextjs/config',
) as {
  withSentryConfig: (
    config: NextConfig,
    options: {
      org: string;
      project: string;
      tunnelRoute: string;
      authToken?: string;
      silent: boolean;
      release?: {
        name?: string;
        deploy?: false | { env: string; url?: string };
      };
    },
  ) => NextConfig;
};
const { withSentryConfig } = sentryConfig;
const sentryReleaseName =
  process.env.SENTRY_RELEASE ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA;

const nextConfig = {
  // Isolate local asset generation from other dev/build processes.
  distDir:
    process.env.DESIGN_PREVIEW_CAPTURE === '1'
      ? '.next-design-previews'
      : '.next',
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  eslint: { ignoreDuringBuilds: true },
  // Optimize production build
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Re-enabled useCache as it's required by 'use cache' directives in code
    useCache: true,
    // Optimize for faster builds
    optimizePackageImports: [
      '@react-three/drei',
      '@react-three/fiber',
      'three',
    ],
  },
  webpack: (config) => {
    // Keep default parallelism unless explicitly overridden.
    // Hard-capping to 2 significantly slows large builds on Vercel.
    const override = Number(process.env.WEBPACK_PARALLELISM || '');
    if (Number.isFinite(override) && override > 0) {
      config.parallelism = override;
    }
    return config;
  },
  // Exclude large static assets from serverless functions
  // NOTE: These files are still publicly accessible, just not bundled with serverless functions
  outputFileTracingExcludes: {
    '*': [
      'public/ml/**/*',
      'public/designs/**/*', // Canonical rollout artifacts are static assets; do not bundle in functions
      'public/gallery/**/*', // Memorial gallery photos are served statically, never read by functions
      'public/shapes/**/*',
      'public/additions/**/*',
      'public/png/**/*', // 343 MB motifs + 34 MB emblems
      'public/emblems/**/*', // 33 MB
      'public/hdri/**/*', // 27 MB HDR files
      'public/saved-designs/**/*', // 20 MB screenshots
      'public/screenshots/**/*', // 245 MB 3D screenshots + thumbnails
      'public/textures/**/*', // 17 MB
      'public/json/firstnames_*.json', // 15 MB
      'public/backgrounds/**/*', // Large background images
      'public/data/**/*', // Design data
      'node_modules/@img/**/*', // Sharp dependencies (32 MB)
      'node_modules/@swc/**/*', // SWC compiler binaries
      'node_modules/three/**/*', // Three.js source (compiled separately)
      'node_modules/esbuild/**/*', // esbuild binaries
      '.next/cache/**/*', // Build cache
    ],
  },
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.vercel.app' },
      { protocol: 'https', hostname: 'www.forevershining.com.au' },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90, 100],
  },
  // Enable compression
  compress: true,
  // Performance monitoring
  logging: { fetches: { fullUrl: true } },
  // Headers for caching static assets
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.forevershining.org' }],
        destination: 'https://forevershining.org/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "form-action 'self' https://checkout.stripe.com",
              "script-src 'self' 'unsafe-inline' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.stripe.com https://*.stripe.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
              "media-src 'self' blob:",
              "worker-src 'self' blob:",
              'report-uri /api/csp-report',
              'report-to csp-endpoint',
            ].join('; '),
          },
          {
            key: 'Reporting-Endpoints',
            value: 'csp-endpoint="/api/csp-report"',
          },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
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

export default withMDX(
  withSentryConfig(nextConfig, {
    org: 'forever-shining',
    project: 'forever-shining-nextjs',
    tunnelRoute: '/sentry-tunnel',
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: !process.env.CI,
    release: {
      name: sentryReleaseName,
      deploy:
        process.env.VERCEL_ENV === 'production'
          ? {
              env: 'production',
              url: process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : undefined,
            }
          : false,
    },
  }),
);
