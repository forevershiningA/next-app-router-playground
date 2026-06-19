'use client';

import { useCallback, useEffect, useState } from 'react';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

let favoriteIdsCache: string[] | null = null;
let favoriteIdsPromise: Promise<string[]> | null = null;
let hiddenIdsCache: string[] | null = null;
let hiddenIdsPromise: Promise<string[]> | null = null;

function loadFavoriteIds() {
  if (favoriteIdsCache) return Promise.resolve(favoriteIdsCache);
  favoriteIdsPromise ??= fetch('/api/favorite-designs')
    .then((r) => r.json())
    .then((ids: string[]) => {
      favoriteIdsCache = ids;
      return ids;
    })
    .catch((error) => {
      favoriteIdsPromise = null;
      throw error;
    });
  return favoriteIdsPromise;
}

function loadHiddenIds() {
  if (hiddenIdsCache) return Promise.resolve(hiddenIdsCache);
  hiddenIdsPromise ??= fetch('/api/hidden-designs')
    .then((r) => r.json())
    .then((ids: string[]) => {
      hiddenIdsCache = ids;
      return ids;
    })
    .catch((error) => {
      hiddenIdsPromise = null;
      throw error;
    });
  return hiddenIdsPromise;
}

export function useHiddenDesigns() {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Favorites are public (Popular drawer visible on live site)
    loadFavoriteIds()
      .then((ids) => setFavoriteIds(new Set(ids)))
      .catch(() => {});

    // Hidden designs only managed on localhost
    if (!isLocalhost) return;
    loadHiddenIds()
      .then((ids) => setHiddenIds(new Set(ids)))
      .catch(() => {});
  }, []);

  const hideDesign = useCallback(async (id: string) => {
    if (!isLocalhost) return;
    setHiddenIds((prev) => new Set(prev).add(id));
    hiddenIdsCache = hiddenIdsCache ? Array.from(new Set([...hiddenIdsCache, id])) : null;
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
      favoriteIdsCache = Array.from(next);
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

