import React, { Suspense } from "react";
import { type Metadata } from "next";
import db from "#/lib/db";
import { Mdx } from "#/ui/codehike";
import Readme from "./readme.mdx";
import InputSlider from "#/ui/InputSlider";
import SceneOverlayController from "#/components/SceneOverlayController";

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: "select-size" } });
  return { title: demo.name, openGraph: { title: demo.name, images: [`/api/og?title=${demo.name}`] } };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full">
      <SceneOverlayController section="size">
        <p className="text-sm leading-relaxed text-white/85 mb-3">
          Choose the headstone width &amp; height in millimetres. Thickness is computed from size;
          cemeteries may have regulations on allowable dimensions.
        </p>
        <div className="space-y-3">
          <InputSlider type="width" />
          <InputSlider type="height" />
        </div>
      </SceneOverlayController>

      {/* Mobile fallback below the canvas if you still want MDX */}
      <div className="md:hidden p-8 pt-0">
        <h1 className="text-xl font-semibold text-gray-300">Select Size</h1>
        <div className="text-sm text-gray-600">
          <Suspense fallback={null}>
            <Mdx source={Readme} collapsed={true} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
