'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { Addition } from '#/lib/db';
import DesignerPageHeading from '#/components/designer/DesignerPageHeading';

type AdditionCategory = { id: string; name: string; description: string };

const additionCategories: AdditionCategory[] = [
  { id: 'statue', name: 'Statues', description: '3D memorial statues' },
  { id: 'vase', name: 'Vases', description: 'Memorial vases' },
  {
    id: 'application',
    name: 'Applications',
    description: 'Decorative applications',
  },
];

export default function AdditionSelectionGrid({
  additions,
}: {
  additions: Addition[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const addAddition = useHeadstoneStore((s) => s.addAddition);
  const removeAddition = useHeadstoneStore((s) => s.removeAddition);

  const findInstanceId = (additionId: string) =>
    selectedAdditions.find(
      (instanceId) =>
        instanceId === additionId || instanceId.startsWith(`${additionId}_`),
    );

  const handleAdditionToggle = (addition: Addition) => {
    const existingInstanceId = findInstanceId(addition.id);
    if (existingInstanceId) {
      removeAddition(existingInstanceId);
    } else {
      addAddition(addition.id);
    }
  };

  const filteredAdditions = additions.filter((addition) => {
    const matchesCategory =
      selectedCategory === 'all' || addition.type === selectedCategory;
    return matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header Section */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#cfac6c]/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center">
            <DesignerPageHeading sectionTitle="Select Additions" />
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-300">
              Add decorative elements like statues, vases, and applications to
              enhance your memorial
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="relative border-b border-white/5 bg-gray-900/30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#cfac6c]/3 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                  : 'border border-white/20 text-white hover:border-[#cfac6c]/30 hover:bg-white/10'
              }`}
            >
              All Additions
            </button>
            {additionCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                    : 'border border-white/20 text-white hover:border-[#cfac6c]/30 hover:bg-white/10'
                }`}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Additions Grid */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {filteredAdditions.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="text-xl font-medium text-white">
              No additions found
            </h3>
            <p className="mt-2 text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {filteredAdditions.length} addition
                {filteredAdditions.length !== 1 ? 's' : ''}
              </div>
              {selectedAdditions.length > 0 && (
                <div className="text-sm font-medium text-[#cfac6c]">
                  {selectedAdditions.length} selected
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredAdditions.map((addition) => {
                const instanceId = findInstanceId(addition.id);
                const isSelected = Boolean(instanceId);
                // Extract directory from file path (e.g., "207/Art207.glb" -> "207")
                const dirName = addition.file?.split('/')[0] || '';
                const imagePath = `/additions/${dirName}/${addition.image}`;

                return (
                  <button
                    key={addition.id}
                    onClick={() => handleAdditionToggle(addition)}
                    className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 bg-[#1A1A1A] transition-all ${
                      isSelected
                        ? 'border-[#cfac6c] shadow-lg shadow-[#cfac6c]/20'
                        : 'border-white/10 hover:-translate-y-1 hover:border-[#cfac6c]/60 hover:shadow-lg hover:shadow-[#cfac6c]/10'
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 rounded-full bg-[#cfac6c] px-3 py-1 text-xs font-semibold text-slate-900 shadow-lg">
                        ✓ Added
                      </div>
                    )}

                    {/* Addition Image - Square aspect ratio */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-800/30 to-gray-900/30">
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <Image
                          src={imagePath}
                          alt={addition.name}
                          width={200}
                          height={200}
                          className="object-contain transition-transform group-hover:scale-105"
                        />
                      </div>
                    </div>

                    {/* Addition Info - with padding and flexbox */}
                    <div className="flex flex-col p-4">
                      <h3 className="mb-2 line-clamp-2 text-center text-sm font-medium text-white">
                        {addition.name}
                      </h3>
                      {/* Call to Action - always reserves space, visible on hover, anchored to bottom */}
                      <div className="mt-auto h-5">
                        <span className="text-sm font-semibold text-[#cfac6c] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          {isSelected ? 'Remove →' : 'Add →'}
                        </span>
                      </div>
                    </div>
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
            {additionCategories
              .filter((cat) => cat.id === selectedCategory)
              .map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 text-center"
                >
                  <h2 className="mb-2 font-serif text-2xl font-light text-white">
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
