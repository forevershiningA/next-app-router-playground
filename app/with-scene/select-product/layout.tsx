import React from 'react';
import { type Metadata } from 'next';
import db from '#/lib/db';
import ProductCard from '#/ui/product-card';
import SceneOverlayController from '#/components/SceneOverlayController';

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: 'select-product' } });
  return {
    title: demo.name,
    openGraph: { title: demo.name, images: [`/api/og?title=${demo.name}`] },
  };
}

export default async function Layout() {
  // fetch a handful to keep overlay snappy (tweak limit as you like)
  const products = await db.product.findMany({ limit: 32 });

  return (
    <div className="relative w-full">
      <SceneOverlayController section="product" title="Select Product">
        <div className="mb-3 text-sm leading-relaxed text-white/85">
          Choose a product. Click any card to apply it.
        </div>

        <div className="grid max-h-[320px] grid-cols-3 gap-3 overflow-auto pr-1">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} type="product" />
          ))}
        </div>
      </SceneOverlayController>
    </div>
  );
}
