'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { data } from '#/app/_internal/_data';
import {
  CubeIcon,
  PencilIcon,
  Squares2X2Icon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  SparklesIcon,
  EyeIcon,
  BookmarkIcon,
} from '@heroicons/react/24/solid';

// FIX 1: Dynamic loader height to match the new responsive container logic
const HeroCanvas = dynamic(() => import('#/components/HeroCanvas'), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex items-center justify-center w-full h-[35vh] min-h-[280px] max-h-[450px]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
    </div>
  ),
});

const heroMetrics = [
  { value: '40', label: 'Headstones shapes' },
  { value: '5,284', label: 'Families supported' },
  { value: '5000+', label: 'Artful touches available' },
];

const MOTIF_CATEGORY_PICKS = ['RELIGIOUS', 'BIRDS', 'FLOWER_INSERTS', 'HEARTS'] as const;
const formatMotifLabel = (value: string) =>
  value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');

const curatedMotifOptions = (() => {
  const seen = new Set<string>();
  return MOTIF_CATEGORY_PICKS.map((name) => {
    const motif = data.motifs.find((entry) => entry.name === name && !seen.has(name));
    if (!motif) {
      return null;
    }
    seen.add(name);
    return {
      name: formatMotifLabel(motif.name),
      file: motif.img,
    };
  }).filter((option): option is { name: string; file: string } => Boolean(option));
})();

const fallbackMotifOptions = [
  { name: 'Religious', file: '/shapes/motifs/s/angel_001.png' },
  { name: 'Dove & Peace', file: '/shapes/motifs/s/dove_002.png' },
  { name: 'Floral', file: '/shapes/motifs/s/flower rose_03.png' },
];

export default function HomeSplash() {
  const router = useRouter();
  const [showCanvas, setShowCanvas] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isInViewport, setIsInViewport] = useState(true);

  // Only show canvas when on home page
  useEffect(() => {
    // Small delay to ensure any previous canvas is cleaned up
    const timer = setTimeout(() => {
      setShowCanvas(true);
    }, 200);

    return () => {
      clearTimeout(timer);
      setShowCanvas(false);
    };
  }, []);

  // Viewport visibility detection
  useEffect(() => {
    const heroSection = document.querySelector('[role="banner"]');
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger when at least 10% is visible
        rootMargin: '50px', // Start loading slightly before entering viewport
      }
    );

    observer.observe(heroSection);

    return () => {
      observer.disconnect();
    };
  }, []);

  const rotateLeft = () => {
    setRotation((prev) => prev + Math.PI / 4);
  };

  const rotateRight = () => {
    setRotation((prev) => prev - Math.PI / 4);
  };

  const howItWorksSteps = [
    {
      title: 'Choose Product',
      description: 'Select from headstones, plaques, monuments, or urns to begin.',
      icon: Squares2X2Icon,
    },
    {
      title: 'Customize Design',
      description: 'Adjust shape, granite, and sizing while the studio updates instantly.',
      icon: PencilIcon,
    },
    {
      title: 'Add Details',
      description: 'Place motifs, photos, and inscriptions to capture every memory.',
      icon: SparklesIcon,
    },
    {
      title: 'Review & Approve',
      description: 'View pricing, export proofs, and send your design for production with confidence.',
      icon: CurrencyDollarIcon,
    },
  ];

  const howItWorksHighlights = [
    { label: '3D preview', icon: EyeIcon },
    { label: 'Instant Price', icon: DocumentTextIcon },
    { label: 'Save & Share', icon: BookmarkIcon },
  ];

  const ctaHighlights = [
    {
      title: 'Design in minutes',
      copy: 'Most families align on a final concept in under 2 hours with our guided flow.',
      icon: SparklesIcon,
    },
    {
      title: 'Instant proof & quote',
      copy: 'Export a high-resolution proof and detailed pricing the moment you are ready.',
      icon: DocumentTextIcon,
    },
    {
      title: 'Personal designer support',
      copy: 'Schedule a live walkthrough with our memorial specialists whenever you need.',
      icon: EyeIcon,
    },
  ];

  const heroHighlights = [
    { primary: 'Save, edit & share', secondary: 'Your design' },
    { primary: 'Instant proof', secondary: '& pricing' },
    { primary: 'Support from', secondary: 'designers' },
  ];

  const tributeStats = [
    { label: 'Families we’ve guided', value: '5,284', detail: 'Each memorial cared for personally' },
    { label: 'Headstones shapes', value: '40', detail: 'Slant and Rock Pitch option' },
    { label: 'Meaningful accents ready', value: '5000+', detail: 'Motifs, fonts & finishes to choose from' },
  ];

  const tributeFlowChips = [
    { title: 'Choose Shape', detail: 'Select silhouettes & bases' },
    { title: 'Choose Material', detail: 'Match stone, finish & color' },
    { title: 'Personalize', detail: 'Add inscriptions, motifs & photos' },
  ];

  const ctaBullets = [
    'Share proofs instantly',
    'Invite family feedback',
    'Request a designer review',
  ];

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at 50% 100%, #3E3020 0%, #121212 60%)' }}>
      
      {/* Hero Section - Full Viewport Layout */}
      <div className="relative min-h-screen flex flex-col overflow-hidden" role="banner">
        
        {/* Responsive Header - Absolute top */}
        <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          {/* Logo - Responsive width, centered on mobile */}
          <div className="w-40 sm:w-56 md:w-72 transition-all mx-auto md:mx-0">
            <Image 
              src="/ico/forever-transparent-logo.png" 
              alt="Forever Shining - Design Online" 
              width={320}
              height={100}
              className="w-full h-auto drop-shadow-sm"
              priority
            />
          </div>

          {/* Top Right Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/designs" 
              className="text-sm font-medium text-white hover:text-[#cfac6c] transition-colors"
            >
              Browse Designs
            </Link>
            <Link 
              href="/select-product" 
              className="rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-5 py-2 text-sm font-semibold text-slate-900 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#cfac6c]/30 hover:from-[#d4af37] hover:to-[#cfac6c]"
            >
              Start Designing
            </Link>
          </nav>
        </header>
      
        {/* Background Layers */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ 
            backgroundImage: 'url(/backgrounds/tree-2916763_1920.webp)',
            filter: 'blur(4px) saturate(1) brightness(0.75)',
            transform: 'scale(1.1)'
          }}
          role="presentation"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/10" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.25),transparent_55%)] opacity-70" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:140px_140px] opacity-20 mix-blend-screen" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" aria-hidden="true" />
        
        {/* Main Content - Flex Grow to Center Vertically */}
        <div className="relative z-10 flex flex-col justify-center flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 sm:pt-24">
          <div className="text-center">
            
            {/* Headlines - Emotional benefit prioritized with elegant serif */}
            <h1 className="text-3xl font-playfair-display tracking-tight text-white sm:text-5xl mb-2 sm:mb-3 leading-tight">
              <span className="block font-semibold drop-shadow-sm text-[2rem] sm:text-5xl">Design a Lasting Tribute</span>
              <span className="block font-light drop-shadow-sm text-xl sm:text-3xl mt-4 text-gray-200">Visualize a beautiful tribute to your loved one in real-time 3D</span>
            </h1>
            <p className="text-lg drop-shadow-sm text-gray-400">
              Choose from Headstones, Plaques, Urns, or Full Monuments.<br className="hidden sm:block"/>
              Design exactly what you envision with peace of mind before you decide.
            </p>

            {/* 3D Canvas - TALLER container with overlap layout */}
            <div className="w-full h-[50vh] sm:h-[55vh] min-h-[400px] flex items-center justify-center relative -mt-4 -mb-16 sm:-mb-24 z-0 pointer-events-none">
              
              {/* Enhanced Visual Effects - Spotlight and atmosphere */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[70vh] h-[70vh] bg-gradient-radial from-black/70 via-black/35 to-transparent rounded-full blur-3xl"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[45vh] h-[45vh] bg-gradient-radial from-amber-900/30 via-amber-950/15 to-transparent rounded-full blur-2xl"></div>
              </div>
              {/* Enhanced ground shadow */}
              <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-[35vh] h-[10vh] bg-black/50 rounded-full pointer-events-none" style={{ filter: 'blur(25px)' }}></div>
              
              {/* The Canvas Itself - Re-enable pointer events for the canvas specifically */}
              <div className="w-full h-full pointer-events-auto">
              {showCanvas && isInViewport ? (
                <>
                  <HeroCanvas rotation={rotation} />
                  {/* Rotation Controls - Subtle, elegant chevrons */}
                  <button 
                    onClick={rotateLeft}
                    className="absolute left-[5%] sm:left-[15%] md:left-[calc(50%-200px)] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-[#cfac6c]/90 backdrop-blur-lg border border-white/15 text-white/70 hover:text-slate-900 flex items-center justify-center transition-all duration-300 cursor-pointer z-30 opacity-80 hover:opacity-100 hover:scale-110 shadow-lg"
                    aria-label="Rotate headstone left to view different angles"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={rotateRight}
                    className="absolute right-[5%] sm:right-[15%] md:right-[calc(50%-200px)] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-[#cfac6c]/90 backdrop-blur-lg border border-white/15 text-white/70 hover:text-slate-900 flex items-center justify-center transition-all duration-300 cursor-pointer z-30 opacity-80 hover:opacity-100 hover:scale-110 shadow-lg"
                    aria-label="Rotate headstone right to view different angles"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-white mx-auto mt-[20vh]" />
              )}
              </div>
            </div>
            
            {/* CTAs - z-index ensures they sit ON TOP of canvas bottom area */}
            <div className="flex flex-col items-center gap-3 relative z-20">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <Link
                  href="/select-product"
                  className="w-full sm:w-auto text-center group rounded-full bg-gradient-to-br from-[#d4af37] via-[#cfac6c] to-[#b89a5a] px-10 py-4 text-base font-semibold tracking-wide text-slate-900 shadow-2xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(207,172,108,0.6)] hover:from-[#e6c24d] hover:to-[#d4af37]"
                  aria-label="Start your free design"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Start Your Free Design
                </Link>
              </div>
              
              {/* Trust Badge - Save & Share Feature */}
              <div className="flex items-center gap-2 text-sm text-gray-300 mt-2">
                <svg className="w-4 h-4 text-[#cfac6c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save designs • Share with family</span>
              </div>
              
              {/* Trust Signals */}
              <div className="flex flex-col items-center gap-1 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5 text-[#d4af37]">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-white">
                    Trusted by 5,000+ families
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  No obligation · No credit card required
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Features Section - How It Works */}
      <section
        className="relative py-24 overflow-hidden border-t border-white/5"
        style={{ background: 'radial-gradient(circle at 20% 20%, #2f251d 0%, #120b05 65%)' }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70 pointer-events-none" />
        <div className="absolute -top-32 right-0 w-[28rem] h-[28rem] bg-[#d4af37]/30 blur-[180px] opacity-40 pointer-events-none" />
        <div className="absolute -bottom-32 left-0 w-[32rem] h-[32rem] bg-[#5c4033]/40 blur-[160px] opacity-40 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-xs font-semibold tracking-[0.6em] text-[#d4af37]/80 mb-4">HOW IT WORKS</p>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">
              Design a Beautiful Tribute in Minutes
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto lg:mx-0">
              Guided steps keep you focused while the 3D studio mirrors every change in real time.
              No downloads, no pressure—just clarity before you commit.
            </p>

            <div className="mt-8 w-full max-w-2xl mx-auto lg:mx-0">
              <div className="relative w-full h-56 sm:h-64 lg:h-72 rounded-[28px] overflow-hidden border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.55)]">
                <Image
                  src="/backgrounds/dyo.webp"
                  alt="Forever Shining design studio preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60" />

                <div className="absolute top-5 left-5 rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md px-4 py-3 text-left shadow-lg">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/60">Currently editing</p>
                  <p className="text-lg font-semibold text-white">Select Size</p>
                  <p className="text-[11px] text-white/70">Shape • Material • Personalize</p>
                </div>

                <div className="absolute top-5 right-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 text-right shadow-lg">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/60">Live preview</p>
                  <p className="text-lg font-semibold text-white">Step 02</p>
                  <p className="text-[11px] text-white/70">Choose Material</p>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 text-white/80 text-xs uppercase tracking-[0.3em]">
                  <div className="flex items-center justify-between">
                    <span>Real-Time Updates</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/20 overflow-hidden">
                    <span className="block h-full w-2/3 bg-gradient-to-r from-[#d4af37] via-[#cfac6c] to-transparent"></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tributeFlowChips.map((chip, idx) => (
                <div
                  key={chip.title}
                  className="py-4 text-left sm:px-2"
                >
                  <p className="text-[10px] uppercase tracking-[0.5em] text-white/50 mb-1">Step {String(idx + 1).padStart(2, '0')}</p>
                  <p className="text-lg font-serif text-white">{chip.title}</p>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">{chip.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {howItWorksHighlights.map(({ label, icon: HighlightIcon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/80 shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
                >
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-[#d4af37]">
                    <HighlightIcon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium leading-snug">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tributeStats.map(({ label, value, detail }) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-[0_20px_45px_rgba(0,0,0,0.35)]">
                  <p className="text-[11px] uppercase tracking-[0.5em] text-white/50">{label}</p>
                  <p className="text-3xl font-serif text-white mt-2">{value}</p>
                  <p className="text-xs text-white/70 mt-1">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/select-product"
                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-[#d4af37] to-[#b89a5a] px-10 py-4 text-base font-semibold tracking-wide text-slate-900 shadow-2xl transition-all hover:scale-105 hover:shadow-[0_0_35px_rgba(207,172,108,0.45)]"
              >
                Start Designing
              </Link>
              <p className="text-sm text-white/60">Free to explore • No credit card needed</p>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="relative rounded-[40px] border border-white/10 bg-gradient-to-br from-[#1b120a]/90 via-[#110903]/85 to-[#050302]/95 p-6 sm:p-10 shadow-[0_45px_90px_rgba(0,0,0,0.65)]">
              <div className="absolute inset-0 rounded-[40px] bg-[radial-gradient(circle_at_30%_10%,rgba(212,175,55,0.2),transparent_55%)] opacity-70 pointer-events-none" />
              <div className="absolute inset-0 rounded-[40px] border border-white/5 opacity-40 pointer-events-none" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.6em] text-white/50">Guided journey</p>
                    <p className="text-sm text-white/70">Shape → Material → Personalize</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#d4af37]" />
                    </span>
                    Live
                  </div>
                </div>

                {howItWorksSteps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.title}
                      className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6 sm:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.4)]"
                    >
                      <div className="flex items-start gap-5">
                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37]/40 to-transparent border border-[#d4af37]/50 text-[#f8e3b6] flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.35)]">
                            <Icon className="w-7 h-7" />
                          </div>
                          {idx < howItWorksSteps.length - 1 && (
                            <span className="mt-4 h-14 w-px bg-gradient-to-b from-[#d4af37]/60 via-white/20 to-transparent" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-2">
                            Step {String(idx + 1).padStart(2, '0')}
                          </p>
                          <h3 className="text-2xl font-serif text-white mb-2">{step.title}</h3>
                          <p className="text-sm text-white/70 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* How You Design a Memorial - Interactive State-Based Version */}
      <DesignPossibilitiesSection />

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-[#cfac6c]/20 py-24">
        <div className="absolute inset-0">
          <Image
            src="/backgrounds/dyo.webp"
            alt="Design studio background"
            fill
            className="object-cover opacity-20 blur-sm"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-[#1b120a]/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.25),transparent_55%)]"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] items-center gap-12">
          <div className="text-center lg:text-left space-y-6">
            <p className="text-xs font-semibold tracking-[0.6em] text-[#d4af37]/80">READY WHEN YOU ARE</p>
            <h2 className="text-4xl font-serif text-white leading-tight">
              Ready to Create Your Memorial?
            </h2>
            <p className="text-lg text-white/75 max-w-2xl mx-auto lg:mx-0">
              Start designing in minutes with our guided studio. Preview every detail, share proofs with family, and move to production only when you are certain.
            </p>

            <ul className="space-y-3 text-white/85">
              {ctaBullets.map((bullet) => (
                <li key={bullet} className="flex items-center justify-center lg:justify-start gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#d4af37] text-sm">•</span>
                  <span className="text-base font-medium">{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:justify-start">
              <Link
                href="/select-product"
                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-[#d4af37] to-[#b89a5a] px-10 py-4 text-base font-semibold text-slate-900 shadow-2xl transition-all hover:scale-105 hover:shadow-[0_0_35px_rgba(207,172,108,0.45)] text-center"
              >
                Start Designing Now
              </Link>
              <Link
                href="#contact"
                className="w-full sm:w-auto rounded-full border border-white/30 px-10 py-4 text-base font-semibold text-white/90 hover:border-white hover:text-white transition-colors text-center"
              >
                Talk to a Designer
              </Link>
            </div>
            <p className="text-xs text-white/60">
              Free to use · No signup required · Live support 7 days a week
            </p>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-black/40 p-8 shadow-[0_35px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ctaHighlights.map(({ title, copy, icon: Icon }) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left shadow-[0_20px_45px_rgba(0,0,0,0.35)]">
                  <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/10 text-[#d4af37] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">{title}</p>
                  <p className="text-xs text-white/70 leading-relaxed">{copy}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left text-white/85">
              <p className="text-sm italic leading-relaxed">
                “The guided studio let our family agree on every detail before we ever talked pricing. Seeing it live in 3D gave us complete confidence.”
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.4em] text-white/60">— Sarah & Liam, Perth</p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer Navigation */}
      <footer className="relative bg-black/30 backdrop-blur-sm">
        {/* Row 1 - Utility Row */}
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left: Logo */}
              <div className="flex items-center">
                <span className="text-xl font-serif font-light text-white">Forever Shining - Design online</span>
              </div>
              
              {/* Right: Partner Network */}
              <div className="text-center md:text-right">
                <p className="text-xs text-gray-400 mb-2">Our Partner Network:</p>
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-6 text-sm">
                  <a href="https://www.bronze-plaque.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                    Bronze-Plaque.com
                  </a>
                  <a href="https://headstonesdesigner.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                    HeadstonesDesigner.com
                  </a>
                  <a href="https://www.forevershining.com.au/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                    ForeverShining.com.au
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Row 2 - Legal Row */}
        <div className="border-t border-white/5 bg-black/40">
          <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
              {/* Left: Copyright */}
              <p>© 2025 Forever Shining. All rights reserved.</p>
              
              {/* Right: Legal Links */}
              <div className="flex items-center gap-4">
                <a href="#privacy" className="hover:text-gray-300 transition-colors">
                  Privacy Policy
                </a>
                <span className="text-gray-600">|</span>
                <a href="#terms" className="hover:text-gray-300 transition-colors">
                  Terms of Service
                </a>
                <span className="text-gray-600">|</span>
                <a href="#contact" className="hover:text-gray-300 transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// New interactive state-based section component
function DesignPossibilitiesSection() {
  const [activeStep, setActiveStep] = useState(1);
  const [shapeIndex, setShapeIndex] = useState(3); // Start with 'Heart'
  const [materialIndex, setMaterialIndex] = useState(0);
  const [motifIndex, setMotifIndex] = useState(0);

  const shapes = [
    { name: 'Serpentine', file: '/shapes/headstones/serpentine.svg' },
    { name: 'Gable', file: '/shapes/headstones/gable.svg' },
    { name: 'Half Round', file: '/shapes/headstones/half_round.svg' },
    { name: 'Heart', file: '/shapes/headstones/headstone_27.svg' },
  ];

  const materials = [
    { name: 'Glory Black', file: '/textures/forever/l/Glory-Black-2.webp', color: '#1a1a1a' },
    { name: 'Blue Pearl', file: '/textures/forever/l/Blue-Pearl.webp', color: '#1a2a3a' },
    { name: 'Imperial Red', file: '/textures/forever/l/Imperial-Red.webp', color: '#5c2e2e' },
  ];

  const motifOptions = curatedMotifOptions.length ? curatedMotifOptions : fallbackMotifOptions;

  const builderHighlights = [
    { label: 'Shape & monument families', value: '40+', detail: 'Serpentine, gable, heart & more' },
    { label: 'Granite, marble & bronze', value: '18 finishes', detail: 'Each calibrated for 3D preview' },
    { label: 'Motif & inscription slots', value: 'Unlimited', detail: 'Layer photos, vases & art' },
  ];

  const currentShape = shapes[shapeIndex];
  const currentMaterial = materials[materialIndex];
  const currentMotif = motifOptions[motifIndex] ?? motifOptions[0];

  const steps = [
    {
      id: 1,
      label: 'Choose Shape',
      copy: 'Switch silhouettes, add bases, and size the memorial instantly.',
      icon: Squares2X2Icon,
    },
    {
      id: 2,
      label: 'Choose Material',
      copy: 'Test Glory Black, Blue Pearl, or any custom finish with lighting.',
      icon: CubeIcon,
    },
    {
      id: 3,
      label: 'Personalize',
      copy: 'Layer inscriptions, add motifs, photos, and meaningful accents.',
      icon: SparklesIcon,
    },
    {
      id: 4,
      label: 'Design Your Own',
      copy: 'Lock the concept, export proofs, and request a designer check.',
      icon: PencilIcon,
    },
  ];

  return (
    <div
      className="relative py-24 overflow-hidden min-h-[900px] bg-[#1a140f]"
      style={{ background: 'radial-gradient(circle at 50% 40%, #2f251d 0%, #120b05 60%)' }}
    >
      {/* Decorative grid + glow */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-20" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#120b05] to-transparent z-10" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center mb-10 lg:mb-16 z-20">
          <h2 className="text-4xl md:text-5xl font-serif text-[#F9F4E8] mb-4 tracking-tight leading-tight">
            Design a Beautiful Tribute
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto font-light leading-relaxed">
            Tap the steps below to customize every detail in our 3D studio.
          </p>
        </div>

        <div className="flex w-full flex-col lg:flex-row items-center justify-center lg:gap-32">
          {/* Preview column */}
          <div className="relative w-full max-w-xl mx-auto lg:mx-0 perspective-1000">
            <div className="relative px-4 py-8 sm:px-8 lg:px-12">
              <div className="relative">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.5em] text-white/60 mb-6">
                  <span>Studio preview</span>
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#d4af37]" />
                    </span>
                    Step {String(activeStep).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                  <div className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-[11px] uppercase tracking-[0.4em] text-white/70">
                    {currentShape.name} Shape
                  </div>
                  <div className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-[11px] uppercase tracking-[0.4em] text-white/70">
                    {currentMaterial.name} Granite
                  </div>
                  <div className="rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-2 text-[11px] uppercase tracking-[0.4em] text-[#f8e3b6]">
                    Guided Mode
                  </div>
                </div>

                <div className={`relative z-10 mb-8 transition-all duration-700 ease-out ${activeStep === 1 ? 'scale-105 drop-shadow-2xl' : 'scale-100 drop-shadow-xl'}`}>
                  <div
                    className="relative w-full aspect-[1.15/1] transition-all duration-500 ease-in-out"
                    style={{
                      maskImage: `url('${currentShape.file}')`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'bottom center',
                      WebkitMaskImage: `url('${currentShape.file}')`,
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'bottom center',
                    }}
                  >
                    <div className="absolute inset-0 bg-[#1a2a3a] transition-colors duration-700" style={{ backgroundColor: currentMaterial.color }}>
                      <Image
                        src={currentMaterial.file}
                        alt={currentMaterial.name}
                        fill
                        className={`object-cover transition-transform duration-700 ${activeStep === 2 ? 'scale-125' : 'scale-100'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 mix-blend-overlay" />
                      <div className="absolute -inset-[100%] rotate-45 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-60 pointer-events-none" />
                    </div>
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-[8%] z-30 pointer-events-none">
                    <div className={`flex justify-between w-[75%] mb-2 transition-all duration-500 ${activeStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                      <div className="w-14 h-14 relative">
                        <Image
                          src="/shapes/motifs/s/dove_002.png"
                          alt="dove"
                          fill
                          className="object-contain"
                          style={{
                            filter:
                              'brightness(0) saturate(100%) invert(83%) sepia(21%) saturate(1074%) hue-rotate(357deg) brightness(102%) contrast(105%) drop-shadow(0 1px 1px rgba(0,0,0,0.8))',
                          }}
                        />
                      </div>
                      <div className="w-14 h-14 relative scale-x-[-1]">
                        <Image
                          src="/shapes/motifs/s/dove_002.png"
                          alt="dove"
                          fill
                          className="object-contain"
                          style={{
                            filter:
                              'brightness(0) saturate(100%) invert(83%) sepia(21%) saturate(1074%) hue-rotate(357deg) brightness(102%) contrast(105%) drop-shadow(0 1px 1px rgba(0,0,0,0.8))',
                          }}
                        />
                      </div>
                    </div>

                    <div className={`text-center mb-5 transition-all duration-500 ${activeStep === 3 ? 'scale-100 opacity-100' : 'scale-95 opacity-100'}`}>
                      <h3
                        className="font-serif text-5xl text-transparent bg-clip-text bg-gradient-to-b from-[#f8e3b6] via-[#d4af37] to-[#8a6e2f] mb-1 uppercase tracking-widest"
                        style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.8))' }}
                      >
                        {currentShape.name}
                      </h3>
                      <p className="text-xs uppercase tracking-[0.4em] text-white/70 mb-2" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.6)' }}>
                        {currentMaterial.name}
                      </p>
                      <p className="font-serif text-base italic text-[#D4B675] font-light tracking-wider" style={{ textShadow: '0px 1px 1px rgba(0,0,0,0.8)' }}>
                        "In our hearts you live forever"
                      </p>
                    </div>

                    {currentMotif && (
                      <div
                        className={`flex flex-col items-center gap-2 mb-4 transition-all duration-500 ${activeStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                      >
                        <div className="relative w-16 h-16">
                          <Image
                            src={currentMotif.file}
                            alt={currentMotif.name}
                            fill
                            className="object-contain drop-shadow-2xl"
                            style={{
                              filter:
                                'brightness(0) saturate(100%) invert(83%) sepia(21%) saturate(1074%) hue-rotate(357deg) brightness(102%) contrast(105%) drop-shadow(0 1px 1px rgba(0,0,0,0.8))',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div
                      className={`flex justify-between w-[60%] text-xs font-bold tracking-[0.25em] text-[#D4B675] transition-all duration-500 ${activeStep >= 3 ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-2'}`}
                      style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.8)' }}
                    >
                      <span>OCT 14, 1945</span>
                      <span>JAN 20, 2023</span>
                    </div>
                  </div>
                </div>

                <div className="relative left-1/2 -translate-x-1/2 w-[120%] h-28 -mt-14 z-20 transition-all duration-500">
                  <div className="w-full h-full rounded-sm overflow-hidden relative border-t border-white/20 bg-gray-900 shadow-[0_25px_50px_rgba(0,0,0,0.6)]">
                    <Image src={currentMaterial.file} alt="Base" fill className="object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70" />
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-8 bg-black/80 blur-xl rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls column */}
          <div className="flex w-full max-w-sm flex-col gap-10 z-20">
            <div className="flex flex-col gap-6 lg:border-l border-white/10 lg:pl-10">
              {steps.map((step) => {
                const isActive = activeStep === step.id;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="w-full">
                    <button
                      onClick={() => setActiveStep(step.id)}
                      aria-pressed={isActive}
                      className={`group w-full text-left px-2 py-5 border-b border-white/15 transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            isActive
                              ? 'border-[#d4af37] text-[#f8e3b6]'
                              : 'border-white/20 text-white/50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] uppercase tracking-[0.5em] text-white/50 mb-1">
                            Step {String(step.id).padStart(2, '0')}
                          </p>
                          <p className="text-2xl font-serif">{step.label}</p>
                          <p className="text-xs text-white/60 mt-1">{step.copy}</p>
                        </div>
                      </div>
                    </button>

                    {isActive && step.id === 1 && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-4 gap-3">
                          {shapes.map((shape, idx) => (
                            <button
                              key={shape.name}
                              onClick={() => setShapeIndex(idx)}
                              aria-pressed={shapeIndex === idx}
                              className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                                shapeIndex === idx
                                  ? 'ring-2 ring-[#d4af37]'
                                  : 'ring-1 ring-white/20 hover:ring-white/40'
                              }`}
                              title={shape.name}
                            >
                              <div
                                className="w-9 h-9"
                                style={{
                                  maskImage: `url('${shape.file}')`,
                                  maskSize: 'contain',
                                  maskRepeat: 'no-repeat',
                                  maskPosition: 'center',
                                  WebkitMaskImage: `url('${shape.file}')`,
                                  WebkitMaskSize: 'contain',
                                  WebkitMaskRepeat: 'no-repeat',
                                  WebkitMaskPosition: 'center',
                                  backgroundColor: shapeIndex === idx ? '#F9F4E8' : 'rgba(255,255,255,0.5)',
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {isActive && step.id === 2 && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-3 gap-3">
                          {materials.map((mat, idx) => (
                            <button
                              key={mat.name}
                              onClick={() => setMaterialIndex(idx)}
                              aria-pressed={materialIndex === idx}
                              className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                                materialIndex === idx
                                  ? 'ring-2 ring-[#d4af37]'
                                  : 'ring-1 ring-white/20 hover:ring-white/40'
                              }`}
                              title={mat.name}
                            >
                              <div
                                className="w-10 h-10 rounded-full overflow-hidden"
                                style={{
                                  backgroundImage: `url('${mat.file}')`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  filter: materialIndex === idx ? 'none' : 'grayscale(0.25) brightness(0.9)',
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {isActive && step.id === 3 && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-4 gap-3">
                          {motifOptions.map((motif, idx) => (
                            <button
                              key={motif.name}
                              onClick={() => setMotifIndex(idx)}
                              aria-pressed={motifIndex === idx}
                              className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                                motifIndex === idx
                                  ? 'ring-2 ring-[#d4af37]'
                                  : 'ring-1 ring-white/20 hover:ring-white/40'
                              }`}
                              title={motif.name}
                            >
                              <div className="relative w-9 h-9">
                                <Image src={motif.file} alt={motif.name} fill className="object-contain" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex lg:pl-10">
              <Link
                href="/select-product"
                className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#A67C00] border border-[#d4af37]/30 px-10 py-3.5 text-sm font-bold tracking-wider text-[#1a140f] shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:brightness-110 text-center"
              >
                {activeStep < 4 ? 'Next' : 'Start Designing'}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 w-full grid grid-cols-1 sm:grid-cols-3 gap-4 z-20">
          {builderHighlights.map(({ label, value, detail }) => (
            <div
              key={label}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-black/40 p-5 shadow-[0_25px_50px_rgba(0,0,0,0.45)]"
            >
              <p className="text-[11px] uppercase tracking-[0.5em] text-white/50">{label}</p>
              <p className="text-3xl font-serif text-white mt-2">{value}</p>
              <p className="text-xs text-white/65 mt-1">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

