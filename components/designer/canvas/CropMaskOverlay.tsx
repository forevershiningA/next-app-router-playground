'use client';

import React, { useEffect, useState } from 'react';

interface CropMaskOverlayProps {
  imageBox: { left: number; top: number; width: number; height: number } | null;
  cropArea: { x: number; y: number; width: number; height: number };
  selectedMask: string;
  getMaskUrl: (mask: string) => string | undefined;
  onHandlePointerDown: (handle: 'nw' | 'ne' | 'sw' | 'se', clientX: number, clientY: number) => void;
  onRectPointerDown: (clientX: number, clientY: number) => void;
  strokeWidth?: number;
  maskViewBoxOverrides?: Record<string, string>;
}

export default function CropMaskOverlay({
  imageBox,
  cropArea,
  selectedMask,
  getMaskUrl,
  onHandlePointerDown,
  onRectPointerDown,
  strokeWidth = 4,
  maskViewBoxOverrides = {},
}: CropMaskOverlayProps) {
  const [maskNaturalSize, setMaskNaturalSize] = useState<{ w: number; h: number } | null>(null);

  // Preload mask image to get natural dimensions
  useEffect(() => {
    const url = getMaskUrl(selectedMask);
    if (!url) {
      setMaskNaturalSize(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      setMaskNaturalSize({
        w: img.naturalWidth || img.width,
        h: img.naturalHeight || img.height,
      });
    };
    img.onerror = () => setMaskNaturalSize(null);
    img.src = url;
  }, [selectedMask, getMaskUrl]);

  // Calculate effective bounds based on mask viewBox
  const getMaskEffectiveBounds = (mask: string) => {
    const viewBox = maskViewBoxOverrides[mask];
    if (!viewBox) {
      return { xOffset: 0, yOffset: 0, widthScale: 1, heightScale: 1 };
    }
    
    const [x, y, width, height] = viewBox.split(' ').map(Number);
    const totalWidth = 500;
    const totalHeight = 500;
    
    return {
      xOffset: x / totalWidth,
      yOffset: y / totalHeight,
      widthScale: width / totalWidth,
      heightScale: height / totalHeight,
    };
  };

  // Calculate transform to fit mask into viewBox preserving aspect
  const maskTransformForBox = (natural: { w: number; h: number } | null, box = 500) => {
    if (!natural) return { sx: 1, sy: 1, tx: 0, ty: 0 };
    const aw = natural.w;
    const ah = natural.h;
    const scale = Math.min(box / aw, box / ah);
    const newW = aw * scale;
    const newH = ah * scale;
    const tx = (box - newW) / 2;
    const ty = (box - newH) / 2;
    return { sx: scale, sy: scale, tx, ty };
  };

  if (!imageBox) return null;

  const BOX = 500;
  const { sx, sy, tx, ty } = maskTransformForBox(maskNaturalSize, BOX);
  const bounds = getMaskEffectiveBounds(selectedMask);

  return (
    <>
      {/* Single SVG overlay covering the entire imageBox */}
      <svg
        key={`overlay-${selectedMask}`}
        style={{
          position: 'absolute',
          left: imageBox.left,
          top: imageBox.top,
          width: imageBox.width,
          height: imageBox.height,
          pointerEvents: 'none',
        }}
        viewBox={`0 0 ${BOX} ${BOX}`}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Mask definition */}
        <defs>
          <mask
            id={`crop-mask-${selectedMask}`}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            style={{ maskType: 'alpha' }}
          >
            <image
              href={getMaskUrl(selectedMask) || ''}
              x={tx}
              y={ty}
              width={maskNaturalSize ? maskNaturalSize.w * sx : BOX}
              height={maskNaturalSize ? maskNaturalSize.h * sy : BOX}
              preserveAspectRatio="xMidYMid meet"
            />
          </mask>
        </defs>

        {/* Green masked area - convert cropArea % to BOX coords */}
        <rect
          x={(cropArea.x / 100) * BOX}
          y={(cropArea.y / 100) * BOX}
          width={(cropArea.width / 100) * BOX}
          height={(cropArea.height / 100) * BOX}
          fill="rgba(0, 255, 0, 0.5)"
          mask={`url(#crop-mask-${selectedMask})`}
        />

        {/* Gold selection rectangle - respects mask bounds */}
        <rect
          x={((cropArea.x / 100) + bounds.xOffset * (cropArea.width / 100)) * BOX}
          y={((cropArea.y / 100) + bounds.yOffset * (cropArea.height / 100)) * BOX}
          width={(cropArea.width / 100) * bounds.widthScale * BOX}
          height={(cropArea.height / 100) * bounds.heightScale * BOX}
          fill="none"
          stroke="#D7B356"
          strokeWidth={strokeWidth}
          rx={2}
        />
      </svg>

      {/* Crop Area Handles Container - positioned with pixels for interaction */}
      <div
        className="absolute"
        style={{
          left: imageBox.left + (imageBox.width * (cropArea.x / 100)),
          top: imageBox.top + (imageBox.height * (cropArea.y / 100)),
          width: imageBox.width * (cropArea.width / 100),
          height: imageBox.height * (cropArea.height / 100),
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => onRectPointerDown(e.clientX, e.clientY)}
      >
        {/* Corner Handles - positioned at mask bounds corners */}
        {(() => {
          return (
            <>
              {/* Top-left handle */}
              <div
                className="absolute w-4 h-4 bg-[#D7B356] border-2 border-white rounded-full cursor-nw-resize"
                style={{
                  top: `${bounds.yOffset * 100}%`,
                  left: `${bounds.xOffset * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onHandlePointerDown('nw', e.clientX, e.clientY);
                }}
              />
              {/* Top-right handle */}
              <div
                className="absolute w-4 h-4 bg-[#D7B356] border-2 border-white rounded-full cursor-ne-resize"
                style={{
                  top: `${bounds.yOffset * 100}%`,
                  left: `${(bounds.xOffset + bounds.widthScale) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onHandlePointerDown('ne', e.clientX, e.clientY);
                }}
              />
              {/* Bottom-right handle */}
              <div
                className="absolute w-4 h-4 bg-[#D7B356] border-2 border-white rounded-full cursor-se-resize"
                style={{
                  top: `${(bounds.yOffset + bounds.heightScale) * 100}%`,
                  left: `${(bounds.xOffset + bounds.widthScale) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onHandlePointerDown('se', e.clientX, e.clientY);
                }}
              />
              {/* Bottom-left handle */}
              <div
                className="absolute w-4 h-4 bg-[#D7B356] border-2 border-white rounded-full cursor-sw-resize"
                style={{
                  top: `${(bounds.yOffset + bounds.heightScale) * 100}%`,
                  left: `${bounds.xOffset * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onHandlePointerDown('sw', e.clientX, e.clientY);
                }}
              />
            </>
          );
        })()}
      </div>
    </>
  );
}
