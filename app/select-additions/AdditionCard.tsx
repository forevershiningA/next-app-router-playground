'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { Addition } from '#/app/_internal/_data';

type AdditionCardProps = {
  addition: Addition;
};

export default function AdditionCard({ addition }: AdditionCardProps) {
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const addAddition = useHeadstoneStore((s) => s.addAddition);
  const removeAddition = useHeadstoneStore((s) => s.removeAddition);
  const [imgError, setImgError] = useState(false);

  const isSelected = selectedAdditions.includes(addition.id);

  // Extract directory from file path if available, otherwise from ID
  let dirNum: string;
  if (addition.file) {
    // Extract directory from file path (e.g., "2497/Art2497.glb" -> "2497")
    dirNum = addition.file.split('/')[0];
  } else {
    // Fallback: Extract directory number from ID and remove leading zeros
    // e.g., K0383 -> 383, B1134S -> 1134
    const dirMatch = addition.id.match(/\d+/);
    dirNum = dirMatch ? parseInt(dirMatch[0], 10).toString() : addition.id;
  }

  // Use thumbnail instead of original image
  let imagePath = '/placeholder.png';
  if (addition.image && addition.image !== 'placeholder.png') {
    if (imgError) {
      // If thumbnail failed, try original image
      imagePath = `/additions/${dirNum}/${addition.image}`;
    } else {
      // Try thumbnail first
      const ext = addition.image.lastIndexOf('.') > 0 
        ? addition.image.substring(0, addition.image.lastIndexOf('.'))
        : addition.image;
      const thumbnailName = `${ext}_thumb.jpg`;
      imagePath = `/additions/${dirNum}/${thumbnailName}`;
    }
  }

  // Create alt text with ID and name
  const altText = `${addition.id} (${addition.name})`;

  return (
    <div
      className="group flex cursor-pointer flex-col gap-2.5"
      onClick={() => {
        if (isSelected) {
          removeAddition(addition.id);
        } else {
          // Clear previous additions and add the new one
          selectedAdditions.forEach((id) => removeAddition(id));
          addAddition(addition.id);
        }
      }}
    >
      <div className={`relative overflow-hidden ${
        isSelected 
          ? 'bg-gray-800' 
          : 'bg-gray-900/50 group-hover:bg-gray-900'
      }`}>
        <Image
          className="pointer"
          src={imagePath}
          alt={altText}
          quality={90}
          width={400}
          height={400}
          unoptimized={imgError}
          onError={() => {
            if (!imgError) {
              setImgError(true);
            }
          }}
        />
        {isSelected && (
          <div className="absolute top-2 right-2 rounded bg-green-500 px-2 py-1 text-xs text-white shadow-lg">
            ✓
          </div>
        )}
      </div>
    </div>
  );
}
