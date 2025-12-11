'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { Material } from '#/lib/db';

type MaterialCategory = {
  id: string;
  name: string;
  description: string;
};

const materialCategories: MaterialCategory[] = [
  {
    id: 'granite',
    name: 'Granite',
    description: 'Durable natural stone',
  },
  {
    id: 'marble',
    name: 'Marble',
    description: 'Elegant natural stone',
  },
  {
    id: 'bronze',
    name: 'Bronze',
    description: 'Classic metal finish',
  },
];

export default function MaterialSelectionGrid({ materials }: { materials: Material[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();
  const setHeadstoneMaterialUrl = useHeadstoneStore((s) => s.setHeadstoneMaterialUrl);
  const setBaseMaterialUrl = useHeadstoneStore((s) => s.setBaseMaterialUrl);
  const setIsMaterialChange = useHeadstoneStore((s) => s.setIsMaterialChange);
  const currentMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const selected = useHeadstoneStore((s) => s.selected);

  const handleMaterialSelect = (material: Material) => {
    const materialUrl = `/textures/forever/l/${material.image}`;
    setIsMaterialChange(true);
    // Apply material to headstone or base depending on what's selected
    if (selected === 'base') {
      setBaseMaterialUrl(materialUrl);
    } else {
      setHeadstoneMaterialUrl(materialUrl);
    }
    setTimeout(() => setIsMaterialChange(false), 100);
    // Navigate to select-size to show 3D preview with the new material
    router.push('/select-size');
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
              Select Your Material
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
              Choose from premium granite and marble in various colours and finishes. Each stone is selected for its durability, weather resistance, and lasting beauty. Consider typical cemetery regulations and care requirements when making your selection.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                  : 'border border-white/20 text-white hover:bg-white/10 hover:border-[#cfac6c]/30'
              }`}
            >
              All Materials
            </button>
            {materialCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                    : 'border border-white/20 text-white hover:bg-white/10 hover:border-[#cfac6c]/30'
                }`}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {filteredMaterials.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-white">No materials found</h3>
            <p className="mt-2 text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-400">
              Showing {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredMaterials.map((material) => {
                const materialUrl = `/textures/forever/l/${material.image}`;
                const isSelected = currentMaterialUrl === materialUrl;
                return (
                  <button
                    key={material.id}
                    onClick={() => handleMaterialSelect(material)}
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
                  {/* Material Image */}
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-white/5 mb-4 ring-1 ring-white/10">
                    <Image
                      src={`/textures/forever/l/${material.image}`}
                      alt={material.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#cfac6c]/0 to-[#cfac6c]/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>

                  {/* Material Info */}
                  <div>
                    <h3 className="text-base font-semibold text-white text-center line-clamp-2 mb-3 tracking-wide">
                      {material.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#cfac6c]/80 group-hover:text-[#cfac6c] transition-colors">
                      <span>View Material</span>
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

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-700/10 to-gray-800/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                </button>
              );
            })}
            </div>
          </>
        )}
      </div>

      {/* Category Info Cards (when category is selected) */}
      {selectedCategory !== 'all' && (
        <div className="border-t border-gray-800">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            {materialCategories
              .filter((cat) => cat.id === selectedCategory)
              .map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center"
                >
                  <h2 className="text-2xl font-serif font-light text-white mb-2">
                    {category.name}
                  </h2>
                  <p className="text-gray-400">{category.description}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
