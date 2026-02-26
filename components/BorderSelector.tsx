'use client';

import React from 'react';
import { useHeadstoneStore, type BorderOption } from '#/lib/headstone-store';

const FALLBACK_BORDERS: BorderOption[] = [
  { id: 'border1', name: 'Border 1', image: 'border1.svg', category: 'bronze' },
  { id: 'border2', name: 'Border 2', image: 'border2.svg', category: 'bronze' },
  { id: 'border3', name: 'Border 3', image: 'border3.svg', category: 'bronze' },
  { id: 'border4', name: 'Border 4', image: 'border4.svg', category: 'bronze' },
  { id: 'border5', name: 'Border 5', image: 'border5.svg', category: 'bronze' },
  { id: 'border6', name: 'Border 6', image: 'border6.svg', category: 'bronze' },
  { id: 'border7', name: 'Border 7', image: 'border7.svg', category: 'bronze' },
  { id: 'border8', name: 'Border 8', image: 'border8.svg', category: 'bronze' },
  { id: 'border9', name: 'Border 9', image: 'border9.svg', category: 'bronze' },
  { id: 'border10', name: 'Border 10', image: 'border10.svg', category: 'bronze' },
];

const NO_BORDER_OPTION: BorderOption = { id: 'no-border', name: 'No Border', category: 'none' };

const BRONZE_HEX = '#CD7F32';

type BorderSelectorProps = {
  borders: BorderOption[];
  disableInternalScroll?: boolean;
};

export default function BorderSelector({ borders, disableInternalScroll = false }: BorderSelectorProps) {
  const setBorderName = useHeadstoneStore((s) => s.setBorderName);
  const currentBorderName = useHeadstoneStore((s) => s.borderName);

  const borderOptions = React.useMemo(() => {
    const base = borders && borders.length > 0 ? borders : FALLBACK_BORDERS;
    return base.some((border) => border.id === 'no-border')
      ? base
      : [...base, NO_BORDER_OPTION];
  }, [borders]);

  const handleBorderSelect = (border: BorderOption) => {
    setBorderName(border.id === 'no-border' ? null : border.name);
  };

  const getBorderAsset = (border: BorderOption) => {
    if (border.svgUrl) {
      return border.svgUrl.startsWith('/')
        ? border.svgUrl
        : `/shapes/borders/${border.svgUrl}`;
    }
    if (border.image) {
      return border.image.startsWith('/')
        ? border.image
        : `/shapes/borders/${border.image}`;
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <div className={`grid grid-cols-3 gap-2 pl-1 pr-2 py-1 ${disableInternalScroll ? '' : 'overflow-y-auto custom-scrollbar'}`}>
        {borderOptions.map((border) => {
          const isSelected = currentBorderName === border.name || 
                           (border.id === 'no-border' && !currentBorderName);
          const baseCardClasses = isSelected
            ? 'ring-2 ring-offset-2 ring-offset-[#0f0a07] ring-[#CD7F32]'
            : 'border border-white/10';
          const svgPath = getBorderAsset(border);
          
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
                {svgPath ? (
                  <>
                    <div
                      className="absolute inset-4"
                      style={{
                        backgroundColor: BRONZE_HEX,
                        WebkitMaskImage: `url(${svgPath})`,
                        maskImage: `url(${svgPath})`,
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
                        WebkitMaskImage: `url(${svgPath})`,
                        maskImage: `url(${svgPath})`,
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
