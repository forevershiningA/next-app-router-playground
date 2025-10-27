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

  // Check if this addition type is selected (check base ID in any instance)
  const isSelected = selectedAdditions.some(id => {
    // Extract base ID from instance ID (remove timestamp suffix)
    const parts = id.split('_');
    const baseId = parts.length > 1 && !isNaN(Number(parts[parts.length - 1])) 
      ? parts.slice(0, -1).join('_')
      : id;
    return baseId === addition.id;
  });

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
        // Always add a new instance of this addition
        addAddition(addition.id);
      }}
    >
      <div className={`relative overflow-hidden p-4 ${
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
      </div>
    </div>
  );
}
