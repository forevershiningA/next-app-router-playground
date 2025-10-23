'use client';

import React from 'react';
import TailwindSlider from '#/ui/TailwindSlider';
import SceneOverlayController from '#/components/SceneOverlayController';
import { useHeadstoneStore } from '#/lib/headstone-store';
import OverlayTitle from '#/ui/overlay-title';

type Product = { id: string; name: string; image: string; category: string };

export default function SizeSelector({
  children,
  products,
}: {
  children: React.ReactNode;
  products: Product[];
}) {
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const setWidthMm = useHeadstoneStore((s) => s.setWidthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const setHeightMm = useHeadstoneStore((s) => s.setHeightMm);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  // Close addition panel when this panel mounts
  React.useEffect(() => {
    if (activePanel === 'addition') {
      setSelectedAdditionId(null);
      setActivePanel(null);
    }
  }, []); // Run once on mount

  return (
    <div className="relative w-full">
      <SceneOverlayController section="size" title="Select Size" persistKey="size">
        <p className="mb-3 text-sm leading-relaxed text-white/85">
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
    </div>
  );
}
