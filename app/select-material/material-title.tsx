'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';

type Material = { id: string; name: string; image: string; category: string };

const toKebab = (s: string) =>
  (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

export default function MaterialTitle({
  materials,
  initialName,
}: {
  materials: Material[];
  initialName?: string | null;
}) {
  const { materialUrl, setMaterialUrl } = useHeadstoneStore();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Prefer ?slug=..., else last path segment (ignore base route)
  const rawSlug = useMemo(() => {
    const q = searchParams.get('slug');
    if (q) return q;
    const seg = pathname?.split('/').filter(Boolean).pop() ?? null;
    if (seg && seg !== 'select-material') return seg;
    return null;
  }, [searchParams, pathname]);

  // slug -> material
  const slugMatch = useMemo(() => {
    if (!rawSlug) return null;
    const lc = decodeURIComponent(rawSlug).toLowerCase().trim();
    return (
      materials.find((m) => {
        const n = m.name.toLowerCase().trim();
        return lc === n || lc === toKebab(n);
      }) ?? null
    );
  }, [rawSlug, materials]);

  // Keep store aligned with URL on material routes
  useEffect(() => {
    if (!slugMatch) return;
    const desired = `/materials/${slugMatch.image}`;
    if ((materialUrl ?? '').toLowerCase() !== desired.toLowerCase()) {
      setMaterialUrl(desired);
    }
  }, [slugMatch, materialUrl, setMaterialUrl]);

  const name = useMemo(() => {
    // 1) If slug maps, show that
    if (slugMatch) return slugMatch.name;

    // 2) Else try store URL -> material
    if (materialUrl) {
      const file = (materialUrl.split('/').pop() || materialUrl).toLowerCase();
      const byImage =
        materials.find((m) => m.image.toLowerCase() === file) ||
        materials.find(
          (m) =>
            `/materials/${m.image}`.toLowerCase() === materialUrl.toLowerCase(),
        );
      if (byImage) return byImage.name;
    }

    // 3) Fallback
    return initialName ?? null;
  }, [slugMatch, materialUrl, materials, initialName]);

  // Don't render title on desktop
  if (isDesktop) {
    return null;
  }

  return (
    <h1 className="text-xl font-semibold text-gray-300">
      Select Material{name ? <span> - {name}</span> : null}
    </h1>
  );
}
