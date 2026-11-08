'use client';

import Link from 'next/link';
import Image from 'next/image';
import MemorialCategoryNav, {
  MEMORIAL_LINKS,
} from '#/components/MemorialCategoryNav';
import { useEffect, useRef, useState } from 'react';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { ThemeToggle } from '#/components/theme/ThemeToggle';
import HomeBrandCard from './HomeBrandCard';

export default function HomeSplash() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Mobile menu: close on Escape and lock body scroll while open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const menu = mobileMenuRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const closeButton = menu?.querySelector<HTMLElement>('[data-menu-close]');
    closeButton?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }
      if (event.key === 'Tab' && menu) {
        const focusable = [
          ...menu.querySelectorAll<HTMLElement>(focusableSelector),
        ];
        const first = focusable[0];
        const last = focusable.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      (previouslyFocused ?? menuButtonRef.current)?.focus();
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <a
        href="#home-heading"
        className="fixed top-4 left-4 z-[10001] -translate-y-24 rounded-md bg-[#cfac6c] px-4 py-2 font-semibold text-slate-950 transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      {/* Hero Section */}
      <div
        className="day:border-[#bdb4a6] day:bg-none day:bg-[#f1ede3] relative flex flex-col overflow-hidden border-b border-[#cfac6c]/20 bg-[#100d09]"
        role="banner"
      >
        {/* Responsive Header - Absolute top */}
        <header
          className="absolute top-0 right-0 left-0 z-50 px-4 py-3 sm:px-6 sm:py-4"
          style={{ caretColor: 'transparent' }}
        >
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-5 lg:px-8 xl:gap-8">
            <HomeBrandCard />

            <nav
              className="ml-auto hidden shrink-0 items-center gap-2 xl:flex"
              aria-label="Design actions"
            >
              <ThemeToggle inline />
              <Link
                href="/designs"
                className="day:border-[#bdb4a6] day:text-[#1d1a17] day:hover:border-[#7b5a20] day:hover:bg-white/45 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-[#f4eee4] transition-colors hover:border-[#cfac6c] hover:bg-white/10"
                aria-label="Search memorial designs"
              >
                <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/designs"
                className="day:border-[#bdb4a6] day:text-[#1d1a17] day:hover:border-[#7b5a20] day:hover:bg-white/45 inline-flex min-h-10 items-center justify-center rounded-lg border border-white/20 px-4 text-sm font-semibold text-[#f4eee4] transition-colors hover:border-[#cfac6c] hover:bg-white/10"
              >
                Browse Designs
              </Link>
            </nav>

            <div className="ml-auto xl:hidden">
              <ThemeToggle inline />
            </div>

            <Link
              href="/select-product"
              prefetch={false}
              className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#3a332c] hidden min-h-11 items-center justify-center rounded-sm bg-[#cfac6c] px-4 text-sm font-semibold text-[#1d1a17] transition-colors hover:bg-[#e0c48c] md:inline-flex xl:hidden"
            >
              Start Designing
            </Link>

            {/* Menu button for all breakpoints below the full desktop navigation. */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="day:border-[#bdb4a6] day:bg-white/20 day:text-[#1d1a17] day:hover:border-[#7b5a20] day:hover:bg-white/45 shrink-0 rounded-lg border border-white/20 bg-white/5 p-2 text-[#f4eee4] transition-colors hover:border-[#cfac6c] hover:bg-white/10 xl:hidden"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </header>

        <MemorialCategoryNav className="day:!border-[#cfc5b7]/80 day:!bg-[#e7e1d5]/70 day:backdrop-blur-sm day:[&_a]:text-[#514a43] day:[&_a]:after:bg-[#8a651f] day:[&_a:hover]:text-[#6f511c] day:[&_a:focus-visible]:text-[#6f511c] day:[&_a[aria-current=page]]:text-[#6f511c] absolute top-[72px] right-0 left-0 z-40 !border-white/15 !bg-black/40 backdrop-blur-sm [&_a]:text-[#d8cfc1] [&_a]:after:bg-[#cfac6c] [&_a:focus-visible]:text-[#f3d48f] [&_a:hover]:text-[#f3d48f] [&_a[aria-current=page]]:text-[#f3d48f]" />

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="fixed inset-0 z-[60] overscroll-contain xl:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto border-b border-[#d4af37]/25 bg-[#0d0a06]/95 pb-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-end px-4 py-3">
                <button
                  data-menu-close
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="shrink-0 rounded-lg border border-white/15 bg-white/[0.06] p-2 text-white backdrop-blur-sm transition-colors hover:border-[#cfac6c]/60"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <p className="mt-6 px-5 text-[11px] font-semibold tracking-[0.24em] text-[#f3d48f] uppercase">
                <span id="mobile-menu-title">Memorials</span>
              </p>
              <nav
                className="mt-2 flex flex-col px-5"
                aria-label="Memorial product pages"
              >
                {MEMORIAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-1 py-3 text-base font-medium text-white/85 transition-colors hover:text-[#f3d48f]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 flex flex-col gap-3 px-5">
                <Link
                  href="/select-product"
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-[#cfac6c] px-5 py-3 text-center text-base font-semibold text-slate-950 transition-colors hover:bg-[#d7b979]"
                >
                  Start Designing
                </Link>
                <Link
                  href="/designs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-white/15 px-5 py-3 text-center text-base font-semibold text-white transition-colors hover:border-[#cfac6c]/60 hover:bg-white/5"
                >
                  Browse Designs
                </Link>
              </div>
            </div>
          </div>
        )}

        <div
          id="how-it-works"
          className="relative z-10 mx-auto w-full max-w-7xl scroll-mt-24 px-4 pt-28 pb-14 sm:px-6 sm:pt-[150px] sm:pb-16 lg:px-8 lg:pt-[146px] lg:pb-20"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
            <div className="flex max-w-xl flex-col items-start text-left">
              {/* Category / Craftsmanship pill */}
              <span className="day:border-[#d0c2ad] day:bg-[#e8e0d1] day:text-[#74551d] inline-flex items-center gap-1.5 rounded-full border border-[#cfac6c]/40 bg-[#cfac6c]/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#e6cb8b] uppercase">
                <SparklesIcon className="size-3.5" />
                Handcrafted Precision · 3D Online Studio
              </span>

              <h1
                id="home-heading"
                className="day:text-[#1d1a17] !mb-0 mt-4 scroll-mt-24 !pb-0 font-serif text-[2.25rem] leading-[1.10] tracking-[-0.025em] text-[#f4eee4] sm:text-[2.85rem] lg:text-5xl lg:leading-[1.08]"
              >
                Design a Custom Headstone
                <br className="hidden lg:block" /> or Memorial Plaque
              </h1>

              <p className="day:text-[#5c544a] mt-5 max-w-lg text-base leading-7 text-pretty text-[#bdb3a5] sm:text-lg sm:leading-8">
                Choose the stone, shape, inscription, and meaningful details in
                one guided designer. See every change and the price in 3D, then
                save or share your design when you are ready.
              </p>

              {/* Dual Action CTAs */}
              <div className="relative z-20 mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/select-product"
                  prefetch={false}
                  className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#342e26] inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#cfac6c] px-6 py-3 text-center text-sm font-semibold tracking-[0.015em] text-[#1d1a17] shadow-sm transition-all hover:bg-[#e0c48c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6f511c]"
                  aria-label="Design your memorial in 3D"
                >
                  <span>Start Designing in 3D</span>
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/designs"
                  className="day:border-[#b8ad9e] day:text-[#1d1a17] day:hover:bg-[#e4ddcf] inline-flex min-h-12 items-center justify-center rounded-sm border border-white/20 bg-transparent px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6f511c]"
                >
                  Browse Ready Designs
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Visual Container */}
            <div className="order-first lg:order-none">
              <Link
                href="/select-product"
                prefetch={false}
                aria-label="Open the 3D memorial designer"
                className="group day:border-[#e2dad0] day:bg-white day:shadow-xl relative block overflow-hidden rounded-sm border border-white/15 bg-[#171410] p-3 shadow-2xl transition-all duration-300 hover:border-[#cfac6c]/50"
              >
                <div className="day:border-[#ece5d9] relative aspect-video overflow-hidden rounded-sm border border-white/10 bg-black">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/videos/hero-garden-v9-poster.webp"
                    aria-hidden="true"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:hidden"
                  >
                    <source src="/videos/hero-garden-v9.webm" type="video/webm" />
                    <source src="/videos/hero-garden-v9.mp4" type="video/mp4" />
                  </video>
                  <Image
                    src="/videos/hero-garden-v9-poster.webp"
                    alt="A laptop showing the 3D memorial designer beside a headstone in a garden"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="hidden object-cover motion-reduce:block"
                  />

                  <div className="day:border-[#d5c9b7] day:bg-white/90 day:text-[#70521c] absolute right-3 bottom-3 rounded-full border border-white/20 bg-black/75 px-3 py-1 text-[11px] font-semibold tracking-wider text-[#e6cb8b] uppercase backdrop-blur-xs">
                    ✦ Real-time 3D Configurator
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between px-2 py-1 text-xs">
                  <span className="day:text-[#1d1a17] font-medium text-white/90">
                    Interactive 3D Preview with Instant Pricing
                  </span>
                  <span className="day:text-[#8a651f] flex items-center gap-1 font-semibold text-[#cfac6c]">
                    <span>Explore Studio</span>
                    <ArrowRightIcon className="size-3" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
