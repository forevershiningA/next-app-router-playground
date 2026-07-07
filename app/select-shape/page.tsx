import { Suspense } from 'react';
import type { Metadata } from 'next';
import ShapeSelectionGrid from './_ui/ShapeSelectionGrid';
import db from '#/lib/db';
import { buildSelectShapeMetadata } from '#/lib/designer-product-routes';

type SelectShapePageProps = {
  searchParams?: Promise<{
    productId?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: SelectShapePageProps): Promise<Metadata> {
  const params = await searchParams;
  return buildSelectShapeMetadata(params?.productId ?? '');
}

export default async function Page() {
  const shapes = await db.shape.findMany({ limit: 100 });

  return (
    <Suspense fallback={null}>
      <ShapeSelectionGrid shapes={shapes} />
    </Suspense>
  );
}
