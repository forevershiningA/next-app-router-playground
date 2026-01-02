'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useHeadstoneStore } from '#/lib/headstone-store';

type Addition = {
  id: string;
  name: string;
  image: string;
  type: string;
  file?: string | null;
};

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'statue', label: 'Statues' },
  { id: 'vase', label: 'Vases' },
  { id: 'application', label: 'Applications' },
] as const;

type Props = {
  additions: Addition[];
};

export default function AdditionSelector({ additions }: Props) {
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]['id']>('all');
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const currentSelectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const addAddition = useHeadstoneStore((s) => s.addAddition);
  const removeAddition = useHeadstoneStore((s) => s.removeAddition);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  const filteredAdditions = useMemo(() => {
    if (category === 'all') return additions;
    return additions.filter((addition) => addition.type === category);
  }, [additions, category]);

  const handleToggle = (addition: Addition) => {
    if (selectedAdditions.includes(addition.id)) {
      removeAddition(addition.id);
      if (currentSelectedAdditionId === addition.id) {
        setSelectedAdditionId(null);
        setActivePanel(null);
      }
      return;
    }

    addAddition(addition.id);
    setSelectedAdditionId(addition.id);
    setActivePanel('addition');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {CATEGORY_FILTERS.map((filter) => {
          const isActive = category === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setCategory(filter.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                isActive
                  ? 'bg-[#D7B356] text-black shadow-lg shadow-[#D7B356]/30'
                  : 'bg-[#1F1F1F] text-gray-200 hover:bg-[#2A2A2A]'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-2 custom-scrollbar">
        {filteredAdditions.map((addition) => {
          const isSelected = selectedAdditions.includes(addition.id);
          const dirName = addition.file?.split('/')?.[0] || '';
          const imagePath = `/additions/${dirName}/${addition.image}`;

          return (
            <button
              key={addition.id}
              type="button"
              onClick={() => handleToggle(addition)}
              className={`flex flex-col rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-[#D7B356] bg-[#2d2013] shadow-lg shadow-[#D7B356]/20'
                  : 'border-white/10 bg-[#161616] hover:border-[#D7B356]/60'
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-[#0f0f0f]">
                <Image
                  src={imagePath}
                  alt={addition.name}
                  fill
                  sizes="120px"
                  className="object-contain p-3"
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 rounded-full bg-[#D7B356] px-2 py-0.5 text-[10px] font-semibold text-black">
                    Added
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 px-2 py-2">
                <span className="text-xs font-medium text-white leading-tight line-clamp-2">
                  {addition.name}
                </span>
                <span className="text-[11px] text-[#D7B356] font-semibold">
                  {isSelected ? 'Remove' : 'Add'} →
                </span>
              </div>
            </button>
          );
        })}

        {filteredAdditions.length === 0 && (
          <div className="col-span-2 rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-xs text-gray-400">
            No additions in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
