// components/SceneOverlayHost.tsx
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useSceneOverlayStore } from "#/lib/scene-overlay-store";

/**
 * 2D overlay host (portaled to <body> so it never lands inside <Canvas>).
 * Keeps your draggable/collapsible panel behavior.
 */
export default function SceneOverlayHost() {
  const [root, setRoot] = React.useState<HTMLElement | null>(null);
  const { open, title, content, pos, collapsed, setPos, toggleCollapsed } =
    useSceneOverlayStore();

  // Mount (or reuse) a dedicated overlay root under <body>
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let el = document.getElementById("overlay-root") as HTMLElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = "overlay-root";
      // Make sure it covers the viewport and sits above the app by default
      el.style.position = "fixed";
      el.style.inset = "0";
      el.style.pointerEvents = "none";
      el.style.zIndex = "1200";
      document.body.appendChild(el);
    }
    setRoot(el);
  }, []);

  // ----- drag state -----
  const downElRef = React.useRef<HTMLElement | null>(null);
  const dragRaf = React.useRef<number | null>(null);
  const dragData = React.useRef<{ dx: number; dy: number } | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement | null>(null);

  // Center vertically once when first shown
  React.useEffect(() => {
    if (!open || !root || !cardRef.current) return;
    const c = root.getBoundingClientRect();
    const r = cardRef.current.getBoundingClientRect();
    setPos({ x: pos.x, y: Math.max(12, Math.round((c.height - r.height) / 2)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, root]);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.button !== 0) return; // left only
    const t = e.target as HTMLElement;
    if (t.closest("button, input, textarea, a, [role='button']")) return;

    e.preventDefault();
    e.stopPropagation();

    const container = root;
    if (!container) return;
    const c = container.getBoundingClientRect();

    dragData.current = { dx: e.clientX - (c.left + pos.x), dy: e.clientY - (c.top + pos.y) };
    const el = e.currentTarget as HTMLElement;
    downElRef.current = el;
    try { el.setPointerCapture?.(e.pointerId); } catch {}
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      if (!dragData.current) return;
      const c2 = container.getBoundingClientRect();
      const r = cardRef.current?.getBoundingClientRect();
      const cw = c2.width, ch = c2.height;
      const w = Math.round(r?.width ?? 380);
      const h = Math.round(r?.height ?? (collapsed ? 48 : 220));
      const x = ev.clientX - c2.left - dragData.current.dx;
      const y = ev.clientY - c2.top - dragData.current.dy;
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

  if (!root || !open || !content) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0">
      <div
        ref={cardRef}
        className="pointer-events-auto absolute"
        style={{ left: pos.x, top: pos.y }}
      >
        <div className="w-[340px] md:w-[380px] bg-black/70 text-white backdrop-blur-sm shadow-lg overflow-hidden rounded-xl">
          {/* header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 select-none">
            <div
              onPointerDown={onPointerDown}
              title="Drag"
              aria-label="Drag overlay"
              className={`flex-1 h-8 flex items-center ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
            >
              <h2 className="text-base font-semibold leading-none">{title}</h2>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapsed();
                // keep in bounds after size change
                requestAnimationFrame(() => {
                  const c = root.getBoundingClientRect();
                  const r = cardRef.current?.getBoundingClientRect();
                  if (!r) return;
                  const nx = Math.min(pos.x, c.width - r.width - 8);
                  const ny = Math.min(pos.y, c.height - r.height - 8);
                  setPos({ x: Math.max(8, nx), y: Math.max(8, ny) });
                });
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 hover:bg-white/15 active:bg-white/20"
              aria-label={collapsed ? "Maximize" : "Minimize"}
            >
              {collapsed ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M8 3H3v5M3 16v5h5M21 8V3h-5M16 21h5v-5" stroke="currentColor" strokeWidth="2" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>

          {!collapsed && <div className="px-4 pb-4">{content}</div>}
        </div>
      </div>
    </div>,
    root
  );
}
