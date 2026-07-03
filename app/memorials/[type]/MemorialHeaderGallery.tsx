'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { MemorialGalleryImage } from '#/lib/memorial-product-pages';

type MemorialHeaderGalleryProps = {
  title: string;
  images: MemorialGalleryImage[];
};

export default function MemorialHeaderGallery({ title, images }: MemorialHeaderGalleryProps) {
  const [activeImage, setActiveImage] = useState<MemorialGalleryImage | null>(null);

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
      <aside className="rounded-lg border border-white/10 bg-white/[0.03] p-3 day:border-gray-200 day:bg-gray-50">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#cfac6c]">
              Gallery
            </p>
            <h2 className="mt-1 text-base font-semibold text-white day:text-gray-900">
              Real {title}
            </h2>
          </div>
          <a
            href="https://www.forevershining.com.au/memorial-gallery/"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[#cfac6c]/60 hover:bg-white/5 day:border-gray-300 day:text-gray-800 day:hover:bg-white"
          >
            View all
          </a>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {images.slice(0, 3).map((image) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveImage(image)}
              className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-[#151515] text-left transition-colors hover:border-[#cfac6c]/70 focus:outline-none focus:ring-2 focus:ring-[#cfac6c] day:border-gray-200 day:bg-white"
              aria-label={`Open ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 1024px) 30vw, 150px"
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
              className="absolute right-3 top-3 z-10 rounded-lg bg-black/70 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-black"
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
