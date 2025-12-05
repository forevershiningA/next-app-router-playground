'use client';

import React, { useCallback } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';

const FONTS = data.fonts;

export default function InscriptionEditPanel() {
  const lines = useHeadstoneStore((s) => s.inscriptions);
  const updateLineStore = useHeadstoneStore((s) => s.updateInscription);
  const duplicateInscription = useHeadstoneStore((s) => s.duplicateInscription);
  const deleteInscription = useHeadstoneStore((s) => s.deleteInscription);
  const addInscriptionLine = useHeadstoneStore((s) => s.addInscriptionLine);
  const selectedInscriptionId = useHeadstoneStore((s) => s.selectedInscriptionId);
  const setSelectedInscriptionId = useHeadstoneStore((s) => s.setSelectedInscriptionId);
  const inscriptionMinHeight = useHeadstoneStore((s) => s.inscriptionMinHeight);
  const inscriptionMaxHeight = useHeadstoneStore((s) => s.inscriptionMaxHeight);
  const activeInscriptionText = useHeadstoneStore((s) => s.activeInscriptionText);
  const setActiveInscriptionText = useHeadstoneStore((s) => s.setActiveInscriptionText);
  const showInscriptionColor = useHeadstoneStore((s) => s.showInscriptionColor);

  const active = lines.find((l) => l.id === selectedInscriptionId) ?? null;
  const [selectedFont, setSelectedFont] = React.useState(active?.font || 'Franklin Gothic');
  const [activeTab, setActiveTab] = React.useState<'font' | 'color'>('font');

  React.useEffect(() => {
    if (active?.font) {
      setSelectedFont(active.font);
    }
  }, [active?.font, active?.id]);

  React.useEffect(() => {
    if (!active) {
      setActiveInscriptionText('');
    }
  }, [active, setActiveInscriptionText]);

  const updateLine = useCallback(
    (id: string, patch: Partial<NonNullable<typeof active>>) => {
      updateLineStore(id, patch);
    },
    [updateLineStore],
  );

  const handleAddNewLine = useCallback(() => {
    const maxY = lines.length > 0 ? Math.max(...lines.map((l) => l.yPos)) : 0;
    const lastLine = lines.find((l) => l.yPos === maxY);
    const offset = lastLine ? lastLine.sizeMm / 10 + 5 : 0;
    const newY = maxY + offset;
    const text = activeInscriptionText.trim() || 'New line';
    addInscriptionLine({ text, font: selectedFont, yPos: newY });
  }, [lines, addInscriptionLine, activeInscriptionText, selectedFont]);

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="inscriptionTextInput"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Inscription Text
        </label>
        <input
          id="inscriptionTextInput"
          className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white outline-none focus:border-[#D7B356] focus:ring-1 focus:ring-[#D7B356]"
          value={activeInscriptionText ?? ''}
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
              className="flex-1 cursor-pointer rounded-lg bg-[#D7B356] px-3 py-2 text-sm font-medium text-slate-900 hover:bg-[#E4C778] transition-colors shadow-md"
              onClick={() => {
                if (active) {
                  duplicateInscription(active.id);
                }
              }}
            >
              Duplicate
            </button>
            <button
              className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-md"
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
            className="flex-1 cursor-pointer rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors shadow-md"
            onClick={handleAddNewLine}
          >
            Add New Line
          </button>
        )}
      </div>

      {/* Tabs for font and color (only show tabs if color is available) */}
      {showInscriptionColor && (
        <div className="flex gap-2 rounded-lg bg-slate-950 p-1">
          <button
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              activeTab === 'font'
                ? 'bg-[#D7B356] text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            onClick={() => setActiveTab('font')}
          >
            Select Font
          </button>
          <button
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              activeTab === 'color'
                ? 'bg-[#D7B356] text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            onClick={() => setActiveTab('color')}
          >
            Select Color
          </button>
        </div>
      )}

      {/* Font Selection */}
      {(!showInscriptionColor || activeTab === 'font') && (
        <div className="space-y-4">
          {!showInscriptionColor && (
            <label className="block text-sm font-medium text-slate-200">
              Select Font
            </label>
          )}
          <div className="relative">
            <select
              className="w-full appearance-none rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 pr-8 text-sm text-white outline-none focus:border-[#D7B356] focus:ring-1 focus:ring-[#D7B356]"
              value={active?.font ?? selectedFont}
              onChange={(e) => {
                const font = e.target.value;
                if (active) {
                  updateLine(active.id, { font });
                } else {
                  setSelectedFont(font);
                }
              }}
            >
              {FONTS.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400">
              ▾
            </span>
          </div>

          {active && (
            <>
              {/* Size Slider */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Size: {active.sizeMm ?? 30} <span className="text-slate-500">mm</span>
                </label>
                <input
                  type="range"
                  min={inscriptionMinHeight}
                  max={inscriptionMaxHeight}
                  step={1}
                  value={active.sizeMm ?? 30}
                  onChange={(e) => updateLine(active.id, { sizeMm: Number(e.target.value) })}
                  className="fs-range h-1 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900/95 [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(0,0,0,0.25)]"
                />
              </div>

              {/* Rotation Slider */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Rotation: {active.rotationDeg ?? 0} <span className="text-slate-500">°</span>
                </label>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={active.rotationDeg ?? 0}
                  onChange={(e) => updateLine(active.id, { rotationDeg: Number(e.target.value) })}
                  className="fs-range h-1 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900/95 [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(0,0,0,0.25)]"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Color Selection */}
      {showInscriptionColor && activeTab === 'color' && active && (
        <div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div
              className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-950 p-3 transition-colors hover:border-[#D7B356]"
              onClick={() => updateLine(active.id, { color: '#c99d44' })}
            >
              <div
                className="h-6 w-6 rounded-md border border-slate-600"
                style={{ backgroundColor: '#c99d44' }}
              />
              <span className="text-xs text-slate-200">Gold Gilding</span>
            </div>
            <div
              className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-950 p-3 transition-colors hover:border-[#D7B356]"
              onClick={() => updateLine(active.id, { color: '#eeeeee' })}
            >
              <div
                className="h-6 w-6 rounded-md border border-slate-600"
                style={{ backgroundColor: '#eeeeee' }}
              />
              <span className="text-xs text-slate-200">Silver Gilding</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {data.colors.map((color) => (
              <div
                key={color.id}
                className="h-7 w-7 cursor-pointer rounded-md border-2 border-slate-600 hover:border-[#D7B356] transition-colors"
                style={{ backgroundColor: color.hex }}
                onClick={() => updateLine(active.id, { color: color.hex })}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
