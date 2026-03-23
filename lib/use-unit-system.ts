'use client';

import { useMemo } from 'react';
import { parseUnitSystemCookie, type UnitSystem } from '#/lib/unit-system';

export function useUnitSystem(): UnitSystem {
  return useMemo(() => {
    const fromCookie = parseUnitSystemCookie(
      typeof document === 'undefined' ? null : document.cookie,
    );
    if (fromCookie) return fromCookie;
    return 'metric';
  }, []);
}
