'use cache';

import React from 'react';
import db from '#/lib/db';
import { Mdx } from '#/ui/codehike';
import readme from './readme.mdx';
import MaterialTitle from './material-title';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  // Safe lookup: don't throw if slug is missing in demos
  const all = db.demo.findMany();
  const found =
    all.flatMap((cat) => cat.items).find(
      (d) => d.slug === 'material' || d.slug === 'select-material'
    ) ?? null;

  const title = found?.name ?? 'Select Material';
  return {
    title,
    openGraph: {
      title,
      images: [`/api/og?title=${encodeURIComponent(title)}`],
    },
  };
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use materials for this route
  const materials = await db.material.findMany({ limit: 32 });

  return (
    <>
      <div className="p-8 pt-0">
        <MaterialTitle materials={materials} />
        <Mdx source={readme} collapsed={false} />
        <div className="pt-10">
          {children}
        </div>
      </div>
    </>
  );
}
