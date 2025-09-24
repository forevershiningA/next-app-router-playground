import '#/styles/globals.css';

import db from '#/lib/db';
import Byline from '#/ui/byline';
import { GlobalNav } from '#/ui/global-nav';
import { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import ThreeScene from '#/components/ThreeScene';
import SceneOverlayHost from '#/components/SceneOverlayHost';
import { Suspense } from 'react';
import RouterBinder from '#/components/system/RouterBinder'; // ← ADD

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
        className={`overflow-y-scroll bg-gray-950 font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RouterBinder /> {/* ← mount once, early */}
        <div className="fixed top-0 z-10 flex w-full flex-col border-b border-gray-800 bg-black lg:bottom-0 lg:z-auto lg:w-72 lg:border-r lg:border-b-0 lg:border-gray-800">
          <GlobalNav items={demos} />
        </div>
        <div className="lg:pl-72">
          <div className="mx-auto -space-y-[1px] lg:px-8 lg:py-8">
            <Suspense
              fallback={
                <div className="aspect-[16/9] w-full rounded-md bg-gray-900/50" />
              }
            >
              <SceneOverlayHost /> {/* ← one host, one overlay */}
              <ThreeScene />
            </Suspense>
            <div className="pt-4 pb-10">{children}</div>
            <Byline />
          </div>
        </div>
      </body>
    </html>
  );
}
