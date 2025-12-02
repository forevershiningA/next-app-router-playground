import React from 'react';
import { type Metadata } from 'next';
import db from '#/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: 'select-additions' } });
  return {
    title: demo?.name || 'Select Additions',
    openGraph: { title: demo?.name || 'Select Additions', images: [`/api/og?title=${demo?.name || 'Select Additions'}`] },
  };
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
