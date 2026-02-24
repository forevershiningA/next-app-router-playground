'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

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
    allowFreeformHandles = false,
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

  useEffect(() => {
    const updateSize = () => {
      if (!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      setPreviewSize({ width: rect.width || 0, height: rect.height || 0 });
    };

    updateSize();

    if (!previewRef.current) return;
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => updateSize()) : null;
    observer?.observe(previewRef.current);
    window.addEventListener('resize', updateSize);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

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
  const maskBounds = maskMetrics?.bounds ?? fallback;
  const maskViewWidth = maskMetrics?.naturalWidth ?? fallback.viewWidth;
  const maskViewHeight = maskMetrics?.naturalHeight ?? fallback.viewHeight;

  const maskViewBox = `0 0 ${maskViewWidth} ${maskViewHeight}`;
  const maskRectWidth = maskViewWidth;
  const maskRectHeight = maskViewHeight;
  const maskImageWidth = maskViewWidth;
  const maskImageHeight = maskViewHeight;
  const preserveAspect = 'xMidYMid meet';

  const cropPx = useMemo(() => {
    if (!previewSize.width || !previewSize.height) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    return {
      x: (cropArea.x / 100) * previewSize.width,
      y: (cropArea.y / 100) * previewSize.height,
      width: (cropArea.width / 100) * previewSize.width,
      height: (cropArea.height / 100) * previewSize.height,
    };
  }, [cropArea, previewSize.height, previewSize.width]);

  const maskFit = useMemo(() => {
    const sw = maskBounds.width;
    const sh = maskBounds.height;
    const sl = maskBounds.left;
    const st = maskBounds.top;
    const vw = maskViewWidth || 1;
    const vh = maskViewHeight || 1;

    const boxW = cropPx.width || 1;
    const boxH = cropPx.height || 1;

    const shapeAspect = sw / sh;
    const boxAspect = boxW / boxH;

    let scale: number;
    if (boxAspect > shapeAspect) {
      scale = boxH / sh;
    } else {
      scale = boxW / sw;
    }

    const drawnW = vw * scale;
    const drawnH = vh * scale;

    const offsetX = (boxW - sw * scale) / 2;
    const offsetY = (boxH - sh * scale) / 2;

    const drawX = cropPx.x + offsetX - sl * scale;
    const drawY = cropPx.y + offsetY - st * scale;

    return {
      drawX,
      drawY,
      drawnW,
      drawnH,
      scale,
      mw: vw,      mh: vh,
      maskBoundsLeftPx: cropPx.x + offsetX,
      maskBoundsTopPx: cropPx.y + offsetY,
      maskBoundsWidthPx: sw * scale,
      maskBoundsHeightPx: sh * scale,
    };
  }, [cropPx.height, cropPx.width, cropPx.x, cropPx.y, maskBounds, maskViewHeight, maskViewWidth]);

  const maskHandlesBox = useMemo(() => {
    if (allowFreeformHandles || cropPx.width === 0 || cropPx.height === 0) {
      return { left: 0, top: 0, width: 100, height: 100 };
    }

    const left = ((maskFit.maskBoundsLeftPx - cropPx.x) / cropPx.width) * 100;
    const top = ((maskFit.maskBoundsTopPx - cropPx.y) / cropPx.height) * 100;
    const width = (maskFit.maskBoundsWidthPx / cropPx.width) * 100;
    const height = (maskFit.maskBoundsHeightPx / cropPx.height) * 100;

    return { left, top, width, height };
  }, [allowFreeformHandles, cropPx.height, cropPx.width, cropPx.x, cropPx.y, maskFit]);

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
        if (!handle) return;

        const minSize = 10;

        if (allowFreeformHandles) {
          let nextX = initialCropArea.x;
          let nextY = initialCropArea.y;
          let nextWidth = initialCropArea.width;
          let nextHeight = initialCropArea.height;

          if (handle.includes('w')) {
            const proposedX = initialCropArea.x + deltaX;
            const maxX = initialCropArea.x + initialCropArea.width - minSize;
            const clampedX = Math.max(0, Math.min(proposedX, maxX));
            const widthDelta = initialCropArea.x - clampedX;
            nextX = clampedX;
            nextWidth = initialCropArea.width + widthDelta;
          }

          if (handle.includes('e')) {
            const proposedWidth = initialCropArea.width + deltaX;
            nextWidth = Math.max(minSize, Math.min(100 - nextX, proposedWidth));
          }

          if (handle.includes('n')) {
            const proposedY = initialCropArea.y + deltaY;
            const maxY = initialCropArea.y + initialCropArea.height - minSize;
            const clampedY = Math.max(0, Math.min(proposedY, maxY));
            const heightDelta = initialCropArea.y - clampedY;
            nextY = clampedY;
            nextHeight = initialCropArea.height + heightDelta;
          }

          if (handle.includes('s')) {
            const proposedHeight = initialCropArea.height + deltaY;
            nextHeight = Math.max(minSize, Math.min(100 - nextY, proposedHeight));
          }

          newCropArea = {
            x: nextX,
            y: nextY,
            width: Math.max(minSize, nextWidth),
            height: Math.max(minSize, nextHeight),
          };
        } else {
          // Resize from corners while enforcing mask aspect ratio and keeping the center fixed
          const maskAspect = maskBounds.width / maskBounds.height;
          const aspectRatio = maskAspect;

          const centerX = initialCropArea.x + initialCropArea.width / 2;
          const centerY = initialCropArea.y + initialCropArea.height / 2;

          let projection = 0;
          if (handle === 'nw') projection = -deltaX - deltaY;
          else if (handle === 'ne') projection = deltaX - deltaY;
          else if (handle === 'sw') projection = -deltaX + deltaY;
          else if (handle === 'se') projection = deltaX + deltaY;

          const dragDelta = projection / Math.SQRT2;
          const baseDimension = Math.max(
            0.0001,
            Math.sqrt(initialCropArea.width * initialCropArea.width + initialCropArea.height * initialCropArea.height)
          );
          const scale = Math.max(minSize / baseDimension, 1 + dragDelta / baseDimension);

          let nextWidth = initialCropArea.width * scale;
          let nextHeight = nextWidth / aspectRatio;

          if (nextWidth < minSize || nextHeight < minSize) {
            if (aspectRatio > 1) {
              nextHeight = minSize;
              nextWidth = nextHeight * aspectRatio;
            } else {
              nextWidth = minSize;
              nextHeight = nextWidth / aspectRatio;
            }
          }

          const maxW = Math.min(centerX, 100 - centerX) * 2;
          const maxH = Math.min(centerY, 100 - centerY) * 2;

          let finalMaxW = maxW;
          let finalMaxH = finalMaxW / aspectRatio;

          if (finalMaxH > maxH) {
            finalMaxH = maxH;
            finalMaxW = finalMaxH * aspectRatio;
          }

          if (nextWidth > finalMaxW) {
            nextWidth = finalMaxW;
            nextHeight = finalMaxH;
          }

          newCropArea = {
            x: centerX - nextWidth / 2,
            y: centerY - nextHeight / 2,
            width: nextWidth,
            height: nextHeight,
          };
        }
      }

      // Ensure crop area stays within bounds (without mutating width/height)
      newCropArea.x = Math.max(0, Math.min(100 - newCropArea.width, newCropArea.x));
      newCropArea.y = Math.max(0, Math.min(100 - newCropArea.height, newCropArea.y));

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
  }, [dragState, hasFixedSizes, allowFreeformHandles, maskBounds, updateCropArea]);

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
          {previewSize.width > 0 && previewSize.height > 0 && cropPx.width > 0 && cropPx.height > 0 && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width="100%"
              height="100%"
              viewBox={`0 0 ${Math.max(previewSize.width, 1)} ${Math.max(previewSize.height, 1)}`}
              preserveAspectRatio="none"
            >
              <defs>
                <mask id={`crop-mask-${selectedMask || 'default'}`}>
                  <rect width={maskRectWidth} height={maskRectHeight} fill="black" />
                  <image
                    href={getMaskUrl(selectedMask || '') || ''}
                    x="0"
                    y="0"
                    width={maskImageWidth}
                    height={maskImageHeight}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ filter: 'invert(1)' }}
                  />
                </mask>
              </defs>

              <g transform={`translate(${maskFit.drawX}, ${maskFit.drawY}) scale(${maskFit.scale})`}>
                <rect
                  width={maskRectWidth}
                  height={maskRectHeight}
                  fill="rgba(0, 255, 0, 0.45)"
                  mask={`url(#crop-mask-${selectedMask || 'default'})`}
                />
              </g>

            </svg>
          )}

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
              const boundingStyle = allowFreeformHandles
                ? { left: '0%', top: '0%', width: '100%', height: '100%' }
                : {
                    left: `${maskHandlesBox.left}%`,
                    top: `${maskHandlesBox.top}%`,
                    width: `${maskHandlesBox.width}%`,
                    height: `${maskHandlesBox.height}%`,
                  };

              const handleConfigs: Array<{ corner: 'nw' | 'ne' | 'se' | 'sw'; cursor: string; left: number; top: number }> = allowFreeformHandles
                ? [
                    { corner: 'nw', cursor: 'nwse-resize', left: 0, top: 0 },
                    { corner: 'ne', cursor: 'nesw-resize', left: 100, top: 0 },
                    { corner: 'se', cursor: 'nwse-resize', left: 100, top: 100 },
                    { corner: 'sw', cursor: 'nesw-resize', left: 0, top: 100 },
                  ]
                : [
                    { corner: 'nw', cursor: 'nwse-resize', left: maskHandlesBox.left, top: maskHandlesBox.top },
                    { corner: 'ne', cursor: 'nesw-resize', left: maskHandlesBox.left + maskHandlesBox.width, top: maskHandlesBox.top },
                    { corner: 'se', cursor: 'nwse-resize', left: maskHandlesBox.left + maskHandlesBox.width, top: maskHandlesBox.top + maskHandlesBox.height },
                    { corner: 'sw', cursor: 'nesw-resize', left: maskHandlesBox.left, top: maskHandlesBox.top + maskHandlesBox.height },
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
