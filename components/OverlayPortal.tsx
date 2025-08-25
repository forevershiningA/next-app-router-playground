// components/OverlayPortal.tsx
"use client";

import * as React from "react";
import { createPortal } from "react-dom";

/**
 * Generic portal for 2D overlays.
 * Defaults to a top-level #overlay-root mounted under <body>.
 */
export default function OverlayPortal({
  children,
  containerId = "overlay-root",
}: {
  children: React.ReactNode;
  containerId?: string;
}) {
  const [el, setEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let container = document.getElementById(containerId) as HTMLElement | null;

    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      // make it a full-viewport layer above the app
      container.style.position = "fixed";
      container.style.inset = "0";
      container.style.pointerEvents = "none";
      container.style.zIndex = "1200";
      document.body.appendChild(container);
    }

    setEl(container);
  }, [containerId]);

  if (!el) return null;

  // Let children decide which parts are interactive (use .pointer-events-auto inside)
  return createPortal(children, el);
}
