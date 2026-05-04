'use client';

import React, { useCallback, useMemo } from 'react';
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
  const catalog = useHeadstoneStore((s) => s.catalog);
  const isEngraved = catalog?.product.formula === 'Engraved';

  const active = lines.find((l) => l.id === selectedInscriptionId) ?? null;
  const [selectedFont, setSelectedFont] = React.useState(active?.font || 'Franklin Gothic');
  const [activeTab, setActiveTab] = React.useState<'font' | 'color'>('font');
  const [inputMode, setInputMode] = React.useState<'single' | 'multi'>('single');
  const [multiText, setMultiText] = React.useState('');
  const [pendingTextAlign, setPendingTextAlign] = React.useState<'left' | 'center' | 'right'>('center');

  const currentAlign: 'left' | 'center' | 'right' = active?.textAlign ?? pendingTextAlign;
  const setAlign = useCallback(
    (value: 'left' | 'center' | 'right') => {
      if (active) {
        updateLineStore(active.id, { textAlign: value });
      }
      setPendingTextAlign(value);
    },
    [active, updateLineStore],
  );

  const AlignControls = (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-200">
        Align
      </span>
      <div className="flex gap-2 rounded-lg bg-slate-950 p-1">
        {(
          [
            { value: 'left', label: 'Left', glyph: '⟵' },
            { value: 'center', label: 'Center', glyph: '⇔' },
            { value: 'right', label: 'Right', glyph: '⟶' },
          ] as const
        ).map((opt) => {
          const isActive = currentAlign === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAlign(opt.value)}
              className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#D7B356] text-slate-900 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="mr-1">{opt.glyph}</span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const textAlignClass =
    currentAlign === 'left'
      ? 'text-left'
      : currentAlign === 'right'
        ? 'text-right'
        : 'text-center';

  React.useEffect(() => {
    if (active?.font) {
      setSelectedFont(active.font);
    }
  }, [active?.font, active?.id]);

  React.useEffect(() => {
    if (!active) {
      setActiveInscriptionText('');
    } else if (active.textAlign) {
      setPendingTextAlign(active.textAlign);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, active?.textAlign, setActiveInscriptionText]);

  const updateLine = useCallback(
    (id: string, patch: Partial<NonNullable<typeof active>>) => {
      updateLineStore(id, patch);
    },
    [updateLineStore],
  );

  const handleAddNewLine = useCallback(() => {
    const text = activeInscriptionText.trim() || 'New line';
    if (!active) {
      addInscriptionLine({ text, font: selectedFont, yPos: 0, textAlign: pendingTextAlign });
      return;
    }

    const newY = active.yPos + (active.sizeMm / 10 + 5);
    addInscriptionLine({ text, font: selectedFont, yPos: newY, textAlign: pendingTextAlign });
  }, [active, addInscriptionLine, activeInscriptionText, selectedFont, pendingTextAlign]);

  const handleAddMultipleLines = useCallback(() => {
    // Keep line breaks so drei <Text> renders as stacked multi-line
    // text within a single inscription record.
    const normalized = multiText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
    const text = normalized.trim();
    if (!text) return;

    if (active) {
      updateLine(active.id, { text });
      setActiveInscriptionText(text);
    } else {
      const id = addInscriptionLine({ text, font: selectedFont, yPos: 0, textAlign: pendingTextAlign });
      setSelectedInscriptionId(id);
      setActiveInscriptionText(text);
    }
  }, [
    active,
    addInscriptionLine,
    multiText,
    selectedFont,
    setSelectedInscriptionId,
    setActiveInscriptionText,
    updateLine,
    pendingTextAlign,
  ]);

  // When a different inscription is selected, auto-switch to the correct tab and seed.
  React.useEffect(() => {
    const text = active?.text ?? '';
    const isMulti = text.includes('\n');
    setInputMode(isMulti ? 'multi' : 'single');
    if (isMulti) setMultiText(text);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  // Seed textarea when manually switching to multi mode.
  React.useEffect(() => {
    if (inputMode === 'multi') {
      setMultiText(active?.text ?? '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode]);

  return (
    <div className="space-y-4">
      {/* Input mode toggle */}
      <div className="flex gap-2 rounded-lg bg-slate-950 p-1">
        <button
          type="button"
          className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-all ${
            inputMode === 'single'
              ? 'bg-[#D7B356] text-slate-900 shadow-md'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          onClick={() => setInputMode('single')}
        >
          Single Line
        </button>
        <button
          type="button"
          className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-all ${
            inputMode === 'multi'
              ? 'bg-[#D7B356] text-slate-900 shadow-md'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          onClick={() => setInputMode('multi')}
        >
          Multiple Lines
        </button>
      </div>

      {inputMode === 'single' ? (
        <div className="space-y-3">
          <div>
            <label
              htmlFor="inscriptionTextInput"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Inscription Text
            </label>
            <input
              id="inscriptionTextInput"
              className={`w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white outline-none focus:border-[#D7B356] focus:ring-1 focus:ring-[#D7B356] ${textAlignClass}`}
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
        </div>
      ) : (
        <div className="space-y-3">
          {AlignControls}
          <div>
            <label
              htmlFor="inscriptionMultilineInput"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Inscription Text (multi-line)
            </label>
            <textarea
              id="inscriptionMultilineInput"
              rows={5}
              className={`w-full resize-y rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white outline-none focus:border-[#D7B356] focus:ring-1 focus:ring-[#D7B356] ${textAlignClass}`}
              value={multiText}
              onChange={(e) => {
                const val = e.target.value;
                setMultiText(val);
                if (active) {
                  const normalized = val.replace(/\r\n/g, '\n');
                  updateLine(active.id, { text: normalized });
                  setActiveInscriptionText(normalized);
                }
              }}
              placeholder={'In loving memory of\nJohn Smith\n1940 – 2020'}
            />
          </div>
        </div>
      )}

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

        </div>
      )}

      {/* Size + Rotation — always visible when active */}
      {active && (
        <>
          {/* Size Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-200 w-20">Size</label>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(inscriptionMinHeight, (active.sizeMm ?? 30) - 1);
                    updateLine(active.id, { sizeMm: newVal });
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Decrease size by 1mm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  min={inscriptionMinHeight}
                  max={inscriptionMaxHeight}
                  step={1}
                  value={active.sizeMm ?? 30}
                  onChange={(e) => updateLine(active.id, { sizeMm: Number(e.target.value) })}
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (val < inscriptionMinHeight) {
                      updateLine(active.id, { sizeMm: inscriptionMinHeight });
                    } else if (val > inscriptionMaxHeight) {
                      updateLine(active.id, { sizeMm: inscriptionMaxHeight });
                    }
                  }}
                  className={`w-16 rounded border px-2 py-1.5 text-right text-sm text-white bg-[#454545] focus:outline-none focus:ring-2 transition-colors ${
                    (active.sizeMm ?? 30) < inscriptionMinHeight || (active.sizeMm ?? 30) > inscriptionMaxHeight
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-[#5A5A5A] focus:border-[#D7B356] focus:ring-[#D7B356]/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(inscriptionMaxHeight, (active.sizeMm ?? 30) + 1);
                    updateLine(active.id, { sizeMm: newVal });
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Increase size by 1mm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-300">mm</span>
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                min={inscriptionMinHeight}
                max={inscriptionMaxHeight}
                step={1}
                value={active.sizeMm ?? 30}
                onChange={(e) => updateLine(active.id, { sizeMm: Number(e.target.value) })}
                className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
                <span>{inscriptionMinHeight}mm</span>
                <span>{inscriptionMaxHeight}mm</span>
              </div>
            </div>
          </div>

          {/* Rotation Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-200 w-20">Rotation</label>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(-180, (active.rotationDeg ?? 0) - 1);
                    updateLine(active.id, { rotationDeg: newVal });
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Decrease rotation by 1 degree"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  min={-180}
                  max={180}
                  step={1}
                  value={active.rotationDeg ?? 0}
                  onChange={(e) => updateLine(active.id, { rotationDeg: Number(e.target.value) })}
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (val < -180) {
                      updateLine(active.id, { rotationDeg: -180 });
                    } else if (val > 180) {
                      updateLine(active.id, { rotationDeg: 180 });
                    }
                  }}
                  className={`w-16 rounded border px-2 py-1.5 text-right text-sm text-white bg-[#454545] focus:outline-none focus:ring-2 transition-colors ${
                    (active.rotationDeg ?? 0) < -180 || (active.rotationDeg ?? 0) > 180
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-[#5A5A5A] focus:border-[#D7B356] focus:ring-[#D7B356]/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(180, (active.rotationDeg ?? 0) + 1);
                    updateLine(active.id, { rotationDeg: newVal });
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Increase rotation by 1 degree"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-300">°</span>
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={active.rotationDeg ?? 0}
                onChange={(e) => updateLine(active.id, { rotationDeg: Number(e.target.value) })}
                className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
                <span>-180°</span>
                <span>180°</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Color Selection */}
      {showInscriptionColor && activeTab === 'color' && active && (
        <div>
          {isEngraved && (
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
          )}

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

      {/* Action buttons — placed last */}
      <div className="flex flex-wrap gap-2 pt-2">
        {active ? (
          <>
            <button
              className="flex-1 cursor-pointer rounded-lg bg-[#D7B356] px-3 py-2 text-sm font-medium text-slate-900 hover:bg-[#E4C778] transition-colors shadow-md"
              onClick={() => duplicateInscription(active.id)}
            >
              Duplicate
            </button>
            <button
              className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-md"
              onClick={() => deleteInscription(active.id)}
            >
              Delete
            </button>
          </>
        ) : inputMode === 'multi' ? (
          <button
            className="flex-1 cursor-pointer rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddMultipleLines}
            disabled={multiText.trim().length === 0}
          >
            Add Inscription
          </button>
        ) : (
          <button
            className="flex-1 cursor-pointer rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors shadow-md"
            onClick={handleAddNewLine}
          >
            Add New Line
          </button>
        )}
      </div>
    </div>
  );
}
