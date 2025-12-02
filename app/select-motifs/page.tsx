'use client';

import { Suspense } from 'react';
import { data } from '#/app/_internal/_data';
import MotifSelectionGrid from './_ui/MotifSelectionGrid';

export default function Page() {
  const motifs = data.motifs;

  return (
    <Suspense fallback={null}>
      <MotifSelectionGrid motifs={motifs} />
    </Suspense>
  );
}
