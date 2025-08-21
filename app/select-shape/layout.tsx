import React, { Suspense } from 'react';
import db from '#/lib/db';
import ShapeTitle from './shape-title';
import type { Metadata } from 'next';
import type { Product } from '#/lib/db';

export const experimental_ppr = false;

export async function generateMetadata(): Promise<Metadata> {
  const demo = await db.demo.find({ where: { slug: 'select-shape' } });
  const title = demo?.name ?? 'Select Shape';
  return {
    title,
    openGraph: { title, images: [`/api/og?title=${encodeURIComponent(title)}`] },
  };
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  // Pull shapes but pass as products to match <ShapeTitle> props
  const products = (await db.shape.findMany({ limit: 32 })) as unknown as Product[];

  return (
    <div className="p-8 pt-0">
      <Suspense fallback={null}>
        <ShapeTitle products={products} />
      </Suspense>
      <div className="pt-10">
        <Suspense fallback={null}>{children}</Suspense>
      </div>
    </div>
  );
}
