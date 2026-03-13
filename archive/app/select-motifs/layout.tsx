import React from 'react';
import { type Metadata } from 'next';
import db from '#/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: 'select-motifs' } });
  return {
    title: demo?.name || 'Select Motifs',
    openGraph: { title: demo?.name || 'Select Motifs', images: [`/api/og?title=${demo?.name || 'Select Motifs'}`] },
  };
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
