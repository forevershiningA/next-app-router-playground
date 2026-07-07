import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ShapeSelectionGrid from '#/app/select-shape/_ui/ShapeSelectionGrid';
import db from '#/lib/db';
import {
  buildSelectShapeMetadata,
  getDesignerProductBySlug,
} from '#/lib/designer-product-routes';

type ProductSelectShapePageProps = {
  params: Promise<{
    productSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductSelectShapePageProps): Promise<Metadata> {
  const { productSlug } = await params;
  const product = getDesignerProductBySlug(productSlug);
  return buildSelectShapeMetadata(product?.id ?? '');
}

export default async function ProductSelectShapePage({
  params,
}: ProductSelectShapePageProps) {
  const { productSlug } = await params;
  const product = getDesignerProductBySlug(productSlug);

  if (!product) {
    notFound();
  }

  const shapes = await db.shape.findMany({ limit: 100 });

  return (
    <Suspense fallback={null}>
      <ShapeSelectionGrid shapes={shapes} />
    </Suspense>
  );
}
