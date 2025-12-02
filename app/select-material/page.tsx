import { Suspense } from 'react';
import type { Metadata } from 'next';
import MaterialSelectionGrid from './_ui/MaterialSelectionGrid';
import db from '#/lib/db';

export const metadata: Metadata = {
  title: 'Granite & Marble for Headstones – Colours & Finishes | Forever Shining',
  description: 'Choose from premium granite and marble in various colours and finishes. Each stone selected for durability and lasting beauty.',
};

export default async function Page() {
  const materials = await db.material.findMany({ limit: 100 });

  return (
    <Suspense fallback={null}>
      <MaterialSelectionGrid materials={materials} />
    </Suspense>
  );
}
