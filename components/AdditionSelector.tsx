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

  const findInstanceId = (additionId: string) =>
    selectedAdditions.find(
      (instanceId) => instanceId === additionId || instanceId.startsWith(`${additionId}_`)
    );

  const handleToggle = (addition: Addition) => {
    const existingInstance = findInstanceId(addition.id);
    
    if (existingInstance) {
      removeAddition(existingInstance);
      if (currentSelectedAdditionId === existingInstance) {
        setSelectedAdditionId(null);
        setActivePanel(null);
      }
      return;
    }

    // addAddition already sets selectedAdditionId and activePanel internally
    addAddition(addition.id);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 gap-1.5 rounded-lg border border-white/10 bg-[#0A0A0A] p-1 day:border-gray-200 day:bg-gray-100">
        {CATEGORY_FILTERS.map((filter) => {
          const isActive = category === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setCategory(filter.id)}
              className={`min-w-0 flex-1 rounded-md px-2.5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#D7B356] text-black shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white day:text-gray-500 day:hover:bg-white day:hover:text-gray-900'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 gap-2.5">
        {filteredAdditions.map((addition) => {
          const instanceId = findInstanceId(addition.id);
          const isSelected = Boolean(instanceId);
          const dirName = addition.file?.split('/')?.[0] || '';
          const imagePath = `/additions/${dirName}/${addition.image}`;

          return (
            <button
              key={addition.id}
              type="button"
              onClick={() => handleToggle(addition)}
              className={`group flex min-h-[198px] flex-col overflow-hidden rounded-lg border text-left shadow-lg shadow-black/15 transition-all ${
                isSelected
                  ? 'border-[#D7B356] bg-[#211A10] shadow-[#D7B356]/15 day:bg-amber-50'
                  : 'border-white/10 bg-[#171717] hover:-translate-y-0.5 hover:border-[#D7B356]/60 hover:bg-white/[0.06] day:border-gray-200 day:bg-white'
              }`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-white/10 bg-[#0A0A0A] day:border-gray-200 day:bg-gray-100">
                <Image
                  src={imagePath}
                  alt={addition.name}
                  fill
                  sizes="120px"
                  className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 rounded-full bg-[#D7B356] px-2 py-0.5 text-[10px] font-semibold text-black shadow-md">
                    Added
                  </div>
                )}
              </div>
              <div className="flex min-h-[74px] flex-1 flex-col justify-between gap-2 p-2.5">
                <span className="line-clamp-2 text-xs font-semibold leading-snug text-white day:text-gray-900">
                  {addition.name}
                </span>
                <span className="text-[11px] font-semibold text-[#D7B356]">
                  {isSelected ? 'Remove' : 'Add'} →
                </span>
              </div>
            </button>
          );
        })}

        {filteredAdditions.length === 0 && (
          <div className="col-span-2 rounded-lg border border-dashed border-white/10 bg-[#171717] p-6 text-center text-xs text-gray-400 day:border-gray-200 day:bg-gray-50 day:text-gray-500">
            No additions in this category yet.
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
