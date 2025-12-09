// components/SelectSizeOverlayCard.tsx
'use client';

import * as React from 'react';
import OverlayPortal from '#/components/OverlayPortal';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function SelectSizeOverlayCard() {
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const selectedInscriptionId = useHeadstoneStore((s) => s.selectedInscriptionId);
  const selected = useHeadstoneStore((s) => s.selected);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const setSelectedInscriptionId = useHeadstoneStore((s) => s.setSelectedInscriptionId);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);
  
  // Hide when addition, motif, or inscription panel is active
  if (
    (activePanel === 'addition' && selectedAdditionId) ||
    (activePanel === 'motif' && selectedMotifId) ||
    (activePanel === 'inscription' && selectedInscriptionId)
  ) {
    return null;
  }
  
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  const [pos, setPos] = React.useState<{ x: number; y: number }>({
    x: 24,
    y: 24,
  });

  // drag state
  const downElRef = React.useRef<HTMLElement | null>(null);
  const dragRaf = React.useRef<number | null>(null);
  const dragData = React.useRef<{ dx: number; dy: number } | null>(null);
  const [dragging, setDragging] = React.useState(false);

  // center vertically on first mount
  React.useEffect(() => {
    const container = document.getElementById('scene-root');
    const card = cardRef.current;
    if (!container || !card) return;
    const c = container.getBoundingClientRect();
    const r = card.getBoundingClientRect();
    setPos((p) => ({
      x: p.x,
      y: Math.max(12, Math.round((c.height - r.height) / 2)),
    }));
  }, []);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.button !== 0) return; // left button only
    e.preventDefault();
    e.stopPropagation();

    const container = document.getElementById('scene-root');
    if (!container) return;

    const c = container.getBoundingClientRect();
    dragData.current = {
      dx: e.clientX - (c.left + pos.x),
      dy: e.clientY - (c.top + pos.y),
    };

    const el = e.currentTarget as HTMLElement;
    downElRef.current = el;
    try {
      el.setPointerCapture?.(e.pointerId);
    } catch {}

    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      if (!dragData.current) return;
      const c2 = container.getBoundingClientRect();
      const card = cardRef.current?.getBoundingClientRect();
      const cw = c2.width,
        ch = c2.height;
      const w = Math.round(card?.width ?? 380);
      const h = Math.round(card?.height ?? (collapsed ? 48 : 220));

      const x = ev.clientX - c2.left - dragData.current.dx;
      const y = ev.clientY - c2.top - dragData.current.dy;

      const clamp = (n: number, min: number, max: number) =>
        Math.max(min, Math.min(max, n));
      const nx = clamp(Math.round(x), 8, cw - w - 8);
      const ny = clamp(Math.round(y), 8, ch - h - 8);

      if (dragRaf.current) cancelAnimationFrame(dragRaf.current);
      dragRaf.current = requestAnimationFrame(() => setPos({ x: nx, y: ny }));
    };

    const end = (ev: PointerEvent) => {
      const el2 = downElRef.current;
      if (el2 && el2.hasPointerCapture?.(ev.pointerId)) {
        try {
          el2.releasePointerCapture?.(ev.pointerId);
        } catch {}
      }
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      dragData.current = null;
      if (dragRaf.current) {
        cancelAnimationFrame(dragRaf.current);
        dragRaf.current = null;
      }
      downElRef.current = null;
      setDragging(false);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  const toggleCollapsed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed((v) => !v);
    // keep in bounds after size change
    requestAnimationFrame(() => {
      const container = document.getElementById('scene-root');
      const r = cardRef.current?.getBoundingClientRect();
      const c = container?.getBoundingClientRect();
      if (!r || !c) return;
      const nx = Math.min(pos.x, c.width - r.width - 8);
      const ny = Math.min(pos.y, c.height - r.height - 8);
      setPos({ x: Math.max(8, nx), y: Math.max(8, ny) });
    });
  };

  const handleHeadstoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected('headstone');
    setEditingObject('headstone');
    setSelectedInscriptionId(null);
    setSelectedAdditionId(null);
    setSelectedMotifId(null);
  };

  const handleBaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected('base');
    setEditingObject('base');
    setSelectedInscriptionId(null);
    setSelectedAdditionId(null);
    setSelectedMotifId(null);
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
    <OverlayPortal containerId="scene-root">
      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          ref={cardRef}
          className="pointer-events-auto absolute"
          style={{ left: pos.x, top: pos.y }}
        >
          {/* fixed width like before */}
          <div className="w-[340px] overflow-hidden bg-black/70 text-white shadow-lg backdrop-blur-sm md:w-[380px]">
            {/* header: drag handle (left) + button (right) */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 select-none">
              {/* DRAG HANDLE with cursor indicator */}
              <div
                onPointerDown={onPointerDown}
                title="Drag"
                aria-label="Drag overlay"
                className={`flex h-8 flex-1 items-center ${
                  dragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                <h1 className="text-base leading-none font-semibold">
                  Select Size
                </h1>
              </div>

              {/* min/max button (excluded from drag) */}
              <button
                onClick={toggleCollapsed}
                aria-label={collapsed ? 'Maximize' : 'Minimize'}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 hover:bg-white/15 active:bg-white/20"
              >
                {collapsed ? (
                  // maximize
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8 3H3v5M3 16v5h5M21 8V3h-5M16 21h5v-5"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  // minimize
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>

            {!collapsed && (
              <div className="px-4 pb-4">
                <p className="mb-3 text-sm leading-relaxed text-white/85">
                  Choose the headstone width &amp; height in millimetres.
                  Thickness is computed from size; cemeteries may have
                  regulations on allowable dimensions.
                </p>
                
                {/* Selection buttons */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={handleHeadstoneClick}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selected === 'headstone'
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Headstone
                  </button>
                  <button
                    onClick={handleBaseClick}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selected === 'base'
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Base
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </OverlayPortal>
  );
}
