'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  CubeIcon,
  Squares2X2Icon,
  ArrowsPointingOutIcon,
  SwatchIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice } from '#/lib/xml-parser';
import TailwindSlider from '#/ui/TailwindSlider';

// Menu items with icons
const menuItems = [
  { slug: 'select-product', name: 'Select Product', icon: CubeIcon },
  { slug: 'select-shape', name: 'Select Shape', icon: Squares2X2Icon },
  { slug: 'select-material', name: 'Select Material', icon: SwatchIcon },
  { slug: 'select-size', name: 'Select Size', icon: ArrowsPointingOutIcon },
  { slug: 'inscriptions', name: 'Inscriptions', icon: DocumentTextIcon },
  { slug: 'select-additions', name: 'Select Additions', icon: PlusCircleIcon },
  { slug: 'select-motifs', name: 'Select Motifs', icon: SparklesIcon },
  { slug: 'check-price', name: 'Check Price', icon: CurrencyDollarIcon },
];

export default function DesignerNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Get catalog info
  const catalog = useHeadstoneStore((s) => s.catalog);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const setWidthMm = useHeadstoneStore((s) => s.setWidthMm);
  const setHeightMm = useHeadstoneStore((s) => s.setHeightMm);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);
  const selectedAdditions = useHeadstoneStore ((s) => s.selectedAdditions);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const resetDesign = useHeadstoneStore((s) => s.resetDesign);
  const editingObject = useHeadstoneStore((s) => s.editingObject);

  // Check if anything has been added to the headstone
  const hasCustomizations = inscriptions.length > 0 || selectedAdditions.length > 0 || selectedMotifs.length > 0;
  
  // State for Select Size expansion
  const [isSizeExpanded, setIsSizeExpanded] = React.useState(false);
  const [showCanvas, setShowCanvas] = React.useState(false);
  
  // Auto-expand Select Size panel and show canvas when on select-size page
  useEffect(() => {
    if (pathname === '/select-size') {
      setIsSizeExpanded(true);
      setShowCanvas(true);
    }
  }, [pathname]);

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
      router.push('/check-price');
    } else if (slug === 'select-size') {
      e.preventDefault();
      const newExpandedState = !isSizeExpanded;
      setIsSizeExpanded(newExpandedState);
      if (newExpandedState) {
        setActivePanel(null);
      }
    }
  };

  const handleNewDesign = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Are you sure you want to start a new design? This will remove all inscriptions, additions, and motifs.')) {
      resetDesign();
      // Don't navigate, just reset the design and stay on current page
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/select-size');
  };

  const isSelectProductPage = pathname === '/select-product';
  const isSelectShapePage = pathname === '/select-shape';
  const isSelectMaterialPage = pathname === '/select-material';
  const isSelectAdditionsPage = pathname === '/select-additions';
  const isSelectMotifsPage = pathname === '/select-motifs';
  const isHomePage = pathname === '/';
  const isCheckPricePage = pathname === '/check-price';

  return (
    <nav className="overflow-y-auto h-full bg-gradient-to-tr from-sky-900 to-yellow-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/ico/forever-transparent-logo.png" alt="Forever Logo" className="mb-4" />
        </Link>
        {!isSelectProductPage && !isSelectShapePage && !isSelectMaterialPage && !isSelectAdditionsPage && !isSelectMotifsPage && !isHomePage && !isCheckPricePage && (
          <div className="mb-3">
            {catalog ? (
              <h1 className="text-2xl font-serif font-light text-white tracking-tight">
                {catalog.product.name}
                <br />
                <span className="text-base text-slate-300">{widthMm} x {heightMm} mm (${price.toFixed(2)})</span>
              </h1>
            ) : (
              <h1 className="text-2xl font-serif font-light text-white tracking-tight">
                3D Designer
              </h1>
            )}
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="p-4">
        <div className="mb-3 px-3 font-mono text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Design Tools
        </div>
        <div className="flex flex-col gap-1">
          {/* 3D Preview Button */}
          <button
            onClick={handlePreviewClick}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all text-slate-200 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
          >
            <EyeIcon className="h-5 w-5 flex-shrink-0" />
            <span>3D Preview</span>
          </button>
          
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === `/${item.slug}`;
            
            // Insert "New Design" button after "Select Product" if there are customizations
            const showNewDesignAfter = index === 0 && hasCustomizations;
            
            // Special handling for Select Size - navigate to page and expand
            if (item.slug === 'select-size') {
              const sizeTitle = editingObject === 'base' ? "Select Size of Base" : "Select Size of Headstone";
              const firstShape = catalog?.product?.shapes?.[0];
              const minWidth = firstShape?.table?.minWidth ?? 40;
              const maxWidth = firstShape?.table?.maxWidth ?? 1200;
              const minHeight = firstShape?.table?.minHeight ?? 40;
              const maxHeight = firstShape?.table?.maxHeight ?? 1200;
              
              return (
                <React.Fragment key={item.slug}>
                  <Link
                    href={`/${item.slug}`}
                    onClick={(e) => {
                      setIsSizeExpanded(true);
                      setShowCanvas(true);
                    }}
                    className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-base font-light transition-all text-slate-200 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {isSizeExpanded ? (
                      <ChevronUpIcon className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
                    )}
                  </Link>
                  
                  {isSizeExpanded && (
                    <div className="fs-size-panel mt-3 space-y-4 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm">
                      {/* Headstone/Base Toggle */}
                      <div className="flex gap-2 rounded-lg bg-slate-950 p-1">
                        <button
                          onClick={() => {
                            if (editingObject !== 'headstone') {
                              setEditingObject('headstone');
                            }
                          }}
                          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                            editingObject === 'headstone'
                              ? 'bg-[#D7B356] text-slate-900 shadow-md'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          Headstone
                        </button>
                        <button
                          onClick={() => {
                            if (editingObject !== 'base') {
                              setEditingObject('base');
                            }
                          }}
                          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                            editingObject === 'base'
                              ? 'bg-[#D7B356] text-slate-900 shadow-md'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          Base
                        </button>
                      </div>

                      {/* Width Slider */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-200">
                          Width: {widthMm} <span className="text-slate-500">mm</span>
                        </label>
                        <input
                          type="range"
                          min={minWidth}
                          max={maxWidth}
                          step={10}
                          value={widthMm}
                          onChange={(e) => setWidthMm(Number(e.target.value))}
                          className="fs-range h-1 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900/95 [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(0,0,0,0.25)]"
                        />
                      </div>

                      {/* Height Slider */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-200">
                          Height: {heightMm} <span className="text-slate-500">mm</span>
                        </label>
                        <input
                          type="range"
                          min={minHeight}
                          max={maxHeight}
                          step={10}
                          value={heightMm}
                          onChange={(e) => setHeightMm(Number(e.target.value))}
                          className="fs-range h-1 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900/95 [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(0,0,0,0.25)]"
                        />
                      </div>
                    </div>
                  )}
                  
                  {showNewDesignAfter && (
                    <button
                      key="new-design-size"
                      onClick={handleNewDesign}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all text-slate-200 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
                    >
                      <ArrowPathIcon className="h-5 w-5 flex-shrink-0" />
                      <span>New Design</span>
                    </button>
                  )}
                </React.Fragment>
              );
            }
            
            return (
              <React.Fragment key={item.slug}>
                <Link
                  href={`/${item.slug}`}
                  onClick={(e) => handleMenuClick(item.slug, e)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
                    isActive 
                      ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                      : 'text-slate-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
                
                {showNewDesignAfter && (
                  <button
                    onClick={handleNewDesign}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all text-slate-200 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
                  >
                    <ArrowPathIcon className="h-5 w-5 flex-shrink-0" />
                    <span>New Design</span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
          
          {/* Browse Designs CTA */}
          <Link
            href="/designs"
            className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-light transition-all mt-2 text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm hover:bg-white/20"
          >
            <SparklesIcon className="h-5 w-5 flex-shrink-0" />
            <span>Browse Designs</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
