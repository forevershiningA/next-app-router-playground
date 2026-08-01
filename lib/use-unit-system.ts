'use client';

import { useCallback, useEffect, useState } from 'react';
import { parseUnitSystemCookie, type UnitSystem } from '#/lib/unit-system';

const UNIT_SYSTEM_CHANGED_EVENT = 'unit-system-changed';

function readUnitSystemCookie(): UnitSystem {
  const fromCookie = parseUnitSystemCookie(
    typeof document === 'undefined' ? null : document.cookie,
  );
  return fromCookie ?? 'metric';
}

export function useUnitSystem(): UnitSystem {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(readUnitSystemCookie);

  useEffect(() => {
    const handleUnitSystemChanged = () => {
      setUnitSystemState(readUnitSystemCookie());
    };

    window.addEventListener(UNIT_SYSTEM_CHANGED_EVENT, handleUnitSystemChanged);
    return () => {
      window.removeEventListener(UNIT_SYSTEM_CHANGED_EVENT, handleUnitSystemChanged);
    };
  }, []);

  return unitSystem;
}

export function useSetUnitSystem() {
  return useCallback((unitSystem: UnitSystem) => {
    const secure = window.location.protocol === 'https:' ? '; secure' : '';
    document.cookie = `unit_system=${unitSystem}; path=/; max-age=31536000; samesite=lax${secure}`;
    document.cookie = `unit_system_user=1; path=/; max-age=31536000; samesite=lax${secure}`;
    window.dispatchEvent(new CustomEvent(UNIT_SYSTEM_CHANGED_EVENT));
  }, []);
}
