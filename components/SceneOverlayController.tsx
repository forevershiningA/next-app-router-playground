'use client';

import * as React from 'react';
import clsx from 'clsx';

type Props = {
  section: string;
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  /** If provided, we still fall back to the global key and mirror saves globally. */
  persistKey?: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
};

type Pos = { x: number; y: number };

// in-memory cache to avoid a flash back to defaults between mounts
declare global {
  interface Window {
    __FS_OVERLAY_UI__?: { pos?: Pos };
  }
}
function getUI() {
  if (typeof window === 'undefined') return {};
  if (!window.__FS_OVERLAY_UI__) window.__FS_OVERLAY_UI__ = {};
  return window.__FS_OVERLAY_UI__;
}

export default function SceneOverlayController({
  section,
  title,
  children,
  defaultCollapsed = false,
  persistKey,
  className,
  isOpen,
  onClose,
}: Props) {
  const controlled = typeof isOpen === 'boolean';
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  // Keys
  const globalKey = React.useMemo(() => `overlay-pos:_global`, []);
  const specificKey = React.useMemo(
    () => (persistKey ? `overlay-pos:${persistKey}` : null),
    [persistKey],
  );

  // Initial from in-memory to prevent default flash
  const initialPos: Pos = (typeof window !== 'undefined' && getUI().pos) || {
    x: 16,
    y: 80,
  };

  const [pos, setPos] = React.useState<Pos>(initialPos);

  // Load from section key first, else fall back to global
  React.useEffect(() => {
    try {
      let loaded: Pos | null = null;

      if (specificKey) {
        const raw = window.localStorage.getItem(specificKey);
        if (raw) {
          const parsed = JSON.parse(raw) as Pos;
          if (Number.isFinite(parsed?.x) && Number.isFinite(parsed?.y)) {
            loaded = parsed;
          }
        }
      }

      if (!loaded) {
        const rawG = window.localStorage.getItem(globalKey);
        if (rawG) {
          const parsedG = JSON.parse(rawG) as Pos;
          if (Number.isFinite(parsedG?.x) && Number.isFinite(parsedG?.y)) {
            loaded = parsedG;
          }
        }
      }

      if (loaded) {
        setPos((p) => (p.x === loaded!.x && p.y === loaded!.y ? p : loaded!));
        getUI().pos = loaded;
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specificKey, globalKey]);

  // Persist to BOTH (so every section and the shared global stay in sync)
  React.useEffect(() => {
    try {
      window.localStorage.setItem(globalKey, JSON.stringify(pos));
      if (specificKey) {
        window.localStorage.setItem(specificKey, JSON.stringify(pos));
      }
      getUI().pos = pos;
    } catch {}
  }, [pos, globalKey, specificKey]);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const dragging = React.useRef(false);
  const dragStart = React.useRef<Pos | null>(null);
  const mouseStart = React.useRef<Pos | null>(null);

  // Keep within viewport
  React.useEffect(() => {
    const clampIntoViewport = () => {
      const el = rootRef.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = el?.offsetWidth ?? 380;
      const h = el?.offsetHeight ?? 300;
      setPos((p) => ({
        x: Math.max(8, Math.min(vw - w - 8, p.x)),
        y: Math.max(8, Math.min(vh - 60, p.y)),
      }));
    };
    clampIntoViewport();
    window.addEventListener('resize', clampIntoViewport);
    window.addEventListener('orientationchange', clampIntoViewport);
    return () => {
      window.removeEventListener('resize', clampIntoViewport);
      window.removeEventListener('orientationchange', clampIntoViewport);
    };
  }, []);

  // Programmatic open (unchanged)
  React.useEffect(() => {
    const onOpen = (e: Event) => {
      const ce = e as CustomEvent<{ section?: string }>;
      if (ce.detail?.section === section) {
        setCollapsed(false);
        requestAnimationFrame(() => {
          const el = document.querySelector(
            '[data-inscriptions-auto-focus]',
          ) as HTMLInputElement | null;
          el?.focus();
          el?.select?.();
        });
      }
    };
    window.addEventListener('fs:open-overlay', onOpen as EventListener);
    return () =>
      window.removeEventListener('fs:open-overlay', onOpen as EventListener);
  }, [section]);

  const isInteractive = (el: EventTarget | null) =>
    el instanceof HTMLElement &&
    !!el.closest(
      "button,[role='button'],a,input,select,textarea,[data-nodrag]",
    );

  // Drag handling
  const onHeaderPointerDown = (e: React.PointerEvent) => {
    if (isInteractive(e.target)) return;
    if (e.button !== 0) return;

    dragging.current = true;
    dragStart.current = { ...pos };
    mouseStart.current = { x: e.clientX, y: e.clientY };

    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    document.body.style.cursor = 'grabbing';
  };

  const onHeaderPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !dragStart.current || !mouseStart.current) return;

    const dx = e.clientX - mouseStart.current.x;
    const dy = e.clientY - mouseStart.current.y;

    const next: Pos = {
      x: dragStart.current.x + dx,
      y: dragStart.current.y + dy,
    };

    const el = rootRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = el?.offsetWidth ?? 380;
    const h = el?.offsetHeight ?? 300;

    next.x = Math.max(8, Math.min(vw - w - 8, next.x));
    next.y = Math.max(8, Math.min(vh - 60, next.y));
    setPos(next);
  };

  const onHeaderPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    dragStart.current = null;
    mouseStart.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
    document.body.style.cursor = 'auto';
  };

  return (
    <div
      ref={rootRef}
      className={clsx('pointer-events-auto fixed z-[9998]', className)}
      style={{ left: pos.x, top: pos.y, width: 380, maxWidth: '92vw' }}
    >
      <div
        className={clsx(
          'bg-[rgba(0,0,0,0.79)] transition-opacity',
          collapsed ? 'opacity-80' : 'opacity-100',
        )}
      >
        {/* Header (drag handle) */}
        <div
          className="flex cursor-grab items-center justify-between px-4 select-none"
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onHeaderPointerUp}
          onDoubleClick={() => setCollapsed((c) => !c)}
        >
          <h1 className="font-semibold text-white">{title}</h1>

          <button
            type="button"
            data-nodrag
            className="bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed((c) => !c);
            }}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '+' : '–'}
          </button>
        </div>

        {/* Body */}
        <div
          className={clsx(
            'px-4 pt-2 pb-4 transition-[max-height,opacity] duration-200',
            collapsed
              ? 'max-h-0 overflow-hidden opacity-0'
              : 'max-h-[75vh] overflow-auto opacity-100',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
