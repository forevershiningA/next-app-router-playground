import React from 'react';
import { type Metadata } from 'next';
import db from '#/lib/db';
import { Boundary } from '#/ui/boundary';
import Readme from './readme.mdx';
import { Mdx } from '#/ui/codehike';
import InputSlider from '#/ui/InputSlider';

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: 'select-size' } });

  return {
    title: demo.name,
    openGraph: { title: demo.name, images: [`/api/og?title=${demo.name}`] },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <>
      <div className="p-8 pt-0">
        <h1 className="text-xl font-semibold text-gray-300">
          Select Size
        </h1>
        <Mdx source={Readme} collapsed={true} />
        <div className="pt-4 pb-10">
          <InputSlider type={"width"} />
          <InputSlider type={"height"} />
        </div>
      </div>
    </>
  );
}
