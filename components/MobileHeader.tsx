'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice } from '#/lib/xml-parser';
import { Bars3Icon } from '@heroicons/react/24/solid';

export default function MobileHeader() {
  const catalog = useHeadstoneStore((s) => s.catalog);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);

  let quantity = widthMm * heightMm; // default to area
  if (catalog) {
    const qt = catalog.product.priceModel.quantityType;
    if (qt === 'Width + Height') {
      quantity = widthMm + heightMm;
    }
  }
  const inscriptionCost = useHeadstoneStore((s) => s.inscriptionCost);

  const price = catalog
    ? calculatePrice(catalog.product.priceModel, quantity) + inscriptionCost
    : 0;

  return (
    <div className="fixed top-0 right-0 left-0 z-[9999] block border-b border-gray-800 bg-[rgba(0,0,0,0.7)] p-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent('toggle-sidebar'))
          }
          className="cursor-pointer text-white hover:text-gray-300"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-semibold text-white">
          {catalog?.product.name} - {widthMm} x {heightMm} mm ($
          {price.toFixed(2)})
        </h2>
      </div>
    </div>
  );
}
