'use client';

import React, { useCallback } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';
import {
  getDefaultInscriptionFont,
  isStainlessHeadstoneProduct,
} from '#/lib/stencil-fonts';

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
  const productId = useHeadstoneStore((s) => s.productId);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const isEngraved = catalog?.product.formula === 'Engraved';

  const active = lines.find((l) => l.id === selectedInscriptionId) ?? null;
  const defaultFont = getDefaultInscriptionFont(productId, catalog);
  const usesStencilFonts = isStainlessHeadstoneProduct(productId, catalog);
  const availableFonts = React.useMemo(
    () => FONTS.filter((font) => (usesStencilFonts ? font.category === 'stencil' : font.category !== 'stencil')),
    [usesStencilFonts],
  );
  const [selectedFont, setSelectedFont] = React.useState(active?.font || defaultFont);
  const [activeTab, setActiveTab] = React.useState<'font' | 'color'>('font');
  const [inputMode, setInputMode] = React.useState<'single' | 'multi'>('single');
  const [multiText, setMultiText] = React.useState('');
  const [pendingTextAlign, setPendingTextAlign] = React.useState<'left' | 'center' | 'right'>('center');

  const currentAlign: 'left' | 'center' | 'right' = active?.textAlign ?? pendingTextAlign;

  React.useEffect(() => {
    if (active?.font) return;
    if (!availableFonts.some((font) => font.name === selectedFont)) {
      setSelectedFont(defaultFont);
    }
  }, [active?.font, availableFonts, defaultFont, selectedFont]);

  const setAlign = useCallback(
    (value: 'left' | 'center' | 'right') => {
      if (active) {
        updateLineStore(active.id, { textAlign: value });
      }
      setPendingTextAlign(value);
    },
    [active, updateLineStore],
  );

  const textAlignClass =
    currentAlign === 'left'
      ? 'text-left'
      : currentAlign === 'right'
        ? 'text-right'
        : 'text-center';
  const sectionCardClass =
    'rounded-lg border border-white/10 bg-[#171717] p-3.5 shadow-lg shadow-black/15 day:border-gray-200 day:bg-white';
  const labelClass =
    'mb-2 block text-sm font-semibold text-slate-100 day:text-gray-800';
  const fieldClass =
    'w-full rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-sm font-semibold text-white outline-none transition-colors focus:border-[#D7B356] focus:ring-2 focus:ring-[#D7B356]/30 day:border-gray-300 day:bg-gray-100 day:text-gray-900 day:placeholder:text-gray-400';
  const controlButtonClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.08] text-white transition-colors hover:border-[#D7B356]/50 hover:bg-white/[0.13] day:border-gray-200 day:bg-gray-100 day:text-gray-700 day:hover:bg-gray-200';
  const numberInputBaseClass =
    'h-8 w-16 rounded-md border bg-white/[0.08] px-2 text-right text-sm font-semibold text-white transition-colors focus:ring-2 focus:outline-none day:bg-gray-100 day:text-gray-900';
  const rangeInputClass =
    'fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#171717] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.35),0_0_0_3px_rgba(0,0,0,0.25)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.55),0_0_0_3px_rgba(0,0,0,0.25)] [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#171717] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.35),0_0_0_3px_rgba(0,0,0,0.25)]';
  const rangeBoundsClass =
    'mt-1 flex w-full justify-between text-xs text-white/35 day:text-gray-400';

  const AlignControls = (
    <div className={sectionCardClass}>
      <span className={labelClass}>Align</span>
      <div className="flex gap-1.5 rounded-lg border border-white/10 bg-[#0A0A0A] p-1 day:border-gray-200 day:bg-gray-100">
        {(
          [
            { value: 'left', label: 'Left', glyph: '<' },
            { value: 'center', label: 'Center', glyph: '=' },
            { value: 'right', label: 'Right', glyph: '>' },
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
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white day:text-gray-500 day:hover:bg-white day:hover:text-gray-900'
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
    <div className="space-y-3">
      {/* Input mode toggle */}
      <div className="flex gap-1.5 rounded-lg border border-white/10 bg-[#0A0A0A] p-1 day:border-gray-200 day:bg-gray-100">
        <button
          type="button"
          className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-all ${
            inputMode === 'single'
              ? 'bg-[#D7B356] text-slate-900 shadow-md'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white day:text-gray-500 day:hover:bg-white day:hover:text-gray-900'
          }`}
          onClick={() => setInputMode('single')}
        >
          Single
        </button>
        <button
          type="button"
          className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-all ${
            inputMode === 'multi'
              ? 'bg-[#D7B356] text-slate-900 shadow-md'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white day:text-gray-500 day:hover:bg-white day:hover:text-gray-900'
          }`}
          onClick={() => setInputMode('multi')}
        >
          Multiple
        </button>
      </div>

      {inputMode === 'single' ? (
        <div className={sectionCardClass}>
          <label
            htmlFor="inscriptionTextInput"
            className={labelClass}
          >
            Inscription Text
          </label>
          <input
            id="inscriptionTextInput"
            className={`${fieldClass} ${textAlignClass}`}
            value={activeInscriptionText ?? ''}
            onChange={(e) => {
              setActiveInscriptionText(e.target.value);
              if (active) {
                updateLine(active.id, { text: e.target.value });
              }
            }}
            placeholder="Type here..."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {AlignControls}
          <div className={sectionCardClass}>
            <label
              htmlFor="inscriptionMultilineInput"
              className={labelClass}
            >
              Inscription Text (multi-line)
            </label>
            <textarea
              id="inscriptionMultilineInput"
              rows={5}
              className={`${fieldClass} resize-y ${textAlignClass}`}
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
        <div className="flex gap-1.5 rounded-lg border border-white/10 bg-[#0A0A0A] p-1 day:border-gray-200 day:bg-gray-100">
          <button
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              activeTab === 'font'
                ? 'bg-[#D7B356] text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white day:text-gray-500 day:hover:bg-white day:hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('font')}
          >
            Select Font
          </button>
          <button
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              activeTab === 'color'
                ? 'bg-[#D7B356] text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white day:text-gray-500 day:hover:bg-white day:hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('color')}
          >
            Select Color
          </button>
        </div>
      )}

      {/* Font Selection */}
      {(!showInscriptionColor || activeTab === 'font') && (
        <div className={sectionCardClass}>
          {!showInscriptionColor && (
            <label className={labelClass}>
              Select Font
            </label>
          )}
          <div className="relative">
            <select
              className={`${fieldClass} appearance-none pr-8`}
              style={{ colorScheme: 'dark' }}
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
              {availableFonts.map((f) => (
                <option
                  key={f.id}
                  value={f.name}
                  style={{ backgroundColor: '#ffffff', color: '#111827' }}
                >
                  {f.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 day:text-gray-500">
              ▾
            </span>
          </div>

        </div>
      )}

      {/* Size + Rotation — always visible when active */}
      {active && (
        <>
          {/* Size Slider */}
          <div className={sectionCardClass}>
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-semibold text-slate-100 day:text-gray-800">Size</label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(inscriptionMinHeight, (active.sizeMm ?? 30) - 1);
                    updateLine(active.id, { sizeMm: newVal });
                  }}
                  className={controlButtonClass}
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
                  className={`${numberInputBaseClass} ${
                    (active.sizeMm ?? 30) < inscriptionMinHeight || (active.sizeMm ?? 30) > inscriptionMaxHeight
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-white/10 focus:border-[#D7B356] focus:ring-[#D7B356]/30 day:border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(inscriptionMaxHeight, (active.sizeMm ?? 30) + 1);
                    updateLine(active.id, { sizeMm: newVal });
                  }}
                  className={controlButtonClass}
                  aria-label="Increase size by 1mm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-white/70 day:text-gray-600">mm</span>
              </div>
            </div>
            <div className="relative mt-3">
              <input
                type="range"
                min={inscriptionMinHeight}
                max={inscriptionMaxHeight}
                step={1}
                value={active.sizeMm ?? 30}
                onChange={(e) => updateLine(active.id, { sizeMm: Number(e.target.value) })}
                className={rangeInputClass}
              />
              <div className={rangeBoundsClass}>
                <span>{inscriptionMinHeight}mm</span>
                <span>{inscriptionMaxHeight}mm</span>
              </div>
            </div>
          </div>

          {/* Rotation Slider */}
          <div className={sectionCardClass}>
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-semibold text-slate-100 day:text-gray-800">Rotation</label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(-180, (active.rotationDeg ?? 0) - 1);
                    updateLine(active.id, { rotationDeg: newVal });
                  }}
                  className={controlButtonClass}
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
                  className={`${numberInputBaseClass} ${
                    (active.rotationDeg ?? 0) < -180 || (active.rotationDeg ?? 0) > 180
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-white/10 focus:border-[#D7B356] focus:ring-[#D7B356]/30 day:border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(180, (active.rotationDeg ?? 0) + 1);
                    updateLine(active.id, { rotationDeg: newVal });
                  }}
                  className={controlButtonClass}
                  aria-label="Increase rotation by 1 degree"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-white/70 day:text-gray-600">°</span>
              </div>
            </div>
            <div className="relative mt-3">
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={active.rotationDeg ?? 0}
                onChange={(e) => updateLine(active.id, { rotationDeg: Number(e.target.value) })}
                className={rangeInputClass}
              />
              <div className={rangeBoundsClass}>
                <span>-180°</span>
                <span>180°</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Color Selection */}
      {showInscriptionColor && activeTab === 'color' && active && (
        <div className={sectionCardClass}>
          {isEngraved && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] p-3 transition-colors hover:border-[#D7B356]/60 hover:bg-white/[0.08] day:border-gray-300 day:bg-gray-50 day:hover:border-[#D7B356]"
                onClick={() => updateLine(active.id, { color: '#c99d44' })}
              >
                <div
                  className="h-6 w-6 rounded-md border border-slate-600 day:border-gray-300"
                  style={{ backgroundColor: '#c99d44' }}
                />
                <span className="text-xs font-semibold text-slate-100 day:text-gray-700">Gold Gilding</span>
              </div>
              <div
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] p-3 transition-colors hover:border-[#D7B356]/60 hover:bg-white/[0.08] day:border-gray-300 day:bg-gray-50 day:hover:border-[#D7B356]"
                onClick={() => updateLine(active.id, { color: '#eeeeee' })}
              >
                <div
                  className="h-6 w-6 rounded-md border border-slate-600 day:border-gray-300"
                  style={{ backgroundColor: '#eeeeee' }}
                />
                <span className="text-xs font-semibold text-slate-100 day:text-gray-700">Silver Gilding</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-7 gap-1">
            {data.colors.map((color) => (
              <div
                key={color.id}
                className={`h-7 w-7 cursor-pointer rounded-md border-2 transition-colors hover:border-[#D7B356] ${
                  active.color === color.hex
                    ? 'border-[#D7B356] ring-2 ring-[#D7B356]/35'
                    : 'border-white/15'
                }`}
                style={{ backgroundColor: color.hex }}
                onClick={() => updateLine(active.id, { color: color.hex })}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action buttons — placed last */}
      <div className="border-t border-white/10 pt-3 day:border-gray-200">
        {active ? (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-emerald-400/20 bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
              onClick={handleAddNewLine}
            >
              + Add line
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-[#D7B356]/60 bg-[#171717] px-3 py-2 text-sm font-semibold text-[#F2D58B] transition-colors hover:bg-[#D7B356]/15 day:bg-white day:text-[#8a6a12]"
              onClick={() => duplicateInscription(active.id)}
            >
              Duplicate
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-red-500/50 bg-[#171717] px-3 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/15 day:bg-white day:text-red-700"
              onClick={() => deleteInscription(active.id)}
            >
              Delete
            </button>
          </div>
        ) : inputMode === 'multi' ? (
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleAddMultipleLines}
              disabled={multiText.trim().length === 0}
            >
              <span aria-hidden="true">+</span>
              Add inscription
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
              onClick={handleAddNewLine}
            >
              <span aria-hidden="true">+</span>
              Add line
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
