import React from 'react';
import { type Metadata } from 'next';
import db from '#/lib/db';
import MaterialPanelWrapper from './MaterialPanelWrapper';

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: 'select-material' } });
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
  const materials = await db.material.findMany({ limit: 32 });

  return <MaterialPanelWrapper materials={materials} />;
}
