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

export default async function Layout({ children }: { children: React.ReactNode }) {
  const shapes = await db.shape.findMany({ limit: 32 });

  return <SizeSelector products={shapes}>{children}</SizeSelector>;
}
