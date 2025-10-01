// app/select-material/[section]/page.tsx
import { Suspense } from 'react';
import { Boundary } from '#/ui/boundary';
import { ProductCard } from '#/ui/product-card';
import db from '#/lib/db';

type RouteParams = { section: string };

// Turn "curved-gable" → "Curved Gable"
function formatSlug(section: string) {
  return section
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const materials = await db.material.findMany({ limit: 32 });

  return (
    <Suspense fallback={null}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {materials.map((material) => (
            <ProductCard
              key={material.id}
              product={material}
              type={'material'}
            />
          ))}
        </div>
      </div>
    </Suspense>
  );
}

// (Optional) If you set the <title> per shape:
export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { section } = await params; // ← also await here
  const title = `Select Material - ${formatSlug(section)}`;
  return { title };
}
