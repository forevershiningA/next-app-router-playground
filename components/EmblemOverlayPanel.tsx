'use client';

import React, { useCallback } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import TailwindSlider from '#/ui/TailwindSlider';
import { EMBLEM_SIZES } from '#/app/_internal/_emblems-loader';

export default function EmblemOverlayPanel() {
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

  const emblemName = activeEmblem?.emblemId
    ?.replace(/^br\d+[lr]?[-_]?/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Emblem';

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-base font-medium text-white">Edit Emblem</h3>
        <button
          onClick={handleClose}
          className="text-white/60 hover:text-white transition-colors"
          title="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div className="text-sm text-white/70">
          <span className="font-semibold text-white">{emblemName}</span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            className="flex-1 cursor-pointer rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            onClick={handleDuplicate}
          >
            Duplicate
          </button>
          <button
            className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>

        {/* Size slider (fixed sizes) */}
        <TailwindSlider
          label={`Size ${activeOffset.widthMm ?? ''}×${activeOffset.heightMm ?? ''}mm`}
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
                ? 'bg-violet-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            onClick={() => updateOffset({ flipX: !activeOffset.flipX })}
          >
            Flip X
          </button>
          <button
            className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeOffset.flipY
                ? 'bg-violet-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            onClick={() => updateOffset({ flipY: !activeOffset.flipY })}
          >
            Flip Y
          </button>
        </div>
      </div>
    </div>
  );
}
