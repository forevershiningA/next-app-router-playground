'use client';

import { useCallback, useEffect, useState } from 'react';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export function useHiddenDesigns() {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Favorites are public (Popular drawer visible on live site)
    fetch('/api/favorite-designs')
      .then((r) => r.json())
      .then((ids: string[]) => setFavoriteIds(new Set(ids)))
      .catch(() => {});

    // Hidden designs only managed on localhost
    if (!isLocalhost) return;
    fetch('/api/hidden-designs')
      .then((r) => r.json())
      .then((ids: string[]) => setHiddenIds(new Set(ids)))
      .catch(() => {});
  }, []);

  const hideDesign = useCallback(async (id: string) => {
    if (!isLocalhost) return;
    setHiddenIds((prev) => new Set(prev).add(id));
    await fetch('/api/hidden-designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    if (!isLocalhost) return;
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    await fetch('/api/favorite-designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  }, []);

  return { isLocalhost, hiddenIds, hideDesign, favoriteIds, toggleFavorite };
}

