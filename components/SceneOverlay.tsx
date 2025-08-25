"use client";

import * as React from "react";
import OverlayPortal from "#/components/OverlayPortal";

type Section = "size" | "shape" | "material" | (string & {});

export default function SceneOverlay({
  section,
  title,
  children,
  portalId = "scene-root",
  className,
}: {
  section: Section;
  title?: string;
  children?: React.ReactNode;
  portalId?: string;   // defaults to the ThreeScene wrapper id
  className?: string;  // optional extra classes on the card
}) {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  const [pos, setPos] = React.useState<{ x: number; y: number }>({ x: 24, y: 24 });

  // drag state
  const downElRef = React.useRef<HTMLElement | null>(null);
  const dragRaf = React.useRef<number | null>(null);
  const dragData = React.useRef<{ dx: number; dy: number } | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const heading =
    title ??
    (section === "size"
      ? "Select Size"
      : section === "shape"
      ? "Select Shape"
      : section === "material"
      ? "Select Material"
      : "Overlay");

  // center vertically on first mount
  React.useEffect(() => {
    const container = document.getElementById(portalId);
    const card = cardRef.current;
    if (!container || !card) return;
    const c = container.getBoundingClientRect();
    const r = card.getBoundingClientRect();
    setPos((p) => ({ x: p.x, y: Math.max(12, Math.round((c.height - r.height) / 2)) }));
  }, [portalId]);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.button !== 0) return; // left button only
    // don't start drag from interactive elements (button/input/etc.)
    const t = e.target as HTMLElement;
    if (t.closest("button, input, textarea, a, [role='button']")) return;

    e.preventDefault();
    e.stopPropagation();

    const container = document.getElementById(portalId);
    if (!container) return;

    const c = container.getBoundingClientRect();
    dragData.current = {
      dx: e.clientX - (c.left + pos.x),
      dy: e.clientY - (c.top + pos.y),
    };

    const el = e.currentTarget as HTMLElement;
    downElRef.current = el;
    try { el.setPointerCapture?.(e.pointerId); } catch {}
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      if (!dragData.current) return;
      const c2 = container.getBoundingClientRect();
      const card = cardRef.current?.getBoundingClientRect();
      const cw = c2.width, ch = c2.height;
      const w = Math.round(card?.width ?? 380);
      const h = Math.round(card?.height ?? 220);
      const x = ev.clientX - c2.left - dragData.current!.dx;
      const y = ev.clientY - c2.top - dragData.current!.dy;
      const clamp = (n: number, mi: number, ma: number) => Math.max(mi, Math.min(ma, n));
      const nx = clamp(Math.round(x), 8, cw - w - 8);
      const ny = clamp(Math.round(y), 8, ch - h - 8);
      if (dragRaf.current) cancelAnimationFrame(dragRaf.current);
      dragRaf.current = requestAnimationFrame(() => setPos({ x: nx, y: ny }));
    };

    const end = (ev: PointerEvent) => {
      const el2 = downElRef.current;
      if (el2 && el2.hasPointerCapture?.(ev.pointerId)) {
        try { el2.releasePointerCapture?.(ev.pointerId); } catch {}
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      dragData.current = null;
      if (dragRaf.current) { cancelAnimationFrame(dragRaf.current); dragRaf.current = null; }
      downElRef.current = null;
      setDragging(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  };

  const toggleCollapsed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed((v) => !v);
    // keep in bounds after resize
    requestAnimationFrame(() => {
      const container = document.getElementById(portalId);
      const r = cardRef.current?.getBoundingClientRect();
      const c = container?.getBoundingClientRect();
      if (!r || !c) return;
      const nx = Math.min(pos.x, c.width - r.width - 8);
      const ny = Math.min(pos.y, c.height - r.height - 8);
      setPos({ x: Math.max(8, nx), y: Math.max(8, ny) });
    });
  };

  React.useEffect(() => {
    return () => {
      if (dragRaf.current) cancelAnimationFrame(dragRaf.current);
      dragRaf.current = null;
      dragData.current = null;
      downElRef.current = null;
    };
  }, []);

  return (
    <OverlayPortal containerId={portalId}>
      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          ref={cardRef}
          className="pointer-events-auto absolute"
          style={{ left: pos.x, top: pos.y }}
        >
          {/* fixed width card, like before */}
          <div className={`w-[340px] md:w-[380px] bg-black/70 text-white backdrop-blur-sm overflow-hidden ${className ?? ""}`}>
            {/* header */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 select-none">
              {/* drag handle */}
              <div
                onPointerDown={onPointerDown}
                title="Drag"
                aria-label="Drag overlay"
                className={`flex-1 h-8 flex items-center ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
              >
                <h2 className="text-base font-semibold leading-none">{heading}</h2>
              </div>

              {/* min/max */}
              <button
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Maximize" : "Minimize"}
                className="inline-flex h-8 w-8 items-center justify-center bg-white/10 hover:bg-white/15 active:bg-white/20"
              >
                {collapsed ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M8 3H3v5M3 16v5h5M21 8V3h-5M16 21h5v-5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>

            {!collapsed && (
              <div className="px-4 pb-4">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </OverlayPortal>
  );
}
