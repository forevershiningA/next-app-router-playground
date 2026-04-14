'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useHeadstoneStore, type Material as MaterialOption } from '#/lib/headstone-store';
import SegmentedControl from './ui/SegmentedControl';
import { bronzes } from '#/app/_internal/_data';
import { resolveMaterialAssetPath } from '#/lib/material-utils';
import { useImageCropState } from './useImageCropState';
import type { MaskShape } from '#/lib/image-mask';

type MaterialSelectorProps = {
  materials: MaterialOption[];
  disableInternalScroll?: boolean;
};

export default function MaterialSelector({ materials, disableInternalScroll = false }: MaterialSelectorProps) {
  const setHeadstoneMaterialUrl = useHeadstoneStore((s) => s.setHeadstoneMaterialUrl);
  const setBaseMaterialUrl = useHeadstoneStore((s) => s.setBaseMaterialUrl);
  const setLedgerMaterialUrl = useHeadstoneStore((s) => s.setLedgerMaterialUrl);
  const setKerbsetMaterialUrl = useHeadstoneStore((s) => s.setKerbsetMaterialUrl);
  const setIsMaterialChange = useHeadstoneStore((s) => s.setIsMaterialChange);
  const currentHeadstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const currentBaseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const currentLedgerMaterialUrl = useHeadstoneStore((s) => s.ledgerMaterialUrl);
  const currentKerbsetMaterialUrl = useHeadstoneStore((s) => s.kerbsetMaterialUrl);
  const selected = useHeadstoneStore((s) => s.selected);
  const editingObject = useHeadstoneStore((s) => s.editingObject);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const showLedger = useHeadstoneStore((s) => s.showLedger);
  const showKerbset = useHeadstoneStore((s) => s.showKerbset);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const setCropCanvasData = useHeadstoneStore((s) => s.setCropCanvasData);
  const isPlaque = catalog?.product.type === 'plaque';
  const isBronzePlaque = productId === '5';
  const isFullColourPlaque = productId === '32';
  const isFullMonument = catalog?.product.type === 'full-monument';
  const [bgTab, setBgTab] = React.useState<'background' | 'color'>('background');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background crop state using the existing crop system
  const {
    uploadedImage,
    showCropSection,
    setShowCropSection,
    selectedMask,
    setSelectedMask,
    cropScale,
    setCropScale,
    cropRotation,
    setCropRotation,
    flipX,
    setFlipX,
    flipY,
    setFlipY,
    maskMetrics,
    cropArea,
    setCropArea,
    hasFixedSizes,
    allowFreeformHandles,
    resetCropState,
    openUploadForImage,
  } = useImageCropState();

  // Set mask to rectangle matching plaque orientation
  const isLandscape = widthMm > heightMm;
  useEffect(() => {
    if (showCropSection) {
      const mask: MaskShape = isLandscape ? 'rectangle' : 'square';
      setSelectedMask(mask);
    }
  }, [showCropSection, isLandscape, setSelectedMask]);

  // Update crop canvas data in store when crop state changes
  const updateCropAreaCallback = useCallback((newCropArea: typeof cropArea) => {
    setCropArea(newCropArea);
  }, [setCropArea]);

  useEffect(() => {
    if (showCropSection && uploadedImage) {
      setCropCanvasData({
        uploadedImage,
        selectedMask,
        cropColorMode: 'full',
        cropScale,
        cropRotation,
        flipX,
        flipY,
        cropArea,
        hasFixedSizes,
        allowFreeformHandles,
        maskMetrics,
        updateCropArea: updateCropAreaCallback,
      });
    }
    // Don't clear on unmount — let handleApplyBackground or handleCancelCrop clear it
  }, [showCropSection, uploadedImage, selectedMask, cropScale, cropRotation, flipX, flipY, cropArea, hasFixedSizes, allowFreeformHandles, maskMetrics, setCropCanvasData, updateCropAreaCallback]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        openUploadForImage(imageUrl, { width: img.width, height: img.height });
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
    // Reset input so re-selecting the same file works
    event.target.value = '';
  };

  const handleApplyBackground = async () => {
    if (!uploadedImage) return;

    try {
      // Create canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = uploadedImage;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Calculate crop area in pixels
      const cropX = (cropArea.x / 100) * img.width;
      const cropY = (cropArea.y / 100) * img.height;
      const cropW = (cropArea.width / 100) * img.width;
      const cropH = (cropArea.height / 100) * img.height;

      canvas.width = cropW;
      canvas.height = cropH;

      // Apply transforms
      ctx.save();
      ctx.translate(cropW / 2, cropH / 2);
      ctx.rotate((cropRotation * Math.PI) / 180);
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      ctx.scale(cropScale / 100, cropScale / 100);
      ctx.drawImage(img, cropX, cropY, cropW, cropH, -cropW / 2, -cropH / 2, cropW, cropH);
      ctx.restore();

      // Export as data URL and set as material
      const processedImageUrl = canvas.toDataURL('image/jpeg', 0.92);

      setIsMaterialChange(true);
      setHeadstoneMaterialUrl(processedImageUrl);
      setTimeout(() => setIsMaterialChange(false), 100);

      // Reset crop state
      setCropCanvasData(null);
      resetCropState();
    } catch (error) {
      console.error('Failed to process background image:', error);
    }
  };

  const handleCancelCrop = () => {
    setCropCanvasData(null);
    resetCropState();
  };

  const buildTextureUrl = (material: MaterialOption) => {
    const basePath = isBronzePlaque ? '/textures/phoenix/l/' : '/textures/forever/l/';
    return (
      resolveMaterialAssetPath(material.textureUrl, basePath) ??
      resolveMaterialAssetPath(material.image, basePath)
    );
  };

  const buildThumbnailUrl = (material: MaterialOption, fallbackTexture: string | null) => {
    const basePath = isBronzePlaque ? '/textures/phoenix/l/' : '/textures/forever/l/';
    const thumb = resolveMaterialAssetPath(material.thumbnailUrl, basePath);
    if (thumb) {
      return thumb;
    }
    return fallbackTexture;
  };

  // Use bronze materials for Bronze Plaque (id 5), otherwise use regular materials
  const displayMaterials = useMemo(() => {
    if (isBronzePlaque) {
      return bronzes.map(b => ({
        id: b.id,
        name: b.name,
        image: b.image,
        category: 'bronze'
      }));
    }
    if (isFullColourPlaque) {
      return materials.filter(m => m.category === bgTab);
    }
    return materials;
  }, [isBronzePlaque, isFullColourPlaque, materials, bgTab]);

  // Ensure canvas selection matches editingObject when component mounts
  useEffect(() => {
    if (selected !== editingObject) {
      setSelected(editingObject);
    }
  }, [editingObject, selected, setSelected]);

  useEffect(() => {
    if (isPlaque && editingObject !== 'headstone') {
      setEditingObject('headstone');
      setSelected('headstone');
    }
  }, [editingObject, isPlaque, setEditingObject, setSelected]);

  // Determine current material URL based on what's being edited
  const currentMaterialUrl =
    editingObject === 'base'
      ? currentBaseMaterialUrl
      : editingObject === 'ledger'
        ? currentLedgerMaterialUrl
        : editingObject === 'kerbset'
          ? currentKerbsetMaterialUrl
          : currentHeadstoneMaterialUrl;

  const targetOptions = useMemo(() => {
    if (isPlaque) {
      return [{ label: 'Headstone', value: 'headstone' }];
    }

    const options: { label: string; value: string }[] = [
      { label: 'Headstone', value: 'headstone' },
    ];

    if (showBase) {
      options.push({ label: 'Base', value: 'base' });
    }
    if (isFullMonument && showLedger) {
      options.push({ label: 'Ledger', value: 'ledger' });
    }
    if (isFullMonument && showKerbset) {
      options.push({ label: 'Kerbset', value: 'kerbset' });
    }

    return options;
  }, [isFullMonument, isPlaque, showBase, showKerbset, showLedger]);

  const handleMaterialSelect = (material: MaterialOption) => {
    const materialUrl = buildTextureUrl(material);
    if (!materialUrl) {
      return;
    }

    setIsMaterialChange(true);
    const targetObject = isPlaque ? 'headstone' : editingObject;

    if (targetObject === 'base') {
      setBaseMaterialUrl(materialUrl);
    } else if (targetObject === 'ledger') {
      setLedgerMaterialUrl(materialUrl);
    } else if (targetObject === 'kerbset') {
      setKerbsetMaterialUrl(materialUrl);
    } else {
      setHeadstoneMaterialUrl(materialUrl);
    }

    setSelected(targetObject);
    setEditingObject(targetObject);

    setTimeout(() => setIsMaterialChange(false), 100);
  };

  // When in crop mode, show crop controls instead of material grid
  if (isFullColourPlaque && showCropSection && uploadedImage) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white font-medium">Crop Background</h4>
          <button
            onClick={handleCancelCrop}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Size slider */}
        <div className="space-y-2">
          <div className="text-xs text-white/60">Adjust Size</div>
          <input
            type="range"
            min="20"
            max="80"
            value={cropArea.height}
            onChange={(e) => {
              const newHeight = parseInt(e.target.value);
              setCropArea(prev => {
                const centerX = prev.x + prev.width / 2;
                const centerY = prev.y + prev.height / 2;
                const currentAspectRatio = prev.width / prev.height;
                const newWidth = newHeight * currentAspectRatio;
                return {
                  x: centerX - newWidth / 2,
                  y: centerY - newHeight / 2,
                  width: newWidth,
                  height: newHeight,
                };
              });
            }}
            className="w-full h-1.5 rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F]"
          />
        </div>

        {/* Rotation slider */}
        <div className="space-y-2">
          <div className="text-xs text-white/60">Rotation: {cropRotation}°</div>
          <input
            type="range"
            min="-180"
            max="180"
            value={cropRotation}
            onChange={(e) => setCropRotation(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F]"
          />
        </div>

        {/* Flip buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFlipX(!flipX)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
              flipX ? 'border-[#D7B356] bg-[#D7B356]/20 text-white' : 'border-white/20 text-white/60 hover:text-white'
            }`}
          >
            Flip H
          </button>
          <button
            onClick={() => setFlipY(!flipY)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
              flipY ? 'border-[#D7B356] bg-[#D7B356]/20 text-white' : 'border-white/20 text-white/60 hover:text-white'
            }`}
          >
            Flip V
          </button>
        </div>

        {/* Apply button */}
        <button
          onClick={handleApplyBackground}
          className="w-full rounded-lg bg-[#DEBD68] px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-[#d7b356] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Apply Background
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!isPlaque && (
        <div className="mb-4">
          <SegmentedControl
            value={editingObject}
            onChange={(value) => {
              const nextTarget = value as 'headstone' | 'base' | 'ledger' | 'kerbset';
              setEditingObject(nextTarget);
              setSelected(nextTarget);
            }}
            options={targetOptions}
          />
        </div>
      )}

      {isFullColourPlaque && (
        <div className="mb-4">
          <SegmentedControl
            value={bgTab}
            onChange={(value) => setBgTab(value as 'background' | 'color')}
            options={[
              { label: 'Background', value: 'background' },
              { label: 'Color', value: 'color' },
            ]}
          />
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileUpload}
      />
      
      <div
        className={`grid grid-cols-3 gap-2 pr-2 ${disableInternalScroll ? '' : 'overflow-y-auto custom-scrollbar'}`}
      >
        {/* Upload Image button — first position in Background tab */}
        {isFullColourPlaque && bgTab === 'background' && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative overflow-hidden cursor-pointer"
            title="Upload Image"
          >
            <div className="relative aspect-square overflow-hidden border-2 border-dashed border-white/20 flex items-center justify-center hover:border-[#D7B356]/50 transition-colors">
              <div className="flex flex-col items-center gap-1">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-[10px] text-gray-400">Upload</span>
              </div>
            </div>
            <div className="p-2 h-12 flex items-center justify-center">
              <div className="text-xs text-center text-slate-200">Upload Image</div>
            </div>
          </button>
        )}

        {displayMaterials.map((material) => {
          const textureUrl = buildTextureUrl(material);
          const thumbnailUrl = buildThumbnailUrl(material, textureUrl);
          const isSelected = textureUrl ? currentMaterialUrl === textureUrl : false;
          const coverSrc = thumbnailUrl ?? '/textures/forever/l/Imperial-Red.webp';

          return (
            <button
              key={material.id}
              onClick={() => textureUrl && handleMaterialSelect(material)}
              className="relative overflow-hidden cursor-pointer disabled:cursor-not-allowed"
              title={material.name}
              disabled={!textureUrl}
            >
              {/* Material Image */}
              <div className={`relative aspect-square overflow-hidden ${isSelected ? 'ring-2 ring-[#D7B356]' : ''}`}>
                <Image
                  src={coverSrc}
                  alt={material.name}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              </div>
              
              {/* Material Name */}
              <div className="p-2 h-12 flex items-center justify-center">
                <div className={`text-xs text-center line-clamp-2 ${isSelected ? 'text-[#D7B356]' : 'text-slate-200'}`}>
                  {material.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
