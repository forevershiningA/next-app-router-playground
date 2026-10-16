'use client';

import { useCallback } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';

export type DesignerNavigationItemStatus =
  | 'incomplete'
  | 'complete'
  | 'available';

export function useDesignerNavigationItemStatus() {
  const productId = useHeadstoneStore((state) => state.productId);
  const shapeUrl = useHeadstoneStore((state) => state.shapeUrl);
  const materialUrl = useHeadstoneStore((state) => state.materialUrl);
  const widthMm = useHeadstoneStore((state) => state.widthMm);
  const heightMm = useHeadstoneStore((state) => state.heightMm);
  const inscriptions = useHeadstoneStore((state) => state.inscriptions);
  const additions = useHeadstoneStore((state) => state.selectedAdditions);
  const motifs = useHeadstoneStore((state) => state.selectedMotifs);
  const emblems = useHeadstoneStore((state) => state.selectedEmblems);

  const getItemStatus = useCallback(
    (slug: string): DesignerNavigationItemStatus => {
      if (slug === 'select-product')
        return productId ? 'complete' : 'incomplete';
      if (slug === 'select-shape') return shapeUrl ? 'complete' : 'incomplete';
      if (slug === 'select-material')
        return materialUrl ? 'complete' : 'incomplete';
      if (slug === 'select-size' && widthMm > 0 && heightMm > 0)
        return 'complete';
      if (slug === 'inscriptions' && inscriptions.length > 0) return 'complete';
      if (slug === 'select-additions' && additions.length > 0)
        return 'complete';
      if (slug === 'select-motifs' && motifs.length > 0) return 'complete';
      if (slug === 'select-emblems' && emblems.length > 0) return 'complete';
      return 'available';
    },
    [
      productId,
      shapeUrl,
      materialUrl,
      widthMm,
      heightMm,
      inscriptions.length,
      additions.length,
      motifs.length,
      emblems.length,
    ],
  );

  const getItemCount = useCallback(
    (slug: string): number | null => {
      if (slug === 'inscriptions') return inscriptions.length || null;
      if (slug === 'select-additions') return additions.length || null;
      if (slug === 'select-motifs') return motifs.length || null;
      if (slug === 'select-emblems') return emblems.length || null;
      return null;
    },
    [inscriptions.length, additions.length, motifs.length, emblems.length],
  );

  return { getItemStatus, getItemCount };
}
