import React from 'react';
import { type Metadata } from 'next';
import db from '#/lib/db';
import ProductCard from '#/ui/product-card';
import SceneOverlayController from '#/components/SceneOverlayController';
import ShapeTitle from './ShapeTitle';

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: 'select-shape' } });
  return {
    title: demo.name,
    openGraph: { title: demo.name, images: [`/api/og?title=${demo.name}`] },
  };
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // server-side data, pass to a small client list if needed
  const shapes = await db.shape.findMany({ limit: 32 }); // a few featured items
  const products = await db.product.findMany({ limit: 32 });

  return (
    <div className="relative w-full">
      <SceneOverlayController section="shape" title="Select Shape">
        <ShapeTitle products={products} />
        <div className="mb-3 text-sm leading-relaxed text-white/85">
          Pick a headstone outline. Click any card to apply it.
        </div>
        <div className="grid grid-cols-3 gap-3">
          {shapes.map((p) => (
            <ProductCard key={p.id} product={p} type="shape" />
          ))}
        </div>
      </SceneOverlayController>
    </div>
  );
}
