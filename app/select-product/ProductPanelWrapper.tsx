'use client';

import React from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import SceneOverlayController from '#/components/SceneOverlayController';
import ProductCard from '#/ui/product-card';

type Product = { id: string; name: string; image: string; category: string };

export default function ProductPanelWrapper({ products }: { products: Product[] }) {
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
      <SceneOverlayController section="product" title="Select Product">
        <div className="mb-3 text-sm leading-relaxed text-white/85">
          Choose a product. Click any card to apply it.
        </div>

        <div className="grid grid-cols-3 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} type="product" />
          ))}
        </div>
      </SceneOverlayController>
    </div>
  );
}
