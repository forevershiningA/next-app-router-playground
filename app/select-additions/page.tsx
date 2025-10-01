'use client';

import { Suspense } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function Page() {
  const catalog = useHeadstoneStore((s) => s.catalog);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const addAddition = useHeadstoneStore((s) => s.addAddition);
  const removeAddition = useHeadstoneStore((s) => s.removeAddition);

  if (!catalog) return <div>Loading...</div>;

  const additions = [
    ...catalog.product.additions,
    { id: 'B1134S', type: 'application', name: 'Applicazione Angelo' },
  ];

  return (
    <Suspense fallback={null}>
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-white">Select Additions</h1>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {additions.map((add) => {
            const isSelected = selectedAdditions.includes(add.id);
            return (
              <div key={add.id} className="relative">
                <div
                  className="cursor-pointer rounded-lg border border-gray-600 p-4 hover:bg-gray-700"
                  onClick={() => {
                    if (isSelected) {
                      removeAddition(add.id);
                    } else {
                      addAddition(add.id);
                    }
                  }}
                >
                  <h3 className="text-white">{add.name}</h3>
                  <p className="text-gray-400">{add.type}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 rounded bg-green-500 px-2 py-1 text-white">
                    Selected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Suspense>
  );
}
