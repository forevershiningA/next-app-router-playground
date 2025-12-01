'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CubeIcon,
  Squares2X2Icon,
  ArrowsPointingOutIcon,
  SwatchIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  SparklesIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice } from '#/lib/xml-parser';

// Menu items with icons
const menuItems = [
  { slug: 'select-product', name: 'Select Product', icon: CubeIcon },
  { slug: 'select-shape', name: 'Select Shape', icon: Squares2X2Icon },
  { slug: 'select-size', name: 'Select Size', icon: ArrowsPointingOutIcon },
  { slug: 'select-material', name: 'Select Material', icon: SwatchIcon },
  { slug: 'inscriptions', name: 'Inscriptions', icon: DocumentTextIcon },
  { slug: 'select-additions', name: 'Select Additions', icon: PlusCircleIcon },
  { slug: 'select-motifs', name: 'Select Motifs', icon: SparklesIcon },
  { slug: 'check-price', name: 'Check Price', icon: CurrencyDollarIcon },
];

export default function DesignerNav() {
  const pathname = usePathname();
  
  // Get catalog info
  const catalog = useHeadstoneStore((s) => s.catalog);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  let quantity = widthMm * heightMm;
  if (catalog) {
    const qt = catalog.product.priceModel.quantityType;
    if (qt === 'Width + Height') {
      quantity = widthMm + heightMm;
    }
  }
  const price = catalog ? calculatePrice(catalog.product.priceModel, quantity) : 0;

  const handleMenuClick = (slug: string, e: React.MouseEvent) => {
    if (slug === 'check-price') {
      e.preventDefault();
      setActivePanel('checkprice');
    }
  };

  return (
    <nav className="overflow-y-auto h-full bg-black">
      {/* Product Header - shown when catalog is loaded */}
      {catalog && (
        <div className="border-b border-gray-800 bg-black p-4">
          <h1 className="text-lg font-semibold text-white">
            {catalog.product.name}
            <br />
            {widthMm} x {heightMm} mm (${price.toFixed(2)})
          </h1>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/ico/forever-transparent-logo.png" alt="Forever Logo" className="mb-4" />
        </Link>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-serif font-light text-white tracking-tight">
            3D Designer
          </h2>
          <Link
            href="/designs"
            className="px-3 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-all text-sm font-medium"
          >
            Browse Designs
          </Link>
        </div>
        <p className="text-sm text-gray-400 font-light">
          Design your perfect memorial
        </p>
      </div>

      {/* Menu Items */}
      <div className="p-4">
        <div className="mb-2 px-3 font-mono text-sm font-semibold tracking-wide text-gray-600 uppercase">
          Design Tools
        </div>
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === `/${item.slug}`;
            
            return (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                onClick={(e) => handleMenuClick(item.slug, e)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  isActive 
                    ? 'text-white bg-gray-800' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
