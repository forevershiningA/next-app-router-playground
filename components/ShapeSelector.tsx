'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore, type ShapeOption } from '#/lib/headstone-store';
import { isContourSupported } from '#/components/three/InsetContourLine';

type ShapeSelectorProps = {
  shapes: ShapeOption[];
  disableInternalScroll?: boolean;
};

export default function ShapeSelector({ shapes, disableInternalScroll = false }: ShapeSelectorProps) {
  const router = useRouter();
  const setShapeUrl = useHeadstoneStore((s) => s.setShapeUrl);
  const currentShapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const hasBorder = useHeadstoneStore((s) => s.catalog?.product?.border === '1');
  const isPlaque = useHeadstoneStore((s) => s.catalog?.product?.type === 'plaque');
  const showInsetContour = useHeadstoneStore((s) => s.showInsetContour);
  const setShowInsetContour = useHeadstoneStore((s) => s.setShowInsetContour);

  const getShapeUrl = (shape: ShapeOption) => {
    if (shape.image) {
      return shape.image.startsWith('/')
        ? shape.image
        : `/shapes/headstones/${shape.image}`;
    }
    return shape.previewUrl ?? null;
  };

  const handleShapeSelect = (shape: ShapeOption) => {
    const shapeUrl = getShapeUrl(shape);
    if (!shapeUrl) {
      return;
    }
    setShapeUrl(shapeUrl);
    if (hasBorder) {
      router.push('/select-border');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('openFullscreenPanel', {
            detail: { panel: 'select-border' },
          }),
        );
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Inset contour border toggle — headstones with supported shapes only */}
      {!isPlaque && isContourSupported(currentShapeUrl) && (
        <div className="rounded-xl border border-white/10 bg-[#0f0a07] p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-200">
                Inset Contour Border
              </div>
              <div className="text-xs text-slate-200/60">
                White line following the shape, 15mm from edges
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInsetContour(!showInsetContour)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                showInsetContour ? 'bg-white' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full transition-transform duration-200 ${
                  showInsetContour
                    ? 'translate-x-6 bg-[#0f0a07]'
                    : 'translate-x-1 bg-slate-400'
                }`}
              />
            </button>
          </div>
        </div>
      )}
      <div
        className={`grid grid-cols-3 gap-2 pr-2 ${disableInternalScroll ? '' : 'overflow-y-auto custom-scrollbar'}`}
      >
        {shapes.map((shape) => {
          const shapeUrl = getShapeUrl(shape);
          const isSelected = shapeUrl ? currentShapeUrl === shapeUrl : false;
          const coverSrc = shapeUrl ?? '/shapes/headstones/square.svg';

          return (
            <button
              key={shape.id}
              onClick={() => handleShapeSelect(shape)}
              className="group relative cursor-pointer disabled:cursor-not-allowed"
              title={shape.name}
              disabled={!shapeUrl}
            >
              {/* Shape Image */}
              <div className={`relative aspect-square transition-all ${
                isSelected ? 'border-2 border-[#D7B356]' : 'border-2 border-transparent group-hover:border-[#D7B356]'
              }`}>
                <Image
                  src={coverSrc}
                  alt={shape.name}
                  fill
                  className="object-contain"
                  sizes="100px"
                />
              </div>
              
              {/* Shape Name */}
              <div className="p-2 h-12 flex items-center justify-center">
                <div className={`text-xs text-center line-clamp-2 ${isSelected ? 'text-[#D7B356]' : 'text-slate-200'}`}>
                  {shape.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
