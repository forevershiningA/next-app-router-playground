import React from 'react';
import { type Metadata } from 'next';
import db from '#/lib/db';
import ProductCard from '#/ui/product-card';
import SceneOverlayController from '#/components/SceneOverlayController';

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: 'select-material' } });
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
  const materials = await db.material.findMany({ limit: 32 });

  return (
    <div className="relative w-full">
      <SceneOverlayController section="material" title="Select Material">
        <div className="mb-3 text-sm leading-relaxed text-white/85">
          Choose a stone material to preview on the headstone.
        </div>
        <div className="grid max-h-[320px] grid-cols-3 gap-3 overflow-auto pr-1 max-md:flex max-md:max-h-none max-md:flex-row max-md:gap-2 max-md:overflow-x-auto max-md:pb-2">
          {materials.map((p) => (
            <ProductCard key={p.id} product={p} type="material" />
          ))}
        </div>
      </SceneOverlayController>
    </div>
  );
}
