'use client';

import React, { useCallback } from 'react';
import SceneOverlayController from '#/components/SceneOverlayController';
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
    scale: 1,
    rotationZ: 0,
  }) : null;

  // Debug logging
  React.useEffect(() => {
    console.log('AdditionOverlayPanel state:', {
      selectedAdditionId,
      activePanel,
      activeOffset,
      isOpen: activePanel === 'addition' && !!activeId,
    });
  }, [selectedAdditionId, activePanel, activeOffset, activeId]);

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
    console.log('AdditionOverlayPanel NOT rendering:', { isOpen, activeId, hasOffset: !!activeOffset });
    return null;
  }

  console.log('AdditionOverlayPanel IS rendering!');

  return (
    <SceneOverlayController
      section="addition"
      title="Edit Addition"
      persistKey="addition"
      isOpen={isOpen}
      onClose={handleClose}
    >
      <div className="mb-4 text-sm text-white/70">
        Selected Addition: <span className="font-semibold text-white">{activeId}</span>
      </div>

      <div className="mb-4 flex space-x-2">
        <button
          className="flex-1 cursor-pointer rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none"
          onClick={handleDuplicate}
          title="Duplicate this addition"
        >
          Duplicate
        </button>
        <button
          className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
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
    </SceneOverlayController>
  );
}
