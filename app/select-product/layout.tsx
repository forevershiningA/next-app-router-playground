import React from 'react';
import { type Metadata } from 'next';
import db from '#/lib/db';
import ProductPanelWrapper from './ProductPanelWrapper';

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

  return <ProductPanelWrapper products={products} />;
}
