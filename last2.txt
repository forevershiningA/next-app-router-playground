'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useHeadstoneStore } from '#/lib/headstone-store';

type MaskShape = 'oval' | 'horizontal-oval' | 'square' | 'rectangle' | 'heart' | 'teardrop' | 'triangle';

export default function CropCanvas() {
  const cropCanvasData = useHeadstoneStore((s) => s.cropCanvasData);
  const [dragState, setDragState] = useState({
    isDragging: false,
    handle: null as 'move' | 'nw' | 'ne' | 'sw' | 'se' | null,
    startX: 0,
    startY: 0,
    initialCropArea: { x: 0, y: 0, width: 0, height: 0 },
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);

  if (!cropCanvasData) {
    return null;
  }

  const {
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
    updateCropArea,
  } = cropCanvasData;

  // Map mask names to SVG files
  const getMaskUrl = (mask: string) => {
    const maskMap: Record<string, string> = {
      'oval': '/shapes/masks/oval_vertical.svg',
      'horizontal-oval': '/shapes/masks/oval_horizontal.svg',
      'square': '/shapes/masks/rectangle_vertical.svg',
      'rectangle': '/shapes/masks/rectangle_horizontal.svg',
      'heart': '/shapes/masks/heart.svg',
      'teardrop': '/shapes/masks/teardrop.svg',
      'triangle': '/shapes/masks/triangle.svg',
    };
    return maskMap[mask];
  };

  const FALLBACK_BOUNDS: Record<MaskShape, { left: number; top: number; width: number; height: number; viewWidth: number; viewHeight: number }> = {
    oval: { left: 50, top: 0, width: 400, height: 500, viewWidth: 500, viewHeight: 500 },
    'horizontal-oval': { left: 0, top: 50, width: 500, height: 400, viewWidth: 500, viewHeight: 500 },
    square: { left: 50, top: 0, width: 400, height: 500, viewWidth: 500, viewHeight: 500 },
    rectangle: { left: 0, top: 50, width: 500, height: 400, viewWidth: 500, viewHeight: 500 },
    heart: { left: 0, top: 0, width: 500, height: 470, viewWidth: 640, viewHeight: 600 },
    teardrop: { left: 80, top: 0, width: 340, height: 480, viewWidth: 400, viewHeight: 400 },
    triangle: { left: 30, top: 60, width: 340, height: 280, viewWidth: 400, viewHeight: 400 },
  };

  const fallback = FALLBACK_BOUNDS[selectedMask as MaskShape];
  const maskBoundsPx = maskMetrics?.bounds ?? fallback;
  const naturalWidth = maskMetrics?.naturalWidth ?? fallback.viewWidth;
  const naturalHeight = maskMetrics?.naturalHeight ?? fallback.viewHeight;

  const normalizedMaskBounds = maskMetrics?.normalizedBounds ?? {
    left: maskBoundsPx.left / naturalWidth,
    top: maskBoundsPx.top / naturalHeight,
    width: maskBoundsPx.width / naturalWidth,
    height: maskBoundsPx.height / naturalHeight,
  };

  const maskViewBox = `0 0 ${naturalWidth} ${naturalHeight}`;
  const maskRectWidth = naturalWidth;
  const maskRectHeight = naturalHeight;
  const maskImageWidth = naturalWidth;
  const maskImageHeight = naturalHeight;

  const handleMouseDown = (e: React.MouseEvent, handle: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState({
      isDragging: true,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialCropArea: { ...cropArea },
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !previewRef.current) return;

      const rect = previewRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragState.startX) / rect.width) * 100;
      const deltaY = ((e.clientY - dragState.startY) / rect.height) * 100;

      const { initialCropArea, handle } = dragState;

      let newCropArea = { ...initialCropArea };

      if (handle === 'move') {
        // Move the entire crop area
        newCropArea.x = Math.max(0, Math.min(100 - initialCropArea.width, initialCropArea.x + deltaX));
        newCropArea.y = Math.max(0, Math.min(100 - initialCropArea.height, initialCropArea.y + deltaY));
      } else {
        // Resize from corners while maintaining aspect ratio and centering
        if (!handle) return;
        
        const aspectRatio = initialCropArea.width / initialCropArea.height;
        const minSize = 10;

        // Calculate center point (stays fixed during resize)
        const centerX = initialCropArea.x + initialCropArea.width / 2;
        const centerY = initialCropArea.y + initialCropArea.height / 2;

        // Use diagonal distance for uniform scaling
        const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Determine sign based on handle direction
        let sign = 1;
        if (handle === 'nw') {
          sign = (deltaX < 0 || deltaY < 0) ? 1 : -1;
        } else if (handle === 'ne') {
          sign = (deltaX > 0 || deltaY < 0) ? 1 : -1;
        } else if (handle === 'sw') {
          sign = (deltaX < 0 || deltaY > 0) ? 1 : -1;
        } else if (handle === 'se') {
          sign = (deltaX > 0 || deltaY > 0) ? 1 : -1;
        }
        
        const dragDelta = sign * dragDistance;
        
        // Calculate scale based on the diagonal
        const baseDimension = Math.sqrt(initialCropArea.width * initialCropArea.width + initialCropArea.height * initialCropArea.height);
        const scale = Math.max(minSize / baseDimension, 1 + (dragDelta / baseDimension));

        // Scale dimensions uniformly
        let nextWidth = initialCropArea.width * scale;
        let nextHeight = initialCropArea.height * scale;

        // Apply minimum size constraint
        nextWidth = Math.max(minSize, nextWidth);
        nextHeight = Math.max(minSize, nextHeight);

        // Ensure aspect ratio is maintained after min size constraint
        if (nextWidth < minSize) {
          nextWidth = minSize;
          nextHeight = nextWidth / aspectRatio;
        }
        if (nextHeight < minSize) {
          nextHeight = minSize;
          nextWidth = nextHeight * aspectRatio;
        }

        // Calculate new position centered around the original center point
        let nextX = centerX - nextWidth / 2;
        let nextY = centerY - nextHeight / 2;

        // Clamp to bounds while maintaining center and aspect ratio
        if (nextX < 0) {
          nextX = 0;
          nextWidth = Math.min(centerX * 2, 100);
          nextHeight = nextWidth / aspectRatio;
          nextY = centerY - nextHeight / 2;
        } else if (nextX + nextWidth > 100) {
          nextWidth = Math.min((100 - centerX) * 2, 100);
          nextX = centerX - nextWidth / 2;
          nextHeight = nextWidth / aspectRatio;
          nextY = centerY - nextHeight / 2;
        }

        if (nextY < 0) {
          nextY = 0;
          nextHeight = Math.min(centerY * 2, 100);
          nextWidth = nextHeight * aspectRatio;
          nextX = centerX - nextWidth / 2;
        } else if (nextY + nextHeight > 100) {
          nextHeight = Math.min((100 - centerY) * 2, 100);
          nextY = centerY - nextHeight / 2;
          nextWidth = nextHeight * aspectRatio;
          nextX = centerX - nextWidth / 2;
        }

        // Update crop area if sizes are valid
        if (nextWidth >= minSize && nextHeight >= minSize) {
          newCropArea = {
            x: nextX,
            y: nextY,
            width: nextWidth,
            height: nextHeight,
          };
        }
      }

      // Ensure crop area stays within bounds (moved outside the else block)
      newCropArea.x = Math.max(0, Math.min(100 - newCropArea.width, newCropArea.x));
      newCropArea.y = Math.max(0, Math.min(100 - newCropArea.height, newCropArea.y));
      newCropArea.width = Math.min(100 - newCropArea.x, newCropArea.width);
      newCropArea.height = Math.min(100 - newCropArea.y, newCropArea.height);

      updateCropArea(newCropArea);
    };

    const handleMouseUp = () => {
      setDragState({ 
        isDragging: false, 
        handle: null, 
        startX: 0, 
        startY: 0,
        initialCropArea: { x: 0, y: 0, width: 0, height: 0 },
      });
    };

    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, hasFixedSizes, updateCropArea]);

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-full h-full max-w-6xl max-h-[90vh] p-8">
        {/* Interactive Crop Preview */}
        <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden" ref={previewRef}>
          {/* Uploaded Image */}
          <Image
            src={uploadedImage}
            alt="Preview"
            fill
            className={`object-contain ${
              cropColorMode === 'bw' ? 'grayscale' : 
              cropColorMode === 'sepia' ? 'sepia' : ''
            }`}
            style={{
              transform: `scale(${cropScale / 100}) rotate(${cropRotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
            }}
            unoptimized
          />
          
          {/* Green Semi-Transparent Mask Overlay */}
          <div 
            className="absolute pointer-events-none"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {/* Black overlay covering everything except the mask shape */}
            {/* Don't show black overlay - just the green mask and border */}

            {/* Green overlay showing the mask shape */}
            <div
              className="absolute"
              style={{
                left: `${cropArea.x}%`,
                top: `${cropArea.y}%`,
                width: `${cropArea.width}%`,
                height: `${cropArea.height}%`,
                pointerEvents: 'none',
              }}
            >
              <svg
                className="w-full h-full"
                viewBox={maskViewBox}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <mask id={`crop-mask-${selectedMask}`}>
                    <rect width={maskRectWidth} height={maskRectHeight} fill="black" />
                    <image
                      href={getMaskUrl(selectedMask) || ''}
                      x="0"
                      y="0"
                      width={maskImageWidth}
                      height={maskImageHeight}
                      preserveAspectRatio="none"
                      style={{ filter: 'invert(1)' }}
                    />
                  </mask>
                </defs>
                <rect
                  width={maskRectWidth}
                  height={maskRectHeight}
                  fill="rgba(0, 255, 0, 0.5)"
                  mask={`url(#crop-mask-${selectedMask})`}
                />
              </svg>
            </div>
          </div>

          {/* Crop Area Rectangle with Handles */}
          <div
            ref={cropAreaRef}
            className="absolute"
            style={{
              left: `${cropArea.x}%`,
              top: `${cropArea.y}%`,
              width: `${cropArea.width}%`,
              height: `${cropArea.height}%`,
            }}
          >
            {/* Bounding box rectangle with connecting lines - aligned to mask bounds */}
            {(() => {
              const boundingStyle = {
                left: `${normalizedMaskBounds.left * 100}%`,
                top: `${normalizedMaskBounds.top * 100}%`,
                width: `${normalizedMaskBounds.width * 100}%`,
                height: `${normalizedMaskBounds.height * 100}%`,
              };

              const handleConfigs: Array<{ corner: 'nw' | 'ne' | 'se' | 'sw'; cursor: string; left: number; top: number }> = [
                { corner: 'nw', cursor: 'nwse-resize', left: normalizedMaskBounds.left * 100, top: normalizedMaskBounds.top * 100 },
                { corner: 'ne', cursor: 'nesw-resize', left: (normalizedMaskBounds.left + normalizedMaskBounds.width) * 100, top: normalizedMaskBounds.top * 100 },
                { corner: 'se', cursor: 'nwse-resize', left: (normalizedMaskBounds.left + normalizedMaskBounds.width) * 100, top: (normalizedMaskBounds.top + normalizedMaskBounds.height) * 100 },
                { corner: 'sw', cursor: 'nesw-resize', left: normalizedMaskBounds.left * 100, top: (normalizedMaskBounds.top + normalizedMaskBounds.height) * 100 },
              ];
              
              return (
                <>
                  <div className="absolute inset-0 pointer-events-none">
                    <div
                      className="absolute border-2 border-[#D7B356] rounded"
                      style={boundingStyle}
                    />
                  </div>

                  <div
                    className="absolute cursor-move"
                    style={{ 
                      left: '0',
                      top: '0',
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'auto',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'move')}
                  />

                  {handleConfigs.map(({ corner, cursor, left, top }) => (
                    <button
                      key={corner}
                      type="button"
                      className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#D7B356] shadow"
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        cursor,
                        pointerEvents: 'auto',
                      }}
                      onMouseDown={(e) => handleMouseDown(e, corner)}
                    />
                  ))}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
