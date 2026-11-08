'use client';

import DesignerRangeInput from '#/components/designer/ui/DesignerRangeInput';

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { AdditionData } from '#/lib/xml-parser';
import Image from 'next/image';
import { fetchMaskMetrics } from '#/lib/mask-metrics';
import {
  getFlexibleImageBounds,
  getImageSizeOptions,
} from '#/lib/image-size-config';
import { MASK_OPTIONS, getMaskAspectRatio, getMaskUrl } from '#/lib/image-mask';
import { useImageCropState } from './useImageCropState';
import { logger } from '#/lib/logger';
import { CheckCircleIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import {
  formatImperialFractionFromMm,
  getLengthUnitLabel,
} from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';

interface ImageSelectorProps {
  onImageSelect?: (imageType: AdditionData) => void;
}

// Map image IDs to their thumbnail paths
const IMAGE_THUMBNAILS: Record<string, string> = {
  '7': '/jpg/photos/product-ceramic-image.jpg',
  '21': '/jpg/photos/m/granite-image.jpg',
  '135': '/jpg/photos/m.jpg',
  '2300': '/jpg/photos/product-vitreous-enamel-image.jpg',
  '2400': '/jpg/photos/plana.jpg',
};

function getImageTypeLabel(name: string) {
  return name === 'Vitreous Enamel' ? 'Vitreous\nEnamel' : name;
}

function normalizeSignedRotation(value: number) {
  if (value >= -180 && value <= 180) {
    return value;
  }

  const normalized = ((((value + 180) % 360) + 360) % 360) - 180;
  return normalized;
}

function snapImageRotation(value: number) {
  const normalized = normalizeSignedRotation(value);
  const snapTargets = [-90, 0, 90, 180];
  const nearest = snapTargets.reduce((best, target) =>
    Math.abs(target - normalized) < Math.abs(best - normalized) ? target : best,
  );
  return Math.abs(nearest - normalized) <= 4 ? nearest : normalized;
}

export default function ImageSelector({ onImageSelect }: ImageSelectorProps) {
  const unitSystem = useUnitSystem();
  const lengthUnit = getLengthUnitLabel(unitSystem);
  const formatImageLength = useCallback(
    (valueMm: number) =>
      unitSystem === 'imperial'
        ? formatImperialFractionFromMm(valueMm)
        : String(Math.round(valueMm)),
    [unitSystem],
  );
  const formatImageSize = useCallback(
    (widthMm: number, heightMm: number) =>
      `${formatImageLength(widthMm)} × ${formatImageLength(heightMm)} ${lengthUnit}`,
    [formatImageLength, lengthUnit],
  );
  const parseImageLength = useCallback(
    (value: string): number | null => {
      const normalized = value.trim().replace(',', '.');
      if (!normalized) return null;
      if (unitSystem === 'metric') {
        const millimetres = Number(normalized);
        return Number.isFinite(millimetres) ? millimetres : null;
      }
      const fraction = normalized.match(
        /^(?:(\d+(?:\.\d+)?)\s+)?(\d+)\/(\d+)$/,
      );
      if (fraction) {
        const whole = Number(fraction[1] ?? 0);
        const numerator = Number(fraction[2]);
        const denominator = Number(fraction[3]);
        if (denominator === 0) return null;
        return (whole + numerator / denominator) * 25.4;
      }
      const inches = Number(normalized);
      return Number.isFinite(inches) ? inches * 25.4 : null;
    },
    [unitSystem],
  );
  // Store hooks
  const selectedImageId = useHeadstoneStore((s) => s.selectedImageId);
  const setSelectedImageId = useHeadstoneStore((s) => s.setSelectedImageId);
  const selectedImages = useHeadstoneStore((s) => s.selectedImages);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const updateImagePosition = useHeadstoneStore((s) => s.updateImagePosition);
  const updateImageTarget = useHeadstoneStore((s) => s.updateImageTarget);
  const updateImageSize = useHeadstoneStore((s) => s.updateImageSize);
  const updateImageSizeVariant = useHeadstoneStore(
    (s) => s.updateImageSizeVariant,
  );
  const updateImageRotation = useHeadstoneStore((s) => s.updateImageRotation);
  const removeImage = useHeadstoneStore((s) => s.removeImage);
  const duplicateImage = useHeadstoneStore((s) => s.duplicateImage);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  const {
    selectedType,
    setSelectedType,
    uploadedImage,
    setUploadedImage,
    showCropSection,
    setShowCropSection,
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
    cropArea,
    setCropArea,
    availableSizes,
    hasFixedSizes,
    isGraniteImage,
    allowFreeformHandles,
    selectedSizeIndex,
    setSelectedSizeIndex,
    activeSizeIndex,
    activeSize,
    resetCropState,
    openUploadForImage,
    clearSelectedType,
  } = useImageCropState();

  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<
    'move' | 'nw' | 'ne' | 'sw' | 'se' | null
  >(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'error' | 'info'>('error');
  const [updatingImageId, setUpdatingImageId] = useState<string | null>(null);
  const [nudgeStepIndex, setNudgeStepIndex] = useState(1);
  const nudgeSteps =
    unitSystem === 'imperial'
      ? [
          { label: '1/8 in', mm: 25.4 / 8 },
          { label: '1/4 in', mm: 25.4 / 4 },
          { label: '1/2 in', mm: 25.4 / 2 },
        ]
      : [
          { label: '1 mm', mm: 1 },
          { label: '5 mm', mm: 5 },
          { label: '10 mm', mm: 10 },
        ];
  const nudgeStep = nudgeSteps[nudgeStepIndex] ?? nudgeSteps[1];
  const nudgeStepMm = nudgeStep.mm;

  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);
  const addImage = useHeadstoneStore((s) => s.addImage);
  const updateImageData = useHeadstoneStore((s) => s.updateImageData);
  const setCropCanvasData = useHeadstoneStore((s) => s.setCropCanvasData);

  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    const normalizedRotation = normalizeSignedRotation(cropRotation);
    if (cropRotation !== normalizedRotation) {
      setCropRotation(normalizedRotation);
    }
  }, [cropRotation, setCropRotation]);

  const sectionCardClass =
    'rounded-xl border border-white/10 bg-[#161412] p-3.5 shadow-sm day:border-[#dfd7ca] day:bg-white day:shadow-[0_2px_8px_rgba(40,30,20,0.04)]';
  const labelClass = 'font-serif text-sm font-normal text-white day:text-[#1a1714]';
  const controlButtonClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white transition-all hover:border-[#c49a45] hover:bg-[#c49a45]/15 hover:text-[#f0d89f] disabled:cursor-not-allowed disabled:opacity-30 day:border-[#dfd7ca] day:bg-white day:text-[#1a1714] day:hover:border-[#9a742f] day:hover:bg-[#9a742f]/10 day:hover:text-[#9a742f] day:shadow-sm';
  const numberInputBaseClass =
    'h-8 rounded-lg border border-white/10 bg-white/[0.04] px-2 text-right font-sans text-sm font-semibold tabular-nums text-white transition-colors focus:border-[#c49a45] focus:ring-2 focus:ring-[#c49a45]/20 focus:outline-none day:border-[#dfd7ca] day:bg-white day:text-[#1a1714] day:focus:border-[#9a742f] day:focus:ring-[#9a742f]/20 day:shadow-sm';
  const rangeInputClass =
    'fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--designer-focus)] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#161412] [&::-moz-range-thumb]:bg-[#c49a45] [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#161412] [&::-webkit-slider-thumb]:bg-[#c49a45] [&::-webkit-slider-thumb]:shadow-md day:[&::-webkit-slider-thumb]:border-white day:[&::-webkit-slider-thumb]:bg-[#9a742f] day:[&::-moz-range-thumb]:border-white day:[&::-moz-range-thumb]:bg-[#9a742f]';
  const rangeBoundsClass =
    'mt-1.5 flex w-full justify-between font-sans text-[11px] font-medium tabular-nums text-white/50 day:text-[#786e61]';
  const cropSectionClass =
    'rounded-xl border border-white/10 bg-[#161412] p-3.5 shadow-sm day:border-[#dfd7ca] day:bg-white day:shadow-[0_2px_8px_rgba(40,30,20,0.04)]';
  const cropAdjustButtonClass =
    'flex h-8 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 font-sans text-xs font-semibold text-white/80 transition-all hover:border-[#c49a45] hover:bg-[#c49a45]/15 hover:text-[#f0d89f] day:border-[#dfd7ca] day:bg-white day:text-[#5a5248] day:hover:border-[#9a742f] day:hover:bg-[#f7f4ee] day:hover:text-[#1a1714] day:shadow-sm';
  const cropToolButtonClass =
    'flex h-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-2.5 font-sans text-xs font-semibold text-white/80 transition-all hover:border-[#c49a45] hover:bg-[#c49a45]/15 hover:text-[#f0d89f] day:border-[#dfd7ca] day:bg-white day:text-[#5a5248] day:hover:border-[#9a742f] day:hover:bg-[#f7f4ee] day:hover:text-[#1a1714] day:shadow-sm';

  // Callback to update crop area from CropCanvas
  const updateCropAreaCallback = (newCropArea: typeof cropArea) => {
    setCropArea(newCropArea);
  };

  // Update crop canvas data in store when any crop state changes
  useEffect(() => {
    if (showCropSection && uploadedImage) {
      setCropCanvasData({
        uploadedImage,
        selectedMask,
        cropColorMode,
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
    } else {
      setCropCanvasData(null);
    }
  }, [
    showCropSection,
    uploadedImage,
    selectedMask,
    cropColorMode,
    cropScale,
    cropRotation,
    flipX,
    flipY,
    cropArea,
    hasFixedSizes,
    allowFreeformHandles,
    maskMetrics,
    setCropCanvasData,
  ]);

  // Filter catalog additions to get only image types
  const imageTypes = useMemo(() => {
    if (!catalog?.product?.additions) return [];
    return catalog.product.additions.filter(
      (addition) => addition.type === 'image',
    );
  }, [catalog]);

  // Full Color Plaque (product 32): auto-select "Free Image" (id 137) to skip type selection
  useEffect(() => {
    if (productId === '32' && !selectedType && imageTypes.length > 0) {
      const freeImage = imageTypes.find((t) => t.id === '137') ?? imageTypes[0];
      handleImageTypeSelect(freeImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, imageTypes, selectedType]);

  const handleImageTypeSelect = (imageType: AdditionData) => {
    setFeedbackMessage(null);
    setSelectedType(imageType);
    onImageSelect?.(imageType);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setFeedbackTone('error');
      setFeedbackMessage('Please upload an image file.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFeedbackTone('error');
      setFeedbackMessage('Image size must be less than 5MB.');
      return;
    }
    setFeedbackMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;

      // Load image to get dimensions
      const img = new window.Image();
      img.onload = () => {
        openUploadForImage(imageUrl, { width: img.width, height: img.height });
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Reset the input so the same file can be re-selected
    event.target.value = '';

    if (!file.type.startsWith('image/')) {
      setFeedbackTone('error');
      setFeedbackMessage('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedbackTone('error');
      setFeedbackMessage('Image size must be less than 5MB.');
      return;
    }
    setFeedbackMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        // Use the existing image's type so the crop flow works
        const existingImg = selectedImages.find(
          (i) => i.id === updatingImageId,
        );
        if (existingImg && !selectedType) {
          const matchingType = imageTypes.find(
            (t) => t.id === String(existingImg.typeId),
          );
          if (matchingType) setSelectedType(matchingType);
        }
        openUploadForImage(imageUrl, { width: img.width, height: img.height });
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleCropImage = async () => {
    if (!selectedType || !uploadedImage || !addImage) return;

    setIsCropping(true);

    const maskUrl = getMaskUrl(selectedMask);
    let resolvedMaskMetrics = maskMetrics;

    if (!resolvedMaskMetrics && maskUrl) {
      try {
        resolvedMaskMetrics = await fetchMaskMetrics(maskUrl);
      } catch (error) {
        console.error(
          '[handleCropImage] Failed to load mask metrics on demand:',
          error,
        );
      }
    }

    try {
      // 1. Create canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        return;
      }

      // 2. Load uploaded image
      const img = new window.Image();
      img.crossOrigin = 'anonymous'; // Allow CORS for data URLs
      img.src = uploadedImage;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // 3. Calculate crop area in actual image pixels
      const cropX = (cropArea.x / 100) * img.width;
      const cropY = (cropArea.y / 100) * img.height;
      const cropW = (cropArea.width / 100) * img.width;
      const cropH = (cropArea.height / 100) * img.height;

      // 4. Set canvas size to crop dimensions
      canvas.width = cropW;
      canvas.height = cropH;

      // 5. Apply transforms (rotation, flip, scale)
      ctx.save();
      ctx.translate(cropW / 2, cropH / 2);
      ctx.rotate((cropRotation * Math.PI) / 180);
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      ctx.scale(cropScale / 100, cropScale / 100);

      // 6. Draw cropped and transformed portion of image
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropW,
        cropH,
        -cropW / 2,
        -cropH / 2,
        cropW,
        cropH,
      );
      ctx.restore();

      // 7. Apply color mode filter
      if (cropColorMode === 'bw') {
        const imageData = ctx.getImageData(0, 0, cropW, cropH);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const gray =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = data[i + 1] = data[i + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);
      } else if (cropColorMode === 'sepia') {
        const imageData = ctx.getImageData(0, 0, cropW, cropH);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // 8. Apply mask shape using compositing
      const imageCanvas = document.createElement('canvas');
      imageCanvas.width = cropW;
      imageCanvas.height = cropH;
      const imageCtx = imageCanvas.getContext('2d');
      if (!imageCtx) {
        console.error(
          '[handleCropImage] Failed to create image canvas context',
        );
        return;
      }
      imageCtx.drawImage(canvas, 0, 0);

      const targetMaskAspect =
        resolvedMaskMetrics?.aspect ?? getMaskAspectRatio(selectedMask);
      const canvasAspect = cropW / cropH;

      let maskDrawWidth = cropW;
      let maskDrawHeight = cropH;
      let maskDrawX = 0;
      let maskDrawY = 0;

      if (canvasAspect > targetMaskAspect) {
        maskDrawHeight = cropH;
        maskDrawWidth = cropH * targetMaskAspect;
        maskDrawX = (cropW - maskDrawWidth) / 2;
      } else {
        maskDrawWidth = cropW;
        maskDrawHeight = cropW / targetMaskAspect;
        maskDrawY = (cropH - maskDrawHeight) / 2;
      }

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = Math.round(maskDrawWidth);
      finalCanvas.height = Math.round(maskDrawHeight);
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) {
        console.error(
          '[handleCropImage] Failed to create final canvas context',
        );
        return;
      }

      finalCtx.drawImage(
        imageCanvas,
        maskDrawX,
        maskDrawY,
        maskDrawWidth,
        maskDrawHeight,
        0,
        0,
        finalCanvas.width,
        finalCanvas.height,
      );

      if (maskUrl) {
        const maskImg = new window.Image();
        maskImg.crossOrigin = 'anonymous';
        maskImg.src = maskUrl;
        await new Promise((resolve, reject) => {
          maskImg.onload = resolve;
          maskImg.onerror = (e) => {
            console.error('Failed to load mask:', maskUrl, e);
            reject(e);
          };
        });

        finalCtx.globalCompositeOperation = 'destination-in';

        if (resolvedMaskMetrics) {
          const nativeWidth =
            maskImg.naturalWidth ||
            maskImg.width ||
            resolvedMaskMetrics.naturalWidth;
          const nativeHeight =
            maskImg.naturalHeight ||
            maskImg.height ||
            resolvedMaskMetrics.naturalHeight;
          const sourceX =
            resolvedMaskMetrics.normalizedBounds.left * nativeWidth;
          const sourceY =
            resolvedMaskMetrics.normalizedBounds.top * nativeHeight;
          const sourceWidth =
            resolvedMaskMetrics.normalizedBounds.width * nativeWidth;
          const sourceHeight =
            resolvedMaskMetrics.normalizedBounds.height * nativeHeight;

          finalCtx.drawImage(
            maskImg,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            finalCanvas.width,
            finalCanvas.height,
          );
        } else {
          finalCtx.drawImage(
            maskImg,
            0,
            0,
            maskImg.naturalWidth || maskImg.width || finalCanvas.width,
            maskImg.naturalHeight || maskImg.height || finalCanvas.height,
            0,
            0,
            finalCanvas.width,
            finalCanvas.height,
          );
        }

        finalCtx.globalCompositeOperation = 'source-over';
      }

      // 9. Upload processed PNG to wiecznapamiec.pl — avoids storing large base64 in DB
      const blob = await new Promise<Blob | null>((res) =>
        finalCanvas.toBlob(res, 'image/png'),
      );
      if (!blob) throw new Error('finalCanvas.toBlob returned null');

      const form = new FormData();
      form.append(
        'file',
        new File([blob], 'portrait.png', { type: 'image/png' }),
      );

      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: form,
      });
      if (!uploadResponse.ok)
        throw new Error(`Image upload failed: ${uploadResponse.status}`);
      const { url: processedImageUrl } = (await uploadResponse.json()) as {
        url: string;
      };

      logger.log('[handleCropImage] Canvas uploaded:', {
        canvasWidth: finalCanvas.width,
        canvasHeight: finalCanvas.height,
        canvasAspect: finalCanvas.width / finalCanvas.height,
        selectedMask,
      });

      // 10. Calculate dimensions based on trimmed canvas aspect ratio
      // After trimming, the canvas matches the mask's visible bounds exactly
      const trimmedAspectRatio = finalCanvas.width / finalCanvas.height;

      let targetWidthMm = trimmedAspectRatio * 100;
      let targetHeightMm = 100;

      if (activeSize) {
        const preferredHeight = activeSize.height;
        let preferredWidth = preferredHeight * trimmedAspectRatio;

        if (preferredWidth > activeSize.width) {
          preferredWidth = activeSize.width;
          targetHeightMm = preferredWidth / trimmedAspectRatio;
          targetWidthMm = preferredWidth;
        } else {
          targetWidthMm = preferredWidth;
          targetHeightMm = preferredHeight;
        }
      }

      const sizeVariantValue = activeSize ? activeSizeIndex + 1 : undefined;
      const canonicalAspectRatio = targetWidthMm / targetHeightMm;

      // 11. Add to 3D scene with trimmed aspect ratio
      // Convert selectedMask to SVG filename format
      const maskShapeMap: Record<string, string> = {
        oval: 'oval_vertical',
        'horizontal-oval': 'oval_horizontal',
        square: 'rectangle_vertical',
        rectangle: 'rectangle_horizontal',
        heart: 'heart',
        teardrop: 'teardrop',
        triangle: 'triangle',
      };
      const maskShapeFilename =
        productId === '32' ? '' : maskShapeMap[selectedMask] || 'oval_vertical';

      if (updatingImageId) {
        // Update existing image: replace photo data, keep position/size/mask
        updateImageData(
          updatingImageId,
          processedImageUrl,
          canonicalAspectRatio,
          cropColorMode,
        );
        setUpdatingImageId(null);
      } else {
        addImage({
          id: `img-${Date.now()}`,
          typeId: parseInt(selectedType.id),
          typeName: selectedType.name,
          imageUrl: processedImageUrl,
          widthMm: targetWidthMm,
          heightMm: targetHeightMm,
          xPos: 0,
          yPos: 0,
          rotationZ: 0,
          sizeVariant: sizeVariantValue ?? 1,
          croppedAspectRatio: canonicalAspectRatio,
          maskShape: maskShapeFilename,
          colorMode: cropColorMode,
          coordinateSpace: 'mm-center',
        });
      }

      // 12. Reset and close crop UI
      resetCropState();

      // Clear crop canvas
      setCropCanvasData(null);
      setIsCropping(false);
    } catch (error) {
      console.error('[handleCropImage] Error processing image:', error);
      setFeedbackTone('error');
      setFeedbackMessage('Failed to process image. Please try again.');
      setUpdatingImageId(null);
      setIsCropping(false);
    }
  };

  const handleFlipX = () => setFlipX(!flipX);
  const handleFlipY = () => setFlipY(!flipY);
  const handleRotateLeft = () =>
    setCropRotation((rotation) => normalizeSignedRotation(rotation - 90));
  const handleRotateRight = () =>
    setCropRotation((rotation) => normalizeSignedRotation(rotation + 90));

  const handleMouseDown = (
    e: React.MouseEvent,
    handle: 'move' | 'nw' | 'ne' | 'sw' | 'se',
  ) => {
    e.preventDefault();

    // For fixed sizes, only allow moving, not resizing
    if (hasFixedSizes && handle !== 'move') {
      return;
    }

    setIsDragging(true);
    setDragHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragHandle || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    setCropArea((prev) => {
      const newArea = { ...prev };

      if (dragHandle === 'move') {
        newArea.x = Math.max(0, Math.min(100 - prev.width, prev.x + deltaX));
        newArea.y = Math.max(0, Math.min(100 - prev.height, prev.y + deltaY));
      } else if (dragHandle === 'nw') {
        const newWidth = Math.max(10, prev.width - deltaX);
        const newHeight = Math.max(10, prev.height - deltaY);
        newArea.x = Math.max(0, prev.x + deltaX);
        newArea.y = Math.max(0, prev.y + deltaY);
        newArea.width = newWidth;
        newArea.height = newHeight;
      } else if (dragHandle === 'ne') {
        const newWidth = Math.max(
          10,
          Math.min(100 - prev.x, prev.width + deltaX),
        );
        const newHeight = Math.max(10, prev.height - deltaY);
        newArea.y = Math.max(0, prev.y + deltaY);
        newArea.width = newWidth;
        newArea.height = newHeight;
      } else if (dragHandle === 'sw') {
        const newWidth = Math.max(10, prev.width - deltaX);
        const newHeight = Math.max(
          10,
          Math.min(100 - prev.y, prev.height + deltaY),
        );
        newArea.x = Math.max(0, prev.x + deltaX);
        newArea.width = newWidth;
        newArea.height = newHeight;
      } else if (dragHandle === 'se') {
        const newWidth = Math.max(
          10,
          Math.min(100 - prev.x, prev.width + deltaX),
        );
        const newHeight = Math.max(
          10,
          Math.min(100 - prev.y, prev.height + deltaY),
        );
        newArea.width = newWidth;
        newArea.height = newHeight;
      }

      return newArea;
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragHandle(null);
  };

  // Add/remove mouse event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragHandle, dragStart]);

  const handleBackToImageTypes = () => {
    setFeedbackMessage(null);
    clearSelectedType();
    setSelectedImageId(null);
    setUpdatingImageId(null);
  };

  // Get selected image data
  const selectedImage = selectedImages.find(
    (img) => img.id === selectedImageId,
  );

  // Show message if no image types available
  if (imageTypes.length === 0) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="day:text-gray-900 text-sm font-semibold text-white">
            No image types available
          </h3>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="day:text-gray-500 text-sm text-white/60">
            This product does not support images.
          </p>
        </div>
      </div>
    );
  }

  // If an image is selected, show editing controls
  // Skip when in update-crop mode so the crop UI renders instead
  if (
    selectedImageId &&
    selectedImage &&
    !(showCropSection && updatingImageId)
  ) {
    // ImageModel stores Three.js radians; the editor controls are labelled and
    // ranged in degrees.
    const imageRotationDeg = normalizeSignedRotation(
      ((selectedImage.rotationZ || 0) * 180) / Math.PI,
    );
    const updateImageRotationDegrees = (degrees: number) =>
      updateImageRotation(selectedImageId, (degrees * Math.PI) / 180);
    const imagePositionStep =
      selectedImage.coordinateSpace === 'mm-center'
        ? nudgeStepMm
        : nudgeStepMm / 1000;
    const updateSelectedImagePosition = (xPos: number, yPos: number) =>
      updateImageTarget(
        selectedImageId,
        selectedImage.target ?? 'headstone',
        xPos,
        yPos,
        selectedImage.coordinateSpace,
      );

    // Get size configuration for this image type
    const sizeOptions = getImageSizeOptions(selectedImage.typeId);
    const hasFixedSizes = sizeOptions.length > 0;
    const currentSizeVariant = selectedImage.sizeVariant || 1;
    const maxSize = hasFixedSizes ? sizeOptions.length : 4;
    const flexibleBounds = hasFixedSizes
      ? null
      : getFlexibleImageBounds(selectedImage.typeId);
    const flexibleMinHeight = flexibleBounds?.minHeight ?? 30;
    const flexibleMaxHeight = flexibleBounds?.maxHeight ?? 1200;
    const flexibleInitHeight = flexibleBounds?.initHeight ?? 50;
    const currentFlexibleHeight = Math.min(
      flexibleMaxHeight,
      Math.max(
        flexibleMinHeight,
        Math.round(selectedImage.heightMm || flexibleInitHeight),
      ),
    );
    const aspectRatio =
      selectedImage.croppedAspectRatio ||
      (selectedImage.widthMm && selectedImage.heightMm
        ? selectedImage.widthMm / selectedImage.heightMm
        : 1) ||
      1;

    const applyFlexibleHeight = (nextHeight: number) => {
      const clampedHeight = Math.min(
        flexibleMaxHeight,
        Math.max(flexibleMinHeight, Math.round(nextHeight)),
      );
      const derivedWidth = Math.max(1, Math.round(clampedHeight * aspectRatio));
      updateImageSize(selectedImageId, derivedWidth, clampedHeight);
    };
    const applyFixedSizeVariant = (variant: number) => {
      const newSize = Math.min(maxSize, Math.max(1, variant));
      const dims = sizeOptions[newSize - 1];
      const selectedImg = selectedImages.find(
        (img) => img.id === selectedImageId,
      );
      const sizeAspectRatio =
        selectedImg?.croppedAspectRatio || dims.width / dims.height;
      updateImageSizeVariant(selectedImageId, newSize);
      updateImageSize(
        selectedImageId,
        dims.height * sizeAspectRatio,
        dims.height,
      );
    };
    return (
      <div className="space-y-3">
        {/* Hidden file input for image update flow */}
        <input
          ref={updateFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpdateUpload}
          className="hidden"
        />

        {/* Back to all images navigation bar */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setSelectedImageId(null)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:text-[#c49a45] day:text-[#6a6156] day:hover:text-[#9a742f]"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            All Images ({selectedImages.length})
          </button>
          <span className="rounded-md border border-[#c49a45]/30 bg-[#c49a45]/10 px-2 py-0.5 font-sans text-xs font-medium text-[#f0d89f] day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#9a742f]">
            Selected
          </span>
        </div>

        {/* Image Info & Size Card */}
        <div className={sectionCardClass}>
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0c0b0a] day:border-[#dfd7ca] day:bg-[#ede7dc]">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.typeName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-base font-medium text-white day:text-[#1a1714]">
                {selectedImage.typeName}
              </h3>
              <p className="font-sans text-xs text-white/60 day:text-[#6a6156]">
                {formatImageSize(selectedImage.widthMm, selectedImage.heightMm)}
              </p>
            </div>
          </div>

          <div className="mt-3 border-t border-white/10 pt-3 day:border-[#dfd7ca]">
            <div className="mb-2 font-sans text-xs font-semibold tracking-wider text-[#c49a45] uppercase day:text-[#9a742f]">
              Size
            </div>
            {hasFixedSizes ? (
              <select
                value={currentSizeVariant}
                onChange={(e) => applyFixedSizeVariant(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-sans text-xs font-semibold text-white transition-colors outline-none focus:border-[#c49a45] focus:ring-2 focus:ring-[#c49a45]/20 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#1a1714] day:focus:border-[#9a742f] day:shadow-sm [&>option]:bg-white [&>option]:text-gray-900"
              >
                {sizeOptions.map((size, index) => (
                  <option key={size.label} value={index + 1}>
                    {formatImageSize(size.height * aspectRatio, size.height)}
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label className={labelClass}>Height</label>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        applyFlexibleHeight(
                          currentFlexibleHeight -
                            (unitSystem === 'imperial' ? 25.4 / 8 : 10),
                        )
                      }
                      className={controlButtonClass}
                      aria-label="Decrease height"
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
                      value={formatImageLength(currentFlexibleHeight)}
                      onChange={(e) => {
                        const val = parseImageLength(e.target.value);
                        if (val !== null) {
                          applyFlexibleHeight(val);
                        }
                      }}
                      onBlur={(e) => {
                        const val = parseImageLength(e.target.value);
                        if (val === null) {
                          applyFlexibleHeight(flexibleInitHeight);
                        } else {
                          applyFlexibleHeight(val);
                        }
                      }}
                      className={`${numberInputBaseClass} w-20`}
                    />
                    <span className="font-sans text-xs text-white/70 day:text-[#6a6156]">
                      {lengthUnit}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        applyFlexibleHeight(
                          currentFlexibleHeight +
                            (unitSystem === 'imperial' ? 25.4 / 8 : 10),
                        )
                      }
                      className={controlButtonClass}
                      aria-label="Increase height"
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
                  </div>
                </div>
                <div className="relative mt-3">
                  <DesignerRangeInput
                    type="range"
                    min={flexibleMinHeight}
                    max={flexibleMaxHeight}
                    step={unitSystem === 'imperial' ? 25.4 / 8 : 1}
                    value={currentFlexibleHeight}
                    onChange={(e) =>
                      applyFlexibleHeight(Number(e.target.value))
                    }
                    className={rangeInputClass}
                  />
                  <div className={rangeBoundsClass}>
                    <span>
                      {formatImageLength(flexibleMinHeight)} {lengthUnit}
                    </span>
                    <span>
                      {formatImageLength(flexibleMaxHeight)} {lengthUnit}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rotation Card */}
        <div className={sectionCardClass}>
          <div className="flex items-center justify-between">
            <div className="font-sans text-xs font-semibold tracking-wider text-[#c49a45] uppercase day:text-[#9a742f]">
              Rotation
            </div>
            <div className="flex items-center gap-2">
              {imageRotationDeg !== 0 && (
                <button
                  type="button"
                  onClick={() => updateImageRotationDegrees(0)}
                  className="rounded border border-[#c49a45]/50 px-2 py-0.5 text-xs font-semibold text-[#f0d89f] transition-colors hover:bg-[#c49a45]/15 day:border-[#9a742f]/40 day:text-[#9a742f] day:hover:bg-[#9a742f]/10"
                >
                  Reset 0°
                </button>
              )}
              <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 font-sans text-xs font-semibold tabular-nums text-white/70 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#6a6156]">
                {Math.round(imageRotationDeg)}°
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                updateImageRotationDegrees(
                  Math.max(-180, imageRotationDeg - 1),
                );
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
              value={Math.round(imageRotationDeg)}
              onChange={(e) => {
                updateImageRotationDegrees(
                  snapImageRotation(Number(e.target.value)),
                );
              }}
              onBlur={(e) => {
                const val = Number(e.target.value);
                if (val < -180) {
                  updateImageRotationDegrees(-180);
                } else if (val > 180) {
                  updateImageRotationDegrees(180);
                }
              }}
              className={`${numberInputBaseClass} w-16 text-center`}
            />
            <button
              type="button"
              onClick={() => {
                updateImageRotationDegrees(
                  Math.min(180, imageRotationDeg + 1),
                );
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
              value={imageRotationDeg}
              onChange={(e) => {
                updateImageRotationDegrees(
                  snapImageRotation(Number(e.target.value)),
                );
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

        {/* Position Nudge Controls (Available for fine tuning) */}
        <div className={sectionCardClass}>
          <div className="mb-2 font-sans text-xs font-semibold tracking-wider text-[#c49a45] uppercase day:text-[#9a742f]">
            Position
          </div>
          <button
            type="button"
            onClick={() =>
              updateSelectedImagePosition(0, selectedImage.yPos ?? 0)
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
              aria-label="Move image up"
              onClick={() =>
                updateSelectedImagePosition(
                  selectedImage.xPos ?? 0,
                  (selectedImage.yPos ?? 0) + imagePositionStep,
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
              aria-label="Move image left"
              onClick={() =>
                updateSelectedImagePosition(
                  (selectedImage.xPos ?? 0) - imagePositionStep,
                  selectedImage.yPos ?? 0,
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
              aria-label="Move image right"
              onClick={() =>
                updateSelectedImagePosition(
                  (selectedImage.xPos ?? 0) + imagePositionStep,
                  selectedImage.yPos ?? 0,
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
              aria-label="Move image down"
              onClick={() =>
                updateSelectedImagePosition(
                  selectedImage.xPos ?? 0,
                  (selectedImage.yPos ?? 0) - imagePositionStep,
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

        {/* Action Buttons Card */}
        <div className={sectionCardClass}>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#c49a45]/60 bg-[#c49a45]/15 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#f0d89f] transition-all hover:bg-[#c49a45]/25 day:border-[#9a742f]/40 day:bg-[#9a742f]/10 day:text-[#9a742f] day:hover:bg-[#9a742f]/20"
              onClick={() => {
                setUpdatingImageId(selectedImageId);
                updateFileInputRef.current?.click();
              }}
            >
              Update
            </button>
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-white/10 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#1a1714] day:hover:bg-[#ede7dc]"
              onClick={() => duplicateImage(selectedImageId)}
            >
              Duplicate
            </button>
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-red-300 transition-all hover:bg-red-900/30 day:border-red-200 day:bg-red-50 day:text-red-700"
              onClick={() => {
                removeImage(selectedImageId);
                setSelectedImageId(null);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="designer-images-panel"
      className="flex h-full flex-col gap-3"
    >
      {/* Hidden file input for image update flow */}
      <input
        ref={updateFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpdateUpload}
        className="hidden"
      />
      {feedbackMessage && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            feedbackTone === 'error'
              ? 'border-red-500/40 bg-red-900/25 text-red-200'
              : 'border-blue-500/40 bg-blue-900/25 text-blue-200'
          }`}
        >
          {feedbackMessage}
        </div>
      )}
      {!selectedType ? (
        <>
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-serif text-sm font-normal text-white day:text-[#1a1714]">
              Select image type
            </h3>
            <span className="font-sans text-xs font-medium text-white/60 day:text-[#786e61]">
              {imageTypes.length} types
            </span>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-2.5 p-1">
              {imageTypes.map((imageType) => {
                const thumbnail =
                  IMAGE_THUMBNAILS[imageType.id] || '/jpg/photos/m.jpg';

                return (
                  <button
                    key={imageType.id}
                    type="button"
                    onClick={() => handleImageTypeSelect(imageType)}
                    className="group relative flex min-h-[174px] cursor-pointer flex-col overflow-hidden rounded-xl border border-white/10 bg-[#161412] text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#c49a45]/70 hover:shadow-xl day:border-[#dfd7ca] day:bg-white day:shadow-[0_4px_16px_rgba(40,30,20,0.06)] day:hover:border-[#9a742f] day:hover:shadow-[0_10px_26px_rgba(40,30,20,0.12)]"
                  >
                    <div className="relative aspect-square w-full overflow-hidden border-b border-white/8 bg-gradient-to-b from-[#1c1a17] to-[#141210] day:border-[#ebe4d8] day:bg-gradient-to-b day:from-[#f8f5ee] day:to-[#ede6d8]">
                      <Image
                        src={thumbnail}
                        alt={imageType.name}
                        fill
                        className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-110 motion-reduce:transition-none"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex min-h-[58px] items-center justify-center p-2">
                      <span className="line-clamp-2 text-center font-serif text-xs leading-snug font-normal text-white transition-colors group-hover:text-[#f0d89f] day:text-[#1a1714] day:group-hover:text-[#9a742f]">
                        {getImageTypeLabel(imageType.name)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          {productId !== '32' && !showCropSection && (
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToImageTypes}
                className="flex items-center gap-1.5 font-sans text-xs font-semibold text-white/80 transition-colors hover:text-[#c49a45] day:text-[#5a5248] day:hover:text-[#9a742f]"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Back to image types
              </button>
            </div>
          )}

          <div className="custom-scrollbar flex-1 overflow-y-auto pr-1">
            <div
              className={
                showCropSection ? 'space-y-4 pb-24 md:pb-0' : 'space-y-4'
              }
            >
              {selectedType && !showCropSection && (
                <div className="flex items-center gap-3 rounded-xl border border-[#c49a45] bg-[#161412] p-3 shadow-md day:border-[#9a742f] day:bg-white day:shadow-[0_4px_16px_rgba(40,30,20,0.06)]">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] day:border-[#ebe4d8]">
                    <Image
                      src={
                        IMAGE_THUMBNAILS[selectedType.id] || '/jpg/photos/m.jpg'
                      }
                      alt={selectedType.name}
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-sans text-[10px] font-semibold tracking-wider text-[#c49a45] uppercase day:text-[#9a742f]">
                      Selected
                    </div>
                    <div className="font-serif text-sm leading-snug font-normal text-white day:text-[#1a1714]">
                      {getImageTypeLabel(selectedType.name)}
                    </div>
                  </div>
                  <CheckCircleIcon className="h-5 w-5 shrink-0 text-[#c49a45] day:text-[#9a742f]" />
                </div>
              )}

              {/* Upload Section */}
              {!showCropSection && (
                <div className="rounded-xl border border-dashed border-white/20 bg-[#161412] p-6 text-center transition-all hover:border-[#c49a45]/60 day:border-[#d6cebf] day:bg-white day:shadow-sm day:hover:border-[#9a742f]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block cursor-pointer"
                  >
                    <div className="mb-4">
                      <svg
                        className="mx-auto h-12 w-12 text-stone-400 transition-colors group-hover:text-[#c49a45] day:text-[#8a8175] day:group-hover:text-[#9a742f]"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="mb-1.5 font-serif text-base font-normal text-white day:text-[#1a1714]">
                      Click to upload photo
                    </div>
                    <div className="font-sans text-xs text-stone-400 day:text-[#786e61]">
                      PNG, JPG, WebP up to 5MB
                    </div>
                  </label>
                </div>
              )}

              {/* Crop Section - Controls only in sidebar */}
              {showCropSection && uploadedImage && (
                <div className="space-y-2.5">
                  {/* Step 1: Select Mask — hidden for Full Color Plaque (printed directly) */}
                  {productId !== '32' && (
                    <div className={cropSectionClass}>
                      <div className="mb-2 font-sans text-xs font-semibold tracking-wider text-[#c49a45] uppercase day:text-[#9a742f]">
                        Step 1 · Mask
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {MASK_OPTIONS.filter((mask) =>
                          isGraniteImage
                            ? true
                            : [
                                'oval',
                                'horizontal-oval',
                                'square',
                                'rectangle',
                              ].includes(mask.id),
                        ).map((mask) => (
                          <button
                            key={mask.id}
                            onClick={() => setSelectedMask(mask.id)}
                            title={mask.label}
                            className={`h-12 rounded-lg border-2 transition-all ${
                              selectedMask === mask.id
                                ? 'border-[#c49a45] bg-[#c49a45]/20 shadow-[0_0_0_2px_rgba(196,154,69,0.2)]'
                                : 'border-white/10 bg-white/[0.04] hover:border-[#c49a45]/50 day:border-[#dfd7ca] day:bg-white day:shadow-sm day:hover:border-[#9a742f]'
                            }`}
                          >
                            <div className="flex h-full items-center justify-center p-1">
                              <Image
                                src={mask.svg}
                                alt={mask.label}
                                width={24}
                                height={24}
                                className="h-8 w-8 object-contain opacity-80 invert day:invert-0"
                                unoptimized
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Color Mode */}
                  <div className={cropSectionClass}>
                    <div className="mb-2 font-sans text-xs font-semibold tracking-wider text-[#c49a45] uppercase day:text-[#9a742f]">
                      Step 2 · Photo finish
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'full', label: 'Full Color' },
                          { id: 'bw', label: 'B & W' },
                          { id: 'sepia', label: 'Sepia' },
                        ] as const
                      ).map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setCropColorMode(mode.id)}
                          disabled={isGraniteImage && mode.id !== 'bw'}
                          className={`flex h-9 items-center justify-center rounded-lg border text-xs font-medium transition-all ${
                            cropColorMode === mode.id
                              ? 'border-[#c49a45] bg-[#c49a45]/20 text-[#f0d89f] shadow-sm day:border-[#9a742f] day:bg-[#9a742f]/15 day:text-[#9a742f]'
                              : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:text-white day:border-[#dfd7ca] day:bg-white day:text-[#5a5248] day:hover:border-[#9a742f] day:hover:text-[#1a1714]'
                          } ${isGraniteImage && mode.id !== 'bw' ? 'cursor-not-allowed opacity-40' : ''}`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                    {isGraniteImage && (
                      <div className="mt-2 font-sans text-xs text-white/60 day:text-[#6a6156]">
                        Granite images are laser etched and limited to Black &
                        White.
                      </div>
                    )}
                  </div>

                  {/* Step 3: Position and Resize */}
                  <div className={cropSectionClass}>
                    <div className="mb-2 font-sans text-xs font-semibold tracking-wider text-[#c49a45] uppercase day:text-[#9a742f]">
                      Step 3 · Crop area
                    </div>

                    {/* Size Slider - controls mask height */}
                    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 day:border-[#dfd7ca] day:bg-[#f7f4ee]">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-serif text-sm font-normal text-white day:text-[#1a1714]">
                          Size
                        </span>
                        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 font-sans text-xs font-semibold tabular-nums text-white/70 day:border-[#dfd7ca] day:bg-white day:text-[#6a6156]">
                          {Math.round(cropArea.height)}%
                        </span>
                      </div>
                      <div className="relative mt-2.5">
                        <DesignerRangeInput
                          type="range"
                          min="20"
                          max="80"
                          value={cropArea.height}
                          onChange={(e) => {
                            const newHeight = parseInt(e.target.value);
                            setCropArea((prev) => {
                              // Calculate center point (stays fixed during resize)
                              const centerX = prev.x + prev.width / 2;
                              const centerY = prev.y + prev.height / 2;

                              // Maintain aspect ratio if fixed sizes
                              if (hasFixedSizes && activeSize) {
                                const aspectRatio =
                                  activeSize.width / activeSize.height;
                                const newWidth = newHeight * aspectRatio;
                                return {
                                  ...prev,
                                  x: centerX - newWidth / 2,
                                  y: centerY - newHeight / 2,
                                  width: newWidth,
                                  height: newHeight,
                                };
                              }
                              // Free scaling - maintain current aspect ratio
                              const currentAspectRatio =
                                prev.width / prev.height;
                              const newWidth = newHeight * currentAspectRatio;
                              return {
                                ...prev,
                                x: centerX - newWidth / 2,
                                y: centerY - newHeight / 2,
                                width: newWidth,
                                height: newHeight,
                              };
                            });
                          }}
                          className={rangeInputClass}
                        />
                      </div>
                      <div className="mt-2.5 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const newHeight = Math.max(20, cropArea.height - 5);
                            setCropArea((prev) => {
                              // Calculate center point (stays fixed during resize)
                              const centerX = prev.x + prev.width / 2;
                              const centerY = prev.y + prev.height / 2;

                              if (hasFixedSizes && activeSize) {
                                const aspectRatio =
                                  activeSize.width / activeSize.height;
                                const newWidth = newHeight * aspectRatio;
                                return {
                                  ...prev,
                                  x: centerX - newWidth / 2,
                                  y: centerY - newHeight / 2,
                                  width: newWidth,
                                  height: newHeight,
                                };
                              }
                              const currentAspectRatio =
                                prev.width / prev.height;
                              const newWidth = newHeight * currentAspectRatio;
                              return {
                                ...prev,
                                x: centerX - newWidth / 2,
                                y: centerY - newHeight / 2,
                                width: newWidth,
                                height: newHeight,
                              };
                            });
                          }}
                          className={cropAdjustButtonClass}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                          Smaller
                        </button>
                        <button
                          onClick={() => {
                            const newHeight = Math.min(80, cropArea.height + 5);
                            setCropArea((prev) => {
                              // Calculate center point (stays fixed during resize)
                              const centerX = prev.x + prev.width / 2;
                              const centerY = prev.y + prev.height / 2;

                              if (hasFixedSizes && activeSize) {
                                const aspectRatio =
                                  activeSize.width / activeSize.height;
                                const newWidth = newHeight * aspectRatio;
                                return {
                                  ...prev,
                                  x: centerX - newWidth / 2,
                                  y: centerY - newHeight / 2,
                                  width: newWidth,
                                  height: newHeight,
                                };
                              }
                              const currentAspectRatio =
                                prev.width / prev.height;
                              const newWidth = newHeight * currentAspectRatio;
                              return {
                                ...prev,
                                x: centerX - newWidth / 2,
                                y: centerY - newHeight / 2,
                                width: newWidth,
                                height: newHeight,
                              };
                            });
                          }}
                          className={cropAdjustButtonClass}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Larger
                        </button>
                      </div>
                    </div>

                    {/* Rotation (always available) */}
                    <div className="mt-2.5 rounded-lg border border-white/10 bg-white/[0.04] p-3 day:border-[#dfd7ca] day:bg-[#f7f4ee]">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-serif text-sm font-normal text-white day:text-[#1a1714]">
                          Rotation
                        </span>
                        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 font-sans text-xs font-semibold tabular-nums text-white/70 day:border-[#dfd7ca] day:bg-white day:text-[#6a6156]">
                          {cropRotation}°
                        </span>
                      </div>
                      <div className="relative mt-2.5">
                        <DesignerRangeInput
                          type="range"
                          min="-180"
                          max="180"
                          value={cropRotation}
                          onChange={(e) =>
                            setCropRotation(parseInt(e.target.value))
                          }
                          className={rangeInputClass}
                        />
                        <div className={rangeBoundsClass}>
                          <span>-180°</span>
                          <span>0°</span>
                          <span>+180°</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-2.5 grid grid-cols-4 gap-2">
                      <button
                        onClick={handleFlipX}
                        className={cropToolButtonClass}
                      >
                        Flip X
                      </button>
                      <button
                        onClick={handleFlipY}
                        className={cropToolButtonClass}
                      >
                        Flip Y
                      </button>
                      <button
                        onClick={handleRotateLeft}
                        className={cropToolButtonClass}
                      >
                        90° L
                      </button>
                      <button
                        onClick={handleRotateRight}
                        className={cropToolButtonClass}
                      >
                        90° R
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/10 pt-3 day:border-[#dfd7ca]">
                    {/* Crop Button */}
                    <button
                      onClick={handleCropImage}
                      disabled={isCropping}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c49a45] px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wider text-[#121110] shadow-md transition-all hover:bg-[#d5ad55] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isCropping ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            />
                          </svg>
                          Processing…
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {updatingImageId
                            ? 'Update Cropped Image'
                            : 'Add Cropped Image to Headstone'}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        resetCropState();
                        setUpdatingImageId(null);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-950/20 px-3 py-2.5 font-sans text-xs font-medium uppercase tracking-wider text-red-300 transition-colors hover:bg-red-900/30 day:border-red-200 day:bg-red-50 day:text-red-700"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Cancel Crop
                    </button>
                  </div>
                </div>
              )}

              {/* Currently Added Images */}
              {selectedImages.length > 0 && (
                <div className={sectionCardClass}>
                  <h4 className="day:text-[#1a1714] mb-3 text-sm font-medium uppercase tracking-wider text-white/80">
                    Added Images ({selectedImages.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedImages.map((img) => (
                      <div
                        key={img.id}
                        className="day:border-[#dfd7ca] day:bg-white/80 flex items-center gap-3 rounded-xl border border-white/10 bg-[#161412] p-3 shadow-xs"
                      >
                        <div className="day:bg-[#ede7dc] day:border-[#dfd7ca] relative h-12 w-12 overflow-hidden rounded-lg border border-white/10 bg-[#0c0b0a]">
                          <Image
                            src={img.imageUrl}
                            alt={img.typeName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="day:text-[#1a1714] text-sm font-serif font-medium text-white">
                            {img.typeName}
                          </div>
                          <div className="day:text-[#6a6156] text-xs text-white/50">
                            {formatImageSize(img.widthMm, img.heightMm)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
