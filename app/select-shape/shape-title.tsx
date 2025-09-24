'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';

type Product = { id: string; name: string; image: string; category: string };

const toKebab = (s: string) =>
  (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

export default function ShapeTitle({
  products,
  initialName,
}: {
  products: Product[];
  initialName?: string | null;
}) {
  const { shapeUrl, setShapeUrl } = useHeadstoneStore();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get slug from URL (query first, then last path segment)
  const rawSlug = useMemo(() => {
    const q = searchParams.get('slug');
    if (q) return q;
    const seg = pathname?.split('/').filter(Boolean).pop() ?? null;
    // ignore base route itself
    if (seg && seg !== 'select-shape') return seg;
    return null;
  }, [searchParams, pathname]);

  // Map slug → product
  const slugMatch = useMemo(() => {
    if (!rawSlug) return null;
    const lc = decodeURIComponent(rawSlug).toLowerCase().trim();
    return (
      products.find((p) => {
        const n = p.name.toLowerCase().trim();
        return lc === n || lc === toKebab(n);
      }) || null
    );
  }, [rawSlug, products]);

  // Keep the store aligned with the URL when a slug is present
  useEffect(() => {
    if (!slugMatch) return;
    const desired = `/shapes/headstones/${slugMatch.image}`;
    if ((shapeUrl ?? '').toLowerCase() !== desired.toLowerCase()) {
      setShapeUrl(desired);
    }
  }, [slugMatch, shapeUrl, setShapeUrl]);

  const name = useMemo(() => {
    // 1) On slugged routes, the slug is the source of truth
    if (slugMatch) return slugMatch.name;

    // 2) Otherwise, fall back to store URL → product
    if (shapeUrl) {
      const file = (shapeUrl.split('/').pop() || shapeUrl).toLowerCase();
      const byImage =
        products.find((p) => p.image.toLowerCase() === file) ||
        products.find(
          (p) =>
            ('/shapes/headstones/' + p.image).toLowerCase() ===
            shapeUrl.toLowerCase(),
        );
      if (byImage) return byImage.name;
    }

    // 3) Fallback
    return initialName ?? null;
  }, [slugMatch, shapeUrl, products, initialName]);

  return (
    <h1 className="text-xl font-semibold text-gray-300">
      Select Shape{name ? <span> - {name}</span> : null}
    </h1>
  );
}
