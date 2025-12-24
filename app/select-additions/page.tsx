'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { data } from '#/app/_internal/_data';
import AdditionSelectionGrid from './_ui/AdditionSelectionGrid';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function Page() {
  const additions = data.additions;
  const pathname = usePathname();
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);

  // Show category grid when on the /select-additions page and no addition is actively being edited
  const showGrid = pathname === '/select-additions' && !selectedAdditionId;

  return (
    <>
      {showGrid && (
        <Suspense fallback={null}>
          <AdditionSelectionGrid additions={additions} />
        </Suspense>
      )}
    </>
  );
}
