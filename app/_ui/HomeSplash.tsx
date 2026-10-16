'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ThemeToggle } from '#/components/theme/ThemeToggle';

const MEMORIAL_LINKS = [
  { label: 'Headstones', href: '/memorials/headstones' },
  { label: 'Plaques', href: '/memorials/plaques' },
  { label: 'Full Monuments', href: '/memorials/full-monuments' },
  { label: 'Urns', href: '/memorials/urns' },
  { label: 'Pet Memorials', href: '/memorials/pet-memorials' },
] as const;

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
        className="relative flex flex-col overflow-hidden border-b border-[#bdb4a6] bg-[#eee9df]"
        role="banner"
      >
        {/* Responsive Header - Absolute top */}
        <header
          className="absolute top-0 right-0 left-0 z-50 px-4 py-3 sm:px-6 sm:py-4"
          style={{ caretColor: 'transparent' }}
        >
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-5 lg:px-8 xl:gap-8">
            <Link
              href="/"
              aria-label="Forever Shining home"
              className="shrink-0 font-serif text-xl leading-none tracking-[-0.015em] text-[#2b2926] transition-colors hover:text-[#7b5a20] sm:text-[1.6875rem]"
            >
              Forever Shining
            </Link>

            <nav
              className="ml-auto hidden shrink-0 items-center gap-2 xl:flex"
              aria-label="Design actions"
            >
              <ThemeToggle inline />
              <Link
                href="/designs"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#bdb4a6] text-[#1d1a17] transition-colors hover:border-[#7b5a20] hover:bg-white/45"
                aria-label="Search memorial designs"
              >
                <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/designs"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#bdb4a6] px-4 text-sm font-semibold text-[#1d1a17] transition-colors hover:border-[#7b5a20] hover:bg-white/45"
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
              className="hidden min-h-11 items-center justify-center rounded-sm bg-[#1d1a17] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#3a332c] md:inline-flex xl:hidden"
            >
              Start Designing
            </Link>

            {/* Menu button for all breakpoints below the full desktop navigation. */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="shrink-0 rounded-lg border border-[#bdb4a6] bg-white/20 p-2 text-[#1d1a17] transition-colors hover:border-[#7b5a20] hover:bg-white/45 xl:hidden"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </header>

        <nav
          aria-label="Memorial categories"
          className="absolute top-[72px] right-0 left-0 z-40 hidden border-y border-[#cfc5b7]/80 bg-[#eee9df]/95 backdrop-blur-sm xl:block"
        >
          <div className="mx-auto flex h-11 max-w-7xl items-center justify-center gap-9 px-8">
            {MEMORIAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex h-full items-center text-[13px] font-medium tracking-[0.01em] text-[#514a43] transition-colors after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:origin-center after:scale-x-0 after:bg-[#8a651f] after:transition-transform hover:text-[#6f511c] hover:after:scale-x-100 focus-visible:text-[#6f511c] focus-visible:outline-none focus-visible:after:scale-x-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

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
              {/* Match the home header so the logo and close button stay in
                  exactly the same place when the mobile menu opens. */}
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
          className="relative z-10 mx-auto w-full max-w-7xl scroll-mt-24 px-4 pt-[132px] pb-12 sm:px-6 sm:pt-[140px] sm:pb-14 lg:px-8 lg:pt-[136px] lg:pb-16"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)] lg:gap-10">
            <div className="flex max-w-xl flex-col items-start text-left">
              <h1
                id="home-heading"
                className="!mb-0 scroll-mt-24 !pb-0 font-serif text-[2rem] leading-[1.12] tracking-[-0.025em] text-[#1d1a17] sm:text-[2.75rem] lg:text-5xl lg:leading-[1.08]"
              >
                Design Custom Headstones
                <br className="hidden lg:block" /> &amp; Memorial Plaques
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-pretty text-[#625a51] sm:text-lg sm:leading-8">
                Choose the stone, shape, inscription, and meaningful details in
                one guided designer. See every change and the price in 3D, then
                save or share your design when you are ready.
              </p>

              <div className="relative z-20 mt-7 flex">
                <Link
                  href="/select-product"
                  prefetch={false}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-[#1d1a17] px-7 py-3 text-center text-sm font-semibold tracking-[0.015em] text-white transition-colors hover:bg-[#3a332c] sm:w-auto"
                  aria-label="Design your memorial"
                >
                  Start Designing in 3D
                </Link>
              </div>
            </div>

            <Link
              href="/select-product"
              prefetch={false}
              aria-label="Open the 3D memorial designer"
              className="group relative block overflow-hidden rounded-sm border border-[#d8cdb9] bg-[#17120d] shadow-[0_20px_50px_rgba(55,42,20,0.18)]"
            >
              <div className="relative aspect-[21/10] overflow-hidden">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster="/videos/configurator-hero-poster.webp"
                  aria-hidden="true"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:hidden"
                >
                  <source
                    src="/videos/configurator-hero.webm"
                    type="video/webm"
                  />
                  <source
                    src="/videos/configurator-hero.mp4"
                    type="video/mp4"
                  />
                </video>
                <Image
                  src="/screenshots/designer-3d-preview.webp"
                  alt="The Forever Shining 3D memorial designer showing a personalized headstone"
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="hidden object-cover motion-reduce:block"
                />

                <div className="absolute top-4 right-4 border border-white/25 bg-[#17120d]/90 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-[#e3c887] backdrop-blur-sm sm:top-5 sm:right-5">
                  Live 3D preview
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
