'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useState, MouseEvent } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const MEMORIAL_LINKS = [
  { label: 'Headstones', href: '/memorials/headstones' },
  { label: 'Plaques', href: '/memorials/plaques' },
  { label: 'Full Monuments', href: '/memorials/full-monuments' },
  { label: 'Urns', href: '/memorials/urns' },
  { label: 'Pet Memorials', href: '/memorials/pet-memorials' },
] as const;

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
  const router = useRouter();
  const [showCanvas, setShowCanvas] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isInViewport, setIsInViewport] = useState(true);
  const [activeModal, setActiveModal] = useState<HashModalKey | null>(null);
  const [isDayMode, setIsDayMode] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    setIsDayMode(html.dataset.theme === 'day');
    const observer = new MutationObserver(() => {
      setIsDayMode(html.dataset.theme === 'day');
    });
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

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

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = heroSearchQuery.trim();
    router.push(q ? `/designs?q=${encodeURIComponent(q)}` : '/designs');
  };

  const compassionPhases = [
    {
      key: 'foundation',
      eyebrow: 'Product',
      title: 'Choose Product',
      summary: 'Select product, shape, and size',
      description:
        'Start with Bronze Plaques, Memorial Plaques, Headstones, or Monuments, then set the core dimensions before personalising.',
    },
    {
      key: 'tribute',
      eyebrow: 'Design',
      title: 'Personalise Layout',
      summary: 'Add inscriptions, motifs, and photos',
      description:
        'Use the same guided panels from the Designer to edit wording, imagery, bronze emblems, borders, and material finishes.',
    },
    {
      key: 'review',
      eyebrow: 'Review',
      title: 'Price, Save, and Share',
      summary: 'Check the quote before ordering',
      description:
        'Review pricing, save the design, send an enquiry, or share a proof with family before committing to production.',
    },
  ];

  const heroHighlights = [
    { primary: 'Save, edit & share', secondary: 'Your design' },
    { primary: 'Instant proof', secondary: '& pricing' },
    { primary: 'Support from', secondary: 'designers' },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: isDayMode ? '#f9fafb' : 'radial-gradient(circle at 50% 100%, #3E3020 0%, #121212 60%)' }}
    >
      
      {/* Hero Section - Full Viewport Layout */}
      <div className="relative min-h-screen flex flex-col overflow-hidden" role="banner">
        
        {/* Responsive Header - Absolute top */}
        <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between gap-5 px-4 py-3 sm:px-6 sm:py-4" style={{ caretColor: 'transparent' }}>
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

          <nav
            className="hidden flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-medium text-white/85 xl:flex day:text-gray-700"
            aria-label="Memorial product pages"
          >
            <span className="font-semibold tracking-[0.18em] text-[#f3d48f] uppercase day:text-amber-700">
              Memorials:
            </span>
            <Link href="/memorials/headstones" className="transition-colors hover:text-[#f3d48f] day:hover:text-amber-700">
              Headstones
            </Link>
            <span className="text-white/35 day:text-gray-300">/</span>
            <Link href="/memorials/plaques" className="transition-colors hover:text-[#f3d48f] day:hover:text-amber-700">
              Plaques
            </Link>
            <span className="text-white/35 day:text-gray-300">/</span>
            <Link href="/memorials/full-monuments" className="transition-colors hover:text-[#f3d48f] day:hover:text-amber-700">
              Full Monuments
            </Link>
            <span className="text-white/35 day:text-gray-300">/</span>
            <Link href="/memorials/urns" className="transition-colors hover:text-[#f3d48f] day:hover:text-amber-700">
              Urns
            </Link>
            <span className="text-white/35 day:text-gray-300">/</span>
            <Link href="/memorials/pet-memorials" className="transition-colors hover:text-[#f3d48f] day:hover:text-amber-700">
              Pet Memorials
            </Link>
          </nav>

          {/* Top Right Navigation */}
          <nav className="hidden shrink-0 items-center gap-6 md:flex">
            <Link 
              href="/select-product" 
              className="rounded-lg bg-[#cfac6c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d7b979]"
            >
              Start Designing
            </Link>
            <Link 
              href="/designs" 
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#cfac6c]/60 hover:bg-white/5 day:border-gray-300 day:text-gray-800 day:hover:bg-white"
            >
              Browse Designs
            </Link>
          </nav>

          {/* Mobile menu button - only shown below md where the nav/CTAs are hidden */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="shrink-0 rounded-lg border border-white/15 bg-white/[0.06] p-2 text-white backdrop-blur-sm transition-colors hover:border-[#cfac6c]/60 md:hidden day:border-gray-300 day:bg-white/70 day:text-gray-800"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </header>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Site menu">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto border-b border-[#d4af37]/25 bg-[#0d0a06]/95 px-5 pt-4 pb-6 shadow-2xl backdrop-blur-md day:border-gray-200 day:bg-white/95">
              <div className="flex items-center justify-between">
                <Image
                  src="/ico/forever-transparent-logo.png"
                  alt="Forever Shining"
                  width={200}
                  height={62}
                  className="h-auto w-40"
                />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-white/15 p-2 text-white/80 transition-colors hover:border-[#cfac6c]/60 hover:text-white day:border-gray-300 day:text-gray-700"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <p className="mt-6 px-1 text-[11px] font-semibold tracking-[0.24em] text-[#f3d48f] uppercase day:text-amber-700">
                Memorials
              </p>
              <nav className="mt-2 flex flex-col" aria-label="Memorial product pages">
                {MEMORIAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-1 py-3 text-base font-medium text-white/85 transition-colors hover:text-[#f3d48f] day:text-gray-700 day:hover:text-amber-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/select-product"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-[#cfac6c] px-5 py-3 text-center text-base font-semibold text-slate-950 transition-colors hover:bg-[#d7b979]"
                >
                  Start Designing
                </Link>
                <Link
                  href="/designs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-white/15 px-5 py-3 text-center text-base font-semibold text-white transition-colors hover:border-[#cfac6c]/60 hover:bg-white/5 day:border-gray-300 day:text-gray-800 day:hover:bg-white"
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
            filter: 'blur(2px) saturate(1.1) brightness(0.9)',
            transform: 'scale(1)'
          }}
          role="presentation"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/10 day:from-white/50 day:via-white/30 day:to-white/10" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.25),transparent_55%)] opacity-70" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:140px_140px] opacity-20 mix-blend-screen" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" aria-hidden="true" />
        
        {/* Main Content - Flex Grow to Center Vertically */}
        <div className="relative z-10 flex flex-col justify-start flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-[130px] sm:pt-[116px]">
          <div className="text-center">
            
            {/* Headlines - Emotional benefit prioritized with elegant serif */}
            <h1 className="text-3xl font-playfair-display tracking-tight sm:text-5xl mb-2 sm:mb-3 leading-tight">
              <span
                className="inline-block font-semibold text-[2rem] sm:text-5xl mx-auto"
                style={{ 
                  color: isDayMode ? '#1a1a1a' : '#FFFEF8',
                  textShadow: isDayMode ? 'none' : '0 1px 1px rgba(0,0,0,2), 0 4px 24px rgba(0,0,0,0)'
                }}
              >
                Create the Perfect Tribute
              </span>
              <span
                className="block font-light text-xl sm:text-3xl mt-4"
                style={{ 
                  color: isDayMode ? '#374151' : '#FFFFFF',
                  textShadow: isDayMode ? 'none' : '0 1px 1px rgba(0,0,0,0.2), 0 4px 20px rgba(0,0,0,0)'
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
                    color: isDayMode ? '#b45309' : '#F8D64F',
                    textShadow: isDayMode ? 'none' : '0 2px 8px rgba(0,0,0,0.5)'
                  }}
                >
                  Trusted by 5,000+ families
                </p>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                {['No credit card', 'Live 3D preview', 'Save & share'].map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-sm day:border-gray-200 day:bg-white day:text-gray-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Hero Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="relative mx-auto mb-8 w-full max-w-xl"
              role="search"
            >
              <div className="relative flex items-center">
                <svg
                  className="pointer-events-none absolute left-4 h-5 w-5 text-white/50 day:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  value={heroSearchQuery}
                  onChange={(e) => setHeroSearchQuery(e.target.value)}
                  placeholder="Search designs - motif, shape, style…"
                  className="w-full rounded-lg border border-white/15 bg-[#171717]/80 py-3.5 pl-12 pr-28 text-sm font-light text-white placeholder-white/45 backdrop-blur-md transition-colors focus:border-[#cfac6c]/70 focus:bg-[#171717]/95 focus:outline-none focus:ring-1 focus:ring-[#cfac6c]/30 day:border-gray-300 day:bg-white/90 day:text-gray-900 day:placeholder-gray-400 day:focus:border-amber-400 day:focus:ring-amber-300/40"
                  aria-label="Search memorial designs"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 rounded-md bg-[#cfac6c] px-5 py-2 text-xs font-semibold tracking-wider text-slate-950 transition-colors hover:bg-[#d7b979]"
                >
                  Search
                </button>
              </div>
            </form>

            {/* 3D Canvas - TALLER container with overlap layout */}
            <div className="w-full h-[45vh] sm:h-[49.5vh] min-h-[360px] flex items-center justify-center relative -mt-4 -mb-16 sm:-mb-24 z-0 pointer-events-none">
              
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
                    className="absolute left-[5%] sm:left-[15%] md:left-[calc(50%-200px)] top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-white/15 bg-[#171717]/70 text-white/75 opacity-90 backdrop-blur-md transition-colors hover:border-[#cfac6c]/60 hover:bg-[#cfac6c] hover:text-slate-950 day:border-gray-300 day:bg-white/80 day:text-gray-600"
                    aria-label="Rotate headstone left to view different angles"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={rotateRight}
                    className="absolute right-[5%] sm:right-[15%] md:right-[calc(50%-200px)] top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-white/15 bg-[#171717]/70 text-white/75 opacity-90 backdrop-blur-md transition-colors hover:border-[#cfac6c]/60 hover:bg-[#cfac6c] hover:text-slate-950 day:border-gray-300 day:bg-white/80 day:text-gray-600"
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
                  className="w-full rounded-lg bg-[#cfac6c] px-10 py-4 text-center text-base font-semibold tracking-wide text-slate-950 transition-colors hover:bg-[#d7b979] sm:w-auto"
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
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#171717]/60 px-3 py-1.5 text-xs font-medium tracking-[0.16em] text-white/80 transition-colors hover:border-[#cfac6c]/60 hover:text-white day:border-gray-300 day:bg-white/70 day:text-gray-600 day:hover:border-gray-400 day:hover:text-gray-800"
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
        className="relative overflow-hidden border-t border-white/10 bg-[#0b0b0b] py-16 day:border-gray-200 day:bg-stone-100"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-[#cfac6c] uppercase day:text-amber-700">
                Designer workflow
              </p>
              <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight text-white sm:text-4xl day:text-gray-900">
                The same guided flow, from first choice to final proof
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-gray-300 day:text-gray-600">
                The home page should set expectations for the actual Designer: compact steps, visible progress, live preview, clear pricing, and simple ways to save or ask for help.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {['Plaques first', 'Live preview', 'Save & share', 'Quote before order'].map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-gray-200 day:border-gray-200 day:bg-white day:text-gray-700"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/select-product"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#cfac6c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d7b979]"
                >
                  Start Design Process
                </Link>
                <Link
                  href="/designs"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#cfac6c]/60 hover:bg-white/5 day:border-gray-300 day:text-gray-800 day:hover:bg-white"
                >
                  Browse Designs
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-white/10 bg-[#171717] day:border-gray-200 day:bg-white">
              <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3 day:border-gray-200 day:bg-gray-50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white day:text-gray-900">
                      Designer steps
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400 day:text-gray-500">
                      Mirrors the left navigation in the design tool
                    </p>
                  </div>
                  <span className="rounded-lg bg-[#cfac6c]/15 px-2.5 py-1 text-xs font-semibold text-[#cfac6c] day:bg-amber-50 day:text-amber-700">
                    3 stages
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
                {compassionPhases.map((phase, index) => (
                  <div
                    key={phase.key}
                    className="relative flex min-h-[190px] flex-col rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-[#cfac6c]/50 day:border-gray-200 day:bg-white day:hover:border-[#cfac6c]/60"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#cfac6c]/40 bg-[#cfac6c]/10 text-sm font-semibold text-[#cfac6c]">
                        {`0${index + 1}`}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 day:text-gray-400">
                        {phase.eyebrow}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white day:text-gray-900">
                      {phase.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-300 day:text-gray-600">
                      {phase.summary}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-6 text-gray-400 day:text-gray-500">
                      {phase.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 px-4 py-3 text-sm text-gray-400 day:border-gray-200 day:text-gray-500">
                Tip: start with product selection, then the Designer keeps the canvas visible while you move through shape, material, size, inscriptions, motifs, and price.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative overflow-hidden border-t border-white/10 bg-[#101010] py-10 day:border-gray-200 day:bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.22em] text-[#cfac6c] uppercase day:text-amber-700">
                Ready when you are
              </p>
              <h2 className="mt-2 font-serif text-2xl leading-tight text-white sm:text-3xl day:text-gray-900">
                Design a Plaque, Headstone, or full Memorial with the live Designer
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-300 day:text-gray-600">
                No credit card required. Save progress, share proofs, and request help before production.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
              <Link
                href="/select-product"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#cfac6c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d7b979]"
              >
                Start Design Process
              </Link>
              <a
                href="https://www.forevershining.com.au/contact/"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#cfac6c]/60 hover:bg-white/5 day:border-gray-300 day:text-gray-800 day:hover:bg-gray-50"
              >
                Contact us
              </a>
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
                  IG
                </a>
                <a href="https://www.facebook.com/ForeverShiningAustralia/" target="_blank" rel="noreferrer" aria-label="Forever Shining on Facebook" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors cursor-pointer day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600">
                  FB
                </a>
                <a href="https://www.pinterest.com/forevershining1/" target="_blank" rel="noreferrer" aria-label="Forever Shining on Pinterest" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors cursor-pointer day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600">
                  PI
                </a>
                <a href="https://twitter.com/ForeverShiningA" target="_blank" rel="noreferrer" aria-label="Forever Shining on X" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors cursor-pointer day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600">
                  X
                </a>
                <a href="https://www.youtube.com/@forevershining/featured" target="_blank" rel="noreferrer" aria-label="Forever Shining on YouTube" className="w-9 h-9 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors cursor-pointer day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600">
                  YT
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

