'use client';

import { useMemo, useState } from 'react';
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
  const cardClass =
    'group flex flex-col overflow-hidden rounded-lg border text-left shadow-lg shadow-black/15 transition-all';
  const inactiveCardClass =
    'border-white/10 bg-[#171717] hover:-translate-y-0.5 hover:border-[#D7B356]/60 hover:bg-white/[0.06] day:border-gray-200 day:bg-white';
  const selectedCardClass =
    'border-[#D7B356] bg-[#211A10] shadow-[#D7B356]/15 day:bg-amber-50';
  const previewClass =
    'relative aspect-[4/3] w-full overflow-hidden border-b border-white/10 bg-[#0A0A0A] day:border-gray-200 day:bg-gray-100';
  const titleClass =
    'line-clamp-2 text-xs font-semibold leading-snug text-white day:text-gray-900';

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
                const isAustralianFlora = isAustralianFloraCategory(
                  category.name,
                  category.category,
                );
                const categoryImgSrc = getMotifCategoryImage({
                  name: category.name,
                  category: category.category || category.id,
                  src: category.id,
                  previewUrl: category.previewUrl,
                });
                const categoryMaskSrc = isAustralianFlora
                  ? getMotifSvgPath('banksiarufa')
                  : categoryImgSrc;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category.id)}
                    className={`${cardClass} ${inactiveCardClass}`}
                  >
                    <div className={previewClass}>
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        {allowsColor ? (
                          <div
                            className="absolute inset-4"
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
                            className="day:invert-0 max-h-full max-w-full object-contain brightness-0 invert"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-2.5">
                      <p className={titleClass}>
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
          <div className="day:border-gray-200 day:bg-gray-100 flex shrink-0 items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0A0A0A] p-1">
            <button
              type="button"
              onClick={handleBackToCategories}
              className="day:text-gray-500 day:hover:bg-white day:hover:text-gray-900 inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <span aria-hidden="true">←</span>
              Back
            </button>
            <div className="day:text-gray-900 min-w-0 truncate px-2 text-right text-xs font-semibold text-white">
              {getMotifCategoryName(selectedCategory?.name ?? '')}
            </div>
          </div>

          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
            {shouldUseLazyMotifs ? (
              <div className="space-y-2 pb-24">
                <div className="flex items-center justify-between text-xs text-white/60 day:text-gray-500">
                  <span>
                    Showing {lazyMotifFiles.length} of {lazyMotifTotalCount} motifs
                  </span>
                  {lazyMotifsLoading && <span className="animate-pulse">Loading...</span>}
                </div>
                {lazyMotifsError && (
                  <div className="rounded-lg bg-red-500/20 p-3 text-xs text-red-200 day:text-red-700">
                    Error loading motifs: {lazyMotifsError.message}
                  </div>
                )}
                {lazyMotifFiles.length === 0 && lazyMotifsLoading ? (
                  <div className="day:border-gray-200 day:bg-gray-50 flex min-h-48 items-center justify-center rounded-lg border border-dashed border-white/10 bg-[#171717]">
                    <div
                      role="status"
                      aria-label="Loading motif thumbnails"
                      className="day:border-gray-300 day:border-t-[#a87618] h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-[#D7B356]"
                    />
                  </div>
                ) : lazyMotifFiles.length === 0 ? (
                  <div className="day:border-gray-200 day:bg-gray-50 day:text-gray-500 rounded-lg border border-dashed border-white/10 bg-[#171717] p-6 text-center text-xs text-gray-400">
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
                          className={`${cardClass} ${
                            isSelected ? selectedCardClass : inactiveCardClass
                          }`}
                        >
                          <div className={previewClass}>
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                              {allowsColor ? (
                                <div
                                  className="absolute inset-4"
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
                                  className="day:invert-0 max-h-full max-w-full object-contain brightness-0 invert"
                                  loading="lazy"
                                />
                              )}
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 rounded-full bg-[#D7B356] px-2 py-0.5 text-[10px] font-semibold text-black shadow-md">
                                Added
                              </div>
                            )}
                          </div>
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
                    className="w-full rounded-lg bg-[#D7B356] px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-[#e1c46f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {lazyMotifsLoading ? 'Loading...' : `Load more (${lazyMotifTotalCount - lazyMotifFiles.length} remaining)`}
                  </button>
                )}
              </div>
            ) : individualMotifs.length === 0 ? (
              <div className="day:border-gray-200 day:bg-gray-50 day:text-gray-500 rounded-lg border border-dashed border-white/10 bg-[#171717] p-6 text-center text-xs text-gray-400">
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
                      className={`${cardClass} disabled:cursor-not-allowed ${
                        isSelected ? selectedCardClass : inactiveCardClass
                      }`}
                    >
                      <div className={previewClass}>
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          {allowsColor && coverSrc ? (
                            <div
                              className="absolute inset-4"
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
                              className="day:invert-0 max-h-full max-w-full object-contain brightness-0 invert"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 rounded-full bg-[#D7B356] px-2 py-0.5 text-[10px] font-semibold text-black shadow-md">
                            Added
                          </div>
                        )}
                      </div>
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
