'use client';

import React from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import SceneOverlayController from '#/components/SceneOverlayController';
import ProductCard from '#/ui/product-card';

type Material = { id: string; name: string; image: string; category: string };

export default function MaterialPanelWrapper({ materials }: { materials: Material[] }) {
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

  // Hide this panel when addition, motif, or inscription panels are active
  const isOpen = activePanel !== 'addition' && activePanel !== 'motif' && activePanel !== 'inscription';

  return (
    <SceneOverlayController section="material" title="Select Material" isOpen={isOpen}>
      <div className="mb-3 text-sm leading-relaxed text-white/85">
        Choose a stone material to preview on the headstone.
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 w-full">
        {materials.map((p) => (
          <ProductCard key={p.id} product={p} type="material" className="max-w-[128px]" />
        ))}
      </div>
    </SceneOverlayController>
  );
}
