'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { getMotifCategoryName } from '#/lib/motif-translations';
import Loader from '#/ui/loader';

type Motif = {
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

type MotifSelectionGridProps = {
  motifs: Motif[];
};

export default function MotifSelectionGrid({ motifs }: MotifSelectionGridProps) {
  const [selectedCategoryMotif, setSelectedCategoryMotif] = useState<Motif | null>(null);
  const [individualMotifs, setIndividualMotifs] = useState<IndividualMotif[]>([]);
  const [loading, setLoading] = useState(false);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const addMotif = useHeadstoneStore((s) => s.addMotif);
  const removeMotif = useHeadstoneStore((s) => s.removeMotif);

  // Load individual motifs from a category folder
  useEffect(() => {
    if (selectedCategoryMotif) {
      setLoading(true);
      // Fetch SVG files from the category folder
      fetch(`/api/motifs/${selectedCategoryMotif.src}`)
        .then((res) => res.json())
        .then((data) => {
          setIndividualMotifs(data.motifs || []);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [selectedCategoryMotif]);

  const handleCategoryClick = (motif: Motif) => {
    setSelectedCategoryMotif(motif);
  };

  const handleBackToCategories = () => {
    setSelectedCategoryMotif(null);
    setIndividualMotifs([]);
  };

  const handleIndividualMotifToggle = (motifPath: string) => {
    const isSelected = selectedMotifs.some(m => m.svgPath === motifPath);
    if (isSelected) {
      const selectedMotif = selectedMotifs.find(m => m.svgPath === motifPath);
      if (selectedMotif) {
        removeMotif(selectedMotif.id);
      }
    } else {
      addMotif(motifPath);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
              {selectedCategoryMotif ? getMotifCategoryName(selectedCategoryMotif.name) : 'Select Motifs'}
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              {selectedCategoryMotif ? 'Choose a motif to add to your memorial' : 'Add decorative symbols to your memorial'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter / Back Button */}
      {selectedCategoryMotif ? (
        <div className="border-b border-gray-800">
          <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
            <div className="flex justify-center">
              <button
                onClick={handleBackToCategories}
                className="rounded-full px-6 py-3 text-sm font-medium transition-all border border-white/20 text-white hover:bg-white/10 hover:border-[#cfac6c]/30"
              >
                ← Back to Categories
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Motifs Grid */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Show Category Grid */}
        {!selectedCategoryMotif && (
          <>
            <div className="mb-6 text-sm text-gray-400">
              Showing {motifs.length} categor{motifs.length !== 1 ? 'ies' : 'y'}
            </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {motifs.map((motif) => (
                    <button
                      key={motif.id}
                      onClick={() => handleCategoryClick(motif)}
                      className="group relative overflow-hidden rounded-2xl border p-6 text-left transition-all hover:scale-100 hover:shadow-2xl hover:shadow-[#cfac6c]/10 border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/60 hover:to-gray-800/60 hover:border-[#cfac6c]/30"
                    >
                      {/* Motif Image */}
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-white/5 mb-4 flex items-center justify-center p-4">
                        <img
                          src={motif.img}
                          alt={getMotifCategoryName(motif.name)}
                          className="object-contain max-h-full max-w-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>

                      {/* Motif Info */}
                      <div>
                        <h3 className="text-base font-medium text-white text-center line-clamp-2 mb-2">
                          {getMotifCategoryName(motif.name)}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                          <span>Browse</span>
                          <svg
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Show Individual Motifs from Selected Category */}
            {selectedCategoryMotif && (
              <>
                {loading ? (
              <div className="py-20 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Loader className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-medium text-white">Loading motifs...</h3>
              </div>
            ) : individualMotifs.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-6xl mb-4">📂</div>
                <h3 className="text-xl font-medium text-white">No motifs found in this category</h3>
                <p className="mt-2 text-gray-400">This category may be empty or unavailable</p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm text-gray-400">
                  Showing {individualMotifs.length} motif{individualMotifs.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {/* Return to Categories Card - First Position */}
                  <button
                    onClick={handleBackToCategories}
                    className="group relative overflow-hidden rounded-2xl border p-6 text-left transition-all hover:scale-100 hover:shadow-2xl hover:shadow-[#cfac6c]/10 border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/60 hover:to-gray-800/60 hover:border-[#cfac6c]/30"
                  >
                    {/* Icon */}
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-white/5 mb-4 flex items-center justify-center p-4">
                      <svg
                        className="w-16 h-16 text-gray-400 group-hover:text-[#cfac6c] transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 17l-5-5m0 0l5-5m-5 5h12"
                        />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="text-base font-medium text-white text-center line-clamp-2 mb-2">
                        Return to Categories
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <span>Go Back</span>
                        <svg
                          className="h-4 w-4 transition-transform group-hover:-translate-x-1"
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
                      </div>
                    </div>
                  </button>

                  {/* Individual Motifs */}
                  {individualMotifs.map((motif, index) => {
                    const isSelected = selectedMotifs.some(m => m.svgPath === motif.path);
                    return (
                      <button
                        key={index}
                        onClick={() => handleIndividualMotifToggle(motif.path)}
                        className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all hover:scale-100 hover:shadow-2xl hover:shadow-[#cfac6c]/10 ${
                          isSelected
                            ? 'border-[#cfac6c]/70 bg-gradient-to-br from-[#cfac6c]/20 to-gray-900/50 shadow-lg shadow-[#cfac6c]/20'
                            : 'border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/60 hover:to-gray-800/60 hover:border-[#cfac6c]/30'
                        }`}
                      >
                        {/* Selected Badge */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 z-10 rounded-full bg-[#cfac6c] px-3 py-1 text-xs font-semibold text-slate-900 shadow-lg">
                            Selected
                          </div>
                        )}
                        
                        {/* Motif Image */}
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-white/5 mb-4 flex items-center justify-center p-4">
                          <img
                            src={motif.path}
                            alt={motif.name}
                            className="object-contain max-h-full max-w-full"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>

                        {/* Motif Info */}
                        <div>
                          <h3 className="text-base font-medium text-white text-center line-clamp-2 mb-2">
                            {motif.name}
                          </h3>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <span>{isSelected ? 'Selected' : 'Add Motif'}</span>
                            <svg
                              className="h-4 w-4 transition-transform group-hover:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={isSelected ? "M5 13l4 4L19 7" : "M9 5l7 7-7 7"}
                              />
                            </svg>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
