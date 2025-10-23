'use client';

import React, { useCallback } from 'react';
import SceneOverlayController from '#/components/SceneOverlayController';
import { useHeadstoneStore } from '#/lib/headstone-store';
import TailwindSlider from '#/ui/TailwindSlider';
import { data } from '#/app/_internal/_data';
import { calculateMotifPrice } from '#/lib/motif-pricing';

export default function EditMotifPanel() {
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const setMotifOffset = useHeadstoneStore((s) => s.setMotifOffset);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const removeMotif = useHeadstoneStore((s) => s.removeMotif);
  const duplicateMotif = useHeadstoneStore((s) => s.duplicateMotif);
  const setMotifColor = useHeadstoneStore((s) => s.setMotifColor);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const motifPriceModel = useHeadstoneStore((s) => s.motifPriceModel);

  const activeId = selectedMotifId;
  const activeMotif = selectedMotifs.find((m) => m.id === activeId);
  const activeOffset = activeId ? (motifOffsets[activeId] || {
    xPos: 0,
    yPos: 0,
    scale: 1,
    rotationZ: 0,
    heightMm: 100,
  }) : null;

  // Determine motif size limits based on product type
  const isLaser = catalog?.product.laser === '1';
  const isBronze = catalog?.product.type === 'bronze_plaque';
  
  let minHeight = 40;
  let maxHeight = 1000;
  let initHeight = 100;
  
  if (isLaser) {
    minHeight = 40;
    maxHeight = 600; // or 1200 for free
    initHeight = 40;
  } else if (isBronze) {
    minHeight = 40;
    maxHeight = 150;
    initHeight = 100;
  } else {
    // Engraved
    minHeight = 40;
    maxHeight = 1000;
    initHeight = 100;
  }

  const handleClose = useCallback(() => {
    setSelectedMotifId(null);
    setActivePanel(null);
  }, [setSelectedMotifId, setActivePanel]);

  const handleDuplicate = useCallback(() => {
    if (!activeId) return;
    duplicateMotif(activeId);
  }, [activeId, duplicateMotif]);

  const handleDelete = useCallback(() => {
    if (!activeId) return;
    removeMotif(activeId);
    setSelectedMotifId(null);
  }, [activeId, removeMotif, setSelectedMotifId]);

  const updateOffset = useCallback(
    (patch: Partial<typeof activeOffset>) => {
      if (!activeId || !activeOffset) return;
      setMotifOffset(activeId, {
        ...activeOffset,
        ...patch,
      });
    },
    [activeId, activeOffset, setMotifOffset],
  );

  // Only show panel if a motif is selected
  const isOpen = activePanel === 'motif' && !!activeId;

  // Calculate individual motif price (free for laser products)
  const motifPrice = motifPriceModel
    ? calculateMotifPrice(
        activeOffset?.heightMm ?? 100,
        activeMotif?.color ?? '#c99d44',
        motifPriceModel.priceModel,
        isLaser
      )
    : 0;

  // Don't render at all if not open
  if (!isOpen || !activeId || !activeOffset || !activeMotif) {
    return null;
  }

  return (
    <SceneOverlayController
      section="motif"
      title="Edit Motif"
      persistKey="motif"
      isOpen={isOpen}
      onClose={handleClose}
    >
      <div className="mb-4 text-sm text-white/70">
        Selected Motif: <span className="font-semibold text-white">{activeId}</span>
      </div>

      {motifPrice > 0 && (
        <div className="mb-4 border border-white/20 bg-white/5 p-3">
          <div className="text-xs text-white/70 mb-1">Motif Price</div>
          <div className="text-2xl font-bold text-white">
            ${motifPrice.toFixed(2)}
          </div>
        </div>
      )}

      <div className="mb-4 flex space-x-2">
        <button
          className="flex-1 cursor-pointer bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none"
          onClick={handleDuplicate}
          title="Duplicate this motif"
        >
          Duplicate
        </button>
        <button
          className="flex-1 cursor-pointer bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
          onClick={handleDelete}
          title="Remove this motif"
        >
          Delete
        </button>
      </div>

      <div className="space-y-4">
        <TailwindSlider
          label="Height (mm)"
          value={activeOffset.heightMm ?? initHeight}
          min={minHeight}
          max={maxHeight}
          step={1}
          onChange={(v) => updateOffset({ heightMm: v })}
          unit="mm"
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

        {/* Color Selection - Hidden for laser products */}
        {!isLaser && (
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Select Color
            </label>
            <div className="grid grid-cols-2 gap-1 mb-2">
              <div
                className="flex cursor-pointer flex-col items-center gap-1.5 border border-white/20 p-2 transition-colors hover:bg-white/10"
                onClick={() => setMotifColor(activeId, '#c99d44')}
              >
                <div
                  className="h-5 w-5 border border-white/20"
                  style={{ backgroundColor: '#c99d44' }}
                />
                <span className="text-xs">Gold Gilding</span>
              </div>
              <div
                className="flex cursor-pointer flex-col items-center gap-1.5 border border-white/20 p-2 transition-colors hover:bg-white/10"
                onClick={() => setMotifColor(activeId, '#eeeeee')}
              >
                <div
                  className="h-5 w-5 border border-white/20"
                  style={{ backgroundColor: '#eeeeee' }}
                />
                <span className="text-xs">Silver Gilding</span>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {data.colors.map((color) => (
                <div
                  key={color.id}
                  className="h-6 w-6 cursor-pointer border border-white/20"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setMotifColor(activeId, color.hex)}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </SceneOverlayController>
  );
}
