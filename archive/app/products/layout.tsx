// app/products/layout.tsx
// SEO-focused layout without 3D scene
// These are landing pages, not design pages
import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <div data-seo-page="true" className="relative min-h-screen bg-black">
      {/* SEO landing pages - no 3D canvas */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
