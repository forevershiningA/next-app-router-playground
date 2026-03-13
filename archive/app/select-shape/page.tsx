import { Suspense } from 'react';
import ShapeSelectionGrid from './_ui/ShapeSelectionGrid';
import db from '#/lib/db';

export default async function Page() {
  const shapes = await db.shape.findMany({ limit: 100 });

  return (
    <Suspense fallback={null}>
      <ShapeSelectionGrid shapes={shapes} />
    </Suspense>
  );
}
