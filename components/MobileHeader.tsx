'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { data } from '#/app/_internal/_data';
import { getDesignerStepSlug } from '#/lib/designer-route-state';
import { useMobileNavStore } from '#/lib/mobile-nav-store';
import { useSetUnitSystem, useUnitSystem } from '#/lib/use-unit-system';

export default function MobileHeader() {
  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);
  const pathname = usePathname();
  const isMobileMenuOpen = useMobileNavStore((s) => s.isOpen);
  const unitSystem = useUnitSystem();
  const setUnitSystem = useSetUnitSystem();
  
  // Check if we're on a design list page (product or category level)
  const segments = pathname?.split('/').filter(s => s) || [];
  const isDesignListPage = pathname?.startsWith('/designs') && segments.length >= 1;
  const designerStepSlug = getDesignerStepSlug(pathname);
  const isCanvasVisible = Boolean(
    designerStepSlug &&
      ['design-menu', 'select-size', 'inscriptions', 'select-images', 'select-motifs', 'select-material', 'select-additions', 'select-emblems'].includes(
        designerStepSlug,
      ),
  );

  const displayProductName = useMemo(() => {
    // Safety check: Only use catalog name if it matches the selected product ID
    if (catalog?.product?.name && catalog.product.id === productId) {
      return catalog.product.name;
    }
    // Fall back to static product list
    if (!productId) {
      return 'Design Your Own Headstone';
    }
    return data.products.find((p) => p.id === productId)?.name ?? 'Design Your Own Headstone';
  }, [catalog, productId]);

  // Don't render header on design list pages, when catalog isn't ready, when
  // canvas is hidden, or while the mobile left drawer is open (it would overlap
  // the drawer's own header on mobile).
  if (isDesignListPage || !catalog || !isCanvasVisible || isMobileMenuOpen) {
    return null;
  }

  return (
    <header
      className="fixed top-0 right-0 left-0 z-[9999] block h-14 border-b border-[#3a2a1c] bg-[#120c08]/95 px-3.5 shadow-xl shadow-black/25 backdrop-blur-md md:hidden"
    >
      {/* Left padding leaves room for the floating hamburger (see ConditionalNav) */}
      <div className="grid h-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 pl-12">
        <h1 className="truncate text-sm font-semibold leading-tight text-white !m-0 !p-0">
          {displayProductName}
        </h1>
        <div className="flex rounded-full border border-white/10 bg-black/35 p-0.5">
          {[
            { value: 'metric' as const, label: 'mm' },
            { value: 'imperial' as const, label: 'in' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setUnitSystem(option.value)}
              aria-pressed={unitSystem === option.value}
              className={`h-7 min-w-9 rounded-full px-2 text-[10px] font-semibold tracking-wide uppercase transition-colors ${
                unitSystem === option.value
                  ? 'bg-[#cfac6c] text-slate-950'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
