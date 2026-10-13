import '#/styles/globals.css';

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import ErrorBoundary from '#/components/shared/ErrorBoundary';
import ClientShell from '#/components/app-shell/ClientShell';
import MobileHeader from '#/components/designer/navigation/MobileHeader';
import MainContent from '#/components/app-shell/MainContent';
import ConditionalNav from '#/components/app-shell/ConditionalNav';
import DesignerCatalogLoader from '#/components/designer/catalog/DesignerCatalogLoader';
import { ThemeProvider } from '#/components/theme/ThemeProvider';
import { ThemeToggle } from '#/components/theme/ThemeToggle';

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
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0c0b0a' },
    { media: '(prefers-color-scheme: light)', color: '#f7f4ee' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <DesignerCatalogLoader />
            <MobileHeader />
            <ConditionalNav />
            <MainContent>{children}</MainContent>
            <ThemeToggle />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
