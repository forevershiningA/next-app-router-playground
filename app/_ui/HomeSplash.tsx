'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useState, MouseEvent } from 'react';
import { data } from '#/app/_internal/_data';
import {
  CubeIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  SparklesIcon,
  EyeIcon,
  BookmarkIcon,
  SwatchIcon,
  ArrowsPointingOutIcon,
  PlusCircleIcon,
  CurrencyDollarIcon,
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
    description: 'A three-phase workflow keeps your family in sync from inspiration to final approval.',
    bullets: [
      'Phase 1: Choose product, shape, and material with real-time previews.',
      'Phase 2: Personalize inscriptions, motifs, and additions with live pricing.',
      'Phase 3: Share proofs, lock pricing, and hand off to production when ready.'
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
        'Select from 40+ shapes and premium stone materials. Each choice reflects in real-time 3D.',
    },
    {
      key: 'tribute',
      eyebrow: 'Step 2',
      title: 'The Tribute',
      summary: 'Personalize their story',
      description:
        'Add inscriptions, meaningful motifs, and decorative accents—watch each change appear instantly.',
    },
    {
      key: 'review',
      eyebrow: 'Step 3',
      title: 'Review & Share',
      summary: 'Gather family input',
      description:
        'View transparent pricing, save your work, and easily share with family before finalizing.',
    },
  ];

  const howItWorksHighlights = [
    { label: 'See every change in calming 3D', icon: EyeIcon },
    { label: 'Transparent pricing · no hidden fees', icon: DocumentTextIcon },
    { label: 'Save drafts & share with family', icon: BookmarkIcon },
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
    { label: 'Headstone shapes', value: '40', detail: 'Classic & modern styles available' },
    { label: 'Meaningful accents ready', value: '5000+', detail: 'Motifs, fonts & finishes to choose from' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at 50% 100%, #3E3020 0%, #121212 60%)' }}>
      
      {/* Hero Section - Full Viewport Layout */}
      <div className="relative min-h-screen flex flex-col overflow-hidden" role="banner">
        
        {/* Responsive Header - Absolute top */}
        <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          {/* Logo - Responsive width, centered on mobile */}
          <div className="w-52 sm:w-56 md:w-72 transition-all mx-auto md:mx-0">
            <Image 
              src="/ico/forever-transparent-logo.png" 
              alt="Forever Shining - Design Online" 
              width={320}
              height={100}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* Top Right Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/select-product" 
              className="rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-5 py-2 text-sm font-semibold text-slate-900 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#cfac6c]/30 hover:from-[#d4af37] hover:to-[#cfac6c]"
            >
              Start Designing
            </Link>
            <Link 
              href="/designs" 
              className="text-sm font-medium text-white hover:text-[#cfac6c] transition-colors"
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
            <div className="flex flex-col items-center gap-1 mb-8">
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
              <p 
                className="text-sm font-medium"
                style={{ 
                  color: '#FFFFFF',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}
              >
                Save designs • Share with family • No obligation · No credit card required<br/>
                Headstones • Plaques • Urns • Full Monuments<br/>
                Design exactly what you need.
              </p>
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
            <div className="flex flex-col items-center gap-3 relative z-20">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <Link
                  href="/select-product"
                  className="w-full sm:w-auto text-center group rounded-full bg-gradient-to-r from-[#f8d64f] via-[#eeb21f] to-[#e08404] px-10 py-4 text-base font-semibold tracking-wide text-slate-900 shadow-[0_20px_45px_rgba(238,178,31,0.45)] transition-all hover:scale-105 hover:shadow-[0_0_55px_rgba(238,178,31,0.65)]"
                  aria-label="Start your free design"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Start Your Free Design
                </Link>
              </div>
              

            </div>

          </div>
        </div>
      </div>

      {/* Features Section - How It Works */}
      <section
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
                className="rounded-full bg-gradient-to-r from-[#f8d64f] via-[#eeb21f] to-[#e08404] border border-[#f3c049]/40 px-8 py-3.5 text-sm font-bold tracking-wider text-[#1a140f] shadow-[0_20px_35px_rgba(240,178,31,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(240,178,31,0.55)]"
              >
                Start Designing Now
              </Link>
            </div>

            <div className="mt-10 w-full max-w-2xl mx-auto lg:mx-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch relative z-10">
                {compassionPhases.map((phase) => (
                  <div
                    key={phase.key}
                    className="group relative rounded-2xl border border-[#d4af37]/30 bg-gradient-to-b from-[#2a1f15]/80 to-[#1a120c]/90 px-6 py-6 text-left backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-full min-h-[190px] flex flex-col transition-all duration-300 hover:border-[#d4af37]/60 hover:shadow-[0_12px_40px_rgba(212,175,55,0.2)] hover:scale-[1.02]"
                  >
                    {/* Subtle glow effect on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#d4af37]/0 to-[#d4af37]/0 group-hover:from-[#d4af37]/5 group-hover:to-transparent transition-all duration-300"></div>
                    
                    <div className="relative flex flex-col h-full">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4af37]/80 font-medium mb-3">{phase.eyebrow}</p>
                      <p className="text-xl font-serif text-white mt-1 mb-3">{phase.summary}</p>
                      <p className="text-sm text-white/75 leading-relaxed flex-1">{phase.description}</p>
                    </div>
                  </div>
                ))}
              </div>
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
            <p className="mt-4 text-center text-sm text-white/70">
              As you design, the 3D studio updates instantly
            </p>
          </div>
        </div>

        <div className="mt-16 space-y-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[1280px] w-full mx-auto">
            {howItWorksHighlights.map(({ label, icon: HighlightIcon }) => (
              <div
                key={label}
                className="group relative flex items-center gap-4 px-2"
              >
                <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/10 border border-[#d4af37]/40 flex items-center justify-center text-[#f7dca3] group-hover:from-[#d4af37]/30 group-hover:to-[#d4af37]/15 group-hover:border-[#d4af37]/60 transition-all duration-300 shadow-lg">
                  <HighlightIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold leading-snug text-white/90 group-hover:text-white transition-colors">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {tributeStats.map(({ label, value, detail }) => (
              <div 
                key={label} 
                className="group relative rounded-2xl border border-[#d4af37]/30 bg-gradient-to-b from-[#2a1f15]/80 to-[#1a120c]/90 p-8 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-[#d4af37]/60 hover:shadow-[0_12px_40px_rgba(212,175,55,0.2)] hover:scale-[1.02]"
              >
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#d4af37]/0 to-[#d4af37]/0 group-hover:from-[#d4af37]/5 group-hover:to-transparent transition-all duration-300"></div>
                
                <div className="relative">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4af37]/80 font-medium mb-3">{label}</p>
                  <p className="text-4xl font-serif text-white mt-2 mb-3 tracking-tight">{value}</p>
                  <p className="text-sm text-white/75 leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-[#cfac6c]/30 py-24" style={{ background: 'radial-gradient(circle at 50% 100%, #3E3020 0%, #121212 60%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(212,175,55,0.12),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(238,178,31,0.08),transparent_50%)]"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
          <div className="text-center lg:text-left space-y-6">
            <p className="text-xs font-semibold tracking-[0.6em] text-[#d4af37]/80">READY WHEN YOU ARE</p>
            <h2 className="text-4xl font-serif text-white leading-tight">
              Create a Tribute Worthy of Their Memory
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto lg:mx-0">
              Take your time. Experiment with designs, invite family feedback, and only place an order when you are 100% certain.
            </p>
            <p className="text-sm text-white/70 max-w-2xl mx-auto lg:mx-0">
              No pressure, no credit card—just a safe space to visualize every detail before you commit.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:justify-start">
              <Link
                href="/select-product"
                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-[#f8d64f] via-[#eeb21f] to-[#e08404] px-10 py-4 text-base font-semibold text-slate-900 shadow-[0_20px_45px_rgba(238,178,31,0.45)] transition-all hover:scale-105 hover:shadow-[0_0_55px_rgba(238,178,31,0.65)] text-center"
              >
                Start Your Free Design
              </Link>
              <Link
                href="#contact"
                onClick={handleHashLink('contact')}
                role="button"
                aria-haspopup="dialog"
                className="w-full sm:w-auto rounded-full border-2 border-[#d4af37]/60 bg-gradient-to-r from-[#d4af37]/10 to-[#d4af37]/5 px-10 py-4 text-base font-semibold text-white shadow-[0_8px_24px_rgba(212,175,55,0.2)] hover:border-[#d4af37] hover:bg-[#d4af37]/15 hover:shadow-[0_12px_32px_rgba(212,175,55,0.35)] transition-all hover:scale-105 text-center"
              >
                Request a Designer's Help
              </Link>
            </div>
            <p className="text-xs text-white/65 uppercase tracking-[0.4em]">
              ⚡ Fast &nbsp;•&nbsp; 🔒 Secure &nbsp;•&nbsp; 👁️ Live Preview
            </p>

          </div>

          <div className="relative text-white flex justify-center lg:justify-end">
            <div className="group relative w-full max-w-md rounded-[32px] border border-[#d4af37]/30 bg-gradient-to-b from-[#2a1f15]/80 to-[#1a120c]/90 p-10 backdrop-blur-sm shadow-[0_12px_48px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#d4af37]/60 hover:shadow-[0_16px_56px_rgba(212,175,55,0.25)] hover:scale-[1.02] flex flex-col justify-between">
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#d4af37]/0 to-[#d4af37]/0 group-hover:from-[#d4af37]/5 group-hover:to-transparent transition-all duration-300"></div>
              
              <div className="relative">
              <div className="text-[#f3d48f] text-2xl tracking-[0.4em]">★★★★★</div>
              <p className="mt-8 text-[2.25rem] font-serif italic leading-snug text-white">
                “The guided studio let our family align on every detail before we ever talked pricing. Seeing it live in 3D gave us complete confidence.”
              </p>
              <p className="mt-8 text-sm uppercase tracking-[0.4em] text-[#d4af37]/80 font-medium">— Sarah & Liam, Perth</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How You Design a Memorial - Interactive State-Based Version */}
      <DesignPossibilitiesSection />

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
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors">
                  IG
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors">
                  FB
                </a>
                <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors">
                  PI
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-serif tracking-[0.4em] text-[#f3d48f] uppercase">Memorials</p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li><a href="#headstones" onClick={handleHashLink('headstones')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors">Headstones</a></li>
                <li><a href="#plaques" onClick={handleHashLink('plaques')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors">Plaques</a></li>
                <li><a href="#urns" onClick={handleHashLink('urns')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors">Urns</a></li>
                <li><a href="#monuments" onClick={handleHashLink('monuments')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors">Full Monuments</a></li>
                <li><a href="#pets" onClick={handleHashLink('pets')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors">Pet Memorials</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-serif tracking-[0.4em] text-[#f3d48f] uppercase">Help & Guides</p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li><a href="#how-it-works" onClick={handleHashLink('how-it-works')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#pricing" onClick={handleHashLink('pricing')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors">Pricing Guide</a></li>
                <li><a href="#materials" onClick={handleHashLink('materials')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors">Material Guide</a></li>
                <li><a href="#faq" onClick={handleHashLink('faq')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#contact" onClick={handleHashLink('contact')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-serif tracking-[0.4em] text-[#f3d48f] uppercase">Get in Touch</p>
              <div className="mt-4 space-y-3 text-sm text-white/80">
                <a href="tel:+16473880931" className="text-lg font-semibold text-white hover:text-[#f3d48f] transition-colors">(+1) 647 388 0931</a>
                <p className="text-white/70">
                  <a href="mailto:admin@bronze-plaque.com" className="hover:text-[#f3d48f] transition-colors">admin@bronze-plaque.com</a>
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
              <a href="#privacy" onClick={handleHashLink('privacy')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors">Privacy Policy</a>
              <span className="text-white/40">|</span>
              <a href="#terms" onClick={handleHashLink('terms')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors">Terms of Service</a>
              <span className="text-white/40">|</span>
              <a href="#sitemap" onClick={handleHashLink('sitemap')} role="button" aria-haspopup="dialog" className="hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-white/45">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-white/55">Partners:</span>
              <a href="https://www.bronze-plaque.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Bronze-Plaque.com</a>
              <span>•</span>
              <a href="https://headstonesdesigner.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white">HeadstonesDesigner.com</a>
              <span>•</span>
              <a href="https://www.forevershining.com.au/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Forever Shining Australia</a>
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
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hash-modal-title"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-[#d4af37]/40 bg-[#0b0805]/95 p-6 text-white shadow-[0_35px_80px_rgba(0,0,0,0.65)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full border border-white/20 p-1 text-white/70 hover:text-white hover:border-white transition-colors"
              aria-label="Close dialog"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M14 6l-8 8" />
              </svg>
            </button>
            {activeModalContent.eyebrow && (
              <p className="text-[11px] uppercase tracking-[0.5em] text-[#d4af37]/70 mb-3">
                {activeModalContent.eyebrow}
              </p>
            )}
            <h3 id="hash-modal-title" className="text-2xl font-serif text-white">
              {activeModalContent.title}
            </h3>
            <p className="mt-3 text-sm text-white/80 leading-relaxed">
              {activeModalContent.description}
            </p>
            {activeModalContent.bullets && (
              <ul className="mt-5 space-y-3 text-sm text-white/85">
                {activeModalContent.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {activeModalContent.links && (
              <div className="mt-6 flex flex-wrap gap-3">
                {activeModalContent.links.map((link) => (
                  <a
                    key={link.href + link.label}
                    href={link.href}
                    className="rounded-full border border-[#d4af37]/60 px-4 py-2 text-sm font-semibold text-white hover:bg-[#d4af37]/15 transition-colors"
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

// New interactive state-based section component
function DesignPossibilitiesSection() {
  const workflowNav = [
    {
      slug: 'select-product',
      label: 'Select Product',
      copy: 'Choose a headstone, plaque, urn, or monument to begin.',
      icon: CubeIcon,
      stage: 1,
    },
    {
      slug: 'select-shape',
      label: 'Select Shape',
      copy: 'Switch silhouettes and bases until the proportions feel right.',
      icon: Squares2X2Icon,
      stage: 1,
    },
    {
      slug: 'select-material',
      label: 'Select Material',
      copy: 'Test Glory Black, Blue Pearl, or any premium finish in live lighting.',
      icon: SwatchIcon,
      stage: 2,
    },
    {
      slug: 'select-size',
      label: 'Select Size',
      copy: 'Dial in width, height, and base depth so everything feels balanced.',
      icon: ArrowsPointingOutIcon,
      stage: 1,
    },
    {
      slug: 'inscriptions',
      label: 'Inscriptions',
      copy: 'Add names, dates, prayers, and sentiments with guided typography.',
      icon: DocumentTextIcon,
      stage: 3,
    },
    {
      slug: 'select-motifs',
      label: 'Select Motifs',
      copy: 'Accent the stone with symbols, portraits, and custom artwork.',
      icon: SparklesIcon,
      stage: 3,
    },
  ];

  const defaultWorkflowSlug = 'select-shape';
  const defaultWorkflowStage =
    workflowNav.find((item) => item.slug === defaultWorkflowSlug)?.stage ?? workflowNav[0].stage;

  const [activeStep, setActiveStep] = useState(defaultWorkflowStage);
  const [activeWorkflowSlug, setActiveWorkflowSlug] = useState(defaultWorkflowSlug);
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
    { label: 'Motif & inscription slots', value: 'Limitless personalization', detail: 'Layer photos, vases & art' },
  ];

  const currentShape = shapes[shapeIndex];
  const currentMaterial = materials[materialIndex];
  const currentMotif = motifOptions[motifIndex] ?? motifOptions[0];

  return (
    <div
      className="relative py-24 overflow-hidden min-h-[900px] bg-[#1a140f]"
      style={{ background: 'radial-gradient(circle at 50% 40%, #2f251d 0%, #120b05 60%)' }}
    >
      {/* Decorative grid + glow */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-20" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#120b05] to-transparent z-10" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8 flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center mb-10 lg:mb-16 z-20">
          <h2 className="text-4xl md:text-5xl font-serif text-[#F9F4E8] mb-4 tracking-tight leading-tight">
            Design a Beautiful Tribute
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto font-light leading-relaxed">
            Tap the steps below to customize every detail in our 3D studio.
          </p>
        </div>

        <div className="flex w-full flex-col lg:flex-row items-center lg:items-start justify-center lg:gap-20">
          {/* Preview column */}
          <div className="relative w-full max-w-xl mx-auto lg:mx-0 perspective-1000">
            <div className="relative px-4 py-8 sm:px-8 lg:px-12">
              <div className="relative">
                <div className={`relative z-10 mb-8 transition-all duration-700 ease-out ${activeStep === 1 ? 'scale-105' : 'scale-100'}`}>
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
                    <div className="absolute inset-0 bg-[#020202] transition-colors duration-700" style={{ backgroundColor: currentMaterial.color }}>
                      <Image
                        src={currentMaterial.file}
                        alt={currentMaterial.name}
                        fill
                        className={`object-cover transition-transform duration-700 ${activeStep === 2 ? 'scale-120' : 'scale-100'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/15 mix-blend-overlay" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.55),transparent_55%)] opacity-80 mix-blend-screen pointer-events-none" />
                      <div className="absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-white/60 via-transparent to-transparent opacity-90 mix-blend-screen pointer-events-none" />
                      <div className="absolute inset-0 opacity-35 mix-blend-soft-light" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
                      <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0.25) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.15) 100%)' }} />
                    </div>
                  </div>

                  <div className="absolute inset-0 flex flex-col gap-4 py-6 z-30 pointer-events-none">
                    <div className={`flex justify-between px-10 mb-4 transition-all duration-500 ${activeStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
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

                    <div className="flex-1 flex flex-col items-center justify-start px-8 text-center gap-3" style={{ marginTop: '-10%' }}>
                      {currentMotif && (
                        <div className={`transition-all duration-500 ${activeStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                          <div className="relative w-16 h-16 mx-auto -translate-y-1">
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
                      <p
                        className="font-serif text-2xl md:text-[1.9rem] text-transparent bg-clip-text bg-gradient-to-b from-[#f8e3b6] via-[#d4af37] to-[#8a6e2f] italic tracking-wide"
                        style={{ textShadow: '-1px -1px 2px rgba(0,0,0,0.85), 1px 1px 2px rgba(255,255,255,0.2), 0px 2px 4px rgba(0,0,0,0.9)' }}
                      >
                        In our hearts you live forever
                      </p>
                      <div
                        className={`mt-auto pt-4 flex justify-between w-full max-w-[340px] text-[11px] font-semibold tracking-[0.35em] text-[#D4B675] transition-all duration-500 ${activeStep >= 3 ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.8)' }}
                      >
                        <span>OCT 14, 1945</span>
                        <span>JAN 20, 2023</span>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="relative left-1/2 -translate-x-1/2 w-[120%] h-20 -mt-10 z-20 transition-all duration-500">
                  <div
                    className="w-full h-full overflow-hidden relative border border-white/15 bg-gradient-to-b from-[#2a1c12] via-[#120a05] to-[#030101] shadow-[0_35px_70px_rgba(0,0,0,0.7)]"
                    style={{ clipPath: 'polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)' }}
                  >
                    <Image src={currentMaterial.file} alt="Base" fill className="object-cover opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-black/60" />
                    <div className="absolute inset-x-8 top-1 h-2 bg-gradient-to-b from-white/45 to-transparent opacity-80" />
                    <div className="absolute inset-x-12 bottom-3 h-1 bg-gradient-to-r from-transparent via-[#f3d48f]/60 to-transparent opacity-85" />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[78%] h-8 bg-black/80 blur-2xl" />
                </div>

                <p className="text-center mt-6 text-[11px] uppercase tracking-[0.4em] text-white/70">
                  {currentShape.name} Shape • {currentMaterial.name} Granite
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/select-product"
                className="rounded-full bg-gradient-to-r from-[#f8d64f] via-[#eeb21f] to-[#e08404] border border-[#f3c049]/40 px-10 py-3.5 text-sm font-bold tracking-wider text-[#1a140f] shadow-[0_20px_35px_rgba(240,178,31,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(240,178,31,0.55)]"
              >
                Start Customizing This Design
              </Link>
            </div>
          </div>

          {/* Controls column */}
          <div className="flex w-full max-w-md flex-col gap-6 z-20 lg:pl-10">
            <div className="flex flex-col gap-3 w-full lg:border-l border-white/10 lg:pl-10">
              {workflowNav.map((item, index) => {
                const isActive = activeWorkflowSlug === item.slug;
                const Icon = item.icon;

                return (
                  <div key={item.slug} className="w-full">
                    <button
                      onClick={() => {
                        setActiveWorkflowSlug(item.slug);
                        setActiveStep(item.stage);
                      }}
                      aria-pressed={isActive}
                      className={`group w-full text-left rounded-2xl border px-5 py-5 transition-all duration-300 ${
                        isActive
                          ? 'border-[#d4af37]/30 bg-gradient-to-b from-[#2a1f15]/80 to-[#1a120c]/90 text-white shadow-[0_12px_40px_rgba(212,175,55,0.2)] backdrop-blur-sm'
                          : 'border-white/15 bg-gradient-to-b from-[#1a120c]/40 to-[#0f0804]/30 text-white/70 hover:border-[#d4af37]/40 hover:from-[#1a120c]/60 hover:to-[#0f0804]/50 hover:text-white/90 backdrop-blur-sm'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-lg ${
                            isActive
                              ? 'border-[#d4af37]/50 bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/10 text-[#f8e3b6]'
                              : 'border-white/25 bg-gradient-to-br from-white/10 to-white/5 text-white/60 group-hover:border-[#d4af37]/30 group-hover:from-[#d4af37]/15 group-hover:to-[#d4af37]/8 group-hover:text-white/80'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4af37]/70 font-medium mb-1">
                            Step {String(index + 1).padStart(2, '0')}
                          </p>
                          <p className="text-xl font-serif text-white mb-1">{item.label}</p>
                          <p className="text-sm text-white/75 mt-1 leading-relaxed">{item.copy}</p>
                        </div>
                      </div>
                    </button>

                    {isActive && item.slug === 'select-shape' && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-4 gap-3">
                          {shapes.map((shape, idx) => (
                            <button
                              key={shape.name}
                              onClick={() => setShapeIndex(idx)}
                              aria-pressed={shapeIndex === idx}
                              className={`relative flex h-16 w-16 items-center justify-center rounded-xl transition-all duration-200 border ${
                                shapeIndex === idx
                                  ? 'border-[#d4af37]/60 bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/10 shadow-[0_4px_16px_rgba(212,175,55,0.3)]'
                                  : 'border-white/20 bg-gradient-to-br from-white/10 to-white/5 hover:border-[#d4af37]/40 hover:from-[#d4af37]/15 hover:to-[#d4af37]/8 shadow-md'
                              }`}
                              title={shape.name}
                            >
                              <div
                                className="w-10 h-10"
                                style={{
                                  maskImage: `url('${shape.file}')`,
                                  maskSize: 'contain',
                                  maskRepeat: 'no-repeat',
                                  maskPosition: 'center',
                                  WebkitMaskImage: `url('${shape.file}')`,
                                  WebkitMaskSize: 'contain',
                                  WebkitMaskRepeat: 'no-repeat',
                                  WebkitMaskPosition: 'center',
                                  backgroundColor: shapeIndex === idx ? '#f8e3b6' : 'rgba(255,255,255,0.9)',
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {isActive && item.slug === 'select-material' && (
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

                    {isActive && item.slug === 'select-motifs' && (
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
              <p className="text-xs text-white/55 mt-1">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

