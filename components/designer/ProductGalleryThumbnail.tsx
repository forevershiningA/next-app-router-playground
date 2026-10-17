'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const galleryCategories: Record<string, { id: string; name: string }> = {
  headstones: { id: 'headstones', name: 'Headstones' },
  plaques: { id: 'plaques', name: 'Memorial Plaques' },
  monuments: { id: 'full-monuments', name: 'Full Monuments' },
  urns: { id: 'urns', name: 'Urns' },
  'pet-memorials': { id: 'pet-memorials', name: 'Pet Memorials' },
};

export default function ProductGalleryThumbnail({
  product,
}: {
  product: { name: string; image: string; category: string };
}) {
  const category = galleryCategories[product.category];
  const tooltipId = useId();
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const isOpen = position !== null;

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function openPreview() {
    cancelClose();
    const bounds = triggerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const width = Math.min(360, window.innerWidth - 24);
    setPosition({
      top: bounds.bottom + 8,
      left: Math.max(12, Math.min(bounds.left, window.innerWidth - width - 12)),
    });
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setPosition(null), 120);
  }

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) return;
    const bounds = tooltipRef.current?.getBoundingClientRect();
    if (bounds && bounds.bottom > window.innerHeight - 12) {
      const trigger = triggerRef.current?.getBoundingClientRect();
      if (trigger)
        setPosition(
          (current) =>
            current && {
              ...current,
              top: Math.max(12, trigger.top - bounds.height - 8),
            },
        );
    }
    const close = () => setPosition(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (tooltipRef.current?.contains(document.activeElement)) {
          triggerRef.current?.focus({ preventScroll: true });
        }
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  if (!category) return null;

  return (
    <>
      <Link
        ref={triggerRef}
        href={`/memorials/gallery?category=${category.id}`}
        aria-label={`View ${category.name.toLowerCase()} in the gallery`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? tooltipId : undefined}
        onMouseEnter={openPreview}
        onMouseLeave={scheduleClose}
        onFocus={openPreview}
        onBlur={scheduleClose}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && isOpen) {
            event.preventDefault();
            tooltipRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
          }
        }}
        onClick={() => setPosition(null)}
        className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cfac6c] sm:h-20 sm:w-20"
      >
        <Image
          src={`/webp/products/${product.image}`}
          alt={product.name}
          fill
          sizes="(min-width: 640px) 80px, 64px"
          className="object-contain p-1"
        />
      </Link>
      {position &&
        createPortal(
          <span
            ref={tooltipRef}
            id={tooltipId}
            role="dialog"
            aria-label={`${category.name} gallery preview`}
            aria-modal={false}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            onFocus={cancelClose}
            onBlur={scheduleClose}
            style={{ top: position.top, left: position.left }}
            className="day:border-stone-300 day:bg-[#f7f4ee] day:text-stone-900 fixed z-[10000] block w-[min(360px,calc(100vw-24px))] rounded-sm border border-[#cfac6c]/50 bg-[#1d1a17] p-4 text-left text-sm font-normal tracking-normal text-white normal-case shadow-xl"
          >
            <span className="mb-3 block font-semibold">
              {category.name} gallery
            </span>
            <span className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((index) => (
                <Link
                  key={index}
                  href={`/memorials/gallery?category=${category.id}`}
                  aria-label={`Explore ${category.name.toLowerCase()} gallery, example ${index}`}
                  onClick={() => setPosition(null)}
                  className="relative block aspect-square overflow-hidden rounded-sm bg-[#eee9df] hover:ring-2 hover:ring-[#cfac6c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cfac6c]"
                >
                  <Image
                    src={`/gallery/${category.id}-${String(index).padStart(3, '0')}-thumb.webp`}
                    alt={`${category.name} gallery example ${index}`}
                    fill
                    sizes="155px"
                    className="object-contain"
                  />
                </Link>
              ))}
            </span>
            <span className="day:text-stone-600 mt-3 block text-xs leading-5 text-white/70">
              Click any photo to explore this gallery.
            </span>
          </span>,
          document.body,
        )}
    </>
  );
}
