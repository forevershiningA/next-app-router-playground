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
};

export default function ShapeSelector({ shapes }: ShapeSelectorProps) {
  const setShapeUrl = useHeadstoneStore((s) => s.setShapeUrl);
  const currentShapeUrl = useHeadstoneStore((s) => s.shapeUrl);

  const handleShapeSelect = (shape: Shape) => {
    const shapeUrl = `/shapes/headstones/${shape.image}`;
    setShapeUrl(shapeUrl);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {shapes.map((shape) => {
          const shapeUrl = `/shapes/headstones/${shape.image}`;
          const isSelected = currentShapeUrl === shapeUrl;
          
          return (
            <button
              key={shape.id}
              onClick={() => handleShapeSelect(shape)}
              className="relative overflow-hidden cursor-pointer"
              title={shape.name}
            >
              {/* Shape Image */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={shapeUrl}
                  alt={shape.name}
                  fill
                  className={`object-contain ${
                    isSelected ? 'border-2 border-[#D7B356]' : ''
                  }`}
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
