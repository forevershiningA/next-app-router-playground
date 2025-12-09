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
import { calculateMotifPrice } from '#/lib/motif-pricing';
import TailwindSlider from '#/ui/TailwindSlider';
import { data } from '#/app/_internal/_data';
import InscriptionEditPanel from './InscriptionEditPanel';

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
  
  // Ref for the nav container
  const navRef = React.useRef<HTMLElement>(null);
  
  // Get catalog info
  const catalog = useHeadstoneStore((s) => s.catalog);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const setWidthMm = useHeadstoneStore((s) => s.setWidthMm);
  const setHeightMm = useHeadstoneStore((s) => s.setHeightMm);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);
  const selectedAdditions = useHeadstoneStore ((s) => s.selectedAdditions);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const resetDesign = useHeadstoneStore((s) => s.resetDesign);
  const editingObject = useHeadstoneStore((s) => s.editingObject);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const selected = useHeadstoneStore((s) => s.selected);
  const setSelected = useHeadstoneStore((s) => s.setSelected);

  // Check if anything has been added to the headstone
  const hasCustomizations = inscriptions.length > 0 || selectedAdditions.length > 0 || selectedMotifs.length > 0;
  
  // State for Select Size expansion
  const [isSizeExpanded, setIsSizeExpanded] = React.useState(false);
  const [showCanvas, setShowCanvas] = React.useState(false);
  
  // State for Select Motifs expansion
  const [isMotifsExpanded, setIsMotifsExpanded] = React.useState(false);
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const setMotifOffset = useHeadstoneStore((s) => s.setMotifOffset);
  const removeMotif = useHeadstoneStore((s) => s.removeMotif);
  const duplicateMotif = useHeadstoneStore((s) => s.duplicateMotif);
  const setMotifColor = useHeadstoneStore((s) => s.setMotifColor);
  const motifPriceModel = useHeadstoneStore((s) => s.motifPriceModel);
  
  // State for Select Additions expansion
  const [isAdditionsExpanded, setIsAdditionsExpanded] = React.useState(false);
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const additionOffsets = useHeadstoneStore((s) => s.additionOffsets);
  const setAdditionOffset = useHeadstoneStore((s) => s.setAdditionOffset);
  const removeAddition = useHeadstoneStore((s) => s.removeAddition);
  const duplicateAddition = useHeadstoneStore((s) => s.duplicateAddition);
  
  // Show Select Size panel when on select-size page
  const isSelectSizePage = pathname === '/select-size';
  
  // Auto-scroll to section when it becomes active
  useEffect(() => {
    if (navRef.current) {
      const sections = ['select-size', 'inscriptions', 'select-additions', 'select-motifs'];
      const currentSection = sections.find(section => pathname === `/${section}`);
      
      if (currentSection) {
        setTimeout(() => {
          const element = navRef.current?.querySelector(`[data-section="${currentSection}"]`);
          if (element && navRef.current) {
            const navRect = navRef.current.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const scrollTop = navRef.current.scrollTop;
            const targetScroll = scrollTop + elementRect.top - navRect.top - (navRect.height / 2) + (elementRect.height / 2);
            
            navRef.current.scrollTo({
              top: targetScroll,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  }, [pathname, activePanel]);
  
  // Auto-expand Edit Motif panel when a motif is selected
  useEffect(() => {
    if (selectedMotifId) {
      setIsMotifsExpanded(true);
    }
  }, [selectedMotifId]);
  
  // Auto-expand Edit Addition panel when an addition is selected
  useEffect(() => {
    if (selectedAdditionId) {
      setIsAdditionsExpanded(true);
    }
  }, [selectedAdditionId]);

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
    <nav ref={navRef} className="overflow-y-auto h-full bg-gradient-to-tr from-sky-900 to-yellow-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/ico/forever-transparent-logo.png" alt="Forever Logo" className="mb-4" />
        </Link>
      </div>

      {/* Menu Items */}
      <div className="p-4">
        <div className="mb-3 px-3 font-mono text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Design Tools
        </div>
        <div className="flex flex-col gap-1">
          {/* 3D Preview Button - Hide when canvas is already visible or on select-size page */}
          {!showCanvas && pathname !== '/' && pathname !== '/select-size' && (
            <button
              onClick={handlePreviewClick}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all text-slate-200 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
            >
              <EyeIcon className="h-5 w-5 flex-shrink-0" />
              <span>3D Preview</span>
            </button>
          )}
          
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === `/${item.slug}`;
            
            // Hide "Select Material" for laser etched products
            if (item.slug === 'select-material' && catalog?.product?.laser === '1') {
              return null;
            }
            
            // Hide "Select Additions" for laser etched products
            if (item.slug === 'select-additions' && catalog?.product?.laser === '1') {
              return null;
            }
            
            // Insert "New Design" button after "Select Product" if there are customizations
            const showNewDesignAfter = index === 0 && hasCustomizations;
            
            // Hide 3D Preview when canvas is already visible or on select-size page
            if (item.slug === '3d-preview' && (showCanvas || pathname === '/select-size')) {
              return null;
            }
            
            // Special handling for Select Size - show controls only on /select-size page
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
                    data-section={item.slug}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
                      isActive 
                        ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                        : 'text-slate-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                  
                  {isSelectSizePage && !selectedMotifId && !selectedAdditionId && (
                    <div className="fs-size-panel mt-3 space-y-4 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm">
                      {/* Headstone/Base Toggle */}
                      <div className="flex gap-2 rounded-lg bg-slate-950 p-1">
                        <button
                          onClick={() => {
                            if (editingObject !== 'headstone') {
                              setEditingObject('headstone');
                              setSelected('headstone');
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
                              setSelected('base');
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
            
            // Special handling for Inscriptions - show inline editing panel when inscription is selected
            if (item.slug === 'inscriptions') {
              return (
                <React.Fragment key={item.slug}>
                  <button
                    onClick={() => {
                      router.push(`/${item.slug}`);
                      // Open the inscription overlay panel
                      if (activePanel !== 'inscription') {
                        setActivePanel('inscription');
                      }
                    }}
                    data-section={item.slug}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all w-full text-left ${
                      isActive 
                        ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                        : 'text-slate-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </button>
                  
                  {/* Inscription editing panel - shown only when inscription panel is active */}
                  {activePanel === 'inscription' && (
                    <div className="mt-3 space-y-4 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm">
                      <InscriptionEditPanel />
                    </div>
                  )}
                  
                  {showNewDesignAfter && (
                    <button
                      key="new-design-inscriptions"
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
            
            // Special handling for Select Additions - show Edit Addition panel when expanded
            if (item.slug === 'select-additions') {
              const activeAddition = selectedAdditions.find((a) => a === selectedAdditionId);
              const activeOffset = selectedAdditionId ? (additionOffsets[selectedAdditionId] || {
                xPos: 0,
                yPos: 0,
                scale: 1,
                rotationZ: 0,
              }) : null;
              
              return (
                <React.Fragment key={item.slug}>
                  <Link
                    href={`/${item.slug}`}
                    data-section={item.slug}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
                      isActive 
                        ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                        : 'text-slate-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                  
                  {selectedAdditionId && activeOffset && activeAddition && activePanel === 'addition' && (
                    <div className="mt-3 space-y-4 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-300">
                          Selected: <span className="font-semibold text-white">{selectedAdditionId}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAdditionId(null);
                            setIsAdditionsExpanded(false);
                            setActivePanel(null);
                          }}
                          className="text-white/60 hover:text-white transition-colors"
                          title="Close"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="flex-1 cursor-pointer rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
                          onClick={() => {
                            if (selectedAdditionId) {
                              duplicateAddition(selectedAdditionId);
                            }
                          }}
                          title="Duplicate this addition"
                        >
                          Duplicate
                        </button>
                        <button
                          className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                          onClick={() => {
                            if (selectedAdditionId) {
                              removeAddition(selectedAdditionId);
                              setSelectedAdditionId(null);
                              setIsAdditionsExpanded(false);
                            }
                          }}
                          title="Remove this addition"
                        >
                          Delete
                        </button>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white">
                          Size: {(activeOffset.scale ?? 1).toFixed(2)}×
                        </label>
                        <input
                          type="range"
                          min={0.1}
                          max={3}
                          step={0.05}
                          value={activeOffset.scale ?? 1}
                          onChange={(e) => {
                            if (selectedAdditionId && activeOffset) {
                              setAdditionOffset(selectedAdditionId, {
                                ...activeOffset,
                                scale: Number(e.target.value),
                              });
                            }
                          }}
                          className="fs-range h-1 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900/95 [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(0,0,0,0.25)]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white">
                          Rotation: {Math.round(((activeOffset.rotationZ ?? 0) * 180) / Math.PI)}°
                        </label>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          step={1}
                          value={((activeOffset.rotationZ ?? 0) * 180) / Math.PI}
                          onChange={(e) => {
                            if (selectedAdditionId && activeOffset) {
                              setAdditionOffset(selectedAdditionId, {
                                ...activeOffset,
                                rotationZ: (Number(e.target.value) * Math.PI) / 180,
                              });
                            }
                          }}
                          className="fs-range h-1 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900/95 [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(0,0,0,0.25)]"
                        />
                      </div>
                    </div>
                  )}
                  
                  {showNewDesignAfter && (
                    <button
                      key="new-design-additions"
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
            
            // Special handling for Select Motifs - show Edit Motif panel when expanded
            if (item.slug === 'select-motifs') {
              const activeMotif = selectedMotifs.find((m) => m.id === selectedMotifId);
              const activeOffset = selectedMotifId ? (motifOffsets[selectedMotifId] || {
                xPos: 0,
                yPos: 0,
                scale: 1,
                rotationZ: 0,
                heightMm: 100,
              }) : null;
              
              // Determine motif size limits based on product type
              const isLaser = catalog?.product.laser === '1';
              const isBronze = catalog?.product.type === 'bronze_plaque';
              
              let minHeight = 40;
              let maxHeight = 1000;
              let initHeight = 100;
              
              if (isLaser) {
                minHeight = 40;
                maxHeight = 600;
                initHeight = 40;
              } else if (isBronze) {
                minHeight = 40;
                maxHeight = 150;
                initHeight = 100;
              } else {
                minHeight = 40;
                maxHeight = 1000;
                initHeight = 100;
              }
              
              return (
                <React.Fragment key={item.slug}>
                  <Link
                    href={`/${item.slug}`}
                    data-section={item.slug}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
                      isActive 
                        ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                        : 'text-slate-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                  
                  {isMotifsExpanded && selectedMotifId && activeOffset && activeMotif && activePanel === 'motif' && (
                    <div className="mt-3 space-y-4 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-300">
                          Selected: <span className="font-semibold text-white">{selectedMotifId}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMotifId(null);
                            setIsMotifsExpanded(false);
                          }}
                          className="text-slate-400 hover:text-white text-sm"
                        >
                          ✕
                        </button>
                      </div>

                      {motifPriceModel && !isLaser && (
                        <div className="border border-white/20 bg-white/5 p-3 rounded-lg">
                          <div className="text-xs text-white/70 mb-1">Motif Price</div>
                          <div className="text-2xl font-bold text-white">
                            ${(calculateMotifPrice(activeOffset.heightMm ?? 100, activeMotif.color ?? '#c99d44', motifPriceModel.priceModel, isLaser)).toFixed(2)}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          className="flex-1 rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 cursor-pointer"
                          onClick={() => {
                            if (selectedMotifId) duplicateMotif(selectedMotifId);
                          }}
                        >
                          Duplicate
                        </button>
                        <button
                          className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
                          onClick={() => {
                            if (selectedMotifId) {
                              removeMotif(selectedMotifId);
                              setSelectedMotifId(null);
                              setIsMotifsExpanded(false);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-200">
                            Height: {activeOffset.heightMm ?? initHeight} <span className="text-slate-500">mm</span>
                          </label>
                          <input
                            type="range"
                            min={minHeight}
                            max={maxHeight}
                            step={1}
                            value={activeOffset.heightMm ?? initHeight}
                            onChange={(e) => {
                              if (selectedMotifId && activeOffset) {
                                setMotifOffset(selectedMotifId, {
                                  ...activeOffset,
                                  heightMm: Number(e.target.value),
                                });
                              }
                            }}
                            className="fs-range h-1 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900/95 [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(0,0,0,0.25)]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-200">
                            Rotation: {Math.round(((activeOffset.rotationZ ?? 0) * 180) / Math.PI)} <span className="text-slate-500">°</span>
                          </label>
                          <input
                            type="range"
                            min={-180}
                            max={180}
                            step={1}
                            value={((activeOffset.rotationZ ?? 0) * 180) / Math.PI}
                            onChange={(e) => {
                              if (selectedMotifId && activeOffset) {
                                setMotifOffset(selectedMotifId, {
                                  ...activeOffset,
                                  rotationZ: (Number(e.target.value) * Math.PI) / 180,
                                });
                              }
                            }}
                            className="fs-range h-1 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900/95 [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(0,0,0,0.25)]"
                          />
                        </div>

                        {!isLaser && (
                          <div>
                            <label className="mb-2 block text-sm font-medium text-white">
                              Select Color
                            </label>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div
                                className={`flex cursor-pointer flex-col items-center gap-1.5 border p-2 transition-colors rounded-lg ${
                                  activeMotif.color === '#c99d44' ? 'border-[#D7B356] bg-white/10' : 'border-white/20 hover:bg-white/10'
                                }`}
                                onClick={() => selectedMotifId && setMotifColor(selectedMotifId, '#c99d44')}
                              >
                                <div
                                  className="h-5 w-5 border border-white/20 rounded"
                                  style={{ backgroundColor: '#c99d44' }}
                                />
                                <span className="text-xs text-slate-200">Gold</span>
                              </div>
                              <div
                                className={`flex cursor-pointer flex-col items-center gap-1.5 border p-2 transition-colors rounded-lg ${
                                  activeMotif.color === '#eeeeee' ? 'border-[#D7B356] bg-white/10' : 'border-white/20 hover:bg-white/10'
                                }`}
                                onClick={() => selectedMotifId && setMotifColor(selectedMotifId, '#eeeeee')}
                              >
                                <div
                                  className="h-5 w-5 border border-white/20 rounded"
                                  style={{ backgroundColor: '#eeeeee' }}
                                />
                                <span className="text-xs text-slate-200">Silver</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-7 gap-1">
                              {data.colors.map((color) => (
                                <div
                                  key={color.id}
                                  className={`h-6 w-6 cursor-pointer border rounded ${
                                    activeMotif.color === color.hex ? 'border-[#D7B356] ring-2 ring-[#D7B356]' : 'border-white/20'
                                  }`}
                                  style={{ backgroundColor: color.hex }}
                                  onClick={() => selectedMotifId && setMotifColor(selectedMotifId, color.hex)}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
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
