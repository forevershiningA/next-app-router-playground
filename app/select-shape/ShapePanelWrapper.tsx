'use client';

import React from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import SceneOverlayController from '#/components/SceneOverlayController';
import ProductCard from '#/ui/product-card';
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

  return (
    <div className="relative w-full">
      <SceneOverlayController section="shape" title="Select Shape">
        <ShapeTitle products={products} />
        <div className="mb-3 text-sm leading-relaxed text-white/85">
          Pick a headstone outline. Click any card to apply it.
        </div>
        <div className="grid grid-cols-3 gap-3">
          {shapes.map((p) => (
            <ProductCard key={p.id} product={p} type="shape" />
          ))}
        </div>
      </SceneOverlayController>
    </div>
  );
}
