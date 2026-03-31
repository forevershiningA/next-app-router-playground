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
    <div className="flex h-full flex-col gap-3 p-3">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search emblems…"
        className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-violet-500 focus:outline-none"
      />

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {filtered.map((emblem) => (
            <button
              key={emblem.id}
              onClick={() => handleSelect(emblem)}
              className="group relative flex cursor-pointer flex-col items-center rounded-lg border border-white/10 bg-white/5 p-2 transition-colors hover:border-violet-500 hover:bg-white/10"
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
              <span className="mt-1 line-clamp-2 text-center text-[10px] leading-tight text-white/70 group-hover:text-white">
                {emblem.name}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-white/50">
            No emblems found for &ldquo;{search}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
