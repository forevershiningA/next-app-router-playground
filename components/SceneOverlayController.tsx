"use client";

import * as React from "react";
import clsx from "clsx";

type Props = {
  section: string;
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  persistKey?: string;
  className?: string;
};

type Pos = { x: number; y: number };

export default function SceneOverlayController({
  section,
  title,
  children,
  defaultCollapsed = false,
  persistKey,
  className,
}: Props) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  // Hydration-safe default; load persisted pos after mount
  const [pos, setPos] = React.useState<Pos>({ x: 16, y: 80 });
  React.useEffect(() => {
    if (!persistKey) return;
    try {
      const raw = window.localStorage.getItem(`overlay-pos:${persistKey}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Pos;
        if (Number.isFinite(parsed?.x) && Number.isFinite(parsed?.y)) setPos(parsed);
      }
    } catch {}
  }, [persistKey]);

  // Persist on change
  React.useEffect(() => {
    if (!persistKey) return;
    try {
      window.localStorage.setItem(`overlay-pos:${persistKey}`, JSON.stringify(pos));
    } catch {}
  }, [pos, persistKey]);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const dragging = React.useRef(false);
  const dragStart = React.useRef<Pos | null>(null);
  const mouseStart = React.useRef<Pos | null>(null);

  // Open programmatically
  React.useEffect(() => {
    const onOpen = (e: Event) => {
      const ce = e as CustomEvent<{ section?: string }>;
      if (ce.detail?.section === section) {
        setCollapsed(false);
        requestAnimationFrame(() => {
          const el = document.querySelector(
            "[data-inscriptions-auto-focus]"
          ) as HTMLInputElement | null;
          el?.focus();
          el?.select?.();
        });
      }
    };
    window.addEventListener("fs:open-overlay", onOpen as EventListener);
    return () => window.removeEventListener("fs:open-overlay", onOpen as EventListener);
  }, [section]);

  const isInteractive = (el: EventTarget | null) =>
    el instanceof HTMLElement &&
    !!el.closest("button,[role='button'],a,input,select,textarea,[data-nodrag]");

  // Drag handling
  const onHeaderPointerDown = (e: React.PointerEvent) => {
    // 🚫 Don’t start dragging when clicking interactive elements (like the collapse button)
    if (isInteractive(e.target)) return;
    if (e.button !== 0) return;

    dragging.current = true;
    dragStart.current = { ...pos };
    mouseStart.current = { x: e.clientX, y: e.clientY };

    // Only capture if we’re actually dragging
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.cursor = "grabbing";
  };

  const onHeaderPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !dragStart.current || !mouseStart.current) return;

    const dx = e.clientX - mouseStart.current.x;
    const dy = e.clientY - mouseStart.current.y;

    const next: Pos = { x: dragStart.current.x + dx, y: dragStart.current.y + dy };

    const el = rootRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = el?.offsetWidth ?? 360;
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
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    document.body.style.cursor = "auto";
  };

  return (
    <div
      ref={rootRef}
      className={clsx("pointer-events-auto fixed z-[60]", className)}
      style={{ left: pos.x, top: pos.y, width: 360, maxWidth: "92vw" }}
    >
      <div
        className={clsx(
          "bg-[rgba(0,0,0,0.79)] transition-opacity",
          collapsed ? "opacity-80" : "opacity-100"
        )}
      >
        {/* Header (drag handle) */}
        <div
          className="flex items-center justify-between px-4 pt-3 select-none cursor-grab"
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onHeaderPointerUp}
          onDoubleClick={() => setCollapsed((c) => !c)}
        >
          <h3 className="text-white font-semibold">{title}</h3>

          <button
            type="button"
            data-nodrag // 👈 extra guard
            className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed((c) => !c);
            }}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand" : "Collapse"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? "+" : "–"}
          </button>
        </div>

        {/* Body */}
        <div
          className={clsx(
            "px-4 pb-4 pt-2 transition-[max-height,opacity] duration-200",
            collapsed
              ? "max-h-0 opacity-0 overflow-hidden"
              : "max-h-[75vh] opacity-100 overflow-auto"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
