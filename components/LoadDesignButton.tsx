'use client';

import { useEffect, useMemo, useState } from 'react';
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

export default function LoadDesignButton({ label = 'Load Design' }: LoadDesignButtonProps) {
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

  // Get current product from store for filtering
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

  const filteredDesigns = useMemo(() => {
    let result = allDesigns;

    // Filter by current product when no search/ML filters are active
    const needle = search.trim().toLowerCase();
    if (!needle && !hasMLFilters && productId) {
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
  }, [allDesigns, search, mlType, mlStyle, mlMotif, mlIndex, hasMLFilters, productId]);

  const tree = useMemo(() => buildCategoryTree(filteredDesigns), [filteredDesigns]);
  const categoryEntries = useMemo(() => sortCategoryEntries(Object.entries(tree)), [tree]);
  const totalCount = filteredDesigns.length;

  const favoriteDesigns = useMemo(() => {
    if (favoriteIds.size === 0) return [];
    return allDesigns
      .filter((d) => favoriteIds.has(d.id))
      .map((d) => ({
        id: d.id,
        displayTitle: buildDesignTitle(d.shapeName, d.slug),
        metadata: d,
      }));
  }, [allDesigns, favoriteIds]);

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

  const modalContent = !isOpen
    ? null
    : createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="relative flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#d4af37]/35 bg-gradient-to-b from-[#191108]/95 via-[#120d07]/95 to-[#0a0704]/95 text-white shadow-[0_35px_90px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#d4af37]/18 via-[#d4af37]/6 to-transparent"
            />
            <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-7">
              <div>
                <p className="mb-2 inline-flex items-center rounded-full border border-[#d4af37]/45 bg-[#d4af37]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f3d48f]">
                  Design Gallery
                </p>
                <h2 className="text-2xl font-serif text-white md:text-[1.75rem]">Load Design</h2>
                <p className="mt-1 text-sm leading-relaxed text-white/70">
                  {totalCount.toLocaleString()} designs available
                  {productId && !search.trim() && !hasMLFilters && filteredDesigns.length > 0 && (
                    <span className="ml-1 text-[#f3d48f]">
                      · {filteredDesigns[0].productName}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={closeModal}
                disabled={loading}
                className="absolute right-4 top-4 rounded-full border border-white/25 bg-black/25 p-1.5 text-white/70 transition-colors hover:border-white/60 hover:text-white disabled:opacity-40 cursor-pointer"
                aria-label="Close load design dialog"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-white/10 px-6 py-4 md:px-7">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title, category, product, tags, or ID..."
                    className="w-full rounded-xl border border-white/15 bg-white/[0.03] py-3.5 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#d4af37]/50 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/25"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`shrink-0 rounded-xl border p-2.5 transition ${
                    showFilters || hasMLFilters
                      ? 'border-[#d4af37]/50 bg-[#d4af37]/15 text-[#f3d48f]'
                      : 'border-white/15 bg-white/[0.03] text-white/50 hover:text-white/80'
                  }`}
                  title="ML Filters"
                >
                  <FunnelIcon className="h-4 w-4" />
                </button>
              </div>

              {/* ML Filter dropdowns */}
              {showFilters && (
                <div className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="h-3.5 w-3.5 text-[#f3d48f]" />
                    <span className="text-xs text-[#f3d48f]/80 uppercase tracking-wider font-medium">ML Category Filters</span>
                    {hasMLFilters && (
                      <button
                        onClick={() => { setMlType(''); setMlStyle(''); setMlMotif(''); }}
                        className="ml-auto text-xs text-white/50 hover:text-white/80 underline underline-offset-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={mlType}
                      onChange={(e) => setMlType(e.target.value)}
                      className={`rounded-lg border px-2 py-2 text-xs focus:border-[#d4af37]/60 focus:outline-none [&>option]:bg-neutral-900 [&>option]:text-white ${mlType ? 'border-[#d4af37]/50 bg-[#d4af37]/10 text-[#f3d48f]' : 'border-white/15 bg-black/40 text-white'}`}
                    >
                      <option value="">All Types</option>
                      {mlCategories.types.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <select
                      value={mlStyle}
                      onChange={(e) => setMlStyle(e.target.value)}
                      className={`rounded-lg border px-2 py-2 text-xs focus:border-[#d4af37]/60 focus:outline-none [&>option]:bg-neutral-900 [&>option]:text-white ${mlStyle ? 'border-[#d4af37]/50 bg-[#d4af37]/10 text-[#f3d48f]' : 'border-white/15 bg-black/40 text-white'}`}
                    >
                      <option value="">All Styles</option>
                      {mlCategories.styles.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <select
                      value={mlMotif}
                      onChange={(e) => setMlMotif(e.target.value)}
                      className={`rounded-lg border px-2 py-2 text-xs focus:border-[#d4af37]/60 focus:outline-none [&>option]:bg-neutral-900 [&>option]:text-white ${mlMotif ? 'border-[#d4af37]/50 bg-[#d4af37]/10 text-[#f3d48f]' : 'border-white/15 bg-black/40 text-white'}`}
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

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 md:px-7">
              {error ? <p className="mb-3 text-sm text-red-300">{error}</p> : null}

              {/* Popular / Favorites drawer */}
              {favoriteDesigns.length > 0 && !search.trim() && (
                <div className="mb-3 rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/5">
                  <button
                    onClick={() => toggleNode('popular')}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-[#f3d48f] cursor-pointer"
                  >
                    {expandedNodes.has('popular') ? (
                      <ChevronDownIcon className="h-4 w-4 text-[#d4af37]/70" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-[#d4af37]/70" />
                    )}
                    <StarIconSolid className="h-4 w-4 text-[#d4af37]" />
                    <span className="flex-1 text-sm font-medium">Popular</span>
                    <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-2 py-0.5 text-xs text-[#f3d48f]/80">
                      {favoriteDesigns.length}
                    </span>
                  </button>
                  {expandedNodes.has('popular') && (
                    <div className="space-y-1 border-t border-[#d4af37]/20 p-2">
                      {favoriteDesigns.map((design) => (
                        <div key={design.id} className="flex items-center gap-1">
                          <button
                            onClick={() => handleLoadDesign(design.id)}
                            disabled={loading}
                            className="min-w-0 flex-1 rounded-xl border border-transparent bg-white/[0.03] px-3 py-2 text-left text-sm text-white/90 transition hover:border-[#d4af37]/30 hover:bg-white/[0.06] disabled:opacity-50 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#d4af37]/20 bg-[#cccccc]">
                                {design.metadata.preview ? (
                                  <img
                                    src={getPopupPreviewSrc(design.id, design.metadata.preview)}
                                    alt={`${design.displayTitle} thumbnail`}
                                    className="h-full w-full object-cover"
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
                                  <PhotoIcon className="h-5 w-5 text-white/40" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">{design.displayTitle}</div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-white/60">{design.id}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                          {isLocalhost && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(design.id);
                              }}
                              title="Remove from favorites"
                              className="shrink-0 rounded-full p-1.5 text-[#d4af37] transition hover:bg-[#d4af37]/20 cursor-pointer"
                            >
                              <StarIconSolid className="h-4 w-4" />
                            </button>
                          )}
                          {isLocalhost && design.metadata.preview && (
                            <a
                              href={design.metadata.preview}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="Open full image"
                              className="shrink-0 rounded p-1.5 text-white/30 transition hover:bg-white/10 hover:text-white/70"
                            >
                              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {categoryEntries.length === 0 ? (
                <p className="text-sm text-white/70">No matching designs found.</p>
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
                      <div key={categorySlug} className="rounded-2xl border border-white/10 bg-white/[0.03]">
                        {/* Category header */}
                        <button
                          onClick={() => toggleNode(catKey)}
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-white cursor-pointer"
                        >
                          {isCatExpanded ? (
                            <ChevronDownIcon className="h-4 w-4 text-[#d4af37]/70" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-white/50" />
                          )}
                          <span className="flex-1 text-sm font-medium">{categoryNode.categoryLabel}</span>
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs text-white/70">
                            {designs.length}
                          </span>
                        </button>

                        {/* Expanded: thumbnail grid */}
                        {isCatExpanded && (
                          <div className="border-t border-white/10 p-4">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {designs.map((design) => (
                                <div
                                  key={design.id}
                                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25 transition-all duration-300 hover:border-[#d4af37]/30 hover:shadow-lg hover:shadow-black/40"
                                >
                                  {/* Thumbnail */}
                                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#cccccc]">
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
                                        className="pointer-events-auto rounded-full border-2 border-[#d4af37] bg-black px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-lg backdrop-blur-sm transition hover:bg-[#d4af37]/25 disabled:opacity-50 cursor-pointer"
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
                                  <div className="px-3 py-2">
                                    <span className="block truncate text-xs font-medium text-white/90">
                                      {design.displayTitle}
                                    </span>
                                    <span className="mt-0.5 block text-[10px] text-white/35">
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

  return (
    <>
      <button
        onClick={openModal}
        disabled={loading}
        className="
          fixed right-4 top-4 z-[100]
          flex items-center gap-2 px-4 py-2.5
          rounded-lg border-2
          font-medium text-sm
          transition-all duration-200
          bg-black/50 border-amber-500/70 text-amber-100 hover:bg-amber-900/30 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer backdrop-blur-sm
          disabled:cursor-wait disabled:border-amber-500/40 disabled:text-amber-200/70
        "
        aria-label={buttonLabel}
      >
        <DocumentArrowDownIcon className={`h-5 w-5 ${loading ? 'animate-bounce' : ''}`} aria-hidden="true" />
        <span>{buttonLabel}</span>
      </button>
      {modalContent}
    </>
  );
}
