'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { EmblemEntry } from '#/app/_internal/_emblems-loader';

export default function EmblemSelectionGrid({
  emblems,
}: {
  emblems: EmblemEntry[];
}) {
  const addEmblem = useHeadstoneStore((s) => s.addEmblem);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return emblems;
    const q = search.toLowerCase();
    return emblems.filter(
      (e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q),
    );
  }, [emblems, search]);

  const handleSelect = (emblem: EmblemEntry) => {
    addEmblem(emblem.id, emblem.imageUrl);
  };

  return (
    <div className="day:text-gray-900 flex h-full flex-col gap-3 p-3 text-white">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search emblems…"
        className="day:border-gray-300 day:bg-gray-50 day:text-gray-900 day:placeholder:text-gray-400 day:focus:border-[#b88a32] w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#D7B356] focus:ring-2 focus:ring-[#D7B356]/20 focus:outline-none"
      />

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {filtered.map((emblem) => (
            <button
              key={emblem.id}
              onClick={() => handleSelect(emblem)}
              className="day:border-gray-200 day:bg-gray-50 day:hover:border-[#c99a3e] day:hover:bg-[#f6efe3] group relative flex cursor-pointer flex-col items-center rounded-lg border border-white/10 bg-white/5 p-2 transition-colors hover:border-[#D7B356] hover:bg-white/10 focus-visible:border-[#D7B356] focus-visible:ring-2 focus-visible:ring-[#D7B356]/30 focus-visible:outline-none"
              title={emblem.name}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded">
                <Image
                  src={emblem.thumbnailUrl}
                  alt={emblem.name}
                  fill
                  sizes="80px"
                  className="object-contain"
                  loading="lazy"
                  unoptimized
                />
              </div>
              <span className="day:text-gray-600 day:group-hover:text-gray-950 mt-1 line-clamp-2 text-center text-[10px] leading-tight text-white/70 group-hover:text-white">
                {emblem.name}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="day:text-gray-500 py-8 text-center text-sm text-white/50">
            No emblems found for &ldquo;{search}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
