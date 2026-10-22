'use client';

import { useEffect, useRef, useState } from 'react';

const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 300;
const MAX_WIDTH = 500;
const STORAGE_KEY = 'designer:sidebar-width';

export default function DesignerSidebarResize() {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const drag = useRef<{ x: number; width: number } | null>(null);

  const updateWidth = (value: number) => {
    const next = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, value));
    setWidth(next);
    document.documentElement.style.setProperty(
      '--designer-sidebar-width',
      `${next}px`,
    );
    try {
      sessionStorage.setItem(STORAGE_KEY, String(next));
    } catch {}
  };

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved !== null && Number.isFinite(Number(saved)))
        updateWidth(Number(saved));
    } catch {}
  }, []);

  return (
    <div
      role="separator"
      aria-label="Resize designer sidebar"
      aria-orientation="vertical"
      aria-valuemin={MIN_WIDTH}
      aria-valuemax={MAX_WIDTH}
      aria-valuenow={width}
      tabIndex={0}
      className="fixed inset-y-0 z-50 hidden w-3 -translate-x-1/2 cursor-col-resize touch-none select-none hover:bg-amber-500/15 focus-visible:bg-amber-500/20 focus-visible:outline-none lg:block"
      style={{
        left: 'var(--designer-sidebar-width, 400px)',
        cursor: 'col-resize',
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        drag.current = { x: event.clientX, width };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (drag.current)
          updateWidth(drag.current.width + event.clientX - drag.current.x);
      }}
      onPointerUp={(event) => {
        drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onLostPointerCapture={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onKeyDown={(event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
          return;
        event.preventDefault();
        updateWidth(
          event.key === 'Home'
            ? MIN_WIDTH
            : event.key === 'End'
              ? MAX_WIDTH
              : width + (event.key === 'ArrowLeft' ? -10 : 10),
        );
      }}
      onDoubleClick={() => updateWidth(DEFAULT_WIDTH)}
    />
  );
}
