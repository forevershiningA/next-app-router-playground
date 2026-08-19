'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  SparklesIcon,
  StarIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { getAllSavedDesigns, type SavedDesignMetadata } from '#/lib/saved-designs-data';
import { loadDesignById } from '#/components/DefaultDesignLoader';
import { loadMLData, getMLCategories, type MLDesignEntry } from '#/lib/ml-search-service';
import { useHiddenDesigns } from '#/lib/useHiddenDesigns';
import { useHeadstoneStore } from '#/lib/headstone-store';

interface LoadDesignButtonProps {
  label?: string;
  /**
   * 'floating' (default) renders the fixed top-right canvas button.
   * 'menu' renders an inline full-width button styled for the designer sidebar
   * main menu. 'nav' renders the compact design gallery nav action.
   */
  variant?: 'floating' | 'menu' | 'nav';
}

/** Tree grouped by category first (used in popup) */
interface CategoryTree {
  [categorySlug: string]: {
    categoryLabel: string;
    designs: Array<{
      id: string;
      displayTitle: string;
      metadata: SavedDesignMetadata;
    }>;
  };
}

function formatSlugForDisplay(slug: string): string {
  if (!slug) return 'Memorial Design';

  const words = slug.split('-');
  return words
    .map((word, index) => {
      if (index !== 0 && word.length <= 2) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function formatShapeName(shapeName: string): string {
  if (!shapeName) return '';

  return shapeName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildDesignTitle(shapeName: string | undefined, slug: string): string {
  let processedSlug = slug;

  if (shapeName) {
    const shapeKebab = shapeName.toLowerCase().replace(/\s+/g, '-');
    if (processedSlug.startsWith(`${shapeKebab}-`)) {
      processedSlug = processedSlug.substring(shapeKebab.length + 1);
    } else if (processedSlug === shapeKebab) {
      processedSlug = 'memorial';
    }
  }

  const slugTitle = formatSlugForDisplay(processedSlug);
  if (shapeName) {
    return `${formatShapeName(shapeName)} - ${slugTitle}`;
  }
  return slugTitle;
}

function toLabel(slug: string): string {
  return slug
    .split('-')
    .map((part, index) => {
      if (index !== 0 && part.length <= 2) {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

/** Return best available thumbnail src — always try 3D screenshot first. */
function getPopupPreviewSrc(designId: string, preview?: string): string {
  return `/screenshots/v2026-3d/${designId}_small.png`;
}

/** Legacy ML _small variant (used as fallback). */
function getLegacySmallSrc(preview?: string): string | null {
  if (!preview) return null;
  return preview.replace(/\.(jpg|jpeg|png)$/i, '_small.jpg');
}

/** Preferred display order for categories (unlisted ones sort alphabetically at the end) */
const CATEGORY_ORDER: string[] = [
  'pets',
  'mother-memorial',
  'father-memorial',
  'wife-memorial',
  'husband-memorial',
  'son-memorial',
  'daughter-memorial',
  'baby-memorial',
  'memorial',
  'in-loving-memory',
  'rest-in-peace',
  'biblical-memorial',
  'religious-memorial',
  'dove-memorial',
  'butterfly-memorial',
  'military-veteran',
];

function buildCategoryTree(designs: SavedDesignMetadata[]): CategoryTree {
  return designs.reduce<CategoryTree>((acc, design) => {
    const categorySlug = design.category || 'uncategorized';

    if (!acc[categorySlug]) {
      acc[categorySlug] = {
        categoryLabel: toLabel(categorySlug),
        designs: [],
      };
    }

    acc[categorySlug].designs.push({
      id: design.id,
      displayTitle: buildDesignTitle(design.shapeName, design.slug),
      metadata: design,
    });
    return acc;
  }, {});
}

/** Sort category entries by CATEGORY_ORDER then alphabetically */
function sortCategoryEntries(entries: [string, CategoryTree[string]][]): [string, CategoryTree[string]][] {
  return entries.sort(([a], [b]) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
}

export default function LoadDesignButton({ label = 'Load Design', variant = 'floating' }: LoadDesignButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // ML filter state
  const [showFilters, setShowFilters] = useState(false);
  const [mlType, setMlType] = useState('');
  const [mlStyle, setMlStyle] = useState('');
  const [mlMotif, setMlMotif] = useState('');
  const [mlIndex, setMlIndex] = useState<Map<string, MLDesignEntry>>(new Map());
  const [mlCategories, setMlCategories] = useState<{ types: string[]; styles: string[]; motifs: string[] }>({ types: [], styles: [], motifs: [] });

  const { isLocalhost, hiddenIds, hideDesign, favoriteIds, toggleFavorite } = useHiddenDesigns();

  // Get current product from store for filtering in the designer canvas.
  const productId = useHeadstoneStore((s) => s.productId);

  const allDesigns = useMemo(() => {
    const designs = getAllSavedDesigns();
    if (hiddenIds.size === 0) return designs;
    return designs.filter((d) => !hiddenIds.has(d.id));
  }, [hiddenIds]);

  // Load ML data when modal opens
  useEffect(() => {
    if (isOpen && mlIndex.size === 0) {
      loadMLData().then(setMlIndex);
      getMLCategories().then(setMlCategories);
    }
  }, [isOpen, mlIndex.size]);

  const hasMLFilters = mlType !== '' || mlStyle !== '' || mlMotif !== '';
  const routeProductSlug = useMemo(() => {
    if (!pathname?.startsWith('/designs/')) return null;

    const productSlug = pathname.split('/').filter(Boolean)[1];
    if (!productSlug || productSlug === 'guide') return null;

    return allDesigns.some((design) => design.productSlug === productSlug) ? productSlug : null;
  }, [allDesigns, pathname]);
  const isDesignGalleryRoute = pathname === '/designs' || pathname?.startsWith('/designs/');

  const filteredDesigns = useMemo(() => {
    let result = allDesigns;

    // Filter by URL product on design gallery pages. On /designs, show all products.
    // On designer canvas pages, keep the existing current-product behavior.
    const needle = search.trim().toLowerCase();
    if (routeProductSlug) {
      result = result.filter((d) => d.productSlug === routeProductSlug);
    } else if (!needle && !hasMLFilters && !isDesignGalleryRoute && productId) {
      result = result.filter((d) => d.productId === productId);
    }

    // Text search
    if (needle) {
      result = result.filter((design) => {
        const ml = mlIndex.get(design.id);
        return (
          design.slug.toLowerCase().includes(needle) ||
          design.title.toLowerCase().includes(needle) ||
          buildDesignTitle(design.shapeName, design.slug).toLowerCase().includes(needle) ||
          design.productName.toLowerCase().includes(needle) ||
          design.category.toLowerCase().includes(needle) ||
          design.id.includes(needle) ||
          (ml?.ml_tags || '').toLowerCase().includes(needle) ||
          (ml?.ml_motif || '').toLowerCase().includes(needle)
        );
      });
    }

    // ML category filters
    if (mlType) {
      result = result.filter((d) => mlIndex.get(d.id)?.ml_type === mlType);
    }
    if (mlStyle) {
      result = result.filter((d) => mlIndex.get(d.id)?.ml_style === mlStyle);
    }
    if (mlMotif) {
      result = result.filter((d) => mlIndex.get(d.id)?.ml_motif === mlMotif);
    }

    return result;
  }, [allDesigns, search, mlType, mlStyle, mlMotif, mlIndex, hasMLFilters, routeProductSlug, isDesignGalleryRoute, productId]);

  const tree = useMemo(() => buildCategoryTree(filteredDesigns), [filteredDesigns]);
  const categoryEntries = useMemo(() => sortCategoryEntries(Object.entries(tree)), [tree]);
  const totalCount = filteredDesigns.length;

  const favoriteDesigns = useMemo(() => {
    if (favoriteIds.size === 0) return [];
    const designs = routeProductSlug
      ? allDesigns.filter((d) => d.productSlug === routeProductSlug)
      : !isDesignGalleryRoute && productId
        ? allDesigns.filter((d) => d.productId === productId)
        : allDesigns;

    return designs
      .filter((d) => favoriteIds.has(d.id))
      .map((d) => ({
        id: d.id,
        displayTitle: buildDesignTitle(d.shapeName, d.slug),
        metadata: d,
      }));
  }, [allDesigns, favoriteIds, routeProductSlug, isDesignGalleryRoute, productId]);

  // Auto-expand Popular when it has designs
  useEffect(() => {
    if (favoriteDesigns.length > 0) {
      setExpandedNodes((prev) => {
        if (prev.has('popular')) return prev;
        const next = new Set(prev);
        next.add('popular');
        return next;
      });
    }
  }, [favoriteDesigns.length]);

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes((current) => {
      const next = new Set(current);
      if (next.has(nodeKey)) {
        next.delete(nodeKey);
      } else {
        next.add(nodeKey);
      }
      return next;
    });
  };

  const handleLoadDesign = async (designId: string) => {
    setError(null);
    setIsOpen(false);
    setLoading(true);
    try {
      const result = await loadDesignById(designId);
      if (!result.success) {
        setError(result.message);
      } else {
        // Clear any auto-selected items that were set during loading
        // (addMotif/addImage set activePanel/selectedXxxId as a side-effect)
        const { setActivePanel, setSelectedMotifId, setSelectedImageId } =
          useHeadstoneStore.getState();
        setActivePanel(null);
        setSelectedMotifId(null);
        setSelectedImageId(null);
        router.push('/design-menu');
      }
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setIsOpen(true);
    setError(null);
  };

  const closeModal = () => {
    if (loading) {
      return;
    }
    setIsOpen(false);
  };

  const useGalleryModalStyle = Boolean(isDesignGalleryRoute);
  const modalClasses = {
    overlay: useGalleryModalStyle
      ? 'fixed inset-0 z-[9999] flex items-center justify-center bg-stone-950/35 px-4 py-6 backdrop-blur-sm'
      : 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm',
    panel: useGalleryModalStyle
      ? 'relative flex h-[82vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-stone-200 bg-[#f7f5f0] text-stone-950 shadow-2xl'
      : 'relative flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#d4af37]/35 bg-gradient-to-b from-[#191108]/95 via-[#120d07]/95 to-[#0a0704]/95 text-white shadow-[0_35px_90px_rgba(0,0,0,0.7)] ring-1 ring-white/10',
    header: useGalleryModalStyle
      ? 'relative flex items-center justify-between border-b border-stone-200 bg-white px-6 py-5 md:px-7'
      : 'relative flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-7',
    title: useGalleryModalStyle
      ? 'text-3xl font-serif font-light tracking-tight text-stone-950 md:text-4xl'
      : 'text-2xl font-serif text-white md:text-[1.75rem]',
    bodyText: useGalleryModalStyle ? 'text-stone-600' : 'text-white/70',
    accentText: useGalleryModalStyle ? 'text-[#8a6b1f]' : 'text-[#f3d48f]',
    closeButton: useGalleryModalStyle
      ? 'absolute right-4 top-4 rounded-full border border-stone-300 bg-white p-1.5 text-stone-500 transition-colors hover:border-stone-950 hover:text-stone-950 disabled:opacity-40 cursor-pointer'
      : 'absolute right-4 top-4 rounded-full border border-white/25 bg-black/25 p-1.5 text-white/70 transition-colors hover:border-white/60 hover:text-white disabled:opacity-40 cursor-pointer',
    searchWrap: useGalleryModalStyle
      ? 'border-b border-stone-200 bg-white px-6 py-4 md:px-7'
      : 'border-b border-white/10 px-6 py-4 md:px-7',
    searchIcon: useGalleryModalStyle ? 'text-stone-500' : 'text-white/40',
    searchInput: useGalleryModalStyle
      ? 'w-full rounded-lg border border-stone-300 bg-[#fbfaf7] py-3.5 pl-10 pr-3 text-sm text-stone-950 placeholder:text-stone-500 focus:border-[#9b7a24] focus:bg-white focus:outline-none'
      : 'w-full rounded-xl border border-white/15 bg-white/[0.03] py-3.5 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#d4af37]/50 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/25',
    filterButtonBase: useGalleryModalStyle
      ? 'shrink-0 rounded-lg border p-2.5 transition'
      : 'shrink-0 rounded-xl border p-2.5 transition',
    filterButtonActive: useGalleryModalStyle
      ? 'border-[#9b7a24] bg-[#f7f5f0] text-[#8a6b1f]'
      : 'border-[#d4af37]/50 bg-[#d4af37]/15 text-[#f3d48f]',
    filterButtonIdle: useGalleryModalStyle
      ? 'border-stone-300 bg-[#fbfaf7] text-stone-500 hover:border-stone-950 hover:text-stone-950'
      : 'border-white/15 bg-white/[0.03] text-white/50 hover:text-white/80',
    content: useGalleryModalStyle
      ? 'min-h-0 flex-1 overflow-y-auto px-6 py-4 md:px-7'
      : 'min-h-0 flex-1 overflow-y-auto px-6 py-4 md:px-7',
    emptyText: useGalleryModalStyle ? 'text-sm text-stone-600' : 'text-sm text-white/70',
    categoryPanel: useGalleryModalStyle
      ? 'rounded-lg border border-stone-200 bg-white shadow-sm'
      : 'rounded-2xl border border-white/10 bg-white/[0.03]',
    categoryHeader: useGalleryModalStyle
      ? 'flex w-full items-center gap-2 px-4 py-3 text-left text-stone-950 cursor-pointer'
      : 'flex w-full items-center gap-2 px-4 py-3 text-left text-white cursor-pointer',
    categoryChevronOpen: useGalleryModalStyle ? 'h-4 w-4 text-[#8a6b1f]' : 'h-4 w-4 text-[#d4af37]/70',
    categoryChevronClosed: useGalleryModalStyle ? 'h-4 w-4 text-stone-500' : 'h-4 w-4 text-white/50',
    countPill: useGalleryModalStyle
      ? 'rounded-full border border-stone-200 bg-[#f7f5f0] px-2 py-0.5 text-xs text-stone-600'
      : 'rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs text-white/70',
    expandedPanel: useGalleryModalStyle ? 'border-t border-stone-100 p-4' : 'border-t border-white/10 p-4',
    card: useGalleryModalStyle
      ? 'group relative flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white transition-all duration-300 hover:border-[#d8c487] hover:shadow-lg'
      : 'group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25 transition-all duration-300 hover:border-[#d4af37]/30 hover:shadow-lg hover:shadow-black/40',
    thumb: useGalleryModalStyle
      ? 'relative aspect-[4/3] w-full overflow-hidden bg-[radial-gradient(circle_at_50%_28%,#ffffff_0%,#f4f0e7_52%,#e6e0d3_100%)]'
      : 'relative aspect-[4/3] w-full overflow-hidden bg-[#cccccc]',
    cardFooter: useGalleryModalStyle ? 'px-3 py-2 bg-white' : 'px-3 py-2',
    cardTitle: useGalleryModalStyle ? 'block truncate text-xs font-medium text-stone-900' : 'block truncate text-xs font-medium text-white/90',
    cardDate: useGalleryModalStyle ? 'mt-0.5 block text-[10px] text-stone-500' : 'mt-0.5 block text-[10px] text-white/35',
    hoverAction: useGalleryModalStyle
      ? 'pointer-events-auto rounded-full border border-stone-950 bg-stone-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-lg transition hover:border-[#8a6b1f] hover:bg-[#8a6b1f] disabled:opacity-50 cursor-pointer'
      : 'pointer-events-auto rounded-full border-2 border-[#d4af37] bg-black px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-lg backdrop-blur-sm transition hover:bg-[#d4af37]/25 disabled:opacity-50 cursor-pointer',
  };

  const modalContent = !isOpen
    ? null
    : createPortal(
        <div className={modalClasses.overlay}>
          <div className={modalClasses.panel}>
            {!useGalleryModalStyle && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#d4af37]/18 via-[#d4af37]/6 to-transparent"
              />
            )}
            <div className={modalClasses.header}>
              <div>
                <h2 className={modalClasses.title}>Load Design</h2>
                <p className={`mt-1 text-sm leading-relaxed ${modalClasses.bodyText}`}>
                  {totalCount.toLocaleString()} designs available
                  {(routeProductSlug || (!isDesignGalleryRoute && productId)) && !search.trim() && !hasMLFilters && filteredDesigns.length > 0 && (
                    <span className={`ml-1 ${modalClasses.accentText}`}>
                      · {filteredDesigns[0].productName}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={closeModal}
                disabled={loading}
                className={modalClasses.closeButton}
                aria-label="Close load design dialog"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            <div className={modalClasses.searchWrap}>
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${modalClasses.searchIcon}`} />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title, category, product, tags, or ID..."
                    className={modalClasses.searchInput}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`${modalClasses.filterButtonBase} ${
                    showFilters || hasMLFilters
                      ? modalClasses.filterButtonActive
                      : modalClasses.filterButtonIdle
                  }`}
                  title="ML Filters"
                >
                  <FunnelIcon className="h-4 w-4" />
                </button>
              </div>

              {/* ML Filter dropdowns */}
              {showFilters && (
                <div className={useGalleryModalStyle ? 'mt-3 space-y-3 rounded-lg border border-stone-200 bg-[#fbfaf7] p-4' : 'mt-3 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4'}>
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className={useGalleryModalStyle ? 'h-3.5 w-3.5 text-[#8a6b1f]' : 'h-3.5 w-3.5 text-[#f3d48f]'} />
                    <span className={useGalleryModalStyle ? 'text-xs text-[#8a6b1f] uppercase tracking-wider font-medium' : 'text-xs text-[#f3d48f]/80 uppercase tracking-wider font-medium'}>ML Category Filters</span>
                    {hasMLFilters && (
                      <button
                        onClick={() => { setMlType(''); setMlStyle(''); setMlMotif(''); }}
                        className={useGalleryModalStyle ? 'ml-auto text-xs text-stone-500 hover:text-stone-950 underline underline-offset-2' : 'ml-auto text-xs text-white/50 hover:text-white/80 underline underline-offset-2'}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={mlType}
                      onChange={(e) => setMlType(e.target.value)}
                      className={useGalleryModalStyle
                        ? `rounded-lg border px-2 py-2 text-xs focus:border-[#9b7a24] focus:outline-none ${mlType ? 'border-[#9b7a24] bg-white text-[#8a6b1f]' : 'border-stone-300 bg-white text-stone-700'}`
                        : `rounded-lg border px-2 py-2 text-xs focus:border-[#d4af37]/60 focus:outline-none [&>option]:bg-neutral-900 [&>option]:text-white ${mlType ? 'border-[#d4af37]/50 bg-[#d4af37]/10 text-[#f3d48f]' : 'border-white/15 bg-black/40 text-white'}`}
                    >
                      <option value="">All Types</option>
                      {mlCategories.types.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <select
                      value={mlStyle}
                      onChange={(e) => setMlStyle(e.target.value)}
                      className={useGalleryModalStyle
                        ? `rounded-lg border px-2 py-2 text-xs focus:border-[#9b7a24] focus:outline-none ${mlStyle ? 'border-[#9b7a24] bg-white text-[#8a6b1f]' : 'border-stone-300 bg-white text-stone-700'}`
                        : `rounded-lg border px-2 py-2 text-xs focus:border-[#d4af37]/60 focus:outline-none [&>option]:bg-neutral-900 [&>option]:text-white ${mlStyle ? 'border-[#d4af37]/50 bg-[#d4af37]/10 text-[#f3d48f]' : 'border-white/15 bg-black/40 text-white'}`}
                    >
                      <option value="">All Styles</option>
                      {mlCategories.styles.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <select
                      value={mlMotif}
                      onChange={(e) => setMlMotif(e.target.value)}
                      className={useGalleryModalStyle
                        ? `rounded-lg border px-2 py-2 text-xs focus:border-[#9b7a24] focus:outline-none ${mlMotif ? 'border-[#9b7a24] bg-white text-[#8a6b1f]' : 'border-stone-300 bg-white text-stone-700'}`
                        : `rounded-lg border px-2 py-2 text-xs focus:border-[#d4af37]/60 focus:outline-none [&>option]:bg-neutral-900 [&>option]:text-white ${mlMotif ? 'border-[#d4af37]/50 bg-[#d4af37]/10 text-[#f3d48f]' : 'border-white/15 bg-black/40 text-white'}`}
                    >
                      <option value="">All Motifs</option>
                      {mlCategories.motifs.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className={modalClasses.content}>
              {error ? <p className={useGalleryModalStyle ? 'mb-3 text-sm text-red-700' : 'mb-3 text-sm text-red-300'}>{error}</p> : null}

              {/* Popular / Favorites drawer */}
              {favoriteDesigns.length > 0 && !search.trim() && (
                <div className={useGalleryModalStyle ? 'mb-3 rounded-lg border border-[#d8c487] bg-white shadow-sm' : 'mb-3 rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/5'}>
                  <button
                    onClick={() => toggleNode('popular')}
                    className={useGalleryModalStyle ? 'flex w-full items-center gap-2 px-4 py-3 text-left text-[#8a6b1f] cursor-pointer' : 'flex w-full items-center gap-2 px-4 py-3 text-left text-[#f3d48f] cursor-pointer'}
                  >
                    {expandedNodes.has('popular') ? (
                      <ChevronDownIcon className={useGalleryModalStyle ? 'h-4 w-4 text-[#8a6b1f]' : 'h-4 w-4 text-[#d4af37]/70'} />
                    ) : (
                      <ChevronRightIcon className={useGalleryModalStyle ? 'h-4 w-4 text-[#8a6b1f]' : 'h-4 w-4 text-[#d4af37]/70'} />
                    )}
                    <StarIconSolid className={useGalleryModalStyle ? 'h-4 w-4 text-[#8a6b1f]' : 'h-4 w-4 text-[#d4af37]'} />
                    <span className="flex-1 text-sm font-medium">Popular</span>
                    <span className={useGalleryModalStyle ? 'rounded-full border border-stone-200 bg-[#f7f5f0] px-2 py-0.5 text-xs text-stone-600' : 'rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-2 py-0.5 text-xs text-[#f3d48f]/80'}>
                      {favoriteDesigns.length}
                    </span>
                  </button>
                  {expandedNodes.has('popular') && (
                    <div className={useGalleryModalStyle ? 'border-t border-stone-100 p-4' : 'border-t border-[#d4af37]/20 p-4'}>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {favoriteDesigns.map((design) => {
                          const ts = Number(design.id);
                          const dateLabel = ts && ts >= 1e12
                            ? new Date(ts).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '';
                          return (
                            <div
                              key={design.id}
                              className={modalClasses.card}
                            >
                              {/* Thumbnail */}
                              <div className={modalClasses.thumb}>
                                {design.metadata.preview ? (
                                  <img
                                    src={getPopupPreviewSrc(design.id, design.metadata.preview)}
                                    alt={design.displayTitle}
                                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                                    loading="lazy"
                                    onError={(e) => {
                                      const img = e.currentTarget;
                                      const stage = parseInt(img.dataset.fallbackStage || '0', 10);
                                      if (stage === 0) {
                                        img.dataset.fallbackStage = '1';
                                        const legacySmall = getLegacySmallSrc(design.metadata.preview);
                                        if (legacySmall) { img.src = legacySmall; return; }
                                      }
                                      if (stage <= 1 && design.metadata.preview) {
                                        img.dataset.fallbackStage = '2';
                                        img.src = design.metadata.preview;
                                        return;
                                      }
                                      img.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <PhotoIcon className="h-8 w-8 text-white/15" />
                                  </div>
                                )}

                                {/* Hover: "Open Design" button */}
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
                                  <button
                                    onClick={() => handleLoadDesign(design.id)}
                                    disabled={loading}
                                    className={modalClasses.hoverAction}
                                  >
                                    Open Design
                                  </button>
                                </div>

                                {/* Localhost: favorite + open-in-new-tab (top-right) */}
                                {isLocalhost && (
                                  <div className="absolute right-1 top-1 flex gap-1 rounded-lg bg-black/70 p-0.5 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                                    <span
                                      role="button"
                                      onClick={(e) => { e.stopPropagation(); toggleFavorite(design.id); }}
                                      className="rounded p-1 text-[#d4af37] transition"
                                    >
                                      <StarIconSolid className="h-3.5 w-3.5" />
                                    </span>
                                    {design.metadata.preview && (
                                      <a
                                        href={design.metadata.preview}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        title="Open full image"
                                        className="rounded p-1 text-white/50 transition hover:text-white/80"
                                      >
                                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Card footer */}
                              <div className={modalClasses.cardFooter}>
                                <span className={modalClasses.cardTitle}>
                                  {design.displayTitle}
                                </span>
                                {dateLabel && (
                                  <span className={modalClasses.cardDate}>
                                    {dateLabel}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {categoryEntries.length === 0 ? (
                <p className={modalClasses.emptyText}>No matching designs found.</p>
              ) : (
                <div className="space-y-3">
                  {categoryEntries.map(([categorySlug, categoryNode]) => {
                    const catKey = `cat:${categorySlug}`;
                    const isCatExpanded = expandedNodes.has(catKey) || !!search.trim();
                    const designs = [...categoryNode.designs].sort((a, b) =>
                      a.displayTitle.localeCompare(b.displayTitle),
                    );

                    /** Derive a readable date from the 13-digit timestamp ID */
                    const formatDate = (id: string) => {
                      const ts = Number(id);
                      if (!ts || ts < 1e12) return '';
                      return new Date(ts).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
                    };

                    return (
                      <div key={categorySlug} className={modalClasses.categoryPanel}>
                        {/* Category header */}
                        <button
                          onClick={() => toggleNode(catKey)}
                          className={modalClasses.categoryHeader}
                        >
                          {isCatExpanded ? (
                            <ChevronDownIcon className={modalClasses.categoryChevronOpen} />
                          ) : (
                            <ChevronRightIcon className={modalClasses.categoryChevronClosed} />
                          )}
                          <span className="flex-1 text-sm font-medium">{categoryNode.categoryLabel}</span>
                          <span className={modalClasses.countPill}>
                            {designs.length}
                          </span>
                        </button>

                        {/* Expanded: thumbnail grid */}
                        {isCatExpanded && (
                          <div className={modalClasses.expandedPanel}>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {designs.map((design) => (
                                <div
                                  key={design.id}
                                  className={modalClasses.card}
                                >
                                  {/* Thumbnail */}
                                  <div className={modalClasses.thumb}>
                                    {design.metadata.preview ? (
                                      <img
                                        src={getPopupPreviewSrc(design.id, design.metadata.preview)}
                                        alt={design.displayTitle}
                                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                                        loading="lazy"
                                        onError={(e) => {
                                          const img = e.currentTarget;
                                          const stage = parseInt(img.dataset.fallbackStage || '0', 10);
                                          if (stage === 0) {
                                            img.dataset.fallbackStage = '1';
                                            const legacySmall = getLegacySmallSrc(design.metadata.preview);
                                            if (legacySmall) { img.src = legacySmall; return; }
                                          }
                                          if (stage <= 1 && design.metadata.preview) {
                                            img.dataset.fallbackStage = '2';
                                            img.src = design.metadata.preview;
                                            return;
                                          }
                                          img.style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <div className="flex h-full items-center justify-center">
                                        <PhotoIcon className="h-8 w-8 text-white/15" />
                                      </div>
                                    )}

                                    {/* Hover: "Open Design" button */}
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
                                      <button
                                        onClick={() => handleLoadDesign(design.id)}
                                        disabled={loading}
                                        className={modalClasses.hoverAction}
                                      >
                                        Open Design
                                      </button>
                                    </div>

                                    {/* Localhost: favorite + open-in-new-tab (top-right) */}
                                    {isLocalhost && (
                                      <div className="absolute right-1 top-1 flex gap-1 rounded-lg bg-black/70 p-0.5 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                                        <span
                                          role="button"
                                          onClick={(e) => { e.stopPropagation(); toggleFavorite(design.id); }}
                                          className={`rounded p-1 transition ${favoriteIds.has(design.id) ? 'text-[#d4af37]' : 'text-white/50 hover:text-[#d4af37]/70'}`}
                                        >
                                          {favoriteIds.has(design.id) ? <StarIconSolid className="h-3.5 w-3.5" /> : <StarIcon className="h-3.5 w-3.5" />}
                                        </span>
                                        {design.metadata.preview && (
                                          <a
                                            href={design.metadata.preview}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            title="Open full image"
                                            className="rounded p-1 text-white/50 transition hover:text-white/80"
                                          >
                                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                                          </a>
                                        )}
                                      </div>
                                    )}

                                    {/* Localhost: trash (bottom-left) */}
                                    {isLocalhost && (
                                      <div className="absolute bottom-1 left-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                        <span
                                          role="button"
                                          onClick={(e) => { e.stopPropagation(); hideDesign(design.id); }}
                                          title="Hide this design"
                                          className="flex rounded-md bg-black/70 p-1 text-white/40 backdrop-blur-sm transition hover:text-red-400"
                                        >
                                          <TrashIcon className="h-3.5 w-3.5" />
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Card footer */}
                                  <div className={modalClasses.cardFooter}>
                                    <span className={modalClasses.cardTitle}>
                                      {design.displayTitle}
                                    </span>
                                    <span className={modalClasses.cardDate}>
                                      {formatDate(design.id)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      );

  const buttonLabel = loading ? 'Loading...' : label;
  const buttonClassName =
    variant === 'menu'
      ? `inline-flex w-full items-center justify-start gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-left text-base font-light text-gray-200 transition-all hover:border-white/20 hover:bg-white/10 disabled:cursor-wait disabled:opacity-60 day:border-gray-300 day:bg-stone-50 day:text-gray-700 day:hover:bg-gray-100`
      : variant === 'nav'
        ? `inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-950 bg-stone-950 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition-colors hover:border-[#8a6b1f] hover:bg-[#8a6b1f] disabled:cursor-wait disabled:opacity-60`
        : `
          fixed right-4 top-4 z-[100]
          flex items-center gap-2 px-4 py-2.5
          rounded-lg border-2
          font-medium text-sm
          transition-all duration-200
          bg-black/50 border-amber-500/70 text-amber-100 hover:bg-amber-900/30 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer backdrop-blur-sm
          disabled:cursor-wait disabled:border-amber-500/40 disabled:text-amber-200/70
        `;

  return (
    <>
      {/* Full-screen loading overlay — shown while design is loading after modal closes */}
      {loading && !isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-white/30 border-t-white" />
            <div className="font-mono text-lg text-white">Loading design…</div>
          </div>
        </div>,
        document.body,
      )}
      <button
        onClick={openModal}
        disabled={loading}
        className={buttonClassName}
        aria-label={buttonLabel}
      >
        <DocumentArrowDownIcon className={`h-5 w-5 ${loading ? 'animate-bounce' : ''}`} aria-hidden="true" />
        <span>{buttonLabel}</span>
      </button>
      {modalContent}
    </>
  );
}
