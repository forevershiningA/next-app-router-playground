import React from "react";
import { type Metadata } from "next";
import db from "#/lib/db";
import SceneOverlayController from "#/components/SceneOverlayController";
import InscriptionOverlayPanel from "#/app/inscriptions/InscriptionOverlayPanel";

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: "inscriptions" } });
  return {
    title: demo.name,
    openGraph: { title: demo.name, images: [`/api/og?title=${demo.name}`] },
  };
}

export default async function Layout() {
  return (
    <div className="relative w-full">
      <SceneOverlayController section="inscriptions" title="Add Your Inscription">
        <InscriptionOverlayPanel />
      </SceneOverlayController>
    </div>
  );
}
