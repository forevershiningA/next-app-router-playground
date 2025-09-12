// app/inscriptions/layout.tsx
import React from "react";
import { type Metadata } from "next";
import db from "#/lib/db";
// If your panel lives elsewhere, update the import accordingly:
import InscriptionOverlayPanel from "#/app/inscriptions/InscriptionOverlayPanel";
// or: import InscriptionOverlayPanel from "#/components/panels/InscriptionOverlayPanel";

export async function generateMetadata(): Promise<Metadata> {
  const demo = db.demo.find({ where: { slug: "inscriptions" } });
  return {
    title: demo.name,
    openGraph: { title: demo.name, images: [`/api/og?title=${demo.name}`] },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full">
      {/* Render ONLY the panel; it already wraps itself with SceneOverlayController */}
      <InscriptionOverlayPanel />
    </div>
  );
}
