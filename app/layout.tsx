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
import MaterialsLoader from '#/components/MaterialsLoader';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: { default: 'Design Your Own Headstone', template: '%s | DYO Headstones' },
  metadataBase: new URL('https://forevershining.org'),
  description:
    'Design custom memorial headstones online with real-time 3D visualization. Choose from 30+ premium materials, personalize inscriptions, add laser-etched photos and decorative elements.',
  openGraph: {
    title: 'Design Your Own Headstone - Interactive 3D Memorial Design',
    description:
      'Create a personalized memorial headstone with our interactive 3D design studio. Select shapes, materials, inscriptions, and decorations with instant visualization.',
    images: [`/api/og?title=Design Your Own Headstone`],
  },
  twitter: { card: 'summary_large_image' },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demos = db.demo.findMany();
  const materials = await db.material.findMany({ limit: 100 });
  
  return (
    <html lang="en" className="[color-scheme:dark]">
      <body
        className={`overflow-y-scroll bg-black font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <RouterBinder /> {/* ← mount once, early */}
          <MaterialsLoader materials={materials} />
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
