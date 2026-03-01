'use client';

import { useMemo, useState } from 'react';
import { useHeadstoneStore, type MotifCatalogItem } from '#/lib/headstone-store';
import { getMotifCategoryName } from '#/lib/motif-translations';
import { data } from '#/app/_internal/_data';

type MotifCategoryGroup = {
  id: string;
  name: string;
  previewUrl: string | null;
  motifs: MotifCatalogItem[];
};

interface MotifSelectorPanelProps {
  motifs: MotifCatalogItem[];
}

const BRONZE_HEX = '#CD7F32';

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
    <div className="flex h-full flex-col gap-4">
      {!selectedCategory ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Browse motif categories</h3>
            <span className="text-xs text-white/50">{categories.length} categories</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 p-1">
              {categories.map((category) => {
                const categoryImgSrc = category.previewUrl || '/ico/forever-transparent-logo.png';
                return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  className="group flex flex-col overflow-hidden rounded-2xl border-2 border-white/10 bg-[#161616] text-left transition-all hover:-translate-y-1 hover:border-[#D7B356]/60 hover:shadow-lg hover:shadow-[#D7B356]/10 cursor-pointer"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      {allowsColor ? (
                        <div
                          className="absolute inset-4"
                          style={{
                            backgroundColor: BRONZE_HEX,
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
                          className="max-h-full max-w-full object-contain filter brightness-0 invert"
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>
                  <div className="px-3 py-3">
                    <p className="text-xs font-medium text-white line-clamp-2 text-center">
                      {getMotifCategoryName(category.name)}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-[#D7B356] text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      Browse →
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBackToCategories}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              <span className="text-base">←</span>
              Back to categories
            </button>
            <div className="text-sm text-white/70">
              {getMotifCategoryName(selectedCategory?.name ?? '')}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {individualMotifs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-[#1F1F1F]/50 p-6 text-center text-sm text-gray-400">
                No motifs available in this category yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 p-1">
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
                      className={`group flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-all cursor-pointer disabled:cursor-not-allowed ${
                        isSelected
                          ? 'border-[#D7B356] bg-[#2d2013] shadow-lg shadow-[#D7B356]/20'
                          : 'border-white/10 bg-[#161616] hover:-translate-y-1 hover:border-[#D7B356]/60 hover:shadow-lg hover:shadow-[#D7B356]/10'
                      }`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-800/40 to-gray-900/40">
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          {allowsColor && coverSrc ? (
                            <div
                              className="absolute inset-4"
                              style={{
                                backgroundColor: BRONZE_HEX,
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
                              className="max-h-full max-w-full object-contain filter brightness-0 invert"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        {isSelected && (
                          <div className="absolute right-2 top-2 rounded-full bg-[#D7B356] px-2 py-0.5 text-[10px] font-semibold text-black">
                            Added
                          </div>
                        )}
                      </div>
                      <div className="px-3 py-3">
                        <p className="text-xs font-medium text-white line-clamp-2 text-center">
                          {motif.name}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-[#D7B356] text-center">
                          {isSelected ? 'Remove' : 'Add'} →
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
