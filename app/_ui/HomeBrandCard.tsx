'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function HomeBrandCard() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative shrink-0"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (
          event.pointerType === 'mouse' &&
          !rootRef.current?.contains(document.activeElement)
        )
          setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="home-brand-card"
        onClick={() => setOpen((value) => !value)}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) setOpen(true);
        }}
        className="day:text-[#2b2926] day:hover:text-[#7b5a20] cursor-pointer rounded-sm font-serif text-xl leading-none tracking-[-0.015em] text-[#f4eee4] transition-colors hover:text-[#cfac6c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cfac6c] sm:text-[1.6875rem]"
      >
        Forever Shining
      </button>
      {open && (
        <div
          id="home-brand-card"
          className="absolute top-full left-0 w-[min(350px,calc(100vw-2rem))] pt-4"
        >
          <div className="overflow-hidden rounded-sm border border-[#cfac6c]/40 bg-black p-6 text-white shadow-[0_18px_50px_rgba(29,26,23,0.3)]">
            <Image
              src="/webp/forever-logo.webp"
              alt="Forever Shining - Design Online"
              width={200}
              height={120}
              sizes="200px"
              className="mx-auto h-[120px] w-auto select-none"
              draggable={false}
            />
            <p className="mt-4 text-center text-sm leading-6 text-white/70">
              Crafting lasting tributes for families around the world since
              2005.
            </p>
            <div className="mt-5 space-y-2 border-t border-[#cfac6c]/25 pt-4 text-sm">
              <a
                href="tel:+16473880931"
                className="block w-fit rounded-sm text-[#f3d48f] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                (+1) 647 388 0931
              </a>
              <a
                href="mailto:admin@bronze-plaque.com"
                className="block w-fit rounded-sm text-white/80 hover:text-[#f3d48f] focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                admin@bronze-plaque.com
              </a>
              <p className="text-xs leading-5 text-white/55">
                1101 Eagle Ridge Drive
                <br />
                Oshawa Ontario L1K 0L8
              </p>
            </div>
            <Link
              href="/contact"
              className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-sm border border-[#cfac6c]/45 text-sm font-medium text-[#f3d48f] transition-colors hover:bg-[#cfac6c]/10 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Get in touch
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
