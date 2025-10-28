'use client';

import React, { useCallback, useEffect, useState } from 'react';
import SceneOverlayController from '#/components/SceneOverlayController';
import { useHeadstoneStore, Line } from '#/lib/headstone-store';
import TailwindSlider from '#/ui/TailwindSlider';
import Loader from '#/ui/loader';
import { data } from '#/app/_internal/_data';
import OverlayTitle from '#/ui/overlay-title';

/* --------------------------- types + helpers --------------------------- */

type Product = { id: string; name: string; image: string; category: string };

const FONTS = data.fonts;

const FONT_FILE_MAP: Record<string, string> = FONTS.reduce(
  (map, font) => {
    const base = font.image.replace(/\.(otf|ttf|woff|woff2)$/i, '');
    map[font.name] = `/fonts/${base}.woff2`; // Prefer woff2 for better compression
    return map;
  },
  {} as Record<string, string>,
);

/* --------------------------- component --------------------------- */

export default function InscriptionOverlayPanel({ products }: { products: Product[] }) {
  const lines = useHeadstoneStore((s) => s.inscriptions);
  const updateLineStore = useHeadstoneStore((s) => s.updateInscription);
  const duplicateInscription = useHeadstoneStore((s) => s.duplicateInscription);
  const deleteInscription = useHeadstoneStore((s) => s.deleteInscription);
  const addInscriptionLine = useHeadstoneStore((s) => s.addInscriptionLine);

  const incomingText = useHeadstoneStore((s) => s.activeInscriptionText);
  const setActiveInscriptionText = useHeadstoneStore(
    (s) => s.setActiveInscriptionText,
  );
  const selectedInscriptionId = useHeadstoneStore(
    (s) => s.selectedInscriptionId,
  );
  const closeInscriptions = useHeadstoneStore((s) => s.closeInscriptions);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const inscriptionMinHeight = useHeadstoneStore((s) => s.inscriptionMinHeight);
  const inscriptionMaxHeight = useHeadstoneStore((s) => s.inscriptionMaxHeight);
  const setFontLoading = useHeadstoneStore((s) => s.setFontLoading);
  const showInscriptionColor = useHeadstoneStore(
    (s) => s.showInscriptionColor,
  );
  const inscriptionCost = useHeadstoneStore((s) => s.inscriptionCost);

  const activeId = selectedInscriptionId;
  const active = lines.find((l) => l.id === activeId) ?? null;

  const [selectedFont, setSelectedFont] = useState(active?.font || 'Franklin Gothic');
  const [overlayFontLoading, setOverlayFontLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'font' | 'color'>('font');

  // Update selectedFont when active inscription changes
  useEffect(() => {
    if (active?.font) {
      setSelectedFont(active.font);
    }
  }, [active?.font, active?.id]);

  const preloadFont = useCallback(async (fontName: string) => {
    const font = FONTS.find((f) => f.name === fontName);
    if (!font) return;

    const base = font.image.replace(/\.(otf|ttf|woff|woff2)$/i, '');
    const woff2Url = `/fonts/${base}.woff2`;
    const fallbackUrl = `/fonts/${font.image}`;

    try {
      // Try woff2 first for better performance
      await fetch(woff2Url);
    } catch {
      try {
        // Fallback to original format
        await fetch(fallbackUrl);
      } catch (error) {
        console.error('Failed to preload font:', fontName, error);
      }
    }
  }, []);

  useEffect(() => {
    if (!active) {
      setActiveInscriptionText('');
    }
  }, [active, setActiveInscriptionText]);
  
  useEffect(() => {
    if (!active) {
      setActiveInscriptionText('');
    }
  }, [active, setActiveInscriptionText]);

  const updateLine = useCallback(
    (id: string, patch: Partial<Line>) => {
      updateLineStore(id, patch);
    },
    [updateLineStore],
  );

  const handleAddNewLine = useCallback(() => {
    const maxY = lines.length > 0 ? Math.max(...lines.map((l) => l.yPos)) : 0;
    const lastLine = lines.find((l) => l.yPos === maxY);
    const offset = lastLine ? lastLine.sizeMm / 10 + 5 : 0;
    const newY = maxY + offset;
    const text = incomingText.trim() || 'New line';
    addInscriptionLine({ text, font: selectedFont, yPos: newY });
  }, [lines, addInscriptionLine, incomingText, selectedFont]);

  // Don't render if not the inscription panel OR if addition panel is active
  if (activePanel !== 'inscription' && activePanel !== null) {
    return null;
  }

  return (
    <SceneOverlayController
      section="inscriptions"
      title="Edit Inscription"
      persistKey="inscriptions"
      isOpen={activePanel === 'inscription'}
      onClose={closeInscriptions}
    >
      <div className="bg-gray-900/50 p-4 space-y-4">
        <div>
          <label
            htmlFor="inscriptionTextInput"
            className="mb-1 block text-xs font-semibold text-violet-300"
          >
            Inscription Text
          </label>
          <input
            id="inscriptionTextInput"
            data-inscriptions-auto-focus
            className="w-full rounded-lg border border-violet-400/60 bg-transparent px-3 py-2 ring-0 outline-none focus:border-violet-300"
            value={incomingText ?? ''}
            onChange={(e) => {
              setActiveInscriptionText(e.target.value);
              if (active) {
                updateLine(active.id, { text: e.target.value });
              }
            }}
            placeholder="Type here…"
          />
        </div>

        <div className="flex space-x-2">
          {active ? (
            <>
              <button
                className="flex-1 cursor-pointer rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none"
                onClick={() => {
                  if (active) {
                    duplicateInscription(active.id);
                  }
                }}
              >
                Duplicate
              </button>
              <button
                className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                onClick={() => {
                  if (active) {
                    deleteInscription(active.id);
                  }
                }}
              >
                Delete
              </button>
            </>
          ) : (
            <button
              className="flex-1 cursor-pointer rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
              onClick={handleAddNewLine}
            >
              Add New Line
            </button>
          )}
        </div>

        {/* Tabs for font and color (only show tabs if color is available) */}
        {showInscriptionColor && (
          <div>
            <div className="flex gap-2 border-b border-white/20">
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'font'
                    ? 'border-b-2 border-violet-400 text-violet-300'
                    : 'text-white/70 hover:text-white'
                }`}
                onClick={() => setActiveTab('font')}
              >
                Select Font
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'color'
                    ? 'border-b-2 border-violet-400 text-violet-300'
                    : 'text-white/70 hover:text-white'
                }`}
                onClick={() => setActiveTab('color')}
              >
                Select Color
              </button>
            </div>
          </div>
        )}

        {/* Font Selection - show if no tabs OR if font tab is active */}
        {(!showInscriptionColor || activeTab === 'font') && (
          <div>
            <label
              htmlFor="inscriptionFontSelect"
              className="mb-1 block text-xs text-white/70"
            >
              {showInscriptionColor ? '' : 'Select Font'}
            </label>
            <div className="relative">
              <select
                id="inscriptionFontSelect"
                className="w-full appearance-none rounded-md border border-white/15 bg-neutral-900 px-3 py-2 pr-8 text-sm outline-none"
                value={active?.font ?? selectedFont}
                onChange={async (e) => {
                  const font = e.target.value;
                  setOverlayFontLoading(true);
                  setFontLoading(true); // Store for scene loader
                  const start = Date.now();
                  try {
                    await preloadFont(font);
                  } catch (error) {
                    console.error('Font preload failed:', error);
                  }
                  const elapsed = Date.now() - start;
                  const minTime = 500;
                  const remaining = Math.max(0, minTime - elapsed);
                  setTimeout(() => {
                    setOverlayFontLoading(false);
                    setFontLoading(false);
                    if (active) {
                      updateLine(active.id, { font });
                    } else {
                      setSelectedFont(font);
                    }
                  }, remaining);
                }}
              >
                {FONTS.map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/50">
                ▾
              </span>
            </div>
            {overlayFontLoading && (
              <div className="mt-2 flex justify-center">
                <Loader />
              </div>
            )}
            
            {/* Size and Rotation sliders in the font tab */}
            <div className="space-y-4 mt-4">
              <TailwindSlider
                label="Size"
                value={active?.sizeMm ?? 30}
                min={inscriptionMinHeight}
                max={inscriptionMaxHeight}
                step={1}
                onChange={(v) => active && updateLine(active.id, { sizeMm: v })}
                unit="mm"
              />
              <TailwindSlider
                label="Rotation"
                value={active?.rotationDeg ?? 0}
                min={-180}
                max={180}
                step={1}
                onChange={(v) => active && updateLine(active.id, { rotationDeg: v })}
                unit="°"
              />
            </div>
          </div>
        )}

        {/* Color Selection - only show if color tab is active */}
        {showInscriptionColor && activeTab === 'color' && (
          <div>
            <div className="grid grid-cols-2 gap-1 mb-4">
              <div
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-white/20 p-2 transition-colors hover:bg-white/10"
                onClick={() => {
                  if (active) updateLine(active.id, { color: '#c99d44' });
                }}
              >
                <div
                  className="h-5 w-5 rounded-md border border-white/20"
                  style={{ backgroundColor: '#c99d44' }}
                />
                <span className="text-xs">Gold Gilding</span>
              </div>
              <div
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-white/20 p-2 transition-colors hover:bg-white/10"
                onClick={() => {
                  if (active) updateLine(active.id, { color: '#eeeeee' });
                }}
              >
                <div
                  className="h-5 w-5 rounded-md border border-white/20"
                  style={{ backgroundColor: '#eeeeee' }}
                />
                <span className="text-xs">Silver Gilding</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {data.colors.map((color) => (
                <div
                  key={color.id}
                  className="h-6 w-6 cursor-pointer rounded-md border border-white/20"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => {
                    if (active) updateLine(active.id, { color: color.hex });
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="text-right text-lg font-semibold text-white">
          Inscription Cost: ${inscriptionCost.toFixed(2)}
        </div>
      </div>
    </SceneOverlayController>
  );
}
