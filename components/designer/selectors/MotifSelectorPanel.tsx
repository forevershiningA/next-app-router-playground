'use client';

import { useMemo, useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import {
  useHeadstoneStore,
  type MotifCatalogItem,
} from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';
import {
  getMotifSvgPath,
  getMotifThumbnailPath,
  type ProductFormula,
} from '#/lib/motifs';
import { getMotifCategoryName } from '#/lib/motif-translations';
import { getMotifCategoryImage } from '#/lib/motif-category-image';
import { useMotifCategory } from '#/lib/use-motifs';

type MotifCategoryGroup = {
  id: string;
  name: string;
  previewUrl: string | null;
  category: string;
  motifs: MotifCatalogItem[];
  sourceIndex: number;
};

interface MotifSelectorPanelProps {
  motifs: MotifCatalogItem[];
  initialCategoryId?: string | null;
  onCategoryOpen?: (categoryId: string) => void;
}

const HIDDEN_MOTIF_CATEGORIES = new Set([
  'flower inserts',
  '1 colour motifs',
  '2 colour motifs',
]);
const AUSTRALIAN_FLORA_CATEGORY_IDS = new Set([
  'australianflora',
  'australianaflora',
  'ausflora',
]);

function isVisibleMotifCategory(name: string) {
  return !HIDDEN_MOTIF_CATEGORIES.has(
    getMotifCategoryName(name).toLowerCase(),
  );
}

function isAustralianFloraCategory(...categoryNames: string[]) {
  return categoryNames.some((name) =>
    AUSTRALIAN_FLORA_CATEGORY_IDS.has(
      name.toLowerCase().replace(/[^a-z0-9]+/g, ''),
    ),
  );
}

function toCssMaskUrl(path: string) {
  return `url("${path.replace(/"/g, '%22')}")`;
}

export default function MotifSelectorPanel({
  motifs,
  initialCategoryId = null,
  onCategoryOpen,
}: MotifSelectorPanelProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialCategoryId,
  );

  const categories = useMemo<MotifCategoryGroup[]>(() => {
    if (motifs.length === 0) {
      return data.motifs
        .map((motif, index) => ({
          id: String(motif.id),
          name: motif.name,
          previewUrl: motif.img ?? null,
          category: motif.src ?? motif.name,
          motifs: [],
          sourceIndex: index,
        }))
        .filter((category) => isVisibleMotifCategory(category.name));
    }

    const categoryMap = new Map<string, MotifCategoryGroup>();
    motifs.forEach((motif, index) => {
      const categoryId = motif.category ?? 'uncategorized';
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: motif.categoryName ?? categoryId,
          previewUrl: motif.previewUrl ?? motif.svgUrl ?? null,
          category: motif.category,
          motifs: [],
          sourceIndex: index,
        });
      }
      categoryMap.get(categoryId)!.motifs.push(motif);
    });
    // Return categories in the order they appear in the motifs array (preserves database sort_order)
    const seen = new Set<string>();
    return motifs
      .map((m) => m.category ?? 'uncategorized')
      .filter((cat) => {
        if (seen.has(cat)) return false;
        seen.add(cat);
        return true;
      })
      .map((cat) => categoryMap.get(cat)!)
      .filter(Boolean)
      .filter((category) => isVisibleMotifCategory(category.name));
  }, [motifs]);

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null;

  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const addMotif = useHeadstoneStore((s) => s.addMotif);
  const removeMotif = useHeadstoneStore((s) => s.removeMotif);
  const catalog = useHeadstoneStore((s) => s.catalog);

  // Check if product allows color (color="1")
  const allowsColor = catalog?.product?.color === '1';
  // Use catalog's default color for motif thumbnails so they match the 3D scene
  const motifPreviewColor = catalog?.product?.defaultColor || '#c99d44';
  const formula: ProductFormula = 'Laser';
  const shouldUseLazyMotifs = Boolean(selectedCategory && selectedCategory.motifs.length === 0);
  const {
    files: lazyMotifFiles,
    totalCount: lazyMotifTotalCount,
    hasMore: lazyMotifsHasMore,
    isLoading: lazyMotifsLoading,
    error: lazyMotifsError,
    loadMore: loadMoreLazyMotifs,
  } = useMotifCategory({
    categoryIndex: shouldUseLazyMotifs ? selectedCategory?.sourceIndex ?? -1 : -1,
    formula,
    initialLimit: 50,
    loadMoreIncrement: 50,
  });

  const individualMotifs = selectedCategory?.motifs ?? [];
  const isAustralianFlora = isAustralianFloraCategory(
    selectedCategory?.name ?? '',
    selectedCategory?.category ?? '',
  );

  // Styling tokens for category cards
  const categoryCardClass =
    'group flex flex-col overflow-hidden rounded-xl border text-left shadow-sm transition-all duration-200';
  const inactiveCategoryCardClass =
    'border-white/10 bg-[#161412] hover:-translate-y-0.5 hover:border-[#c49a45]/50 hover:bg-white/[0.03] day:border-[#dfd7ca] day:bg-white day:shadow-xs day:hover:border-[#9a742f]';
  const categoryPreviewClass =
    'relative aspect-[4/3] w-full overflow-hidden border-b border-white/10 bg-[#0c0b0a] day:border-[#dfd7ca] day:bg-[#f4efe6]';
  const categoryTitleClass =
    'line-clamp-2 text-center font-serif text-xs font-medium leading-snug text-white transition-colors group-hover:text-[#f0d89f] day:text-[#1a1714] day:group-hover:text-[#9a742f]';

  // Styling tokens for individual motif cards
  const motifCardClass =
    'group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border p-2.5 text-left shadow-xs transition-all duration-200';
  const inactiveMotifCardClass =
    'border-white/10 bg-[#161412] hover:-translate-y-0.5 hover:border-[#c49a45]/60 hover:bg-[#1f1c18] hover:shadow-md day:border-[#dfd7ca] day:bg-white day:shadow-xs day:hover:border-[#9a742f] day:hover:bg-white day:hover:shadow-md';
  const selectedMotifCardClass =
    'border-[#c49a45] bg-[#c49a45]/15 shadow-[0_0_0_1px_rgba(196,154,69,0.4)] ring-1 ring-[#c49a45]/50 day:border-[#9a742f] day:bg-[#9a742f]/10 day:ring-[#9a742f]/50';

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    onCategoryOpen?.(categoryId);
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
  };

  const handleMotifToggle = (motif: MotifCatalogItem) => {
    const svgPath = motif.svgUrl ?? motif.previewUrl;
    if (!svgPath) {
      return;
    }

    const existing = selectedMotifs.find(
      (selected) => selected.svgPath === svgPath,
    );
    if (existing) {
      removeMotif(existing.id);
      return;
    }
    addMotif(svgPath);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {!selectedCategory ? (
        <>
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-2.5 pb-24">
              {categories.map((category) => {
                const isFlora = isAustralianFloraCategory(
                  category.name,
                  category.category,
                );
                const categoryImgSrc = getMotifCategoryImage({
                  name: category.name,
                  category: category.category || category.id,
                  src: category.id,
                  previewUrl: category.previewUrl,
                });
                const categoryMaskSrc = isFlora
                  ? getMotifSvgPath('banksiarufa')
                  : categoryImgSrc;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category.id)}
                    className={`${categoryCardClass} ${inactiveCategoryCardClass}`}
                  >
                    <div className={categoryPreviewClass}>
                      <div className="absolute inset-0 flex items-center justify-center p-3">
                        {allowsColor ? (
                          <div
                            className="absolute inset-3 transition-transform duration-300 group-hover:scale-105"
                            style={{
                              backgroundColor: motifPreviewColor,
                              WebkitMaskImage: toCssMaskUrl(categoryMaskSrc),
                              maskImage: toCssMaskUrl(categoryMaskSrc),
                              WebkitMaskRepeat: 'no-repeat',
                              maskRepeat: 'no-repeat',
                              WebkitMaskSize: 'contain',
                              maskSize: 'contain',
                              WebkitMaskPosition: 'center',
                              maskPosition: 'center',
                            }}
                          />
                        ) : (
                          <img
                            src={categoryImgSrc}
                            alt={getMotifCategoryName(category.name)}
                            className="day:invert-0 max-h-full max-w-full object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-2">
                      <p className={categoryTitleClass}>
                        {getMotifCategoryName(category.name)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Category drill-down sticky header */}
          <div className="sticky top-0 z-10 -mx-1 -mt-1 flex shrink-0 items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#161412]/95 p-2 shadow-sm backdrop-blur-md day:border-[#dfd7ca] day:bg-white/95 day:shadow-xs">
            <button
              type="button"
              onClick={handleBackToCategories}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:bg-white/[0.06] hover:text-[#c49a45] day:text-[#6a6156] day:hover:bg-[#f7f4ee] day:hover:text-[#9a742f]"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              All Categories
            </button>
            <div className="flex items-center gap-2 pr-1">
              <span className="font-serif text-sm font-semibold text-white day:text-[#1a1714]">
                {getMotifCategoryName(selectedCategory?.name ?? '')}
              </span>
              <span className="rounded-md border border-[#c49a45]/30 bg-[#c49a45]/10 px-2 py-0.5 font-sans text-[11px] font-semibold tabular-nums text-[#f0d89f] day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#9a742f]">
                {lazyMotifTotalCount || individualMotifs.length}
              </span>
            </div>
          </div>

          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
            {shouldUseLazyMotifs ? (
              <div className="space-y-3 pb-24">
                <div className="flex items-center justify-between px-1 text-xs text-white/60 day:text-[#6a6156]">
                  <span>
                    Showing {lazyMotifFiles.length} of {lazyMotifTotalCount} motifs
                  </span>
                  {lazyMotifsLoading && (
                    <span className="flex items-center gap-1.5 text-xs text-[#c49a45] day:text-[#9a742f]">
                      <span className="h-1.5 w-1.5 animate-ping rounded-full bg-current" />
                      Loading...
                    </span>
                  )}
                </div>

                {lazyMotifsError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-200 day:border-red-200 day:bg-red-50 day:text-red-700">
                    Error loading motifs: {lazyMotifsError.message}
                  </div>
                )}

                {lazyMotifFiles.length === 0 && lazyMotifsLoading ? (
                  <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#161412] day:border-[#dfd7ca] day:bg-white">
                    <div
                      role="status"
                      aria-label="Loading motif thumbnails"
                      className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#c49a45] day:border-black/10 day:border-t-[#9a742f]"
                    />
                  </div>
                ) : lazyMotifFiles.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-[#161412] p-8 text-center text-xs text-white/50 day:border-[#dfd7ca] day:bg-white day:text-[#6a6156]">
                    No motifs available in this category yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5">
                    {lazyMotifFiles.map((fileName) => {
                      const svgPath = getMotifSvgPath(fileName);
                      const thumbnailPath = getMotifThumbnailPath(fileName);
                      const thumbnailMaskPath = isAustralianFlora
                        ? svgPath
                        : thumbnailPath;
                      const isSelected = selectedMotifs.some(
                        (m) => m.svgPath === svgPath,
                      );

                      return (
                        <button
                          key={fileName}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              const existing = selectedMotifs.find(
                                (selected) => selected.svgPath === svgPath,
                              );
                              if (existing) removeMotif(existing.id);
                              return;
                            }
                            addMotif(svgPath);
                          }}
                          className={`${motifCardClass} ${
                            isSelected ? selectedMotifCardClass : inactiveMotifCardClass
                          }`}
                        >
                          <div className="relative h-full w-full">
                            {allowsColor ? (
                              <div
                                className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                                style={{
                                  backgroundColor: motifPreviewColor,
                                  WebkitMaskImage: toCssMaskUrl(thumbnailMaskPath),
                                  maskImage: toCssMaskUrl(thumbnailMaskPath),
                                  WebkitMaskRepeat: 'no-repeat',
                                  maskRepeat: 'no-repeat',
                                  WebkitMaskSize: 'contain',
                                  maskSize: 'contain',
                                  WebkitMaskPosition: 'center',
                                  maskPosition: 'center',
                                }}
                              />
                            ) : (
                              <img
                                src={thumbnailPath}
                                alt={fileName}
                                className="day:invert-0 h-full w-full object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                            )}
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 rounded-full bg-[#c49a45] px-1.5 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-wider text-[#121110] shadow-sm day:bg-[#9a742f] day:text-white">
                              Added
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {lazyMotifsHasMore && (
                  <button
                    type="button"
                    onClick={loadMoreLazyMotifs}
                    disabled={lazyMotifsLoading}
                    className="w-full rounded-xl bg-[#c49a45] px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#121110] shadow-sm transition-all hover:bg-[#d5ad55] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {lazyMotifsLoading
                      ? 'Loading...'
                      : `Load more (${lazyMotifTotalCount - lazyMotifFiles.length} remaining)`}
                  </button>
                )}
              </div>
            ) : individualMotifs.length === 0 ? (
              <div className="col-span-3 rounded-xl border border-dashed border-white/10 bg-[#161412] p-8 text-center text-xs text-white/50 day:border-[#dfd7ca] day:bg-white day:text-[#6a6156]">
                No motifs available in this category yet.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 pb-24">
                {individualMotifs.map((motif, index) => {
                  const svgPath = motif.svgUrl ?? motif.previewUrl;
                  const isSelected = svgPath
                    ? selectedMotifs.some((m) => m.svgPath === svgPath)
                    : false;
                  const coverSrc =
                    svgPath || '/ico/forever-transparent-logo.png';

                  return (
                    <button
                      key={`${motif.id}-${index}`}
                      type="button"
                      onClick={() => svgPath && handleMotifToggle(motif)}
                      disabled={!svgPath}
                      className={`${motifCardClass} disabled:cursor-not-allowed ${
                        isSelected ? selectedMotifCardClass : inactiveMotifCardClass
                      }`}
                    >
                      <div className="relative h-full w-full">
                        {allowsColor && coverSrc ? (
                          <div
                            className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                            style={{
                              backgroundColor: motifPreviewColor,
                              WebkitMaskImage: toCssMaskUrl(coverSrc),
                              maskImage: toCssMaskUrl(coverSrc),
                              WebkitMaskRepeat: 'no-repeat',
                              maskRepeat: 'no-repeat',
                              WebkitMaskSize: 'contain',
                              maskSize: 'contain',
                              WebkitMaskPosition: 'center',
                              maskPosition: 'center',
                            }}
                          />
                        ) : coverSrc ? (
                          <img
                            src={coverSrc}
                            alt={motif.name}
                            className="day:invert-0 h-full w-full object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 rounded-full bg-[#c49a45] px-1.5 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-wider text-[#121110] shadow-sm day:bg-[#9a742f] day:text-white">
                          Added
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
