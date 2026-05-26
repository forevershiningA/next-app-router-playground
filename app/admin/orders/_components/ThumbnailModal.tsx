'use client';

import { useEffect, useState } from 'react';

interface ThumbnailModalProps {
  src: string;
  /** Full-size image shown in the modal. Falls back to src if not provided. */
  fullSrc?: string;
  alt?: string;
  /** Tailwind size classes for the thumbnail. Defaults to 'h-24 w-24'. */
  thumbSize?: string;
}

export function ThumbnailModal({ src, fullSrc, alt = 'Design preview', thumbSize = 'h-24 w-24' }: ThumbnailModalProps) {
  const modalSrc = fullSrc || src;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        aria-label="View full-size design"
      >
        <img
          src={src}
          alt={alt}
          className={`${thumbSize} rounded object-contain bg-gray-100 dark:bg-gray-700 cursor-pointer hover:opacity-80 transition-opacity`}
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Design preview"
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-8 right-0 text-white text-2xl font-bold leading-none hover:text-gray-300"
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={modalSrc}
              alt={alt}
              className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
