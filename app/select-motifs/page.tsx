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

  // Show category grid when on the /select-motifs page and no motif is actively being edited
  const showGrid = pathname === '/select-motifs' && selectedMotifId === null;

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
