'use client';

import { useMemo, useState } from 'react';
import { useHeadstoneStore, type MotifCatalogItem } from '#/lib/headstone-store';
import { getMotifCategoryName } from '#/lib/motif-translations';
import { getMotifCategoryImage } from '#/lib/motif-category-image';

type MotifCategoryGroup = {
  id: string;
  name: string;
  previewUrl: string | null;
  category: string;
  motifs: MotifCatalogItem[];
};

interface MotifSelectorPanelProps {
  motifs: MotifCatalogItem[];
}

export default function MotifSelectorPanel({ motifs }: MotifSelectorPanelProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const categories = useMemo<MotifCategoryGroup[]>(() => {
    const categoryMap = new Map<string, MotifCategoryGroup>();
    motifs.forEach((motif) => {
      const categoryId = motif.category ?? 'uncategorized';
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: motif.categoryName ?? categoryId,
          previewUrl: motif.previewUrl ?? motif.svgUrl ?? null,
          category: motif.category,
          motifs: [],
        });
      }
      categoryMap.get(categoryId)!.motifs.push(motif);
    });
    // Return categories in the order they appear in the motifs array (preserves database sort_order)
    const seen = new Set<string>();
    return motifs
      .map(m => m.category ?? 'uncategorized')
      .filter(cat => {
        if (seen.has(cat)) return false;
        seen.add(cat);
        return true;
      })
      .map(cat => categoryMap.get(cat)!)
      .filter(Boolean);
  }, [motifs]);

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId) ?? null;
  const individualMotifs = selectedCategory?.motifs ?? [];

  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const addMotif = useHeadstoneStore((s) => s.addMotif);
  const removeMotif = useHeadstoneStore((s) => s.removeMotif);
  const catalog = useHeadstoneStore((s) => s.catalog);
  
  // Check if product allows color (color="1")
  const allowsColor = catalog?.product?.color === '1';
  // Use catalog's default color for motif thumbnails so they match the 3D scene
  const motifPreviewColor = catalog?.product?.defaultColor || '#c99d44';
  const cardClass =
    'group flex min-h-[176px] flex-col overflow-hidden rounded-lg border text-left shadow-lg shadow-black/15 transition-all';
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
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
  };

  const handleMotifToggle = (motif: MotifCatalogItem) => {
    const svgPath = motif.svgUrl ?? motif.previewUrl;
    if (!svgPath) {
      return;
    }

    const existing = selectedMotifs.find((selected) => selected.svgPath === svgPath);
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
          <div className="flex shrink-0 items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-2.5 day:border-gray-200 day:bg-gray-100">
            <h3 className="text-sm font-semibold text-white day:text-gray-900">Browse categories</h3>
            <span className="shrink-0 text-xs font-semibold text-white/45 day:text-gray-500">{categories.length}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((category) => {
                const categoryImgSrc = getMotifCategoryImage({
                  name: category.name,
                  category: category.category || category.id,
                  src: category.id,
                  previewUrl: category.previewUrl,
                });
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
                            WebkitMaskImage: `url(${categoryImgSrc})`,
                            maskImage: `url(${categoryImgSrc})`,
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
                          className="max-h-full max-w-full object-contain brightness-0 invert"
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex min-h-[64px] flex-1 flex-col justify-between gap-2 p-2.5">
                    <p className={titleClass}>
                      {getMotifCategoryName(category.name)}
                    </p>
                    <p className="text-[11px] font-semibold text-[#D7B356]">
                      Browse
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
          <div className="flex shrink-0 items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0A0A0A] p-1 day:border-gray-200 day:bg-gray-100">
            <button
              type="button"
              onClick={handleBackToCategories}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white day:text-gray-500 day:hover:bg-white day:hover:text-gray-900"
            >
              <span aria-hidden="true">←</span>
              Back
            </button>
            <div className="min-w-0 truncate px-2 text-right text-xs font-semibold text-white day:text-gray-900">
              {getMotifCategoryName(selectedCategory?.name ?? '')}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {individualMotifs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/10 bg-[#171717] p-6 text-center text-xs text-gray-400 day:border-gray-200 day:bg-gray-50 day:text-gray-500">
                No motifs available in this category yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {individualMotifs.map((motif, index) => {
                  const svgPath = motif.svgUrl ?? motif.previewUrl;
                  const isSelected = svgPath ? selectedMotifs.some((m) => m.svgPath === svgPath) : false;
                  const coverSrc = svgPath || '/ico/forever-transparent-logo.png';

                  return (
                    <button
                      key={`${motif.id}-${index}`}
                      type="button"
                      onClick={() => svgPath && handleMotifToggle(motif)}
                      disabled={!svgPath}
                      className={`${cardClass} disabled:cursor-not-allowed ${
                        isSelected
                          ? selectedCardClass
                          : inactiveCardClass
                      }`}
                    >
                      <div className={previewClass}>
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          {allowsColor && coverSrc ? (
                            <div
                              className="absolute inset-4"
                              style={{
                                backgroundColor: motifPreviewColor,
                                WebkitMaskImage: `url(${coverSrc})`,
                                maskImage: `url(${coverSrc})`,
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
                              className="max-h-full max-w-full object-contain brightness-0 invert"
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
                      <div className="flex min-h-[64px] flex-1 flex-col justify-between gap-2 p-2.5">
                        <p className={titleClass}>
                          {motif.name}
                        </p>
                        <p className="text-[11px] font-semibold text-[#D7B356]">
                          {isSelected ? 'Remove' : 'Add'}
                        </p>
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
