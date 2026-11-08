'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { useMobileNavStore } from '#/lib/mobile-nav-store';
import { formatDimensionTriplet } from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';

type Addition = {
  id: string;
  name: string;
  image: string;
  type: string;
  file?: string | null;
  sizes?: Array<{
    width: number;
    height: number;
    depth: number;
    availability: boolean;
  }>;
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

function getAdditionDisplayName(name: string) {
  if (/^Applicazione\s+Preghiera/i.test(name)) {
    return 'Praying Hands Motif';
  }

  return name;
}

export default function AdditionSelector({ additions }: Props) {
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]['id']>('all');
  const unitSystem = useUnitSystem();
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const currentSelectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const addAddition = useHeadstoneStore((s) => s.addAddition);
  const removeAddition = useHeadstoneStore((s) => s.removeAddition);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const setMobileNavOpen = useMobileNavStore((s) => s.setOpen);

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
    if (addition.type === 'statue' && window.innerWidth < 768) {
      setMobileNavOpen(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Category Filters */}
      <div className="grid shrink-0 grid-cols-4 gap-1 rounded-xl border border-white/10 bg-[#161412] p-1.5 day:border-[#dfd7ca] day:bg-[#f7f4ee]">
        {CATEGORY_FILTERS.map((filter) => {
          const isActive = category === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setCategory(filter.id)}
              className={`min-w-0 overflow-hidden rounded-lg px-2 py-2 font-serif text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#c49a45] text-[#121110] shadow-sm day:bg-[#9a742f] day:text-white'
                  : 'text-white/70 hover:bg-white/[0.06] hover:text-white day:text-[#6a6156] day:hover:bg-white day:hover:text-[#1a1714]'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-2.5">
          {filteredAdditions.map((addition) => {
            const instanceId = findInstanceId(addition.id);
            const isSelected = Boolean(instanceId);
            const dirName = addition.file?.split('/')?.[0] || '';
            const imagePath = `/additions/${dirName}/${addition.image}`;
            const displayName = getAdditionDisplayName(addition.name);
            const size =
              addition.sizes?.find((variant) => variant.availability) ??
              addition.sizes?.[0];
            const dimensions = size
              ? formatDimensionTriplet(
                  size.width,
                  size.height,
                  size.depth,
                  unitSystem,
                )
              : null;

            return (
              <button
                key={addition.id}
                type="button"
                onClick={() => handleToggle(addition)}
                className={`group flex min-h-[210px] flex-col overflow-hidden rounded-xl border text-left shadow-sm transition-all duration-200 ${
                  isSelected
                    ? 'border-[#c49a45] bg-[#c49a45]/10 shadow-[0_0_0_1px_rgba(196,154,69,0.3)] day:border-[#9a742f] day:bg-[#9a742f]/10'
                    : 'border-white/10 bg-[#161412] hover:-translate-y-0.5 hover:border-[#c49a45]/50 hover:bg-white/[0.03] day:border-[#dfd7ca] day:bg-white day:shadow-xs day:hover:border-[#9a742f]'
                }`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-white/10 bg-[#0c0b0a] day:border-[#dfd7ca] day:bg-[#f4efe6]">
                  <Image
                    src={imagePath}
                    alt={displayName}
                    fill
                    sizes="120px"
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 rounded-full bg-[#c49a45] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#121110] shadow-sm day:bg-[#9a742f] day:text-white">
                      Added
                    </div>
                  )}
                </div>
                <div className="flex min-h-[74px] flex-1 flex-col justify-between gap-2 p-3 text-center">
                  <div className="space-y-1">
                    <span className="block font-serif text-xs font-medium leading-snug break-words text-white transition-colors group-hover:text-[#f0d89f] day:text-[#1a1714] day:group-hover:text-[#9a742f]">
                      {displayName}
                    </span>
                    {dimensions && (
                      <span className="block font-sans text-[10px] tabular-nums text-white/50 day:text-[#6a6156]">
                        {dimensions}
                      </span>
                    )}
                  </div>
                  <span className="block border-t border-white/5 pt-1.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-[#c49a45] day:border-[#dfd7ca]/50 day:text-[#9a742f]">
                    {isSelected ? '✓ Added · Remove' : 'Add →'}
                  </span>
                </div>
              </button>
            );
          })}

          {filteredAdditions.length === 0 && (
            <div className="col-span-2 rounded-xl border border-dashed border-white/10 bg-[#161412] p-8 text-center text-xs text-white/50 day:border-[#dfd7ca] day:bg-white day:text-[#6a6156]">
              No additions in this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
