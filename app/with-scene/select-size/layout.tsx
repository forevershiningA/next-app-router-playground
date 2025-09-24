import React, { Suspense } from 'react';
import { type Metadata } from 'next';
import db from '#/lib/db';
import { Mdx } from '#/ui/codehike';
import Readme from './readme.mdx';
import SizeSelector from './size-selector';

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: 'select-size' } });
  return {
    title: demo.name,
    openGraph: { title: demo.name, images: [`/api/og?title=${demo.name}`] },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SizeSelector>
      {/* Mobile fallback below the canvas if you still want MDX */}
      <div className="p-8 pt-0 md:hidden">
        <h1 className="text-xl font-semibold text-gray-300">Select Size</h1>
        <div className="text-sm text-gray-600">
          <Suspense fallback={null}>
            <Mdx source={Readme} collapsed={true} />
          </Suspense>
        </div>
      </div>
    </SizeSelector>
  );
}
