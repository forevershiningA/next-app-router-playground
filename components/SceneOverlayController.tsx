// components/SceneOverlayController.tsx
"use client";

import * as React from "react";
import { useSceneOverlayStore } from "#/lib/scene-overlay-store";

export default function SceneOverlayController({
  section,
  title,
  children,
}: {
  section: "size" | "shape" | "material" | (string & {});
  title?: string;
  children: React.ReactNode; // client-safe content (e.g., InputSlider, ProductCard)
}) {
  const show = useSceneOverlayStore((s) => s.show);
  const hide = useSceneOverlayStore((s) => s.hide);

  React.useEffect(() => {
    show({ section, title, content: children });
    return () => hide();
  }, [section, title, children, show, hide]);

  return null;
}
