'use client';

import { useEffect, useRef, useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';

const LS_KEY = 'fs_scene_bg';

interface StoredPref {
  hideScenery: boolean;
  color: string;
}

const COLORS = [
  { label: 'Warm white',  value: '#e8e4dc' },
  { label: 'Light grey',  value: '#efefef' },
  { label: 'Stone',       value: '#d0c9bc' },
  { label: 'Dark slate',  value: '#2d3748' },
  { label: 'Charcoal',    value: '#1e2228' },
  { label: 'Navy',        value: '#1a2035' },
] as const;

export default function SceneryToggleButton() {
  const hideScenery   = useHeadstoneStore((s) => s.hideScenery);
  const solidBgColor  = useHeadstoneStore((s) => s.solidBgColor);
  const setHideScenery  = useHeadstoneStore((s) => s.setHideScenery);
  const setSolidBgColor = useHeadstoneStore((s) => s.setSolidBgColor);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Restore preference from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const pref: StoredPref = JSON.parse(raw);
        if (typeof pref.color === 'string') setSolidBgColor(pref.color);
        if (typeof pref.hideScenery === 'boolean') setHideScenery(pref.hideScenery);
      }
    } catch {
      // ignore malformed data
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage whenever the preference changes
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ hideScenery, color: solidBgColor }));
    } catch {
      // ignore (private browsing, storage quota)
    }
  }, [hideScenery, solidBgColor]);

  // Close popover when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectColor = (color: string) => {
    setSolidBgColor(color);
    setHideScenery(true);
    setOpen(false);
  };

  const selectScenery = () => {
    setHideScenery(false);
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2"
    >
      {/* Popover */}
      {open && (
        <div className="mb-1 rounded-2xl border border-white/15 bg-[#191108]/90 p-3 shadow-2xl backdrop-blur-sm">
          <p className="mb-2.5 px-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/50">
            Background
          </p>

          {/* Scenery option */}
          <button
            onClick={selectScenery}
            title="Show scenery"
            className={`mb-2 flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors ${
              !hideScenery
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:bg-white/8 hover:text-white'
            }`}
          >
            {/* Mini scenery swatch */}
            <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-[#A8C9E6] to-[#4a6e28]">
              <PhotoIcon className="h-3.5 w-3.5 text-white drop-shadow" />
            </span>
            Scenery
            {!hideScenery && <span className="ml-auto text-[#d4af37]">✓</span>}
          </button>

          {/* Solid colour swatches */}
          <div className="flex gap-1.5">
            {COLORS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => selectColor(value)}
                title={label}
                style={{ backgroundColor: value }}
                className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${
                  hideScenery && solidBgColor === value
                    ? 'ring-2 ring-[#d4af37] ring-offset-1 ring-offset-black/50'
                    : ''
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title={hideScenery ? 'Change background' : 'Toggle background'}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 shadow-lg backdrop-blur-sm transition-all hover:border-white/40 hover:bg-black/60"
        style={hideScenery ? { boxShadow: `0 0 0 2px ${solidBgColor}40` } : {}}
      >
        {hideScenery ? (
          /* Show current colour dot when scenery is hidden */
          <span
            className="h-4 w-4 rounded-full border border-white/30"
            style={{ backgroundColor: solidBgColor }}
          />
        ) : (
          <PhotoIcon className="h-4.5 w-4.5 text-white/70" />
        )}
      </button>
    </div>
  );
}
