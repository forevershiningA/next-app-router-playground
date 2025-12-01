'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  // Set this as active panel and close addition panel when this panel mounts
  React.useEffect(() => {
    setActivePanel('shape');
    if (activePanel === 'addition') {
      setSelectedAdditionId(null);
    }
  }, []); // Run once on mount

  // Close panel when navigating away from /select-shape
  React.useEffect(() => {
    if (pathname !== '/select-shape') {
      setActivePanel(null);
    }
  }, [pathname, setActivePanel]);

  // Hide this panel when addition, motif, or inscription panels are active, or when not on /select-shape route
  const isOpen = pathname === '/select-shape' && activePanel !== 'addition' && activePanel !== 'motif' && activePanel !== 'inscription';

  return (
    <SceneOverlayController section="shape" title="Select Shape" isOpen={isOpen}>
      <ShapeTitle products={products} />
      <div className="mb-3 text-sm leading-relaxed md:text-gray-700 text-white/85">
        Pick a headstone outline. Click any card to apply it.
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 w-full">
        {shapes.map((p) => (
          <ProductCard key={p.id} product={p} type="shape" className="max-w-[128px]" />
        ))}
      </div>
    </SceneOverlayController>
  );
}
