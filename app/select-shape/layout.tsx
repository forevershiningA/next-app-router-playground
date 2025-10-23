import React from 'react';
import { type Metadata } from 'next';
import db from '#/lib/db';
import ShapePanelWrapper from './ShapePanelWrapper';

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

  return <ShapePanelWrapper shapes={shapes} products={products} />;
}
