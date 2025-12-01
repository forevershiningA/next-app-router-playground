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
    <nav className="overflow-y-auto h-full">
      {/* Product Header - shown when catalog is loaded */}
      {catalog && (
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm p-4">
          <h1 className="text-lg font-semibold text-slate-800">
            {catalog.product.name}
            <br />
            <span className="text-slate-600">{widthMm} x {heightMm} mm (${price.toFixed(2)})</span>
          </h1>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/ico/forever-transparent-logo.png" alt="Forever Logo" className="mb-4" />
        </Link>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-serif font-light text-slate-800 tracking-tight">
            3D Designer
          </h2>
          <Link
            href="/designs"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium shadow-md hover:shadow-lg"
          >
            Browse Designs
          </Link>
        </div>
        <p className="text-sm text-slate-600 font-light">
          Design your perfect memorial
        </p>
      </div>

      {/* Menu Items */}
      <div className="p-4">
        <div className="mb-3 px-3 font-mono text-xs font-semibold tracking-wider text-slate-500 uppercase">
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
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all ${
                  isActive 
                    ? 'text-slate-900 bg-white shadow-sm border border-slate-200' 
                    : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
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
