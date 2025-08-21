import { Suspense } from 'react';
import db from '#/lib/db';
import ProductCard from '#/ui/product-card';

export default async function Page() {
  const materials = await db.material.findMany({ limit: 32 });

  return (
    <Suspense fallback={null}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {materials.map((mat) => (
            <ProductCard key={mat.id} product={mat as any} type="material" />
          ))}
        </div>
      </div>
    </Suspense>
  );
}
