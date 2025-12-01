'use client';

import * as React from 'react';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';

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
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const loading = useHeadstoneStore((s) => s.loading);
  
  // Determine if this panel is the currently active one
  const isActivePanel = activePanel === section;
  
  // Detect client-side mounting and wait for loading to complete
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Fade in after loading completes
  React.useEffect(() => {
    if (!loading && isClient) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else if (loading) {
      setIsVisible(false);
    }
  }, [loading, isClient]);

  // Keys
  const globalKey = React.useMemo(() => `overlay-pos:_global`, []);
  const specificKey = React.useMemo(
    () => (persistKey ? `overlay-pos:${persistKey}` : null),
    [persistKey],
  );

  // Initial from in-memory to prevent default flash
  // Position to align panel below the header (header is ~72-80px with padding and 2 lines)
  const initialPos: Pos = (typeof window !== 'undefined' && getUI().pos) || {
    x: -10,
    y: 80,
  };

  const [pos, setPos] = React.useState<Pos>(initialPos);

  // Load from section key first, else fall back to global
  React.useEffect(() => {
    try {
      let loaded: Pos | null = null;
      const MIN_Y = 80; // Minimum Y to stay below header

      if (specificKey) {
        const raw = window.localStorage.getItem(specificKey);
        if (raw) {
          const parsed = JSON.parse(raw) as Pos;
          if (Number.isFinite(parsed?.x) && Number.isFinite(parsed?.y)) {
            // Ensure Y is below header
            loaded = { x: parsed.x, y: Math.max(parsed.y, MIN_Y) };
          }
        }
      }

      if (!loaded) {
        const rawG = window.localStorage.getItem(globalKey);
        if (rawG) {
          const parsedG = JSON.parse(rawG) as Pos;
          if (Number.isFinite(parsedG?.x) && Number.isFinite(parsedG?.y)) {
            // Ensure Y is below header
            loaded = { x: parsedG.x, y: Math.max(parsedG.y, MIN_Y) };
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
      const MIN_Y = 80; // Minimum Y to stay below header
      setPos((p) => ({
        x: Math.max(8, Math.min(vw - w - 8, p.x)),
        y: Math.max(MIN_Y, Math.min(vh - 60, p.y)),
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
    const MIN_Y = 80; // Minimum Y to stay below header

    next.x = Math.max(8, Math.min(vw - w - 8, next.x));
    next.y = Math.max(MIN_Y, Math.min(vh - 60, next.y));
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

  // Regular floating overlay mode
  // Don't render if controlled and not open
  if (controlled && !isOpen) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      data-scene-overlay
      className={clsx(
        'pointer-events-auto fixed transition-opacity duration-200',
        // Dynamic z-index: active panel gets highest z-index to appear above nav
        isActivePanel ? 'z-[99999]' : 'z-[99998]',
        // Stick to bottom, full width on all screens
        '!left-0 !bottom-0 !top-auto !w-full !max-w-full',
        // On desktop, left margin for sidebar
        'md:!left-[400px] md:!w-[calc(100%-400px)]',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{ 
        // Don't use inline positioning on all screens now
      }}
    >
      <div
        className={clsx(
          'bg-[rgba(0,0,0,0.79)]',
          collapsed ? 'opacity-80' : 'opacity-100',
        )}
      >
        {/* Header (no longer draggable) */}
        <div
          className="flex items-center justify-between px-4 py-3 select-none"
          role="banner"
          aria-label="Panel header"
        >
          <h2 className="font-semibold text-white">{title}</h2>

          <button
            type="button"
            data-nodrag
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) {
                onClose();
              } else {
                setActivePanel(null);
              }
              // Dispatch event to show all sections in nav
              window.dispatchEvent(new CustomEvent('back-to-menu'));
              // Navigate to home to hide the section panels
              router.push('/');
            }}
            className="flex items-center space-x-1 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 rounded transition-colors cursor-pointer"
            title="Back to menu"
          >
            <span>←</span>
            <span>Back to menu</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pt-2 pb-4 max-h-[40vh] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
