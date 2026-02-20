'use client';

import React, { useCallback } from 'react';
import SceneOverlayController from '#/components/SceneOverlayController';
import { useHeadstoneStore } from '#/lib/headstone-store';
import TailwindSlider from '#/ui/TailwindSlider';

export default function EditImagePanel() {
  const selectedImageId = useHeadstoneStore((s) => s.selectedImageId);
  const setSelectedImageId = useHeadstoneStore((s) => s.setSelectedImageId);
  const selectedImages = useHeadstoneStore((s) => s.selectedImages);
  const removeImage = useHeadstoneStore((s) => s.removeImage);
  const duplicateImage = useHeadstoneStore((s) => s.duplicateImage);
  const updateImagePosition = useHeadstoneStore((s) => s.updateImagePosition);
  const updateImageSize = useHeadstoneStore((s) => s.updateImageSize);
  const updateImageRotation = useHeadstoneStore((s) => s.updateImageRotation);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  const activeId = selectedImageId;
  const activeImage = selectedImages.find((img) => img.id === activeId);

  const handleClose = useCallback(() => {
    setSelectedImageId(null);
    setActivePanel(null);
  }, [setSelectedImageId, setActivePanel]);

  const handleDuplicate = useCallback(() => {
    if (!activeId) return;
    duplicateImage(activeId);
  }, [activeId, duplicateImage]);

  const handleDelete = useCallback(() => {
    if (!activeId) return;
    removeImage(activeId);
    setSelectedImageId(null);
    setActivePanel(null);
  }, [activeId, removeImage, setSelectedImageId, setActivePanel]);

  if (!activeId || !activeImage || activePanel !== 'image') {
    return null;
  }

  return (
    <SceneOverlayController onClose={handleClose}>
      <div className="flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Edit Image</h2>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Info */}
        <div className="bg-white/5 rounded p-3 text-sm">
          <div className="text-white/60">Type:</div>
          <div>{activeImage.typeName}</div>
        </div>

        {/* Position Controls */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-white/80">Position</div>
          
          {/* X Position */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/60">Horizontal (X)</label>
              <span className="text-xs text-white/80">{activeImage.xPos.toFixed(1)} mm</span>
            </div>
            <TailwindSlider
              value={activeImage.xPos}
              onChange={(val) => updateImagePosition(activeId, val, activeImage.yPos)}
              min={-200}
              max={200}
              step={1}
            />
          </div>

          {/* Y Position */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/60">Vertical (Y)</label>
              <span className="text-xs text-white/80">{activeImage.yPos.toFixed(1)} mm</span>
            </div>
            <TailwindSlider
              value={activeImage.yPos}
              onChange={(val) => updateImagePosition(activeId, activeImage.xPos, val)}
              min={-200}
              max={200}
              step={1}
            />
          </div>
        </div>

        {/* Size Controls */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-white/80">Size</div>
          
          {/* Width */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/60">Width</label>
              <span className="text-xs text-white/80">{activeImage.widthMm.toFixed(0)} mm</span>
            </div>
            <TailwindSlider
              value={activeImage.widthMm}
              onChange={(val) => {
                const aspectRatio = activeImage.heightMm / activeImage.widthMm;
                updateImageSize(activeId, val, val * aspectRatio);
              }}
              min={20}
              max={300}
              step={1}
            />
          </div>

          {/* Height */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/60">Height</label>
              <span className="text-xs text-white/80">{activeImage.heightMm.toFixed(0)} mm</span>
            </div>
            <TailwindSlider
              value={activeImage.heightMm}
              onChange={(val) => {
                const aspectRatio = activeImage.widthMm / activeImage.heightMm;
                updateImageSize(activeId, val * aspectRatio, val);
              }}
              min={20}
              max={300}
              step={1}
            />
          </div>
        </div>

        {/* Rotation */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-white/80">Rotation</div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/60">Angle</label>
              <span className="text-xs text-white/80">{activeImage.rotationZ.toFixed(0)}°</span>
            </div>
            <TailwindSlider
              value={activeImage.rotationZ}
              onChange={(val) => updateImageRotation(activeId, val)}
              min={-180}
              max={180}
              step={1}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-white/10">
          <button
            onClick={handleDuplicate}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-sm"
          >
            Duplicate
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </SceneOverlayController>
  );
}
