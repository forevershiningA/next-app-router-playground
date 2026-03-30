'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getAllSavedDesigns, type SavedDesignMetadata } from '#/lib/saved-designs-data';
import { loadDesignById } from '#/components/DefaultDesignLoader';
import { loadMLData, getMLCategories, type MLDesignEntry } from '#/lib/ml-search-service';

interface LoadDesignButtonProps {
  label?: string;
}

interface PickerTree {
  [productSlug: string]: {
    productLabel: string;
    categories: {
      [categorySlug: string]: {
        categoryLabel: string;
        designs: Array<{
          id: string;
          displayTitle: string;
          metadata: SavedDesignMetadata;
        }>;
      };
    };
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

function getPopupPreviewSrc(preview?: string): string | null {
  if (!preview) return null;
  // Vercel deploy excludes full screenshots via .vercelignore; prefer _small variants.
  return preview.replace(/\.(jpg|jpeg|png)$/i, '_small.jpg');
}

function buildTree(designs: SavedDesignMetadata[]): PickerTree {
  return designs.reduce<PickerTree>((acc, design) => {
    const productSlug = design.productSlug || 'uncategorized';
    const categorySlug = design.category || 'uncategorized';

    if (!acc[productSlug]) {
      acc[productSlug] = {
        productLabel: toLabel(productSlug),
        categories: {},
      };
    }

    if (!acc[productSlug].categories[categorySlug]) {
      acc[productSlug].categories[categorySlug] = {
        categoryLabel: toLabel(categorySlug),
        designs: [],
      };
    }

    acc[productSlug].categories[categorySlug].designs.push({
      id: design.id,
      displayTitle: buildDesignTitle(design.shapeName, design.slug),
      metadata: design,
    });
    return acc;
  }, {});
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

  const allDesigns = useMemo(() => getAllSavedDesigns(), []);

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

    // Text search
    const needle = search.trim().toLowerCase();
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
  }, [allDesigns, search, mlType, mlStyle, mlMotif, mlIndex]);

  const tree = useMemo(() => buildTree(filteredDesigns), [filteredDesigns]);
  const productEntries = useMemo(() => Object.entries(tree), [tree]);
  const totalCount = filteredDesigns.length;

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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-2xl border border-white/20 bg-[#15100d]/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Load Design</h2>
                <p className="text-sm text-white/70">{totalCount.toLocaleString()} designs available</p>
              </div>
              <button
                onClick={closeModal}
                disabled={loading}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                aria-label="Close load design dialog"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-white/10 px-5 py-4">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title, category, product, tags, or ID..."
                    className="w-full rounded-lg border border-white/15 bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`shrink-0 rounded-lg border p-2.5 transition ${
                    showFilters || hasMLFilters
                      ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                      : 'border-white/15 bg-black/30 text-white/50 hover:text-white/80'
                  }`}
                  title="ML Filters"
                >
                  <FunnelIcon className="h-4 w-4" />
                </button>
              </div>

              {/* ML Filter dropdowns */}
              {showFilters && (
                <div className="mt-3 space-y-3 rounded-lg border border-white/10 bg-black/30 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs text-amber-300/80 uppercase tracking-wider font-medium">ML Category Filters</span>
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
                      className="rounded-md border border-white/15 bg-black/40 px-2 py-2 text-xs text-white focus:border-white/40 focus:outline-none"
                    >
                      <option value="">All Types</option>
                      {mlCategories.types.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <select
                      value={mlStyle}
                      onChange={(e) => setMlStyle(e.target.value)}
                      className="rounded-md border border-white/15 bg-black/40 px-2 py-2 text-xs text-white focus:border-white/40 focus:outline-none"
                    >
                      <option value="">All Styles</option>
                      {mlCategories.styles.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <select
                      value={mlMotif}
                      onChange={(e) => setMlMotif(e.target.value)}
                      className="rounded-md border border-white/15 bg-black/40 px-2 py-2 text-xs text-white focus:border-white/40 focus:outline-none"
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

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {error ? <p className="mb-3 text-sm text-red-300">{error}</p> : null}

              {productEntries.length === 0 ? (
                <p className="text-sm text-white/70">No matching designs found.</p>
              ) : (
                <div className="space-y-3">
                  {productEntries.map(([productSlug, productNode]) => {
                    const productKey = `product:${productSlug}`;
                    const isProductExpanded = expandedNodes.has(productKey) || !!search.trim();
                    const categoryEntries = Object.entries(productNode.categories);
                    return (
                      <div key={productSlug} className="rounded-xl border border-white/10 bg-white/5">
                        <button
                          onClick={() => toggleNode(productKey)}
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-white"
                        >
                          {isProductExpanded ? (
                            <ChevronDownIcon className="h-4 w-4 text-white/70" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-white/70" />
                          )}
                          <span className="flex-1 text-sm font-medium">{productNode.productLabel}</span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">
                            {categoryEntries.length}
                          </span>
                        </button>

                        {isProductExpanded ? (
                          <div className="space-y-2 border-t border-white/10 px-3 py-3">
                            {categoryEntries.map(([categorySlug, categoryNode]) => {
                              const categoryKey = `category:${productSlug}/${categorySlug}`;
                              const isCategoryExpanded = expandedNodes.has(categoryKey) || !!search.trim();
                              const designs = [...categoryNode.designs].sort((a, b) =>
                                a.displayTitle.localeCompare(b.displayTitle),
                              );
                              return (
                                <div key={categoryKey} className="rounded-lg border border-white/10 bg-black/20">
                                  <button
                                    onClick={() => toggleNode(categoryKey)}
                                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-white/90"
                                  >
                                    {isCategoryExpanded ? (
                                      <ChevronDownIcon className="h-4 w-4 text-white/60" />
                                    ) : (
                                      <ChevronRightIcon className="h-4 w-4 text-white/60" />
                                    )}
                                    <span className="flex-1 text-sm">{categoryNode.categoryLabel}</span>
                                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">
                                      {designs.length}
                                    </span>
                                  </button>

                                  {isCategoryExpanded ? (
                                    <div className="space-y-1 border-t border-white/10 p-2">
                                      {designs.map((design) => (
                                          <button
                                          key={design.id}
                                          onClick={() => handleLoadDesign(design.id)}
                                          disabled={loading}
                                          className="w-full rounded-md border border-transparent bg-white/5 px-3 py-2 text-left text-sm text-white/90 transition hover:border-white/20 hover:bg-white/10 disabled:opacity-50"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/15 bg-black/30">
                                              {design.metadata.preview ? (
                                                <img
                                                  src={getPopupPreviewSrc(design.metadata.preview) || design.metadata.preview}
                                                  alt={`${design.displayTitle} thumbnail`}
                                                  className="h-full w-full object-cover"
                                                  loading="lazy"
                                                  onError={(e) => {
                                                    const img = e.currentTarget;
                                                    if (img.dataset.fallbackApplied === '1') {
                                                      img.style.display = 'none';
                                                      return;
                                                    }
                                                    img.dataset.fallbackApplied = '1';
                                                    img.src = design.metadata.preview as string;
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
                                                {(() => {
                                                  const ml = mlIndex.get(design.id);
                                                  return ml?.ml_motif ? (
                                                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50">
                                                      {ml.ml_motif}
                                                    </span>
                                                  ) : null;
                                                })()}
                                              </div>
                                            </div>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
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
