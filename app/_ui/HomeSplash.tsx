'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, MouseEvent } from 'react';
import {
  ArrowRightIcon,
  Bars3Icon,
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '#/components/ThemeProvider';

const MEMORIAL_LINKS = [
  { label: 'Headstones', href: '/memorials/headstones' },
  { label: 'Plaques', href: '/memorials/plaques' },
  { label: 'Full Monuments', href: '/memorials/full-monuments' },
  { label: 'Urns', href: '/memorials/urns' },
  { label: 'Pet Memorials', href: '/memorials/pet-memorials' },
] as const;

const HeroCanvas = dynamic(() => import('#/components/HeroCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
    </div>
  ),
});

const HASH_MODAL_CONTENT = {
  contact: {
    eyebrow: 'Personal Support',
    title: 'Talk with a Designer',
    description: 'Our memorial specialists are available every day to guide you through sizing, materials, and wording.',
    bullets: [
      'Call us at +61 8 6191 0396 for guidance on sizing, materials, and cemetery requirements.',
      'Email admin@forevershining.com.au for a written response within one business day.',
      'Book a complimentary screen-share to co-design live with your family.'
    ],
    links: [
      { label: 'Call Now', href: 'tel:+61861910396' },
      { label: 'Email Support', href: 'mailto:admin@forevershining.com.au' }
    ]
  },
  headstones: {
    eyebrow: 'Memorial Types',
    title: 'Custom Headstones',
    description: 'Preview upright, serpentine, and slant silhouettes in real-time 3D, complete with bases and vases.',
    bullets: [
      'Mix 40+ shapes with granite or bronze finishes.',
      'Dial in exact width, height, and depth in millimetres.',
      'Export proofs to share with family before you approve production.'
    ]
  },
  plaques: {
    eyebrow: 'Memorial Types',
    title: 'Garden & Wall Plaques',
    description: 'Design bronze or granite plaques for gardens, walls, mausoleums, or cremation memorials.',
    bullets: [
      'Choose from beveled, book, and scroll layouts.',
      'Add photo etchings, emblems, or raised bronze letters.',
      'Generate instant pricing for single or companion layouts.'
    ]
  },
  urns: {
    eyebrow: 'Memorial Types',
    title: 'Urns & Keepsakes',
    description: 'Coordinate urn colors, engravings, and motif placement with the rest of your memorial design.',
    bullets: [
      'Preview indoor and outdoor safe finishes.',
      'Add inscriptions, dates, and iconography in seconds.',
      'Match granite, marble, or metal textures to an existing monument.'
    ]
  },
  monuments: {
    eyebrow: 'Memorial Types',
    title: 'Full Monument Sets',
    description: 'Plan coordinated uprights, kerbs, covers, and accessories for family estates.',
    bullets: [
      'Combine bases, tablets, vases, statues, and lighting.',
      'Model custom sizes for council or cemetery guidelines.',
      'Share 3D walkthroughs with extended family for quick approvals.'
    ]
  },
  pets: {
    eyebrow: 'Memorial Types',
    title: 'Pet Memorials',
    description: 'Create heartfelt garden markers, plaques, and urns that celebrate beloved companions.',
    bullets: [
      'Pick playful motifs—paw prints, hearts, and florals.',
      'Upload photos for laser or sandblast etching.',
      'Order lightweight plaques with delivery options across Australia, the United States, Canada, and Europe.'
    ]
  },
  'how-it-works': {
    eyebrow: 'Guided Flow',
    title: 'How the Studio Works',
    description: 'A three-step workflow keeps your family in sync from inspiration to final approval.',
    bullets: [
      'Step 1: Choose product, shape, and material with real-time previews.',
      'Step 2: Personalize inscriptions, motifs, and additions with live pricing.',
      'Step 3: Share proofs, lock pricing, and hand off to production when ready.'
    ]
  },
  pricing: {
    eyebrow: 'Transparency',
    title: 'Pricing Guide',
    description: 'See every component—headstone, base, inscriptions, motifs, freight—before you place an order.',
    bullets: [
      'Live calculator updates as you change dimensions or finishes.',
      'Optional services (installation, foundation, shipping) itemized clearly.',
      'Download quotes or send a secure payment link when the family approves.'
    ]
  },
  materials: {
    eyebrow: 'Material Library',
    title: 'Granite, Bronze & More',
    description: 'Browse calibrated swatches for Glory Black, Blue Pearl, Bahama Blue, bronze finishes, and ceramic photos.',
    bullets: [
      'Compare polished, honed, rock-pitched, and steeled textures.',
      'Preview weathering and contrast for each inscription style.',
      'Lock preferred materials to keep future edits on-brand.'
    ]
  },
  faq: {
    eyebrow: 'Common Questions',
    title: 'Frequently Asked Questions',
    description: 'Get instant answers about shipping, cemetery approvals, photo requirements, and payment schedules.',
    bullets: [
      'Understand proofing timelines and how many revisions are included.',
      'Learn how we handle cemetery permits and installation coordination.',
      'See engraving, etching, and ceramic photo care instructions.'
    ]
  },
  privacy: {
    eyebrow: 'Policy Snapshot',
    title: 'Privacy Practices',
    description: 'We only store the information needed to save your designs and process approved orders.',
    bullets: [
      'Design files stay encrypted at rest and are deleted on request.',
      'Payment data is handled by PCI-compliant processors; we never store card numbers.',
      'You can export or purge personal data by emailing admin@forevershining.com.au.'
    ],
    links: [{ label: 'Request Full Policy', href: 'mailto:admin@forevershining.com.au?subject=Privacy%20Policy%20Request' }]
  },
  terms: {
    eyebrow: 'Policy Snapshot',
    title: 'Terms of Service',
    description: 'Review the expectations around artwork approval, payment milestones, and cancellation windows.',
    bullets: [
      'Orders enter production only after you sign off on the final proof.',
      '50% deposits are refundable until materials are cut; after that we credit future work.',
      'Manufacturing timelines average 6–10 weeks, depending on material availability.'
    ],
    links: [{ label: 'Request Full Terms', href: 'mailto:admin@forevershining.com.au?subject=Terms%20of%20Service%20Request' }]
  },
  sitemap: {
    eyebrow: 'Navigation',
    title: 'Site Overview',
    description: 'Jump directly to the most visited flows in the studio experience.',
    bullets: [
      'Select Product → Shape → Material → Size → Personalize → Check Price.',
      'Saved Designs: resume drafts from any device in seconds.',
      'Support Center: chat, schedule a call, or download buyer guides.'
    ],
    links: [
      { label: 'Start Designing', href: '/select-product' },
      { label: 'Resume a Saved Design', href: '/designs' }
    ]
  }
} as const;

type HashModalKey = keyof typeof HASH_MODAL_CONTENT;
type HashModalContent = (typeof HASH_MODAL_CONTENT)[HashModalKey];
type HashModalLink = { label: string; href: string };

const hasModalLinks = (
  content: HashModalContent,
): content is HashModalContent & { links: readonly HashModalLink[] } =>
  'links' in content && Array.isArray(content.links);

export default function HomeSplash() {
  const { theme, toggleTheme } = useTheme();
  const [showHeroCanvas, setShowHeroCanvas] = useState(false);
  const [heroCanvasReady, setHeroCanvasReady] = useState(false);
  const [heroCanvasInViewport, setHeroCanvasInViewport] = useState(true);
  const heroCanvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [activeModal, setActiveModal] = useState<HashModalKey | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleHashLink = (slug: HashModalKey) => (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setActiveModal(slug);
  };

  const closeModal = () => setActiveModal(null);
  const activeModalContent = activeModal ? HASH_MODAL_CONTENT[activeModal] : null;

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => setShowHeroCanvas(true), 1200);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const container = heroCanvasContainerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setHeroCanvasInViewport(isVisible);
        if (!isVisible) {
          setHeroCanvasReady(false);
        }
      },
      { root: null, threshold: 0.01 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!activeModal) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  // Mobile menu: close on Escape and lock body scroll while open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const rotateLeft = () => {
    setRotation((prev) => prev + Math.PI / 4);
  };

  const rotateRight = () => {
    setRotation((prev) => prev - Math.PI / 4);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: 'radial-gradient(circle at 50% 100%, #3E3020 0%, #121212 60%)' }}
    >
      
      {/* Hero Section - Full Viewport Layout */}
      <div className="relative flex min-h-0 flex-col overflow-hidden sm:min-h-screen" role="banner">
        
        {/* Responsive Header - Absolute top */}
        <header className="absolute top-0 left-0 right-0 z-50 px-4 py-3 sm:px-6 sm:py-4" style={{ caretColor: 'transparent' }}>
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-5 xl:gap-8">
            {/* Logo - Responsive width, aligned left */}
            <div
              className="w-52 shrink-0 sm:w-56 md:w-64 transition-all select-none pointer-events-none"
            style={{ caretColor: 'transparent', userSelect: 'none' }}
          >
            <Image 
              src="/ico/forever-transparent-logo.png" 
              alt="Forever Shining - Design Online" 
              width={320}
              height={100}
              className="w-full h-auto select-none"
              priority
              quality={75}
              sizes="(min-width: 768px) 288px, (min-width: 640px) 224px, 208px"
              draggable={false}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            />
          </div>

            <nav className="hidden flex-1 xl:block" aria-label="Memorial product pages">
              <ul className="flex items-center justify-center gap-5 whitespace-nowrap text-sm font-semibold text-white/90">
                {MEMORIAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-[#f3d48f]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="hidden shrink-0 items-center gap-2 xl:flex" aria-label="Design actions">
              <Link
                href="/designs"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-white/[0.08] text-white transition-colors hover:border-[#cfac6c]/80 hover:bg-white/15 hover:text-[#f3d48f]"
                aria-label="Search memorial designs"
              >
                <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
              </Link>
            <Link
              href="/designs"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/30 bg-white/[0.08] px-4 text-sm font-semibold text-white transition-colors hover:border-[#cfac6c]/80 hover:bg-white/15 hover:text-[#f3d48f]"
            >
              Browse Designs
            </Link>
            </nav>

            {/* Menu button for all breakpoints below the full desktop navigation. */}
            <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="shrink-0 rounded-lg border border-white/30 bg-white/[0.08] p-2 text-white backdrop-blur-sm transition-colors hover:border-[#cfac6c]/80 xl:hidden"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] xl:hidden" role="dialog" aria-modal="true" aria-label="Site menu">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto border-b border-[#d4af37]/25 bg-[#0d0a06]/95 pb-6 shadow-2xl backdrop-blur-md">
              {/* Match the home header so the logo and close button stay in
                  exactly the same place when the mobile menu opens. */}
              <div className="flex items-center justify-between gap-5 px-4 py-3">
                <div className="w-52 select-none pointer-events-none">
                  <Image
                    src="/ico/forever-transparent-logo.png"
                    alt="Forever Shining"
                    width={320}
                    height={100}
                    className="h-auto w-full select-none"
                    sizes="208px"
                    draggable={false}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="shrink-0 rounded-lg border border-white/15 bg-white/[0.06] p-2 text-white backdrop-blur-sm transition-colors hover:border-[#cfac6c]/60"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <p className="mt-6 px-5 text-[11px] font-semibold tracking-[0.24em] text-[#f3d48f] uppercase">
                Memorials
              </p>
              <nav className="mt-2 flex flex-col px-5" aria-label="Memorial product pages">
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
      
        {/* Background Layers */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ 
            backgroundImage: 'url(/backgrounds/tree-2916763_1920.webp)',
            filter: 'blur(1px) saturate(0.9) brightness(0.76)',
            transform: 'scale(1)'
          }}
          role="presentation"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071a31]/75 via-[#08243b]/38 to-[#06120d]/26" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(255,255,255,0.1),transparent_38%)]" aria-hidden="true" />
        
        {/* Main Content - Flex Grow to Center Vertically */}
        <div className="relative z-10 flex flex-col justify-start flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-[130px] sm:pt-[116px]">
          <div className="flex flex-col text-center">
            
            {/* Headline - Connect the live design to the crafted memorial */}
            <h1 className="order-1 !mb-0 !pb-0 text-3xl font-playfair-display tracking-tight sm:text-5xl leading-tight">
              <span
                className="inline-block font-semibold text-[2rem] sm:text-5xl mx-auto"
                style={{ 
                  color: '#FFFEF8',
                  textShadow: '0 1px 1px rgba(0,0,0,2), 0 4px 24px rgba(0,0,0,0)'
                }}
              >
                You design it. We craft it.
              </span>
            </h1>
            <p
              className="order-2 mx-auto mt-3 max-w-2xl text-lg font-normal leading-snug sm:text-2xl md:mb-6"
              style={{ 
                color: '#FFFFFF',
                textShadow: '0 1px 1px rgba(0,0,0,0.2), 0 4px 20px rgba(0,0,0,0)'
              }}
            >
              Design a lasting memorial online.
              <br />
              See every detail in 3D before we craft it.
            </p>
            
            {/* 3D Canvas - TALLER container with overlap layout */}
            <div
              ref={heroCanvasContainerRef}
              className="order-3 w-full h-[40vh] sm:h-[57vh] min-h-[330px] sm:min-h-[430px] flex items-center justify-center relative -mt-2 -mb-10 translate-y-[30px] sm:order-5 sm:-mt-5 sm:-mb-28 z-0 pointer-events-none"
            >
              
              {/* Soft product lift without darkening the stone preview */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[62vh] h-[62vh] bg-gradient-radial from-white/16 via-white/5 to-transparent rounded-full blur-3xl"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[44vh] h-[44vh] bg-gradient-radial from-[#cfac6c]/22 via-[#cfac6c]/8 to-transparent rounded-full blur-2xl"></div>
              </div>
              
              {/* The Canvas Itself - Re-enable pointer events for the canvas specifically */}
              <div className="w-full h-full pointer-events-auto">
                {showHeroCanvas && heroCanvasInViewport ? (
                  <div
                    className={`h-full w-full transition-all duration-500 ease-out ${heroCanvasReady ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                      transform: heroCanvasReady ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
                    }}
                  >
                    <HeroCanvas rotation={rotation} onReady={() => setHeroCanvasReady(true)} />
                  </div>
                ) : heroCanvasInViewport ? (
                  <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
                  </div>
                ) : (
                  null
                )}
                {/* Rotation Controls - Subtle, elegant chevrons */}
                {showHeroCanvas && heroCanvasInViewport && heroCanvasReady && (
                  <>
                    <button 
                      onClick={rotateLeft}
                      className="absolute left-[5%] sm:left-[15%] md:left-[calc(50%-270px)] top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-white/45 bg-[#0b1622]/85 text-white shadow-lg shadow-black/30 backdrop-blur-md transition-colors hover:border-[#cfac6c] hover:bg-[#cfac6c] hover:text-slate-950"
                      aria-label="Rotate headstone left to view different angles"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                      onClick={rotateRight}
                      className="absolute right-[5%] sm:right-[15%] md:right-[calc(50%-270px)] top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-white/45 bg-[#0b1622]/85 text-white shadow-lg shadow-black/30 backdrop-blur-md transition-colors hover:border-[#cfac6c] hover:bg-[#cfac6c] hover:text-slate-950"
                      aria-label="Rotate headstone right to view different angles"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* CTAs - z-index ensures they sit ON TOP of canvas bottom area */}
            <div className="order-4 relative z-20 mb-4 flex flex-col items-center gap-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <Link
                  href="/select-product"
                  prefetch={false}
                  className="inline-flex w-auto items-center justify-center gap-2 rounded-lg bg-[#cfac6c] px-7 py-3.5 text-center text-sm font-semibold tracking-wide text-slate-950 transition-colors hover:bg-[#d7b979] sm:px-10 sm:py-4 sm:text-base"
                  aria-label="Start designing a memorial in 3D"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Start Designing in 3D
                  <ArrowRightIcon className="relative top-px h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex w-auto items-center justify-center rounded-lg border-2 border-white/65 bg-white/15 px-7 py-3.5 text-center text-sm font-semibold tracking-wide text-white shadow-lg shadow-black/15 backdrop-blur-sm transition-colors hover:border-[#cfac6c] hover:bg-white/25 sm:px-10 sm:py-4 sm:text-base"
                >
                  See How It Works
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      <section className="relative border-b border-white/10 bg-[#0b0b0b] day:border-gray-200 day:bg-white" aria-label="Designer benefits">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {[
            {
              icon: ComputerDesktopIcon,
              title: 'Design online in 3D',
              description: 'See your memorial take shape as you create.',
            },
            {
              icon: PencilSquareIcon,
              title: 'Make every detail personal',
              description: 'Choose words, photos, motifs, and materials.',
            },
            {
              icon: CurrencyDollarIcon,
              title: 'See pricing as you design',
              description: 'Make informed choices before you move forward.',
            },
            {
              icon: HeartIcon,
              title: 'Crafted with care',
              description: 'Take your time, then share a proof with family.',
            },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-3 py-5 sm:py-6">
              <Icon className="mt-0.5 h-6 w-6 shrink-0 text-[#cfac6c]" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-white day:text-gray-900">{title}</p>
                <p className="mt-1 text-xs leading-5 text-gray-400 day:text-gray-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section - How It Works */}
      <section
        id="how-it-works"
        className="relative overflow-hidden border-t border-white/10 bg-[#0b0b0b] py-16 day:border-gray-200 day:bg-stone-100"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold tracking-[0.28em] text-[#cfac6c] uppercase day:text-amber-700">
                  Created from experience
                </p>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === 'day' ? 'Switch to night mode' : 'Switch to day mode'}
                  title={theme === 'day' ? 'Night mode' : 'Day mode'}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#1a1208]/80 text-white/60 shadow-md backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-[#1a1208]/95 hover:text-white day:border-[#D7B356]/50 day:bg-white/90 day:text-amber-700 day:hover:border-[#D7B356]/80 day:hover:bg-white day:hover:text-amber-800 md:hidden"
                >
                  {theme === 'day' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
                </button>
              </div>
              <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-[1.22] text-white sm:text-4xl day:text-gray-900">
                Forever Shining gently guides you from the first choice to the final proof
              </h2>
              <p className="mt-5 text-sm font-semibold text-[#f3d48f] day:text-amber-700">
                Creating lasting tributes since 2005
              </p>
              <p className="mt-4 max-w-xl text-base leading-7 text-gray-300 day:text-gray-600">
                Design a memorial with clarity and care, at a pace that feels right for your family. See every decision in 3D before moving forward.
              </p>

              <ul className="mt-5 space-y-3 text-sm font-medium text-gray-300 day:text-gray-600">
                {['Begin without pressure', 'See every change in 3D', 'Save and share with family'].map((item) => (
                  <li key={item} className="flex items-center gap-3.5 leading-5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#cfac6c]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/select-product"
                  prefetch={false}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#cfac6c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d7b979]"
                >
                  Start Designing in 3D
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/designs"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/45 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#cfac6c]/80 hover:bg-white/12 day:border-gray-300 day:text-gray-800 day:hover:bg-white"
                >
                  Browse Designs
                </Link>
              </div>
            </div>

            <Link
              href="/select-product"
              prefetch={false}
              aria-label="Open the 3D memorial designer"
              className="group relative block overflow-hidden rounded-2xl border border-white/25 bg-[#17120d] shadow-[0_24px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.1] transition-transform duration-500 hover:-translate-y-1 day:border-gray-300 day:ring-gray-200"
            >
              <div className="relative aspect-[21/10] overflow-hidden">
                <Image
                  src="/screenshots/designer-3d-preview.webp"
                  alt="The Forever Shining 3D memorial designer showing a personalised headstone"
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                />

                <div className="absolute right-4 top-4 rounded-full border border-white/25 bg-[#17120d]/90 px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-[#f3d48f] uppercase shadow-md backdrop-blur-sm sm:right-5 sm:top-5">
                  Live 3D preview
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Personalisation Showcase */}
      <section className="relative overflow-hidden bg-[#f4f1eb] py-16 day:bg-[#f4f1eb]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.24em] text-[#a77d32] uppercase">
                Made personal
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-[#1d1a17] sm:text-4xl">
                Bring every meaningful detail together
              </h2>
              <p className="mt-3 text-base leading-7 text-[#625a51]">
                Explore the shape, inscription, imagery, and finish until the memorial feels like the right reflection of their life.
              </p>
              <Link
                href="/designs"
                className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#302719] transition-colors hover:text-[#a77d32]"
              >
                Explore memorial designs
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-3">
            <article className="group overflow-hidden rounded-2xl border border-black/5 bg-[#211e1a] shadow-sm">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#e3d8c8]">
                <Image
                  src="/visuals/memorial-shape-studio.webp"
                  alt="A refined black granite memorial in a studio setting"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
              <div className="p-5 text-white">
                <p className="text-lg font-semibold">Shape a lasting tribute</p>
                <p className="mt-1 text-sm leading-6 text-white/70">Explore form, inscriptions, and meaningful motifs in one considered design.</p>
              </div>
            </article>

            <article className="group overflow-hidden rounded-2xl border border-black/5 bg-[#211e1a] shadow-sm">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#e3d8c8]">
                <Image
                  src="/visuals/memorial-photo-detail-studio.webp"
                  alt="A ceramic memorial portrait and vase in a studio setting"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
              <div className="p-5 text-white">
                <p className="font-semibold">Add a cherished photo</p>
                <p className="mt-1 text-sm leading-6 text-white/70">Keep a familiar face close in a beautifully finished memorial detail.</p>
              </div>
            </article>

            <article className="group overflow-hidden rounded-2xl border border-black/5 bg-[#211e1a] shadow-sm">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#e3d8c8]">
                <Image
                  src="/visuals/memorial-finishes-studio.webp"
                  alt="Polished black and honed gray granite finish samples"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
              <div className="p-5 text-white">
                <p className="font-semibold">Choose a lasting finish</p>
                <p className="mt-1 text-sm leading-6 text-white/70">Compare granite tones and finishes until every choice feels right.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section
        className="relative overflow-hidden border-t border-white/10 bg-[#101010] py-10 day:border-gray-200 day:bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.22em] text-[#cfac6c] uppercase day:text-amber-700">
                Need a hand?
              </p>
              <h2 className="mt-2 font-serif text-2xl leading-tight text-white sm:text-3xl day:text-gray-900">
                Talk through your options with a memorial specialist
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-300 day:text-gray-600">
                We can help with choosing a memorial, materials, wording, and the next step when you are ready.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
              <a
                href="https://www.forevershining.com.au/contact/"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#cfac6c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d7b979]"
              >
                Contact us
              </a>
              <Link
                href="/designs"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#cfac6c]/60 hover:bg-white/5 day:border-gray-300 day:text-gray-800 day:hover:bg-gray-50"
              >
                Browse Designs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="relative bg-[#050402] border-t border-[#d4af37]/20 day:bg-gray-100 day:border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_0.75fr_0.85fr_2.1fr] gap-10 text-white day:text-gray-900">
            <div>
              <div className="flex items-center gap-3 text-2xl font-serif">
                <span className="tracking-wide">Forever Shining</span>
              </div>
              <p className="mt-4 text-sm text-white/70 day:text-gray-600">
                Crafting lasting tributes for families around the world since 2005.
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm">
                <a href="https://www.instagram.com/forevershiningaus/" target="_blank" rel="noreferrer" aria-label="Forever Shining on Instagram" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors cursor-pointer day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600">
                  <span aria-hidden="true">IG</span>
                </a>
                <a href="https://www.facebook.com/ForeverShiningAustralia/" target="_blank" rel="noreferrer" aria-label="Forever Shining on Facebook" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors cursor-pointer day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600">
                  <span aria-hidden="true">FB</span>
                </a>
                <a href="https://www.pinterest.com/forevershining1/" target="_blank" rel="noreferrer" aria-label="Forever Shining on Pinterest" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors cursor-pointer day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600">
                  <span aria-hidden="true">PI</span>
                </a>
                <a href="https://twitter.com/ForeverShiningA" target="_blank" rel="noreferrer" aria-label="Forever Shining on X" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors cursor-pointer day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600">
                  <span aria-hidden="true">X</span>
                </a>
                <a href="https://www.youtube.com/@forevershining/featured" target="_blank" rel="noreferrer" aria-label="Forever Shining on YouTube" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors cursor-pointer day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600">
                  <span aria-hidden="true">YT</span>
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-serif tracking-[0.4em] text-[#f3d48f] uppercase day:text-amber-700">Memorials</p>
              <ul className="mt-4 space-y-2 text-sm text-white/70 day:text-gray-600">
                <li><Link href="/memorials/headstones" className="hover:text-white transition-colors cursor-pointer day:hover:text-gray-900">Headstones</Link></li>
                <li><Link href="/memorials/plaques" className="hover:text-white transition-colors cursor-pointer day:hover:text-gray-900">Plaques</Link></li>
                <li><Link href="/memorials/urns" className="hover:text-white transition-colors cursor-pointer day:hover:text-gray-900">Urns</Link></li>
                <li><Link href="/memorials/full-monuments" className="hover:text-white transition-colors cursor-pointer day:hover:text-gray-900">Full Monuments</Link></li>
                <li><Link href="/memorials/pet-memorials" className="hover:text-white transition-colors cursor-pointer day:hover:text-gray-900">Pet Memorials</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-serif tracking-[0.4em] text-[#f3d48f] uppercase day:text-amber-700">Help & Guides</p>
              <ul className="mt-4 space-y-2 text-sm text-white/70 day:text-gray-600">
                <li><a href="#how-it-works" onClick={handleHashLink('how-it-works')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer day:hover:text-gray-900">How it Works</a></li>
                <li><a href="#pricing" onClick={handleHashLink('pricing')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer day:hover:text-gray-900">Pricing Guide</a></li>
                <li><a href="#materials" onClick={handleHashLink('materials')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer day:hover:text-gray-900">Material Guide</a></li>
                <li><a href="#faq" onClick={handleHashLink('faq')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer day:hover:text-gray-900">FAQ</a></li>
              </ul>
            </div>

            <div className="lg:min-w-0">
              <p className="text-sm font-serif tracking-[0.4em] text-[#f3d48f] uppercase day:text-amber-700">Get in Touch</p>
              <div className="mt-4 text-sm text-white/80 day:text-gray-600">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <a href="tel:+16473880931" className="text-lg font-semibold text-white hover:text-[#f3d48f] transition-colors cursor-pointer day:text-gray-900 day:hover:text-amber-600">(+1) 647 388 0931</a>
                    <p className="mt-2 text-white/70 day:text-gray-600">
                      <a href="mailto:admin@bronze-plaque.com" className="hover:text-[#f3d48f] transition-colors cursor-pointer day:hover:text-amber-600">admin@bronze-plaque.com</a>
                    </p>
                    <p className="mt-2 text-white/70 leading-relaxed day:text-gray-600">
                      1101 Eagle Ridge Drive<br />Oshawa Ontario L1K 0L8
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 day:border-gray-200">
                  <a href="tel:+61861910396" className="text-lg font-semibold text-white hover:text-[#f3d48f] transition-colors cursor-pointer day:text-gray-900 day:hover:text-amber-600">+61 8 6191 0396</a>
                  <p className="mt-2 text-white/70 day:text-gray-600">
                    <a href="mailto:admin@forevershining.com.au" className="hover:text-[#f3d48f] transition-colors cursor-pointer day:hover:text-amber-600">admin@forevershining.com.au</a>
                  </p>
                  <p className="mt-2 text-white/70 leading-relaxed day:text-gray-600">
                    1/44 Port Kembla Dve<br />Bibra Lake WA 6163
                  </p>
                  </div>
                </div>
                <p className="mt-4 text-white/60 leading-relaxed day:text-gray-500">
                  Serving Australia, the United States, Canada, and Europe for Bronze Plaques, Memorial Plaques, and Headstones.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60 day:border-gray-200 day:text-gray-500">
            <p>© 2026 Forever Shining. All rights reserved.</p>
            <div className="flex items-center gap-4 text-white/70 text-sm day:text-gray-600">
              <a href="#privacy" onClick={handleHashLink('privacy')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer day:hover:text-gray-900">Privacy Policy</a>
              <span className="text-white/40 day:text-gray-300">|</span>
              <a href="#terms" onClick={handleHashLink('terms')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer day:hover:text-gray-900">Terms of Service</a>
              <span className="text-white/40 day:text-gray-300">|</span>
              <a href="#sitemap" onClick={handleHashLink('sitemap')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer day:hover:text-gray-900">Sitemap</a>
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-white/45 day:text-gray-400">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-white/55 day:text-gray-500">Partners:</span>
              <a href="https://www.bronze-plaque.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer day:hover:text-gray-700">Bronze-Plaque.com</a>
              <span>•</span>
              <a href="https://headstonesdesigner.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer day:hover:text-gray-700">HeadstonesDesigner.com</a>
              <span>•</span>
              <a href="https://www.forevershining.com.au/" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer day:hover:text-gray-700">Forever Shining Australia</a>
            </div>
            <div className="flex items-center gap-3 text-white/55 day:text-gray-500">
              <span className="tracking-widest">VISA</span>
              <span className="tracking-widest">MC</span>
              <span className="tracking-widest">PayPal</span>
            </div>
          </div>
        </div>
      </footer>

      {activeModalContent && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hash-modal-title"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#d4af37]/35 bg-gradient-to-b from-[#191108]/95 via-[#120d07]/95 to-[#0a0704]/95 p-6 text-white shadow-[0_35px_90px_rgba(0,0,0,0.7)] ring-1 ring-white/10 md:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#d4af37]/18 via-[#d4af37]/6 to-transparent"
            />
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full border border-white/25 bg-black/25 p-1.5 text-white/70 transition-colors hover:border-white/60 hover:text-white cursor-pointer"
              aria-label="Close dialog"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M14 6l-8 8" />
              </svg>
            </button>
            <div className="relative">
              {activeModalContent.eyebrow && (
                <p className="mb-3 inline-flex items-center rounded-full border border-[#d4af37]/45 bg-[#d4af37]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f3d48f]">
                  {activeModalContent.eyebrow}
                </p>
              )}
              <h3 id="hash-modal-title" className="text-2xl font-serif text-white md:text-[1.75rem]">
                {activeModalContent.title}
              </h3>
              <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/85 md:text-[15px]">
                {activeModalContent.description}
              </p>
            </div>
            {activeModalContent.bullets && (
              <ul className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/85 md:p-5">
                {activeModalContent.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#d4af37]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {hasModalLinks(activeModalContent) && (
              <div className="mt-6 flex flex-wrap gap-3">
                {activeModalContent.links.map((link) => (
                  <a
                    key={link.href + link.label}
                    href={link.href}
                    className="rounded-full border border-[#d4af37]/65 bg-[#d4af37]/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d4af37]/20"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

