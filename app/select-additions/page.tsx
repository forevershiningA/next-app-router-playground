'use client';

import { Suspense } from 'react';
import { data } from '#/app/_internal/_data';
import AdditionSelectionGrid from './_ui/AdditionSelectionGrid';

export default function Page() {
  const additions = data.additions;

  return (
    <Suspense fallback={null}>
      <AdditionSelectionGrid additions={additions} />
    </Suspense>
  );
}
