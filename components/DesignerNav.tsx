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
  ChevronDownIcon,
  ChevronUpIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice } from '#/lib/xml-parser';
import { calculateMotifPrice } from '#/lib/motif-pricing';
import TailwindSlider from '#/ui/TailwindSlider';
import { data } from '#/app/_internal/_data';
import InscriptionEditPanel from './InscriptionEditPanel';
import SegmentedControl from './ui/SegmentedControl';
import MaterialSelector from './MaterialSelector';
import ShapeSelector from './ShapeSelector';
import BorderSelector from './BorderSelector';
import AdditionSelector from './AdditionSelector';
import MotifSelectorPanel from './MotifSelectorPanel';

// Menu items grouped by workflow stage
const menuGroups = [
  {
    label: 'Setup',
    items: [
      { slug: 'select-product', name: 'Select Product', icon: CubeIcon },
      { slug: 'select-shape', name: 'Select Shape', icon: Squares2X2Icon },
      { slug: 'select-border', name: 'Select Border', icon: RectangleStackIcon, requiresBorder: true },
      { slug: 'select-material', name: 'Select Material', icon: SwatchIcon },
      { slug: 'select-size', name: 'Select Size', icon: ArrowsPointingOutIcon },
    ],
  },
  {
    label: 'Design',
    items: [
      { slug: 'inscriptions', name: 'Inscriptions', icon: DocumentTextIcon },
      { slug: 'select-additions', name: 'Select Additions', icon: PlusCircleIcon },
      { slug: 'select-motifs', name: 'Select Motifs', icon: SparklesIcon },
      { slug: 'check-price', name: 'Check Price', icon: CurrencyDollarIcon },
    ],
  },
];

// Flatten for compatibility with existing code
const menuItems = menuGroups.flatMap(group => group.items);
const fullscreenPanelSlugs = new Set(['select-size', 'select-shape', 'select-material', 'select-border', 'inscriptions', 'select-additions', 'select-motifs']);

export default function DesignerNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Ref for the nav container
  const navRef = React.useRef<HTMLElement>(null);
  
  // Get catalog info
  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);
  const isPlaque = catalog?.product.type === 'plaque';
  const hasBorder = catalog?.product?.border === '1';
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const setWidthMm = useHeadstoneStore((s) => s.setWidthMm);
  const setHeightMm = useHeadstoneStore((s) => s.setHeightMm);
  const baseWidthMm = useHeadstoneStore((s) => s.baseWidthMm);
  const baseHeightMm = useHeadstoneStore((s) => s.baseHeightMm);
  const setBaseWidthMm = useHeadstoneStore((s) => s.setBaseWidthMm);
  const setBaseHeightMm = useHeadstoneStore((s) => s.setBaseHeightMm);
  const baseFinish = useHeadstoneStore((s) => s.baseFinish);
  const setBaseFinish = useHeadstoneStore((s) => s.setBaseFinish);
  const headstoneStyle = useHeadstoneStore((s) => s.headstoneStyle);
  const setHeadstoneStyle = useHeadstoneStore((s) => s.setHeadstoneStyle);
  const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
  const setUprightThickness = useHeadstoneStore((s) => s.setUprightThickness);
  const slantThickness = useHeadstoneStore((s) => s.slantThickness);
  const setSlantThickness = useHeadstoneStore((s) => s.setSlantThickness);
  const baseThickness = useHeadstoneStore((s) => s.baseThickness);
  const setBaseThickness = useHeadstoneStore((s) => s.setBaseThickness);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);
  const selectedAdditions = useHeadstoneStore ((s) => s.selectedAdditions);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);
  const resetDesign = useHeadstoneStore((s) => s.resetDesign);
  const editingObject = useHeadstoneStore((s) => s.editingObject);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const selected = useHeadstoneStore((s) => s.selected);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const setShowBase = useHeadstoneStore((s) => s.setShowBase);
  const selectedInscriptionId = useHeadstoneStore((s) => s.selectedInscriptionId);
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const setProductId = useHeadstoneStore((s) => s.setProductId);

  // Check if anything has been added to the headstone
  const hasCustomizations = inscriptions.length > 0 || selectedAdditions.length > 0 || selectedMotifs.length > 0;
  
  // Unified expansion state for all sections (replaces individual states)
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    'select-size': false,
    'select-shape': false,
    'select-material': false,
    'inscriptions': false,
    'select-additions': false,
    'select-motifs': false,
  });
  
  // Full-screen panel state - when set, hides menu and shows panel
  const [activeFullscreenPanel, setActiveFullscreenPanel] = React.useState<string | null>(null);
  const [dismissedPanelSlug, setDismissedPanelSlug] = React.useState<string | null>(null);
  const [panelSource, setPanelSource] = React.useState<'menu' | 'canvas' | null>(null);
  const [forceAdditionCatalog, setForceAdditionCatalog] = React.useState(false);
  const [forceMotifCatalog, setForceMotifCatalog] = React.useState(false);
  const [showConvertPanel, setShowConvertPanel] = React.useState(false);
  const activeFullscreenPanelRef = React.useRef<string | null>(null);
  activeFullscreenPanelRef.current = activeFullscreenPanel;


  // Listen for open panel events from canvas (e.g., inscription/motif/addition click)
  useEffect(() => {
    const handleOpenPanel = (e: Event) => {
      const customEvent = e as CustomEvent<{ panel: string }>;
      const panelSlug = customEvent.detail.panel;
      setActiveFullscreenPanel(panelSlug);
      setDismissedPanelSlug(null);
      setPanelSource((prev) => {
        if (
          panelSlug === 'select-additions' &&
          prev === 'menu' &&
          activeFullscreenPanelRef.current === 'select-additions'
        ) {
          return prev;
        }
        return 'canvas';
      });
    };
    window.addEventListener('openFullscreenPanel', handleOpenPanel);
    return () => window.removeEventListener('openFullscreenPanel', handleOpenPanel);
  }, []);

  // Toggle a section's expansion
  const toggleSection = (slug: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };
  
  // Open full-screen panel
  const openFullscreenPanel = (slug: string) => {
    setDismissedPanelSlug(null);
    setPanelSource('menu');
    if (slug === 'inscriptions') {
      setActivePanel('inscription');
    }
    setActiveFullscreenPanel(slug);
  };
  
  // Close full-screen panel and return to menu
  const closeFullscreenPanel = React.useCallback(() => {
    const currentSlug = pathname.replace('/', '') || null;
    if (activeFullscreenPanel) {
      // Clear activePanel for all panel types
      if (
        activeFullscreenPanel === 'inscriptions' ||
        activeFullscreenPanel === 'select-additions' ||
        activeFullscreenPanel === 'select-motifs'
      ) {
        setActivePanel(null);
      }
    }
    const slugToDismiss = currentSlug || activeFullscreenPanel;
    if (slugToDismiss) {
      setDismissedPanelSlug(slugToDismiss);
    }
    setActiveFullscreenPanel(null);
    setPanelSource(null);
    // Don't navigate - just hide panel and show menu
    // URL stays the same (e.g., stays on /select-size)
  }, [activeFullscreenPanel, pathname, setActivePanel, setDismissedPanelSlug]);

  const handleBackToAdditionList = React.useCallback(() => {
    setForceAdditionCatalog(true);
    setSelectedAdditionId(null);
    setActivePanel('addition');
  }, [setForceAdditionCatalog, setSelectedAdditionId, setActivePanel]);

  const handleBackToMotifList = React.useCallback(() => {
    setForceMotifCatalog(true);
    setSelectedMotifId(null);
    setActivePanel('motif');
  }, [setForceMotifCatalog, setSelectedMotifId, setActivePanel]);

  const closePanelHandlerRef = React.useRef(closeFullscreenPanel);
  closePanelHandlerRef.current = closeFullscreenPanel;

  // Listen for close panel events from canvas (e.g., headstone click)
  useEffect(() => {
    const handleClosePanel = () => {
      closePanelHandlerRef.current();
    };
    window.addEventListener('closeFullscreenPanel', handleClosePanel);
    return () => window.removeEventListener('closeFullscreenPanel', handleClosePanel);
  }, []);
  
  // Auto-expand current route's section and collapse others
  useEffect(() => {
    const activeSection = pathname.replace('/', '');
    if (activeSection && expandedSections.hasOwnProperty(activeSection)) {
      setExpandedSections(prev => ({
        ...Object.keys(prev).reduce((acc, key) => ({
          ...acc,
          [key]: key === activeSection
        }), {} as Record<string, boolean>)
      }));
    }
  }, [pathname]);

  useEffect(() => {
    if (activeFullscreenPanel !== 'select-additions') {
      setForceAdditionCatalog(false);
    }
    if (activeFullscreenPanel !== 'select-motifs') {
      setForceMotifCatalog(false);
    }
  }, [activeFullscreenPanel]);

  useEffect(() => {
    if (selectedAdditionId) {
      setForceAdditionCatalog(false);
    }
  }, [selectedAdditionId]);

  useEffect(() => {
    if (selectedMotifId) {
      setForceMotifCatalog(false);
    }
  }, [selectedMotifId]);
  
  useEffect(() => {
    if (!productId && showConvertPanel) {
      setShowConvertPanel(false);
    }
  }, [productId, showConvertPanel]);

  useEffect(() => {
    setShowConvertPanel(false);
  }, [pathname]);
  
  // Auto-open full-screen panel based on current route
  // DISABLED: Panel should only open when menu item is clicked, not automatically on route
  /*
  useEffect(() => {
    const routeToPanel: Record<string, string> = {
      '/select-size': 'select-size',
      '/inscriptions': 'inscriptions',
      '/select-additions': 'select-additions',
      '/select-motifs': 'select-motifs',
    };
    
    const panelSlug = routeToPanel[pathname];
    if (panelSlug) {
      setActiveFullscreenPanel(panelSlug);
    } else {
      setActiveFullscreenPanel(null);
    }
  }, [pathname]);
  */
  
  // State for Select Size expansion (keep for backward compatibility)
  const [isSizeExpanded, setIsSizeExpanded] = React.useState(false);
  const [showCanvas, setShowCanvas] = React.useState(false);
  
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const setMotifOffset = useHeadstoneStore((s) => s.setMotifOffset);
  const removeMotif = useHeadstoneStore((s) => s.removeMotif);
  const duplicateMotif = useHeadstoneStore((s) => s.duplicateMotif);
  const setMotifColor = useHeadstoneStore((s) => s.setMotifColor);
  const motifPriceModel = useHeadstoneStore((s) => s.motifPriceModel);
  
  const additionOffsets = useHeadstoneStore((s) => s.additionOffsets);
  const setAdditionOffset = useHeadstoneStore((s) => s.setAdditionOffset);
  const removeAddition = useHeadstoneStore((s) => s.removeAddition);
  const duplicateAddition = useHeadstoneStore((s) => s.duplicateAddition);
  
  // Get materials and shapes from store
  const materials = useHeadstoneStore((s) => s.materials);
  const products = React.useMemo(() => {
    return data.products || [];
  }, []);
  const shapes = React.useMemo(() => {
    return data.shapes || [];
  }, []);
  const additionsList = React.useMemo(() => {
    return data.additions || [];
  }, []);
  const motifCategories = React.useMemo(() => {
    return data.motifs || [];
  }, []);
  
  // Show Select Size panel when on select-size page
  const isSelectSizePage = pathname === '/select-size';
  const isSelectAdditionsPage = pathname === '/select-additions';
  
  // Determine if canvas is visible (on pages with 3D scene)
  const canvasVisiblePages = ['/select-size', '/inscriptions', '/select-motifs', '/select-material', '/select-border', '/select-additions'];
  const isCanvasVisible = canvasVisiblePages.some(page => pathname === page);
  const shouldShowFullscreenPanel = Boolean(activeFullscreenPanel);
  
  const isAdditionCatalogVisible =
    activeFullscreenPanel === 'select-additions' &&
    (forceAdditionCatalog || panelSource === 'menu' || (panelSource === null && isSelectAdditionsPage)) &&
    !selectedAdditionId;

  const isMotifCatalogVisible =
    activeFullscreenPanel === 'select-motifs' &&
    (forceMotifCatalog || !selectedMotifId);

  const shouldShowBackToListButton =
    (activeFullscreenPanel === 'select-additions' && !isAdditionCatalogVisible) ||
    (activeFullscreenPanel === 'select-motifs' && !isMotifCatalogVisible);
  
  // Close fullscreen panel if user navigates away from its route or when canvas is hidden
  useEffect(() => {
    if (!isCanvasVisible) {
      if (activeFullscreenPanel) {
        if (
          activeFullscreenPanel === 'inscriptions' ||
          activeFullscreenPanel === 'select-additions' ||
          activeFullscreenPanel === 'select-motifs'
        ) {
          setActivePanel(null);
        }
        setActiveFullscreenPanel(null);
        setPanelSource(null);
      }
      return;
    }

    if (panelSource === 'canvas' && activeFullscreenPanel) {
      return;
    }

    if (activeFullscreenPanel === 'select-shape' && pathname !== '/select-shape') {
      return;
    }

    const currentSlug = pathname.replace('/', '');
    if (fullscreenPanelSlugs.has(currentSlug)) {
      if (activeFullscreenPanel !== currentSlug && dismissedPanelSlug !== currentSlug) {
        if (currentSlug === 'inscriptions') {
          setActivePanel('inscription');
        }
        setDismissedPanelSlug(null);
        setPanelSource('menu');
        setActiveFullscreenPanel(currentSlug);
      }
    } else {
      if (activeFullscreenPanel) {
        if (
          activeFullscreenPanel === 'inscriptions' ||
          activeFullscreenPanel === 'select-additions' ||
          activeFullscreenPanel === 'select-motifs'
        ) {
          setActivePanel(null);
        }
        setActiveFullscreenPanel(null);
        setPanelSource(null);
      }
      if (dismissedPanelSlug) {
        setDismissedPanelSlug(null);
      }
    }
  }, [
    pathname,
    isCanvasVisible,
    activeFullscreenPanel,
    dismissedPanelSlug,
    panelSource,
    setActivePanel,
    setActiveFullscreenPanel,
    setDismissedPanelSlug,
    setPanelSource,
  ]);

  useEffect(() => {
    if (pathname === '/select-border' && isPlaque && dismissedPanelSlug !== 'select-border') {
      if (activeFullscreenPanel !== 'select-border') {
        setDismissedPanelSlug(null);
        setPanelSource('menu');
        setActiveFullscreenPanel('select-border');
      }
    }
  }, [pathname, isPlaque, activeFullscreenPanel, dismissedPanelSlug, setDismissedPanelSlug, setPanelSource, setActiveFullscreenPanel]);
  
  const renderSelectAdditionsPanel = () => {
    const activeAdditionOffset = selectedAdditionId
      ? (additionOffsets[selectedAdditionId] || {
          xPos: 0,
          yPos: 0,
          scale: 1,
          rotationZ: 0,
        })
      : null;
    const hasActiveAddition = !!selectedAdditionId && !!activeAdditionOffset && activePanel === 'addition';
    
    // Find the addition type to determine if rotation should be enabled
    // Extract base ID from instance ID (e.g., "K0096_177030562074Z" -> "K0096")
    const baseAdditionId = selectedAdditionId?.split('_')[0];
    const activeAddition = baseAdditionId 
      ? additionsList.find(a => a.id === baseAdditionId)
      : null;
    const isStatueOrVase = activeAddition?.type === 'statue' || activeAddition?.type === 'vase';
    
    const additionRotation = ((activeAdditionOffset?.rotationZ ?? 0) * 180) / Math.PI;
    const showAdditionCatalog =
      forceAdditionCatalog || panelSource === 'menu' || (panelSource === null && isSelectAdditionsPage);
    
    return (
      <div className="flex h-full flex-col gap-4">
        {hasActiveAddition ? (
          <div className="space-y-5 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-300">
                Selected: <span className="font-semibold text-white">{selectedAdditionId}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedAdditionId(null);
                  setActivePanel(null);
                }}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Clear selection
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
                onClick={() => selectedAdditionId && duplicateAddition(selectedAdditionId)}
              >
                Duplicate
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                onClick={() => {
                  if (selectedAdditionId) {
                    removeAddition(selectedAdditionId);
                    setSelectedAdditionId(null);
                    // Keep activePanel as 'addition' to show the addition catalog
                    // Don't set to null so user can immediately add another addition
                  }
                }}
              >
                Delete
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Size Slider - Discrete size options */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-gray-200 w-20">Size</label>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedAdditionId || !activeAdditionOffset) return;
                        const currentSize = Math.round(activeAdditionOffset.sizeVariant ?? 1);
                        const newVal = Math.max(1, currentSize - 1);
                        setAdditionOffset(selectedAdditionId, {
                          ...activeAdditionOffset,
                          sizeVariant: newVal,
                        });
                      }}
                      className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                      aria-label="Decrease size"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={4}
                      step={1}
                      value={Math.round(activeAdditionOffset?.sizeVariant ?? 1)}
                      onChange={(e) => {
                        if (!selectedAdditionId || !activeAdditionOffset) return;
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            sizeVariant: val,
                          });
                        }
                      }}
                      onBlur={(e) => {
                        if (!selectedAdditionId || !activeAdditionOffset) return;
                        const val = parseInt(e.target.value);
                        if (isNaN(val) || val < 1) {
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            sizeVariant: 1,
                          });
                        } else if (val > 4) {
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            sizeVariant: 4,
                          });
                        }
                      }}
                      className="w-16 rounded border px-2 py-1.5 text-right text-sm text-white bg-[#454545] border-[#5A5A5A] focus:border-[#D7B356] focus:ring-2 focus:ring-[#D7B356]/30 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedAdditionId || !activeAdditionOffset) return;
                        const currentSize = Math.round(activeAdditionOffset.sizeVariant ?? 1);
                        const newVal = Math.min(4, currentSize + 1);
                        setAdditionOffset(selectedAdditionId, {
                          ...activeAdditionOffset,
                          sizeVariant: newVal,
                        });
                      }}
                      className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                      aria-label="Increase size"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={1}
                    max={4}
                    step={1}
                    value={Math.round(activeAdditionOffset?.sizeVariant ?? 1)}
                    onChange={(e) => {
                      if (selectedAdditionId && activeAdditionOffset) {
                        setAdditionOffset(selectedAdditionId, {
                          ...activeAdditionOffset,
                          sizeVariant: parseInt(e.target.value),
                        });
                      }
                    }}
                    className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
                    <span>Size 1</span>
                    <span>Size 4</span>
                  </div>
                </div>
              </div>
              
              {/* Rotation Slider - Only shown for applications, not for statues/vases */}
              {!isStatueOrVase && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium text-gray-200 w-20">Rotation</label>
                    <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedAdditionId || !activeAdditionOffset) return;
                        const newVal = Math.max(-180, additionRotation - 1);
                        setAdditionOffset(selectedAdditionId, {
                          ...activeAdditionOffset,
                          rotationZ: (newVal * Math.PI) / 180,
                        });
                      }}
                      className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                      aria-label="Decrease rotation by 1 degree"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min={-180}
                      max={180}
                      step={1}
                      value={Math.round(additionRotation)}
                      onChange={(e) => {
                        if (!selectedAdditionId || !activeAdditionOffset) return;
                        setAdditionOffset(selectedAdditionId, {
                          ...activeAdditionOffset,
                          rotationZ: (Number(e.target.value) * Math.PI) / 180,
                        });
                      }}
                      onBlur={(e) => {
                        if (!selectedAdditionId || !activeAdditionOffset) return;
                        const val = Number(e.target.value);
                        if (val < -180) {
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            rotationZ: (-180 * Math.PI) / 180,
                          });
                        } else if (val > 180) {
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            rotationZ: (180 * Math.PI) / 180,
                          });
                        }
                      }}
                      className="w-16 rounded border px-2 py-1.5 text-right text-sm text-white bg-[#454545] border-[#5A5A5A] focus:border-[#D7B356] focus:ring-2 focus:ring-[#D7B356]/30 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedAdditionId || !activeAdditionOffset) return;
                        const newVal = Math.min(180, additionRotation + 1);
                        setAdditionOffset(selectedAdditionId, {
                          ...activeAdditionOffset,
                          rotationZ: (newVal * Math.PI) / 180,
                        });
                      }}
                      className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                      aria-label="Increase rotation by 1 degree"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium text-gray-300">°</span>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={additionRotation}
                    onChange={(e) => {
                      if (selectedAdditionId && activeAdditionOffset) {
                        setAdditionOffset(selectedAdditionId, {
                          ...activeAdditionOffset,
                          rotationZ: (Number(e.target.value) * Math.PI) / 180,
                        });
                      }
                    }}
                    className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
                    <span>-180°</span>
                    <span>180°</span>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        ) : null}
        
        {showAdditionCatalog && !selectedAdditionId && (
          <div className="flex-1 overflow-hidden rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
            <div className="h-full overflow-y-auto pr-1">
              <AdditionSelector additions={additionsList} />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderSelectMotifsPanel = () => {
    const activeMotif = selectedMotifs.find((m) => m.id === selectedMotifId);
    const activeOffset = selectedMotifId
      ? (motifOffsets[selectedMotifId] || {
          xPos: 0,
          yPos: 0,
          scale: 1,
          rotationZ: 0,
          heightMm: 100,
        })
      : null;

    const isLaser = catalog?.product?.laser === '1';
    const isBronze = catalog?.product?.type === 'bronze_plaque';

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
    }

    const hasActiveMotif = !!selectedMotifId && !!activeOffset && !!activeMotif && activePanel === 'motif';
    const rotationDegrees = ((activeOffset?.rotationZ ?? 0) * 180) / Math.PI;
    const motifPriceValue =
      hasActiveMotif && motifPriceModel && !isLaser
        ? calculateMotifPrice(
            activeOffset?.heightMm ?? initHeight,
            activeMotif?.color ?? '#c99d44',
            motifPriceModel.priceModel,
            isLaser
          )
        : null;
    const showMotifCatalog =
      activeFullscreenPanel === 'select-motifs' && (forceMotifCatalog || !hasActiveMotif);

    return (
      <div className="flex h-full flex-col gap-4">
        {hasActiveMotif ? (
          <div className="space-y-5 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Selected: <span className="font-semibold text-white">{selectedMotifId}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedMotifId(null);
              setActivePanel(null);
            }}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Clear selection
          </button>
        </div>

        {motifPriceValue !== null && (
          <div className="border border-white/15 bg-white/5 p-4 rounded-xl">
            <div className="text-xs text-white/60 uppercase tracking-[0.2em] mb-1">Motif Price</div>
            <div className="text-2xl font-semibold text-white">${motifPriceValue.toFixed(2)}</div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            onClick={() => selectedMotifId && duplicateMotif(selectedMotifId)}
          >
            Duplicate
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            onClick={() => {
              if (selectedMotifId) {
                removeMotif(selectedMotifId);
                setSelectedMotifId(null);
                setActivePanel(null);
              }
            }}
          >
            Delete
          </button>
        </div>

        <div className="space-y-4">
          {/* Height Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-200 w-20">Height</label>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedMotifId) return;
                    const newVal = Math.max(minHeight, (activeOffset.heightMm ?? initHeight) - 1);
                    setMotifOffset(selectedMotifId, {
                      ...activeOffset,
                      heightMm: newVal,
                    });
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Decrease height by 1mm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  min={minHeight}
                  max={maxHeight}
                  step={1}
                  value={activeOffset.heightMm ?? initHeight}
                  onChange={(e) => {
                    if (!selectedMotifId) return;
                    setMotifOffset(selectedMotifId, {
                      ...activeOffset,
                      heightMm: Number(e.target.value),
                    });
                  }}
                  onBlur={(e) => {
                    if (!selectedMotifId) return;
                    const val = Number(e.target.value);
                    if (val < minHeight) {
                      setMotifOffset(selectedMotifId, {
                        ...activeOffset,
                        heightMm: minHeight,
                      });
                    } else if (val > maxHeight) {
                      setMotifOffset(selectedMotifId, {
                        ...activeOffset,
                        heightMm: maxHeight,
                      });
                    }
                  }}
                  className={`w-16 rounded border px-2 py-1.5 text-right text-sm text-white bg-[#454545] focus:outline-none focus:ring-2 transition-colors ${
                    (activeOffset.heightMm ?? initHeight) < minHeight || (activeOffset.heightMm ?? initHeight) > maxHeight
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-[#5A5A5A] focus:border-[#D7B356] focus:ring-[#D7B356]/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedMotifId) return;
                    const newVal = Math.min(maxHeight, (activeOffset.heightMm ?? initHeight) + 1);
                    setMotifOffset(selectedMotifId, {
                      ...activeOffset,
                      heightMm: newVal,
                    });
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Increase height by 1mm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-300">mm</span>
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                min={minHeight}
                max={maxHeight}
                step={1}
                value={activeOffset.heightMm ?? initHeight}
                onChange={(e) =>
                  selectedMotifId &&
                  setMotifOffset(selectedMotifId, {
                    ...activeOffset,
                    heightMm: Number(e.target.value),
                  })
                }
                className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
                <span>{minHeight}mm</span>
                <span>{maxHeight}mm</span>
              </div>
            </div>
          </div>

          {/* Rotation Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-200 w-20">Rotation</label>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedMotifId) return;
                    const newVal = Math.max(-180, rotationDegrees - 1);
                    setMotifOffset(selectedMotifId, {
                      ...activeOffset,
                      rotationZ: (newVal * Math.PI) / 180,
                    });
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Decrease rotation by 1 degree"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  min={-180}
                  max={180}
                  step={1}
                  value={Math.round(rotationDegrees)}
                  onChange={(e) => {
                    if (!selectedMotifId) return;
                    setMotifOffset(selectedMotifId, {
                      ...activeOffset,
                      rotationZ: (Number(e.target.value) * Math.PI) / 180,
                    });
                  }}
                  onBlur={(e) => {
                    if (!selectedMotifId) return;
                    const val = Number(e.target.value);
                    if (val < -180) {
                      setMotifOffset(selectedMotifId, {
                        ...activeOffset,
                        rotationZ: (-180 * Math.PI) / 180,
                      });
                    } else if (val > 180) {
                      setMotifOffset(selectedMotifId, {
                        ...activeOffset,
                        rotationZ: (180 * Math.PI) / 180,
                      });
                    }
                  }}
                  className={`w-16 rounded border px-2 py-1.5 text-right text-sm text-white bg-[#454545] focus:outline-none focus:ring-2 transition-colors ${
                    rotationDegrees < -180 || rotationDegrees > 180
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-[#5A5A5A] focus:border-[#D7B356] focus:ring-[#D7B356]/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedMotifId) return;
                    const newVal = Math.min(180, rotationDegrees + 1);
                    setMotifOffset(selectedMotifId, {
                      ...activeOffset,
                      rotationZ: (newVal * Math.PI) / 180,
                    });
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Increase rotation by 1 degree"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-300">°</span>
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotationDegrees}
                onChange={(e) =>
                  selectedMotifId &&
                  setMotifOffset(selectedMotifId, {
                    ...activeOffset,
                    rotationZ: (Number(e.target.value) * Math.PI) / 180,
                  })
                }
                className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
                <span>-180°</span>
                <span>180°</span>
              </div>
            </div>
          </div>

          {!isLaser && catalog?.product?.color !== '0' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Select Color</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => selectedMotifId && setMotifColor(selectedMotifId, '#c99d44')}
                  className="flex flex-col items-center gap-1 rounded-lg border border-white/15 p-2 transition-colors hover:bg-white/5"
                >
                  <span className="h-5 w-5 rounded border border-white/20" style={{ backgroundColor: '#c99d44' }} />
                  <span className="text-xs text-white/80">Gold Gilding</span>
                </button>
                <button
                  type="button"
                  onClick={() => selectedMotifId && setMotifColor(selectedMotifId, '#eeeeee')}
                  className="flex flex-col items-center gap-1 rounded-lg border border-white/15 p-2 transition-colors hover:bg-white/5"
                >
                  <span className="h-5 w-5 rounded border border-white/20" style={{ backgroundColor: '#eeeeee' }} />
                  <span className="text-xs text-white/80">Silver Gilding</span>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {data.colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className={`h-6 w-6 rounded border ${activeMotif?.color === color.hex ? 'border-[#D7B356] ring-2 ring-[#D7B356]' : 'border-white/20'}`}
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
        ) : null}

        {showMotifCatalog && (
          <div className="flex-1 overflow-hidden rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
            <MotifSelectorPanel motifs={motifCategories} />
          </div>
        )}
      </div>
    );
  };

  // Sync canvas selection with editingObject on select-size page
  useEffect(() => {
    if (isSelectSizePage && selected !== editingObject) {
      setSelected(editingObject);
    }
  }, [isSelectSizePage, editingObject, selected, setSelected]);

  let quantity = widthMm * heightMm;
  if (catalog) {
    const qt = catalog.product.priceModel.quantityType;
    if (qt === 'Width + Height') {
      quantity = widthMm + heightMm;
    }
  }
  
  let baseQuantity = 0;
  if (showBase && catalog?.product?.basePriceModel) {
    const qt = catalog.product.basePriceModel.quantityType;
    if (qt === 'Width + Height') {
      baseQuantity = baseWidthMm + baseHeightMm;
    } else if (qt === 'Width') {
      baseQuantity = baseWidthMm + baseThickness; // Width + Thickness (depth)
    } else {
      baseQuantity = baseWidthMm * baseHeightMm;
    }
  }
  
  const headstonePrice = catalog ? calculatePrice(catalog.product.priceModel, quantity) : 0;
  const basePrice = showBase && catalog?.product?.basePriceModel 
    ? calculatePrice(catalog.product.basePriceModel, baseQuantity) 
    : 0;
  const price = headstonePrice + basePrice;
  const formattedPrice = price > 0 ? price.toFixed(2) : null;
  const productTitle = React.useMemo(() => {
    // Safety check: Only use catalog name if it matches the selected product ID
    if (catalog?.product?.name && catalog.product.id === productId) {
      return catalog.product.name;
    }
    if (!productId) {
      return 'Design Your Own Headstone';
    }
    return data.products.find((p) => p.id === productId)?.name ?? 'Design Your Own Headstone';
  }, [catalog, productId]);
  const dimensionLabel = widthMm > 0 && heightMm > 0 ? `${widthMm} × ${heightMm} mm` : 'Select dimensions';

  const handleMenuClick = (slug: string, e: React.MouseEvent) => {
    if (fullscreenPanelSlugs.has(slug)) {
      e.preventDefault();
      const keepCanvasVisibleForShape = slug === 'select-shape' && isCanvasVisible;
      openFullscreenPanel(slug);
      if (!keepCanvasVisibleForShape && pathname !== `/${slug}`) {
        router.push(`/${slug}`);
      }
      return;
    }

    if (slug === 'check-price') {
      e.preventDefault();
      router.push('/check-price');
    }
  };

  const handleNewDesign = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Are you sure you want to start a new design? This will remove all inscriptions, additions, and motifs.')) {
      resetDesign();
      // Don't navigate, just reset the design and stay on current page
    }
  };

  const handleToggleConvertPanel = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!productId) return;
    setShowConvertPanel((prev) => !prev);
  };

  const handleConvertProductSelect = (selectedProductId: string) => {
    if (!selectedProductId) return;
    setProductId(selectedProductId);
    setShowConvertPanel(false);
  };

  const isSelectProductPage = pathname === '/select-product';
  const isSelectShapePage = pathname === '/select-shape';
  const isSelectMaterialPage = pathname === '/select-material';
  const isSelectMotifsPage = pathname === '/select-motifs';
  const isHomePage = pathname === '/';
  const isCheckPricePage = pathname === '/check-price';

  // Helper function to determine status of menu items
  const getItemStatus = (slug: string): 'incomplete' | 'complete' | 'available' => {
    const productId = useHeadstoneStore.getState().productId;
    const shapeUrl = useHeadstoneStore.getState().shapeUrl;
    const materialUrl = useHeadstoneStore.getState().materialUrl;
    
    if (slug === 'select-product' && !productId) return 'incomplete';
    if (slug === 'select-shape' && !shapeUrl) return 'incomplete';
    if (slug === 'select-material' && !materialUrl) return 'incomplete';
    if (slug === 'select-size' && (widthMm > 0 && heightMm > 0)) return 'complete';
    if (slug === 'inscriptions' && inscriptions.length > 0) return 'complete';
    if (slug === 'select-additions' && selectedAdditions.length > 0) return 'complete';
    if (slug === 'select-motifs' && selectedMotifs.length > 0) return 'complete';
    return 'available';
  };

  // Helper function to get count badge for sections with items
  const getItemCount = (slug: string): number | null => {
    if (slug === 'inscriptions') return inscriptions.length || null;
    if (slug === 'select-additions') return selectedAdditions.length || null;
    if (slug === 'select-motifs') return selectedMotifs.length || null;
    return null;
  };

  // Render Select Size panel content
  const renderSelectSizePanel = (extraClassName = '') => {
    const firstShape = catalog?.product?.shapes?.[0];
    const currentWidthMm = editingObject === 'base' ? baseWidthMm : widthMm;
    const currentHeightMm = editingObject === 'base' ? baseHeightMm : heightMm;
    const setCurrentWidthMm = editingObject === 'base' ? setBaseWidthMm : setWidthMm;
    const setCurrentHeightMm = editingObject === 'base' ? setBaseHeightMm : setHeightMm;
    
    const minWidth = editingObject === 'base' ? widthMm : (firstShape?.table?.minWidth ?? 40);
    const maxWidth = editingObject === 'base' ? 2000 : (firstShape?.table?.maxWidth ?? 1200);
    const minHeight = editingObject === 'base' ? 50 : (firstShape?.table?.minHeight ?? 40);
    const maxHeight = editingObject === 'base' ? 200 : (firstShape?.table?.maxHeight ?? 1200);
    
    const minThickness = editingObject === 'base' 
      ? (firstShape?.stand?.minDepth ?? 100)
      : (firstShape?.table?.minDepth ?? 100);
    const maxThickness = editingObject === 'base'
      ? (firstShape?.stand?.maxDepth ?? 300)
      : (firstShape?.table?.maxDepth ?? 300);

    return (
      <div className={`fs-size-panel space-y-5 rounded-2xl p-4 shadow-xl backdrop-blur-sm ${extraClassName}`}>
        {!isPlaque && (
          <SegmentedControl
            value={editingObject}
            onChange={(value) => {
              setEditingObject(value as 'headstone' | 'base');
              setSelected(value as 'headstone' | 'base');
              if (value === 'base') {
                setShowBase(true);
              }
            }}
            options={[
              { label: 'Headstone', value: 'headstone' },
              { label: 'Base', value: 'base' },
            ]}
          />
        )}

        {editingObject === 'base' && (
          <>
            <div className="flex gap-1.5 rounded-full bg-[#0A0A0A] p-1 border border-[#3A3A3A]">
              <button
                type="button"
                onClick={() => setShowBase(false)}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  !showBase
                    ? 'bg-[#D7B356] text-black shadow-lg shadow-[#D7B356]/30'
                    : 'text-gray-300 hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                No Base
              </button>
              <button
                type="button"
                onClick={() => {
                  setBaseFinish('default');
                  setShowBase(true);
                }}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  baseFinish === 'default' && showBase
                    ? 'bg-[#D7B356] text-black shadow-lg shadow-[#D7B356]/30'
                    : 'text-gray-300 hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                Polished
              </button>
              <button
                type="button"
                onClick={() => {
                  setBaseFinish('rock-pitch');
                  setShowBase(true);
                }}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  baseFinish === 'rock-pitch' && showBase
                    ? 'bg-[#D7B356] text-black shadow-lg shadow-[#D7B356]/30'
                    : 'text-gray-300 hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                Rock Pitch
              </button>
            </div>
            <div className="border-t border-[#3A3A3A]/50 -mx-4"></div>
          </>
        )}

        {editingObject === 'headstone' && !isPlaque && (
          <>
            <SegmentedControl
              value={headstoneStyle}
              onChange={(value) => setHeadstoneStyle(value as 'upright' | 'slant')}
              options={[
                { label: 'Upright', value: 'upright' },
                { label: 'Slant', value: 'slant' },
              ]}
            />
            <div className="border-t border-[#3A3A3A]/50 -mx-4"></div>
          </>
        )}

        <div className={`space-y-1 ${editingObject === 'base' && !showBase ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-gray-200 w-20">Width</label>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  const newVal = Math.max(minWidth, currentWidthMm - 10);
                  setCurrentWidthMm(newVal);
                }}
                disabled={editingObject === 'base' && !showBase}
                className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease width by 10mm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                min={minWidth}
                max={maxWidth}
                step={10}
                value={currentWidthMm}
                onChange={(e) => setCurrentWidthMm(Number(e.target.value))}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val < minWidth) {
                    setCurrentWidthMm(minWidth);
                  } else if (val > maxWidth) {
                    setCurrentWidthMm(maxWidth);
                  }
                }}
                disabled={editingObject === 'base' && !showBase}
                className={`w-16 rounded border px-2 py-1.5 text-right text-sm text-white bg-[#454545] focus:outline-none focus:ring-2 transition-colors ${
                  currentWidthMm < minWidth || currentWidthMm > maxWidth
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                    : 'border-[#5A5A5A] focus:border-[#D7B356] focus:ring-[#D7B356]/30'
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  const newVal = Math.min(maxWidth, currentWidthMm + 10);
                  setCurrentWidthMm(newVal);
                }}
                disabled={editingObject === 'base' && !showBase}
                className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase width by 10mm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-300">mm</span>
            </div>
          </div>
          <div className="relative">
            <input
              type="range"
              min={minWidth}
              max={maxWidth}
              step={10}
              value={currentWidthMm}
              onChange={(e) => setCurrentWidthMm(Number(e.target.value))}
              disabled={editingObject === 'base' && !showBase}
              className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
              <span>{minWidth}mm</span>
              <span>{maxWidth}mm</span>
            </div>
          </div>
        </div>

        <div className={`space-y-1 ${editingObject === 'base' && !showBase ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-gray-200 w-20">Height</label>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  const newVal = Math.max(minHeight, currentHeightMm - 10);
                  setCurrentHeightMm(newVal);
                }}
                disabled={editingObject === 'base' && !showBase}
                className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease height by 10mm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                min={minHeight}
                max={maxHeight}
                step={10}
                value={currentHeightMm}
                onChange={(e) => setCurrentHeightMm(Number(e.target.value))}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val < minHeight) {
                    setCurrentHeightMm(minHeight);
                  } else if (val > maxHeight) {
                    setCurrentHeightMm(maxHeight);
                  }
                }}
                disabled={editingObject === 'base' && !showBase}
                className={`w-16 rounded border px-2 py-1.5 text-right text-sm text-white bg-[#454545] focus:outline-none focus:ring-2 transition-colors ${
                  currentHeightMm < minHeight || currentHeightMm > maxHeight
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                    : 'border-[#5A5A5A] focus:border-[#D7B356] focus:ring-[#D7B356]/30'
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  const newVal = Math.min(maxHeight, currentHeightMm + 10);
                  setCurrentHeightMm(newVal);
                }}
                disabled={editingObject === 'base' && !showBase}
                className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase height by 10mm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-300">mm</span>
            </div>
          </div>
          <div className="relative">
            <input
              type="range"
              min={minHeight}
              max={maxHeight}
              step={10}
              value={currentHeightMm}
              onChange={(e) => setCurrentHeightMm(Number(e.target.value))}
              disabled={editingObject === 'base' && !showBase}
              className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgба(0,0,0,0.3)]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
              <span>{minHeight}mm</span>
              <span>{maxHeight}mm</span>
            </div>
          </div>
        </div>

        {editingObject === 'headstone' && !isPlaque && (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-200 w-20">Thickness</label>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const currentVal = headstoneStyle === 'upright' ? uprightThickness : slantThickness;
                    const newVal = Math.max(minThickness, currentVal - 10);
                    if (headstoneStyle === 'upright') {
                      setUprightThickness(newVal);
                    } else {
                      setSlantThickness(newVal);
                    }
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Decrease thickness by 10mm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  min={minThickness}
                  max={maxThickness}
                  step={10}
                  value={Math.round(headstoneStyle === 'upright' ? uprightThickness : slantThickness)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (headstoneStyle === 'upright') {
                      setUprightThickness(val);
                    } else {
                      setSlantThickness(val);
                    }
                  }}
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (val < minThickness) {
                      if (headstoneStyle === 'upright') {
                        setUprightThickness(minThickness);
                      } else {
                        setSlantThickness(minThickness);
                      }
                    } else if (val > maxThickness) {
                      if (headstoneStyle === 'upright') {
                        setUprightThickness(maxThickness);
                      } else {
                        setSlantThickness(maxThickness);
                      }
                    }
                  }}
                  className={`w-16 rounded border px-2 py-1.5 text-right text-sm text-white bg-[#454545] focus:outline-none focus:ring-2 transition-colors ${
                    (headstoneStyle === 'upright' ? uprightThickness : slantThickness) < minThickness ||
                    (headstoneStyle === 'upright' ? uprightThickness : slantThickness) > maxThickness
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-[#5A5A5A] focus:border-[#D7B356] focus:ring-[#D7B356]/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const currentVal = headstoneStyle === 'upright' ? uprightThickness : slantThickness;
                    const newVal = Math.min(maxThickness, currentVal + 10);
                    if (headstoneStyle === 'upright') {
                      setUprightThickness(newVal);
                    } else {
                      setSlantThickness(newVal);
                    }
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Increase thickness by 10mm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-300">mm</span>
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                min={minThickness}
                max={maxThickness}
                step={10}
                value={headstoneStyle === 'upright' ? uprightThickness : slantThickness}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  if (headstoneStyle === 'upright') {
                    setUprightThickness(newValue);
                  } else {
                    setSlantThickness(newValue);
                  }
                }}
                className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgба(215,179,86,0.4),0_0_0_3px_rgба(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgба(215,179,86,0.6),0_0_0_3px_rgба(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgба(215,179,86,0.4),0_0_0_3px_rgба(0,0,0,0.3)]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
                <span>{minThickness}mm</span>
                <span>{maxThickness}mm</span>
              </div>
            </div>
          </div>
        )}

        {editingObject === 'base' && showBase && (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-200 w-20">Thickness</label>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(minThickness, baseThickness - 10);
                    setBaseThickness(newVal);
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Decrease base thickness by 10mm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  min={minThickness}
                  max={maxThickness}
                  step={10}
                  value={Math.round(baseThickness)}
                  onChange={(e) => setBaseThickness(Number(e.target.value))}
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (val < minThickness) {
                      setBaseThickness(minThickness);
                    } else if (val > maxThickness) {
                      setBaseThickness(maxThickness);
                    }
                  }}
                  className={`w-16 rounded border px-2 py-1.5 text-right text-sm text-white bg-[#454545] focus:outline-none focus:ring-2 transition-colors ${
                    baseThickness < minThickness || baseThickness > maxThickness
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-[#5A5A5A] focus:border-[#D7B356] focus:ring-[#D7B356]/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(maxThickness, baseThickness + 10);
                    setBaseThickness(newVal);
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Increase base thickness by 10mm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-300">mm</span>
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                min={minThickness}
                max={maxThickness}
                step={10}
                value={baseThickness}
                onChange={(e) => setBaseThickness(Number(e.target.value))}
                className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgба(215,179,86,0.4),0_0_0_3px_rgба(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgба(215,179,86,0.6),0_0_0_3px_rgба(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgба(215,179,86,0.4),0_0_0_3px_rgба(0,0,0,0.3)]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
                <span>{minThickness}mm</span>
                <span>{maxThickness}mm</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      ref={navRef}
      className="flex h-full flex-col bg-gradient-to-br from-[#3d2817] via-[#2a1f14] to-[#1a1410] text-white overflow-hidden"
    >
      {/* Full-Screen Panel Overlay */}
      {shouldShowFullscreenPanel ? (
        <div className="flex flex-col h-full">
          {/* Panel Header - desktop only */}
          <div className="hidden border-b border-white/10 bg-[#1b1511] px-5 py-4 md:block">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2">
                <button
                  onClick={closeFullscreenPanel}
                  className="inline-flex items-center gap-3 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition-colors duration-200 hover:border-white/40 hover:text-white"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </span>
                  <span className="tracking-wide">Back&nbsp;to&nbsp;Menu</span>
                </button>
                {shouldShowBackToListButton && (
                  <button
                    onClick={activeFullscreenPanel === 'select-additions' ? handleBackToAdditionList : handleBackToMotifList}
                    className="inline-flex items-center gap-3 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:border-white/40 hover:text-white"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70">
                      <Squares2X2Icon className="h-4 w-4" />
                    </span>
                    <span className="tracking-wide">Back&nbsp;to&nbsp;List</span>
                  </button>
                )}
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Guided Step</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{menuItems.find(item => item.slug === activeFullscreenPanel)?.name}</h2>
                <div className="mt-3 h-px w-24 bg-white/20" />
              </div>
            </div>
          </div>
          
          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Render content based on activeFullscreenPanel */}
            {activeFullscreenPanel === 'select-size' && renderSelectSizePanel()}
            {activeFullscreenPanel === 'select-shape' && (
              <div className="space-y-6">
                <ShapeSelector shapes={shapes} />
              </div>
            )}
            {activeFullscreenPanel === 'select-material' && (
              <div className="space-y-6">
                <MaterialSelector materials={materials} />
              </div>
            )}
            {activeFullscreenPanel === 'select-border' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm h-[calc(100vh-220px)] overflow-hidden">
                  <div className="h-full overflow-y-auto pr-1">
                    <BorderSelector disableInternalScroll />
                  </div>
                </div>
              </div>
            )}
            {activeFullscreenPanel === 'inscriptions' && (
              <div className="space-y-6">
                <InscriptionEditPanel />
              </div>
            )}
            {activeFullscreenPanel === 'select-additions' && renderSelectAdditionsPanel()}
            {activeFullscreenPanel === 'select-motifs' && renderSelectMotifsPanel()}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Header */}
          <div className="hidden items-center justify-between border-b border-white/10 px-6 md:flex">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/ico/forever-transparent-logo.png" alt="Forever Logo" />
            </Link>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden border-b border-white/5 bg-[#120c08]/95 px-5 py-4 shadow-[0_10px_25px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.45em] text-white/50">Guided Studio</p>
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <img src="/ico/forever-transparent-logo.png" alt="Forever Logo" className="h-8 w-auto" />
              </Link>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 md:space-y-0 md:p-4">

        {/* Primary/Secondary CTAs */}
        {(hasCustomizations || productId) && (
          <div className="flex flex-col gap-3 sm:flex-row mb-5">
            {hasCustomizations && (
              <button
                onClick={handleNewDesign}
                className="flex-1 inline-flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-gray-900 bg-gradient-to-r from-[#f4d07e] to-[#d7b356] shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all hover:from-[#ffe2a8] hover:to-[#e0c068] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4d07e]"
              >
                <ArrowPathIcon className="h-5 w-5" />
                <span>New Design</span>
              </button>
            )}
            {productId && (
              <button
                onClick={handleToggleConvertPanel}
                className={`flex-1 inline-flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all border ${
                  showConvertPanel
                    ? 'text-[#f4d07e] border-[#f4d07e] bg-white/5'
                    : 'text-gray-200 border-white/20 hover:border-white/40 hover:bg-white/5'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
                <span>Convert&nbsp;Design</span>
              </button>
            )}
          </div>
        )}

        {showConvertPanel && productId && (
          <div className="mb-6 rounded-2xl border border-white/15 bg-[#120c08]/90 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Convert this design</p>
                <p className="text-xs text-white/60">Select a different product to reload catalog settings</p>
              </div>
              <button
                type="button"
                onClick={() => setShowConvertPanel(false)}
                className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-wide text-white/70 hover:border-white/40 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="mt-4 max-h-80 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-3">
                {products.map((product) => {
                  const isActiveProduct = product.id === productId;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleConvertProductSelect(product.id)}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                        isActiveProduct
                          ? 'border-[#cfac6c] bg-white/10 shadow-lg shadow-[#cfac6c]/15'
                          : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                      }`}
                    >
                      <div className="h-16 w-16 overflow-hidden rounded-lg bg-black/40">
                        <img
                          src={`/webp/products/${product.image}`}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-white leading-tight">{product.name}</p>
                        <p className="text-xs text-white/60 capitalize">{product.category}</p>
                        {isActiveProduct ? (
                          <span className="text-[11px] font-medium text-emerald-400">Current product</span>
                        ) : (
                          <span className="text-[11px] text-white/50">Tap to convert</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Grouped Menu Navigation */}
        <div className="flex flex-col gap-5">
          {menuGroups.map((group, groupIndex) => (
            <div
              key={group.label}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-black/20 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#0f0a07]/60 text-xs font-semibold text-white/80">
                    {String(groupIndex + 1).padStart(2, '0')}
                  </span>
                  <p className="text-lg text-white font-normal tracking-tight">{group.label}</p>
                </div>
                <span className="text-[9px] uppercase tracking-[0.4em] text-white/45">Step {groupIndex + 1}</span>
              </div>
              
              {/* Group Items */}
              <div className="flex flex-col gap-2">
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  const isRouteActive = pathname === `/${item.slug}`;
                  const isPanelActive = activeFullscreenPanel === item.slug;
                  const isActive = isRouteActive || isPanelActive;
                  const highlightActive = fullscreenPanelSlugs.has(item.slug) ? (isPanelActive || isRouteActive) : isActive;
                  const itemStatus = getItemStatus(item.slug);
                  const itemCount = getItemCount(item.slug);
                  
                  // Status-based styling
                  const statusClasses = 
                    itemStatus === 'complete' ? 'border-green-500/30 text-green-400' :
                    itemStatus === 'incomplete' ? 'border-amber-500/30 text-amber-400' :
                    'border-white/10 text-gray-200';
            
            // Hide "Select Material" for laser etched products
            if (item.slug === 'select-material' && catalog?.product?.laser === '1') {
              return null;
            }
            
            // Hide "Select Border" for products without border support
            if (item.slug === 'select-border' && !hasBorder) {
              return null;
            }
            
            // Hide "Select Additions" for laser etched products
            if (item.slug === 'select-additions' && catalog?.product?.laser === '1') {
              return null;
            }
            
            // Hide 3D Preview when canvas is already visible or on select-size page
            if (item.slug === '3d-preview' && (showCanvas || pathname === '/select-size')) {
              return null;
            }
            
            if (fullscreenPanelSlugs.has(item.slug)) {
              const shouldRenderInlinePanel =
                item.slug === 'select-size' &&
                isSelectSizePage &&
                !selectedMotifId &&
                !selectedAdditionId &&
                activeFullscreenPanel === 'select-size';

              return (
                <React.Fragment key={item.slug}>
                  <button
                    type="button"
                    data-section={item.slug}
                    onClick={(e) => handleMenuClick(item.slug, e)}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-light transition-all ${
                      highlightActive
                        ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm'
                        : 'text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </button>

                  {shouldRenderInlinePanel && renderSelectSizePanel('mt-3')}
                </React.Fragment>
              );
            }
            

            // Special handling for Select Border - show border selector in sidebar when canvas is visible
            if (item.slug === 'select-border') {
              return (
                <React.Fragment key={item.slug}>
                  {isCanvasVisible ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // Navigate to select-border page to keep canvas visible and show border selector
                          if (pathname !== '/select-border') {
                            router.push('/select-border');
                          }
                        }}
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all w-full text-left cursor-pointer ${
                          isActive
                            ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                            : 'text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span>{item.name}</span>
                      </button>
                      
                      {isActive && !selectedMotifId && !selectedAdditionId && (
                        <div className="mt-3 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
                          <BorderSelector />
                        </div>
                      )}
                    </>
                  ) : (
                    // Show link when canvas is not visible (first-time selection)
                    <Link
                      href={`/${item.slug}`}
                      data-section={item.slug}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
                        isActive 
                          ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                          : 'text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                  
                </React.Fragment>
              );
            }

            // Special handling for Select Material - show material selector in sidebar when canvas is visible
            if (item.slug === 'select-material') {
              return (
                <React.Fragment key={item.slug}>
                  {isCanvasVisible ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // Navigate to select-material page to keep canvas visible and show material selector
                          if (pathname !== '/select-material') {
                            router.push('/select-material');
                          }
                        }}
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all w-full text-left cursor-pointer ${
                          isActive
                            ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                            : 'text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span>{item.name}</span>
                      </button>
                      
                      {isActive && !selectedMotifId && !selectedAdditionId && materials.length > 0 && (
                        <div className="mt-3 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm h-[calc(100vh-280px)] overflow-hidden">
                          <div className="h-full overflow-y-auto pr-1">
                            <MaterialSelector materials={materials} disableInternalScroll />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Show link when canvas is not visible (first-time selection)
                    <Link
                      href={`/${item.slug}`}
                      data-section={item.slug}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
                        isActive 
                          ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                          : 'text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                  
                </React.Fragment>
              );
            }
            
            // Determine if step should be disabled (steps 3-10 need a product selected)
            // Exception: Check Price is always enabled (users can see base price even with empty headstone)
            const needsProduct = index >= 2 && item.slug !== 'check-price';
            const isDisabled = needsProduct && !catalog;
            
            return (
              <React.Fragment key={item.slug}>
                {isDisabled ? (
                  <div
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light opacity-40 cursor-not-allowed border border-white/5"
                    title="Please select a product first"
                  >
                    <Icon className="h-5 w-5 flex-shrink-0 text-gray-500" />
                    <span className="text-gray-500">{item.name}</span>
                  </div>
                ) : (
                  <Link
                    href={`/${item.slug}`}
                    onClick={(e) => handleMenuClick(item.slug, e)}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
                      isActive 
                        ? `text-white bg-white/15 shadow-lg border backdrop-blur-sm ${statusClasses}` 
                        : `hover:bg-white/10 border hover:border-white/20 ${statusClasses}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    
                    {/* Count Badge */}
                    {itemCount && itemCount > 0 && (
                      <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-xs font-medium">
                        {itemCount}
                      </span>
                    )}
                    
                    {/* Expandable Indicator */}
                    {(item.slug === 'inscriptions' || item.slug === 'select-additions' || item.slug === 'select-motifs') && itemCount && itemCount > 0 && (
                      expandedSections[item.slug] ? 
                        <ChevronUpIcon className="h-4 w-4 flex-shrink-0" /> : 
                        <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
                    )}
                  </Link>
                )}
                
              </React.Fragment>
            );
          })}
              </div>
            </div>
          ))}
        </div>
          
        {/* Browse Designs CTA */}
        <Link
          href="/designs"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-light transition-all text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm hover:bg-white/20"
        >
          <SparklesIcon className="h-5 w-5 flex-shrink-0" />
          <span>Browse Designs</span>
        </Link>
      </div>
        </>
      )}
    </nav>
  );
}




