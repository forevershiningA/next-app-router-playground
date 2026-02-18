'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { AdditionData } from '#/lib/xml-parser';
import Image from 'next/image';

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

type MaskShape = 'oval' | 'horizontal-oval' | 'square' | 'rectangle' | 'heart' | 'teardrop' | 'triangle';
type CropAreaState = { x: number; y: number; width: number; height: number };

export default function ImageSelector({ onImageSelect }: ImageSelectorProps) {
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
  
  // Crop area state (in percentage of preview container)
  const [cropArea, setCropArea] = useState<CropAreaState>({
    x: 30, // left position as %
    y: 20, // top position as %
    width: 40, // width as %
    height: 60, // height as % (portrait aspect)
  });
  
  // Adjust crop area dimensions when mask changes
  useEffect(() => {
    if (!imageDimensions) return;
    
    const isGraniteImage = selectedType?.id === 21 || selectedType?.id === 135;
    const imgWidth = imageDimensions.width;
    const imgHeight = imageDimensions.height;
    const imgType = imgWidth === imgHeight ? 'SQUARE' : (imgWidth > imgHeight ? 'LANDSCAPE' : 'PORTRAIT');
    
    // Determine mask orientation
    const isLandscapeMask = selectedMask === 'horizontal-oval' || selectedMask === 'rectangle';
    
    if (isGraniteImage) {
      // For Granite Image - size varies based on image orientation
      let width = 50; // default %
      let height = 50; // default %
      
      if (imgType === 'PORTRAIT' || imgType === 'SQUARE') {
        const ratio = imgWidth / imgHeight;
        width = 50;
        height = (50 * ratio) * 0.7;
      } else {
        // Landscape image
        width = 50;
        height = 50;
      }
      
      setCropArea(prev => ({
        ...prev,
        x: (100 - width) / 2,
        y: (100 - height) / 2,
        width,
        height,
      }));
    } else {
      // Fixed size for Ceramic, Vitreous, Premium Plana
      // They maintain fixed aspect ratio based on mask orientation
      if (isLandscapeMask) {
        // Landscape masks: wider than tall
        setCropArea(prev => ({
          ...prev,
          x: 15,
          y: 30,
          width: 70,
          height: 40,
        }));
      } else {
        // Portrait masks: taller than wide
        setCropArea(prev => ({
          ...prev,
          x: 30,
          y: 15,
          width: 40,
          height: 70,
        }));
      }
    }
  }, [selectedMask, imageDimensions, selectedType]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Get available sizes for selected image type
  const availableSizes = useMemo(() => {
    if (!selectedType) return [];
    
    // Check if this is Granite Image (ID 21) - free scaling
    if (selectedType.id === '21') {
      return null; // null means free scaling
    }
    
    // For other types (Ceramic 7, Vitreous 2300, Plana 2400), return fixed sizes
    // These would come from XML parsing - for now, hardcode based on ID
    const fixedSizes: Record<string, Array<{width: number, height: number, name: string}>> = {
      '7': [ // Ceramic Photo
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
      '2300': [ // Vitreous Enamel
        { width: 50, height: 70, name: '50 × 70 mm' },
        { width: 60, height: 80, name: '60 × 80 mm' },
        { width: 70, height: 90, name: '70 × 90 mm' },
        { width: 80, height: 100, name: '80 × 100 mm' },
        { width: 90, height: 120, name: '90 × 120 mm' },
        { width: 110, height: 150, name: '110 × 150 mm' },
        { width: 130, height: 180, name: '130 × 180 mm' },
        { width: 180, height: 240, name: '180 × 240 mm' },
      ],
      '2400': [ // Premium Plana
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

  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const hasFixedSizes = availableSizes !== null && availableSizes.length > 0;

  const SIZE_SLIDER_MIN = 20;
  const SIZE_SLIDER_MAX = 80;

  const getSelectedAspectRatio = (area: CropAreaState) => {
    if (hasFixedSizes && availableSizes && availableSizes.length > 0) {
      const clampedIndex = Math.min(selectedSizeIndex, availableSizes.length - 1);
      const size = availableSizes[clampedIndex];
      if (size && size.height) {
        return size.width / size.height;
      }
    }
    const fallbackRatio = area.width / Math.max(0.01, area.height);
    return Number.isFinite(fallbackRatio) && fallbackRatio > 0 ? fallbackRatio : 1;
  };

  const clampPercentage = (value: number, min = 10, max = 100) => Math.min(max, Math.max(min, value));

  const resizeAreaAroundCenter = (area: CropAreaState, targetHeight: number) => {
    const ratio = getSelectedAspectRatio(area);
    let height = clampPercentage(targetHeight);
    let width = height * ratio;

    if (width > 100) {
      width = 100;
      height = width / Math.max(0.01, ratio);
    }
    if (height > 100) {
      height = 100;
      width = height * ratio;
    }
    if (height < 10) {
      height = 10;
      width = height * ratio;
    }

    const centerX = area.x + area.width / 2;
    const centerY = area.y + area.height / 2;

    let x = centerX - width / 2;
    let y = centerY - height / 2;

    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x + width > 100) x = 100 - width;
    if (y + height > 100) y = 100 - height;

    return {
      ...area,
      x,
      y,
      width,
      height,
    };
  };

  const applyHeightChange = (resolver: number | ((area: CropAreaState) => number)) => {
    setCropArea((prev) => {
      const target = typeof resolver === 'function' ? resolver(prev) : resolver;
      return resizeAreaAroundCenter(prev, target);
    });
  };

  const catalog = useHeadstoneStore((s) => s.catalog);
  const selectedImages = useHeadstoneStore((s) => s.selectedImages || []);
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
        updateCropArea: updateCropAreaCallback,
      });
    } else {
      setCropCanvasData(null);
    }
  }, [showCropSection, uploadedImage, selectedMask, cropColorMode, cropScale, cropRotation, flipX, flipY, cropArea, hasFixedSizes, setCropCanvasData]);

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

  const handleCropImage = () => {
    if (!selectedType || !uploadedImage || !addImage) return;

    addImage({
      id: `img-${Date.now()}`,
      typeId: parseInt(selectedType.id),
      typeName: selectedType.name,
      imageUrl: uploadedImage,
      widthMm: 100,
      heightMm: 150,
      xPos: 0,
      yPos: 0,
      rotationZ: 0,
    });

    // Reset crop state
    setUploadedImage(null);
    setShowCropSection(false);
    setCropScale(100);
    setCropRotation(0);
    setSelectedMask('oval');
    setCropColorMode('full');
    setFlipX(false);
    setFlipY(false);
    setCropArea({ x: 30, y: 20, width: 40, height: 60 });
  };

  const handleFlipX = () => setFlipX(!flipX);
  const handleFlipY = () => setFlipY(!flipY);
  const handleRotateLeft = () => setCropRotation(cropRotation - 90);
  const handleRotateRight = () => setCropRotation(cropRotation + 90);
  const handleDuplicate = () => {
    if (!selectedType || !uploadedImage || !addImage) return;
    addImage({
      id: `img-${Date.now()}`,
      typeId: parseInt(selectedType.id),
      typeName: selectedType.name,
      imageUrl: uploadedImage,
      widthMm: 100,
      heightMm: 150,
      xPos: 20,
      yPos: 20,
      rotationZ: 0,
    });
  };

  const handleMouseDown = (e: React.MouseEvent, handle: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    
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
  };

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
                        min={SIZE_SLIDER_MIN}
                        max={SIZE_SLIDER_MAX}
                        value={Math.max(SIZE_SLIDER_MIN, Math.min(SIZE_SLIDER_MAX, Math.round(cropArea.height)))}
                        onChange={(e) => {
                          const newHeight = parseInt(e.target.value, 10);
                          applyHeightChange(Number.isNaN(newHeight) ? cropArea.height : newHeight);
                        }}
                        className="w-full h-1.5 rounded-full bg-gradient-to-r from-[#D7B356] to-[#E4C778] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D7B356] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1F1F1F]"
                      />
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => {
                            applyHeightChange((area) => Math.max(SIZE_SLIDER_MIN, area.height - 5));
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
                            applyHeightChange((area) => Math.min(SIZE_SLIDER_MAX, area.height + 5));
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
                        onClick={handleDuplicate}
                        className="rounded-lg bg-[#1F1F1F] border border-white/20 px-3 py-2 text-white text-sm hover:bg-[#2A2A2A] transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Duplicate
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
