'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice, computeQuantity } from '#/lib/xml-parser';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { data } from '#/app/_internal/_data';
import { formatDimensionPair } from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';
import { getDesignerStepSlug } from '#/lib/designer-route-state';
import { useMobileNavStore } from '#/lib/mobile-nav-store';

export default function MobileHeader() {
  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const baseWidthMm = useHeadstoneStore((s) => s.baseWidthMm);
  const baseHeightMm = useHeadstoneStore((s) => s.baseHeightMm);
  const baseThickness = useHeadstoneStore((s) => s.baseThickness);
  const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const inscriptionCost = useHeadstoneStore((s) => s.inscriptionCost);
  const motifCost = useHeadstoneStore((s) => s.motifCost);
  const unitSystem = useUnitSystem();
  const pathname = usePathname();
  const isMobileMenuOpen = useMobileNavStore((s) => s.isOpen);
  
  // Check if we're on a design list page (product or category level)
  const segments = pathname?.split('/').filter(s => s) || [];
  const isDesignListPage = pathname?.startsWith('/designs') && segments.length >= 1;
  const designerStepSlug = getDesignerStepSlug(pathname);
  const isCanvasVisible = Boolean(
    designerStepSlug &&
      ['select-size', 'inscriptions', 'select-motifs', 'select-material', 'select-additions'].includes(
        designerStepSlug,
      ),
  );

  const quantity = useMemo(() => {
    if (!catalog) return widthMm * heightMm;
    return computeQuantity(catalog.product.priceModel, { width: widthMm, height: heightMm, depth: uprightThickness });
  }, [catalog, widthMm, heightMm, uprightThickness]);

  const baseQuantity = useMemo(() => {
    if (!showBase || !catalog?.product?.basePriceModel) return 0;
    return computeQuantity(catalog.product.basePriceModel, { width: baseWidthMm, height: baseHeightMm, depth: baseThickness });
  }, [catalog, baseWidthMm, baseHeightMm, baseThickness, showBase]);

  const price = useMemo(() => {
    const headstonePrice = catalog
      ? calculatePrice(catalog.product.priceModel, quantity)
      : 0;
    const basePrice = showBase && catalog?.product?.basePriceModel
      ? calculatePrice(catalog.product.basePriceModel, baseQuantity)
      : 0;
    return headstonePrice + basePrice + inscriptionCost + motifCost;
  }, [catalog, quantity, baseQuantity, inscriptionCost, motifCost, showBase]);
  
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

  const dimensionLabel = useMemo(
    () => formatDimensionPair(widthMm, heightMm, unitSystem),
    [widthMm, heightMm, unitSystem],
  );

  // Don't render header on design list pages, when catalog isn't ready, when
  // canvas is hidden, or while the mobile left drawer is open (it would overlap
  // the drawer's own header on mobile).
  if (isDesignListPage || !catalog || !isCanvasVisible || isMobileMenuOpen) {
    return null;
  }

  return (
    <header
      className="fixed top-0 right-0 left-0 z-[9999] block border-b border-gray-800 bg-black p-4 md:hidden"
    >
      {/* Left padding leaves room for the floating hamburger (see ConditionalNav) */}
      <div className="flex items-center pl-12">
        <h1 className="truncate text-lg font-semibold text-white !m-0 !p-0">
          {displayProductName} - {dimensionLabel} ($
          {price.toFixed(2)})
        </h1>
      </div>
    </header>
  );
}
