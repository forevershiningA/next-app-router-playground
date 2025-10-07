'use cache';

import db from '#/lib/db';
import { Boundary } from '#/ui/boundary';
import { ProductCard } from '#/ui/product-card';

export default async function Page() {
  const products = db.product.findMany({ limit: 9 });

  return (
    <Boundary label="page.tsx">
      <div className="flex flex-col gap-4"></div>
    </Boundary>
  );
}
