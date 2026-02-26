import '#/styles/globals.css';

import db from '#/lib/db';
import { catalog } from '#/lib/catalog-db';
import { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import ErrorBoundary from '#/components/ErrorBoundary';
import RouterBinder from '#/components/system/RouterBinder';
import MobileHeader from '#/components/MobileHeader';
import MainContent from '#/components/MainContent';
import ConditionalCanvas from '#/components/ConditionalCanvas';
import ConditionalNav from '#/components/ConditionalNav';
import MaterialsLoader from '#/components/MaterialsLoader';
import DefaultDesignLoader from '#/components/DefaultDesignLoader';
import ShapesLoader from '#/components/ShapesLoader';
import BordersLoader from '#/components/BordersLoader';
import MotifsLoader from '#/components/MotifsLoader';
import {
  mapMaterialRecord,
  mapShapeRecord,
  mapBorderRecord,
  mapMotifRecord,
} from '#/lib/catalog-mappers';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});
const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
  weight: ['400', '600'],
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

  let rawMaterials: Awaited<ReturnType<typeof catalog.materials.findMany>> = [];
  let rawShapes: Awaited<ReturnType<typeof catalog.shapes.findMany>> = [];
  let rawBorders: Awaited<ReturnType<typeof catalog.borders.findMany>> = [];
  let rawMotifs: Awaited<ReturnType<typeof catalog.motifs.findMany>> = [];

  try {
    [rawMaterials, rawShapes, rawBorders, rawMotifs] = await Promise.all([
      catalog.materials.findMany({ where: { isActive: true }, limit: 200 }),
      catalog.shapes.findMany({ where: { isActive: true }, limit: 200 }),
      catalog.borders.findMany({ where: { isActive: true }, limit: 200 }),
      catalog.motifs.findMany({ where: { isActive: true }, limit: 500 }),
    ]);
  } catch (error) {
    console.error('Failed to load catalog data, using empty fallbacks', error);
  }

  const materials = rawMaterials.map(mapMaterialRecord);
  const shapes = rawShapes.map(mapShapeRecord);
  const borders = rawBorders.map(mapBorderRecord);
  const motifs = rawMotifs.map(mapMotifRecord);
  
  return (
    <html lang="en" className="[color-scheme:dark]">
      <body
        className={`overflow-y-scroll font-sans ${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
        style={{ background: 'transparent' }}
      >
        <ErrorBoundary>
          <RouterBinder /> {/* ← mount once, early */}
          <DefaultDesignLoader />
          <MaterialsLoader materials={materials} />
          <ShapesLoader shapes={shapes} />
          <BordersLoader borders={borders} />
          <MotifsLoader motifs={motifs} />
          <MobileHeader />
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
