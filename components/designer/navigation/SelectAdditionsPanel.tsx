'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import DesignerRangeInput from '#/components/designer/ui/DesignerRangeInput';
import { data } from '#/app/_internal/_data';
import AdditionSelector from '#/components/designer/selectors/AdditionSelector';
import { formatDimensionTriplet } from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';
import { useHeadstoneStore } from '#/lib/headstone-store';

type SelectAdditionsPanelProps = {
  forceAdditionCatalog: boolean;
  panelSource: 'menu' | 'canvas' | null;
  isSelectAdditionsPage: boolean;
};

export default function SelectAdditionsPanel({
  forceAdditionCatalog,
  panelSource,
  isSelectAdditionsPage,
}: SelectAdditionsPanelProps) {
  const unitSystem = useUnitSystem();
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const additionOffsets = useHeadstoneStore((s) => s.additionOffsets);
  const setAdditionOffset = useHeadstoneStore((s) => s.setAdditionOffset);
  const setSelectedAdditionId = useHeadstoneStore(
    (s) => s.setSelectedAdditionId,
  );
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const removeAddition = useHeadstoneStore((s) => s.removeAddition);
  const duplicateAddition = useHeadstoneStore((s) => s.duplicateAddition);
  const additionsList = data.additions || [];
  const activeAdditionOffset = selectedAdditionId
    ? additionOffsets[selectedAdditionId] || {
        xPos: 0,
        yPos: 0,
        scale: 1,
        rotationZ: 0,
      }
    : null;
  const hasActiveAddition =
    !!selectedAdditionId &&
    !!activeAdditionOffset &&
    activePanel === 'addition';

  // Find the addition type to determine if rotation should be enabled
  // Extract base ID from instance ID (e.g., "K0096_177030562074Z" -> "K0096")
  const baseAdditionId = selectedAdditionId?.split('_')[0];
  const activeAddition = baseAdditionId
    ? additionsList.find((a) => a.id === baseAdditionId)
    : null;
  const dirName = activeAddition?.file?.split('/')?.[0] || '';
  const imagePath = activeAddition
    ? `/additions/${dirName}/${activeAddition.image}`
    : null;
  const additionSizes = activeAddition?.sizes ?? [];
  const maxSize = additionSizes.length;
  const selectedSizeVariant = Math.max(
    1,
    Math.min(maxSize || 1, Math.round(activeAdditionOffset?.sizeVariant ?? 1)),
  );
  const isStatueOrVase =
    activeAddition?.type === 'statue' || activeAddition?.type === 'vase';
  const activeAdditionDisplayName =
    activeAddition?.name.replace(
      /^Applicazione\s+Preghiera/i,
      'Praying Hands Motif',
    ) ?? '';

  const additionRotation =
    ((activeAdditionOffset?.rotationZ ?? 0) * 180) / Math.PI;
  const showAdditionCatalog =
    forceAdditionCatalog ||
    panelSource === 'menu' ||
    (panelSource === null && isSelectAdditionsPage);

  const nudgeSteps = [
    { label: '1 mm', value: 1 },
    { label: '5 mm', value: 5 },
    { label: '10 mm', value: 10 },
  ];
  const [nudgeStepIndex, setNudgeStepIndex] = useState(0);
  const nudgeStep = nudgeSteps[nudgeStepIndex];
  const additionPositionStep = nudgeStep.value;

  const updateAdditionPosition = (xPos: number, yPos: number) => {
    if (!selectedAdditionId || !activeAdditionOffset) return;
    setAdditionOffset(selectedAdditionId, {
      ...activeAdditionOffset,
      xPos,
      yPos,
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
      {hasActiveAddition ? (
        <div className="custom-scrollbar flex min-h-[calc(44dvh-128px)] flex-1 flex-col gap-3 overflow-y-auto pr-1 md:min-h-0">
          {/* Back to all additions bar */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => {
                setSelectedAdditionId(null);
                setActivePanel(null);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:text-[#c49a45] day:text-[#6a6156] day:hover:text-[#9a742f]"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              All Additions ({selectedAdditions.length})
            </button>
            <span className="rounded-md border border-[#c49a45]/30 bg-[#c49a45]/10 px-2 py-0.5 font-sans text-xs font-medium text-[#f0d89f] day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#9a742f]">
              Active Addition
            </span>
          </div>

          {/* Addition Info & Size Card */}
          <div className={sectionCardClass}>
            <div className="flex items-center gap-3">
              {imagePath && (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0c0b0a] day:border-[#dfd7ca] day:bg-[#f4efe6]">
                  <Image
                    src={imagePath}
                    alt={activeAdditionDisplayName}
                    fill
                    sizes="56px"
                    className="object-contain p-1.5"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-base font-medium text-white day:text-[#1a1714]">
                  {activeAdditionDisplayName}
                </h3>
                {additionSizes[selectedSizeVariant - 1] && (
                  <p className="font-sans text-xs text-white/60 day:text-[#6a6156]">
                    {formatDimensionTriplet(
                      additionSizes[selectedSizeVariant - 1].width,
                      additionSizes[selectedSizeVariant - 1].height,
                      additionSizes[selectedSizeVariant - 1].depth,
                      unitSystem,
                    )}
                  </p>
                )}
              </div>
            </div>

            {maxSize > 1 && (
              <div className="mt-3 border-t border-white/10 pt-3 day:border-[#dfd7ca]">
                <div className="mb-2 font-sans text-xs font-semibold tracking-wider text-[#c49a45] uppercase day:text-[#9a742f]">
                  Size
                </div>
                <select
                  value={selectedSizeVariant}
                  onChange={(e) => {
                    if (!selectedAdditionId || !activeAdditionOffset) return;
                    setAdditionOffset(selectedAdditionId, {
                      ...activeAdditionOffset,
                      sizeVariant: Number(e.target.value),
                      scale: 1,
                    });
                  }}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-sans text-xs font-semibold text-white transition-colors outline-none focus:border-[#c49a45] focus:ring-2 focus:ring-[#c49a45]/20 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#1a1714] day:focus:border-[#9a742f] day:shadow-sm [&>option]:bg-white [&>option]:text-gray-900"
                >
                  {additionSizes.map((size, index) => (
                    <option
                      key={`${size.width}-${size.height}-${size.depth}-${index}`}
                      value={index + 1}
                    >
                      {formatDimensionTriplet(
                        size.width,
                        size.height,
                        size.depth,
                        unitSystem,
                      )}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Position Nudge Controls */}
          <div className={sectionCardClass}>
            <div className="mb-2 font-sans text-xs font-semibold tracking-wider text-[#c49a45] uppercase day:text-[#9a742f]">
              Position
            </div>
            <button
              type="button"
              onClick={() =>
                updateAdditionPosition(0, activeAdditionOffset.yPos ?? 0)
              }
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 transition-all hover:border-[#c49a45] hover:bg-[#c49a45]/15 hover:text-[#f0d89f] day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#5a5248] day:hover:border-[#9a742f] day:hover:text-[#1a1714]"
            >
              <span aria-hidden="true">↔</span>
              Center Horizontally
            </button>
            <div className="grid grid-cols-3 place-items-center gap-1">
              <span />
              <button
                type="button"
                aria-label="Move addition up"
                onClick={() =>
                  updateAdditionPosition(
                    activeAdditionOffset.xPos ?? 0,
                    (activeAdditionOffset.yPos ?? 0) + additionPositionStep,
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
                aria-label="Move addition left"
                onClick={() =>
                  updateAdditionPosition(
                    (activeAdditionOffset.xPos ?? 0) - additionPositionStep,
                    activeAdditionOffset.yPos ?? 0,
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
                className="rounded px-2 py-1 text-xs font-semibold text-[#f0d89f] transition-colors hover:bg-[#c49a45]/15 day:text-[#9a742f]"
              >
                {nudgeStep.label}
              </button>
              <button
                type="button"
                aria-label="Move addition right"
                onClick={() =>
                  updateAdditionPosition(
                    (activeAdditionOffset.xPos ?? 0) + additionPositionStep,
                    activeAdditionOffset.yPos ?? 0,
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
                aria-label="Move addition down"
                onClick={() =>
                  updateAdditionPosition(
                    activeAdditionOffset.xPos ?? 0,
                    (activeAdditionOffset.yPos ?? 0) - additionPositionStep,
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

          {/* Rotation Card - Only shown for applications */}
          {!isStatueOrVase && (
            <div className={sectionCardClass}>
              <div className="flex items-center justify-between">
                <div className="font-sans text-xs font-semibold tracking-wider text-[#c49a45] uppercase day:text-[#9a742f]">
                  Rotation
                </div>
                <div className="flex items-center gap-2">
                  {Math.round(additionRotation) !== 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedAdditionId || !activeAdditionOffset) return;
                        setAdditionOffset(selectedAdditionId, {
                          ...activeAdditionOffset,
                          rotationZ: 0,
                        });
                      }}
                      className="rounded border border-[#c49a45]/50 px-2 py-0.5 text-xs font-semibold text-[#f0d89f] transition-colors hover:bg-[#c49a45]/15 day:border-[#9a742f]/40 day:text-[#9a742f] day:hover:bg-[#9a742f]/10"
                    >
                      Reset 0°
                    </button>
                  )}
                  <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 font-sans text-xs font-semibold tabular-nums text-white/70 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#6a6156]">
                    {Math.round(additionRotation)}°
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedAdditionId || !activeAdditionOffset) return;
                    const newVal = Math.max(-180, additionRotation - 1);
                    setAdditionOffset(selectedAdditionId, {
                      ...activeAdditionOffset,
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
                  value={Math.round(additionRotation)}
                  onChange={(e) => {
                    if (!selectedAdditionId || !activeAdditionOffset) return;
                    setAdditionOffset(selectedAdditionId, {
                      ...activeAdditionOffset,
                      rotationZ: (Number(e.target.value) * Math.PI) / 180,
                    });
                  }}
                  onBlur={(e) => {
                    if (!selectedAdditionId || !activeAdditionOffset) return;
                    const val = Number(e.target.value);
                    if (val < -180) {
                      setAdditionOffset(selectedAdditionId, {
                        ...activeAdditionOffset,
                        rotationZ: (-180 * Math.PI) / 180,
                      });
                    } else if (val > 180) {
                      setAdditionOffset(selectedAdditionId, {
                        ...activeAdditionOffset,
                        rotationZ: (180 * Math.PI) / 180,
                      });
                    }
                  }}
                  className={numberInputClass}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedAdditionId || !activeAdditionOffset) return;
                    const newVal = Math.min(180, additionRotation + 1);
                    setAdditionOffset(selectedAdditionId, {
                      ...activeAdditionOffset,
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

              <div className="relative mt-3">
                <DesignerRangeInput
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={additionRotation}
                  onChange={(e) => {
                    if (selectedAdditionId && activeAdditionOffset) {
                      setAdditionOffset(selectedAdditionId, {
                        ...activeAdditionOffset,
                        rotationZ: (Number(e.target.value) * Math.PI) / 180,
                      });
                    }
                  }}
                  className={rangeInputClass}
                />
                <div className={rangeBoundsClass}>
                  <span>-180°</span>
                  <span>0°</span>
                  <span>+180°</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Card */}
          <div className={sectionCardClass}>
            <div className="grid shrink-0 grid-cols-2 gap-2">
              <button
                type="button"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-white/10 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#1a1714] day:hover:bg-[#ede7dc]"
                onClick={() =>
                  selectedAdditionId && duplicateAddition(selectedAdditionId)
                }
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
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-red-300 transition-all hover:bg-red-900/30 day:border-red-200 day:bg-red-50 day:text-red-700"
                onClick={() => {
                  if (selectedAdditionId) {
                    removeAddition(selectedAdditionId);
                    setSelectedAdditionId(null);
                    setActivePanel(null);
                  }
                }}
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
            </div>
          </div>
        </div>
      ) : null}

      {showAdditionCatalog && !hasActiveAddition && (
        <div className="min-h-0 flex-1">
          <AdditionSelector additions={additionsList} />
        </div>
      )}
    </div>
  );
}
