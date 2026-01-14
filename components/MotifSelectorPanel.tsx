'use client';

import { useEffect, useState } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { getMotifCategoryName } from '#/lib/motif-translations';

type MotifCategory = {
  id: string | number;
  name: string;
  src: string;
  img?: string;
  traditional?: boolean;
};

type IndividualMotif = {
  path: string;
  name: string;
  category: string;
};

interface MotifSelectorPanelProps {
  motifs: MotifCategory[];
}

export default function MotifSelectorPanel({ motifs }: MotifSelectorPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<MotifCategory | null>(null);
  const [individualMotifs, setIndividualMotifs] = useState<IndividualMotif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const addMotif = useHeadstoneStore((s) => s.addMotif);
  const removeMotif = useHeadstoneStore((s) => s.removeMotif);

  useEffect(() => {
    if (!selectedCategory) {
      setIndividualMotifs([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/motifs/${selectedCategory.src}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setIndividualMotifs(data.motifs || []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Unable to load motifs for this category.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  const handleCategorySelect = (category: MotifCategory) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setIndividualMotifs([]);
    setError(null);
  };

  const handleMotifToggle = (motifPath: string) => {
    const existing = selectedMotifs.find((motif) => motif.svgPath === motifPath);
    if (existing) {
      removeMotif(existing.id);
      return;
    }
    addMotif(motifPath);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {!selectedCategory ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Browse motif categories</h3>
            <span className="text-xs text-white/50">{motifs.length} categories</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {motifs.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#161616] text-left transition-all hover:-translate-y-1 hover:border-[#D7B356]/60 hover:shadow-lg hover:shadow-[#D7B356]/10"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <img
                        src={category.img ?? '/ico/forever-transparent-logo.png'}
                        alt={getMotifCategoryName(category.name)}
                        className="max-h-full max-w-full object-contain filter brightness-0 invert"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="px-3 py-3">
                    <p className="text-xs font-medium text-white line-clamp-2 text-center">
                      {getMotifCategoryName(category.name)}
                    </p>
                  </div>
                </button>
              ))}
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
              {getMotifCategoryName(selectedCategory.name)}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Loading motifs…
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            ) : individualMotifs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-[#1F1F1F]/50 p-6 text-center text-sm text-gray-400">
                No motifs available in this category yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {individualMotifs.map((motif, index) => {
                  const isSelected = selectedMotifs.some((m) => m.svgPath === motif.path);
                  return (
                    <button
                      key={`${motif.path}-${index}`}
                      type="button"
                      onClick={() => handleMotifToggle(motif.path)}
                      className={`group flex flex-col overflow-hidden rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#D7B356] bg-[#2d2013] shadow-lg shadow-[#D7B356]/20'
                          : 'border-white/10 bg-[#161616] hover:-translate-y-1 hover:border-[#D7B356]/60 hover:shadow-lg hover:shadow-[#D7B356]/10'
                      }`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-800/40 to-gray-900/40">
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          <img
                            src={motif.path}
                            alt={motif.name}
                            className="max-h-full max-w-full object-contain filter brightness-0 invert"
                            loading="lazy"
                          />
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
