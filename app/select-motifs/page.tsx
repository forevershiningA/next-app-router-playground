'use client';

import { Suspense } from 'react';
import { data } from '#/app/_internal/_data';
import { getMotifCategoryName } from '#/lib/motif-translations';

export default function Page() {
  const motifs = data.motifs;

  return (
    <Suspense fallback={null}>
      <div className="space-y-4 p-8">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-white">Browse Motifs</h1>
          <p className="mb-8 text-gray-400">
            Use the overlay panel to browse and select from {motifs.length} categories of decorative motifs
          </p>
        </div>

        {/* Category Preview Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {motifs.slice(0, 12).map((motif) => (
            <div
              key={motif.id}
              className="group relative overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50 p-4 transition hover:border-gray-600 hover:bg-gray-800"
            >
              <div className="mb-2 flex h-20 items-center justify-center">
                <img
                  src={motif.img}
                  alt={getMotifCategoryName(motif.name)}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-white truncate">
                  {getMotifCategoryName(motif.name)}
                </div>
                <div className="mt-1 flex flex-wrap justify-center gap-1">
                  {motif.traditional && (
                    <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] text-blue-300">
                      Traditional
                    </span>
                  )}
                  {motif.ss && (
                    <span className="rounded bg-gray-500/20 px-1.5 py-0.5 text-[10px] text-gray-300">
                      SS
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {Math.min(12, motifs.length)} of {motifs.length} categories. 
          Use the overlay panel to view all categories and motifs.
        </div>
      </div>
    </Suspense>
  );
}
