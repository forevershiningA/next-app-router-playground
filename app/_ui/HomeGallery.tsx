'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import categories from '#/app/_internal/home-gallery.json';

export default function HomeGallery({
  standalone = false,
  initialCategory = 'all',
}: {
  standalone?: boolean;
  initialCategory?: string;
}) {
  const Heading = standalone ? 'h1' : 'h2';
  const [category, setCategory] = useState(initialCategory);
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const photos = categories.flatMap((group) =>
    category === 'all' || group.id === category ? group.images : [],
  );
  const selected = selectedIndex === null ? null : photos[selectedIndex];
  const isPhotoOpen = selectedIndex !== null;

  useEffect(() => {
    if (!isPhotoOpen) return;
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isPhotoOpen]);

  function movePhoto(direction: number) {
    setSelectedIndex((index) =>
      index === null
        ? null
        : (index + direction + photos.length) % photos.length,
    );
  }

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="day:border-stone-200 day:bg-[#f3f1ed] scroll-mt-8 border-y border-white/10 bg-[#151412] py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <Heading
            id="gallery-heading"
            className="day:text-stone-900 font-serif text-4xl text-white sm:text-5xl"
          >
            Gallery
          </Heading>
          <p className="day:text-stone-600 mt-5 max-w-2xl text-base leading-7 text-gray-300">
            Explore memorials created by Forever Shining in Australia. Find
            inspiration in the shapes, portraits, inscriptions, and details
            chosen to remember a loved one.
          </p>
        </div>
        <div
          role="group"
          aria-label="Filter gallery by memorial type"
          className="mt-8 flex flex-wrap gap-2"
        >
          {[{ id: 'all', name: 'All memorials' }, ...categories].map(
            (group) => (
              <button
                key={group.id}
                type="button"
                aria-pressed={category === group.id}
                onClick={() => {
                  setCategory(group.id);
                  setVisibleCount(12);
                }}
                className={`min-h-11 rounded-sm border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cfac6c] ${category === group.id ? 'border-[#cfac6c] bg-[#cfac6c] text-[#17120a]' : 'day:border-stone-300 day:text-stone-700 border-white/20 text-white/80 hover:border-[#cfac6c]'}`}
              >
                {group.name}
              </button>
            ),
          )}
        </div>
        <p
          aria-live="polite"
          className="day:text-stone-600 mt-5 text-sm text-white/60"
        >
          {photos.length} photos · Select a photo to enlarge
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {photos.slice(0, visibleCount).map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Enlarge photo: ${photo.alt}`}
              className="group day:border-stone-200 relative aspect-square overflow-hidden rounded-sm border border-white/10 bg-[#eee9df] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cfac6c]"
            >
              <Image
                src={photo.thumbnail}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </button>
          ))}
        </div>
        {visibleCount < photos.length && (
          <div className="mt-9 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 24)}
              className="day:text-[#6f511c] min-h-11 rounded-sm border border-[#cfac6c] px-6 py-3 text-sm font-semibold text-[#e3c887] hover:bg-[#cfac6c] hover:text-[#17120a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cfac6c]"
            >
              Show more photos ({photos.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
      <dialog
        ref={dialogRef}
        aria-label="Memorial photo"
        onClose={() => setSelectedIndex(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedIndex(null);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            movePhoto(-1);
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            movePhoto(1);
          }
        }}
        className="fixed inset-0 m-auto max-h-[95dvh] w-[min(1100px,96vw)] max-w-none overflow-y-auto rounded-sm border border-white/20 bg-[#151412] p-4 text-white backdrop:bg-black/85 sm:p-6"
      >
        {selected && (
          <>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-white/70" aria-live="polite">
                {(selectedIndex ?? 0) + 1} / {photos.length}
              </p>
              <button
                type="button"
                autoFocus
                onClick={() => setSelectedIndex(null)}
                aria-label="Close photo"
                className="flex h-11 w-11 items-center justify-center rounded-sm border border-white/30 hover:bg-white/10"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="relative mt-3 h-[min(65dvh,750px)]">
              <Image
                src={selected.src}
                alt={selected.alt}
                fill
                sizes="(max-width: 1100px) 90vw, 1050px"
                className="object-contain"
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => movePhoto(-1)}
                aria-label="Previous photo"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-white/30 hover:bg-white/10"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <p className="text-center text-sm leading-6" aria-live="polite">
                {selected.alt}
              </p>
              <button
                type="button"
                onClick={() => movePhoto(1)}
                aria-label="Next photo"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-white/30 hover:bg-white/10"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
