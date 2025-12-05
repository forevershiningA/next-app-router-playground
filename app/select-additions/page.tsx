'use client';

import { Suspense } from 'react';
import { data } from '#/app/_internal/_data';
import AdditionSelectionGrid from './_ui/AdditionSelectionGrid';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function Page() {
  const additions = data.additions;
  const catalog = useHeadstoneStore((s) => s.catalog);

  // Hide addition categories when Canvas is visible (catalog exists)
  if (catalog) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <AdditionSelectionGrid additions={additions} />
    </Suspense>
  );
}
