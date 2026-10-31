'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { MoonIcon, Squares2X2Icon, SunIcon } from '@heroicons/react/24/outline';
import { useShallow } from 'zustand/react/shallow';
import { GuidedQuickNavItems } from '#/components/designer/navigation/GuidedQuickNavItems';
import { useMobileNavStore } from '#/lib/mobile-nav-store';
import { useHeadstoneStore } from '#/lib/headstone-store';
import {
  calculateCheckPriceBorderPrice,
  calculateCheckPriceProductPrices,
} from '#/lib/check-price-calculations';
import { formatDimensionPair } from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';
import { formatAudPrice } from '#/lib/currency';
import { useCurrency } from '#/lib/use-currency';

type MobileDesignerNavigationOverlaysProps = {
  currentPanelIndex: number;
  panelCount: number;
  title: string | undefined;
  activeFullscreenPanel: string | null;
  guidedQuickNavSlugs: string[];
  productId: string | null;
  handleBackToMenu: () => void;
  toggleTheme: () => void;
  isDayTheme: boolean;
  prevPanelSlug: string | null;
  nextPanelSlug: string | null;
  prevPanelTitle: string | undefined;
  nextPanelTitle: string | undefined;
  isImageCropActive: boolean;
  designerStepSlug: string | null;
  onNavigate: (slug: string) => void | Promise<void>;
};

export default function MobileDesignerNavigationOverlays({
  currentPanelIndex,
  panelCount,
  title,
  activeFullscreenPanel,
  guidedQuickNavSlugs,
  productId,
  handleBackToMenu,
  toggleTheme,
  isDayTheme,
  prevPanelSlug,
  nextPanelSlug,
  prevPanelTitle,
  nextPanelTitle,
  isImageCropActive,
  designerStepSlug,
  onNavigate,
}: MobileDesignerNavigationOverlaysProps) {
  const isMobileNavOpen = useMobileNavStore((state) => state.isOpen);
  const isSizeAdjustmentCompact = useMobileNavStore(
    (state) => state.isSizeAdjustmentCompact,
  );
  const isBottomSheetCollapsed = useMobileNavStore(
    (state) => state.isBottomSheetCollapsed,
  );
  const hasSelectedImages = useHeadstoneStore(
    (state) => state.selectedImages.length > 0,
  );
  const chipState = useHeadstoneStore(
    useShallow((state) => ({
      catalog: state.catalog,
      productId: state.productId,
      shapeUrl: state.shapeUrl,
      shapes: state.shapes,
      editingObject: state.editingObject,
      widthMm: state.widthMm,
      heightMm: state.heightMm,
      uprightThickness: state.uprightThickness,
      headstoneMaterialUrl: state.headstoneMaterialUrl,
      fixedSizes: state.fixedSizes,
      showBase: state.showBase,
      baseWidthMm: state.baseWidthMm,
      baseHeightMm: state.baseHeightMm,
      baseThickness: state.baseThickness,
      ledgerWidthMm: state.ledgerWidthMm,
      ledgerHeightMm: state.ledgerHeightMm,
      kerbWidthMm: state.kerbWidthMm,
      kerbHeightMm: state.kerbHeightMm,
      borderName: state.borderName,
      imageCost: state.imageCost,
      inscriptionCost: state.inscriptionCost,
      motifCost: state.motifCost,
      additionCost: state.additionCost,
      emblemCost: state.emblemCost,
      setActivePanel: state.setActivePanel,
    })),
  );
  const unitSystem = useUnitSystem();
  const { currency, rates } = useCurrency();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isQuickNavOpen, setIsQuickNavOpen] = React.useState(false);

  React.useEffect(() => setIsMounted(true), []);
  React.useEffect(() => {
    if (!isMobileNavOpen) setIsQuickNavOpen(false);
  }, [isMobileNavOpen]);

  const activeDimension = React.useMemo(() => {
    switch (chipState.editingObject) {
      case 'base':
        return {
          label: 'Base',
          widthMm: chipState.baseWidthMm,
          heightMm: chipState.baseHeightMm,
        };
      case 'ledger':
        return {
          label: 'Ledger',
          widthMm: chipState.ledgerWidthMm,
          heightMm: chipState.ledgerHeightMm,
        };
      case 'kerbset':
        return {
          label: 'Kerbset',
          widthMm: chipState.kerbWidthMm,
          heightMm: chipState.kerbHeightMm,
        };
      default:
        return {
          label:
            chipState.catalog?.product.type === 'plaque' ||
            chipState.catalog?.product.type === 'bronze_plaque'
              ? 'Plaque'
              : 'Headstone',
          widthMm: chipState.widthMm,
          heightMm: chipState.heightMm,
        };
    }
  }, [chipState]);
  const dimensionLabel = React.useMemo(() => {
    if (!chipState.shapeUrl || activeDimension.label !== 'Headstone') {
      return activeDimension.label;
    }
    const filename = chipState.shapeUrl
      .split('?')[0]
      .split('/')
      .pop()
      ?.replace(/\.svg$/i, '');
    const shape = chipState.shapes.find(
      (item) =>
        item.image
          ?.split('/')
          .pop()
          ?.replace(/\.svg$/i, '') === filename,
    );
    return (
      shape?.name ??
      filename
        ?.replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase()) ??
      activeDimension.label
    );
  }, [activeDimension.label, chipState.shapeUrl, chipState.shapes]);
  const dimensionSizeLabel = formatDimensionPair(
    activeDimension.widthMm,
    activeDimension.heightMm,
    unitSystem,
  ).replace(/\s*×\s*/g, '×');
  const sizeLabel = `${dimensionLabel} · ${dimensionSizeLabel}`;
  const totalPrice = React.useMemo(() => {
    const productPrices = calculateCheckPriceProductPrices({
      productId: chipState.productId,
      catalog: chipState.catalog,
      shapeUrl: chipState.shapeUrl,
      widthMm: chipState.widthMm,
      heightMm: chipState.heightMm,
      uprightThickness: chipState.uprightThickness,
      headstoneMaterialUrl: chipState.headstoneMaterialUrl,
      fixedSizes: chipState.fixedSizes,
      showBase: chipState.showBase,
      baseWidthMm: chipState.baseWidthMm,
      baseHeightMm: chipState.baseHeightMm,
      baseThickness: chipState.baseThickness,
    });
    return (
      productPrices.headstonePrice +
      productPrices.basePrice +
      productPrices.ledgerPrice +
      productPrices.kerbsetPrice +
      calculateCheckPriceBorderPrice(
        chipState.productId,
        chipState.borderName,
      ) +
      chipState.imageCost +
      chipState.inscriptionCost +
      chipState.motifCost +
      chipState.additionCost +
      chipState.emblemCost
    );
  }, [chipState]);
  const priceLabel = formatAudPrice(totalPrice, currency, rates);

  if (!isMounted || !isMobileNavOpen) return null;

  return (
    <>
      {createPortal(
        <div className="day:border-[#ddd2c2] day:bg-[#f4f1eb]/95 fixed inset-x-0 top-0 z-[45] border-b border-[#3a2a1c] bg-[#120c08]/90 px-3.5 py-2.5 shadow-xl shadow-black/25 backdrop-blur-md md:hidden">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5">
            <div className="flex min-w-0 items-center justify-start gap-1.5">
              <button
                onClick={handleBackToMenu}
                className="day:border-[#ddd2c2] day:bg-[#fbf9f5] day:text-[#302719] day:hover:bg-[#eee6d9] inline-flex min-h-11 items-center gap-1 rounded-md border border-[#3a2a1c] bg-[#1b120c]/80 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:border-[#D7B356]/45 hover:bg-[#24170f]"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Menu
              </button>
            </div>
            <div className="min-w-0">
              {activeDimension.widthMm > 0 && activeDimension.heightMm > 0 ? (
                <button
                  type="button"
                  onClick={() => chipState.setActivePanel('checkprice')}
                  aria-label={`Selected size ${sizeLabel}; price ${priceLabel}. Open price details`}
                  className="flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--designer-focus)]"
                >
                  <span className="flex min-w-0 flex-1 flex-col items-center justify-center text-center leading-tight">
                    <span className="day:text-[#62584d] w-full truncate text-xs font-semibold text-white/85">
                      {dimensionLabel}
                    </span>
                    <span className="day:text-[#756c62] w-full truncate text-xs text-white/65">
                      {dimensionSizeLabel}
                    </span>
                  </span>
                  <span className="day:text-[#9a6e20] shrink-0 text-xs font-bold whitespace-nowrap text-[#f3d48f]">
                    {priceLabel}
                  </span>
                </button>
              ) : (
                <p className="day:text-[#1d1a17] truncate text-center text-sm font-semibold text-white">
                  {title}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsQuickNavOpen((open) => !open)}
                aria-label="Show design sections"
                aria-expanded={isQuickNavOpen}
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition-colors hover:border-[#D7B356]/45 hover:bg-[#24170f] ${
                  isQuickNavOpen
                    ? 'day:bg-[#D7B356] day:text-slate-950 border-[#D7B356] bg-[#D7B356] text-slate-950'
                    : 'day:border-[#ddd2c2] day:bg-[#fbf9f5] day:text-[#302719] day:hover:bg-[#eee6d9] border-[#3a2a1c] bg-[#1b120c]/80 text-white'
                }`}
              >
                <Squares2X2Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  isDayTheme ? 'Switch to night mode' : 'Switch to day mode'
                }
                title={isDayTheme ? 'Night mode' : 'Day mode'}
                className="day:border-[#ddd2c2] day:bg-[#fbf9f5] day:text-[#302719] day:hover:bg-[#eee6d9] inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#3a2a1c] bg-[#1b120c]/80 text-white transition-colors hover:border-[#D7B356]/45 hover:bg-[#24170f]"
              >
                {isDayTheme ? (
                  <MoonIcon className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <SunIcon className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          {currentPanelIndex >= 0 && (
            <div className="day:bg-[#ddd2c2] mt-2 h-0.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#D7B356] transition-[width] duration-300"
                style={{
                  width: `${((currentPanelIndex + 1) / panelCount) * 100}%`,
                }}
              />
            </div>
          )}
          {isQuickNavOpen && (
            <div
              className="day:border-[#ddd2c2] mt-2 grid grid-cols-5 gap-1.5 border-t border-white/10 pt-2"
              aria-label="Design sections"
            >
              <GuidedQuickNavItems
                slugs={guidedQuickNavSlugs}
                activeSlug={activeFullscreenPanel}
                productId={productId}
                variant="mobile"
                onNavigate={onNavigate}
                onBeforeNavigate={() => setIsQuickNavOpen(false)}
              />
            </div>
          )}
        </div>,
        document.body,
      )}
      {!isSizeAdjustmentCompact &&
        !isBottomSheetCollapsed &&
        createPortal(
          <div className="day:border-[#ddd2c2] day:bg-[#f4f1eb]/95 fixed inset-x-0 bottom-0 z-[46] flex gap-2 border-t border-[#3a2a1c] bg-[#120c08]/95 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-10px_24px_rgba(0,0,0,0.3)] backdrop-blur-md md:hidden">
            <button
              type="button"
              onClick={() => prevPanelSlug && onNavigate(prevPanelSlug)}
              disabled={!prevPanelSlug}
              className="day:border-[#cdbb9f] day:bg-[#fbf9f5] day:text-[#302719] day:hover:bg-[#eee6d9] flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 text-sm font-semibold text-white disabled:opacity-30"
            >
              <span aria-hidden="true">←</span>
              <span className="truncate">
                {prevPanelTitle?.replace(/^(Select|Add Your)\s+/i, '') ??
                  'Previous'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => nextPanelSlug && onNavigate(nextPanelSlug)}
              disabled={!nextPanelSlug || isImageCropActive}
              className="day:disabled:bg-[#e5ded3] day:disabled:text-[#8c7657] flex min-h-11 flex-[1.35] items-center justify-center gap-1.5 rounded-lg bg-[#D7B356] px-3 text-sm font-semibold text-slate-950 disabled:bg-white/10 disabled:text-white/40"
            >
              <span className="truncate">
                {isImageCropActive
                  ? 'Finish crop'
                  : designerStepSlug === 'select-images' && !hasSelectedImages
                    ? 'Skip'
                    : (nextPanelTitle?.replace(/^(Select|Add Your)\s+/i, '') ??
                      'Continue')}
              </span>
              <span aria-hidden="true">→</span>
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
