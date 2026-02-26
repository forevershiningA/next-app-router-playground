'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore, type ShapeOption } from '#/lib/headstone-store';

type ShapeSelectorProps = {
  shapes: ShapeOption[];
  disableInternalScroll?: boolean;
};

export default function ShapeSelector({ shapes, disableInternalScroll = false }: ShapeSelectorProps) {
  const router = useRouter();
  const setShapeUrl = useHeadstoneStore((s) => s.setShapeUrl);
  const currentShapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const hasBorder = useHeadstoneStore((s) => s.catalog?.product?.border === '1');

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
