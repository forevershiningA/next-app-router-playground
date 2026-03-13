'use client';

import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import Image from 'next/image';

const borders = [
  { id: 'border1', name: 'Border 1', image: 'border1a.svg' },
  { id: 'border2', name: 'Border 2', image: 'border2a.svg' },
  { id: 'border3', name: 'Border 3', image: 'border3a.svg' },
  { id: 'border4', name: 'Border 4', image: 'border4a.svg' },
  { id: 'border5', name: 'Border 5', image: 'border5a.svg' },
  { id: 'border6', name: 'Border 6', image: 'border6a.svg' },
  { id: 'border7', name: 'Border 7', image: 'border7a.svg' },
  { id: 'border8', name: 'Border 8', image: 'border8a.svg' },
  { id: 'border9', name: 'Border 9', image: 'border9a.svg' },
  { id: 'border10', name: 'Border 10', image: 'border10a.svg' },
  { id: 'no-border', name: 'No Border', image: null },
];

export default function BorderSelectionGrid() {
  const router = useRouter();
  const setBorderName = useHeadstoneStore((s) => s.setBorderName);
  const currentBorderName = useHeadstoneStore((s) => s.borderName);

  const handleBorderSelect = (border: typeof borders[0]) => {
    const nameToSet = border.id === 'no-border' ? null : border.name;
    console.log('Border selected:', { id: border.id, name: border.name, setting: nameToSet });
    setBorderName(nameToSet);
    // Stay on the same page when selecting from sidebar
    // router.push('/');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#CD7F32]">Select Border Style</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {borders.map((border) => {
          const isSelected = currentBorderName === border.name || 
                           (border.id === 'no-border' && !currentBorderName);
          
          return (
            <button
              key={border.id}
              type="button"
              onClick={() => handleBorderSelect(border)}
              className={`
                relative aspect-square rounded-lg
                transition-all duration-200 cursor-pointer
                ${isSelected 
                  ? 'ring-4 ring-[#CD7F32] shadow-[0_0_20px_rgba(205,127,50,0.6)] scale-105' 
                  : 'ring-1 ring-gray-600 hover:ring-[#CD7F32] hover:scale-102'
                }
                bg-gray-800 hover:bg-gray-700
              `}
            >
              {border.image ? (
                <div className="relative flex h-full w-full items-center justify-center rounded-lg">
                  <div
                    className="absolute inset-4"
                    style={{
                      backgroundColor: '#CD7F32',
                      WebkitMaskImage: `url(/shapes/borders/${border.image})`,
                      maskImage: `url(/shapes/borders/${border.image})`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskSize: '82% 82%',
                      maskSize: '82% 82%',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                    }}
                  />
                  <div
                    className="absolute inset-4 opacity-20"
                    style={{
                      backgroundColor: '#ffffff',
                      WebkitMaskImage: `url(/shapes/borders/${border.image})`,
                      maskImage: `url(/shapes/borders/${border.image})`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskSize: '82% 82%',
                      maskSize: '82% 82%',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 rounded-lg">
                  <span className="text-lg">None</span>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pointer-events-none">
                <p className={`text-sm font-medium text-center ${isSelected ? 'text-[#CD7F32]' : 'text-white'}`}>
                  {border.name}
                </p>
              </div>
              
              {isSelected && (
                <div className="absolute top-2 right-2 bg-[#CD7F32] rounded-full p-1">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
