'use client';

import { Boundary } from '#/ui/boundary';
import { Tab } from '#/ui/tabs';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice } from '#/lib/xml-parser';

export default function Page() {
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
  const price = catalog
    ? calculatePrice(catalog.product.priceModel, quantity)
    : 0;

  return (
    <Boundary label="(checkout)/page.tsx" className="flex flex-col gap-9">
      <div className="flex">
        <Tab item={{ text: 'Back', slug: 'select-size' }} />
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-gray-300">Checkout</h1>

        <div className="flex flex-col gap-2">
          <div className="text-lg font-semibold text-white">
            Total Price: ${price.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">
            Size: {widthMm}mm x {heightMm}mm (
            {((widthMm * heightMm) / 1000000).toFixed(2)} m²)
          </div>
          <div className="h-2 w-4/5 rounded-full bg-gray-800" />
          <div className="h-2 w-1/3 rounded-full bg-gray-800" />
        </div>
      </div>
    </Boundary>
  );
}
