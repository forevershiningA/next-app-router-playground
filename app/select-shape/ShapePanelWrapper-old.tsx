'use client';

import React from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import SceneOverlayController from '#/components/SceneOverlayController';
import ProductCard from '#/ui/product-card';
import ShapeTitle from './ShapeTitle';
import { createPortal } from 'react-dom';

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
  const [inlineSlot, setInlineSlot] = React.useState<HTMLElement | null>(null);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [showContent, setShowContent] = React.useState(false);

  // Close addition panel when this panel mounts
  React.useEffect(() => {
    if (activePanel === 'addition') {
      setSelectedAdditionId(null);
      setActivePanel(null);
    }
  }, []); // Run once on mount

  // Find the inline slot element and detect desktop
  React.useEffect(() => {
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      
      if (desktop) {
        const slot = document.getElementById('select-shape-inline-slot');
        setInlineSlot(slot);
      } else {
        setInlineSlot(null);
      }
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Fade in content after slot is found
  React.useEffect(() => {
    // Reset opacity when component mounts
    setShowContent(false);
    
    if ((isDesktop && inlineSlot) || !isDesktop) {
      const timer = setTimeout(() => setShowContent(true), 50);
      return () => {
        clearTimeout(timer);
        setShowContent(false);
      };
    }
  }, [isDesktop, inlineSlot]);

  const content = (
    <SceneOverlayController section="shape" title="Select Shape">
      <ShapeTitle products={products} />
      <div className="mb-3 text-sm leading-relaxed text-white/85">
        Pick a headstone outline. Click any card to apply it.
      </div>
      <div className="grid grid-cols-3 gap-2 w-full">
        {shapes.map((p) => (
          <ProductCard key={p.id} product={p} type="shape" />
        ))}
      </div>
    </SceneOverlayController>
  );

  // Render into sidebar slot on desktop, normal position otherwise
  if (isDesktop && inlineSlot) {
    return createPortal(
      <div className={`transition-opacity duration-200 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {content}
      </div>,
      inlineSlot
    );
  }

  // On desktop, don't render in normal position while waiting for slot
  if (isDesktop && !inlineSlot) {
    return null;
  }

  return <div className={`relative w-full transition-opacity duration-200 ${showContent ? 'opacity-100' : 'opacity-0'}`}>{content}</div>;
}
