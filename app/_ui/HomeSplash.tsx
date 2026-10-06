'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRightIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { homeFaqItems } from '#/app/_internal/home-content';
import { ThemeToggle } from '#/components/theme/ThemeToggle';

const GOOGLE_REVIEWS_URL =
  'https://www.google.com/maps/place/Forever+Shining/@-32.1008719,115.8010523,17z/data=!4m8!3m7!1s0x2a329881c4e227b1:0xc1dcd9e0d4834beb!8m2!3d-32.1008719!4d115.8010523!9m1!1b1!16s%2Fg%2F1tcvf5g5?entry=ttu&g_ep=EgoyMDI2MDkzMC4wIKXMDSoASAFQAw%3D%3D';

const GOOGLE_REVIEW_HIGHLIGHTS = [
  {
    author: 'Veronica Crawford',
    text: 'Beautiful work that exceeded expectations, supported by exceptional customer care.',
  },
  {
    author: 'Duncan Blake',
    text: 'Responsive, compassionate help with a pet memorial during a difficult time.',
  },
  {
    author: 'Marion Baumgarten',
    text: 'Personal service and a finished memorial that made the family proud.',
  },
  {
    author: 'Naser Soueid',
    text: 'A challenging custom bronze plaque delivered beyond expectations.',
  },
  {
    author: 'Dean W',
    text: 'Excellent design guidance, turnaround time, and quality of workmanship.',
  },
  {
    author: 'Tim dB',
    text: 'The team listened carefully and communicated throughout the process.',
  },
  {
    author: 'Janette Martin',
    text: 'A unique family monument handled professionally from design to installation.',
  },
  {
    author: 'Rose Ah Gee',
    text: 'Thoughtful design alternatives and careful interstate delivery.',
  },
  {
    author: 'Ebony Ristich',
    text: 'Helpful service and a plaque that arrived exactly as imagined.',
  },
  {
    author: 'Stathi Kossi',
    text: 'The online designer made the finished result easy to picture.',
  },
  {
    author: 'Gladwin Abrio',
    text: 'Clear advice on materials, colours, pricing, and the available options.',
  },
  {
    author: 'Joy Locker',
    text: 'A beautiful proof, fast installation, and excellent value.',
  },
  {
    author: 'Kate',
    text: 'An informative website, transparent pricing, and an effortless process.',
  },
  {
    author: 'Sandy Taylor',
    text: 'A straightforward online design experience with kind, helpful support.',
  },
  {
    author: 'Tracie Bromage',
    text: 'Compassionate guidance and a memorial that captured her dad perfectly.',
  },
  {
    author: 'Dee Gabrielle Ignacio-Godwin',
    text: 'Professional support, careful delivery, and a result beyond expectations.',
  },
  {
    author: 'Dean Haeusler',
    text: 'Consistent communication and a quality product worth recommending.',
  },
  {
    author: 'Kate Schofield',
    text: 'An easy design system backed by patient phone support.',
  },
  {
    author: 'David Clayton',
    text: 'Reliable quality and service across more than 160 memorial plaques.',
  },
  {
    author: 'Timur Golovinov',
    text: 'A user-friendly design tool and an exceptional finished product.',
  },
] as const;

const MEMORIAL_LINKS = [
  { label: 'Headstones', href: '/memorials/headstones' },
  { label: 'Plaques', href: '/memorials/plaques' },
  { label: 'Full Monuments', href: '/memorials/full-monuments' },
  { label: 'Urns', href: '/memorials/urns' },
  { label: 'Pet Memorials', href: '/memorials/pet-memorials' },
] as const;

const HOME_PRODUCT_OPTIONS = [
  {
    name: 'Laser-Etched Black Granite Headstone',
    category: 'Custom headstones',
    description:
      'Create a polished black granite headstone with a photographic portrait, personal inscription, and detailed laser-etched artwork.',
    image: '/webp/products/APP_ID_4-medium.webp',
    href: '/laser-etched-black-granite-headstone/select-shape',
    learnMoreHref: '/memorials/headstones',
  },
  {
    name: 'Traditional Engraved Headstone',
    category: 'Granite memorials',
    description:
      'Choose a traditional granite headstone shape, stone color, engraved wording, motifs, and coordinated memorial accessories.',
    image: '/webp/products/APP_ID_124-medium.webp',
    href: '/traditional-engraved-headstone/select-shape',
    learnMoreHref: '/memorials/headstones',
  },
  {
    name: 'Bronze Memorial Plaque',
    category: 'Memorial plaques',
    description:
      'Design a cast bronze plaque with a custom border, background, raised inscription, emblems, motifs, and fixing system.',
    image: '/webp/products/APP_ID_5-medium.webp',
    href: '/bronze-plaque/select-shape',
    learnMoreHref: '/memorials/plaques',
  },
  {
    name: 'Full Color Memorial Plaque',
    category: 'Personalized plaques',
    description:
      'Combine photographs, color backgrounds, meaningful text, and decorative details in a durable personalized memorial plaque.',
    image: '/webp/products/APP_ID_32-medium.webp',
    href: '/full-colour-plaque/select-shape',
    learnMoreHref: '/memorials/plaques',
  },
  {
    name: 'Black Granite Full Monument',
    category: 'Full monuments',
    description:
      'Plan a complete granite monument with a headstone, bases, kerbs, cover, inscriptions, portraits, and coordinated additions.',
    image: '/webp/products/APP_ID_100-medium.webp',
    href: '/laser-etched-black-granite-full-monument/select-shape',
    learnMoreHref: '/memorials/full-monuments',
  },
  {
    name: 'Stainless Steel Memorial Urn',
    category: 'Memorial urns',
    description:
      'Personalize a stainless steel vitreous enamel inlaid urn with imagery, color, wording, and a carefully selected finish.',
    image: '/webp/products/APP_ID_2350-medium.webp',
    href: '/stainless-steel-vitreous-enamel-inlaid-urn/select-shape',
    learnMoreHref: '/memorials/urns',
  },
  {
    name: 'Black Granite Mini Headstone',
    category: 'Mini headstones',
    description:
      'Create a compact black granite memorial with a laser-etched portrait, inscription, and artwork for a garden or smaller resting place.',
    image: '/webp/products/APP_ID_22-medium.webp',
    href: '/laser-etched-black-granite-mini-headstone/select-shape',
    learnMoreHref: '/memorials/headstones',
  },
  {
    name: 'Stainless Steel Memorial Plaque',
    category: 'Metal memorial plaques',
    description:
      'Design a durable YAG-lasered stainless steel plaque with precise wording, imagery, motifs, and fixing options for indoor or outdoor display.',
    image: '/webp/products/APP_ID_52-medium.webp',
    href: '/yag-lasered-stainless-steel-plaque/select-shape',
    learnMoreHref: '/memorials/plaques',
  },
  {
    name: 'Laser-Etched Pet Memorial Plaque',
    category: 'Pet memorials',
    description:
      'Remember a beloved companion with a personalized black granite pet plaque featuring their portrait, name, dates, and a meaningful message.',
    image: '/webp/products/APP_ID_9-medium.webp',
    href: '/laser-etched-pet-plaque/select-shape',
    learnMoreHref: '/memorials/pet-memorials',
  },
  {
    name: 'Stainless Steel Light Transmitting Headstone',
    category: 'Stainless steel headstones',
    description:
      'Create a contemporary stainless steel headstone with light-transmitting inscriptions and motifs, a glass backing, and a matching base.',
    image: '/webp/products/APP_ID_1-medium.webp',
    href: '/stainless-steel-light-transmitting-headstone/select-shape',
    learnMoreHref: '/memorials/headstones',
  },
  {
    name: 'Traditional Engraved Memorial Plaque',
    category: 'Engraved granite plaques',
    description:
      'Choose a granite or stone finish and add deeply engraved lettering, borders, photographs, and motifs to a traditional memorial plaque.',
    image: '/webp/products/APP_ID_34-medium.webp',
    href: '/traditional-engraved-plaque/select-shape',
    learnMoreHref: '/memorials/plaques',
  },
  {
    name: 'Traditional Engraved Full Monument',
    category: 'Traditional monuments',
    description:
      'Design a complete traditional monument with coordinated granite elements, engraved inscriptions, decorative motifs, and memorial accessories.',
    image: '/webp/products/APP_ID_101-medium.webp',
    href: '/traditional-engraved-full-monument/select-shape',
    learnMoreHref: '/memorials/full-monuments',
  },
] as const;

export default function HomeSplash() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reviewsPaused, setReviewsPaused] = useState(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const reviewsTrackRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (
      reviewsPaused ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let resetTimeout: ReturnType<typeof setTimeout> | undefined;
    const interval = window.setInterval(() => {
      const track = reviewsTrackRef.current;
      const firstReview = track?.firstElementChild as HTMLElement | null;
      const secondReview = track?.children[1] as HTMLElement | undefined;
      const loopStart = track?.children[GOOGLE_REVIEW_HIGHLIGHTS.length] as
        | HTMLElement
        | undefined;
      if (!track || !firstReview || !secondReview || !loopStart) return;

      const cardStep = secondReview.offsetLeft - firstReview.offsetLeft;
      const loopWidth = loopStart.offsetLeft - firstReview.offsetLeft;
      const nextPosition = track.scrollLeft + cardStep;
      track.scrollTo({ left: nextPosition, behavior: 'smooth' });

      if (nextPosition >= loopWidth) {
        resetTimeout = setTimeout(() => {
          track.scrollTo({ left: nextPosition - loopWidth, behavior: 'auto' });
        }, 800);
      }
    }, 10_000);

    return () => {
      window.clearInterval(interval);
      if (resetTimeout) clearTimeout(resetTimeout);
    };
  }, [reviewsPaused]);

  const scrollReviews = (direction: -1 | 1) => {
    const track = reviewsTrackRef.current;
    const firstReview = track?.firstElementChild as HTMLElement | null;
    const secondReview = track?.children[1] as HTMLElement | undefined;
    const loopStart = track?.children[GOOGLE_REVIEW_HIGHLIGHTS.length] as
      | HTMLElement
      | undefined;
    if (!track || !firstReview || !secondReview || !loopStart) return;

    const cardStep = secondReview.offsetLeft - firstReview.offsetLeft;
    const loopWidth = loopStart.offsetLeft - firstReview.offsetLeft;
    let currentPosition = track.scrollLeft;

    if (currentPosition >= loopWidth) {
      currentPosition -= loopWidth;
      track.scrollTo({ left: currentPosition, behavior: 'auto' });
    }

    if (direction === -1 && currentPosition <= 1) {
      track.scrollTo({ left: loopWidth, behavior: 'auto' });
      requestAnimationFrame(() => {
        track.scrollTo({ left: loopWidth - cardStep, behavior: 'smooth' });
      });
      return;
    }

    const nextPosition = currentPosition + direction * cardStep;
    track.scrollTo({ left: nextPosition, behavior: 'smooth' });

    if (direction === 1 && nextPosition >= loopWidth) {
      setTimeout(() => {
        track.scrollTo({ left: nextPosition - loopWidth, behavior: 'auto' });
      }, 800);
    }
  };

  const scrollToReview = (index: number) => {
    const track = reviewsTrackRef.current;
    const firstReview = track?.firstElementChild as HTMLElement | null;
    const targetReview = track?.children[index] as HTMLElement | undefined;
    if (!track || !firstReview || !targetReview) return;

    track.scrollTo({
      left: targetReview.offsetLeft - firstReview.offsetLeft,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
    setActiveReviewIndex(index);
  };

  const handleReviewsScroll = () => {
    const track = reviewsTrackRef.current;
    const firstReview = track?.firstElementChild as HTMLElement | null;
    const secondReview = track?.children[1] as HTMLElement | undefined;
    if (!track || !firstReview || !secondReview) return;

    const cardStep = secondReview.offsetLeft - firstReview.offsetLeft;
    const index = Math.round(track.scrollLeft / cardStep);
    setActiveReviewIndex(index % GOOGLE_REVIEW_HIGHLIGHTS.length);
  };

  return (
    <main id="main-content" className="min-h-screen bg-[#0c0b0a]">
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
                <Image
                  src="/screenshots/designer-3d-preview.webp"
                  alt="The Forever Shining 3D memorial designer showing a personalized headstone"
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />

                <div className="absolute top-4 right-4 border border-white/25 bg-[#17120d]/90 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-[#e3c887] backdrop-blur-sm sm:top-5 sm:right-5">
                  Live 3D preview
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <section
        aria-labelledby="google-reviews-heading"
        className="day:border-[#d8cdb9] day:bg-[#f7f4ee] day:text-[#1d1a17] relative overflow-hidden border-b border-[#cfac6c]/20 bg-[#1d1a17] py-10 text-white lg:py-12"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="day:text-[#8a651f] text-sm font-semibold text-[#d8b66f]">
                ★★★★★{' '}
                <span className="day:text-[#625a51] ml-2 text-white/70">
                  4.8 from 72 Google reviews
                </span>
              </p>
              <h2
                id="google-reviews-heading"
                className="mt-2 font-serif text-3xl leading-tight"
              >
                Words from families we have helped
              </h2>
            </div>
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="day:border-[#9a742f] day:text-[#6f511c] day:hover:text-[#1d1a17] w-fit border-b border-[#d8b66f] pb-1 text-sm font-semibold text-[#f0d89f] transition-colors hover:text-white"
            >
              Read all reviews on Google
            </a>
          </div>

          <div
            ref={reviewsTrackRef}
            tabIndex={0}
            aria-label="Customer review highlights. Scroll horizontally to see more. Reviews advance automatically every 10 seconds."
            onMouseEnter={() => setReviewsPaused(true)}
            onMouseLeave={() => setReviewsPaused(false)}
            onFocus={() => setReviewsPaused(true)}
            onBlur={() => setReviewsPaused(false)}
            onPointerDown={() => setReviewsPaused(true)}
            onPointerUp={() => setReviewsPaused(false)}
            onScroll={handleReviewsScroll}
            className="day:gap-4 day:border-transparent day:py-3 mt-6 flex touch-pan-x snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth border-t border-l border-white/20 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {[0, 1].map((cycle) =>
              GOOGLE_REVIEW_HIGHLIGHTS.map((review) => (
                <figure
                  key={`${cycle}-${review.author}`}
                  aria-hidden={cycle === 1}
                  className="day:rounded-sm day:border day:border-[#e4ddd2] day:bg-white day:shadow-[0_10px_30px_rgba(0,0,0,0.03)] day:lg:min-w-[calc((100%-2rem)/3)] day:xl:min-w-[calc((100%-3rem)/4)] flex min-h-40 min-w-[270px] snap-start flex-col justify-between border-r border-b border-white/20 p-5 sm:min-w-[310px] sm:p-6 lg:min-w-[33.333333%] xl:min-w-[25%]"
                >
                  <p className="day:text-[#1d1a17] font-serif text-xl leading-snug text-pretty text-white">
                    {review.text}
                  </p>
                  <figcaption className="day:text-[#625a51] mt-6 flex flex-col gap-1 text-sm text-white/80">
                    <span className="day:text-[#1d1a17] font-semibold text-white">
                      {review.author}
                    </span>
                    <span>Google review highlight</span>
                  </figcaption>
                </figure>
              )),
            )}
          </div>

          <div
            className="mt-4 flex items-center gap-4"
            onMouseEnter={() => setReviewsPaused(true)}
            onMouseLeave={() => setReviewsPaused(false)}
            onFocus={() => setReviewsPaused(true)}
            onBlur={() => setReviewsPaused(false)}
          >
            <button
              type="button"
              onClick={() => scrollReviews(-1)}
              aria-label="Show previous review"
              className="day:border-[#9a742f]/70 day:text-[#7b5a20] day:hover:border-[#7b5a20] day:hover:bg-[#eee9df] day:hover:text-[#1d1a17] day:focus-visible:ring-[#9a742f] inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d8b66f]/70 text-[#f0d89f] transition-colors hover:border-[#f0d89f] hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#f0d89f] focus-visible:outline-none"
            >
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="group/slider relative flex h-10 flex-1 items-center focus-within:outline-none">
              <div className="day:bg-[#c9bead] pointer-events-none absolute right-0 left-0 h-px overflow-hidden bg-white/20 group-focus-within/slider:h-0.5">
                <span
                  className="day:bg-[#9a742f] absolute inset-y-0 left-0 bg-[#d8b66f] transition-[width] duration-500"
                  style={{
                    width: `${((activeReviewIndex + 1) / GOOGLE_REVIEW_HIGHLIGHTS.length) * 100}%`,
                  }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={GOOGLE_REVIEW_HIGHLIGHTS.length - 1}
                step={1}
                value={activeReviewIndex}
                onChange={(event) => scrollToReview(Number(event.target.value))}
                aria-label="Choose a customer review"
                aria-valuetext={`Review ${activeReviewIndex + 1} of ${GOOGLE_REVIEW_HIGHLIGHTS.length}`}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
            <span className="sr-only" aria-live="polite">
              Review {activeReviewIndex + 1} of{' '}
              {GOOGLE_REVIEW_HIGHLIGHTS.length}
            </span>
            <button
              type="button"
              onClick={() => scrollReviews(1)}
              aria-label="Show next review"
              className="day:border-[#9a742f]/70 day:text-[#7b5a20] day:hover:border-[#7b5a20] day:hover:bg-[#eee9df] day:hover:text-[#1d1a17] day:focus-visible:ring-[#9a742f] inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d8b66f]/70 text-[#f0d89f] transition-colors hover:border-[#f0d89f] hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#f0d89f] focus-visible:outline-none"
            >
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Search-friendly product entry point outside the designer shell. */}
      <section
        aria-labelledby="home-products-heading"
        className="day:border-stone-200 day:bg-white relative overflow-hidden border-y border-white/10 bg-[#0c0b0a] py-20"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="day:text-amber-800 text-xs font-semibold tracking-[0.12em] text-[#d0ad68]">
              Choose your memorial
            </p>
            <h2
              id="home-products-heading"
              className="day:text-stone-900 mt-4 font-serif text-3xl leading-[1.16] text-pretty text-white sm:text-5xl"
            >
              Design a custom headstone, plaque, monument, or urn online
            </h2>
            <p className="day:text-stone-600 mt-5 max-w-2xl text-base leading-7 text-gray-300">
              Start with the memorial that best suits your family, cemetery, or
              setting. Each guided designer lets you compare shapes, materials,
              sizes, inscriptions, images, and meaningful details before
              ordering.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 items-stretch gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_PRODUCT_OPTIONS.slice(0, 6).map((product) => (
              <article
                key={product.href}
                className="group day:border-stone-200 day:bg-white flex h-full flex-col overflow-hidden border border-white/12 bg-[#151412] transition-colors hover:border-[#d0ad68]/65"
              >
                <div className="day:bg-[#f3f1ed] relative aspect-[4/3] overflow-hidden bg-[#101010]">
                  <Image
                    src={product.image}
                    alt={`${product.name} available to personalize online`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-5 sepia transition-[filter,transform] duration-500 group-hover:scale-[1.025] group-hover:sepia-0 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="day:text-amber-800 text-[11px] font-semibold tracking-[0.08em] text-[#d0ad68]">
                    {product.category}
                  </p>
                  <h3 className="day:text-gray-900 mt-2 text-lg leading-snug font-semibold text-white">
                    {product.name}
                  </h3>
                  <p className="day:text-gray-600 mt-3 flex-1 text-sm leading-6 text-gray-300">
                    {product.description}
                  </p>
                  <div className="mt-5 grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-2">
                    <Link
                      href={product.href}
                      prefetch={false}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sm bg-[#d0ad68] px-3 py-2.5 text-center text-sm font-semibold text-[#17120a] transition-colors hover:bg-[#e0c27f] focus-visible:ring-2 focus-visible:ring-[#f3d48f] focus-visible:outline-none"
                    >
                      Design now
                      <ArrowRightIcon
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                    <Link
                      href={product.learnMoreHref}
                      className="day:border-stone-300 day:text-stone-800 day:hover:bg-stone-50 inline-flex min-h-11 items-center justify-center rounded-sm border border-white/20 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:border-[#d0ad68]/70 hover:bg-white/[0.06]"
                    >
                      Learn more
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-9 flex flex-col items-center gap-3 text-center">
            <Link
              href="/select-product"
              prefetch={false}
              className="day:text-[#6f511c] inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-[#d0ad68] px-6 py-3 text-sm font-semibold text-[#e3c887] transition-colors hover:bg-[#d0ad68] hover:text-[#17120a]"
            >
              View all memorial products
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="day:text-gray-500 max-w-2xl text-xs leading-5 text-gray-400">
              You can save your design, share it with family, and review pricing
              before making a final decision.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#eee9df] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#7b5a20]">
                A clear design process
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-[1.16] text-pretty text-[#1d1a17] sm:text-5xl">
                How to Design Your Memorial Online
              </h2>
              <p className="mt-3 text-base leading-7 text-[#625a51]">
                Work through each decision at your own pace. The 3D preview
                updates as you choose the product, dimensions, wording, and
                personal details.
              </p>
              <Link
                href="/select-product"
                prefetch={false}
                className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-sm bg-[#1d1a17] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a332c]"
              >
                Choose a memorial product
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <ol className="grid border-t border-[#bdb4a6] sm:grid-cols-3 sm:border-l">
              {[
                {
                  title: 'Choose the memorial',
                  description:
                    'Compare headstones, plaques, monuments, urns, and pet memorials before opening the designer.',
                },
                {
                  title: 'Personalize the details',
                  description:
                    'Select the shape, material, size, inscription, portrait, motifs, and available accessories.',
                },
                {
                  title: 'Review before ordering',
                  description:
                    'Check the 3D preview and pricing, then save or share the proof with family before moving forward.',
                },
              ].map((step, index) => (
                <li
                  key={step.title}
                  className="border-r border-b border-[#bdb4a6] p-6 sm:min-h-64"
                >
                  <span
                    className="font-serif text-4xl text-[#9a742f]"
                    aria-hidden="true"
                  >
                    0{index + 1}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-[#1d1a17]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#625a51]">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        id="faq"
        aria-labelledby="home-faq-heading"
        className="day:border-stone-200 day:bg-[#f7f4ee] relative scroll-mt-24 border-t border-white/10 bg-[#11100e] py-20"
      >
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            <p className="day:text-amber-800 text-xs font-semibold tracking-[0.12em] text-[#d0ad68]">
              Memorial design questions
            </p>
            <h2
              id="home-faq-heading"
              className="day:text-stone-900 mt-4 font-serif text-3xl leading-[1.16] text-pretty text-white sm:text-5xl"
            >
              Frequently Asked Questions About Designing a Memorial
            </h2>
            <p className="day:text-gray-600 mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-300">
              Practical answers about personalisation, cemetery requirements,
              saving a design, and ordering from your region.
            </p>
          </div>

          <div className="mt-9 space-y-3">
            {homeFaqItems.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className="group day:border-stone-200 day:bg-white border-b border-white/15 bg-transparent px-4 py-5 first:border-t sm:px-5"
              >
                <summary className="day:text-gray-900 flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-white marker:content-none">
                  {item.question}
                  <span
                    className="text-xl leading-none text-[#cfac6c] transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="day:text-gray-600 mt-3 max-w-3xl text-sm leading-6 text-gray-300">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="day:border-gray-200 day:bg-white relative overflow-hidden border-t border-white/10 bg-[#101010] py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="day:text-amber-700 text-xs font-semibold tracking-[0.22em] text-[#cfac6c] uppercase">
                Need a hand?
              </p>
              <h2 className="day:text-gray-900 mt-2 font-serif text-2xl leading-tight text-white sm:text-3xl">
                Get Help Choosing a Headstone, Plaque, or Memorial
              </h2>
              <p className="day:text-gray-600 mt-2 text-sm leading-6 text-gray-300">
                We can help with choosing a memorial, materials, wording, and
                the next step when you are ready.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
              <a
                href="mailto:admin@bronze-plaque.com?subject=Memorial%20Design%20Help"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#cfac6c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d7b979]"
              >
                Contact us
              </a>
              <Link
                href="/designs"
                className="day:border-gray-300 day:text-gray-800 day:hover:bg-gray-50 inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#cfac6c]/60 hover:bg-white/5"
              >
                Browse Designs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="day:bg-gray-100 day:border-gray-200 relative border-t border-[#d4af37]/20 bg-[#050402]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="day:text-gray-900 grid grid-cols-1 gap-10 text-white sm:grid-cols-2 lg:grid-cols-[1fr_0.75fr_0.85fr_2.1fr]">
            <div>
              <div className="flex items-center gap-3 font-serif text-2xl">
                <span className="tracking-wide">Forever Shining</span>
              </div>
              <Image
                src="/webp/forever-logo.webp"
                alt="Forever Shining - Design Online"
                width={200}
                height={120}
                className="mt-4 h-[100px] w-auto select-none"
                sizes="167px"
                draggable={false}
              />
              <p className="day:text-gray-600 mt-4 text-sm text-white/70">
                Crafting lasting tributes for families around the world since
                2005.
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm">
                <a
                  href="https://www.instagram.com/forevershiningaus/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Forever Shining on Instagram"
                  className="day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
                >
                  <span aria-hidden="true">IG</span>
                </a>
                <a
                  href="https://www.facebook.com/ForeverShiningAustralia/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Forever Shining on Facebook"
                  className="day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
                >
                  <span aria-hidden="true">FB</span>
                </a>
                <a
                  href="https://www.pinterest.com/forevershining1/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Forever Shining on Pinterest"
                  className="day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
                >
                  <span aria-hidden="true">PI</span>
                </a>
                <a
                  href="https://twitter.com/ForeverShiningA"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Forever Shining on X"
                  className="day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
                >
                  <span aria-hidden="true">X</span>
                </a>
                <a
                  href="https://www.youtube.com/@forevershining/featured"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Forever Shining on YouTube"
                  className="day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
                >
                  <span aria-hidden="true">YT</span>
                </a>
              </div>
            </div>

            <div>
              <p className="day:text-amber-700 font-serif text-sm tracking-[0.4em] text-[#f3d48f] uppercase">
                Memorials
              </p>
              <ul className="day:text-gray-600 mt-4 space-y-2 text-sm text-white/70">
                <li>
                  <Link
                    href="/memorials/headstones"
                    className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                  >
                    Headstones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/memorials/plaques"
                    className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                  >
                    Plaques
                  </Link>
                </li>
                <li>
                  <Link
                    href="/memorials/urns"
                    className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                  >
                    Urns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/memorials/full-monuments"
                    className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                  >
                    Full Monuments
                  </Link>
                </li>
                <li>
                  <Link
                    href="/memorials/pet-memorials"
                    className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                  >
                    Pet Memorials
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="day:text-amber-700 font-serif text-sm tracking-[0.4em] text-[#f3d48f] uppercase">
                Help & Guides
              </p>
              <ul className="day:text-gray-600 mt-4 space-y-2 text-sm text-white/70">
                <li>
                  <a
                    href="#how-it-works"
                    className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                  >
                    How it Works
                  </a>
                </li>
                <li>
                  <Link
                    href="/designs/guide/pricing"
                    className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                  >
                    Pricing Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="/designs/guide/buying-guide"
                    className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                  >
                    Buying Guide
                  </Link>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:min-w-0">
              <p className="day:text-amber-700 font-serif text-sm tracking-[0.4em] text-[#f3d48f] uppercase">
                Get in Touch
              </p>
              <div className="day:text-gray-600 mt-4 text-sm text-white/80">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <a
                      href="tel:+16473880931"
                      className="day:text-gray-900 day:hover:text-amber-600 cursor-pointer text-lg font-semibold text-white transition-colors hover:text-[#f3d48f]"
                    >
                      (+1) 647 388 0931
                    </a>
                    <p className="day:text-gray-600 mt-2 text-white/70">
                      <a
                        href="mailto:admin@bronze-plaque.com"
                        className="day:hover:text-amber-600 cursor-pointer transition-colors hover:text-[#f3d48f]"
                      >
                        admin@bronze-plaque.com
                      </a>
                    </p>
                    <p className="day:text-gray-600 mt-2 leading-relaxed text-white/70">
                      1101 Eagle Ridge Drive
                      <br />
                      Oshawa Ontario L1K 0L8
                    </p>
                  </div>
                  <div className="day:border-gray-200 border-t border-white/10 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
                    <a
                      href="tel:+61861910396"
                      className="day:text-gray-900 day:hover:text-amber-600 cursor-pointer text-lg font-semibold text-white transition-colors hover:text-[#f3d48f]"
                    >
                      +61 8 6191 0396
                    </a>
                    <p className="day:text-gray-600 mt-2 text-white/70">
                      <a
                        href="mailto:admin@forevershining.com.au"
                        className="day:hover:text-amber-600 cursor-pointer transition-colors hover:text-[#f3d48f]"
                      >
                        admin@forevershining.com.au
                      </a>
                    </p>
                    <p className="day:text-gray-600 mt-2 leading-relaxed text-white/70">
                      1/44 Port Kembla Dve
                      <br />
                      Bibra Lake WA 6163
                    </p>
                  </div>
                </div>
                <p className="day:text-gray-500 mt-4 leading-relaxed text-white/60">
                  Serving families across the United States and Canada, with
                  international support available for Australia and Europe.
                </p>
              </div>
            </div>
          </div>

          <div className="day:border-gray-200 day:text-gray-500 mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row">
            <p>© 2026 Forever Shining. All rights reserved.</p>
            <div className="day:text-gray-600 flex items-center gap-4 text-sm text-white/70">
              <Link
                href="/privacy"
                className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
              <span className="day:text-gray-300 text-white/40">|</span>
              <a
                href="mailto:admin@bronze-plaque.com?subject=Terms%20of%20Service%20Request"
                className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
              >
                Request Terms
              </a>
              <span className="day:text-gray-300 text-white/40">|</span>
              <a
                href="/sitemap.xml"
                className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
              >
                Sitemap
              </a>
            </div>
          </div>

          <div className="day:text-gray-400 mt-4 flex flex-col items-center justify-between gap-3 text-[11px] text-white/45 md:flex-row">
            <div className="flex flex-wrap items-center gap-2">
              <span className="day:text-gray-500 text-white/55">Partners:</span>
              <a
                href="https://www.bronze-plaque.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="day:hover:text-gray-700 cursor-pointer hover:text-white"
              >
                Bronze-Plaque.com
              </a>
              <span>•</span>
              <a
                href="https://headstonesdesigner.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="day:hover:text-gray-700 cursor-pointer hover:text-white"
              >
                HeadstonesDesigner.com
              </a>
              <span>•</span>
              <a
                href="https://www.forevershining.com.au/"
                target="_blank"
                rel="noopener noreferrer"
                className="day:hover:text-gray-700 cursor-pointer hover:text-white"
              >
                Forever Shining Australia
              </a>
            </div>
            <div className="day:text-gray-500 flex items-center gap-3 text-white/55">
              <span className="tracking-widest">VISA</span>
              <span className="tracking-widest">MC</span>
              <span className="tracking-widest">PayPal</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
