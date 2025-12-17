'use client';

import React from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import SceneOverlayController from '#/components/SceneOverlayController';
import ShapeSelector from '#/components/ShapeSelector';
import ShapeTitle from './ShapeTitle';

type Shape = { id: string; name: string; image: string; category: string };
type Product = { id: string; name: string; image: string; category: string };

export default function ShapePanelWrapper({ 
  shapes,
  products 
}: { 
  shapes: Shape[];
  products: Product[];
}) {
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
    <SceneOverlayController section="shape" title="Select Shape" isOpen={isOpen}>
      <ShapeTitle products={products} />
      <div className="mb-3 text-sm leading-relaxed md:text-gray-700">
        Pick a headstone outline. Click any shape to apply it.
      </div>
      <ShapeSelector shapes={shapes} />
    </SceneOverlayController>
  );
}
