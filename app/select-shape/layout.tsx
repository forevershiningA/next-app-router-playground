'use cache';

import React from 'react';
import db from '#/lib/db';
import { Mdx } from '#/ui/codehike';
import readme from './readme.mdx';
import ShapeTitle from './shape-title';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const demo = await db.demo.find({ where: { slug: 'select-shape' } });
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
  const products = await db.product.findMany({ limit: 32 });

  return (
    <>
    <div className="p-8 pt-0">
      <ShapeTitle products={products} />
      <Mdx source={readme} collapsed={false} />
      <div className="pt-10">
        {children}
        </div>
      </div>
    </>
  );
}
