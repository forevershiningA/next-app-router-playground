'use client';

import Image from 'next/image';
import { useHeadstoneStore, type FixingType } from '#/lib/headstone-store';

const FIXING_OPTIONS: Array<{
  id: FixingType;
  name: string;
  description: string;
  image: string;
}> = [
  {
    id: 'flat-back',
    name: 'Flat Back',
    description: 'Flat back for glue fixing',
    image: '/png/fixingsystem/fixing-flat-back.png',
  },
  {
    id: 'lugs-with-studs',
    name: 'Lugs with Studs',
    description: 'Rear lugs with studs for secure fixing',
    image: '/png/fixingsystem/fixing-lugs-with-studs.png',
  },
  {
    id: 'screws',
    name: 'Screws (visible from front)',
    description: 'Front-fixing screws visible on the plaque face',
    image: '/png/fixingsystem/fixing-screws.png',
  },
];

export default function FixingSelector() {
  const fixingType = useHeadstoneStore((s) => s.fixingType);
  const setFixingType = useHeadstoneStore((s) => s.setFixingType);

  return (
    <div className="grid grid-cols-2 gap-3">
      {FIXING_OPTIONS.map((option) => {
        const selected = fixingType === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setFixingType(option.id)}
            className={`group overflow-hidden rounded-xl border text-left transition-all ${
              selected
                ? 'day:bg-[#f8f1df] border-[#D7B356] bg-[#D7B356]/10 ring-2 ring-[#D7B356]/40'
                : 'day:border-gray-200 day:bg-white day:hover:border-[#D7B356]/60 day:hover:bg-[#faf7f0] border-white/10 bg-white/5 hover:border-[#D7B356]/60 hover:bg-white/10'
            }`}
            aria-pressed={selected}
          >
            <div className="relative aspect-[4/3] bg-white p-3">
              <Image
                src={option.image}
                alt={option.name}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100vw, 33vw"
                unoptimized
              />
            </div>
            <div className="p-3">
              <div
                className={`text-sm font-semibold ${
                  selected
                    ? 'day:text-[#9a6d0b] text-[#D7B356]'
                    : 'day:text-gray-900 text-white'
                }`}
              >
                {option.name}
              </div>
              <p className="day:text-gray-500 mt-1 text-xs leading-5 text-white/60">
                {option.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
