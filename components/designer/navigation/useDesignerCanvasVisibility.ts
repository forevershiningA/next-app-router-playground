'use client';

import { useEffect, useState } from 'react';

const CANVAS_VISIBLE_STEPS = new Set([
  'select-size',
  'inscriptions',
  'select-motifs',
  'select-material',
  'select-border',
  'select-fastening',
  'select-additions',
  'select-images',
  'select-emblems',
  'design-menu',
]);

export function useDesignerCanvasVisibility(designerStepSlug: string | null) {
  const isCanvasVisible = CANVAS_VISIBLE_STEPS.has(designerStepSlug ?? '');
  const [hasCanvasBeenShown, setHasCanvasBeenShown] = useState(false);

  useEffect(() => {
    if (isCanvasVisible) setHasCanvasBeenShown(true);
  }, [isCanvasVisible]);

  return { isCanvasVisible, hasCanvasBeenShown };
}
