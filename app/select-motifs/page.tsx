'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { data } from '#/app/_internal/_data';
import MotifSelectionGrid from './_ui/MotifSelectionGrid';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function Page() {
  const motifs = data.motifs;
  const pathname = usePathname();
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const catalog = useHeadstoneStore((s) => s.catalog);

  // Show category grid only when:
  // 1. We're on the /select-motifs page
  // 2. No motif is selected
  // 3. Canvas is not visible (catalog is null)
  const showGrid = pathname === '/select-motifs' && selectedMotifId === null && !catalog;

  return (
    <>
      {showGrid && (
        <Suspense fallback={null}>
          <MotifSelectionGrid 
            motifs={motifs}
          />
        </Suspense>
      )}
    </>
  );
}
