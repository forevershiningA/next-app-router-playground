import { Suspense } from 'react';
import db from '#/lib/db';
import ProductCard from '#/ui/product-card';

export default async function Page() {
  const shapes = await db.shape.findMany({ limit: 32 });

  return (
    <Suspense fallback={null}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {shapes.map((shape) => (
            <ProductCard key={shape.id} product={shape as any} type="shape" />
          ))}
        </div>
      </div>
    </Suspense>
  );
}
