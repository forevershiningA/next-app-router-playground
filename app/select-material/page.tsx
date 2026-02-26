import { Suspense } from 'react';
import type { Metadata } from 'next';
import MaterialSelectionGrid from './_ui/MaterialSelectionGrid';
import { catalog } from '#/lib/catalog-db';
import { mapMaterialRecord } from '#/lib/catalog-mappers';

export const metadata: Metadata = {
  title: 'Granite & Marble for Headstones – Colours & Finishes | Forever Shining',
  description: 'Choose from premium granite and marble in various colours and finishes. Each stone selected for durability and lasting beauty.',
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  try {
    const rawMaterials = await catalog.materials.findMany({ where: { isActive: true }, limit: 200 });
    const materials = rawMaterials.map(mapMaterialRecord);

    return (
      <Suspense fallback={null}>
        <MaterialSelectionGrid materials={materials} />
      </Suspense>
    );
  } catch (error) {
    console.error('Failed to load materials:', error);
    return (
      <div className="p-8 text-center">
        <p>Unable to load materials. Please try again later.</p>
      </div>
    );
  }
}
