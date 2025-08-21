import React, { Suspense } from 'react';
import db from '#/lib/db';
import { Mdx } from '#/ui/codehike';
import readme from './readme.mdx';
import MaterialTitle from './material-title';
import type { Metadata } from 'next';

export const experimental_ppr = false;

type DemoItem = { slug: string; name: string; description: string };
function isDemoItem(x: any): x is DemoItem {
  return x && typeof x.slug === 'string' && typeof x.name === 'string' && typeof x.description === 'string';
}

export async function generateMetadata(): Promise<Metadata> {
  const all = db.demo.findMany();
  const items: DemoItem[] = all.flatMap((cat: any) => cat?.items ?? []).filter(isDemoItem);
  const found = items.find((d) => d.slug === 'material' || d.slug === 'select-material') ?? null;
  const title = found?.name ?? 'Select Material';
  return {
    title,
    openGraph: { title, images: [`/api/og?title=${encodeURIComponent(title)}`] },
  };
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const materials = await db.material.findMany({ limit: 32 });
  return (
    <div className="p-8 pt-0">
      <Suspense fallback={null}>
        <MaterialTitle materials={materials} />
      </Suspense>
      <Mdx source={readme} collapsed={false} />
      <div className="pt-10">
        <Suspense fallback={null}>{children}</Suspense>
      </div>
    </div>
  );
}
