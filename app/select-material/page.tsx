'use cache';

import db from '#/lib/db';
import { ProductCard } from '#/ui/product-card';

export default async function Page() {
  const materials = db.material.findMany({ limit: 32 });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {materials.map((material) => (
          <ProductCard key={material.id} product={material} type={"material"} />
        ))}
      </div>
    </div>
  );
}
