'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { Motif } from '#/lib/db';
import { getMotifCategoryName } from '#/lib/motif-translations';

type MotifCategory = {
  id: string;
  name: string;
  description: string;
};

const motifCategories: MotifCategory[] = [
  {
    id: 'traditional',
    name: 'Traditional',
    description: 'Classic memorial motifs',
  },
  {
    id: 'religious',
    name: 'Religious',
    description: 'Faith-based symbols',
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Natural elements',
  },
];

export default function MotifSelectionGrid({ motifs }: { motifs: Motif[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const addMotif = useHeadstoneStore((s) => s.addMotif);
  const removeMotif = useHeadstoneStore((s) => s.removeMotif);

  const handleMotifToggle = (motif: Motif) => {
    const isSelected = selectedMotifs.some(m => m.svgPath === motif.src);
    if (isSelected) {
      const selectedMotif = selectedMotifs.find(m => m.svgPath === motif.src);
      if (selectedMotif) {
        removeMotif(selectedMotif.id);
      }
    } else {
      addMotif(motif.src);
    }
  };

  const filteredMotifs = motifs.filter((motif) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'traditional') return motif.traditional;
    // Add more category filtering as needed
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header Section */}
      <div className="border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
              Select Motifs
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Add decorative symbols to your memorial
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-white/5 bg-gray-900/30">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'border border-white/20 text-white hover:bg-white/10'
              }`}
            >
              All Motifs
            </button>
            {motifCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'border border-white/20 text-white hover:bg-white/10'
                }`}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Motifs Grid */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {filteredMotifs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-white">No motifs found</h3>
            <p className="mt-2 text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {filteredMotifs.length} motif{filteredMotifs.length !== 1 ? 's' : ''}
              </div>
              {selectedMotifs.length > 0 && (
                <div className="text-sm text-yellow-500 font-medium">
                  {selectedMotifs.length} selected
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {filteredMotifs.map((motif) => {
                const isSelected = selectedMotifs.some(m => m.svgPath === motif.src);
                return (
                  <button
                    key={motif.id}
                    onClick={() => handleMotifToggle(motif)}
                    className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all hover:scale-100 hover:shadow-2xl hover:shadow-white/10 ${
                      isSelected
                        ? 'border-yellow-500/70 bg-gradient-to-br from-yellow-900/30 to-sky-900/30 shadow-lg shadow-yellow-500/20'
                        : 'border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/60 hover:to-gray-800/60 hover:border-white/30'
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-slate-900 shadow-lg">
                        ✓ Added
                      </div>
                    )}
                    
                    {/* Motif Image */}
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-white/5 mb-4 flex items-center justify-center p-4">
                      <img
                        src={motif.img}
                        alt={getMotifCategoryName(motif.name)}
                        className="h-full w-full object-contain"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    {/* Motif Info */}
                    <div>
                      <h3 className="text-sm font-medium text-white text-center line-clamp-2 mb-2">
                        {getMotifCategoryName(motif.name)}
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <span>{isSelected ? 'Remove' : 'Add'}</span>
                        <svg
                          className="h-3 w-3 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={isSelected ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"}
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Category Info Cards (when category is selected) */}
      {selectedCategory !== 'all' && (
        <div className="border-t border-white/5 bg-gray-900/30">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            {motifCategories
              .filter((cat) => cat.id === selectedCategory)
              .map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 text-center"
                >
                  <h2 className="text-2xl font-serif font-light text-white mb-2">
                    {category.name}
                  </h2>
                  <p className="text-gray-300">{category.description}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
