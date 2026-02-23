'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { AdditionData } from '#/lib/xml-parser';
import Image from 'next/image';
import { fetchMaskMetrics, type MaskMetrics } from '#/lib/mask-metrics';

interface ImageSelectorProps {
  onImageSelect?: (imageType: AdditionData) => void;
}

// Map image IDs to their thumbnail paths
const IMAGE_THUMBNAILS: Record<string, string> = {
  '7': '/jpg/photos/product-ceramic-image.jpg',
  '21': '/jpg/photos/m.jpg',
  '135': '/jpg/photos/m.jpg',
  '2300': '/jpg/photos/product-vitreous-enamel-image.jpg',
  '2400': '/jpg/photos/plana.jpg',
};

// Size configurations for different image products (from images.xml)
const IMAGE_SIZE_CONFIGS: Record<string, { sizes: Array<{ width: number; height: number }> }> = {
  '7': { // Ceramic Images - 9 sizes
    sizes: [
      { width: 40, height: 60 },   // Size 1
      { width: 50, height: 70 },   // Size 2
      { width: 60, height: 80 },   // Size 3
      { width: 70, height: 90 },   // Size 4
      { width: 80, height: 100 },  // Size 5
      { width: 90, height: 120 },  // Size 6
      { width: 110, height: 150 }, // Size 7
      { width: 130, height: 180 }, // Size 8
      { width: 180, height: 240 }, // Size 9
    ],
  },
  '2300': { // Vitreous Enamel - 9 sizes (similar)
    sizes: [
      { width: 40, height: 60 },
      { width: 50, height: 70 },
      { width: 60, height: 80 },
      { width: 70, height: 90 },
      { width: 80, height: 100 },
      { width: 90, height: 120 },
      { width: 110, height: 150 },
      { width: 130, height: 180 },
      { width: 180, height: 240 },
    ],
  },
  '2400': { // Premium Plana - 4 sizes
    sizes: [
      { width: 60, height: 80 },
      { width: 90, height: 120 },
      { width: 110, height: 150 },
      { width: 130, height: 180 },
    ],
  },
  // Products without fixed sizes (flexible sizing)
  '21': { sizes: [] }, // Granite Image - laser etched, flexible size
  '135': { sizes: [] }, // YAG Lasered - flexible size
};

type MaskShape = 'oval' | 'horizontal-oval' | 'square' | 'rectangle' | 'heart' | 'teardrop' | 'triangle';

const MASK_URL_MAP: Record<string, string> = {
  oval: '/shapes/masks/oval_vertical.svg',
  'horizontal-oval': '/shapes/masks/oval_horizontal.svg',
  square: '/shapes/masks/rectangle_vertical.svg',
  rectangle: '/shapes/masks/rectangle_horizontal.svg',
  heart: '/shapes/masks/heart.svg',
  teardrop: '/shapes/masks/teardrop.svg',
  triangle: '/shapes/masks/triangle.svg',
};

const MASK_ASPECT_FALLBACK: Record<MaskShape, number> = {
  oval: 0.8,
  'horizontal-oval': 1.25,
  square: 0.8,
  rectangle: 1.25,
  heart: 640 / 600,
  teardrop: 0.71,
  triangle: 1.16,
};

const getMaskUrl = (mask: string) => MASK_URL_MAP[mask];
const getMaskAspectRatio = (mask: string): number => MASK_ASPECT_FALLBACK[mask as MaskShape] ?? 0.8;

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
  
  const [selectedType, setSelectedType] = useState<AdditionData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showCropSection, setShowCropSection] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  
  // Crop state
  const [selectedMask, setSelectedMask] = useState<MaskShape>('oval');
  const [cropColorMode, setCropColorMode] = useState<'full' | 'bw' | 'sepia'>('full');
  const [cropScale, setCropScale] = useState(100);
  const [cropRotation, setCropRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [maskMetrics, setMaskMetrics] = useState<MaskMetrics | null>(null);
  
  // Get available sizes for selected image type
  const availableSizes = useMemo(() => {
    if (!selectedType) return [];
    
    if (selectedType.id === '21') {
      return null;
    }
    
    const fixedSizes: Record<string, Array<{width: number, height: number, name: string}>> = {
      '7': [
        { width: 40, height: 60, name: '40 × 60 mm' },
        { width: 50, height: 70, name: '50 × 70 mm' },
        { width: 60, height: 80, name: '60 × 80 mm' },
        { width: 70, height: 90, name: '70 × 90 mm' },
        { width: 80, height: 100, name: '80 × 100 mm' },
        { width: 90, height: 120, name: '90 × 120 mm' },
        { width: 110, height: 150, name: '110 × 150 mm' },
        { width: 130, height: 180, name: '130 × 180 mm' },
        { width: 180, height: 240, name: '180 × 240 mm' },
        { width: 240, height: 300, name: '240 × 300 mm' },
      ],
      '2300': [
        { width: 50, height: 70, name: '50 × 70 mm' },
        { width: 60, height: 80, name: '60 × 80 mm' },
        { width: 70, height: 90, name: '70 × 90 mm' },
        { width: 80, height: 100, name: '80 × 100 mm' },
        { width: 90, height: 120, name: '90 × 120 mm' },
        { width: 110, height: 150, name: '110 × 150 mm' },
        { width: 130, height: 180, name: '130 × 180 mm' },
        { width: 180, height: 240, name: '180 × 240 mm' },
      ],
      '2400': [
        { width: 55, height: 75, name: '55 × 75 mm' },
        { width: 60, height: 80, name: '60 × 80 mm' },
        { width: 70, height: 90, name: '70 × 90 mm' },
        { width: 80, height: 100, name: '80 × 100 mm' },
        { width: 90, height: 120, name: '90 × 120 mm' },
        { width: 110, height: 150, name: '110 × 150 mm' },
      ],
    };
    
    return fixedSizes[selectedType.id] || [];
  }, [selectedType]);
  const hasFixedSizes = useMemo(() => availableSizes !== null && availableSizes.length > 0, [availableSizes]);
  
  // Crop area state (in percentage of preview container)
  // Default for oval (portrait): 0.8:1 aspect ratio (400/500)
  const [cropArea, setCropArea] = useState({
    x: 26, // left position as % - centered for 48% width
    y: 20, // top position as %
    width: 48, // width as % - 0.8 aspect ratio
    height: 60, // height as % (portrait aspect)
  });

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
  
  // Adjust crop area dimensions when mask changes or on initial load
  useEffect(() => {
    const maskAspect = maskMetrics?.aspect ?? getMaskAspectRatio(selectedMask);
    const isGraniteImage = selectedType?.id === 21 || selectedType?.id === 135;

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
      const imgType = imgWidth === imgHeight ? 'SQUARE' : imgWidth > imgHeight ? 'LANDSCAPE' : 'PORTRAIT';

      let width = 50;
      let height = 50;

      if (imgType === 'PORTRAIT' || imgType === 'SQUARE') {
        const ratio = imgWidth / imgHeight;
        width = 50;
        height = (50 * ratio) * 0.7;
      }

      centerCrop(width, height);
      return;
    }

    const portraitPreferred = maskAspect < 1;
    const baseHeight = portraitPreferred ? 60 : 50;
    centerCrop(baseHeight * maskAspect, baseHeight);
  }, [selectedMask, imageDimensions, selectedType, hasFixedSizes, maskMetrics]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  useEffect(() => {
    if (!hasFixedSizes || !availableSizes?.length) {
      setSelectedSizeIndex(0);
      return;
    }
    setSelectedSizeIndex((idx) => Math.min(Math.max(idx, 0), availableSizes.length - 1));
  }, [hasFixedSizes, availableSizes?.length]);

  const activeSizeIndex = hasFixedSizes && availableSizes?.length ? Math.min(selectedSizeIndex, availableSizes.length - 1) : 0;
  const activeSize = hasFixedSizes && availableSizes?.length ? availableSizes[activeSizeIndex] : null;

  const catalog = useHeadstoneStore((s) => s.catalog);
  const addImage = useHeadstoneStore((s) => s.addImage);
  const setCropCanvasData = useHeadstoneStore((s) => s.setCropCanvasData);

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
        maskMetrics,
        updateCropArea: updateCropAreaCallback,
      });
    } else {
      setCropCanvasData(null);
    }
  }, [showCropSection, uploadedImage, selectedMask, cropColorMode, cropScale, cropRotation, flipX, flipY, cropArea, hasFixedSizes, maskMetrics, setCropCanvasData]);

  // Filter catalog additions to get only image types
  const imageTypes = useMemo(() => {
    if (!catalog?.product?.additions) return [];
    return catalog.product.additions.filter((addition) => addition.type === 'image');
  }, [catalog]);

  const handleImageTypeSelect = (imageType: AdditionData) => {
    setSelectedType(imageType);
    onImageSelect?.(imageType);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      // Load image to get dimensions
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        setUploadedImage(imageUrl);
        setShowCropSection(true);
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleCropImage = async () => {
    if (!selectedType || !uploadedImage || !addImage) return;

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

      // 9. Export as data URL
      const processedImageUrl = finalCanvas.toDataURL('image/png');
      console.log('[handleCropImage] Canvas exported:', {
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
      const maskShapeFilename = maskShapeMap[selectedMask] || 'oval_vertical';

      addImage({
        id: `img-${Date.now()}`,
        typeId: parseInt(selectedType.id),
        typeName: selectedType.name,
        imageUrl: processedImageUrl,
        widthMm: targetWidthMm,
        heightMm: targetHeightMm,
        xPos: 0,
        yPos: 100, // Start higher up on the headstone
        rotationZ: 0,
        sizeVariant: sizeVariantValue ?? 1,
        croppedAspectRatio: canonicalAspectRatio,
        maskShape: maskShapeFilename, // Pass the SVG filename (e.g., 'rectangle_horizontal')
        colorMode: cropColorMode,
      });


      // 12. Reset and close crop UI
      setUploadedImage(null);
      setShowCropSection(false);
      setCropScale(100);
      setCropRotation(0);
      setSelectedMask('oval');
      setCropColorMode('full');
      setFlipX(false);
      setFlipY(false);
      setCropArea({ x: 26, y: 20, width: 48, height: 60 });
      
      // Clear crop canvas
      setCropCanvasData(null);

      
    } catch (error) {
      console.error('[handleCropImage] Error processing image:', error);
      alert('Failed to process image. Please try again.');
    }
  };


  const handleFlipX = () => setFlipX(!flipX);
  const handleFlipY = () => setFlipY(!flipY);
  const handleRotateLeft = () => setCropRotation(cropRotation - 90);
  const handleRotateRight = () => setCropRotation(cropRotation + 90);

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
      let newArea = { ...prev };

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
    setSelectedType(null);
    setUploadedImage(null);
    selectImageForEditing(null); // Deselect any selected image when going back
  };

  // Get selected image data
  const selectedImage = selectedImages.find(img => img.id === selectedImageId);

  // Debug logging
  useEffect(() => {
    console.log('[ImageSelector] State:', { 
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
          <h3 className="text-sm font-semibold text-white">No image types available</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-white/60">This product does not support images.</p>
        </div>
      </div>
    );
  }

  // If an image is selected, show editing controls
  // This works both in fullscreen mode and sidebar mode
  if (selectedImageId && selectedImage) {
    const imageRotationDeg = selectedImage.rotationZ || 0;
    
    // Get size configuration for this image type
    const sizeConfig = IMAGE_SIZE_CONFIGS[selectedImage.typeId.toString()] || { sizes: [] };
    const hasFixedSizes = sizeConfig.sizes.length > 0;
    const currentSizeVariant = selectedImage.sizeVariant || 1;
    const maxSize = hasFixedSizes ? sizeConfig.sizes.length : 4;
    
    return (
      <div className="space-y-5 rounded-2xl border border-[#3A3A3A] bg-[#1F1F1F]/95 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Selected: <span className="font-semibold text-white">{selectedImageId}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedImageId(null);
              setActivePanel(null);
            }}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Clear selection
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            onClick={() => duplicateImage(selectedImageId)}
          >
            Duplicate
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            onClick={() => {
              removeImage(selectedImageId);
              setSelectedImageId(null);
            }}
          >
            Delete
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Size Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-200 w-20">Size</label>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const newSize = Math.max(1, currentSizeVariant - 1);
                    updateImageSizeVariant(selectedImageId, newSize);
                    if (hasFixedSizes) {
                      const dims = sizeConfig.sizes[newSize - 1];
                      const selectedImg = selectedImages.find(img => img.id === selectedImageId);
                      const aspectRatio = selectedImg?.croppedAspectRatio || (dims.width / dims.height);
                      // Scale to fit within the frame dimensions while preserving aspect ratio
                      const scaledHeight = dims.height;
                      const scaledWidth = scaledHeight * aspectRatio;
                      updateImageSize(selectedImageId, scaledWidth, scaledHeight);
                    }
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
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
                        const dims = sizeConfig.sizes[val - 1];
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
                        const dims = sizeConfig.sizes[0];
                        const selectedImg = selectedImages.find(img => img.id === selectedImageId);
                        const aspectRatio = selectedImg?.croppedAspectRatio || (dims.width / dims.height);
                        const scaledHeight = dims.height;
                        const scaledWidth = scaledHeight * aspectRatio;
                        updateImageSize(selectedImageId, scaledWidth, scaledHeight);
                      }
                    } else if (val > maxSize) {
                      updateImageSizeVariant(selectedImageId, maxSize);
                      if (hasFixedSizes) {
                        const dims = sizeConfig.sizes[maxSize - 1];
                        const selectedImg = selectedImages.find(img => img.id === selectedImageId);
                        const aspectRatio = selectedImg?.croppedAspectRatio || (dims.width / dims.height);
                        const scaledHeight = dims.height;
                        const scaledWidth = scaledHeight * aspectRatio;
                        updateImageSize(selectedImageId, scaledWidth, scaledHeight);
                      }
                    }
                  }}
                  className="w-16 rounded border px-2 py-1.5 text-right text-sm text-white bg-[#454545] border-[#5A5A5A] focus:border-[#D7B356] focus:ring-2 focus:ring-[#D7B356]/30 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newSize = Math.min(maxSize, currentSizeVariant + 1);
                    updateImageSizeVariant(selectedImageId, newSize);
                    if (hasFixedSizes) {
                      const dims = sizeConfig.sizes[newSize - 1];
                      const selectedImg = selectedImages.find(img => img.id === selectedImageId);
                      const aspectRatio = selectedImg?.croppedAspectRatio || (dims.width / dims.height);
                      const scaledHeight = dims.height;
                      const scaledWidth = scaledHeight * aspectRatio;
                      updateImageSize(selectedImageId, scaledWidth, scaledHeight);
                    }
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Increase size"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="relative">
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
                    const dims = sizeConfig.sizes[newSize - 1];
                    const selectedImg = selectedImages.find(img => img.id === selectedImageId);
                    const aspectRatio = selectedImg?.croppedAspectRatio || (dims.width / dims.height);
                    const scaledHeight = dims.height;
                    const scaledWidth = scaledHeight * aspectRatio;
                    updateImageSize(selectedImageId, scaledWidth, scaledHeight);
                  }
                }}
                className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
                <span>Size 1</span>
                <span>Size {maxSize}</span>
              </div>
            </div>
          </div>
          
          {/* Rotation Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-200 w-20">Rotation</label>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(-180, imageRotationDeg - 1);
                    updateImageRotation(selectedImageId, newVal);
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
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
                  className="w-16 rounded border px-2 py-1.5 text-right text-sm text-white bg-[#454545] border-[#5A5A5A] focus:border-[#D7B356] focus:ring-2 focus:ring-[#D7B356]/30 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(180, imageRotationDeg + 1);
                    updateImageRotation(selectedImageId, newVal);
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded bg-[#454545] hover:bg-[#5A5A5A] text-white transition-colors"
                  aria-label="Increase rotation by 1 degree"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-300">°</span>
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={imageRotationDeg}
                onChange={(e) => {
                  updateImageRotation(selectedImageId, Number(e.target.value));
                }}
                className="fs-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F] [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(215,179,86,0.6),0_0_0_3px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1F1F1F] [&::-moz-range-thumb]:bg-[#D7B356] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(215,179,86,0.4),0_0_0_3px_rgba(0,0,0,0.3)]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-0.5 w-full">
                <span>-180°</span>
                <span>180°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {!selectedType ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Select image type</h3>
            <span className="text-xs text-white/50">{imageTypes.length} types</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 p-1">
              {imageTypes.map((imageType) => {
                const thumbnail = IMAGE_THUMBNAILS[imageType.id] || '/jpg/photos/m.jpg';
                
                return (
                  <button
                    key={imageType.id}
                    type="button"
                    onClick={() => handleImageTypeSelect(imageType)}
                    className="group flex flex-col overflow-hidden rounded-2xl border-2 border-white/10 bg-[#161616] text-left transition-all hover:-translate-y-1 hover:border-[#D7B356]/60 hover:shadow-lg hover:shadow-[#D7B356]/10 cursor-pointer"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                      <Image
                        src={thumbnail}
                        alt={imageType.name}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 p-3">
                      <span className="flex-1 text-xs font-medium text-white/90 line-clamp-2">
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
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToImageTypes}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to image types
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="space-y-4">
              {/* Selected Type Info */}
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-800 rounded-lg overflow-hidden relative">
                    <Image
                      src={IMAGE_THUMBNAILS[selectedType.id] || '/jpg/photos/m.jpg'}
                      alt={selectedType.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{selectedType.name}</h4>
                    <p className="text-xs text-white/60">Selected image type</p>
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              {!showCropSection && (
                <div className="rounded-2xl border-2 border-dashed border-white/20 bg-[#161616]/50 p-8 text-center">
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
                        className="mx-auto h-12 w-12 text-gray-400"
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
                    <div className="text-white font-medium mb-2">Click to upload</div>
                    <div className="text-sm text-gray-400">PNG, JPG, GIF up to 5MB</div>
                  </label>
                </div>
              )}

              {/* Crop Section - Controls only in sidebar */}
              {showCropSection && uploadedImage && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Crop Section</h4>
                    <button className="text-white/60 hover:text-white">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Step 1: Select Mask */}
                  <div>
                    <div className="text-xs text-white/60 mb-2">Step 1</div>
                    <div className="text-sm text-white font-medium mb-3">SELECT MASK</div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'oval', label: 'Oval', svg: '/shapes/masks/oval_vertical.svg' },
                        { id: 'horizontal-oval', label: 'H. Oval', svg: '/shapes/masks/oval_horizontal.svg' },
                        { id: 'square', label: 'Square', svg: '/shapes/masks/rectangle_vertical.svg' },
                        { id: 'rectangle', label: 'Rect', svg: '/shapes/masks/rectangle_horizontal.svg' },
                        { id: 'heart', label: 'Heart', svg: '/shapes/masks/heart.svg' },
                        { id: 'teardrop', label: 'Tear', svg: '/shapes/masks/teardrop.svg' },
                        { id: 'triangle', label: 'Triangle', svg: '/shapes/masks/triangle.svg' },
                      ].map((mask) => (
                        <button
                          key={mask.id}
                          onClick={() => setSelectedMask(mask.id as MaskShape)}
                          className={`aspect-square rounded-lg border-2 transition-all ${
                            selectedMask === mask.id
                              ? 'border-[#D7B356] bg-[#D7B356]/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40'
                          }`}
                        >
                          <div className="flex items-center justify-center h-full p-2">
                            <Image
                              src={mask.svg}
                              alt={mask.label}
                              width={40}
                              height={40}
                              className="w-full h-full object-contain opacity-80"
                              unoptimized
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Color Mode */}
                  <div>
                    <div className="text-xs text-white/60 mb-2">Step 2</div>
                    <select
                      value={cropColorMode}
                      onChange={(e) => setCropColorMode(e.target.value as 'full' | 'bw' | 'sepia')}
                      className="w-full rounded-lg border border-white/20 bg-[#1F1F1F] px-3 py-2 text-sm text-white"
                    >
                      <option value="full">Full color</option>
                      <option value="bw">Black & White</option>
                      <option value="sepia">Sepia</option>
                    </select>
                  </div>

                  {/* Step 3: Position and Resize */}
                  <div>
                    <div className="text-xs text-white/60 mb-2">Step 3</div>
                    <div className="text-sm text-white font-medium mb-3">Position and Resize Crop Area</div>
                    
                    {/* Size Slider - controls mask height */}
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
                        className="w-full h-1.5 rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F]"
                      />
                      <div className="flex justify-between items-center">
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
                          className="flex flex-col items-center gap-1 text-white/60 hover:text-white text-xs"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                          className="flex flex-col items-center gap-1 text-white/60 hover:text-white text-xs"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Larger
                        </button>
                      </div>
                    </div>

                    {/* Rotation (always available) */}
                    <div className="mt-4 space-y-2">
                      <div className="text-sm text-white/80">SELECT ROTATION: {cropRotation}°</div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={cropRotation}
                        onChange={(e) => setCropRotation(parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F]"
                      />
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => setCropRotation(Math.max(-180, cropRotation - 5))}
                          className="flex flex-col items-center gap-1 text-white/60 hover:text-white text-xs"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                          Decrease
                        </button>
                        <button
                          onClick={() => setCropRotation(Math.min(180, cropRotation + 5))}
                          className="flex flex-col items-center gap-1 text-white/60 hover:text-white text-xs"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Increase
                        </button>
                      </div>
                    </div>

                    {/* Crop Button */}
                    <button
                      onClick={handleCropImage}
                      className="mt-4 w-full rounded-lg bg-[#1F1F1F] border border-white/20 px-4 py-3 text-white font-medium hover:bg-[#2A2A2A] transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Crop Image
                    </button>

                    {/* Action Buttons */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={handleFlipX}
                        className="rounded-lg bg-[#1F1F1F] border border-white/20 px-3 py-2 text-white text-sm hover:bg-[#2A2A2A] transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Flip X
                      </button>
                      <button
                        onClick={handleFlipY}
                        className="rounded-lg bg-[#1F1F1F] border border-white/20 px-3 py-2 text-white text-sm hover:bg-[#2A2A2A] transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        Flip Y
                      </button>
                      <button
                        onClick={handleRotateLeft}
                        className="rounded-lg bg-[#1F1F1F] border border-white/20 px-3 py-2 text-white text-sm hover:bg-[#2A2A2A] transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Rotate ↺
                      </button>
                      <button
                        onClick={handleRotateRight}
                        className="rounded-lg bg-[#1F1F1F] border border-white/20 px-3 py-2 text-white text-sm hover:bg-[#2A2A2A] transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                        </svg>
                        Rotate ↻
                      </button>
                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setShowCropSection(false);
                        }}
                        className="rounded-lg bg-red-900/20 border border-red-500/30 px-3 py-2 text-red-400 text-sm hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
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
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Added Images ({selectedImages.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedImages.map((img) => (
                      <div
                        key={img.id}
                        className="flex items-center gap-3 p-3 rounded-xl border-2 border-white/10 bg-[#161616]"
                      >
                        <div className="w-12 h-12 bg-gray-800 rounded overflow-hidden relative">
                          <Image
                            src={img.imageUrl}
                            alt={img.typeName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium">{img.typeName}</div>
                          <div className="text-xs text-gray-400">
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
