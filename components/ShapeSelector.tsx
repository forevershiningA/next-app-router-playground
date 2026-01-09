'use client';

import React from 'react';
import Image from 'next/image';
import { useHeadstoneStore } from '#/lib/headstone-store';

type Shape = {
  id: string;
  name: string;
  image: string;
  category: string;
};

type ShapeSelectorProps = {
  shapes: Shape[];
  disableInternalScroll?: boolean;
};

export default function ShapeSelector({ shapes, disableInternalScroll = false }: ShapeSelectorProps) {
  const setShapeUrl = useHeadstoneStore((s) => s.setShapeUrl);
  const currentShapeUrl = useHeadstoneStore((s) => s.shapeUrl);

  const handleShapeSelect = (shape: Shape) => {
    const shapeUrl = `/shapes/headstones/${shape.image}`;
    setShapeUrl(shapeUrl);
  };

  return (
    <div className="space-y-3">
      <div
        className={`grid grid-cols-3 gap-2 pr-2 ${disableInternalScroll ? '' : 'overflow-y-auto custom-scrollbar'}`}
      >
        {shapes.map((shape) => {
          const shapeUrl = `/shapes/headstones/${shape.image}`;
          const isSelected = currentShapeUrl === shapeUrl;
          
          return (
            <button
              key={shape.id}
              onClick={() => handleShapeSelect(shape)}
              className="group relative cursor-pointer"
              title={shape.name}
            >
              {/* Shape Image */}
              <div className={`relative aspect-square transition-all ${
                isSelected ? 'border-2 border-[#D7B356]' : 'border-2 border-transparent group-hover:border-[#D7B356]'
              }`}>
                <Image
                  src={shapeUrl}
                  alt={shape.name}
                  fill
                  className="object-contain"
                  sizes="100px"
                />
              </div>
              
              {/* Shape Name */}
              <div className="p-2 h-12 flex items-center justify-center">
                <div className="text-xs text-slate-200 text-center line-clamp-2">
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
