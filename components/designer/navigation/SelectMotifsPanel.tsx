'use client';

import DesignerRangeInput from '#/components/designer/ui/DesignerRangeInput';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';
import MotifSelectorPanel from '#/components/designer/selectors/MotifSelectorPanel';
import {
  formatImperialFractionFromMm,
  getLengthUnitLabel,
} from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';

type SelectMotifsPanelProps = {
  activeFullscreenPanel: string | null;
  forceMotifCatalog: boolean;
  isStainlessSteelHeadstone: boolean;
};

export default function SelectMotifsPanel({
  activeFullscreenPanel,
  forceMotifCatalog,
  isStainlessSteelHeadstone,
}: SelectMotifsPanelProps) {
  const unitSystem = useUnitSystem();
  const lengthUnit = getLengthUnitLabel(unitSystem);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const setMotifOffset = useHeadstoneStore((s) => s.setMotifOffset);
  const removeMotif = useHeadstoneStore((s) => s.removeMotif);
  const duplicateMotif = useHeadstoneStore((s) => s.duplicateMotif);
  const setMotifColor = useHeadstoneStore((s) => s.setMotifColor);
  const motifPriceModel = useHeadstoneStore((s) => s.motifPriceModel);
  const motifCatalog = useHeadstoneStore((s) => s.motifsCatalog);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const [lastMotifCategoryId, setLastMotifCategoryId] = useState<string | null>(
    null,
  );
  const activeMotif = selectedMotifs.find((m) => m.id === selectedMotifId);
  const activeOffset = selectedMotifId
    ? motifOffsets[selectedMotifId] || {
        xPos: 0,
        yPos: 0,
        scale: 1,
        rotationZ: 0,
        heightMm: 100,
      }
    : null;

  const isLaser = catalog?.product?.laser === '1';
  const isBronze = catalog?.product?.type === 'bronze_plaque';
  const isEngraved = catalog?.product?.formula === 'Engraved';

  let minHeight = 40;
  let maxHeight = 1000;
  let initHeight = 100;

  if (isLaser) {
    minHeight = 40;
    maxHeight = 600;
    initHeight = 40;
  } else if (isBronze) {
    minHeight = 40;
    maxHeight = 150;
    initHeight = 100;
  }

  const hasActiveMotif =
    !!selectedMotifId &&
    !!activeOffset &&
    !!activeMotif &&
    activePanel === 'motif';
  const rotationDegrees = ((activeOffset?.rotationZ ?? 0) * 180) / Math.PI;
  const clampHeight = (value: number) =>
    Math.min(maxHeight, Math.max(minHeight, value));
  const formatMotifHeight = (valueMm: number) =>
    unitSystem === 'imperial'
      ? formatImperialFractionFromMm(valueMm)
      : String(Math.round(valueMm));
  const parseMotifHeight = (value: string) => {
    const normalized = value.trim().replace(',', '.');
    if (!normalized) return null;
    if (unitSystem === 'metric') {
      const millimetres = Number(normalized);
      return Number.isFinite(millimetres) ? millimetres : null;
    }
    const fraction = normalized.match(/^(?:(\d+(?:\.\d+)?)\s+)?(\d+)\/(\d+)$/);
    if (fraction) {
      const whole = Number(fraction[1] ?? 0);
      const numerator = Number(fraction[2]);
      const denominator = Number(fraction[3]);
      if (denominator === 0) return null;
      return (whole + numerator / denominator) * 25.4;
    }
    const inches = Number(normalized);
    return Number.isFinite(inches) ? inches * 25.4 : null;
  };
  const motifHeightStep =
    unitSystem === 'imperial'
      ? { label: '1/8 in', mm: 25.4 / 8 }
      : { label: '1 mm', mm: 1 };
  const showMotifCatalog =
    activeFullscreenPanel === 'select-motifs' &&
    (forceMotifCatalog || !hasActiveMotif);
  const showMotifColorControls =
    !isLaser && !isStainlessSteelHeadstone && catalog?.product?.color !== '0';

  const nudgeSteps = [
    { label: '1 mm', value: 1 },
    { label: '5 mm', value: 5 },
    { label: '10 mm', value: 10 },
  ];
  const [nudgeStepIndex, setNudgeStepIndex] = useState(0);
  const nudgeStep = nudgeSteps[nudgeStepIndex];
  const motifPositionStep = nudgeStep.value;

  const updateMotifPosition = (xPos: number, yPos: number) => {
    if (!selectedMotifId || !activeOffset) return;
    setMotifOffset(selectedMotifId, {
      ...activeOffset,
      xPos,
      yPos,
    });
  };

  const centerMotifHorizontally = () => {
    if (!selectedMotifId || !activeOffset) return;
    setMotifOffset(selectedMotifId, {
      ...activeOffset,
      xPos: 0,
    });
  };

  const sectionCardClass =
    'rounded-xl border border-white/10 bg-[#161412] p-3.5 shadow-sm day:border-[#dfd7ca] day:bg-white day:shadow-[0_2px_8px_rgba(40,30,20,0.04)]';
  const controlButtonClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white transition-all hover:border-[#c49a45] hover:bg-[#c49a45]/15 hover:text-[#f0d89f] disabled:cursor-not-allowed disabled:opacity-30 day:border-[#dfd7ca] day:bg-white day:text-[#1a1714] day:hover:border-[#9a742f] day:hover:bg-[#9a742f]/10 day:hover:text-[#9a742f] day:shadow-sm';
  const numberInputClass =
    'h-8 w-16 rounded-lg border border-white/10 bg-white/[0.04] px-2 text-center font-sans text-sm font-semibold tabular-nums text-white transition-colors focus:border-[#c49a45] focus:ring-2 focus:ring-[#c49a45]/20 focus:outline-none day:border-[#dfd7ca] day:bg-white day:text-[#1a1714] day:focus:border-[#9a742f] day:shadow-sm';
  const rangeInputClass =
    'fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--designer-focus)] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#161412] [&::-moz-range-thumb]:bg-[#c49a45] [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#161412] [&::-webkit-slider-thumb]:bg-[#c49a45] [&::-webkit-slider-thumb]:shadow-md day:[&::-webkit-slider-thumb]:border-white day:[&::-webkit-slider-thumb]:bg-[#9a742f] day:[&::-moz-range-thumb]:border-white day:[&::-moz-range-thumb]:bg-[#9a742f]';
  const rangeBoundsClass =
    'mt-1.5 flex w-full justify-between font-sans text-[11px] font-medium tabular-nums text-white/50 day:text-[#786e61]';

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {hasActiveMotif ? (
        <div className="custom-scrollbar flex min-h-[calc(44dvh-128px)] flex-1 flex-col gap-3 overflow-y-auto pr-1 pb-14 md:min-h-0">
          {/* Back to all motifs bar */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => {
                setSelectedMotifId(null);
                setActivePanel(null);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:text-[#c49a45] day:text-[#6a6156] day:hover:text-[#9a742f]"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              All Motifs ({selectedMotifs.length})
            </button>
            <span className="rounded-md border border-[#c49a45]/30 bg-[#c49a45]/10 px-2 py-0.5 font-sans text-xs font-medium text-[#f0d89f] day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#9a742f]">
              Active Motif
            </span>
          </div>

          {/* Motif Info Card */}
          <div className={sectionCardClass}>
            <div className="flex items-center gap-3">
              {activeMotif?.svgPath && (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0c0b0a] day:border-[#dfd7ca] day:bg-[#f4efe6]">
                  <div
                    className="absolute inset-2"
                    style={{
                      backgroundColor: activeMotif.color || '#c49a45',
                      WebkitMaskImage: `url("${encodeURI(activeMotif.svgPath)}")`,
                      maskImage: `url("${encodeURI(activeMotif.svgPath)}")`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                    }}
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-base font-medium text-white day:text-[#1a1714]">
                  {motifPriceModel?.priceModel.name ??
                    motifPriceModel?.name ??
                    'Motif'}
                </h3>
                <p className="font-sans text-xs text-white/60 day:text-[#6a6156]">
                  Height: {formatMotifHeight(activeOffset.heightMm ?? initHeight)}{' '}
                  {lengthUnit}
                  {Math.round(rotationDegrees) !== 0 &&
                    ` · Rotation: ${Math.round(rotationDegrees)}°`}
                </p>
              </div>
            </div>
          </div>

          {/* Height Card */}
          <div className={sectionCardClass}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#c49a45] day:text-[#9a742f]">
                Height
              </span>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedMotifId) return;
                    const newVal = clampHeight(
                      (activeOffset.heightMm ?? initHeight) -
                        motifHeightStep.mm,
                    );
                    setMotifOffset(selectedMotifId, {
                      ...activeOffset,
                      heightMm: newVal,
                    });
                  }}
                  className={controlButtonClass}
                  aria-label={`Decrease height by ${motifHeightStep.label}`}
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
                  value={formatMotifHeight(
                    activeOffset.heightMm ?? initHeight,
                  )}
                  onChange={(e) => {
                    if (!selectedMotifId) return;
                    const parsedValue = parseMotifHeight(e.target.value);
                    if (parsedValue === null) return;
                    const clampedValue = clampHeight(parsedValue);
                    setMotifOffset(selectedMotifId, {
                      ...activeOffset,
                      heightMm: clampedValue,
                    });
                  }}
                  onBlur={(e) => {
                    if (!selectedMotifId) return;
                    const parsedValue = parseMotifHeight(e.target.value);
                    if (parsedValue === null) return;
                    const clampedValue = clampHeight(parsedValue);
                    setMotifOffset(selectedMotifId, {
                      ...activeOffset,
                      heightMm: clampedValue,
                    });
                  }}
                  className={`${numberInputClass} ${
                    (activeOffset.heightMm ?? initHeight) < minHeight ||
                    (activeOffset.heightMm ?? initHeight) > maxHeight
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedMotifId) return;
                    const newVal = clampHeight(
                      (activeOffset.heightMm ?? initHeight) +
                        motifHeightStep.mm,
                    );
                    setMotifOffset(selectedMotifId, {
                      ...activeOffset,
                      heightMm: newVal,
                    });
                  }}
                  className={controlButtonClass}
                  aria-label={`Increase height by ${motifHeightStep.label}`}
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
                <span className="font-sans text-xs text-white/70 day:text-[#6a6156]">
                  {lengthUnit}
                </span>
              </div>
            </div>
            <div className="relative mt-3">
              <DesignerRangeInput
                type="range"
                min={minHeight}
                max={maxHeight}
                step={motifHeightStep.mm}
                value={activeOffset.heightMm ?? initHeight}
                onChange={(e) => {
                  if (!selectedMotifId) return;
                  const clampedValue = clampHeight(Number(e.target.value));
                  setMotifOffset(selectedMotifId, {
                    ...activeOffset,
                    heightMm: clampedValue,
                  });
                }}
                className={rangeInputClass}
              />
              <div className={rangeBoundsClass}>
                <span>
                  {formatMotifHeight(minHeight)} {lengthUnit}
                </span>
                <span>
                  {formatMotifHeight(maxHeight)} {lengthUnit}
                </span>
              </div>
            </div>
          </div>

          {/* Rotation Card */}
          <div className={sectionCardClass}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#c49a45] day:text-[#9a742f]">
                Rotation
              </span>
              <div className="flex items-center justify-end gap-2">
                {Math.round(rotationDegrees) !== 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedMotifId) return;
                      setMotifOffset(selectedMotifId, {
                        ...activeOffset,
                        rotationZ: 0,
                      });
                    }}
                    className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 font-sans text-xs font-medium text-white/70 transition-colors hover:text-white day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#6a6156] day:hover:text-[#1a1714]"
                  >
                    Reset 0°
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedMotifId) return;
                    const newVal = Math.max(-180, rotationDegrees - 1);
                    setMotifOffset(selectedMotifId, {
                      ...activeOffset,
                      rotationZ: (newVal * Math.PI) / 180,
                    });
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
                  value={Math.round(rotationDegrees)}
                  onChange={(e) => {
                    if (!selectedMotifId) return;
                    setMotifOffset(selectedMotifId, {
                      ...activeOffset,
                      rotationZ: (Number(e.target.value) * Math.PI) / 180,
                    });
                  }}
                  onBlur={(e) => {
                    if (!selectedMotifId) return;
                    const val = Number(e.target.value);
                    if (val < -180) {
                      setMotifOffset(selectedMotifId, {
                        ...activeOffset,
                        rotationZ: (-180 * Math.PI) / 180,
                      });
                    } else if (val > 180) {
                      setMotifOffset(selectedMotifId, {
                        ...activeOffset,
                        rotationZ: (180 * Math.PI) / 180,
                      });
                    }
                  }}
                  className={`${numberInputClass} ${
                    rotationDegrees < -180 || rotationDegrees > 180
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedMotifId) return;
                    const newVal = Math.min(180, rotationDegrees + 1);
                    setMotifOffset(selectedMotifId, {
                      ...activeOffset,
                      rotationZ: (newVal * Math.PI) / 180,
                    });
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
                <span className="font-sans text-xs text-white/70 day:text-[#6a6156]">
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
                value={rotationDegrees}
                onChange={(e) =>
                  selectedMotifId &&
                  setMotifOffset(selectedMotifId, {
                    ...activeOffset,
                    rotationZ: (Number(e.target.value) * Math.PI) / 180,
                  })
                }
                className={rangeInputClass}
              />
              <div className={rangeBoundsClass}>
                <span>-180°</span>
                <span>0°</span>
                <span>+180°</span>
              </div>
            </div>
          </div>

          {/* Color Card */}
          {showMotifColorControls && (
            <div className={sectionCardClass}>
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#c49a45] day:text-[#9a742f]">
                  Color
                </span>
                <span className="font-serif text-xs font-medium text-white/70 day:text-[#6a6156]">
                  {data.colors.find(
                    (c) =>
                      c.hex.toLowerCase() ===
                      activeMotif?.color?.toLowerCase(),
                  )?.name ?? 'Custom'}
                </span>
              </div>
              {isEngraved && (
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      selectedMotifId &&
                      setMotifColor(selectedMotifId, '#c99d44')
                    }
                    className={`flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all ${
                      activeMotif?.color?.toLowerCase() === '#c99d44'
                        ? 'border-[#c49a45] bg-[#c49a45]/15 shadow-xs day:border-[#9a742f] day:bg-[#9a742f]/10'
                        : 'border-white/10 bg-white/[0.04] hover:border-white/20 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:hover:border-[#c5b9a8]'
                    }`}
                  >
                    <span
                      className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: '#c99d44' }}
                    >
                      {activeMotif?.color?.toLowerCase() === '#c99d44' && (
                        <svg
                          className="h-3 w-3 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="font-serif text-xs font-medium text-white day:text-[#1a1714]">
                      Gold Gilding
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      selectedMotifId &&
                      setMotifColor(selectedMotifId, '#eeeeee')
                    }
                    className={`flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all ${
                      activeMotif?.color?.toLowerCase() === '#eeeeee'
                        ? 'border-[#c49a45] bg-[#c49a45]/15 shadow-xs day:border-[#9a742f] day:bg-[#9a742f]/10'
                        : 'border-white/10 bg-white/[0.04] hover:border-white/20 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:hover:border-[#c5b9a8]'
                    }`}
                  >
                    <span
                      className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: '#eeeeee' }}
                    >
                      {activeMotif?.color?.toLowerCase() === '#eeeeee' && (
                        <svg
                          className="h-3 w-3 text-slate-900"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="font-serif text-xs font-medium text-white day:text-[#1a1714]">
                      Silver Gilding
                    </span>
                  </button>
                </div>
              )}
              <div className="mt-2.5 grid grid-cols-7 gap-2 place-items-center">
                {data.colors.map((color) => {
                  const isSelected =
                    activeMotif?.color?.toLowerCase() ===
                    color.hex.toLowerCase();
                  return (
                    <button
                      key={color.id}
                      type="button"
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-all hover:scale-105 ${
                        isSelected
                          ? 'border-[#c49a45] shadow-sm ring-2 ring-[#c49a45]/70 day:border-[#9a742f] day:ring-[#9a742f]/70'
                          : 'border-white/20 day:border-[#cfc6b8]'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() =>
                        selectedMotifId &&
                        setMotifColor(selectedMotifId, color.hex)
                      }
                      title={color.name}
                    >
                      {isSelected && (
                        <svg
                          className={`h-3.5 w-3.5 ${
                            color.hex === '#eeeeee' || color.hex === '#ffce00'
                              ? 'text-slate-900'
                              : 'text-white'
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Position & Nudge Card */}
          <div className={sectionCardClass}>
            <div className="flex items-center justify-between">
              <div className="font-sans text-xs font-semibold uppercase tracking-wider text-[#c49a45] day:text-[#9a742f]">
                Position & Nudge
              </div>
              <button
                type="button"
                onClick={centerMotifHorizontally}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-white/80 transition-all hover:border-[#c49a45]/50 hover:bg-[#c49a45]/15 hover:text-[#f0d89f] day:border-[#dfd7ca] day:bg-white day:text-[#1a1714] day:hover:border-[#9a742f] day:hover:bg-[#9a742f]/10 day:hover:text-[#9a742f]"
              >
                ↔ Center Horizontally
              </button>
            </div>

            <div className="mx-auto mt-3 grid max-w-[140px] grid-cols-3 place-items-center gap-1.5">
              <span />
              <button
                type="button"
                aria-label="Move motif up"
                onClick={() =>
                  updateMotifPosition(
                    activeOffset.xPos ?? 0,
                    (activeOffset.yPos ?? 0) + motifPositionStep,
                  )
                }
                className={`${controlButtonClass} active:scale-90`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
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
                aria-label="Move motif left"
                onClick={() =>
                  updateMotifPosition(
                    (activeOffset.xPos ?? 0) - motifPositionStep,
                    activeOffset.yPos ?? 0,
                  )
                }
                className={`${controlButtonClass} active:scale-90`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
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
                className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg border border-[#c49a45]/30 bg-[#c49a45]/10 px-1 font-sans text-xs font-semibold tabular-nums text-[#f0d89f] transition-all hover:border-[#c49a45] hover:bg-[#c49a45]/20 day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#9a742f] day:shadow-xs active:scale-90"
                title="Change nudge step"
              >
                {nudgeStep.label}
              </button>
              <button
                type="button"
                aria-label="Move motif right"
                onClick={() =>
                  updateMotifPosition(
                    (activeOffset.xPos ?? 0) + motifPositionStep,
                    activeOffset.yPos ?? 0,
                  )
                }
                className={`${controlButtonClass} active:scale-90`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
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
                aria-label="Move motif down"
                onClick={() =>
                  updateMotifPosition(
                    activeOffset.xPos ?? 0,
                    (activeOffset.yPos ?? 0) - motifPositionStep,
                  )
                }
                className={`${controlButtonClass} active:scale-90`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
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

          {/* Action Buttons Card */}
          <div className={sectionCardClass}>
            <div className="grid shrink-0 grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  selectedMotifId && duplicateMotif(selectedMotifId)
                }
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-white/10 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#1a1714] day:hover:bg-[#ede7dc]"
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Duplicate
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedMotifId) removeMotif(selectedMotifId);
                  setSelectedMotifId(null);
                  setActivePanel(null);
                }}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-red-300 transition-all hover:bg-red-900/30 day:border-red-200 day:bg-red-50 day:text-red-700 day:hover:bg-red-100 day:hover:border-red-300"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
              <button
                type="button"
                onClick={() =>
                  selectedMotifId &&
                  setMotifOffset(selectedMotifId, {
                    ...activeOffset,
                    flipX: !activeOffset.flipX,
                  })
                }
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeOffset.flipX
                    ? 'border-[#c49a45] bg-[#c49a45]/20 text-[#f0d89f] day:border-[#9a742f] day:bg-[#9a742f]/15 day:text-[#9a742f]'
                    : 'border-white/10 bg-white/[0.04] text-white hover:bg-white/10 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#1a1714] day:hover:bg-[#ede7dc]'
                }`}
              >
                Flip X
              </button>
              <button
                type="button"
                onClick={() =>
                  selectedMotifId &&
                  setMotifOffset(selectedMotifId, {
                    ...activeOffset,
                    flipY: !activeOffset.flipY,
                  })
                }
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeOffset.flipY
                    ? 'border-[#c49a45] bg-[#c49a45]/20 text-[#f0d89f] day:border-[#9a742f] day:bg-[#9a742f]/15 day:text-[#9a742f]'
                    : 'border-white/10 bg-white/[0.04] text-white hover:bg-white/10 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#1a1714] day:hover:bg-[#ede7dc]'
                }`}
              >
                Flip Y
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showMotifCatalog && (
        <div className="min-h-0 flex-1">
          <MotifSelectorPanel
            motifs={motifCatalog}
            initialCategoryId={lastMotifCategoryId}
            onCategoryOpen={setLastMotifCategoryId}
          />
        </div>
      )}
    </div>
  );
}
