'use client';

import React from 'react';
import SceneOverlayController from '#/components/SceneOverlayController';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { AdditionData } from '#/lib/xml-parser';

export default function Layout({ children }: { children: React.ReactNode }) {
  const catalog = useHeadstoneStore((s) => s.catalog);

  if (!catalog) return <div>Loading...</div>;

  const additions = catalog.product.additions;

  return (
    <div className="relative w-full">
      <SceneOverlayController section="additions" title="Select Additions">
        <div className="mb-3 text-sm leading-relaxed text-white/85">
          Choose additional features for the headstone.
        </div>
        <div className="grid max-h-[320px] grid-cols-3 gap-3 overflow-auto pr-1">
          {additions.map((add: AdditionData) => (
            <div key={add.id} className="text-white">
              {add.name} ({add.type})
            </div>
          ))}
        </div>
        {children}
      </SceneOverlayController>
    </div>
  );
}
