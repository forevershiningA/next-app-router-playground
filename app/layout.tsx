import '#/styles/globals.css';

import db from '#/lib/db';
import { catalog } from '#/lib/catalog-db';
import { data as internalData } from '#/app/_internal/_data';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import ErrorBoundary from '#/components/shared/ErrorBoundary';
import ClientShell from '#/components/app-shell/ClientShell';
import MobileHeader from '#/components/designer/navigation/MobileHeader';
import MainContent from '#/components/app-shell/MainContent';
import ConditionalNav from '#/components/app-shell/ConditionalNav';
import MaterialsLoader from '#/components/designer/catalog/MaterialsLoader';
import ShapesLoader from '#/components/designer/catalog/ShapesLoader';
import BordersLoader from '#/components/designer/catalog/BordersLoader';
import { ThemeProvider } from '#/components/theme/ThemeProvider';
import { ThemeToggle } from '#/components/theme/ThemeToggle';
import {
  mapMaterialRecord,
  mapShapeRecord,
  mapBorderRecord,
} from '#/lib/catalog-mappers';
import type { ShapeOption } from '#/lib/headstone-store';

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
  title: {
    default: 'Design Your Own Headstone Online | Forever Shining',
    template: '%s | Forever Shining',
  },
  metadataBase: new URL('https://forevershining.org'),
  description:
    'Design custom headstones, grave markers and memorial plaques online in the USA with live 3D preview, personalized inscriptions, photos and clear pricing.',
  openGraph: {
    title: 'Design Your Own Headstone Online | Forever Shining',
    description:
      'Create a personalized headstone, grave marker or memorial plaque online with live 3D preview for families across the United States.',
    images: [`/api/og?title=Design Your Own Headstone`],
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0c0b0a' },
    { media: '(prefers-color-scheme: light)', color: '#f7f4ee' },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demos = db.demo.findMany();

  let rawMaterials: Awaited<ReturnType<typeof catalog.materials.findMany>> = [];
  let rawShapes: Awaited<ReturnType<typeof catalog.shapes.findMany>> = [];

  // Check if database is configured (skip in development without DATABASE_URL)
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  if (hasDatabase) {
    try {
      [rawMaterials, rawShapes] = await Promise.all([
        catalog.materials.findMany({ where: { isActive: true }, limit: 200 }),
        catalog.shapes.findMany({ where: { isActive: true }, limit: 200 }),
      ]);
    } catch (error) {
      // Database query failed, will use _data.ts fallbacks below
      console.warn('Database unavailable, using local data from _data.ts');
    }
  } else {
    console.log('DATABASE_URL not set, using local data from _data.ts');
  }

  // Map database records or use fallbacks from _data.ts
  const materials =
    rawMaterials.length > 0
      ? rawMaterials.map(mapMaterialRecord)
      : internalData.materials.map((m) => ({
          id: m.id,
          name: m.name,
          category: m.category,
          image: m.image,
        }));

  const fallbackShapes = internalData.shapes.map((shape) => ({
    id: shape.id,
    name: shape.name,
    category: shape.category,
    image: shape.image,
  }));
  const shapes =
    rawShapes.length > 0
      ? (() => {
          // The catalog can contain only the core shape set. Keep its records
          // authoritative while retaining locally shipped category-only shapes.
          const shapesByAsset = new Map<string, ShapeOption>(
            fallbackShapes.map((shape) => [shape.image ?? shape.id, shape]),
          );
          for (const shape of rawShapes.map(mapShapeRecord)) {
            shapesByAsset.set(shape.image ?? shape.id, shape);
          }
          return [...shapesByAsset.values()];
        })()
      : fallbackShapes;

  // Use borders from _data.ts (bronze borders for Bronze Plaque)
  const borders = internalData.borders.map((border) => ({
    id: border.id,
    name: border.name,
    category: border.category,
    image: border.image,
  }));

  return (
    <html
      lang="en-US"
      data-theme="dark"
      className="[color-scheme:dark]"
      suppressHydrationWarning
    >
      {/* Prevent flash-of-unstyled-content: read theme from localStorage before first paint */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('fs_ui_theme');if(t==='day'){document.documentElement.setAttribute('data-theme','day');document.documentElement.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`overflow-y-scroll font-sans ${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
        style={{ background: 'transparent' }}
      >
        <ThemeProvider>
          <ErrorBoundary>
            <ClientShell />
            <MaterialsLoader materials={materials} />
            <ShapesLoader shapes={shapes} />
            <BordersLoader borders={borders} />
            <MobileHeader />
            <ConditionalNav items={demos} />
            <MainContent>{children}</MainContent>
            <ThemeToggle />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
