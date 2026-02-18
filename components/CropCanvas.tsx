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

  const maskViewBoxOverrides: Record<string, string> = {
    oval: '50 0 400 500',
    'horizontal-oval': '0 50 500 400',
    square: '50 0 400 500',
    rectangle: '0 50 500 400',
  };


  const handleMouseDown = (e: React.MouseEvent, handle: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    e.stopPropagation();
    
    // For fixed sizes, only allow moving, not resizing
    if (hasFixedSizes && handle !== 'move') {
      return;
    }
    
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
        // Resize from corners
        if (handle === 'nw') {
          const newWidth = initialCropArea.width - deltaX;
          const newHeight = initialCropArea.height - deltaY;
          if (newWidth > 10 && newHeight > 10) {
            newCropArea.x = initialCropArea.x + deltaX;
            newCropArea.y = initialCropArea.y + deltaY;
            newCropArea.width = newWidth;
            newCropArea.height = newHeight;
          }
        } else if (handle === 'ne') {
          const newWidth = initialCropArea.width + deltaX;
          const newHeight = initialCropArea.height - deltaY;
          if (newWidth > 10 && newHeight > 10) {
            newCropArea.y = initialCropArea.y + deltaY;
            newCropArea.width = newWidth;
            newCropArea.height = newHeight;
          }
        } else if (handle === 'sw') {
          const newWidth = initialCropArea.width - deltaX;
          const newHeight = initialCropArea.height + deltaY;
          if (newWidth > 10 && newHeight > 10) {
            newCropArea.x = initialCropArea.x + deltaX;
            newCropArea.width = newWidth;
            newCropArea.height = newHeight;
          }
        } else if (handle === 'se') {
          const newWidth = initialCropArea.width + deltaX;
          const newHeight = initialCropArea.height + deltaY;
          if (newWidth > 10 && newHeight > 10) {
            newCropArea.width = newWidth;
            newCropArea.height = newHeight;
          }
        }

        // Ensure crop area stays within bounds
        newCropArea.x = Math.max(0, Math.min(100 - newCropArea.width, newCropArea.x));
        newCropArea.y = Math.max(0, Math.min(100 - newCropArea.height, newCropArea.y));
        newCropArea.width = Math.min(100 - newCropArea.x, newCropArea.width);
        newCropArea.height = Math.min(100 - newCropArea.y, newCropArea.height);
      }

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
                viewBox={maskViewBoxOverrides[selectedMask] ?? '0 0 500 500'}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <mask id={`crop-mask-${selectedMask}`}>
                    <rect width="500" height="500" fill="black" />
                    <image
                      href={getMaskUrl(selectedMask) || ''}
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
            className="absolute"
            style={{
              left: `${cropArea.x}%`,
              top: `${cropArea.y}%`,
              width: `${cropArea.width}%`,
              height: `${cropArea.height}%`,
            }}
          >
            {/* Bounding box rectangle with connecting lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <rect 
                x="0" 
                y="0" 
                width="100%" 
                height="100%" 
                fill="none" 
                stroke="#D7B356" 
                strokeWidth="2"
              />
            </svg>
            
            {/* Draggable area for moving (covers the whole mask) */}
            <div
              className="absolute inset-0 cursor-move"
              style={{ pointerEvents: 'auto' }}
              onMouseDown={(e) => handleMouseDown(e, 'move')}
            />
            
            {/* Corner Handles - positioned at bounding box corners */}
            {/* Top-left handle */}
            <div
              className="absolute w-4 h-4 bg-[#D7B356] border-2 border-white rounded-full cursor-nw-resize"
              style={{ 
                top: '0%', 
                left: '0%', 
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'nw');
              }}
            />
            {/* Top-right handle */}
            <div
              className="absolute w-4 h-4 bg-[#D7B356] border-2 border-white rounded-full cursor-ne-resize"
              style={{ 
                top: '0%', 
                left: '100%', 
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'ne');
              }}
            />
            {/* Bottom-right handle */}
            <div
              className="absolute w-4 h-4 bg-[#D7B356] border-2 border-white rounded-full cursor-se-resize"
              style={{ 
                top: '100%', 
                left: '100%', 
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'se');
              }}
            />
            {/* Bottom-left handle */}
            <div
              className="absolute w-4 h-4 bg-[#D7B356] border-2 border-white rounded-full cursor-sw-resize"
              style={{ 
                top: '100%', 
                left: '0%', 
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'sw');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
