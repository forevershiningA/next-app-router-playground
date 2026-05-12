'use client';

import { useEffect, useRef, useState } from 'react';
import { PhotoIcon, SunIcon } from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';

const LS_KEY = 'fs_scene_bg';

interface StoredPref {
  hideScenery: boolean;
  color: string;
  sceneryVariant?: 'day' | 'outback';
}

const COLORS = [
  { label: 'Pure White',    value: '#f8f8f8' },
  { label: 'Light Gray',    value: '#d8d8d8' },
  { label: 'Warm Beige',    value: '#d4c5a9' },
  { label: 'Medium Gray',   value: '#787878' },
  { label: 'Dark Charcoal', value: '#2c2c2c' },
  { label: 'Deep Navy',     value: '#0d1b2a' },
] as const;

const SCENERY_OPTIONS = [
  {
    key: 'day' as const,
    label: 'Meadow',
    title: 'Green meadow',
    gradient: 'from-[#A8C9E6] to-[#4a6e28]',
    Icon: PhotoIcon,
  },
  {
    key: 'outback' as const,
    label: 'Outback',
    title: 'Australian outback',
    gradient: 'from-[#4a8cc8] via-[#c8a060] to-[#c07838]',
    Icon: SunIcon,
  },
] as const;

export default function SceneryToggleButton() {
  const hideScenery       = useHeadstoneStore((s) => s.hideScenery);
  const solidBgColor      = useHeadstoneStore((s) => s.solidBgColor);
  const sceneryVariant    = useHeadstoneStore((s) => s.sceneryVariant);
  const setHideScenery    = useHeadstoneStore((s) => s.setHideScenery);
  const setSolidBgColor   = useHeadstoneStore((s) => s.setSolidBgColor);
  const setSceneryVariant = useHeadstoneStore((s) => s.setSceneryVariant);

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
        if (pref.sceneryVariant === 'day' || pref.sceneryVariant === 'outback') setSceneryVariant(pref.sceneryVariant);
      }
    } catch {
      // ignore malformed data
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage whenever preferences change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ hideScenery, color: solidBgColor, sceneryVariant }));
    } catch {
      // ignore (private browsing, storage quota)
    }
  }, [hideScenery, solidBgColor, sceneryVariant]);

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

  const selectScenery = (variant: 'day' | 'outback') => {
    setSceneryVariant(variant);
    setHideScenery(false);
    setOpen(false);
  };

  const selectColor = (color: string) => {
    setSolidBgColor(color);
    setHideScenery(true);
    setOpen(false);
  };

  // Icon for the toggle button
  const activeScenery = SCENERY_OPTIONS.find((o) => o.key === sceneryVariant)!;

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

          {/* Scenery options */}
          <div className="mb-2 flex flex-col gap-1">
            {SCENERY_OPTIONS.map(({ key, label, title, gradient, Icon }) => {
              const isActive = !hideScenery && sceneryVariant === key;
              return (
                <button
                  key={key}
                  onClick={() => selectScenery(key)}
                  title={title}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/60 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b ${gradient}`}>
                    <Icon className="h-3.5 w-3.5 text-white drop-shadow" />
                  </span>
                  {label}
                  {isActive && <span className="ml-auto text-[#d4af37]">✓</span>}
                </button>
              );
            })}
          </div>

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
          <span
            className="h-4 w-4 rounded-full border border-white/30"
            style={{ backgroundColor: solidBgColor }}
          />
        ) : (
          <activeScenery.Icon className="h-4.5 w-4.5 text-white/70" />
        )}
      </button>
    </div>
  );
}
