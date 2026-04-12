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
  PhotoIcon,
  UserCircleIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculatePrice, computeQuantity } from '#/lib/xml-parser';
import { calculateMotifPrice } from '#/lib/motif-pricing';
import TailwindSlider from '#/ui/TailwindSlider';
import { data } from '#/app/_internal/_data';
import { loadEmblems } from '#/app/_internal/_emblems-loader';
import InscriptionEditPanel from './InscriptionEditPanel';
import SegmentedControl from './ui/SegmentedControl';
import MaterialSelector from './MaterialSelector';
import ShapeSelector from './ShapeSelector';
import BorderSelector from './BorderSelector';
import AdditionSelector from './AdditionSelector';
import MotifSelectorPanel from './MotifSelectorPanel';
import EmblemOverlayPanel from './EmblemOverlayPanel';
import EmblemSelectionGrid from '#/app/select-emblems/_ui/EmblemSelectionGrid';
import ImageSelector from './ImageSelector';
import SaveDesignModal from './SaveDesignModal';
import { formatDimensionPair } from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';

// Menu items grouped by workflow stage
const menuGroups = [
  {
    label: 'Setup',
    items: [
      { slug: 'select-product', name: 'Select Product', icon: CubeIcon },
      { slug: 'select-shape', name: 'Select Shape', icon: Squares2X2Icon },
      {
        slug: 'select-border',
        name: 'Select Border',
        icon: RectangleStackIcon,
        requiresBorder: true,
      },
      { slug: 'select-material', name: 'Select Material', icon: SwatchIcon },
      { slug: 'select-size', name: 'Select Size', icon: ArrowsPointingOutIcon },
    ],
  },
  {
    label: 'Design',
    items: [
      { slug: 'inscriptions', name: 'Inscriptions', icon: DocumentTextIcon },
      { slug: 'select-images', name: 'Add Your Image', icon: PhotoIcon },
      {
        slug: 'select-additions',
        name: 'Select Additions',
        icon: PlusCircleIcon,
        hiddenForPlaque: true,
      },
      {
        slug: 'select-emblems',
        name: 'Select Emblems',
        icon: ShieldCheckIcon,
        requiresPlaque: true,
      },
      { slug: 'select-motifs', name: 'Select Motifs', icon: SparklesIcon },
      { slug: 'check-price', name: 'Check Price', icon: CurrencyDollarIcon },
    ],
  },
  {
    label: 'Account',
    items: [
      { slug: 'my-account', name: 'My Account', icon: UserCircleIcon },
      { slug: 'save-design', name: 'Save Design', icon: CloudArrowUpIcon },
    ],
  },
];

// Flatten for compatibility with existing code
const menuItems = menuGroups.flatMap((group) => group.items);
const fullscreenPanelSlugs = new Set([
  'select-size',
  'select-shape',
  'select-material',
  'select-border',
  'inscriptions',
  'select-images',
  'select-additions',
  'select-emblems',
  'select-motifs',
]);

type PanelSource = 'menu' | 'canvas' | null;
type SetActivePanelFn = (panel: 'inscription' | 'addition' | 'motif' | null) => void;

function useDesignerNavPanelState({
  pathname,
  setActivePanel,
  selectedAdditionId,
  selectedMotifId,
  setSelectedAdditionId,
  setSelectedMotifId,
}: {
  pathname: string;
  setActivePanel: SetActivePanelFn;
  selectedAdditionId: string | null;
  selectedMotifId: string | null;
  setSelectedAdditionId: (id: string | null) => void;
  setSelectedMotifId: (id: string | null) => void;
}) {
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >({
    'select-size': false,
    'select-shape': false,
    'select-material': false,
    inscriptions: false,
    'select-additions': false,
    'select-motifs': false,
  });
  const [activeFullscreenPanel, setActiveFullscreenPanel] = React.useState<
    string | null
  >(null);
  const [dismissedPanelSlug, setDismissedPanelSlug] = React.useState<
    string | null
  >(null);
  const [panelSource, setPanelSource] = React.useState<PanelSource>(null);
  const [forceAdditionCatalog, setForceAdditionCatalog] = React.useState(false);
  const [forceMotifCatalog, setForceMotifCatalog] = React.useState(false);
  const activeFullscreenPanelRef = React.useRef<string | null>(null);
  activeFullscreenPanelRef.current = activeFullscreenPanel;

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
    return () =>
      window.removeEventListener('openFullscreenPanel', handleOpenPanel);
  }, []);

  const toggleSection = (slug: string) => {
    setExpandedSections((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const openFullscreenPanel = (slug: string) => {
    setDismissedPanelSlug(null);
    setPanelSource('menu');
    if (slug === 'inscriptions') {
      setActivePanel('inscription');
    }
    setActiveFullscreenPanel(slug);
  };

  const closeFullscreenPanel = React.useCallback(() => {
    const currentSlug = pathname.replace('/', '') || null;
    if (activeFullscreenPanel) {
      if (
        activeFullscreenPanel === 'inscriptions' ||
        activeFullscreenPanel === 'select-additions' ||
        activeFullscreenPanel === 'select-motifs' ||
        activeFullscreenPanel === 'select-images'
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
  }, [activeFullscreenPanel, pathname, setActivePanel]);

  const handleBackToAdditionList = React.useCallback(() => {
    setForceAdditionCatalog(true);
    setSelectedAdditionId(null);
    setActivePanel('addition');
  }, [setSelectedAdditionId, setActivePanel]);

  const handleBackToMotifList = React.useCallback(() => {
    setForceMotifCatalog(true);
    setSelectedMotifId(null);
    setActivePanel('motif');
  }, [setSelectedMotifId, setActivePanel]);

  const closePanelHandlerRef = React.useRef(closeFullscreenPanel);
  closePanelHandlerRef.current = closeFullscreenPanel;

  useEffect(() => {
    const handleClosePanel = () => {
      closePanelHandlerRef.current();
    };
    window.addEventListener('closeFullscreenPanel', handleClosePanel);
    return () =>
      window.removeEventListener('closeFullscreenPanel', handleClosePanel);
  }, []);

  useEffect(() => {
    const activeSection = pathname.replace('/', '');
    if (activeSection && expandedSections.hasOwnProperty(activeSection)) {
      setExpandedSections((prev) => ({
        ...Object.keys(prev).reduce(
          (acc, key) => ({ ...acc, [key]: key === activeSection }),
          {} as Record<string, boolean>,
        ),
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

  return {
    expandedSections,
    setExpandedSections,
    activeFullscreenPanel,
    setActiveFullscreenPanel,
    dismissedPanelSlug,
    setDismissedPanelSlug,
    panelSource,
    setPanelSource,
    forceAdditionCatalog,
    setForceAdditionCatalog,
    forceMotifCatalog,
    setForceMotifCatalog,
    toggleSection,
    openFullscreenPanel,
    closeFullscreenPanel,
    handleBackToAdditionList,
    handleBackToMotifList,
  };
}

export default function DesignerNav() {
  const unitSystem = useUnitSystem();
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
  const ledgerWidthMm = useHeadstoneStore((s) => s.ledgerWidthMm);
  const setLedgerWidthMm = useHeadstoneStore((s) => s.setLedgerWidthMm);
  const ledgerHeightMm = useHeadstoneStore((s) => s.ledgerHeightMm);
  const setLedgerHeightMm = useHeadstoneStore((s) => s.setLedgerHeightMm);
  const ledgerDepthMm = useHeadstoneStore((s) => s.ledgerDepthMm);
  const setLedgerDepthMm = useHeadstoneStore((s) => s.setLedgerDepthMm);
  const kerbWidthMm = useHeadstoneStore((s) => s.kerbWidthMm);
  const setKerbWidthMm = useHeadstoneStore((s) => s.setKerbWidthMm);
  const kerbHeightMm = useHeadstoneStore((s) => s.kerbHeightMm);
  const setKerbHeightMm = useHeadstoneStore((s) => s.setKerbHeightMm);
  const kerbDepthMm = useHeadstoneStore((s) => s.kerbDepthMm);
  const setKerbDepthMm = useHeadstoneStore((s) => s.setKerbDepthMm);
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
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);
  const selectedImages = useHeadstoneStore((s) => s.selectedImages);
  const selectedImageId = useHeadstoneStore((s) => s.selectedImageId);
  const setSelectedImageId = useHeadstoneStore((s) => s.setSelectedImageId);
  const selectedEmblems = useHeadstoneStore((s) => s.selectedEmblems);
  const selectedEmblemId = useHeadstoneStore((s) => s.selectedEmblemId);
  const resetDesign = useHeadstoneStore((s) => s.resetDesign);
  const editingObject = useHeadstoneStore((s) => s.editingObject);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const selected = useHeadstoneStore((s) => s.selected);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const setShowBase = useHeadstoneStore((s) => s.setShowBase);
  const selectedInscriptionId = useHeadstoneStore(
    (s) => s.selectedInscriptionId,
  );
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const setSelectedAdditionId = useHeadstoneStore(
    (s) => s.setSelectedAdditionId,
  );
  const setProductId = useHeadstoneStore((s) => s.setProductId);

  // Check if anything has been added to the headstone
  const hasCustomizations =
    inscriptions.length > 0 ||
    selectedAdditions.length > 0 ||
    selectedMotifs.length > 0 ||
    selectedEmblems.length > 0;

  const {
    expandedSections,
    setExpandedSections,
    activeFullscreenPanel,
    setActiveFullscreenPanel,
    dismissedPanelSlug,
    setDismissedPanelSlug,
    panelSource,
    setPanelSource,
    forceAdditionCatalog,
    forceMotifCatalog,
    openFullscreenPanel,
    closeFullscreenPanel,
    handleBackToAdditionList,
    handleBackToMotifList,
    toggleSection,
  } = useDesignerNavPanelState({
    pathname,
    setActivePanel,
    selectedAdditionId,
    selectedMotifId,
    setSelectedAdditionId,
    setSelectedMotifId,
  });
  const [showConvertPanel, setShowConvertPanel] = React.useState(false);

  const handleBackToMenu = React.useCallback(() => {
    closeFullscreenPanel();
    router.push('/design-menu');
  }, [closeFullscreenPanel, router]);
  const [showSaveDesignModal, setShowSaveDesignModal] = React.useState(false);
  const [isSavingDesign, setIsSavingDesign] = React.useState(false);

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
  const [isLoadingPanel, setIsLoadingPanel] = React.useState(false);

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
  const shapes = useHeadstoneStore((s) => s.shapes);
  const borders = useHeadstoneStore((s) => s.borders);
  const motifCatalog = useHeadstoneStore((s) => s.motifsCatalog);
  const products = React.useMemo(() => {
    return data.products || [];
  }, []);
  const additionsList = React.useMemo(() => {
    return data.additions || [];
  }, []);

  // Show Select Size panel when on select-size page
  const isSelectSizePage = pathname === '/select-size';
  const isSelectAdditionsPage = pathname === '/select-additions';

  // Determine if canvas is visible (on pages with 3D scene)
  const canvasVisiblePages = [
    '/select-size',
    '/inscriptions',
    '/select-motifs',
    '/select-material',
    '/select-border',
    '/select-additions',
    '/select-images',
    '/select-emblems',
    '/design-menu',
  ];
  const isCanvasVisible = canvasVisiblePages.some((page) => pathname === page);
  const shouldShowFullscreenPanel = Boolean(activeFullscreenPanel);

  const hasActiveAdditionForPanel =
    !!selectedAdditionId &&
    !!additionOffsets[selectedAdditionId] &&
    activePanel === 'addition';

  const isAdditionCatalogVisible =
    activeFullscreenPanel === 'select-additions' &&
    (forceAdditionCatalog ||
      panelSource === 'menu' ||
      (panelSource === null && isSelectAdditionsPage)) &&
    !hasActiveAdditionForPanel;

  const isMotifCatalogVisible =
    activeFullscreenPanel === 'select-motifs' &&
    (forceMotifCatalog || !selectedMotifId);

  const shouldShowBackToListButton =
    (activeFullscreenPanel === 'select-additions' &&
      !isAdditionCatalogVisible) ||
    (activeFullscreenPanel === 'select-motifs' && !isMotifCatalogVisible);

  // Add loading state when pathname changes
  useEffect(() => {
    setIsLoadingPanel(true);
    const timer = setTimeout(() => {
      setIsLoadingPanel(false);
    }, 300); // Show loader for minimum 300ms

    return () => clearTimeout(timer);
  }, [pathname, activeFullscreenPanel]);

  // Close fullscreen panel if user navigates away from its route or when canvas is hidden
  useEffect(() => {
    if (!isCanvasVisible) {
      if (activeFullscreenPanel) {
        if (
          activeFullscreenPanel === 'inscriptions' ||
          activeFullscreenPanel === 'select-additions' ||
          activeFullscreenPanel === 'select-motifs' ||
          activeFullscreenPanel === 'select-images'
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

    if (
      activeFullscreenPanel === 'select-shape' &&
      pathname !== '/select-shape'
    ) {
      return;
    }

    const currentSlug = pathname.replace('/', '');
    if (fullscreenPanelSlugs.has(currentSlug)) {
      if (
        activeFullscreenPanel !== currentSlug &&
        dismissedPanelSlug !== currentSlug
      ) {
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
          activeFullscreenPanel === 'select-motifs' ||
          activeFullscreenPanel === 'select-images'
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
    if (
      pathname === '/select-border' &&
      isPlaque &&
      dismissedPanelSlug !== 'select-border'
    ) {
      if (activeFullscreenPanel !== 'select-border') {
        setDismissedPanelSlug(null);
        setPanelSource('menu');
        setActiveFullscreenPanel('select-border');
      }
    }
  }, [
    pathname,
    isPlaque,
    activeFullscreenPanel,
    dismissedPanelSlug,
    setDismissedPanelSlug,
    setPanelSource,
    setActiveFullscreenPanel,
  ]);

  const renderSelectAdditionsPanel = () => {
    const activeAdditionOffset = selectedAdditionId
      ? additionOffsets[selectedAdditionId] || {
          xPos: 0,
          yPos: 0,
          scale: 1,
          rotationZ: 0,
        }
      : null;
    const hasActiveAddition =
      !!selectedAdditionId &&
      !!activeAdditionOffset &&
      activePanel === 'addition';

    // Find the addition type to determine if rotation should be enabled
    // Extract base ID from instance ID (e.g., "K0096_177030562074Z" -> "K0096")
    const baseAdditionId = selectedAdditionId?.split('_')[0];
    const activeAddition = baseAdditionId
      ? additionsList.find((a) => a.id === baseAdditionId)
      : null;
    const additionSizes = activeAddition?.sizes ?? [];
    const maxSize = additionSizes.length;
    const selectedSizeVariant = Math.max(
      1,
      Math.min(
        maxSize || 1,
        Math.round(activeAdditionOffset?.sizeVariant ?? 1),
      ),
    );
    const activeAdditionSize =
      additionSizes[selectedSizeVariant - 1] ?? additionSizes[0] ?? null;
    const isStatueOrVase =
      activeAddition?.type === 'statue' || activeAddition?.type === 'vase';

    const additionRotation =
      ((activeAdditionOffset?.rotationZ ?? 0) * 180) / Math.PI;
    const showAdditionCatalog =
      forceAdditionCatalog ||
      panelSource === 'menu' ||
      (panelSource === null && isSelectAdditionsPage);

    return (
      <div className="flex h-full flex-col gap-4">
        {hasActiveAddition ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="mb-1 text-xs tracking-[0.2em] text-white/60 uppercase">
                Addition Price
              </div>
              <div className="text-2xl font-semibold text-white">
                {activeAdditionSize?.retailPrice
                  ? `$${activeAdditionSize.retailPrice.toFixed(2)}`
                  : 'N/A'}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                className="flex-1 cursor-pointer rounded-lg bg-[#D7B356] px-3 py-2 text-sm font-medium text-slate-900 hover:bg-[#E4C778] transition-colors shadow-md"
                onClick={() =>
                  selectedAdditionId && duplicateAddition(selectedAdditionId)
                }
              >
                Duplicate
              </button>
              <button
                type="button"
                className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-md"
                onClick={() => {
                  if (selectedAdditionId) {
                    removeAddition(selectedAdditionId);
                    setSelectedAdditionId(null);
                  }
                }}
              >
                Delete
              </button>
            </div>

            <div className="space-y-4">
              {maxSize <= 1 ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium text-gray-200">
                      Size
                    </label>
                    <div className="text-sm text-gray-400">
                      {activeAdditionSize
                        ? `${activeAdditionSize.width}×${activeAdditionSize.height}mm`
                        : ''}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <label className="w-20 text-sm font-medium text-gray-200">
                      Size
                    </label>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedAdditionId || !activeAdditionOffset)
                            return;
                          const newVal = Math.max(1, selectedSizeVariant - 1);
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            sizeVariant: newVal,
                          });
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                        aria-label="Decrease size variant"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={maxSize}
                        step={1}
                        value={selectedSizeVariant}
                        onChange={(e) => {
                          if (!selectedAdditionId || !activeAdditionOffset)
                            return;
                          const val = parseInt(e.target.value, 10);
                          if (!Number.isNaN(val)) {
                            setAdditionOffset(selectedAdditionId, {
                              ...activeAdditionOffset,
                              sizeVariant: val,
                            });
                          }
                        }}
                        onBlur={(e) => {
                          if (!selectedAdditionId || !activeAdditionOffset)
                            return;
                          const val = parseInt(e.target.value, 10);
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            sizeVariant:
                              Number.isNaN(val) || val < 1
                                ? 1
                                : Math.min(maxSize, val),
                          });
                        }}
                        className="w-16 rounded border border-[#5A5A5A] bg-[#454545] px-2 py-1.5 text-right text-sm text-white transition-colors focus:border-[#D7B356] focus:ring-2 focus:ring-[#D7B356]/30 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedAdditionId || !activeAdditionOffset)
                            return;
                          const newVal = Math.min(
                            maxSize,
                            selectedSizeVariant + 1,
                          );
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            sizeVariant: newVal,
                          });
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                        aria-label="Increase size variant"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min={1}
                      max={maxSize}
                      step={1}
                      value={selectedSizeVariant}
                      onChange={(e) => {
                        if (!selectedAdditionId || !activeAdditionOffset)
                          return;
                        setAdditionOffset(selectedAdditionId, {
                          ...activeAdditionOffset,
                          sizeVariant: parseInt(e.target.value, 10),
                        });
                      }}
                      className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)]"
                    />
                    <div className="mt-0.5 flex w-full justify-between text-xs text-gray-500">
                      <span>
                        {additionSizes[0]
                          ? `${additionSizes[0].width}×${additionSizes[0].height}mm`
                          : 'Size 1'}
                      </span>
                      <span>
                        {additionSizes[maxSize - 1]
                          ? `${additionSizes[maxSize - 1].width}×${additionSizes[maxSize - 1].height}mm`
                          : `Size ${maxSize}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rotation Slider - Only shown for applications, not for statues/vases */}
              {!isStatueOrVase && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <label className="w-20 text-sm font-medium text-gray-200">
                      Rotation
                    </label>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedAdditionId || !activeAdditionOffset)
                            return;
                          const newVal = Math.max(-180, additionRotation - 1);
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            rotationZ: (newVal * Math.PI) / 180,
                          });
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                        aria-label="Decrease rotation by 1 degree"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <input
                        type="number"
                        min={-180}
                        max={180}
                        step={1}
                        value={Math.round(additionRotation)}
                        onChange={(e) => {
                          if (!selectedAdditionId || !activeAdditionOffset)
                            return;
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            rotationZ: (Number(e.target.value) * Math.PI) / 180,
                          });
                        }}
                        onBlur={(e) => {
                          if (!selectedAdditionId || !activeAdditionOffset)
                            return;
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
                        className="w-16 rounded border border-[#5A5A5A] bg-[#454545] px-2 py-1.5 text-right text-sm text-white transition-colors focus:border-[#D7B356] focus:ring-2 focus:ring-[#D7B356]/30 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedAdditionId || !activeAdditionOffset)
                            return;
                          const newVal = Math.min(180, additionRotation + 1);
                          setAdditionOffset(selectedAdditionId, {
                            ...activeAdditionOffset,
                            rotationZ: (newVal * Math.PI) / 180,
                          });
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                        aria-label="Increase rotation by 1 degree"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                      <span className="text-sm font-medium text-gray-300">
                        °
                      </span>
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
                      className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)]"
                    />
                    <div className="mt-0.5 flex w-full justify-between text-xs text-gray-500">
                      <span>-180°</span>
                      <span>180°</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {showAdditionCatalog && !hasActiveAddition && (
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
      ? motifOffsets[selectedMotifId] || {
          xPos: 0,
          yPos: 0,
          scale: 1,
          rotationZ: 0,
          heightMm: 100,
        }
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

    const hasActiveMotif =
      !!selectedMotifId &&
      !!activeOffset &&
      !!activeMotif &&
      activePanel === 'motif';
    const rotationDegrees = ((activeOffset?.rotationZ ?? 0) * 180) / Math.PI;
    const motifPriceValue =
      hasActiveMotif && motifPriceModel && !isLaser
        ? calculateMotifPrice(
            activeOffset?.heightMm ?? initHeight,
            activeMotif?.color ?? '#c99d44',
            motifPriceModel.priceModel,
            isLaser,
          )
        : null;
    const clampHeight = (value: number) =>
      Math.min(maxHeight, Math.max(minHeight, value));
    const showMotifCatalog =
      activeFullscreenPanel === 'select-motifs' &&
      (forceMotifCatalog || !hasActiveMotif);

    return (
      <div className="flex h-full flex-col gap-4">
        {hasActiveMotif ? (
          <div className="space-y-4">
            {motifPriceValue !== null && (
              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <div className="mb-1 text-xs tracking-[0.2em] text-white/60 uppercase">
                  Motif Price
                </div>
                <div className="text-2xl font-semibold text-white">
                  ${motifPriceValue.toFixed(2)}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                type="button"
                className="flex-1 cursor-pointer rounded-lg bg-[#D7B356] px-3 py-2 text-sm font-medium text-slate-900 hover:bg-[#E4C778] transition-colors shadow-md"
                onClick={() =>
                  selectedMotifId && duplicateMotif(selectedMotifId)
                }
              >
                Duplicate
              </button>
              <button
                type="button"
                className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-md"
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
                  <label className="w-20 text-sm font-medium text-gray-200">
                    Height
                  </label>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedMotifId) return;
                        const newVal = clampHeight(
                          (activeOffset.heightMm ?? initHeight) - 1,
                        );
                        setMotifOffset(selectedMotifId, {
                          ...activeOffset,
                          heightMm: newVal,
                        });
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                      aria-label="Decrease height by 1mm"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
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
                        const clampedValue = clampHeight(
                          Number(e.target.value),
                        );
                        setMotifOffset(selectedMotifId, {
                          ...activeOffset,
                          heightMm: clampedValue,
                        });
                      }}
                      onBlur={(e) => {
                        if (!selectedMotifId) return;
                        const clampedValue = clampHeight(
                          Number(e.target.value),
                        );
                        setMotifOffset(selectedMotifId, {
                          ...activeOffset,
                          heightMm: clampedValue,
                        });
                      }}
                      className={`w-16 rounded border bg-[#454545] px-2 py-1.5 text-right text-sm text-white transition-colors focus:ring-2 focus:outline-none ${
                        (activeOffset.heightMm ?? initHeight) < minHeight ||
                        (activeOffset.heightMm ?? initHeight) > maxHeight
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                          : 'border-[#5A5A5A] focus:border-[#D7B356] focus:ring-[#D7B356]/30'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedMotifId) return;
                        const newVal = clampHeight(
                          (activeOffset.heightMm ?? initHeight) + 1,
                        );
                        setMotifOffset(selectedMotifId, {
                          ...activeOffset,
                          heightMm: newVal,
                        });
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                      aria-label="Increase height by 1mm"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                    <span className="text-sm font-medium text-gray-300">
                      mm
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={minHeight}
                    max={maxHeight}
                    step={1}
                    value={activeOffset.heightMm ?? initHeight}
                    onChange={(e) => {
                      if (!selectedMotifId) return;
                      const clampedValue = clampHeight(Number(e.target.value));
                      setMotifOffset(selectedMotifId, {
                        ...activeOffset,
                        heightMm: clampedValue,
                      });
                    }}
                    className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)]"
                  />
                  <div className="mt-0.5 flex w-full justify-between text-xs text-gray-500">
                    <span>{minHeight}mm</span>
                    <span>{maxHeight}mm</span>
                  </div>
                </div>
              </div>

              {/* Rotation Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <label className="w-20 text-sm font-medium text-gray-200">
                    Rotation
                  </label>
                  <div className="flex items-center justify-end gap-2">
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
                      className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                      aria-label="Decrease rotation by 1 degree"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
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
                      className={`w-16 rounded border bg-[#454545] px-2 py-1.5 text-right text-sm text-white transition-colors focus:ring-2 focus:outline-none ${
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
                      className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                      aria-label="Increase rotation by 1 degree"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
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
                    className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)]"
                  />
                  <div className="mt-0.5 flex w-full justify-between text-xs text-gray-500">
                    <span>-180°</span>
                    <span>180°</span>
                  </div>
                </div>
              </div>

              {!isLaser && catalog?.product?.color !== '0' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Select Color
                  </label>
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        selectedMotifId &&
                        setMotifColor(selectedMotifId, '#c99d44')
                      }
                      className="flex flex-col items-center gap-1 rounded-lg border border-white/15 p-2 transition-colors hover:bg-white/5"
                    >
                      <span
                        className="h-5 w-5 rounded border border-white/20"
                        style={{ backgroundColor: '#c99d44' }}
                      />
                      <span className="text-xs text-white/80">
                        Gold Gilding
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        selectedMotifId &&
                        setMotifColor(selectedMotifId, '#eeeeee')
                      }
                      className="flex flex-col items-center gap-1 rounded-lg border border-white/15 p-2 transition-colors hover:bg-white/5"
                    >
                      <span
                        className="h-5 w-5 rounded border border-white/20"
                        style={{ backgroundColor: '#eeeeee' }}
                      />
                      <span className="text-xs text-white/80">
                        Silver Gilding
                      </span>
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {data.colors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        className={`h-6 w-6 rounded border ${activeMotif?.color === color.hex ? 'border-[#D7B356] ring-2 ring-[#D7B356]' : 'border-white/20'}`}
                        style={{ backgroundColor: color.hex }}
                        onClick={() =>
                          selectedMotifId &&
                          setMotifColor(selectedMotifId, color.hex)
                        }
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
            <MotifSelectorPanel motifs={motifCatalog} />
          </div>
        )}
      </div>
    );
  };

  const renderSelectImagesPanel = () => {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <ImageSelector />
        </div>
      </div>
    );
  };

  const renderSelectEmblemsPanel = () => {
    const emblems = loadEmblems();
    return (
      <div className="flex h-full flex-col">
        {/* Emblem edit panel when an emblem is selected */}
        {activePanel === 'emblem' && selectedEmblemId && (
          <div className="mb-4 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
            <EmblemOverlayPanel />
          </div>
        )}
        {/* Emblem catalog grid */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 shadow-xl backdrop-blur-sm">
          <EmblemSelectionGrid emblems={emblems} />
        </div>
      </div>
    );
  };

  // Sync canvas selection with editingObject on select-size page
  useEffect(() => {
    const partValue: 'headstone' | 'base' | 'ledger' | 'kerbset' =
      editingObject === 'base'
        ? 'base'
        : editingObject === 'ledger'
          ? 'ledger'
          : editingObject === 'kerbset'
            ? 'kerbset'
            : 'headstone';
    // Don't override when user is actively editing a content item on the canvas
    if (
      selectedImageId ||
      selectedMotifId ||
      selectedAdditionId ||
      selectedInscriptionId
    )
      return;
    if (isSelectSizePage && selected !== partValue) {
      setSelected(partValue);
    }
  }, [
    isSelectSizePage,
    editingObject,
    selected,
    setSelected,
    selectedImageId,
    selectedMotifId,
    selectedAdditionId,
    selectedInscriptionId,
  ]);

  // Auto-open image panel when an image is selected and activePanel is 'image'
  useEffect(() => {
    if (
      selectedImageId &&
      activePanel === 'image' &&
      activeFullscreenPanel !== 'select-images'
    ) {
      setActiveFullscreenPanel('select-images');
    }
  }, [selectedImageId, activePanel, activeFullscreenPanel]);

  let quantity = widthMm * heightMm;
  if (catalog) {
    quantity = computeQuantity(catalog.product.priceModel, { width: widthMm, height: heightMm, depth: uprightThickness });
  }

  let baseQuantity = 0;
  if (showBase && catalog?.product?.basePriceModel) {
    baseQuantity = computeQuantity(catalog.product.basePriceModel, { width: baseWidthMm, height: baseHeightMm, depth: baseThickness });
  }

  const headstonePrice = catalog
    ? calculatePrice(catalog.product.priceModel, quantity)
    : 0;
  const basePrice =
    showBase && catalog?.product?.basePriceModel
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
    return (
      data.products.find((p) => p.id === productId)?.name ??
      'Design Your Own Headstone'
    );
  }, [catalog, productId]);
  const dimensionLabel =
    widthMm > 0 && heightMm > 0
      ? formatDimensionPair(widthMm, heightMm, unitSystem)
      : 'Select dimensions';

  const handleMenuClick = async (slug: string, e: React.MouseEvent) => {
    if (fullscreenPanelSlugs.has(slug)) {
      e.preventDefault();
      const keepCanvasVisibleForShape =
        slug === 'select-shape' && isCanvasVisible;
      if (!keepCanvasVisibleForShape && pathname !== `/${slug}`) {
        // Navigate first — the route-sync useEffect will open the panel
        // once the page is on a canvas-visible route. Opening it here
        // would cause a bounce: the effect clears it (old route isn't
        // canvas-visible) then re-opens it after the route settles.
        router.push(`/${slug}`);
      } else {
        openFullscreenPanel(slug);
      }
      return;
    }

    if (slug === 'check-price') {
      e.preventDefault();
      router.push('/check-price');
    }

    if (slug === 'save-design') {
      e.preventDefault();
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        router.push('/my-account');
        return;
      }
      setShowSaveDesignModal(true);
    }
  };

  const handleSaveDesign = async (designName: string) => {
    setIsSavingDesign(true);
    try {
      // Capture screenshot from the 3D canvas
      let screenshotDataUrl: string | null = null;
      try {
        screenshotDataUrl = captureBestCanvasScreenshot();
      } catch (error) {
        console.warn('Failed to capture canvas screenshot:', error);
      }

      // Get all state from store
      const state = useHeadstoneStore.getState();

      // Calculate current price
      const headstonePrice = catalog
        ? calculatePrice(catalog.product.priceModel, quantity)
        : 0;
      const basePrice =
        state.showBase && catalog?.product?.basePriceModel
          ? calculatePrice(catalog.product.basePriceModel, baseQuantity)
          : 0;

      // Calculate addition prices from size variant data
      let additionsPrice = 0;
      if (state.selectedAdditions && state.selectedAdditions.length > 0) {
        additionsPrice = state.selectedAdditions.reduce((total, addId) => {
          const offset = state.additionOffsets?.[addId];
          const baseId = addId.split('_')[0];
          const addition = (data.additions || []).find((a) => a.id === baseId);
          if (addition?.sizes?.length) {
            const variant = Math.max(1, Math.min(addition.sizes.length, Math.round(offset?.sizeVariant ?? 1)));
            const sizeData = addition.sizes[variant - 1] ?? addition.sizes[0];
            return total + (sizeData?.retailPrice ?? 0);
          }
          return total;
        }, 0);
      }

      // Calculate motif prices (same pricing model used by Check Price)
      let motifsPrice = 0;
      if (state.selectedMotifs && state.selectedMotifs.length > 0) {
        const isLaser = catalog?.product.laser === '1';
        motifsPrice = state.selectedMotifs.reduce((total, motif) => {
          const offset = state.motifOffsets?.[motif.id];
          const heightMm = offset?.heightMm ?? 100;
          if (!isLaser && motifPriceModel) {
            return total + calculateMotifPrice(
              heightMm,
              motif.color,
              motifPriceModel.priceModel,
              isLaser,
            );
          }
          return total;
        }, 0);
      }

      // Calculate emblem prices ($109 flat per emblem from emblems.xml)
      const emblemsPrice = (state.selectedEmblems?.length ?? 0) * 109;

      // Calculate inscription prices from price model
      const validInscriptions = (state.inscriptions || []).filter((line) =>
        line.text?.trim(),
      );
      let inscriptionPrice = 0;
      if (state.inscriptionPriceModel && validInscriptions.length > 0) {
        inscriptionPrice = validInscriptions.reduce((total, line) => {
          const qty = line.sizeMm;
          const colorName = data.colors.find((c: { hex: string; name: string }) => c.hex === line.color)?.name;
          let mappedNote = colorName;
          if (colorName && !['Gold Gilding', 'Silver Gilding'].includes(colorName)) {
            mappedNote = 'Paint Fill';
          }
          const tier = state.inscriptionPriceModel!.prices.find(
            (p) => qty >= p.startQuantity && qty <= p.endQuantity && p.note === mappedNote,
          ) ?? state.inscriptionPriceModel!.prices.find(
            (p) => qty >= p.startQuantity && qty <= p.endQuantity,
          );
          if (!tier) return total;
          const price = calculatePrice({ ...state.inscriptionPriceModel!, prices: [tier] }, qty);
          return total + price;
        }, 0);
      }
      const imagePrice = 0; // Image pricing is computed on Check Price save path
      const subtotal =
        headstonePrice +
        basePrice +
        additionsPrice +
        motifsPrice +
        emblemsPrice +
        inscriptionPrice +
        imagePrice;
      const tax = subtotal * 0.1;
      const totalPrice = subtotal + tax;
      const totalPriceCents = Math.round(totalPrice * 100);
      const pricingBreakdown = {
        headstonePrice,
        basePrice,
        additionsPrice,
        motifsPrice,
        emblemsPrice,
        inscriptionPrice,
        imagePrice,
        subtotal,
        tax,
        total: totalPrice,
      };

      // Prepare design state matching DesignerSnapshot schema
      const designState = {
        version: 1,
        productId: state.productId,
        shapeUrl: state.shapeUrl,
        materialUrl: state.materialUrl,
        headstoneMaterialUrl: state.headstoneMaterialUrl,
        baseMaterialUrl: state.baseMaterialUrl,
        ledgerMaterialUrl: state.ledgerMaterialUrl,
        kerbsetMaterialUrl: state.kerbsetMaterialUrl,
        widthMm: state.widthMm,
        heightMm: state.heightMm,
        uprightThickness: state.uprightThickness,
        slantThickness: state.slantThickness,
        headstoneStyle: state.headstoneStyle,
        baseFinish: state.baseFinish,
        baseWidthMm: state.baseWidthMm,
        baseHeightMm: state.baseHeightMm,
        baseThickness: state.baseThickness,
        borderName: state.borderName,
        showInsetContour: state.showInsetContour,
        showBase: state.showBase,
        inscriptions: state.inscriptions.map((insc) => ({
          id: insc.id,
          text: insc.text,
          font: insc.font,
          sizeMm: insc.sizeMm,
          color: insc.color,
          xPos: insc.xPos,
          yPos: insc.yPos,
          rotationDeg: insc.rotationDeg,
          target: insc.target,
          baseWidthMm: insc.baseWidthMm,
          baseHeightMm: insc.baseHeightMm,
        })),
        selectedMotifs: state.selectedMotifs.map((motif) => ({
          id: motif.id,
          svgPath: motif.svgPath,
          color: motif.color,
        })),
        motifOffsets: state.motifOffsets,
        selectedEmblems: (state.selectedEmblems || []).map((emb) => ({
          id: emb.id,
          emblemId: emb.emblemId,
          imageUrl: emb.imageUrl,
        })),
        emblemOffsets: state.emblemOffsets || {},
        selectedAdditions: state.selectedAdditions,
        additionOffsets: state.additionOffsets,
        selectedImages: state.selectedImages,
        metadata: {
          currentProjectId: state.currentProjectId,
          currentProjectTitle: state.currentProjectTitle,
          screenshot: screenshotDataUrl,
        },
      };

      // Use the existing projects API endpoint
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: designName,
          designState,
          status: 'draft',
          totalPriceCents,
          currency: 'AUD',
          pricingBreakdown,
        }),
      });

      const rawResponse = await response.text();
      let result: Record<string, unknown> = {};
      try {
        result = rawResponse ? (JSON.parse(rawResponse) as Record<string, unknown>) : {};
      } catch {
        const compact = rawResponse
          ? rawResponse.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180)
          : '';
        result = {
          message: compact
            ? `Save API returned ${response.status}: ${compact}`
            : `Unexpected ${response.status} response from save API`,
        };
      }

      if (!response.ok) {
        console.error('Save design failed:', {
          status: response.status,
          statusText: response.statusText,
          result,
        });
        const message =
          typeof result.message === 'string' ? result.message : 'Failed to save design';
        throw new Error(message);
      }

      console.log('Design saved successfully:', result);

      // Success - close modal and redirect to My Account
      setShowSaveDesignModal(false);

      // Redirect to My Account
      router.push('/my-account');
    } catch (error) {
      console.error('Error saving design:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    } finally {
      setIsSavingDesign(false);
    }
  };

  const handleNewDesign = (e: React.MouseEvent) => {
    e.preventDefault();
    if (
      confirm(
        'Are you sure you want to start a new design? This will remove all inscriptions, additions, and motifs.',
      )
    ) {
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
  const getItemStatus = (
    slug: string,
  ): 'incomplete' | 'complete' | 'available' => {
    const productId = useHeadstoneStore.getState().productId;
    const shapeUrl = useHeadstoneStore.getState().shapeUrl;
    const materialUrl = useHeadstoneStore.getState().materialUrl;

    if (slug === 'select-product') return productId ? 'complete' : 'incomplete';
    if (slug === 'select-shape') return shapeUrl ? 'complete' : 'incomplete';
    if (slug === 'select-material')
      return materialUrl ? 'complete' : 'incomplete';
    if (slug === 'select-size' && widthMm > 0 && heightMm > 0)
      return 'complete';
    if (slug === 'inscriptions' && inscriptions.length > 0) return 'complete';
    if (slug === 'select-additions' && selectedAdditions.length > 0)
      return 'complete';
    if (slug === 'select-motifs' && selectedMotifs.length > 0)
      return 'complete';
    if (slug === 'select-emblems' && selectedEmblems.length > 0)
      return 'complete';
    return 'available';
  };

  // Helper function to get count badge for sections with items
  const getItemCount = (slug: string): number | null => {
    if (slug === 'inscriptions') return inscriptions.length || null;
    if (slug === 'select-additions') return selectedAdditions.length || null;
    if (slug === 'select-motifs') return selectedMotifs.length || null;
    if (slug === 'select-emblems') return selectedEmblems.length || null;
    return null;
  };

  // Render Select Size panel content
  const renderSelectSizePanel = (extraClassName = '') => {
    const firstShape = catalog?.product?.shapes?.[0];
    const isFullMonument = catalog?.product?.type === 'full-monument';

    const currentWidthMm =
      editingObject === 'base'
        ? baseWidthMm
        : editingObject === 'ledger'
          ? ledgerWidthMm
          : editingObject === 'kerbset'
            ? kerbWidthMm
            : widthMm;
    const currentHeightMm =
      editingObject === 'base'
        ? baseHeightMm
        : editingObject === 'ledger'
          ? ledgerHeightMm
          : editingObject === 'kerbset'
            ? kerbHeightMm
            : heightMm;
    const setCurrentWidthMm =
      editingObject === 'base'
        ? setBaseWidthMm
        : editingObject === 'ledger'
          ? setLedgerWidthMm
          : editingObject === 'kerbset'
            ? setKerbWidthMm
            : setWidthMm;
    const setCurrentHeightMm =
      editingObject === 'base'
        ? setBaseHeightMm
        : editingObject === 'ledger'
          ? setLedgerHeightMm
          : editingObject === 'kerbset'
            ? setKerbHeightMm
            : setHeightMm;

    const minWidth =
      editingObject === 'base'
        ? widthMm
        : editingObject === 'ledger' || editingObject === 'kerbset'
          ? 300
          : (firstShape?.table?.minWidth ?? 40);
    const maxWidth =
      editingObject === 'base'
        ? 2000
        : editingObject === 'ledger' || editingObject === 'kerbset'
          ? 2000
          : (firstShape?.table?.maxWidth ?? 1200);
    const minHeight =
      editingObject === 'base'
        ? 50
        : editingObject === 'ledger'
          ? 30
          : editingObject === 'kerbset'
            ? 100
            : (firstShape?.table?.minHeight ?? 40);
    const maxHeight =
      editingObject === 'base'
        ? 200
        : editingObject === 'ledger'
          ? 150
          : editingObject === 'kerbset'
            ? 500
            : (firstShape?.table?.maxHeight ?? 1200);

    const minThickness =
      editingObject === 'base'
        ? (firstShape?.stand?.minDepth ?? 100)
        : editingObject === 'ledger'
          ? 400
          : editingObject === 'kerbset'
            ? 500
          : (firstShape?.table?.minDepth ?? 100);
    const maxThickness =
      editingObject === 'base'
        ? (firstShape?.stand?.maxDepth ?? 300)
        : editingObject === 'ledger'
          ? 2900
          : editingObject === 'kerbset'
            ? 3000
          : (firstShape?.table?.maxDepth ?? 300);

    const currentDepthMm =
      editingObject === 'ledger'
        ? ledgerDepthMm
        : editingObject === 'kerbset'
          ? kerbDepthMm
          : null;
    const setCurrentDepthMm =
      editingObject === 'ledger'
        ? setLedgerDepthMm
        : editingObject === 'kerbset'
          ? setKerbDepthMm
          : null;

    const sizeTabOptions = isFullMonument
      ? [
          { label: 'Headstone', value: 'headstone' },
          { label: 'Base', value: 'base' },
          { label: 'Ledger', value: 'ledger' },
          { label: 'Kerbset', value: 'kerbset' },
        ]
      : [
          { label: 'Headstone', value: 'headstone' },
          { label: 'Base', value: 'base' },
        ];

    return (
      <div
        className={`fs-size-panel space-y-5 rounded-2xl p-4 shadow-xl backdrop-blur-sm ${extraClassName}`}
      >
        {!isPlaque && (
          <SegmentedControl
            value={editingObject}
            onChange={(value) => {
              setEditingObject(
                value as 'headstone' | 'base' | 'ledger' | 'kerbset',
              );
              setSelected(value as 'headstone' | 'base' | 'ledger' | 'kerbset');
              if (value === 'base') {
                setShowBase(true);
              }
            }}
            options={sizeTabOptions}
          />
        )}

        {editingObject === 'base' && (
          <>
            <div className="flex gap-1.5 rounded-full border border-[#3A3A3A] bg-[#0A0A0A] p-1">
              <button
                type="button"
                onClick={() => setShowBase(false)}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  !showBase
                    ? 'bg-[#D7B356] text-black shadow-lg shadow-[#D7B356]/30'
                    : 'text-gray-300 hover:bg-[#1A1A1A] hover:text-white'
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
                    : 'text-gray-300 hover:bg-[#1A1A1A] hover:text-white'
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
                    : 'text-gray-300 hover:bg-[#1A1A1A] hover:text-white'
                }`}
              >
                Rock Pitch
              </button>
            </div>
            <div className="-mx-4 border-t border-[#3A3A3A]/50"></div>
          </>
        )}

        {editingObject === 'headstone' && !isPlaque && (
          <>
            <SegmentedControl
              value={headstoneStyle}
              onChange={(value) =>
                setHeadstoneStyle(value as 'upright' | 'slant')
              }
              options={[
                { label: 'Upright', value: 'upright' },
                { label: 'Slant', value: 'slant' },
              ]}
            />
            <div className="-mx-4 border-t border-[#3A3A3A]/50"></div>
          </>
        )}

        <div
          className={`space-y-1 ${editingObject === 'base' && !showBase ? 'pointer-events-none opacity-50' : ''}`}
        >
          <div className="flex items-center justify-between gap-2">
            <label className="w-20 text-sm font-medium text-gray-200">
              Width
            </label>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const newVal = Math.max(minWidth, currentWidthMm - 10);
                  setCurrentWidthMm(newVal);
                }}
                disabled={editingObject === 'base' && !showBase}
                className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Decrease width by 10mm"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
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
                className={`w-16 rounded border bg-[#454545] px-2 py-1.5 text-right text-sm text-white transition-colors focus:ring-2 focus:outline-none ${
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
                className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Increase width by 10mm"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
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
              className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)]"
            />
            <div className="mt-0.5 flex w-full justify-between text-xs text-gray-500">
              <span>{minWidth}mm</span>
              <span>{maxWidth}mm</span>
            </div>
          </div>
        </div>

        <div
          className={`space-y-1 ${editingObject === 'base' && !showBase ? 'pointer-events-none opacity-50' : ''}`}
        >
          <div className="flex items-center justify-between gap-2">
            <label className="w-20 text-sm font-medium text-gray-200">
              Height
            </label>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const newVal = Math.max(minHeight, currentHeightMm - 10);
                  setCurrentHeightMm(newVal);
                }}
                disabled={editingObject === 'base' && !showBase}
                className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Decrease height by 10mm"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
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
                className={`w-16 rounded border bg-[#454545] px-2 py-1.5 text-right text-sm text-white transition-colors focus:ring-2 focus:outline-none ${
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
                className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Increase height by 10mm"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
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
              className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgба(0,0,0,0.3)] [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)]"
            />
            <div className="mt-0.5 flex w-full justify-between text-xs text-gray-500">
              <span>{minHeight}mm</span>
              <span>{maxHeight}mm</span>
            </div>
          </div>
        </div>

        {editingObject === 'headstone' && !isPlaque && (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="w-20 text-sm font-medium text-gray-200">
                Thickness
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const currentVal =
                      headstoneStyle === 'upright'
                        ? uprightThickness
                        : slantThickness;
                    const newVal = Math.max(minThickness, currentVal - 10);
                    if (headstoneStyle === 'upright') {
                      setUprightThickness(newVal);
                    } else {
                      setSlantThickness(newVal);
                    }
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                  aria-label="Decrease thickness by 10mm"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  min={minThickness}
                  max={maxThickness}
                  step={10}
                  value={Math.round(
                    headstoneStyle === 'upright'
                      ? uprightThickness
                      : slantThickness,
                  )}
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
                  className={`w-16 rounded border bg-[#454545] px-2 py-1.5 text-right text-sm text-white transition-colors focus:ring-2 focus:outline-none ${
                    (headstoneStyle === 'upright'
                      ? uprightThickness
                      : slantThickness) < minThickness ||
                    (headstoneStyle === 'upright'
                      ? uprightThickness
                      : slantThickness) > maxThickness
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-[#5A5A5A] focus:border-[#D7B356] focus:ring-[#D7B356]/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const currentVal =
                      headstoneStyle === 'upright'
                        ? uprightThickness
                        : slantThickness;
                    const newVal = Math.min(maxThickness, currentVal + 10);
                    if (headstoneStyle === 'upright') {
                      setUprightThickness(newVal);
                    } else {
                      setSlantThickness(newVal);
                    }
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                  aria-label="Increase thickness by 10mm"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
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
                value={
                  headstoneStyle === 'upright'
                    ? uprightThickness
                    : slantThickness
                }
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  if (headstoneStyle === 'upright') {
                    setUprightThickness(newValue);
                  } else {
                    setSlantThickness(newValue);
                  }
                }}
                className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgба(215,179,86,0.4),0_0_0_3px_rgба(0,0,0,0.3)] [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgба(215,179,86,0.4),0_0_0_3px_rgба(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgба(215,179,86,0.6),0_0_0_3px_rgба(0,0,0,0.3)]"
              />
              <div className="mt-0.5 flex w-full justify-between text-xs text-gray-500">
                <span>{minThickness}mm</span>
                <span>{maxThickness}mm</span>
              </div>
            </div>
          </div>
        )}

        {editingObject === 'base' && showBase && (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="w-20 text-sm font-medium text-gray-200">
                Thickness
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(minThickness, baseThickness - 10);
                    setBaseThickness(newVal);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                  aria-label="Decrease base thickness by 10mm"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
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
                  className={`w-16 rounded border bg-[#454545] px-2 py-1.5 text-right text-sm text-white transition-colors focus:ring-2 focus:outline-none ${
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
                  className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                  aria-label="Increase base thickness by 10mm"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
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
                className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgба(215,179,86,0.4),0_0_0_3px_rgба(0,0,0,0.3)] [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgба(215,179,86,0.4),0_0_0_3px_rgба(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgба(215,179,86,0.6),0_0_0_3px_rgба(0,0,0,0.3)]"
              />
              <div className="mt-0.5 flex w-full justify-between text-xs text-gray-500">
                <span>{minThickness}mm</span>
                <span>{maxThickness}mm</span>
              </div>
            </div>
          </div>
        )}

        {(editingObject === 'ledger' || editingObject === 'kerbset') &&
          currentDepthMm !== null &&
          setCurrentDepthMm && (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <label className="w-20 text-sm font-medium text-gray-200">
                  Length
                </label>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentDepthMm(
                        Math.max(minThickness, currentDepthMm - 10),
                      )
                    }
                    className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                    aria-label="Decrease length by 10mm"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min={minThickness}
                    max={maxThickness}
                    step={10}
                    value={currentDepthMm}
                    onChange={(e) => setCurrentDepthMm(Number(e.target.value))}
                    className="w-16 rounded border border-[#5A5A5A] bg-[#454545] px-2 py-1.5 text-right text-sm text-white transition-colors focus:border-[#D7B356] focus:ring-2 focus:ring-[#D7B356]/30 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentDepthMm(
                        Math.min(maxThickness, currentDepthMm + 10),
                      )
                    }
                    className="flex h-7 w-7 items-center justify-center rounded bg-[#454545] text-white transition-colors hover:bg-[#5A5A5A]"
                    aria-label="Increase length by 10mm"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
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
                  value={currentDepthMm}
                  onChange={(e) => setCurrentDepthMm(Number(e.target.value))}
                  className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)]"
                />
                <div className="mt-0.5 flex w-full justify-between text-xs text-gray-500">
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
      className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-[#3d2817] via-[#2a1f14] to-[#1a1410] text-white"
    >
      {/* Full-Screen Panel Overlay */}
      {shouldShowFullscreenPanel ? (
        <div className="flex h-full flex-col">
          {/* Panel Header - desktop only */}
          <div className="hidden border-b border-white/10 bg-[#1b1511] px-5 py-4 md:block">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleBackToMenu}
                  className="inline-flex items-center gap-3 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition-colors duration-200 hover:border-white/40 hover:text-white"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </span>
                  <span className="tracking-wide">Back&nbsp;to&nbsp;Menu</span>
                </button>
                {shouldShowBackToListButton && (
                  <button
                    onClick={
                      activeFullscreenPanel === 'select-additions'
                        ? handleBackToAdditionList
                        : handleBackToMotifList
                    }
                    className="inline-flex items-center gap-3 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:border-white/40 hover:text-white"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70">
                      <Squares2X2Icon className="h-4 w-4" />
                    </span>
                    <span className="tracking-wide">
                      Back&nbsp;to&nbsp;List
                    </span>
                  </button>
                )}
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs tracking-[0.35em] text-white/50 uppercase">
                  Guided Step
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  {
                    menuItems.find(
                      (item) => item.slug === activeFullscreenPanel,
                    )?.name
                  }
                </h2>
                <div className="mt-3 h-px w-24 bg-white/20" />
              </div>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Render content based on activeFullscreenPanel */}
            {activeFullscreenPanel === 'select-size' && renderSelectSizePanel()}
            {activeFullscreenPanel === 'select-shape' &&
              (isLoadingPanel ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3A3A3A] border-t-white" />
                    <p className="text-sm text-white/60">Loading shapes...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <ShapeSelector shapes={shapes} />
                </div>
              ))}
            {activeFullscreenPanel === 'select-material' &&
              (isLoadingPanel ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3A3A3A] border-t-white" />
                    <p className="text-sm text-white/60">
                      Loading materials...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <MaterialSelector materials={materials} />
                </div>
              ))}
            {activeFullscreenPanel === 'select-border' &&
              (isLoadingPanel ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3A3A3A] border-t-white" />
                    <p className="text-sm text-white/60">Loading borders...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-[calc(100vh-220px)] overflow-hidden rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
                    <div className="h-full overflow-y-auto pr-1">
                      <BorderSelector borders={borders} disableInternalScroll isPlaque={isPlaque} />
                    </div>
                  </div>
                </div>
              ))}
            {activeFullscreenPanel === 'inscriptions' &&
              (isLoadingPanel ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3A3A3A] border-t-white" />
                    <p className="text-sm text-white/60">
                      Loading inscriptions...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <InscriptionEditPanel />
                </div>
              ))}
            {activeFullscreenPanel === 'select-additions' &&
              (isLoadingPanel ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3A3A3A] border-t-white" />
                    <p className="text-sm text-white/60">
                      Loading additions...
                    </p>
                  </div>
                </div>
              ) : (
                renderSelectAdditionsPanel()
              ))}
            {activeFullscreenPanel === 'select-images' &&
              (isLoadingPanel ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3A3A3A] border-t-white" />
                    <p className="text-sm text-white/60">Loading images...</p>
                  </div>
                </div>
              ) : (
                renderSelectImagesPanel()
              ))}
            {activeFullscreenPanel === 'select-motifs' &&
              (isLoadingPanel ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3A3A3A] border-t-white" />
                    <p className="text-sm text-white/60">Loading motifs...</p>
                  </div>
                </div>
              ) : (
                renderSelectMotifsPanel()
              ))}
            {activeFullscreenPanel === 'select-emblems' &&
              (isLoadingPanel ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3A3A3A] border-t-white" />
                    <p className="text-sm text-white/60">Loading emblems...</p>
                  </div>
                </div>
              ) : (
                renderSelectEmblemsPanel()
              ))}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Header */}
          <div className="hidden items-center justify-between border-b border-white/10 px-6 md:flex">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <img src="/ico/forever-transparent-logo.png" alt="Forever Logo" />
            </Link>
          </div>

          {/* Mobile Header */}
          <div className="border-b border-white/5 bg-[#120c08]/95 px-5 py-4 shadow-[0_10px_25px_rgba(0,0,0,0.45)] md:hidden">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] tracking-[0.45em] text-white/50 uppercase">
                Guided Studio
              </p>
              <Link href="/" className="transition-opacity hover:opacity-80">
                <img
                  src="/ico/forever-transparent-logo.png"
                  alt="Forever Logo"
                  className="h-8 w-auto"
                />
              </Link>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6 md:space-y-0 md:p-4">
            {/* Primary/Secondary CTAs */}
            {(hasCustomizations || productId) && (
              <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                {hasCustomizations && (
                  <button
                    onClick={handleNewDesign}
                    className="inline-flex flex-1 items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#f4d07e] to-[#d7b356] px-4 py-3 text-base font-medium text-gray-900 shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all hover:from-[#ffe2a8] hover:to-[#e0c068] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4d07e]"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                    <span>New Design</span>
                  </button>
                )}
                {productId && (
                  <button
                    onClick={handleToggleConvertPanel}
                    className={`inline-flex flex-1 items-center justify-center gap-3 rounded-lg border px-4 py-3 text-base font-light transition-all ${
                      showConvertPanel
                        ? 'border-[#f4d07e] bg-white/5 text-[#f4d07e]'
                        : 'border-white/20 text-gray-200 hover:border-white/40 hover:bg-white/5'
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
                    <p className="text-sm font-semibold text-white">
                      Convert this design
                    </p>
                    <p className="text-xs text-white/60">
                      Select a different product to reload catalog settings
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConvertPanel(false)}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs tracking-wide text-white/70 uppercase hover:border-white/40 hover:text-white"
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
                            <p className="text-sm leading-tight font-semibold text-white">
                              {product.name}
                            </p>
                            <p className="text-xs text-white/60 capitalize">
                              {product.category}
                            </p>
                            {isActiveProduct ? (
                              <span className="text-[11px] font-medium text-emerald-400">
                                Current product
                              </span>
                            ) : (
                              <span className="text-[11px] text-white/50">
                                Tap to convert
                              </span>
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
                      <p className="text-lg font-normal tracking-tight text-white">
                        {group.label}
                      </p>
                    </div>
                    <span className="text-[9px] tracking-[0.4em] text-white/45 uppercase">
                      Step {groupIndex + 1}
                    </span>
                  </div>

                  {/* Group Items */}
                  <div className="flex flex-col gap-2">
                    {group.items.map((item, index) => {
                      const Icon = item.icon;
                      const isRouteActive = pathname === `/${item.slug}`;
                      const isPanelActive = activeFullscreenPanel === item.slug;
                      const isActive = isRouteActive || isPanelActive;
                      const highlightActive = fullscreenPanelSlugs.has(
                        item.slug,
                      )
                        ? isPanelActive || isRouteActive
                        : isActive;
                      const itemStatus = getItemStatus(item.slug);
                      const itemCount = getItemCount(item.slug);

                      // Status-based styling
                      const statusClasses =
                        itemStatus === 'complete'
                          ? 'border-green-500/30 text-green-400'
                          : itemStatus === 'incomplete'
                            ? 'border-amber-500/30 text-amber-400'
                            : 'border-white/10 text-gray-200';

                      // Hide "Select Material" for laser etched products
                      if (
                        item.slug === 'select-material' &&
                        catalog?.product?.laser === '1'
                      ) {
                        return null;
                      }

                      // Hide "Select Border" for headstones (toggle is in Shape panel) and plaques without border support
                      if (item.slug === 'select-border' && (!isPlaque || !hasBorder)) {
                        return null;
                      }

                      // Hide "Select Additions" for laser etched products
                      if (
                        item.slug === 'select-additions' &&
                        catalog?.product?.laser === '1'
                      ) {
                        return null;
                      }

                      // Hide "Select Emblems" for non-plaque products
                      if (
                        (item as { requiresPlaque?: boolean }).requiresPlaque &&
                        !isPlaque
                      ) {
                        return null;
                      }

                      // Hide "Select Additions" for plaque products
                      if (
                        (item as { hiddenForPlaque?: boolean }).hiddenForPlaque &&
                        isPlaque
                      ) {
                        return null;
                      }

                      // Hide 3D Preview when canvas is already visible or on select-size page
                      if (
                        item.slug === '3d-preview' &&
                        (showCanvas || pathname === '/select-size')
                      ) {
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
                              onMouseDown={(e) => e.preventDefault()}
                              style={{
                                caretColor: 'transparent',
                                userSelect: 'none',
                              }}
                              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-light transition-all ${
                                highlightActive
                                  ? 'border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-sm'
                                  : 'border border-white/10 text-gray-200 hover:border-white/20 hover:bg-white/10'
                              }`}
                            >
                              <Icon className="h-5 w-5 flex-shrink-0" />
                              <span
                                className="select-none"
                                style={{ caretColor: 'transparent' }}
                              >
                                {item.name}
                              </span>
                            </button>

                            {shouldRenderInlinePanel &&
                              renderSelectSizePanel('mt-3')}
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
                                  onMouseDown={(e) => e.preventDefault()}
                                  style={{
                                    caretColor: 'transparent',
                                    userSelect: 'none',
                                  }}
                                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-light transition-all ${
                                    isActive
                                      ? 'border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-sm'
                                      : 'border border-white/10 text-gray-200 hover:border-white/20 hover:bg-white/10'
                                  }`}
                                >
                                  <Icon className="h-5 w-5 flex-shrink-0" />
                                  <span>{item.name}</span>
                                </button>

                                {isActive &&
                                  !selectedMotifId &&
                                  !selectedAdditionId && (
                                    <div className="mt-3 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
                                      <BorderSelector borders={borders} />
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
                                    ? 'border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-sm'
                                    : 'border border-white/10 text-gray-200 hover:border-white/20 hover:bg-white/10'
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
                                  onMouseDown={(e) => e.preventDefault()}
                                  style={{
                                    caretColor: 'transparent',
                                    userSelect: 'none',
                                  }}
                                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-light transition-all ${
                                    isActive
                                      ? 'border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-sm'
                                      : 'border border-white/10 text-gray-200 hover:border-white/20 hover:bg-white/10'
                                  }`}
                                >
                                  <Icon className="h-5 w-5 flex-shrink-0" />
                                  <span
                                    className="select-none"
                                    style={{ caretColor: 'transparent' }}
                                  >
                                    {item.name}
                                  </span>
                                </button>

                                {isActive &&
                                  !selectedMotifId &&
                                  !selectedAdditionId &&
                                  materials.length > 0 && (
                                    <div className="mt-3 h-[calc(100vh-280px)] overflow-hidden rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-4 shadow-xl backdrop-blur-sm">
                                      <div className="h-full overflow-y-auto pr-1">
                                        <MaterialSelector
                                          materials={materials}
                                          disableInternalScroll
                                        />
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
                                    ? 'border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-sm'
                                    : 'border border-white/10 text-gray-200 hover:border-white/20 hover:bg-white/10'
                                }`}
                              >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                <span>{item.name}</span>
                              </Link>
                            )}
                          </React.Fragment>
                        );
                      }

                      // Special handling for Save Design - always a button, never navigate
                      if (item.slug === 'save-design') {
                        return (
                          <React.Fragment key={item.slug}>
                            <button
                              onClick={(e) => handleMenuClick(item.slug, e)}
                              className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-white/10 px-4 py-3 text-left text-base font-light text-gray-200 transition-all hover:border-white/20 hover:bg-white/10"
                            >
                              <Icon className="h-5 w-5 flex-shrink-0" />
                              <span>{item.name}</span>
                            </button>
                          </React.Fragment>
                        );
                      }

                      // Determine if step should be disabled (steps 3-10 need a product selected)
                      // Exception: Check Price is always enabled (users can see base price even with empty headstone)
                      const needsProduct =
                        index >= 2 && item.slug !== 'check-price';
                      const isDisabled = needsProduct && !catalog;

                      return (
                        <React.Fragment key={item.slug}>
                          {isDisabled ? (
                            <div
                              className="flex cursor-not-allowed items-center gap-3 rounded-lg border border-white/5 px-4 py-3 text-base font-light opacity-40"
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
                                  ? 'border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-sm'
                                  : 'border border-white/10 text-gray-200 hover:border-white/20 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                <span>{item.name}</span>
                              </div>

                              {/* Count Badge */}
                              {itemCount && itemCount > 0 && (
                                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                                  {itemCount}
                                </span>
                              )}

                              {/* Expandable Indicator */}
                              {(item.slug === 'inscriptions' ||
                                item.slug === 'select-additions' ||
                                item.slug === 'select-motifs') &&
                                itemCount &&
                                itemCount > 0 &&
                                (expandedSections[item.slug] ? (
                                  <ChevronUpIcon className="h-4 w-4 flex-shrink-0" />
                                ) : (
                                  <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
                                ))}
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
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/15 px-4 py-3 text-base font-light text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <SparklesIcon className="h-5 w-5 flex-shrink-0" />
              <span>Browse Designs</span>
            </Link>
          </div>
        </>
      )}

      {/* Save Design Modal */}
      <SaveDesignModal
        isOpen={showSaveDesignModal}
        onClose={() => setShowSaveDesignModal(false)}
        onSave={handleSaveDesign}
        isSaving={isSavingDesign}
      />
    </nav>
  );
}

function captureBestCanvasScreenshot(): string | null {
  const canvases = Array.from(document.querySelectorAll('canvas'));
  if (!canvases.length) return null;

  const ranked = canvases
    .map((canvas) => {
      const width = canvas.width || canvas.clientWidth || 0;
      const height = canvas.height || canvas.clientHeight || 0;
      const area = width * height;
      return { canvas, area };
    })
    .filter((entry) => entry.area > 0)
    .sort((a, b) => b.area - a.area);

  const first = ranked[0]?.canvas ?? null;

  for (const { canvas } of ranked) {
    try {
      if (isLikelyBlankCanvas(canvas)) {
        continue;
      }
      return encodeCanvasForUpload(canvas);
    } catch {
      // Try next canvas
    }
  }

  if (!first) return null;
  try {
    return encodeCanvasForUpload(first);
  } catch {
    return null;
  }
}

function encodeCanvasForUpload(source: HTMLCanvasElement): string {
  const maxWidth = 1920;
  const maxHeight = 1080;
  const sourceWidth = source.width || source.clientWidth || 1;
  const sourceHeight = source.height || source.clientHeight || 1;
  const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);

  let exportCanvas = source;
  if (scale < 1) {
    const resized = document.createElement('canvas');
    resized.width = Math.max(1, Math.round(sourceWidth * scale));
    resized.height = Math.max(1, Math.round(sourceHeight * scale));
    const ctx = resized.getContext('2d');
    if (ctx) {
      // Use a white background to avoid alpha artifacts in JPEG exports.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, resized.width, resized.height);
      ctx.drawImage(source, 0, 0, resized.width, resized.height);
      exportCanvas = resized;
    }
  }

  return exportCanvas.toDataURL('image/jpeg', 0.86);
}

function isLikelyBlankCanvas(canvas: HTMLCanvasElement): boolean {
  const probe = document.createElement('canvas');
  probe.width = 64;
  probe.height = 48;
  const ctx = probe.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;

  try {
    ctx.drawImage(canvas, 0, 0, probe.width, probe.height);
    const pixels = ctx.getImageData(0, 0, probe.width, probe.height).data;
    let opaque = 0;
    let nonWhite = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      if (a > 10) {
        opaque += 1;
        if (!(r > 245 && g > 245 && b > 245)) {
          nonWhite += 1;
        }
      }
    }

    if (opaque === 0) return true;
    return nonWhite / opaque < 0.01;
  } catch {
    return false;
  }
}
