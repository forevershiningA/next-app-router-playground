'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TailwindSlider from '#/ui/TailwindSlider';
import SceneOverlayController from '#/components/SceneOverlayController';
import { useHeadstoneStore } from '#/lib/headstone-store';

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
  const catalog = useHeadstoneStore((s) => s.catalog);
  const pathname = usePathname();

  // Get min/max from catalog's first shape's table data, fallback to default values
  const firstShape = catalog?.product?.shapes?.[0];
  const minWidth = firstShape?.table?.minWidth ?? 40;
  const maxWidth = firstShape?.table?.maxWidth ?? 1200;
  const minHeight = firstShape?.table?.minHeight ?? 40;
  const maxHeight = firstShape?.table?.maxHeight ?? 1200;
  
  // Debug logging
  React.useEffect(() => {
    console.log('Size Selector - Catalog:', catalog);
    console.log('Size Selector - First Shape:', firstShape);
    console.log('Size Selector - Min/Max:', { minWidth, maxWidth, minHeight, maxHeight });
  }, [catalog, firstShape, minWidth, maxWidth, minHeight, maxHeight]);

  // Set this as active panel and close addition panel when this panel mounts
  React.useEffect(() => {
    setActivePanel('size');
    if (activePanel === 'addition') {
      setSelectedAdditionId(null);
    }
  }, []); // Run once on mount

  // Close panel when navigating away from /select-size
  React.useEffect(() => {
    if (pathname !== '/select-size') {
      setActivePanel(null);
    }
  }, [pathname, setActivePanel]);

  // Hide this panel when addition, motif, or inscription panels are active, or when not on /select-size route
  const isOpen = pathname === '/select-size' && activePanel !== 'addition' && activePanel !== 'motif' && activePanel !== 'inscription';

  return (
    <SceneOverlayController section="size" title="Select Size" persistKey="size" isOpen={isOpen}>
      <p className="mb-3 text-sm leading-relaxed text-white/85">
        Choose the headstone width &amp; height in millimetres. Thickness is
        computed from size; cemeteries may have regulations on allowable
        dimensions.
      </p>
      <div className="bg-gray-900/50 p-4 space-y-3">
        <TailwindSlider
          label="Width"
          value={widthMm}
          min={minWidth}
          max={maxWidth}
          step={10}
          onChange={setWidthMm}
          unit="mm"
        />
        <TailwindSlider
          label="Height"
          value={heightMm}
          min={minHeight}
          max={maxHeight}
          step={10}
          onChange={setHeightMm}
          unit="mm"
        />
      </div>
    </SceneOverlayController>
  );
}
