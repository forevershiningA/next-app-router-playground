'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useHeadstoneStore } from '#/lib/headstone-store';

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

  // Get mask shape bounds within the 500x500 SVG coordinate system
  const getMaskShapeBounds = (mask: string) => {
    // Fast-path map for common masks (avoids DOM operations)
    // These values are approximate bounds within a 500x500 viewBox
    const boundsMap: Record<string, {left: number, top: number, width: number, height: number}> = {
      'oval': { left: 50, top: 0, width: 400, height: 500 },           // Oval vertical path: x:50-450, y:0-500
      'horizontal-oval': { left: 0, top: 50, width: 500, height: 400 }, // Horizontal oval: x:0-500, y:50-450
      'square': { left: 50, top: 0, width: 400, height: 500 },          // Square: x:50-450, y:0-500
      'rectangle': { left: 0, top: 50, width: 500, height: 400 },       // Rectangle: x:0-500, y:50-450
      'heart': { left: 0, top: 0, width: 500, height: 470 },            // Heart: approximately full width, ~470 height
      'teardrop': { left: 80, top: 0, width: 340, height: 480 },        // Teardrop: offset and narrower
      'triangle': { left: 30, top: 60, width: 440, height: 380 },       // Triangle: centered triangle shape
    };
    
    return boundsMap[mask] || { left: 0, top: 0, width: 500, height: 500 };
  };

  // Calculate effective bounds based on mask's actual shape within 500x500 viewBox
  // All masks now fill their containers - no offset needed
  const getMaskEffectiveBounds = (mask: string) => {
    // Return no offset - golden rectangle should match crop area exactly
    return { xOffset: 0, yOffset: 0, widthScale: 1, heightScale: 1 };
  };

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

        // Calculate deltas based on handle direction
        // Multiply by 2 because we're scaling from center (both sides change)
        const deltaWidth = handle.includes('w') ? -deltaX * 2 : deltaX * 2;
        const deltaHeight = handle.includes('n') ? -deltaY * 2 : deltaY * 2;

        // Calculate new dimensions based on which direction has larger change
        const widthCandidate = initialCropArea.width + deltaWidth;
        const heightCandidate = initialCropArea.height + deltaHeight;

        // Use the dimension with larger change to maintain aspect ratio
        const widthChange = Math.abs(widthCandidate - initialCropArea.width);
        const heightChange = Math.abs(heightCandidate - initialCropArea.height);
        const useWidth = widthChange >= heightChange;

        let nextWidth = useWidth ? widthCandidate : heightCandidate * aspectRatio;
        let nextHeight = useWidth ? nextWidth / aspectRatio : heightCandidate;

        // Ensure we're using aspect ratio correctly
        if (!useWidth) {
          nextWidth = nextHeight * aspectRatio;
        }

        // Apply minimum size constraint
        nextWidth = Math.max(minSize, nextWidth);
        nextHeight = Math.max(minSize, nextHeight);

        // Calculate new position centered around the original center point
        let nextX = centerX - nextWidth / 2;
        let nextY = centerY - nextHeight / 2;

        // Clamp to bounds while maintaining center and aspect ratio
        const clampHorizontal = () => {
          if (nextX < 0) {
            nextX = 0;
            nextWidth = centerX * 2; // Max width that keeps center
            nextHeight = Math.max(minSize, nextWidth / aspectRatio);
            nextY = centerY - nextHeight / 2;
          } else if (nextX + nextWidth > 100) {
            nextWidth = (100 - centerX) * 2; // Max width that keeps center
            nextX = centerX - nextWidth / 2;
            nextHeight = Math.max(minSize, nextWidth / aspectRatio);
            nextY = centerY - nextHeight / 2;
          }
        };

        const clampVertical = () => {
          if (nextY < 0) {
            nextY = 0;
            nextHeight = centerY * 2; // Max height that keeps center
            nextWidth = Math.max(minSize, nextHeight * aspectRatio);
            nextX = centerX - nextWidth / 2;
          } else if (nextY + nextHeight > 100) {
            nextHeight = (100 - centerY) * 2; // Max height that keeps center
            nextY = centerY - nextHeight / 2;
            nextWidth = Math.max(minSize, nextHeight * aspectRatio);
            nextX = centerX - nextWidth / 2;
          }
        };

        // Apply clamping
        clampHorizontal();
        clampVertical();

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
                viewBox="0 0 500 500"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <mask id={`crop-mask-${selectedMask}`}>
                    <rect width="500" height="500" fill="black" />
                    <image
                      href={getMaskUrl(selectedMask) || ''}
                      x="0"
                      y="0"
                      width="500"
                      height="500"
                      preserveAspectRatio="xMidYMid meet"
                      style={{ filter: 'invert(1)' }}
                    />
                  </mask>
                </defs>
                <rect
                  width="500"
                  height="500"
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
              const shapeBounds = getMaskShapeBounds(selectedMask);
              
              // The SVG viewBox="0 0 500 500" gets scaled to fit the crop area
              // We need to use the SAME transform for both the rectangle and handlers
              // Simply use SVG coordinates directly - SVG will handle the transform
              
              return (
                <>
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet" style={{ pointerEvents: 'none', overflow: 'visible' }}>
                    <rect 
                      x={shapeBounds.left}
                      y={shapeBounds.top}
                      width={shapeBounds.width}
                      height={shapeBounds.height}
                      fill="none" 
                      stroke="#D7B356" 
                      strokeWidth="2"
                      style={{ pointerEvents: 'none' }}
                    />
                    {/* Handlers as SVG circles in the same coordinate system */}
                    <circle
                      cx={shapeBounds.left}
                      cy={shapeBounds.top}
                      r="8"
                      fill="#D7B356"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="cursor-nw-resize"
                      style={{ pointerEvents: 'auto' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e as any, 'nw');
                      }}
                    />
                    <circle
                      cx={shapeBounds.left + shapeBounds.width}
                      cy={shapeBounds.top}
                      r="8"
                      fill="#D7B356"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="cursor-ne-resize"
                      style={{ pointerEvents: 'auto' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e as any, 'ne');
                      }}
                    />
                    <circle
                      cx={shapeBounds.left + shapeBounds.width}
                      cy={shapeBounds.top + shapeBounds.height}
                      r="8"
                      fill="#D7B356"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="cursor-se-resize"
                      style={{ pointerEvents: 'auto' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e as any, 'se');
                      }}
                    />
                    <circle
                      cx={shapeBounds.left}
                      cy={shapeBounds.top + shapeBounds.height}
                      r="8"
                      fill="#D7B356"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="cursor-sw-resize"
                      style={{ pointerEvents: 'auto' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e as any, 'sw');
                      }}
                    />
                  </svg>
                  
                  {/* Draggable area for moving (covers the whole mask area) */}
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
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
