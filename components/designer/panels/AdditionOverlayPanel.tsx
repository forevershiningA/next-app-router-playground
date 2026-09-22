'use client';

import React, { useCallback } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import TailwindSlider from '#/ui/TailwindSlider';

export default function AdditionOverlayPanel() {
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const additionOffsets = useHeadstoneStore((s) => s.additionOffsets);
  const setAdditionOffset = useHeadstoneStore((s) => s.setAdditionOffset);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const removeAddition = useHeadstoneStore((s) => s.removeAddition);
  const duplicateAddition = useHeadstoneStore((s) => s.duplicateAddition);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  const activeId = selectedAdditionId;
  const activeOffset = activeId ? (additionOffsets[activeId] || {
    xPos: 0,
    yPos: 0,
    zPos: 0,
    scale: 1,
    rotationZ: 0,
  }) : null;

  const handleClose = useCallback(() => {
    setSelectedAdditionId(null);
    setActivePanel(null);
  }, [setSelectedAdditionId, setActivePanel]);

  const handleDuplicate = useCallback(() => {
    if (!activeId) return;
    duplicateAddition(activeId);
  }, [activeId, duplicateAddition]);

  const handleDelete = useCallback(() => {
    if (!activeId) return;
    removeAddition(activeId);
    setSelectedAdditionId(null);
  }, [activeId, removeAddition, setSelectedAdditionId]);

  const updateOffset = useCallback(
    (patch: Partial<typeof activeOffset>) => {
      if (!activeId || !activeOffset) return;
      setAdditionOffset(activeId, {
        ...activeOffset,
        ...patch,
      });
    },
    [activeId, activeOffset, setAdditionOffset],
  );

  // Only show panel if addition panel is active and an addition is selected
  // Hide if any other panel is active
  const isOpen = activePanel === 'addition' && !!activeId;

  // Don't render at all if not open
  if (!isOpen || !activeId || !activeOffset) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <h3 className="text-base font-medium text-white">Edit Addition</h3>
        <button
          onClick={handleClose}
          className="text-white/60 hover:text-white transition-colors"
          title="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="text-sm text-white/70">
          Selected: <span className="font-semibold text-white">{activeId}</span>
        </div>

        <div className="flex space-x-2">
          <button
            className="flex-1 cursor-pointer rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            onClick={handleDuplicate}
            title="Duplicate this addition"
          >
            Duplicate
          </button>
          <button
            className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            onClick={handleDelete}
            title="Remove this addition"
          >
            Delete
          </button>
        </div>

        <div className="space-y-4">
          <TailwindSlider
            label="Size"
            value={activeOffset.scale ?? 1}
            min={0.1}
            max={3}
            step={0.05}
            onChange={(v) => updateOffset({ scale: v })}
            unit="×"
          />
          <TailwindSlider
            label="Rotation"
            value={((activeOffset.rotationZ ?? 0) * 180) / Math.PI}
            min={-180}
            max={180}
            step={1}
            onChange={(v) => updateOffset({ rotationZ: (v * Math.PI) / 180 })}
            unit="°"
          />
        </div>
      </div>
    </div>
  );
}
