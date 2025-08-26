'use cache';

import db from '#/lib/db';
import { Boundary } from '#/ui/boundary';
import { Mdx } from '#/ui/codehike';
import { Tabs } from '#/ui/tabs';
import { type Metadata } from 'next';
import Readme from './readme.mdx';

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: 'inscriptions' } });

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
  const demo = db.demo.find({ where: { slug: 'inscriptions' } });
  const sections = db.section.findMany();

  return (
    <>
      <Mdx source={Readme} collapsed={true} />
      {children}
    </>
  );
}
