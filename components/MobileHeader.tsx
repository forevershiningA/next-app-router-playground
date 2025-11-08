'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice } from '#/lib/xml-parser';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { useMemo, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function MobileHeader() {
  const catalog = useHeadstoneStore((s) => s.catalog);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const inscriptionCost = useHeadstoneStore((s) => s.inscriptionCost);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();
  
  // Check if we're on a design list page (product or category level)
  const segments = pathname?.split('/').filter(s => s) || [];
  const isDesignListPage = pathname?.startsWith('/designs/') && (segments.length === 2 || segments.length === 3);

  // Detect desktop for header positioning
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const quantity = useMemo(() => {
    let qty = widthMm * heightMm; // default to area
    if (catalog) {
      const qt = catalog.product.priceModel.quantityType;
      if (qt === 'Width + Height') {
        qty = widthMm + heightMm;
      }
    }
    return qty;
  }, [catalog, widthMm, heightMm]);

  const price = useMemo(() => {
    return catalog
      ? calculatePrice(catalog.product.priceModel, quantity) + inscriptionCost
      : 0;
  }, [catalog, quantity, inscriptionCost]);

  // Don't render header on design list pages or until catalog is loaded
  if (isDesignListPage || !catalog) {
    return null;
  }

  return (
    <header 
      className="fixed top-0 right-0 z-[9999] block border-b border-gray-800 bg-black p-4 transition-[left] duration-300"
      style={{ left: isDesktop ? '400px' : '0' }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent('toggle-sidebar'))
          }
          className="cursor-pointer text-white hover:text-gray-300 lg:hidden"
          aria-label="Toggle navigation sidebar"
          aria-expanded="false"
          type="button"
        >
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-white">
          {catalog.product.name} - {widthMm} x {heightMm} mm ($
          {price.toFixed(2)})
        </h1>
      </div>
    </header>
  );
}
