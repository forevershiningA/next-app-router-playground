'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  SparklesIcon,
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

  const availableCategories = [
    {
      id: 'all',
      name: 'All memorials',
      count: categories
        .filter((group) => !['pinnaroo', 'images'].includes(group.id))
        .flatMap((group) => group.images).length,
    },
    ...categories
      .filter((group) => !['pinnaroo', 'images'].includes(group.id))
      .map((group) => ({
        id: group.id,
        name: group.name,
        count: group.images.length,
      })),
  ];

  const photos = categories
    .filter((group) => !['pinnaroo', 'images'].includes(group.id))
    .flatMap((group) =>
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
      className={
        standalone
          ? 'day:bg-[#f8f6f0] day:text-[#1d1a17] min-h-screen bg-[#0d0c0b] text-white transition-colors'
          : 'day:border-stone-200 day:bg-[#f3f1ed] scroll-mt-8 border-y border-white/10 bg-[#151412] py-20'
      }
    >
      <div
        className={
          standalone
            ? 'day:border-[#e2dad0] day:bg-none day:bg-[#f1ede3] relative border-b border-white/10 bg-gradient-to-b from-[#171614] to-[#0f0e0c]'
            : ''
        }
      >
        <div
          className={
            standalone
              ? 'mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14'
              : 'mx-auto max-w-7xl px-6 lg:px-8'
          }
        >
          {standalone && (
            <nav
              className="day:text-[#756c62] mb-6 flex items-center gap-2 text-sm text-[#8c8275]"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="day:hover:text-[#1d1a17] transition-colors hover:text-[#cfac6c]"
              >
                Home
              </Link>
              <span className="day:text-[#a89d8d] mx-2 text-[#635c52]" aria-hidden="true">
                /
              </span>
              <Link
                href="/memorials"
                className="day:hover:text-[#1d1a17] transition-colors hover:text-[#cfac6c]"
              >
                Memorials
              </Link>
              <span className="day:text-[#a89d8d] mx-2 text-[#635c52]" aria-hidden="true">
                /
              </span>
              <span className="day:text-[#1d1a17] font-medium text-[#e4dbcd]">
                Gallery
              </span>
            </nav>
          )}

          <div className={standalone ? 'max-w-4xl' : 'max-w-3xl'}>
            {standalone && (
              <span className="day:border-[#d0c2ad] day:bg-[#e8e0d1] day:text-[#74551d] mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#cfac6c]/40 bg-[#cfac6c]/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#e6cb8b] uppercase">
                <SparklesIcon className="size-3.5" />
                Handcrafted Precision · Cemetery Installations
              </span>
            )}

            <Heading
              id="gallery-heading"
              className={
                standalone
                  ? 'day:text-[#1d1a17] m-0 max-w-3xl p-0 font-serif text-3xl leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl'
                  : 'day:text-stone-900 font-serif text-4xl text-white sm:text-5xl'
              }
            >
              {standalone
                ? 'Completed Memorial Installations & Cemetery Gallery'
                : 'Gallery'}
            </Heading>
            <p
              className={
                standalone
                  ? 'day:text-[#5c544a] mt-4 max-w-3xl text-base leading-relaxed text-[#c3bbb0] sm:text-lg sm:leading-8'
                  : 'day:text-stone-600 mt-5 max-w-2xl text-base leading-7 text-gray-300'
              }
            >
              {standalone
                ? 'Real photography of handcrafted granite headstones, bronze plaques, monuments, and pet tributes installed across Australia, North America, and worldwide. Select any photo to inspect craftsmanship, fonts, and permanent finishes.'
                : 'Find inspiration in the shapes, portraits, inscriptions, and details chosen to remember a loved one.'}
            </p>
          </div>

          <div
            role="group"
            aria-label="Filter gallery by memorial type"
            className="mt-8 flex flex-wrap gap-2"
          >
            {availableCategories.map((group) => (
              <button
                key={group.id}
                type="button"
                aria-pressed={category === group.id}
                onClick={() => {
                  setCategory(group.id);
                  setVisibleCount(12);
                }}
                className={`min-h-11 rounded-sm border px-4 py-2 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cfac6c] ${
                  category === group.id
                    ? 'day:border-[#cfac6c] day:bg-[#cfac6c] day:text-[#17120a] border-[#cfac6c] bg-[#cfac6c] font-semibold text-[#17120a] shadow-sm'
                    : standalone
                      ? 'day:border-[#dcd5c9] day:bg-white/80 day:text-[#5c544a] day:hover:border-[#cfac6c] day:hover:text-[#1d1a17] border-white/15 bg-white/5 text-white/70 hover:border-[#cfac6c] hover:text-white'
                      : 'day:border-stone-300 day:text-stone-700 border-white/20 text-white/80 hover:border-[#cfac6c]'
                }`}
              >
                <span>{group.name}</span>
                {standalone && (
                  <span className="ml-1.5 text-xs opacity-60">
                    ({group.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div
        className={
          standalone
            ? 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12'
            : 'mx-auto max-w-7xl px-6 lg:px-8'
        }
      >
        <p
          aria-live="polite"
          className={
            standalone
              ? 'day:text-[#756c62] text-sm text-[#a89d8d]'
              : 'day:text-stone-600 mt-5 text-sm text-white/60'
          }
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
              className="group day:border-[#e4ddd2] day:bg-white relative aspect-square overflow-hidden rounded-sm border border-white/10 bg-[#141311] text-left transition-all hover:border-[#cfac6c]/80 focus-visible:outline-2 focus-visible:outline-[#cfac6c]"
            >
              <Image
                src={photo.thumbnail || photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute right-2 bottom-2 left-2 truncate text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {photo.alt}
              </span>
            </button>
          ))}
        </div>
        {visibleCount < photos.length && (
          <div className="mt-9 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 24)}
              className={`min-h-11 rounded-sm border border-[#cfac6c] px-6 py-3 text-sm font-semibold transition-all hover:bg-[#cfac6c] hover:text-[#17120a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cfac6c] ${
                standalone
                  ? 'day:text-[#6f511c] text-[#e3c887]'
                  : 'day:text-[#6f511c] text-[#e3c887]'
              }`}
            >
              Show more photos ({photos.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {standalone && (
          <div className="day:border-[#e2dad0] day:bg-none day:bg-[#f1ede3] mt-16 rounded-sm border border-white/10 bg-gradient-to-r from-[#171614] via-[#141311] to-[#171614] p-8 sm:p-12">
            <div className="mx-auto max-w-4xl text-center">
              <span className="day:border-[#d0c2ad] day:bg-[#e8e0d1] day:text-[#74551d] inline-flex items-center gap-1.5 rounded-full border border-[#cfac6c]/40 bg-[#cfac6c]/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#e6cb8b] uppercase">
                <SparklesIcon className="size-3.5" />
                Design Your Own Memorial
              </span>
              <h2 className="day:text-[#1d1a17] mt-4 font-serif text-2xl font-light text-white sm:text-3xl lg:text-4xl">
                Inspired by an installation in our gallery?
              </h2>
              <p className="day:text-[#5c544a] mx-auto mt-3 max-w-2xl text-base text-[#c3bbb0]">
                Every memorial in this gallery was designed and personalized to
                honor a unique life. You can design your own tribute directly in
                our 3D studio, or consult with our memorial architects for
                custom cemetery specifications.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/select-product"
                  className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#3a332c] inline-flex min-h-12 items-center justify-center rounded-sm bg-[#cfac6c] px-6 text-sm font-semibold text-[#17120a] shadow-sm transition-all hover:bg-[#e4c988]"
                >
                  Start Designing in 3D →
                </Link>
                <Link
                  href="/contact"
                  className="day:border-[#dcd5c9] day:bg-white day:text-[#1d1a17] day:hover:border-[#cfac6c] inline-flex min-h-12 items-center justify-center rounded-sm border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition-all hover:border-[#cfac6c] hover:bg-white/10"
                >
                  Consult an Architect
                </Link>
              </div>
            </div>
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
        className="day:border-[#dcd5c9] day:bg-[#fbf9f5] day:text-[#1d1a17] fixed inset-0 m-auto max-h-[95dvh] w-[min(1100px,96vw)] max-w-none overflow-y-auto rounded-sm border border-white/20 bg-[#151412] p-4 text-white shadow-2xl backdrop:bg-black/85 backdrop:backdrop-blur-sm sm:p-6"
      >
        {selected && (
          <>
            <div className="flex items-center justify-between gap-4">
              <p
                className="day:text-[#756c62] text-sm text-white/70"
                aria-live="polite"
              >
                {(selectedIndex ?? 0) + 1} / {photos.length}
              </p>
              <button
                type="button"
                autoFocus
                onClick={() => setSelectedIndex(null)}
                aria-label="Close photo"
                className="day:border-[#dcd5c9] day:hover:bg-black/5 day:text-[#1d1a17] flex h-11 w-11 items-center justify-center rounded-sm border border-white/30 text-white transition-colors hover:bg-white/10"
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
                className="day:border-[#dcd5c9] day:hover:bg-black/5 day:text-[#1d1a17] flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-white/30 text-white transition-colors hover:bg-white/10"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <p
                className="day:text-[#1d1a17] text-center text-sm font-medium leading-6 text-white"
                aria-live="polite"
              >
                {selected.alt}
              </p>
              <button
                type="button"
                onClick={() => movePhoto(1)}
                aria-label="Next photo"
                className="day:border-[#dcd5c9] day:hover:bg-black/5 day:text-[#1d1a17] flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-white/30 text-white transition-colors hover:bg-white/10"
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
