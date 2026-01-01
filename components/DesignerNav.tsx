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
import MaterialSelector from './MaterialSelector';
import ShapeSelector from './ShapeSelector';
import AdditionSelector from './AdditionSelector';

// Menu items grouped by workflow stage
const menuGroups = [
  {
    label: 'Setup',
    items: [
      { slug: 'select-product', name: 'Select Product', icon: CubeIcon },
      { slug: 'select-shape', name: 'Select Shape', icon: Squares2X2Icon },
      { slug: 'select-material', name: 'Select Material', icon: SwatchIcon },
      { slug: 'select-size', name: 'Select Size', icon: ArrowsPointingOutIcon },
    ]
  },
  {
    label: 'Design',
    items: [
      { slug: 'inscriptions', name: 'Inscriptions', icon: DocumentTextIcon },
      { slug: 'select-additions', name: 'Select Additions', icon: PlusCircleIcon },
      { slug: 'select-motifs', name: 'Select Motifs', icon: SparklesIcon },
    ]
  },
  {
    label: 'Finalize',
    items: [
      { slug: 'check-price', name: 'Check Price', icon: CurrencyDollarIcon },
    ]
  }
];

// Flatten for compatibility with existing code
const menuItems = menuGroups.flatMap(group => group.items);

export default function DesignerNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Ref for the nav container
  const navRef = React.useRef<HTMLElement>(null);
  
  // Get catalog info
  const catalog = useHeadstoneStore((s) => s.catalog);
  const isPlaque = catalog?.product.type === 'plaque';
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
  const resetDesign = useHeadstoneStore((s) => s.resetDesign);
  const editingObject = useHeadstoneStore((s) => s.editingObject);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const selected = useHeadstoneStore((s) => s.selected);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const setShowBase = useHeadstoneStore((s) => s.setShowBase);
  const selectedInscriptionId = useHeadstoneStore((s) => s.selectedInscriptionId);

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
  
  // Toggle a section's expansion
  const toggleSection = (slug: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };
  
  // Open full-screen panel
  const openFullscreenPanel = (slug: string) => {
    setActiveFullscreenPanel(slug);
  };
  
  // Close full-screen panel and return to menu
  const closeFullscreenPanel = () => {
    setActiveFullscreenPanel(null);
    // Navigate away from the panel route to show menu
    if (pathname === '/select-size' || pathname === '/inscriptions' || 
        pathname === '/select-additions' || pathname === '/select-motifs') {
      router.push('/select-product'); // Go back to product selection or home
    }
  };
  
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
  
  // Auto-open full-screen panel based on current route
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
  
  // State for Select Size expansion (keep for backward compatibility)
  const [isSizeExpanded, setIsSizeExpanded] = React.useState(false);
  const [showCanvas, setShowCanvas] = React.useState(false);
  
  // State for Select Motifs expansion (keep for backward compatibility)
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
  
  // Get materials and shapes from store
  const materials = useHeadstoneStore((s) => s.materials);
  const shapes = React.useMemo(() => {
    return data.shapes || [];
  }, []);
  const additionsList = React.useMemo(() => {
    return data.additions || [];
  }, []);
  
  // Show Select Size panel when on select-size page
  const isSelectSizePage = pathname === '/select-size';
  
  // Determine if canvas is visible (on pages with 3D scene)
  const canvasVisiblePages = ['/select-size', '/inscriptions', '/select-motifs', '/select-material', '/select-additions'];
  const isCanvasVisible = canvasVisiblePages.some(page => pathname === page);
  
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

  const handleMenuClick = (slug: string, e: React.MouseEvent) => {
    // Sections that should open in full-screen panel
    const fullscreenPanels = ['select-size', 'inscriptions', 'select-additions', 'select-motifs'];
    
    if (fullscreenPanels.includes(slug)) {
      e.preventDefault();
      router.push(`/${slug}`); // Navigate to the route (useEffect will handle panel opening)
    } else if (slug === 'check-price') {
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
  const renderSelectSizePanel = () => {
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
      <div className="space-y-5">
        {/* Plaque Label or Headstone/Base Toggle */}
        {isPlaque ? (
          <div className="flex justify-center">
            <div className="rounded-md px-4 py-2 text-sm font-medium bg-[#D7B356] text-gray-900 shadow-md">
              Plaque
            </div>
          </div>
        ) : (
          <div className="relative flex gap-1 rounded-full bg-[#0A0A0A] p-1.5 border border-[#3A3A3A]">
            <button
              onClick={() => {
                if (editingObject !== 'headstone') {
                  setEditingObject('headstone');
                  setSelected('headstone');
                }
              }}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                editingObject === 'headstone'
                  ? 'bg-[#D7B356] text-black shadow-lg shadow-[#D7B356]/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1A]'
              }`}
            >
              Headstone
            </button>
            <button
              onClick={() => {
                setShowBase(true);
                if (editingObject !== 'base') {
                  setEditingObject('base');
                  setSelected('base');
                }
              }}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                editingObject === 'base'
                  ? 'bg-[#D7B356] text-black shadow-lg shadow-[#D7B356]/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1A]'
              }`}
            >
              Base
            </button>
          </div>
        )}

        {/* Size Controls will continue here... */}
        <div className="text-gray-400 text-sm">
          Width: {currentWidthMm}mm, Height: {currentHeightMm}mm
          <br />
          (Full size controls to be added)
        </div>
      </div>
    );
  };

  return (
    <nav ref={navRef} className="overflow-y-auto h-full bg-gradient-to-br from-[#3d2817] via-[#2a1f14] to-[#1a1410]">
      {/* Full-Screen Panel Overlay */}
      {activeFullscreenPanel ? (
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="p-4 border-b border-[#3A3A3A]/50">
            <button
              onClick={closeFullscreenPanel}
              className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors mb-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back to Menu</span>
            </button>
            <h2 className="text-xl font-light text-white">
              {menuItems.find(item => item.slug === activeFullscreenPanel)?.name}
            </h2>
          </div>
          
          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Render content based on activeFullscreenPanel */}
            {activeFullscreenPanel === 'select-size' && renderSelectSizePanel()}
            {activeFullscreenPanel === 'inscriptions' && (
              <div className="space-y-6">
                <InscriptionEditPanel />
              </div>
            )}
            {activeFullscreenPanel === 'select-additions' && (
              <div className="space-y-6">
                <AdditionSelector additions={additionsList} />
              </div>
            )}
            {activeFullscreenPanel === 'select-motifs' && (
              <div className="space-y-6">
                <p className="text-gray-400 text-sm">Select Motifs panel content</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="p-4 border-b border-[#3A3A3A]/50">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/ico/forever-transparent-logo.png" alt="Forever Logo" className="mb-4" />
            </Link>
          </div>

          {/* Menu Items */}
          <div className="p-4">
        {/* Sticky Context Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-[#3d2817] via-[#2a1f14] to-[#1a1410] pb-3 mb-3 border-b border-white/10">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Currently Editing:</div>
          <div className="text-sm font-medium text-white">
            {editingObject === 'base' ? '🔲 Base' : '🪦 Headstone'}
          </div>
        </div>

        {/* 3D Preview Button */}
        {!showCanvas && pathname !== '/' && pathname !== '/select-size' && (
          <button
            onClick={handlePreviewClick}
            className="w-full flex items-center gap-3 rounded-lg px-4 py-3 mb-4 text-base font-light transition-all text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
          >
            <EyeIcon className="h-5 w-5 flex-shrink-0" />
            <span>3D Preview</span>
          </button>
        )}

        {/* Grouped Menu Navigation */}
        <div className="flex flex-col gap-6">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.label}>
              {/* Group Label */}
              <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-amber-400/70 uppercase">
                {group.label}
              </div>
              
              {/* Group Items */}
              <div className="flex flex-col gap-1">
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === `/${item.slug}`;
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
              
              // Use different dimensions based on what's being edited
              const currentWidthMm = editingObject === 'base' ? baseWidthMm : widthMm;
              const currentHeightMm = editingObject === 'base' ? baseHeightMm : heightMm;
              const setCurrentWidthMm = editingObject === 'base' ? setBaseWidthMm : setWidthMm;
              const setCurrentHeightMm = editingObject === 'base' ? setBaseHeightMm : setHeightMm;
              
              // For base, use different min/max values
              // Base width minimum is the headstone width (cannot be smaller)
              const minWidth = editingObject === 'base' ? widthMm : (firstShape?.table?.minWidth ?? 40);
              const maxWidth = editingObject === 'base' ? 2000 : (firstShape?.table?.maxWidth ?? 1200);
              const minHeight = editingObject === 'base' ? 50 : (firstShape?.table?.minHeight ?? 40);
              const maxHeight = editingObject === 'base' ? 200 : (firstShape?.table?.maxHeight ?? 1200);
              
              // Thickness min/max from catalog
              const minThickness = editingObject === 'base' 
                ? (firstShape?.stand?.minDepth ?? 100)
                : (firstShape?.table?.minDepth ?? 100);
              const maxThickness = editingObject === 'base'
                ? (firstShape?.stand?.maxDepth ?? 300)
                : (firstShape?.table?.maxDepth ?? 300);
              
              return (
                <React.Fragment key={item.slug}>
                  <Link
                    href={`/${item.slug}`}
                    data-section={item.slug}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
                      isActive 
                        ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                        : 'text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                  
                  {isSelectSizePage && !selectedMotifId && !selectedAdditionId && (
                    <div className="fs-size-panel mt-3 space-y-5 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
                      {/* Plaque Label - Show for plaques instead of toggle */}
                      {isPlaque && (
                        <div className="flex justify-center">
                          <div className="rounded-md px-4 py-2 text-sm font-medium bg-[#D7B356] text-gray-900 shadow-md">
                            Plaque
                          </div>
                        </div>
                      )}
                      
                      {/* Headstone/Base Toggle - Hide for plaques */}
                      {!isPlaque && (
                        <div className="relative flex gap-1 rounded-full bg-[#0A0A0A] p-1.5 border border-[#3A3A3A]">
                          <button
                            onClick={() => {
                              if (editingObject !== 'headstone') {
                                setEditingObject('headstone');
                                setSelected('headstone');
                              }
                            }}
                            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                              editingObject === 'headstone'
                                ? 'bg-[#D7B356] text-black shadow-lg shadow-[#D7B356]/30'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1A]'
                            }`}
                          >
                            Headstone
                          </button>
                          <button
                            onClick={() => {
                              setShowBase(true);
                              if (editingObject !== 'base') {
                                setEditingObject('base');
                                setSelected('base');
                              }
                            }}
                            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                              editingObject === 'base'
                                ? 'bg-[#D7B356] text-black shadow-lg shadow-[#D7B356]/30'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1A]'
                            }`}
                          >
                            Base
                          </button>
                        </div>
                      )}

                      {/* Base Finish Selection - Only show when editing base */}
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
                          
                          {/* Divider between finish selection and dimensions */}
                          <div className="border-t border-[#3A3A3A]/50 -mx-4"></div>
                        </>
                      )}

                      {/* Headstone Style Selection - Only show when editing headstone */}
                      {editingObject === 'headstone' && (
                        <>
                          <div className="flex gap-1 rounded-full bg-[#0A0A0A] p-1.5 border border-[#3A3A3A]">
                            <button
                              type="button"
                              onClick={() => setHeadstoneStyle('upright')}
                              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                headstoneStyle === 'upright'
                                  ? 'bg-[#D7B356] text-black shadow-lg shadow-[#D7B356]/30'
                                  : 'text-gray-300 hover:text-white hover:bg-[#1A1A1A]'
                              }`}
                            >
                              {isPlaque ? 'No Border' : 'Upright'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setHeadstoneStyle('slant')}
                              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                headstoneStyle === 'slant'
                                  ? 'bg-[#D7B356] text-black shadow-lg shadow-[#D7B356]/30'
                                  : 'text-gray-300 hover:text-white hover:bg-[#1A1A1A]'
                              }`}
                            >
                              {isPlaque ? 'Border' : 'Slant'}
                            </button>
                          </div>
                          
                          {/* Divider between style and dimensions */}
                          <div className="border-t border-[#3A3A3A]/50 -mx-4"></div>
                        </>
                      )}

                      {/* Width Slider */}
                      <div className={`space-y-1 ${editingObject === 'base' && !showBase ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-sm font-medium text-gray-200 w-20">Width</label>
                          <div className="flex items-center gap-2 justify-end">
                            {/* Decrement Button */}
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
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setCurrentWidthMm(val);
                              }}
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
                            {/* Increment Button */}
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

                      {/* Height Slider - Shows "Height" for both headstone and base */}
                      <div className={`space-y-1 ${editingObject === 'base' && !showBase ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-sm font-medium text-gray-200 w-20">Height</label>
                          <div className="flex items-center gap-2 justify-end">
                            {/* Decrement Button */}
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
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setCurrentHeightMm(val);
                              }}
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
                            {/* Increment Button */}
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
                            className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
                            <span>{minHeight}mm</span>
                            <span>{maxHeight}mm</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Thickness Slider - Show for both upright and slant when editing headstone - Hide for plaques */}
                      {editingObject === 'headstone' && !isPlaque && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-sm font-medium text-gray-200 w-20">Thickness</label>
                            <div className="flex items-center gap-2 justify-end">
                              {/* Decrement Button */}
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
                              {/* Increment Button */}
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
                          <div className="relative"><input type="range"
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
                              className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
                              <span>{minThickness}mm</span>
                              <span>{maxThickness}mm</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Thickness Slider - Show when editing base */}
                      {editingObject === 'base' && showBase && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-sm font-medium text-gray-200 w-20">Thickness</label>
                            <div className="flex items-center gap-2 justify-end">
                              {/* Decrement Button */}
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
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setBaseThickness(val);
                                }}
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
                              {/* Increment Button */}
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
                          <div className="relative"><input type="range"
                              min={minThickness}
                              max={maxThickness}
                              step={10}
                              value={baseThickness}
                              onChange={(e) => {
                                const newValue = Number(e.target.value);
                                setBaseThickness(newValue);
                              }}
                              className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
                              <span>{minThickness}mm</span>
                              <span>{maxThickness}mm</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {showNewDesignAfter && (
                    <button
                      key="new-design-size"
                      onClick={handleNewDesign}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
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
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all w-full text-left cursor-pointer ${
                      isActive 
                        ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                        : 'text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </button>
                  
                  {/* Inscription editing panel - shown only when inscription panel is active */}
                  {activePanel === 'inscription' && (
                    <div className="mt-3 space-y-4 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
                      <InscriptionEditPanel />
                    </div>
                  )}
                  
                  {showNewDesignAfter && (
                    <button
                      key="new-design-inscriptions"
                      onClick={handleNewDesign}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
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
                  {isCanvasVisible ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (pathname !== '/select-additions') {
                            router.push('/select-additions');
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
                      
                      {isActive && additionsList.length > 0 && (
                        <div className="mt-3 space-y-4 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
                          <AdditionSelector additions={additionsList} />
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={`/${item.slug}`}
                      data-section={item.slug}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
                        isActive 
                          ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                          : 'text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                  
                  {selectedAdditionId && activeOffset && activeAddition && activePanel === 'addition' && (
                    <div className="mt-3 space-y-4 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-300">
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
                          className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
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
                          className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
                        />
                      </div>
                    </div>
                  )}
                  
                  {showNewDesignAfter && (
                    <button
                      key="new-design-additions"
                      onClick={handleNewDesign}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
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
                        : 'text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                  
                  {isMotifsExpanded && selectedMotifId && activeOffset && activeMotif && activePanel === 'motif' && (
                    <div className="mt-3 space-y-4 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-300">
                          Selected: <span className="font-semibold text-white">{selectedMotifId}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMotifId(null);
                            setIsMotifsExpanded(false);
                          }}
                          className="text-gray-400 hover:text-white text-sm"
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
                          <label className="block text-sm font-medium text-gray-200">
                            Height: {activeOffset.heightMm ?? initHeight} <span className="text-gray-500">mm</span>
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
                            className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-200">
                            Rotation: {Math.round(((activeOffset.rotationZ ?? 0) * 180) / Math.PI)} <span className="text-gray-500">°</span>
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
                            className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
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
                                <span className="text-xs text-gray-200">Gold</span>
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
                                <span className="text-xs text-gray-200">Silver</span>
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
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
                    >
                      <ArrowPathIcon className="h-5 w-5 flex-shrink-0" />
                      <span>New Design</span>
                    </button>
                  )}
                </React.Fragment>
              );
            }
            
            // Special handling for Select Shape - show shape selector in sidebar when canvas is visible
            if (item.slug === 'select-shape') {
              return (
                <React.Fragment key={item.slug}>
                  {isCanvasVisible ? (
                    // Show shape selector in sidebar when canvas is visible, with click handler to navigate
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // Navigate to select-shape page to keep canvas visible and show shape selector
                          if (pathname !== '/select-shape') {
                            router.push('/select-shape');
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
                      
                      {isActive && !selectedMotifId && !selectedAdditionId && shapes.length > 0 && (
                        <div className="mt-3 space-y-4 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
                          <ShapeSelector shapes={shapes} />
                        </div>
                      )}
                    </>
                  ) : (
                    // Show link when canvas is not visible (first-time selection)
                    <Link
                      href={`/${item.slug}`}
                      data-section={item.slug}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
                        isActive 
                          ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                          : 'text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                  
                  {showNewDesignAfter && (
                    <button
                      key="new-design-shape"
                      onClick={handleNewDesign}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
                    >
                      <ArrowPathIcon className="h-5 w-5 flex-shrink-0" />
                      <span>New Design</span>
                    </button>
                  )}
                </React.Fragment>
              );
            }
            
            // Special handling for Select Material - show material selector in sidebar when canvas is visible
            if (item.slug === 'select-material') {
              return (
                <React.Fragment key={item.slug}>
                  {isCanvasVisible ? (
                    // Show material selector in sidebar when canvas is visible, with click handler to navigate
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
                        <div className="mt-3 space-y-4 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
                          <MaterialSelector materials={materials} />
                        </div>
                      )}
                    </>
                  ) : (
                    // Show link when canvas is not visible (first-time selection)
                    <Link
                      href={`/${item.slug}`}
                      data-section={item.slug}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
                        isActive 
                          ? 'text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm' 
                          : 'text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                  
                  {showNewDesignAfter && (
                    <button
                      key="new-design-material"
                      onClick={handleNewDesign}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
                    >
                      <ArrowPathIcon className="h-5 w-5 flex-shrink-0" />
                      <span>New Design</span>
                    </button>
                  )}
                </React.Fragment>
              );
            }
            
            // Determine if step should be disabled (steps 3-10 need a product selected)
            const needsProduct = index >= 2; // Steps from index 2 onwards (Select Material, Select Size, etc.)
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
                    className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-base font-light transition-all ${
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
                
                {showNewDesignAfter && (
                  <button
                    onClick={handleNewDesign}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-light transition-all text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
                  >
                    <ArrowPathIcon className="h-5 w-5 flex-shrink-0" />
                    <span>New Design</span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
              </div>
              
              {/* Group Divider (not after last group) */}
              {groupIndex < menuGroups.length - 1 && (
                <div className="mt-4 mb-2 border-t border-white/10" />
              )}
            </div>
          ))}
        </div>
          
        {/* Browse Designs CTA */}
        <Link
          href="/designs"
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-light transition-all mt-4 text-white bg-white/15 shadow-lg border border-white/30 backdrop-blur-sm hover:bg-white/20"
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
