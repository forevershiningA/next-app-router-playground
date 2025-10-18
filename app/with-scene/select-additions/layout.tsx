import React from 'react';
import { type Metadata } from 'next';
import db from '#/lib/db';
import SceneOverlayController from '#/components/SceneOverlayController';
import AdditionCard from '#/app/select-additions/AdditionCard';

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: 'select-additions' } });
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
  const additions = await db.addition.findMany({ limit: 100 });

  return (
    <div className="relative w-full">
      <SceneOverlayController section="additions" title="Select Additions">
        <div className="mb-3 text-sm leading-relaxed text-white/85">
          Choose decorative additions for your headstone. Click any card to add or remove it.
        </div>
        <div className="grid grid-cols-3 gap-3">
          {additions.map((addition) => (
            <AdditionCard key={addition.id} addition={addition} />
          ))}
        </div>
      </SceneOverlayController>
    </div>
  );
}
