'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { AdditionData } from '#/lib/xml-parser';
import Image from 'next/image';
import { fetchMaskMetrics } from '#/lib/mask-metrics';
import { getFlexibleImageBounds, getImageSizeOptions, getImageSizeOption } from '#/lib/image-size-config';
import { MASK_OPTIONS, getMaskAspectRatio, getMaskUrl } from '#/lib/image-mask';
import { useImageCropState } from './useImageCropState';
import { calculateImagePrice, fetchImagePricing, type ImagePricingMap } from '#/lib/image-pricing';
import { logger } from '#/lib/logger';

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

export default function ImageSelector({ onImageSelect }: ImageSelectorProps) {
  // Store hooks
  const selectedImageId = useHeadstoneStore((s) => s.selectedImageId);
  const setSelectedImageId = useHeadstoneStore((s) => s.setSelectedImageId);
  const selectedImages = useHeadstoneStore((s) => s.selectedImages);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const updateImagePosition = useHeadstoneStore((s) => s.updateImagePosition);
  const updateImageSize = useHeadstoneStore((s) => s.updateImageSize);
  const updateImageSizeVariant = useHeadstoneStore((s) => s.updateImageSizeVariant);
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
  const [dragHandle, setDragHandle] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'error' | 'info'>('error');
  const [updatingImageId, setUpdatingImageId] = useState<string | null>(null);
  
  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);
  const addImage = useHeadstoneStore((s) => s.addImage);
  const updateImageData = useHeadstoneStore((s) => s.updateImageData);
  const setCropCanvasData = useHeadstoneStore((s) => s.setCropCanvasData);

  // Image pricing state
  const [imagePricingData, setImagePricingData] = useState<ImagePricingMap | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  useEffect(() => {
    fetchImagePricing().then(setImagePricingData).catch(() => {});
  }, []);

  const sectionCardClass =
    'rounded-lg border border-white/10 bg-[#171717] p-3.5 shadow-lg shadow-black/15 day:border-gray-200 day:bg-white';
  const labelClass =
    'text-sm font-semibold text-slate-100 day:text-gray-800';
  const controlButtonClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.08] text-white transition-colors hover:border-[#D7B356]/50 hover:bg-white/[0.13] day:border-gray-200 day:bg-gray-100 day:text-gray-700 day:hover:bg-gray-200';
  const numberInputBaseClass =
    'h-8 rounded-md border border-white/10 bg-white/[0.08] px-2 text-right text-sm font-semibold text-white transition-colors focus:border-[#D7B356] focus:ring-2 focus:ring-[#D7B356]/30 focus:outline-none day:border-gray-300 day:bg-gray-100 day:text-gray-900';
  const rangeInputClass =
    'fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#171717] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.35),0_0_0_3px_rgba(0,0,0,0.25)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.55),0_0_0_3px_rgba(0,0,0,0.25)] [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#171717] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.35),0_0_0_3px_rgba(0,0,0,0.25)]';
  const rangeBoundsClass =
    'mt-1 flex w-full justify-between text-xs text-white/35 day:text-gray-400';
  const secondaryActionClass =
    'cursor-pointer rounded-lg border border-[#D7B356]/60 bg-[#171717] px-3 py-2 text-sm font-semibold text-[#F2D58B] transition-colors hover:bg-[#D7B356]/15 day:bg-white day:text-[#8a6a12]';
  const cropSectionClass =
    'rounded-lg border border-white/10 bg-[#171717] p-3 shadow-lg shadow-black/15 day:border-gray-200 day:bg-white';
  const cropAdjustButtonClass =
    'flex h-7 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.08] px-3 text-xs font-semibold text-white/75 transition-colors hover:border-[#D7B356]/50 hover:bg-white/[0.13] hover:text-white day:border-gray-200 day:bg-gray-100 day:text-gray-600 day:hover:bg-gray-200 day:hover:text-gray-900';
  const cropToolButtonClass =
    'flex h-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.08] px-2 text-xs font-semibold text-white/85 transition-colors hover:border-[#D7B356]/50 hover:bg-white/[0.13] hover:text-white day:border-gray-200 day:bg-gray-100 day:text-gray-900 day:hover:bg-gray-200';

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
  }, [showCropSection, uploadedImage, selectedMask, cropColorMode, cropScale, cropRotation, flipX, flipY, cropArea, hasFixedSizes, allowFreeformHandles, maskMetrics, setCropCanvasData]);

  // Filter catalog additions to get only image types
  const imageTypes = useMemo(() => {
    if (!catalog?.product?.additions) return [];
    return catalog.product.additions.filter((addition) => addition.type === 'image');
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
        const existingImg = selectedImages.find((i) => i.id === updatingImageId);
        if (existingImg && !selectedType) {
          const matchingType = imageTypes.find((t) => t.id === String(existingImg.typeId));
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
        console.error('[handleCropImage] Failed to load mask metrics on demand:', error);
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
        cropX, cropY, cropW, cropH,
        -cropW / 2, -cropH / 2, cropW, cropH
      );
      ctx.restore();


      // 7. Apply color mode filter
      if (cropColorMode === 'bw') {
        const imageData = ctx.getImageData(0, 0, cropW, cropH);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = data[i + 1] = data[i + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);

      } else if (cropColorMode === 'sepia') {
        const imageData = ctx.getImageData(0, 0, cropW, cropH);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        ctx.putImageData(imageData, 0, 0);

      }

      // 8. Apply mask shape using compositing
      const imageCanvas = document.createElement('canvas');
      imageCanvas.width = cropW;
      imageCanvas.height = cropH;
      const imageCtx = imageCanvas.getContext('2d');
      if (!imageCtx) {
        console.error('[handleCropImage] Failed to create image canvas context');
        return;
      }
      imageCtx.drawImage(canvas, 0, 0);

      const targetMaskAspect = resolvedMaskMetrics?.aspect ?? getMaskAspectRatio(selectedMask);
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
        console.error('[handleCropImage] Failed to create final canvas context');
        return;
      }

      finalCtx.drawImage(
        imageCanvas,
        maskDrawX, maskDrawY, maskDrawWidth, maskDrawHeight,
        0, 0, finalCanvas.width, finalCanvas.height
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
          const nativeWidth = maskImg.naturalWidth || maskImg.width || resolvedMaskMetrics.naturalWidth;
          const nativeHeight = maskImg.naturalHeight || maskImg.height || resolvedMaskMetrics.naturalHeight;
          const sourceX = resolvedMaskMetrics.normalizedBounds.left * nativeWidth;
          const sourceY = resolvedMaskMetrics.normalizedBounds.top * nativeHeight;
          const sourceWidth = resolvedMaskMetrics.normalizedBounds.width * nativeWidth;
          const sourceHeight = resolvedMaskMetrics.normalizedBounds.height * nativeHeight;

          finalCtx.drawImage(
            maskImg,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            finalCanvas.width,
            finalCanvas.height
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
            finalCanvas.height
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
      form.append('file', new File([blob], 'portrait.png', { type: 'image/png' }));

      const uploadResponse = await fetch('/api/upload-image', { method: 'POST', body: form });
      if (!uploadResponse.ok) throw new Error(`Image upload failed: ${uploadResponse.status}`);
      const { url: processedImageUrl } = (await uploadResponse.json()) as { url: string };

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
        'oval': 'oval_vertical',
        'horizontal-oval': 'oval_horizontal',
        'square': 'rectangle_vertical',
        'rectangle': 'rectangle_horizontal',
        'heart': 'heart',
        'teardrop': 'teardrop',
        'triangle': 'triangle',
      };
      const maskShapeFilename = productId === '32' ? '' : (maskShapeMap[selectedMask] || 'oval_vertical');

      if (updatingImageId) {
        // Update existing image: replace photo data, keep position/size/mask
        updateImageData(updatingImageId, processedImageUrl, canonicalAspectRatio, cropColorMode);
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
  const handleRotateLeft = () => setCropRotation(((cropRotation - 90) % 360 + 360) % 360);
  const handleRotateRight = () => setCropRotation((cropRotation + 90) % 360);

  const handleMouseDown = (e: React.MouseEvent, handle: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
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
        const newWidth = Math.max(10, Math.min(100 - prev.x, prev.width + deltaX));
        const newHeight = Math.max(10, prev.height - deltaY);
        newArea.y = Math.max(0, prev.y + deltaY);
        newArea.width = newWidth;
        newArea.height = newHeight;
      } else if (dragHandle === 'sw') {
        const newWidth = Math.max(10, prev.width - deltaX);
        const newHeight = Math.max(10, Math.min(100 - prev.y, prev.height + deltaY));
        newArea.x = Math.max(0, prev.x + deltaX);
        newArea.width = newWidth;
        newArea.height = newHeight;
      } else if (dragHandle === 'se') {
        const newWidth = Math.max(10, Math.min(100 - prev.x, prev.width + deltaX));
        const newHeight = Math.max(10, Math.min(100 - prev.y, prev.height + deltaY));
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
  const selectedImage = selectedImages.find(img => img.id === selectedImageId);

  // Debug logging
  useEffect(() => {
    logger.log('[ImageSelector] State:', { 
      selectedImageId, 
      activePanel, 
      hasSelectedImage: !!selectedImage,
      selectedImagesCount: selectedImages.length,
      selectedImageData: selectedImage ? { id: selectedImage.id, typeName: selectedImage.typeName } : null
    });
  }, [selectedImageId, activePanel, selectedImage, selectedImages]);

  // Show message if no image types available
  if (imageTypes.length === 0) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white day:text-gray-900">No image types available</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-white/60 day:text-gray-500">This product does not support images.</p>
        </div>
      </div>
    );
  }

  // If an image is selected, show editing controls
  // Skip when in update-crop mode so the crop UI renders instead
  if (selectedImageId && selectedImage && !(showCropSection && updatingImageId)) {
    const imageRotationDeg = selectedImage.rotationZ || 0;
    
    // Get size configuration for this image type
    const sizeOptions = getImageSizeOptions(selectedImage.typeId);
    const hasFixedSizes = sizeOptions.length > 0;
    const currentSizeVariant = selectedImage.sizeVariant || 1;
    const maxSize = hasFixedSizes ? sizeOptions.length : 4;
    const flexibleBounds = hasFixedSizes ? null : getFlexibleImageBounds(selectedImage.typeId);
    const flexibleMinHeight = flexibleBounds?.minHeight ?? 30;
    const flexibleMaxHeight = flexibleBounds?.maxHeight ?? 1200;
    const flexibleInitHeight = flexibleBounds?.initHeight ?? 50;
    const currentFlexibleHeight = Math.min(
      flexibleMaxHeight,
      Math.max(flexibleMinHeight, Math.round(selectedImage.heightMm || flexibleInitHeight))
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
        Math.max(flexibleMinHeight, Math.round(nextHeight))
      );
      const derivedWidth = Math.max(1, Math.round(clampedHeight * aspectRatio));
      updateImageSize(selectedImageId, derivedWidth, clampedHeight);
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
        <div className={sectionCardClass}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45 day:text-gray-400">
                Selected Image
              </div>
              <div className="mt-1 truncate text-sm font-semibold text-white day:text-gray-900">
                {selectedImage.typeName}
              </div>
              <div className="mt-1 text-xs font-medium text-white/45 day:text-gray-500">
                {Math.round(selectedImage.widthMm)} × {Math.round(selectedImage.heightMm)} mm
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedImageId(null);
                setActivePanel(null);
              }}
              className="shrink-0 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:border-[#D7B356]/50 hover:text-white day:border-gray-200 day:bg-gray-100 day:text-gray-600 day:hover:text-gray-900"
            >
              Clear
            </button>
          </div>
        </div>

        {(() => {
          const product = imagePricingData?.[String(selectedImage.typeId)];
          const sizeOpt = getImageSizeOption(selectedImage.typeId, currentSizeVariant);
          const w = sizeOpt?.width ?? Math.round(selectedImage.widthMm || 0);
          const h = sizeOpt?.height ?? Math.round(selectedImage.heightMm || 0);
          const price = product ? calculateImagePrice(product, w, h, selectedImage.colorMode) : null;
          return price !== null ? (
            <div className={sectionCardClass}>
              <div className="mb-1 text-xs font-semibold tracking-[0.2em] text-white/45 day:text-gray-500 uppercase">
                Image Price
              </div>
              <div className="text-2xl font-semibold text-[#2EE59D] day:text-gray-900">
                ${price.toFixed(2)}
              </div>
            </div>
          ) : null;
        })()}
        <div className="space-y-3">
          {/* Size Slider */}
          <div className={sectionCardClass}>
            {hasFixedSizes ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <label className={labelClass}>Size</label>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newSize = Math.max(1, currentSizeVariant - 1);
                        updateImageSizeVariant(selectedImageId, newSize);
                        if (hasFixedSizes) {
                          const dims = sizeOptions[newSize - 1];
                          const selectedImg = selectedImages.find(img => img.id === selectedImageId);
                          const aspectRatio = selectedImg?.croppedAspectRatio || (dims.width / dims.height);
                          const scaledHeight = dims.height;
                          const scaledWidth = scaledHeight * aspectRatio;
                          updateImageSize(selectedImageId, scaledWidth, scaledHeight);
                        }
                      }}
                      className={controlButtonClass}
                      aria-label="Decrease size"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={maxSize}
                      step={1}
                      value={currentSizeVariant}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= maxSize) {
                          updateImageSizeVariant(selectedImageId, val);
                          if (hasFixedSizes) {
                            const dims = sizeOptions[val - 1];
                            const selectedImg = selectedImages.find(img => img.id === selectedImageId);
                            const aspectRatio = selectedImg?.croppedAspectRatio || (dims.width / dims.height);
                            const scaledHeight = dims.height;
                            const scaledWidth = scaledHeight * aspectRatio;
                            updateImageSize(selectedImageId, scaledWidth, scaledHeight);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val) || val < 1) {
                          updateImageSizeVariant(selectedImageId, 1);
                          if (hasFixedSizes) {
                            const dims = sizeOptions[0];
                            const selectedImg = selectedImages.find(img => img.id === selectedImageId);
                            const aspectRatio = selectedImg?.croppedAspectRatio || (dims.width / dims.height);
                            const scaledHeight = dims.height;
                            const scaledWidth = scaledHeight * aspectRatio;
                            updateImageSize(selectedImageId, scaledWidth, scaledHeight);
                          }
                        } else if (val > maxSize) {
                          updateImageSizeVariant(selectedImageId, maxSize);
                          if (hasFixedSizes) {
                            const dims = sizeOptions[maxSize - 1];
                            const selectedImg = selectedImages.find(img => img.id === selectedImageId);
                            const aspectRatio = selectedImg?.croppedAspectRatio || (dims.width / dims.height);
                            const scaledHeight = dims.height;
                            const scaledWidth = scaledHeight * aspectRatio;
                            updateImageSize(selectedImageId, scaledWidth, scaledHeight);
                          }
                        }
                      }}
                      className={`${numberInputBaseClass} w-16`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSize = Math.min(maxSize, currentSizeVariant + 1);
                        updateImageSizeVariant(selectedImageId, newSize);
                        if (hasFixedSizes) {
                          const dims = sizeOptions[newSize - 1];
                          const selectedImg = selectedImages.find(img => img.id === selectedImageId);
                          const aspectRatio = selectedImg?.croppedAspectRatio || (dims.width / dims.height);
                          const scaledHeight = dims.height;
                          const scaledWidth = scaledHeight * aspectRatio;
                          updateImageSize(selectedImageId, scaledWidth, scaledHeight);
                        }
                      }}
                      className={controlButtonClass}
                      aria-label="Increase size"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="relative mt-3">
                  <input
                    type="range"
                    min={1}
                    max={maxSize}
                    step={1}
                    value={currentSizeVariant}
                    onChange={(e) => {
                      const newSize = parseInt(e.target.value);
                      updateImageSizeVariant(selectedImageId, newSize);
                      if (hasFixedSizes) {
                        const dims = sizeOptions[newSize - 1];
                        const selectedImg = selectedImages.find(img => img.id === selectedImageId);
                        const aspectRatio = selectedImg?.croppedAspectRatio || (dims.width / dims.height);
                        const scaledHeight = dims.height;
                        const scaledWidth = scaledHeight * aspectRatio;
                        updateImageSize(selectedImageId, scaledWidth, scaledHeight);
                      }
                    }}
                    className={rangeInputClass}
                  />
                  <div className={rangeBoundsClass}>
                    <span>Size 1</span>
                    <span>Size {maxSize}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <label className={labelClass}>Height</label>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => applyFlexibleHeight(currentFlexibleHeight - 10)}
                      className={controlButtonClass}
                      aria-label="Decrease height"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min={flexibleMinHeight}
                      max={flexibleMaxHeight}
                      step={1}
                      value={currentFlexibleHeight}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!Number.isNaN(val)) {
                          applyFlexibleHeight(val);
                        }
                      }}
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (Number.isNaN(val)) {
                          applyFlexibleHeight(flexibleInitHeight);
                        } else {
                          applyFlexibleHeight(val);
                        }
                      }}
                      className={`${numberInputBaseClass} w-20`}
                    />
                    <span className="text-sm font-semibold text-white/70 day:text-gray-600">mm</span>
                    <button
                      type="button"
                      onClick={() => applyFlexibleHeight(currentFlexibleHeight + 10)}
                      className={controlButtonClass}
                      aria-label="Increase height"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="relative mt-3">
                  <input
                    type="range"
                    min={flexibleMinHeight}
                    max={flexibleMaxHeight}
                    step={1}
                    value={currentFlexibleHeight}
                    onChange={(e) => applyFlexibleHeight(Number(e.target.value))}
                    className={rangeInputClass}
                  />
                  <div className={rangeBoundsClass}>
                    <span>{flexibleMinHeight} mm</span>
                    <span>{flexibleMaxHeight} mm</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Rotation Slider */}
          <div className={sectionCardClass}>
            <div className="flex items-center justify-between gap-2">
              <label className={labelClass}>Rotation</label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(-180, imageRotationDeg - 1);
                    updateImageRotation(selectedImageId, newVal);
                  }}
                  className={controlButtonClass}
                  aria-label="Decrease rotation by 1 degree"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  min={-180}
                  max={180}
                  step={1}
                  value={Math.round(imageRotationDeg)}
                  onChange={(e) => {
                    updateImageRotation(selectedImageId, Number(e.target.value));
                  }}
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (val < -180) {
                      updateImageRotation(selectedImageId, -180);
                    } else if (val > 180) {
                      updateImageRotation(selectedImageId, 180);
                    }
                  }}
                  className={`${numberInputBaseClass} w-16`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(180, imageRotationDeg + 1);
                    updateImageRotation(selectedImageId, newVal);
                  }}
                  className={controlButtonClass}
                  aria-label="Increase rotation by 1 degree"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-white/70 day:text-gray-600">°</span>
              </div>
            </div>
            <div className="relative mt-3">
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={imageRotationDeg}
                onChange={(e) => {
                  updateImageRotation(selectedImageId, Number(e.target.value));
                }}
                className={rangeInputClass}
              />
              <div className={rangeBoundsClass}>
                <span>-180°</span>
                <span>180°</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3 day:border-gray-200">
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-emerald-400/20 bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            onClick={() => {
              setUpdatingImageId(selectedImageId);
              updateFileInputRef.current?.click();
            }}
          >
            Update
          </button>
          <button
            type="button"
            className={secondaryActionClass}
            onClick={() => duplicateImage(selectedImageId)}
          >
            Copy
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-red-500/50 bg-[#171717] px-3 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/15 day:bg-white day:text-red-700"
            onClick={() => {
              removeImage(selectedImageId);
              setSelectedImageId(null);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white day:text-gray-900">Select image type</h3>
            <span className="text-sm text-white/50 day:text-gray-500">{imageTypes.length} types</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-3 gap-3 p-1">
              {imageTypes.map((imageType) => {
                const thumbnail = IMAGE_THUMBNAILS[imageType.id] || '/jpg/photos/m.jpg';
                
                return (
                  <button
                    key={imageType.id}
                    type="button"
                    onClick={() => handleImageTypeSelect(imageType)}
                    className="group flex min-h-[166px] cursor-pointer flex-col overflow-hidden rounded-lg border border-white/10 bg-[#171717] text-left shadow-lg shadow-black/15 transition-all hover:-translate-y-0.5 hover:border-[#D7B356]/60 hover:bg-white/[0.06] hover:shadow-[#D7B356]/10 day:border-gray-200 day:bg-white"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-[#0A0A0A] day:bg-gray-100">
                      <Image
                        src={thumbnail}
                        alt={imageType.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex min-h-[58px] items-start p-3">
                      <span className="line-clamp-2 flex-1 text-xs font-semibold leading-snug text-white day:text-gray-900">
                        {imageType.name}
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
          {productId !== '32' && (
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToImageTypes}
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white day:text-gray-600 day:hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to image types
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="space-y-4">


              {/* Upload Section */}
              {!showCropSection && (
                <div className="rounded-lg border border-dashed border-white/20 bg-[#171717] p-6 text-center shadow-lg shadow-black/15 day:border-gray-300 day:bg-white">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer inline-block">
                    <div className="mb-4">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 day:text-gray-500"
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
                    <div className="text-white day:text-gray-900 font-semibold mb-2">Click to upload</div>
                    <div className="text-sm text-gray-400 day:text-gray-500">PNG, JPG, GIF up to 5MB</div>
                  </label>
                </div>
              )}

              {/* Crop Section - Controls only in sidebar */}
              {showCropSection && uploadedImage && (
                <div className="space-y-2.5">
                  <div className={cropSectionClass}>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45 day:text-gray-400">
                      Image Type
                    </div>
                    <h4 className="text-sm font-semibold text-white day:text-gray-900">{selectedType.name}</h4>
                  </div>

                  {/* Step 1: Select Mask — hidden for Full Color Plaque (printed directly) */}
                  {productId !== '32' && (
                    <div className={cropSectionClass}>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/45 day:text-gray-500">Step 1 · Mask</div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {MASK_OPTIONS.filter((mask) =>
                          isGraniteImage
                            ? true
                            : ['oval', 'horizontal-oval', 'square', 'rectangle'].includes(mask.id)
                        ).map((mask) => (
                          <button
                            key={mask.id}
                            onClick={() => setSelectedMask(mask.id)}
                            title={mask.label}
                            className={`h-12 rounded-md border-2 transition-all ${
                              selectedMask === mask.id
                                ? 'border-[#D7B356] bg-[#D7B356]/20 shadow-[0_0_0_2px_rgba(215,179,86,0.18)]'
                                : 'border-white/10 bg-white/[0.05] hover:border-[#D7B356]/50 day:border-gray-200 day:bg-white day:hover:border-gray-300'
                            }`}
                          >
                            <div className="flex h-full items-center justify-center p-1">
                              <Image
                                src={mask.svg}
                                alt={mask.label}
                                width={24}
                                height={24}
                                className="h-8 w-8 object-contain opacity-80"
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
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/45 day:text-gray-500">Step 2 · Photo finish</div>
                    <select
                      value={cropColorMode}
                      onChange={(e) => setCropColorMode(e.target.value as 'full' | 'bw' | 'sepia')}
                      disabled={isGraniteImage}
                      className={`w-full rounded-lg border border-white/10 bg-white/[0.08] px-3 py-1.5 text-sm font-semibold text-white outline-none transition-colors focus:border-[#D7B356] focus:ring-2 focus:ring-[#D7B356]/30 day:border-gray-300 day:bg-gray-100 day:text-gray-900 ${
                        isGraniteImage ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="full">Full color</option>
                      <option value="bw">Black & White</option>
                      <option value="sepia">Sepia</option>
                    </select>
                    {isGraniteImage && (
                      <div className="mt-2 text-xs text-white/60 day:text-gray-500">
                        Granite images are laser etched and limited to Black & White.
                      </div>
                    )}
                  </div>

                  {/* Step 3: Position and Resize */}
                  <div className={cropSectionClass}>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/45 day:text-gray-500">Step 3 · Crop area</div>
                    
                    {/* Size Slider - controls mask height */}
                    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5 day:border-gray-200 day:bg-gray-50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-white day:text-gray-900">Size</span>
                        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-xs font-semibold text-white/65 day:border-gray-200 day:bg-white day:text-gray-500">{Math.round(cropArea.height)}%</span>
                      </div>
                      <div className="relative mt-2.5">
                        <input
                          type="range"
                          min="20"
                          max="80"
                          value={cropArea.height}
                          onChange={(e) => {
                            const newHeight = parseInt(e.target.value);
                            setCropArea(prev => {
                              // Calculate center point (stays fixed during resize)
                              const centerX = prev.x + prev.width / 2;
                              const centerY = prev.y + prev.height / 2;
                              
                              // Maintain aspect ratio if fixed sizes
                              if (hasFixedSizes && activeSize) {
                                const aspectRatio = activeSize.width / activeSize.height;
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
                              const currentAspectRatio = prev.width / prev.height;
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
                            setCropArea(prev => {
                              // Calculate center point (stays fixed during resize)
                              const centerX = prev.x + prev.width / 2;
                              const centerY = prev.y + prev.height / 2;
                              
                              if (hasFixedSizes && activeSize) {
                                const aspectRatio = activeSize.width / activeSize.height;
                                const newWidth = newHeight * aspectRatio;
                                return {
                                  ...prev,
                                  x: centerX - newWidth / 2,
                                  y: centerY - newHeight / 2,
                                  width: newWidth,
                                  height: newHeight,
                                };
                              }
                              const currentAspectRatio = prev.width / prev.height;
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
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                          Smaller
                        </button>
                        <button
                          onClick={() => {
                            const newHeight = Math.min(80, cropArea.height + 5);
                            setCropArea(prev => {
                              // Calculate center point (stays fixed during resize)
                              const centerX = prev.x + prev.width / 2;
                              const centerY = prev.y + prev.height / 2;
                              
                              if (hasFixedSizes && activeSize) {
                                const aspectRatio = activeSize.width / activeSize.height;
                                const newWidth = newHeight * aspectRatio;
                                return {
                                  ...prev,
                                  x: centerX - newWidth / 2,
                                  y: centerY - newHeight / 2,
                                  width: newWidth,
                                  height: newHeight,
                                };
                              }
                              const currentAspectRatio = prev.width / prev.height;
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
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Larger
                        </button>
                      </div>
                    </div>

                    {/* Rotation (always available) */}
                    <div className="mt-2.5 rounded-lg border border-white/10 bg-white/[0.04] p-2.5 day:border-gray-200 day:bg-gray-50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-white day:text-gray-900">Rotation</span>
                        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-xs font-semibold text-white/65 day:border-gray-200 day:bg-white day:text-gray-500">{cropRotation}°</span>
                      </div>
                      <div className="relative mt-2.5">
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={cropRotation}
                          onChange={(e) => setCropRotation(parseInt(e.target.value))}
                          className={rangeInputClass}
                        />
                      </div>
                      <div className="mt-2.5 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setCropRotation(((cropRotation - 5) % 360 + 360) % 360)}
                          className={cropAdjustButtonClass}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                          -5°
                        </button>
                        <button
                          onClick={() => setCropRotation((cropRotation + 5) % 360)}
                          className={cropAdjustButtonClass}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          +5°
                        </button>
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

                  <div className="border-t border-white/10 pt-3 day:border-gray-200">
                    {/* Crop Button */}
                    <button
                      onClick={handleCropImage}
                      disabled={isCropping}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#D7B356] bg-[#D7B356] px-4 py-2.5 font-semibold text-black transition-colors hover:bg-[#E4C778] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isCropping ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Processing…
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {updatingImageId ? 'Update photo' : 'Apply crop'}
                        </>
                      )}
                    </button>

                    <div className="mt-2">
                      <button
                        onClick={() => {
                          resetCropState();
                          setUpdatingImageId(null);
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-[#171717] px-3 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/15 day:bg-white day:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Currently Added Images */}
              {selectedImages.length > 0 && (
                <div className={sectionCardClass}>
                  <h4 className="mb-3 text-sm font-semibold text-white day:text-gray-900">
                    Added Images ({selectedImages.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedImages.map((img) => (
                      <div
                        key={img.id}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-3 day:border-gray-200 day:bg-gray-50"
                      >
                        <div className="w-12 h-12 bg-gray-800 day:bg-gray-100 rounded overflow-hidden relative">
                          <Image
                            src={img.imageUrl}
                            alt={img.typeName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white day:text-gray-900 text-sm font-medium">{img.typeName}</div>
                          <div className="text-xs text-gray-400 day:text-gray-500">
                            {img.widthMm} × {img.heightMm} mm
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
