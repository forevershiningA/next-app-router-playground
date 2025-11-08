// app/inscriptions/layout.tsx
import React from 'react';
import { type Metadata } from 'next';
import db from '#/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: 'inscriptions' } });
  return {
    title: demo.name,
    openGraph: { title: demo.name, images: [`/api/og?title=${demo.name}`] },
  };
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* InscriptionOverlayPanel is now rendered globally in ConditionalCanvas */}
      {children}
    </>
  );
}
