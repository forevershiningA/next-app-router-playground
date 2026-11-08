'use client';

import DesignerRangeInput from '#/components/designer/ui/DesignerRangeInput';

import React, { useCallback } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';
import {
  getDefaultInscriptionFont,
  isStainlessHeadstoneProduct,
} from '#/lib/stencil-fonts';
import {
  formatImperialFractionFromMm,
  getLengthUnitLabel,
} from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';
import { DesignerOptionButton } from '#/components/designer/ui/DesignerControl';
import EpitaphLibrary from '#/components/designer/panels/EpitaphLibrary';

const FONTS = data.fonts;

export default function InscriptionEditPanel() {
  const unitSystem = useUnitSystem();
  const lines = useHeadstoneStore((s) => s.inscriptions);
  const updateLineStore = useHeadstoneStore((s) => s.updateInscription);
  const addInscriptionLine = useHeadstoneStore((s) => s.addInscriptionLine);
  const duplicateInscription = useHeadstoneStore((s) => s.duplicateInscription);
  const deleteInscription = useHeadstoneStore((s) => s.deleteInscription);
  const selectedInscriptionId = useHeadstoneStore(
    (s) => s.selectedInscriptionId,
  );
  const setSelectedInscriptionId = useHeadstoneStore(
    (s) => s.setSelectedInscriptionId,
  );
  const inscriptionMinHeight = useHeadstoneStore((s) => s.inscriptionMinHeight);
  const inscriptionMaxHeight = useHeadstoneStore((s) => s.inscriptionMaxHeight);
  const activeInscriptionText = useHeadstoneStore(
    (s) => s.activeInscriptionText,
  );
  const setActiveInscriptionText = useHeadstoneStore(
    (s) => s.setActiveInscriptionText,
  );
  const showInscriptionColor = useHeadstoneStore((s) => s.showInscriptionColor);
  const inscriptionPriceModel = useHeadstoneStore(
    (s) => s.inscriptionPriceModel,
  );
  const productId = useHeadstoneStore((s) => s.productId);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const isEngraved = catalog?.product.formula === 'Engraved';

  const active = lines.find((l) => l.id === selectedInscriptionId) ?? null;
  const inscriptionSizeMm = active?.sizeMm ?? 30;
  const formatInscriptionSize = React.useCallback(
    (value: number) =>
      unitSystem === 'imperial'
        ? formatImperialFractionFromMm(value)
        : String(Math.round(value)),
    [unitSystem],
  );
  const [sizeInputValue, setSizeInputValue] = React.useState(() =>
    formatInscriptionSize(inscriptionSizeMm),
  );
  const defaultFont = getDefaultInscriptionFont(productId, catalog);
  const usesStencilFonts = isStainlessHeadstoneProduct(productId, catalog);
  const availableFonts = React.useMemo(
    () =>
      FONTS.filter((font) =>
        usesStencilFonts
          ? font.category === 'stencil'
          : font.category !== 'stencil',
      ),
    [usesStencilFonts],
  );
  const [selectedFont, setSelectedFont] = React.useState(
    active?.font || defaultFont,
  );
  const [activeTab, setActiveTab] = React.useState<'font' | 'color'>('font');
  const [pendingTextAlign, setPendingTextAlign] = React.useState<
    'left' | 'center' | 'right'
  >('center');
  const [isEditingText, setIsEditingText] = React.useState(false);
  const [sizeStepIndex, setSizeStepIndex] = React.useState(0);
  const [nudgeStepIndex, setNudgeStepIndex] = React.useState(1);
  const sizeSteps =
    unitSystem === 'imperial'
      ? [
          { label: '1/8 in', mm: 25.4 / 8 },
          { label: '1/4 in', mm: 25.4 / 4 },
          { label: '1/2 in', mm: 25.4 / 2 },
        ]
      : [
          { label: '1 mm', mm: 1 },
          { label: '5 mm', mm: 5 },
          { label: '10 mm', mm: 10 },
        ];
  const inscriptionSizeStep = sizeSteps[sizeStepIndex] ?? sizeSteps[0];
  const nudgeSteps =
    unitSystem === 'imperial'
      ? [
          { label: '¼ in', mm: 6.35 },
          { label: '½ in', mm: 12.7 },
          { label: '1 in', mm: 25.4 },
        ]
      : [
          { label: '1 mm', mm: 1 },
          { label: '5 mm', mm: 5 },
          { label: '10 mm', mm: 10 },
        ];
  const nudgeStep = nudgeSteps[nudgeStepIndex] ?? nudgeSteps[1];
  const textInputRef = React.useRef<HTMLTextAreaElement>(null);
  const finishTextEditing = () => {
    textInputRef.current?.blur();
    setIsEditingText(false);
  };

  React.useLayoutEffect(() => {
    const textarea = textInputRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [activeInscriptionText]);

  const currentAlign: 'left' | 'center' | 'right' =
    active?.textAlign ?? pendingTextAlign;

  React.useEffect(() => {
    if (active?.font) return;
    if (!availableFonts.some((font) => font.name === selectedFont)) {
      setSelectedFont(defaultFont);
    }
  }, [active?.font, availableFonts, defaultFont, selectedFont]);

  React.useEffect(() => {
    setSizeInputValue(formatInscriptionSize(inscriptionSizeMm));
  }, [active?.id, formatInscriptionSize, inscriptionSizeMm]);

  const parseInscriptionSizeInput = React.useCallback(
    (value: string): number | null => {
      const normalized = value.trim().replace(',', '.');
      if (!normalized) return null;

      if (unitSystem === 'metric') {
        const millimetres = Number(normalized);
        return Number.isFinite(millimetres) ? millimetres : null;
      }

      const match = normalized.match(/^(?:(\d+(?:\.\d+)?)\s+)?(\d+)\/(\d+)$/);
      if (match) {
        const whole = Number(match[1] ?? 0);
        const numerator = Number(match[2]);
        const denominator = Number(match[3]);
        if (denominator === 0) return null;
        return (whole + numerator / denominator) * 25.4;
      }

      const inches = Number(normalized);
      return Number.isFinite(inches) ? inches * 25.4 : null;
    },
    [unitSystem],
  );

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
    'rounded-xl border border-white/10 bg-[#161412] p-3 shadow-sm day:border-[#dfd7ca] day:bg-white day:shadow-[0_2px_8px_rgba(40,30,20,0.04)] md:p-3.5';
  const labelClass =
    'mb-2 block font-serif text-sm font-normal text-white day:text-[#1a1714]';
  const fieldClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-serif text-sm font-normal text-white outline-none transition-all focus:border-[#c49a45] focus:ring-2 focus:ring-[#c49a45]/20 day:border-[#dfd7ca] day:bg-white day:text-[#1a1714] day:placeholder:text-[#8a8175] day:focus:border-[#9a742f] day:focus:ring-[#9a742f]/20 day:shadow-sm';
  const controlButtonClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white transition-all hover:border-[#c49a45] hover:bg-[#c49a45]/15 hover:text-[#f0d89f] disabled:cursor-not-allowed disabled:opacity-30 day:border-[#dfd7ca] day:bg-white day:text-[#1a1714] day:hover:border-[#9a742f] day:hover:bg-[#9a742f]/10 day:hover:text-[#9a742f] day:shadow-sm';
  const numberInputBaseClass =
    'h-8 w-18 rounded-lg border bg-white/[0.04] px-2 text-right font-sans text-sm font-semibold text-white transition-colors focus:ring-2 focus:ring-[#c49a45]/20 focus:outline-none day:bg-white day:text-[#1a1714] day:border-[#dfd7ca] day:focus:border-[#9a742f] day:focus:ring-[#9a742f]/20 day:shadow-sm';
  const rangeInputClass =
    'fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--designer-focus)] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#161412] [&::-moz-range-thumb]:bg-[#c49a45] [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#161412] [&::-webkit-slider-thumb]:bg-[#c49a45] [&::-webkit-slider-thumb]:shadow-md day:[&::-webkit-slider-thumb]:border-white day:[&::-webkit-slider-thumb]:bg-[#9a742f] day:[&::-moz-range-thumb]:border-white day:[&::-moz-range-thumb]:bg-[#9a742f]';
  const rangeBoundsClass =
    'mt-1.5 flex w-full justify-between font-sans text-[11px] font-medium tabular-nums text-white/50 day:text-[#786e61]';
  const AlignControls = (
    <div className="flex w-full items-center justify-between gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:shadow-inner">
      <div className="grid min-w-0 flex-1 grid-cols-3 gap-1">
        {(
          [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ] as const
        ).map((opt) => {
          const isActive = currentAlign === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAlign(opt.value)}
              aria-pressed={isActive}
              className={`w-full rounded-lg px-3 py-1.5 text-center font-sans text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'border border-[#c49a45] bg-[#c49a45] text-[#121110] shadow-sm day:border-[#9a742f] day:bg-[#9a742f] day:text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white day:text-[#6a6156] day:hover:bg-white day:hover:text-[#1a1714]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {isEditingText && (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={finishTextEditing}
          className="shrink-0 rounded-lg bg-[#c49a45] px-3 py-1.5 text-xs font-semibold text-[#121110] day:bg-[#9a742f] day:text-white md:hidden"
        >
          Done
        </button>
      )}
    </div>
  );

  React.useEffect(() => {
    if (active?.font) {
      setSelectedFont(active.font);
    }
  }, [active?.font, active?.id]);

  React.useEffect(() => {
    if (active?.textAlign) {
      setPendingTextAlign(active.textAlign);
    }
  }, [active?.textAlign]);

  const updateLine = useCallback(
    (id: string, patch: Partial<NonNullable<typeof active>>) => {
      updateLineStore(id, patch);
    },
    [updateLineStore],
  );
  const draftInscriptionText = activeInscriptionText.trim();
  const canAddInscription = !active && draftInscriptionText.length > 0;
  const handleAddInscription = () => {
    if (active) {
      setSelectedInscriptionId(null);
      requestAnimationFrame(() => textInputRef.current?.focus());
      return;
    }

    if (!canAddInscription) return;
    addInscriptionLine({
      text: draftInscriptionText,
      font: selectedFont,
      textAlign: pendingTextAlign,
    });
  };

  return (
    <div
      data-testid="designer-inscriptions-panel"
      className="flex flex-col gap-2 md:gap-3"
    >
      <div className="hidden px-1 pt-1 font-serif text-lg font-normal text-white day:text-[#1a1714] md:block">
        {inscriptionPriceModel?.name ?? 'Inscription'}
      </div>
      <div className={`${sectionCardClass} order-1`}>
        {lines.length > 0 && (
          <div className="mb-3">
            <p className="mb-2 font-serif text-sm font-normal text-white day:text-[#1a1714]">
              Inscriptions on your design ({lines.length})
            </p>
            <div
              role="group"
              aria-label="Select an inscription"
              className="flex max-h-44 flex-col gap-1 overflow-y-auto"
            >
              {lines.map((line, index) => (
                <DesignerOptionButton
                  key={line.id}
                  selected={line.id === selectedInscriptionId}
                  aria-label={`Edit inscription ${index + 1}: ${line.text || 'Empty inscription'}`}
                  className="w-full whitespace-pre-wrap break-words px-3 py-2 text-left"
                  onClick={() => {
                    finishTextEditing();
                    setSelectedInscriptionId(line.id);
                  }}
                >
                  <span className="block text-xs opacity-80">
                    {index + 1}.{' '}
                    {line.target === 'base'
                      ? 'Base'
                      : line.target === 'ledger'
                        ? 'Ledger'
                        : 'Headstone'}
                    {line.id === selectedInscriptionId ? ' · Editing' : ''}
                  </span>
                  <span className="block">{line.text || 'Empty inscription'}</span>
                </DesignerOptionButton>
              ))}
            </div>
          </div>
        )}
        <div className="mb-2">{AlignControls}</div>
        <textarea
          id="inscriptionTextInput"
          aria-label="Inscription text"
          rows={3}
          className={`${fieldClass} min-h-[5.75rem] resize-none overflow-hidden ${textAlignClass}`}
          value={activeInscriptionText}
          onChange={(e) => {
            const text = e.target.value.replace(/\r\n/g, '\n');
            setActiveInscriptionText(text);
            if (active) updateLine(active.id, { text });
          }}
          onFocus={() => setIsEditingText(true)}
          placeholder={'In loving memory of\nJohn Smith\n1940 – 2020'}
          ref={textInputRef}
          spellCheck={false}
          autoCorrect="off"
        />
        <div className="mt-2 flex flex-col gap-2 md:mt-3 md:gap-3">
          {/* Tabs for font and color (only show tabs if color is available) */}
          {showInscriptionColor && (
            <div
              role="group"
              aria-label="Inscription options"
              className="order-2 hidden items-center gap-2 px-1 py-1 md:flex"
            >
              <span className="mr-auto font-serif text-sm font-normal text-white day:text-[#1a1714]">
                Edit
              </span>
              <DesignerOptionButton
                selected={activeTab === 'font'}
                variant="solid"
                className="min-w-20 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold"
                onClick={() => setActiveTab('font')}
              >
                Font
              </DesignerOptionButton>
              <DesignerOptionButton
                selected={activeTab === 'color'}
                variant="solid"
                className="min-w-20 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold"
                onClick={() => setActiveTab('color')}
              >
                Color
              </DesignerOptionButton>
            </div>
          )}

          {/* Font Selection */}
          {(!showInscriptionColor || activeTab === 'font') &&
            availableFonts.length > 0 && (
              <div className="order-3 px-1">
                {!showInscriptionColor && (
                  <label className={labelClass}>Select Font</label>
                )}
                <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
                  {availableFonts.map((font) => {
                    const isSelected =
                      (active?.font ?? selectedFont) === font.name;
                    return (
                      <DesignerOptionButton
                        key={font.id}
                        selected={isSelected}
                        onClick={() => {
                          if (active)
                            updateLine(active.id, { font: font.name });
                          else setSelectedFont(font.name);
                        }}
                        style={{ fontFamily: font.name }}
                      >
                        {font.name}
                      </DesignerOptionButton>
                    );
                  })}
                </div>
                <div className="relative hidden md:block">
                  <select
                    aria-label="Inscription font"
                    className={`${fieldClass} cursor-pointer appearance-none pr-8 font-sans`}
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
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/50 day:text-[#6a6156]">
                    ▾
                  </span>
                </div>
              </div>
            )}

          {/* Color Selection */}
          {showInscriptionColor && activeTab === 'color' && (
            <div className={`order-4 px-1 ${active ? '' : 'opacity-55'}`}>
              {!active && (
                <p className="mb-3 text-sm text-stone-300 day:text-[#6a6156]">
                  Add or select an inscription to choose its colour.
                </p>
              )}
              {isEngraved && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!active}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                      active
                        ? 'cursor-pointer hover:border-[#c49a45]/60 hover:bg-white/[0.04] day:hover:border-[#9a742f]'
                        : 'cursor-not-allowed opacity-50'
                    } ${
                      active?.color === '#c99d44'
                        ? 'border-[#c49a45] bg-[#c49a45]/15 ring-2 ring-[#c49a45] day:border-[#9a742f] day:bg-[#9a742f]/10 day:ring-[#9a742f]'
                        : 'border-white/10 bg-white/[0.02] day:border-[#dfd7ca] day:bg-white day:shadow-sm'
                    }`}
                    onClick={() =>
                      active && updateLine(active.id, { color: '#c99d44' })
                    }
                  >
                    <div
                      className="h-6 w-6 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: '#c99d44' }}
                    />
                    <span className="font-serif text-xs font-normal text-white day:text-[#1a1714]">
                      Gold Gilding
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={!active}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                      active
                        ? 'cursor-pointer hover:border-[#c49a45]/60 hover:bg-white/[0.04] day:hover:border-[#9a742f]'
                        : 'cursor-not-allowed opacity-50'
                    } ${
                      active?.color === '#eeeeee'
                        ? 'border-[#c49a45] bg-[#c49a45]/15 ring-2 ring-[#c49a45] day:border-[#9a742f] day:bg-[#9a742f]/10 day:ring-[#9a742f]'
                        : 'border-white/10 bg-white/[0.02] day:border-[#dfd7ca] day:bg-white day:shadow-sm'
                    }`}
                    onClick={() =>
                      active && updateLine(active.id, { color: '#eeeeee' })
                    }
                  >
                    <div
                      className="h-6 w-6 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: '#eeeeee' }}
                    />
                    <span className="font-serif text-xs font-normal text-white day:text-[#1a1714]">
                      Silver Gilding
                    </span>
                  </button>
                </div>
              )}

              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-7 [&::-webkit-scrollbar]:hidden">
                {data.colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    aria-label={
                      active
                        ? `Select ${color.name}`
                        : `${color.name}; add an inscription to select it`
                    }
                    disabled={!active}
                    className={`h-8 w-8 shrink-0 rounded-full border-2 transition-all md:h-7 md:w-7 md:rounded-md ${
                      active
                        ? 'cursor-pointer hover:border-[#c49a45] hover:scale-110'
                        : 'cursor-not-allowed opacity-40'
                    } ${
                      active?.color === color.hex
                        ? 'ring-2 ring-[#c49a45] ring-offset-2 ring-offset-[#161412] day:ring-[#9a742f] day:ring-offset-white border-white'
                        : 'border-white/15 day:border-[#dfd7ca]'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() =>
                      active && updateLine(active.id, { color: color.hex })
                    }
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <EpitaphLibrary
          value={activeInscriptionText}
          onInsert={(text) => {
            // Library choices start an editable draft, preserving any selected
            // inscription until the user explicitly adds the new text.
            if (active) setSelectedInscriptionId(null);
            setActiveInscriptionText(text);
            requestAnimationFrame(() => {
              textInputRef.current?.focus({ preventScroll: true });
              textInputRef.current?.setSelectionRange(text.length, text.length);
            });
          }}
        />
        <button
          type="button"
          onClick={handleAddInscription}
          disabled={!active && !canAddInscription}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#c49a45] bg-[#c49a45] px-4 py-2.5 font-sans text-sm font-semibold text-[#121110] shadow-sm transition-all hover:bg-[#d5ad55] day:border-[#9a742f] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden="true">+</span>
          {active ? 'New Inscription' : 'Add Inscription'}
        </button>
      </div>

      {/* Size, position and rotation are independent of the style tab. */}
      {active && (
        <>
          {/* Size Slider */}
          <div className="order-5 px-1 pt-1">
            <div className="flex items-center justify-between gap-2">
              <label className="font-serif text-sm font-normal text-white day:text-[#1a1714]">
                Size
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(
                      inscriptionMinHeight,
                      inscriptionSizeMm - inscriptionSizeStep.mm,
                    );
                    updateLine(active.id, { sizeMm: newVal });
                  }}
                  className={controlButtonClass}
                  aria-label={`Decrease size by ${inscriptionSizeStep.label}`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <input
                  type="text"
                  inputMode="decimal"
                  value={sizeInputValue}
                  onChange={(e) => setSizeInputValue(e.target.value)}
                  onBlur={(e) => {
                    const valueMm = parseInscriptionSizeInput(e.target.value);
                    const clampedValue = Math.min(
                      inscriptionMaxHeight,
                      Math.max(
                        inscriptionMinHeight,
                        valueMm ?? inscriptionSizeMm,
                      ),
                    );
                    updateLine(active.id, { sizeMm: clampedValue });
                    setSizeInputValue(formatInscriptionSize(clampedValue));
                  }}
                  className={`${numberInputBaseClass} ${
                    (active.sizeMm ?? 30) < inscriptionMinHeight ||
                    (active.sizeMm ?? 30) > inscriptionMaxHeight
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-white/10 day:border-[#dfd7ca] focus:border-[#c49a45] day:focus:border-[#9a742f] focus:ring-[#c49a45]/20 day:focus:ring-[#9a742f]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(
                      inscriptionMaxHeight,
                      inscriptionSizeMm + inscriptionSizeStep.mm,
                    );
                    updateLine(active.id, { sizeMm: newVal });
                  }}
                  className={controlButtonClass}
                  aria-label={`Increase size by ${inscriptionSizeStep.label}`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                <span className="font-sans text-xs font-semibold text-white/60 day:text-[#6a6156]">
                  {getLengthUnitLabel(unitSystem)}
                </span>
              </div>
            </div>
            <div className="hidden">
              {sizeSteps.map((step, index) => (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => setSizeStepIndex(index)}
                  className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    sizeStepIndex === index
                      ? 'bg-[#D7B356] text-slate-900 shadow-sm'
                      : 'day:text-gray-600 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>
            <div className="relative mt-3">
              <DesignerRangeInput
                type="range"
                min={inscriptionMinHeight}
                max={inscriptionMaxHeight}
                step={inscriptionSizeStep.mm}
                value={inscriptionSizeMm}
                onChange={(e) =>
                  updateLine(active.id, { sizeMm: Number(e.target.value) })
                }
                className={rangeInputClass}
              />
              <div className={rangeBoundsClass}>
                <span>
                  {formatInscriptionSize(inscriptionMinHeight)}
                  {getLengthUnitLabel(unitSystem)}
                </span>
                <span>
                  {formatInscriptionSize(inscriptionMaxHeight)}
                  {getLengthUnitLabel(unitSystem)}
                </span>
              </div>
            </div>
          </div>

          {/* Position controls — touch-friendly alternative to dragging text. */}
          <div className={`${sectionCardClass} order-6 md:hidden`}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <label className="day:text-gray-800 text-sm font-semibold text-slate-100">
                Position
              </label>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateLine(active.id, { xPos: 0 })}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#D7B356]/70 bg-transparent px-3 py-2 text-sm font-semibold text-[#F2D58B] transition-colors hover:bg-[#D7B356]/15"
              >
                <span aria-hidden="true">↔</span>
                Center horizontally
              </button>
              <button
                type="button"
                onClick={() => updateLine(active.id, { yPos: 0 })}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#D7B356]/70 bg-transparent px-3 py-2 text-sm font-semibold text-[#F2D58B] transition-colors hover:bg-[#D7B356]/15"
              >
                <span aria-hidden="true">↕</span>
                Center vertically
              </button>
            </div>
            <div className="grid grid-cols-3 place-items-center gap-1">
              <span />
              <button
                type="button"
                aria-label={`Move inscription up ${nudgeStep.label}`}
                onClick={() =>
                  updateLine(active.id, {
                    yPos: (active.yPos ?? 0) + nudgeStep.mm,
                  })
                }
                className={`${controlButtonClass} active:scale-90 active:bg-[#D7B356]/20`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    d="m18 15-6-6-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span />
              <button
                type="button"
                aria-label={`Move inscription left ${nudgeStep.label}`}
                onClick={() =>
                  updateLine(active.id, {
                    xPos: (active.xPos ?? 0) - nudgeStep.mm,
                  })
                }
                className={`${controlButtonClass} active:scale-90 active:bg-[#D7B356]/20`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    d="m15 18-6-6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() =>
                  setNudgeStepIndex((index) => (index + 1) % nudgeSteps.length)
                }
                className="rounded px-1.5 py-1 text-xs font-semibold text-[#F2D58B] transition-colors hover:bg-[#D7B356]/15"
                aria-label={`Change movement step, currently ${nudgeStep.label}`}
              >
                {nudgeStep.label}
              </button>
              <button
                type="button"
                aria-label={`Move inscription right ${nudgeStep.label}`}
                onClick={() =>
                  updateLine(active.id, {
                    xPos: (active.xPos ?? 0) + nudgeStep.mm,
                  })
                }
                className={`${controlButtonClass} active:scale-90 active:bg-[#D7B356]/20`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    d="m9 18 6-6-6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span />
              <button
                type="button"
                aria-label={`Move inscription down ${nudgeStep.label}`}
                onClick={() =>
                  updateLine(active.id, {
                    yPos: (active.yPos ?? 0) - nudgeStep.mm,
                  })
                }
                className={`${controlButtonClass} active:scale-90 active:bg-[#D7B356]/20`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    d="m6 9 6 6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span />
            </div>
          </div>

          {/* Rotation Slider */}
          <div className="order-7 hidden px-1 pt-1 md:block">
            <div className="flex items-center justify-between gap-2">
              <label className="font-serif text-sm font-normal text-white day:text-[#1a1714]">
                Rotation
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(
                      -180,
                      (active.rotationDeg ?? 0) - 1,
                    );
                    updateLine(active.id, { rotationDeg: newVal });
                  }}
                  className={controlButtonClass}
                  aria-label="Decrease rotation by 1 degree"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  min={-180}
                  max={180}
                  step={1}
                  value={active.rotationDeg ?? 0}
                  onChange={(e) =>
                    updateLine(active.id, {
                      rotationDeg: Number(e.target.value),
                    })
                  }
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (val < -180) {
                      updateLine(active.id, { rotationDeg: -180 });
                    } else if (val > 180) {
                      updateLine(active.id, { rotationDeg: 180 });
                    }
                  }}
                  className={`${numberInputBaseClass} ${
                    (active.rotationDeg ?? 0) < -180 ||
                    (active.rotationDeg ?? 0) > 180
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-white/10 day:border-[#dfd7ca] focus:border-[#c49a45] day:focus:border-[#9a742f] focus:ring-[#c49a45]/20 day:focus:ring-[#9a742f]/20'
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
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                <span className="font-sans text-xs font-semibold text-white/60 day:text-[#6a6156]">
                  °
                </span>
              </div>
            </div>
            <div className="relative mt-3">
              <DesignerRangeInput
                type="range"
                min={-180}
                max={180}
                step={1}
                value={active.rotationDeg ?? 0}
                onChange={(e) =>
                  updateLine(active.id, { rotationDeg: Number(e.target.value) })
                }
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

      {/* Actions for the selected inscription */}
      {active && (
        <div className="order-8 border-t border-white/10 pt-3 day:border-[#dfd7ca]">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-[#c49a45]/60 bg-[#161412] px-3 py-2 text-sm font-semibold text-[#f0d89f] transition-all hover:bg-[#c49a45]/15 day:border-[#9a742f] day:bg-white day:text-[#78541c] day:hover:bg-[#9a742f]/10 day:shadow-sm"
              onClick={() => duplicateInscription(active.id)}
            >
              Duplicate
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-red-500/50 bg-[#161412] px-3 py-2 text-sm font-semibold text-red-300 transition-all hover:bg-red-500/15 day:border-red-300 day:bg-white day:text-red-700 day:hover:bg-red-50 day:shadow-sm"
              onClick={() => deleteInscription(active.id)}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
