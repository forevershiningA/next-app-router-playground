'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';

/**
 * Wires Next.js router into the store so it can do SPA navigations.
 * Mount once near the top of the app (e.g., in app/layout.tsx).
 */
export default function RouterBinder() {
  const router = useRouter();
  const setNavTo = useHeadstoneStore((s) => s.setNavTo);

  useEffect(() => {
    setNavTo((href, opts) =>
      opts?.replace ? router.replace(href) : router.push(href),
    );
  }, [router, setNavTo]);

  // Optional: handle generic navigation events from elsewhere
  useEffect(() => {
    const onNavigate = (e: any) => {
      const href = e?.detail?.href;
      if (href) router.push(href);
    };
    window.addEventListener('fs:navigate', onNavigate as EventListener);
    return () =>
      window.removeEventListener('fs:navigate', onNavigate as EventListener);
  }, [router]);

  return null;
}
