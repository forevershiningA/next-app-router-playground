'use client';

import React from 'react';
import Image from 'next/image';
import { useHeadstoneStore } from '#/lib/headstone-store';

const borders = [
  { id: 'border1', name: 'Border 1', image: 'border1.svg' },
  { id: 'border2', name: 'Border 2', image: 'border2.svg' },
  { id: 'border3', name: 'Border 3', image: 'border3.svg' },
  { id: 'border4', name: 'Border 4', image: 'border4.svg' },
  { id: 'border5', name: 'Border 5', image: 'border5.svg' },
  { id: 'border6', name: 'Border 6', image: 'border6.svg' },
  { id: 'border7', name: 'Border 7', image: 'border7.svg' },
  { id: 'border8', name: 'Border 8', image: 'border8.svg' },
  { id: 'border9', name: 'Border 9', image: 'border9.svg' },
  { id: 'border10', name: 'Border 10', image: 'border10.svg' },
  { id: 'no-border', name: 'No Border', image: null },
];

const BRONZE_HEX = '#CD7F32';

type BorderSelectorProps = {
  disableInternalScroll?: boolean;
};

export default function BorderSelector({ disableInternalScroll = false }: BorderSelectorProps) {
  const setBorderName = useHeadstoneStore((s) => s.setBorderName);
  const currentBorderName = useHeadstoneStore((s) => s.borderName);

  const handleBorderSelect = (border: typeof borders[0]) => {
    setBorderName(border.id === 'no-border' ? null : border.name);
  };

  return (
    <div className="space-y-3">
      <div className={`grid grid-cols-3 gap-2 pl-1 pr-2 py-1 ${disableInternalScroll ? '' : 'overflow-y-auto custom-scrollbar'}`}>
        {borders.map((border) => {
          const isSelected = currentBorderName === border.name || 
                           (border.id === 'no-border' && !currentBorderName);
          const baseCardClasses = isSelected
            ? 'ring-2 ring-offset-2 ring-offset-[#0f0a07] ring-[#CD7F32]'
            : 'border border-white/10';
          
          return (
            <button
              key={border.id}
              type="button"
              onClick={() => handleBorderSelect(border)}
              className={`relative overflow-hidden rounded-xl bg-[#0f0a07] transition-all duration-150 hover:bg-[#1a110b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CD7F32] ${baseCardClasses} cursor-pointer`}
              title={border.name}
            >
              {/* Border Preview */}
              <div className="relative aspect-square rounded-t-xl bg-gradient-to-b from-black/40 via-black/10 to-black/40">
                {border.image ? (
                  <>
                    <div
                      className="absolute inset-4"
                      style={{
                        backgroundColor: BRONZE_HEX,
                        WebkitMaskImage: `url(/shapes/borders/${border.image})`,
                        maskImage: `url(/shapes/borders/${border.image})`,
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskSize: '85% 85%',
                        maskSize: '85% 85%',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                      }}
                    />
                    <div
                      className="absolute inset-4 opacity-20"
                      style={{
                        backgroundColor: '#fff',
                        WebkitMaskImage: `url(/shapes/borders/${border.image})`,
                        maskImage: `url(/shapes/borders/${border.image})`,
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskSize: '85% 85%',
                        maskSize: '85% 85%',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                      }}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-200/60">
                    None
                  </div>
                )}
              </div>

              {/* Border Name */}
              <div className="p-2 h-12 flex items-center justify-center bg-[#0f0a07]/80 rounded-b-xl">
                <div className={`text-xs text-center line-clamp-2 ${
                  isSelected ? 'text-[#CD7F32] font-semibold' : 'text-slate-200'
                }`}>
                  {border.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
