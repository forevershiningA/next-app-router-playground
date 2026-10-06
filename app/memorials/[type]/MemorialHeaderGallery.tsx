'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { MemorialGalleryImage } from '#/lib/memorial-product-pages';

type MemorialHeaderGalleryProps = {
  title: string;
  images: MemorialGalleryImage[];
};

export default function MemorialHeaderGallery({
  title,
  images,
}: MemorialHeaderGalleryProps) {
  const [activeImage, setActiveImage] = useState<MemorialGalleryImage | null>(
    null,
  );

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
      <aside className="rounded-sm border border-[#d8cdb9] bg-white/55 p-3 shadow-[0_20px_50px_rgba(55,42,20,0.10)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-[#8a651f] uppercase">
              Gallery
            </p>
            <h2 className="mt-1 font-serif text-lg text-[#1d1a17]">
              Real {title}
            </h2>
          </div>
          <a
            href="https://www.forevershining.com.au/memorial-gallery/"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 border-b border-[#9a742f] pb-1 text-xs font-semibold text-[#6f511c] transition-colors hover:text-[#1d1a17]"
          >
            View all
          </a>
        </div>

        <div
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:gap-2 sm:overflow-visible sm:pb-0"
          aria-label="Swipe through memorial gallery"
        >
          {images.slice(0, 3).map((image) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveImage(image)}
              className="group relative aspect-[4/3] w-[82%] shrink-0 snap-start overflow-hidden rounded-sm border border-[#d8cdb9] bg-white text-left transition-colors hover:border-[#9a742f] focus:ring-2 focus:ring-[#9a742f] focus:outline-none sm:aspect-square sm:w-auto sm:shrink"
              aria-label={`Open ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover sepia transition-[filter,transform] duration-300 group-hover:scale-[1.02] group-hover:sepia-0"
                sizes="(max-width: 640px) 82vw, (max-width: 1024px) 30vw, 150px"
              />
            </button>
          ))}
        </div>
      </aside>

      {activeImage ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.alt}
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-lg border border-white/15 bg-[#101010]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              className="absolute top-3 right-3 z-10 rounded-lg bg-black/70 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Close
            </button>
            <div className="relative aspect-[4/3] max-h-[82vh]">
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <p className="border-t border-white/10 px-4 py-3 text-sm text-gray-300">
              {activeImage.alt}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
