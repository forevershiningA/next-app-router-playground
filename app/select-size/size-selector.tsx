
"use client";

import React from "react";
import TailwindSlider from "#/ui/TailwindSlider";
import SceneOverlayController from "#/components/SceneOverlayController";
import { useHeadstoneStore } from "#/lib/headstone-store";

export default function SizeSelector({ children }: { children: React.ReactNode }) {
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const setWidthMm = useHeadstoneStore((s) => s.setWidthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const setHeightMm = useHeadstoneStore((s) => s.setHeightMm);

  return (
    <div className="relative w-full">
      <SceneOverlayController
        section="size"
        title="Select Size"
        persistKey="size"
      >
        <p className="text-sm leading-relaxed text-white/85 mb-3">
          Choose the headstone width &amp; height in millimetres. Thickness is
          computed from size; cemeteries may have regulations on allowable
          dimensions.
        </p>
        <div className="space-y-3">
          <TailwindSlider
            label="Width"
            value={widthMm}
            min={300}
            max={1200}
            step={10}
            onChange={setWidthMm}
            unit="mm"
          />
          <TailwindSlider
            label="Height"
            value={heightMm}
            min={300}
            max={1200}
            step={10}
            onChange={setHeightMm}
            unit="mm"
          />
        </div>
      </SceneOverlayController>

      {children}
    </div>
  );
}
