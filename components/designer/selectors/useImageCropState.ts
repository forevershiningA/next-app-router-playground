'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AdditionData } from '#/lib/xml-parser';
import type { MaskMetrics } from '#/lib/mask-metrics';
import { fetchMaskMetrics } from '#/lib/mask-metrics';
import {
  getFlexibleImageBounds,
  getImageSizeOptions,
  isFlexibleImageType,
} from '#/lib/image-size-config';
import { getMaskAspectRatio, getMaskUrl, type MaskShape } from '#/lib/image-mask';

export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const DEFAULT_CROP_AREA: CropArea = { x: 26, y: 20, width: 48, height: 60 };

export function useImageCropState() {
  const [selectedType, setSelectedType] = useState<AdditionData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showCropSection, setShowCropSection] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [selectedMask, setSelectedMask] = useState<MaskShape>('oval');
  const [cropColorMode, setCropColorMode] = useState<'full' | 'bw' | 'sepia'>(
    'full',
  );
  const [cropScale, setCropScale] = useState(100);
  const [cropRotation, setCropRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [maskMetrics, setMaskMetrics] = useState<MaskMetrics | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>(DEFAULT_CROP_AREA);

  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  const availableSizes = useMemo(() => {
    if (!selectedType) return [];
    if (isFlexibleImageType(selectedType.id)) {
      return null;
    }
    return getImageSizeOptions(selectedType.id);
  }, [selectedType]);

  const hasFixedSizes = useMemo(
    () => Array.isArray(availableSizes) && availableSizes.length > 0,
    [availableSizes],
  );

  const selectedTypeId = selectedType ? String(selectedType.id) : '';
  const isGraniteImage = selectedTypeId === '21' || selectedTypeId === '135';

  const allowFreeformHandles = useMemo(() => {
    if (!selectedType) return false;
    const normalizedName = selectedType.name?.toLowerCase() ?? '';
    return isGraniteImage || normalizedName.includes('granite');
  }, [selectedType, isGraniteImage]);

  useEffect(() => {
    if (isGraniteImage && cropColorMode !== 'bw') {
      setCropColorMode('bw');
    }
  }, [isGraniteImage, cropColorMode]);

  useEffect(() => {
    let cancelled = false;
    const maskUrl = getMaskUrl(selectedMask);
    if (!maskUrl) {
      setMaskMetrics(null);
      return () => {
        cancelled = true;
      };
    }

    fetchMaskMetrics(maskUrl)
      .then((metrics) => {
        if (!cancelled) {
          setMaskMetrics(metrics);
        }
      })
      .catch((error) => {
        console.error('[ImageSelector] Failed to load mask metrics:', error);
        if (!cancelled) {
          setMaskMetrics(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedMask]);

  useEffect(() => {
    const maskAspect = maskMetrics?.aspect ?? getMaskAspectRatio(selectedMask);

    const centerCrop = (width: number, height: number) => {
      const clampedWidth = Math.min(95, Math.max(width, 10));
      const clampedHeight = Math.min(95, Math.max(height, 10));
      setCropArea({
        x: (100 - clampedWidth) / 2,
        y: (100 - clampedHeight) / 2,
        width: clampedWidth,
        height: clampedHeight,
      });
    };

    if (!imageDimensions || hasFixedSizes) {
      const portraitPreferred = maskAspect < 1;
      const baseHeight = portraitPreferred ? 60 : 50;
      centerCrop(baseHeight * maskAspect, baseHeight);
      return;
    }

    if (isGraniteImage) {
      const imgWidth = imageDimensions.width;
      const imgHeight = imageDimensions.height;
      const imgType =
        imgWidth === imgHeight
          ? 'SQUARE'
          : imgWidth > imgHeight
            ? 'LANDSCAPE'
            : 'PORTRAIT';

      let width = 50;
      let height = 50;

      if (imgType === 'PORTRAIT' || imgType === 'SQUARE') {
        const ratio = imgWidth / imgHeight;
        width = 50;
        height = 50 * ratio * 0.7;
      }

      centerCrop(width, height);
      return;
    }

    const portraitPreferred = maskAspect < 1;
    const baseHeight = portraitPreferred ? 60 : 50;
    centerCrop(baseHeight * maskAspect, baseHeight);
  }, [selectedMask, imageDimensions, hasFixedSizes, maskMetrics, isGraniteImage]);

  useEffect(() => {
    if (!hasFixedSizes || !availableSizes?.length) {
      setSelectedSizeIndex(0);
      return;
    }
    setSelectedSizeIndex((idx) =>
      Math.min(Math.max(idx, 0), availableSizes.length - 1),
    );
  }, [hasFixedSizes, availableSizes?.length]);

  const activeSizeIndex =
    hasFixedSizes && availableSizes?.length
      ? Math.min(selectedSizeIndex, availableSizes.length - 1)
      : 0;
  const activeSize =
    hasFixedSizes && availableSizes?.length ? availableSizes[activeSizeIndex] : null;

  const resetCropState = () => {
    setUploadedImage(null);
    setShowCropSection(false);
    setCropScale(100);
    setCropRotation(0);
    setSelectedMask('oval');
    setCropColorMode('full');
    setFlipX(false);
    setFlipY(false);
    setCropArea(DEFAULT_CROP_AREA);
  };

  const openUploadForImage = (imageUrl: string, dimensions: { width: number; height: number }) => {
    setImageDimensions(dimensions);
    setUploadedImage(imageUrl);
    setShowCropSection(true);
  };

  const clearSelectedType = () => {
    setSelectedType(null);
    setUploadedImage(null);
    setShowCropSection(false);
  };

  return {
    selectedType,
    setSelectedType,
    uploadedImage,
    setUploadedImage,
    showCropSection,
    setShowCropSection,
    imageDimensions,
    setImageDimensions,
    selectedMask,
    setSelectedMask,
    cropColorMode,
    setCropColorMode,
    cropScale,
    setCropScale,
    cropRotation,
    setCropRotation,
    flipX,
    setFlipX,
    flipY,
    setFlipY,
    maskMetrics,
    setMaskMetrics,
    cropArea,
    setCropArea,
    availableSizes,
    hasFixedSizes,
    selectedTypeId,
    isGraniteImage,
    allowFreeformHandles,
    selectedSizeIndex,
    setSelectedSizeIndex,
    activeSizeIndex,
    activeSize,
    resetCropState,
    openUploadForImage,
    clearSelectedType,
    flexibleBoundsForSelected: selectedType
      ? getFlexibleImageBounds(selectedType.id)
      : null,
  };
}
