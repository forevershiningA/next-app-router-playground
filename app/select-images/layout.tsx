import React from 'react';
import { type Metadata } from 'next';
import db from '#/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: 'select-images' } });
  return {
    title: demo?.name || 'Add Your Image',
    openGraph: { title: demo?.name || 'Add Your Image', images: [`/api/og?title=${demo?.name || 'Add Your Image'}`] },
  };
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
