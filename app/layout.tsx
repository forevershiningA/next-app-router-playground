import '#/styles/globals.css';

import db from '#/lib/db';
import Byline from '#/ui/byline';
import { GlobalNav } from '#/ui/global-nav';
import { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import ThreeScene from '#/components/ThreeScene';
import SceneOverlayHost from '#/components/SceneOverlayHost';
import ErrorBoundary from '#/components/ErrorBoundary';
import { Suspense } from 'react';
import RouterBinder from '#/components/system/RouterBinder';
import MobileHeader from '#/components/MobileHeader';
import MainContent from '#/components/MainContent';
import AdditionOverlayPanel from '#/components/AdditionOverlayPanel';
import EditMotifPanel from '#/components/EditMotifPanel';
import CheckPricePanel from '#/components/CheckPricePanel';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: { default: 'Design Your Own', template: '%s | Design Your Own' },
  metadataBase: new URL('https://app-router.vercel.app'),
  description:
    'A playground to explore Next.js features such as nested layouts, instant loading states, streaming, and component level data fetching.',
  openGraph: {
    title: 'Design Your Own',
    description:
      'A playground to explore Design Your Own features such as nested layouts, instant loading states, streaming, and component level data fetching.',
    images: [`/api/og?title=Design Your Own`],
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demos = db.demo.findMany();
  return (
    <html lang="en" className="[color-scheme:dark]">
      <body
        className={`overflow-y-scroll bg-black font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <RouterBinder /> {/* ← mount once, early */}
          <GlobalNav items={demos} />
          <MainContent>
            <Suspense
              fallback={
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
                    <p className="text-sm text-gray-400">Loading scene...</p>
                  </div>
                </div>
              }
            >
              <ErrorBoundary
                fallback={
                  <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-red-500/20 bg-red-950/10">
                    <div className="flex flex-col items-center gap-4 p-8">
                      <div className="text-4xl">⚠️</div>
                      <h2 className="text-lg font-semibold text-red-400">
                        Failed to load 3D scene
                      </h2>
                      <p className="text-sm text-gray-400">
                        Please refresh the page to try again
                      </p>
                    </div>
                  </div>
                }
              >
                <SceneOverlayHost />
                <AdditionOverlayPanel />
                <EditMotifPanel />
                <CheckPricePanel />
                <ThreeScene />
              </ErrorBoundary>
            </Suspense>
            <div>{children}</div>
          </MainContent>
        </ErrorBoundary>
      </body>
    </html>
  );
}
