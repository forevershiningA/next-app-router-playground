'use client';

import DesignerRangeInput from '#/components/designer/ui/DesignerRangeInput';

import React from 'react';
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
  const [lastMotifCategoryId, setLastMotifCategoryId] = React.useState<
    string | null
  >(null);
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
  const controlButtonClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.08] text-white transition-colors hover:border-[#D7B356]/50 hover:bg-white/[0.13] day:border-gray-200 day:bg-gray-100 day:text-gray-700 day:hover:bg-gray-200';
  const numberInputClass =
    'h-8 w-16 rounded-md border border-white/10 bg-white/[0.08] px-2 text-right text-sm font-semibold text-white transition-colors focus:border-[#D7B356] focus:ring-2 focus:ring-[#D7B356]/30 focus:outline-none day:border-gray-300 day:bg-gray-100 day:text-gray-900';
  const rangeInputClass =
    'fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#171717] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.35),0_0_0_3px_rgba(0,0,0,0.25)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.55),0_0_0_3px_rgba(0,0,0,0.25)] [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#171717] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.35),0_0_0_3px_rgba(0,0,0,0.25)]';
  const rangeBoundsClass =
    'mt-1 flex w-full justify-between text-xs text-white/60 day:text-gray-600';
  return (
    <div className="flex h-full flex-col gap-4">
      {hasActiveMotif ? (
        <div className="custom-scrollbar flex min-h-[calc(44dvh-128px)] flex-1 flex-col gap-3 overflow-y-auto pr-1 md:min-h-0">
          <div className="day:text-gray-900 px-1 pt-1 text-sm font-semibold text-white">
            {motifPriceModel?.priceModel.name ??
              motifPriceModel?.name ??
              'Motif'}
          </div>
          <div className="flex flex-col gap-3">
            <div className="order-3 space-y-2 px-1 pt-1">
              <div className="flex items-center justify-between gap-3">
                <label className="day:text-gray-800 text-sm font-semibold text-slate-100">
                  Height
                </label>
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
                  <span className="day:text-gray-600 text-sm font-semibold text-white/60">
                    {lengthUnit}
                  </span>
                </div>
              </div>
              <div className="relative">
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
                    {formatMotifHeight(minHeight)}
                    {lengthUnit}
                  </span>
                  <span>
                    {formatMotifHeight(maxHeight)}
                    {lengthUnit}
                  </span>
                </div>
              </div>
            </div>

            <div className="order-4 space-y-2 px-1 pt-1">
              <div className="flex items-center justify-between gap-3">
                <label className="day:text-gray-800 text-sm font-semibold text-slate-100">
                  Rotation
                </label>
                <div className="flex items-center justify-end gap-2">
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
                  <span className="day:text-gray-600 text-sm font-semibold text-white/60">
                    °
                  </span>
                </div>
              </div>
              <div className="relative">
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
                  <span>180°</span>
                </div>
              </div>
            </div>

            {showMotifColorControls && (
              <div className="order-5 space-y-2 px-1 pt-1">
                <label className="day:text-gray-800 block text-sm font-semibold text-slate-100">
                  Color
                </label>
                {isEngraved && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        selectedMotifId &&
                        setMotifColor(selectedMotifId, '#c99d44')
                      }
                      className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-colors ${
                        activeMotif?.color === '#c99d44'
                          ? 'day:bg-amber-50 border-[#D7B356] bg-[#211A10]'
                          : 'day:border-gray-200 day:bg-gray-50 border-white/10 bg-white/[0.04] hover:border-[#D7B356]/50'
                      }`}
                    >
                      <span
                        className="day:border-gray-300 h-5 w-5 rounded border border-white/20"
                        style={{ backgroundColor: '#c99d44' }}
                      />
                      <span className="day:text-gray-700 text-xs font-semibold text-white/80">
                        Gold Gilding
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        selectedMotifId &&
                        setMotifColor(selectedMotifId, '#eeeeee')
                      }
                      className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-colors ${
                        activeMotif?.color === '#eeeeee'
                          ? 'day:bg-amber-50 border-[#D7B356] bg-[#211A10]'
                          : 'day:border-gray-200 day:bg-gray-50 border-white/10 bg-white/[0.04] hover:border-[#D7B356]/50'
                      }`}
                    >
                      <span
                        className="day:border-gray-300 h-5 w-5 rounded border border-white/20"
                        style={{ backgroundColor: '#eeeeee' }}
                      />
                      <span className="day:text-gray-700 text-xs font-semibold text-white/80">
                        Silver Gilding
                      </span>
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-7 gap-1.5">
                  {data.colors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      className={`h-7 w-7 rounded-md border transition-transform hover:scale-105 ${
                        activeMotif?.color === color.hex
                          ? 'border-[#D7B356] ring-2 ring-[#D7B356]/70'
                          : 'day:border-gray-300 border-white/20'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() =>
                        selectedMotifId &&
                        setMotifColor(selectedMotifId, color.hex)
                      }
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="day:border-gray-200 shrink-0 border-t border-white/10 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  selectedMotifId && duplicateMotif(selectedMotifId)
                }
                className="day:bg-white day:text-[#8a6a12] rounded-lg border border-[#D7B356]/60 bg-[#171717] px-3 py-2 text-sm font-semibold text-[#F2D58B] transition-colors hover:bg-[#D7B356]/15"
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedMotifId) removeMotif(selectedMotifId);
                  setSelectedMotifId(null);
                  setActivePanel(null);
                }}
                className="day:bg-white day:text-red-700 rounded-lg border border-red-500/50 bg-[#171717] px-3 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/15"
              >
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
                className="day:bg-white day:text-[#8a6a12] rounded-lg border border-[#D7B356]/60 bg-[#171717] px-3 py-2 text-sm font-semibold text-[#F2D58B] transition-colors hover:bg-[#D7B356]/15"
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
                className="day:bg-white day:text-[#8a6a12] rounded-lg border border-[#D7B356]/60 bg-[#171717] px-3 py-2 text-sm font-semibold text-[#F2D58B] transition-colors hover:bg-[#D7B356]/15"
              >
                Flip Y
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showMotifCatalog && (
        <div className="day:border-gray-200 day:bg-white min-h-[calc(44dvh-128px)] flex-1 overflow-hidden rounded-lg border border-white/10 bg-[#171717] p-3.5 shadow-lg shadow-black/15 md:min-h-0">
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
