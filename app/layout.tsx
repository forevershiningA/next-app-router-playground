import '#/styles/globals.css';

import db from '#/lib/db';
import Byline from '#/ui/byline';
import { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import ErrorBoundary from '#/components/ErrorBoundary';
import RouterBinder from '#/components/system/RouterBinder';
import MobileHeader from '#/components/MobileHeader';
import MainContent from '#/components/MainContent';
import ConditionalCanvas from '#/components/ConditionalCanvas';
import ConditionalNav from '#/components/ConditionalNav';

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
          <ConditionalNav items={demos} />
          <MainContent>
            <ConditionalCanvas />
            {children}
          </MainContent>
        </ErrorBoundary>
      </body>
    </html>
  );
}
