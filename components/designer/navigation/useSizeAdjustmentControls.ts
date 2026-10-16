import { useCallback, useEffect, useState } from 'react';
import type React from 'react';

interface UseSizeAdjustmentControlsOptions {
  isPlaque: boolean;
  setSizeAdjustmentCompact: (compact: boolean) => void;
  setSizeAdjustmentActive: (active: boolean) => void;
}

export function useSizeAdjustmentControls({
  isPlaque,
  setSizeAdjustmentCompact,
  setSizeAdjustmentActive,
}: UseSizeAdjustmentControlsOptions) {
  const [activeSizeControl, setActiveSizeControl] = useState<
    'width' | 'height' | 'depth'
  >('width');

  useEffect(
    () => () => setSizeAdjustmentActive(false),
    [setSizeAdjustmentActive],
  );

  const startCompactSizeAdjustment = useCallback(() => {
    setSizeAdjustmentActive(true);
    // Plaques keep the full sheet visible so the Width/Height switch remains
    // available. Compact mode is for the richer headstone/base sizing panels.
    if (!isPlaque && typeof window !== 'undefined' && window.innerWidth < 768) {
      setSizeAdjustmentCompact(true);
    }
  }, [isPlaque, setSizeAdjustmentActive, setSizeAdjustmentCompact]);

  const endCompactSizeAdjustment = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSizeAdjustmentCompact(false);
    }
    setSizeAdjustmentActive(false);
  }, [setSizeAdjustmentActive, setSizeAdjustmentCompact]);

  const compactSizeRangeProps: React.InputHTMLAttributes<HTMLInputElement> = {
    onFocus: startCompactSizeAdjustment,
    onPointerDown: startCompactSizeAdjustment,
    onPointerUp: endCompactSizeAdjustment,
    onPointerCancel: endCompactSizeAdjustment,
    onBlur: endCompactSizeAdjustment,
  };

  return { activeSizeControl, setActiveSizeControl, compactSizeRangeProps };
}
