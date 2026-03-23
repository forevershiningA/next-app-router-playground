'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useState, MouseEvent } from 'react';

// FIX 1: Dynamic loader height to match the new responsive container logic
const HeroCanvas = dynamic(() => import('#/components/HeroCanvas'), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex items-center justify-center w-full h-[35vh] min-h-[280px] max-h-[450px]">
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
      'Call us at (+1) 647 388 0931 between 9am and 7pm EST.',
      'Email admin@bronze-plaque.com for a written response within one business day.',
      'Book a complimentary screen-share to co-design live with your family.'
    ],
    links: [
      { label: 'Call Now', href: 'tel:+16473880931' },
      { label: 'Email Support', href: 'mailto:admin@bronze-plaque.com' }
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
      'Order lightweight plaques that ship anywhere in North America.'
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
      'You can export or purge personal data by emailing admin@bronze-plaque.com.'
    ],
    links: [{ label: 'Request Full Policy', href: 'mailto:admin@bronze-plaque.com?subject=Privacy%20Policy%20Request' }]
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
    links: [{ label: 'Request Full Terms', href: 'mailto:admin@bronze-plaque.com?subject=Terms%20of%20Service%20Request' }]
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
  const router = useRouter();
  const [showCanvas, setShowCanvas] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isInViewport, setIsInViewport] = useState(true);
  const [activeModal, setActiveModal] = useState<HashModalKey | null>(null);

  const handleHashLink = (slug: HashModalKey) => (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setActiveModal(slug);
  };

  const closeModal = () => setActiveModal(null);
  const activeModalContent = activeModal ? HASH_MODAL_CONTENT[activeModal] : null;

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

  const rotateLeft = () => {
    setRotation((prev) => prev + Math.PI / 4);
  };

  const rotateRight = () => {
    setRotation((prev) => prev - Math.PI / 4);
  };

  const compassionPhases = [
    {
      key: 'foundation',
      eyebrow: 'Step 1',
      title: 'The Foundation',
      summary: 'Choose a memorial style',
      description:
        'Pick your shape and material, then see it render instantly in 3D.',
    },
    {
      key: 'tribute',
      eyebrow: 'Step 2',
      title: 'The Tribute',
      summary: 'Personalize their story',
      description:
        'Add inscriptions, motifs, and accents while the preview updates live.',
    },
    {
      key: 'review',
      eyebrow: 'Step 3',
      title: 'Review & Share',
      summary: 'Gather family input',
      description:
        'Review clear pricing, save your draft, and share before final approval.',
    },
  ];

  const heroHighlights = [
    { primary: 'Save, edit & share', secondary: 'Your design' },
    { primary: 'Instant proof', secondary: '& pricing' },
    { primary: 'Support from', secondary: 'designers' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at 50% 100%, #3E3020 0%, #121212 60%)' }}>
      
      {/* Hero Section - Full Viewport Layout */}
      <div className="relative min-h-screen flex flex-col overflow-hidden" role="banner">
        
        {/* Responsive Header - Absolute top */}
        <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4" style={{ caretColor: 'transparent' }}>
          {/* Logo - Responsive width, centered on mobile */}
          <div 
            className="w-52 sm:w-56 md:w-72 transition-all mx-auto md:mx-0 select-none pointer-events-none" 
            style={{ caretColor: 'transparent', userSelect: 'none' }}
          >
            <Image 
              src="/ico/forever-transparent-logo.png" 
              alt="Forever Shining - Design Online" 
              width={320}
              height={100}
              className="w-full h-auto select-none"
              priority
              draggable={false}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            />
          </div>

          {/* Top Right Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/select-product" 
              className="rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-5 py-2 text-sm font-semibold text-slate-900 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#cfac6c]/30 hover:from-[#d4af37] hover:to-[#cfac6c] cursor-pointer"
            >
              Start Designing
            </Link>
            <Link 
              href="/designs" 
              className="text-sm font-medium text-white hover:text-[#cfac6c] transition-colors cursor-pointer"
            >
              Browse Designs
            </Link>
          </nav>
        </header>
      
        {/* Background Layers */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ 
            backgroundImage: 'url(/backgrounds/tree-2916763_1920.webp)',
            filter: 'blur(16px) saturate(1.2) brightness(0.9)',
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
        <div className="relative z-10 flex flex-col justify-center flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-[129px] sm:pt-24">
          <div className="text-center">
            
            {/* Headlines - Emotional benefit prioritized with elegant serif */}
            <h1 className="text-3xl font-playfair-display tracking-tight sm:text-5xl mb-2 sm:mb-3 leading-tight">
              <span
                className="inline-block font-semibold text-[2rem] sm:text-5xl mx-auto"
                style={{ 
                  color: '#FFFEF8',
                  textShadow: '0 1px 1px rgba(0,0,0,2), 0 4px 24px rgba(0,0,0,0)'
                }}
              >
                Create the Perfect Tribute
              </span>
              <span
                className="block font-light text-xl sm:text-3xl mt-4"
                style={{ 
                  color: '#FFFFFF',
                  textShadow: '0 1px 1px rgba(0,0,0,0.2), 0 4px 20px rgba(0,0,0,0)'
                }}
              >
                Design a beautiful tribute in real-time 3D - save, share, and order when ready.
              </span>
            </h1>
            
            {/* Trust Signals */}
            <div className="mb-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 text-[#d4af37]">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p 
                  className="text-md font-semibold"
                  style={{ 
                    color: '#F8D64F',
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                  }}
                >
                  Trusted by 5,000+ families
                </p>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                {['No credit card', 'Live 3D preview', 'Save & share'].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/25 bg-black/35 px-3 py-1 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            
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
            <div className="relative z-20 flex flex-col items-center gap-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <Link
                  href="/select-product"
                  className="w-full sm:w-auto text-center group rounded-full bg-gradient-to-r from-[#f8d64f] via-[#eeb21f] to-[#e08404] px-10 py-4 text-base font-semibold tracking-wide text-slate-900 shadow-[0_20px_45px_rgba(238,178,31,0.45)] transition-all hover:scale-105 hover:shadow-[0_0_55px_rgba(238,178,31,0.65)] cursor-pointer"
                  aria-label="Start your free design"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Start Your Free Design
                </Link>
              </div>

              <button
                type="button"
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-medium tracking-[0.16em] text-white/80 transition-all hover:border-white/35 hover:text-white"
                aria-label="Scroll to how it works section"
              >
                SCROLL
                <span aria-hidden="true" className="text-sm">↓</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Features Section - How It Works */}
      <section
        id="how-it-works"
        className="relative py-24 overflow-hidden border-t border-[#2d241c]"
        style={{ background: 'linear-gradient(180deg, #130b05 0%, #090503 60%, #050302 100%)' }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70 pointer-events-none" />
        <div className="absolute -top-32 right-0 w-[28rem] h-[28rem] bg-[#d4af37]/30 blur-[180px] opacity-40 pointer-events-none" />
        <div className="absolute -bottom-32 left-0 w-[32rem] h-[32rem] bg-[#5c4033]/40 blur-[160px] opacity-40 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-xs font-semibold tracking-[0.6em] text-[#d4af37]/80 mb-4">HOW IT WORKS</p>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">
              Design a Lasting Tribute from the Comfort of Home
            </h2>
            <p className="text-lg text-white/90 max-w-xl lg:max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Guided steps keep you focused while the 3D studio mirrors every change in real time.
              No downloads, no pressure—just clarity before you commit.
            </p>

            {/* Primary CTA Button */}
            <div className="mt-6 flex justify-center lg:justify-start">
              <Link
                href="/select-product"
                className="rounded-full bg-gradient-to-r from-[#f8d64f] via-[#eeb21f] to-[#e08404] border border-[#f3c049]/40 px-8 py-3.5 text-sm font-bold tracking-wider text-[#1a140f] shadow-[0_20px_35px_rgba(240,178,31,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(240,178,31,0.55)] cursor-pointer"
              >
                Start Your Free Design
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full lg:max-w-xl mx-auto lg:mx-0">
            <div className="relative rounded-[36px] border border-white/10 bg-black/30 p-2 shadow-[0_45px_80px_rgba(0,0,0,0.55)]">
              <div className="relative w-full min-h-[500px] lg:min-h-[600px] overflow-hidden rounded-[30px]">
                <Image
                  src="/backgrounds/dyo.webp"
                  alt="3D memorial preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority
                  style={{ objectPosition: 'center center' }}
                />
                <div className="absolute inset-0" />
              </div>
            </div>
            <p className="mt-4 text-center text-base font-medium text-white/90">
              As you design, the 3D studio updates instantly
            </p>
          </div>
        </div>

            <div className="mt-8 w-full max-w-7xl mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch relative z-10">
                {compassionPhases.map((phase, index) => (
                  <div
                    key={phase.key}
                    className="group relative rounded-2xl border border-[#d4af37]/30 bg-[#1a120c]/88 px-6 py-6 text-left backdrop-blur-sm shadow-[0_6px_20px_rgba(0,0,0,0.3)] h-full min-h-[185px] flex flex-col transition-all duration-300 hover:border-[#d4af37]/50 hover:shadow-[0_10px_28px_rgba(0,0,0,0.36)]"
                  >
                <div className="relative flex flex-col h-full">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/45 bg-[#2a1f15] text-sm font-semibold text-[#f7dca3]">
                      {`0${index + 1}`}
                    </span>
                    <p className="text-[11px] uppercase tracking-[0.26em] text-[#d4af37]/75 font-medium">{phase.eyebrow}</p>
                  </div>
                  <p className="text-xl font-serif text-white mt-1 mb-2">{phase.summary}</p>
                  <p className="text-sm leading-7 text-white/80 flex-1">{phase.description}</p>
                </div>

                {index < compassionPhases.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#1a120c]/95 text-[#f7dca3] shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                  >
                    →
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* CTA Section */}
      <section
        className="relative overflow-hidden border-t border-[#cfac6c]/30 py-16"
        style={{ background: 'radial-gradient(circle at 50% 100%, #2a2118 0%, #0f0c09 65%)' }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-3xl border border-[#d4af37]/25 bg-[#17120d]/85 px-6 py-8 shadow-[0_14px_40px_rgba(0,0,0,0.35)] sm:px-10 sm:py-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl text-center lg:text-left">
                <p className="text-xs font-semibold tracking-[0.5em] text-[#d4af37]/75">READY WHEN YOU ARE</p>
                <h2 className="mt-3 text-3xl font-serif leading-tight text-white sm:text-4xl">
                  Create a Tribute Worthy of Their Memory
                </h2>
                <p className="mt-3 text-base leading-relaxed text-white/80">
                  Design with confidence, save your progress anytime, and place an order only when your family is fully ready.
                </p>
              </div>

              <div className="flex w-full flex-col items-center gap-3 lg:w-auto lg:items-end">
                <Link
                  href="/select-product"
                  className="w-full rounded-full bg-gradient-to-r from-[#f8d64f] via-[#eeb21f] to-[#e08404] px-10 py-4 text-center text-base font-semibold text-slate-900 shadow-[0_16px_35px_rgba(238,178,31,0.42)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(238,178,31,0.6)] lg:w-auto"
                >
                  Start Your Free Design
                </Link>
                <p className="pt-1 text-[11px] uppercase tracking-[0.28em] text-white/60">
                  No credit card &nbsp;•&nbsp; Live 3D &nbsp;•&nbsp; Save &amp; share
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="relative bg-[#050402] border-t border-[#d4af37]/20">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-white">
            <div>
              <div className="flex items-center gap-3 text-2xl font-serif">
                <span className="tracking-wide">Forever Shining</span>
              </div>
              <p className="mt-4 text-sm text-white/70">
                Crafting lasting tributes for families around the world since 2005.
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors cursor-pointer">
                  IG
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors cursor-pointer">
                  FB
                </a>
                <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors cursor-pointer">
                  PI
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-serif tracking-[0.4em] text-[#f3d48f] uppercase">Memorials</p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li><a href="#headstones" onClick={handleHashLink('headstones')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer">Headstones</a></li>
                <li><a href="#plaques" onClick={handleHashLink('plaques')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer">Plaques</a></li>
                <li><a href="#urns" onClick={handleHashLink('urns')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer">Urns</a></li>
                <li><a href="#monuments" onClick={handleHashLink('monuments')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer">Full Monuments</a></li>
                <li><a href="#pets" onClick={handleHashLink('pets')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer">Pet Memorials</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-serif tracking-[0.4em] text-[#f3d48f] uppercase">Help & Guides</p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li><a href="#how-it-works" onClick={handleHashLink('how-it-works')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer">How it Works</a></li>
                <li><a href="#pricing" onClick={handleHashLink('pricing')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer">Pricing Guide</a></li>
                <li><a href="#materials" onClick={handleHashLink('materials')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer">Material Guide</a></li>
                <li><a href="#faq" onClick={handleHashLink('faq')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer">FAQ</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-serif tracking-[0.4em] text-[#f3d48f] uppercase">Get in Touch</p>
              <div className="mt-4 space-y-3 text-sm text-white/80">
                <a href="tel:+16473880931" className="text-lg font-semibold text-white hover:text-[#f3d48f] transition-colors cursor-pointer">(+1) 647 388 0931</a>
                <p className="text-white/70">
                  <a href="mailto:admin@bronze-plaque.com" className="hover:text-[#f3d48f] transition-colors cursor-pointer">admin@bronze-plaque.com</a>
                </p>
                <p className="text-white/70 leading-relaxed">
                  1101 Eagle Ridge Drive<br />Oshawa Ontario L1K 0L8
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
            <p>© 2025 Forever Shining. All rights reserved.</p>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <a href="#privacy" onClick={handleHashLink('privacy')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
              <span className="text-white/40">|</span>
              <a href="#terms" onClick={handleHashLink('terms')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer">Terms of Service</a>
              <span className="text-white/40">|</span>
              <a href="#sitemap" onClick={handleHashLink('sitemap')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors cursor-pointer">Sitemap</a>
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-white/45">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-white/55">Partners:</span>
              <a href="https://www.bronze-plaque.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer">Bronze-Plaque.com</a>
              <span>•</span>
              <a href="https://headstonesdesigner.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer">HeadstonesDesigner.com</a>
              <span>•</span>
              <a href="https://www.forevershining.com.au/" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer">Forever Shining Australia</a>
            </div>
            <div className="flex items-center gap-3 text-white/55">
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

