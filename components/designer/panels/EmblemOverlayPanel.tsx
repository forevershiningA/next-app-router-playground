'use client';

import React, { useCallback } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import TailwindSlider from '#/ui/TailwindSlider';
import { EMBLEM_SIZES } from '#/app/_internal/_emblems-loader';
import { formatDimensionPair } from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';

export default function EmblemOverlayPanel() {
  const unitSystem = useUnitSystem();
  const selectedEmblemId = useHeadstoneStore((s) => s.selectedEmblemId);
  const setSelectedEmblemId = useHeadstoneStore((s) => s.setSelectedEmblemId);
  const selectedEmblems = useHeadstoneStore((s) => s.selectedEmblems);
  const emblemOffsets = useHeadstoneStore((s) => s.emblemOffsets);
  const setEmblemOffset = useHeadstoneStore((s) => s.setEmblemOffset);
  const removeEmblem = useHeadstoneStore((s) => s.removeEmblem);
  const duplicateEmblem = useHeadstoneStore((s) => s.duplicateEmblem);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  const activeId = selectedEmblemId;
  const activeOffset = activeId ? emblemOffsets[activeId] : null;
  const activeEmblem = activeId
    ? selectedEmblems.find((e) => e.id === activeId)
    : null;

  const handleClose = useCallback(() => {
    setSelectedEmblemId(null);
    setActivePanel(null);
  }, [setSelectedEmblemId, setActivePanel]);

  const handleDuplicate = useCallback(() => {
    if (!activeId) return;
    duplicateEmblem(activeId);
  }, [activeId, duplicateEmblem]);

  const handleDelete = useCallback(() => {
    if (!activeId) return;
    removeEmblem(activeId);
    setSelectedEmblemId(null);
  }, [activeId, removeEmblem, setSelectedEmblemId]);

  const updateOffset = useCallback(
    (patch: Partial<NonNullable<typeof activeOffset>>) => {
      if (!activeId || !activeOffset) return;
      setEmblemOffset(activeId, patch);
    },
    [activeId, activeOffset, setEmblemOffset],
  );

  const handleSizeChange = useCallback(
    (variant: number) => {
      updateOffset({ sizeVariant: variant });
    },
    [updateOffset],
  );

  const isOpen = activePanel === 'emblem' && !!activeId;
  if (!isOpen || !activeId || !activeOffset) return null;

  const emblemName =
    activeEmblem?.emblemId
      ?.replace(/^br\d+[lr]?[-_]?/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Emblem';

  return (
    <div className="w-full">
      {/* Header */}
      <div className="day:border-gray-200 mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="day:text-gray-900 text-base font-medium text-white">
          Edit Emblem
        </h3>
        <button
          onClick={handleClose}
          className="day:text-gray-500 day:hover:text-gray-900 text-white/60 transition-colors hover:text-white"
          title="Close"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div className="day:text-gray-600 text-sm text-white/70">
          <span className="day:text-gray-900 font-semibold text-white">
            {emblemName}
          </span>
        </div>

        {/* Size slider (fixed sizes) */}
        <TailwindSlider
          label={`Size ${formatDimensionPair(activeOffset.widthMm ?? 0, activeOffset.heightMm ?? 0, unitSystem)}`}
          value={activeOffset.sizeVariant}
          min={1}
          max={EMBLEM_SIZES.length}
          step={1}
          onChange={(v) => handleSizeChange(v)}
        />

        {/* Rotation */}
        <TailwindSlider
          label="Rotation"
          value={((activeOffset.rotationZ ?? 0) * 180) / Math.PI}
          min={-180}
          max={180}
          step={1}
          onChange={(v) => updateOffset({ rotationZ: (v * Math.PI) / 180 })}
          unit="°"
        />

        {/* Flip */}
        <div className="flex space-x-2">
          <button
            className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeOffset.flipX
                ? 'day:bg-[#D7B356] day:text-slate-950 bg-[#D7B356] text-slate-950'
                : 'day:border-gray-300 day:bg-gray-100 day:text-gray-700 day:hover:bg-gray-200 border border-transparent bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            onClick={() => updateOffset({ flipX: !activeOffset.flipX })}
          >
            Flip X
          </button>
          <button
            className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeOffset.flipY
                ? 'day:bg-[#D7B356] day:text-slate-950 bg-[#D7B356] text-slate-950'
                : 'day:border-gray-300 day:bg-gray-100 day:text-gray-700 day:hover:bg-gray-200 border border-transparent bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            onClick={() => updateOffset({ flipY: !activeOffset.flipY })}
          >
            Flip Y
          </button>
        </div>

        {/* Actions follow the controls so they stay visible without a large spacer. */}
        <div className="day:border-gray-200 flex space-x-2 border-t border-white/10 pt-3">
          <button
            className="day:border-[#c99a3e] day:bg-[#f6efe3] day:text-[#795814] day:hover:bg-[#eddfc5] flex-1 cursor-pointer rounded-lg border border-[#D7B356]/60 bg-[#D7B356]/15 px-3 py-2 text-sm font-medium text-[#F2D58B] transition-colors hover:bg-[#D7B356]/25"
            onClick={handleDuplicate}
          >
            Duplicate
          </button>
          <button
            className="day:border-red-300 day:bg-red-50 day:text-red-700 day:hover:bg-red-100 flex-1 cursor-pointer rounded-lg border border-red-500/60 bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
