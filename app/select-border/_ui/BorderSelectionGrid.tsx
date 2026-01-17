'use client';

import { useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import Image from 'next/image';

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

export default function BorderSelectionGrid() {
  const router = useRouter();
  const setBorderName = useHeadstoneStore((s) => s.setBorderName);
  const currentBorderName = useHeadstoneStore((s) => s.borderName);

  const handleBorderSelect = (border: typeof borders[0]) => {
    setBorderName(border.id === 'no-border' ? null : border.name);
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
              onClick={() => handleBorderSelect(border)}
              className={`
                relative aspect-square rounded-lg overflow-hidden
                transition-all duration-200
                ${isSelected 
                  ? 'ring-4 ring-[#CD7F32] shadow-[0_0_20px_rgba(205,127,50,0.6)] scale-105' 
                  : 'ring-1 ring-gray-600 hover:ring-[#CD7F32] hover:scale-102'
                }
                bg-gray-800 hover:bg-gray-700
              `}
            >
              {border.image ? (
                <div className="w-full h-full p-4 flex items-center justify-center">
                  <Image
                    src={`/shapes/borders/${border.image}`}
                    alt={border.name}
                    width={200}
                    height={200}
                    className="object-contain"
                    style={{ filter: 'invert(64%) sepia(32%) saturate(627%) hue-rotate(346deg) brightness(92%) contrast(88%)' }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-lg">None</span>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
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
