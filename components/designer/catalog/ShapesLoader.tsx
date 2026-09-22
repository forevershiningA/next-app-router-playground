'use client';

import { useEffect } from 'react';
import { useHeadstoneStore, type ShapeOption } from '#/lib/headstone-store';

type ShapesLoaderProps = {
  shapes: ShapeOption[];
};

export default function ShapesLoader({ shapes }: ShapesLoaderProps) {
  const setShapes = useHeadstoneStore((s) => s.setShapes);

  useEffect(() => {
    if (shapes && shapes.length > 0) {
      setShapes(shapes);
    }
  }, [shapes, setShapes]);

  return null;
}
