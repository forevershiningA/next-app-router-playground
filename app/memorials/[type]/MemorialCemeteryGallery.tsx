'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export type GalleryImage = {
  src: string;
  thumbnail: string;
  alt: string;
  width: number;
  height: number;
};

type MemorialCemeteryGalleryProps = {
  title: string;
  images: GalleryImage[];
};

export default function MemorialCemeteryGallery({
  title,
  images,
}: MemorialCemeteryGalleryProps) {
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    if (!activeImage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveImage(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeImage]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {images.map((img) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActiveImage(img)}
            className="group day:border-[#e4ddd2] day:bg-white relative aspect-square overflow-hidden rounded-sm border border-white/10 bg-[#141311] text-left transition-all hover:border-[#cfac6c]/80 focus-visible:outline-2 focus-visible:outline-[#cfac6c]"
            aria-label={`View enlarged photo: ${img.alt}`}
          >
            <Image
              src={img.thumbnail || img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="absolute right-2 bottom-2 left-2 truncate text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {img.alt}
            </span>
          </button>
        ))}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.alt}
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-sm border border-white/20 bg-[#121110] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              className="absolute top-3 right-3 z-10 rounded-sm bg-black/70 px-3 py-1.5 text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:bg-black"
            >
              Close ✕
            </button>
            <div className="relative aspect-[4/3] max-h-[75vh] w-full min-w-[320px] sm:min-w-[500px] md:min-w-[700px]">
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 90vw, 800px"
                priority
              />
            </div>
            <div className="border-t border-white/10 bg-[#181715] px-5 py-3">
              <p className="text-sm font-medium text-white/90">
                {activeImage.alt}
              </p>
              <p className="text-xs text-white/50">
                Genuine Forever Shining memorial installation
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
