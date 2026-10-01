'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, MouseEvent } from 'react';
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
import { useTheme } from '#/components/theme/ThemeProvider';
import { homeFaqItems } from '#/app/_internal/home-content';

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
    designLabel: 'Design a headstone',
    learnMoreHref: '/memorials/headstones',
  },
  {
    name: 'Traditional Engraved Headstone',
    category: 'Granite memorials',
    description:
      'Choose a traditional granite headstone shape, stone colour, engraved wording, motifs, and coordinated memorial accessories.',
    image: '/webp/products/APP_ID_124-medium.webp',
    href: '/traditional-engraved-headstone/select-shape',
    designLabel: 'Design a headstone',
    learnMoreHref: '/memorials/headstones',
  },
  {
    name: 'Bronze Memorial Plaque',
    category: 'Memorial plaques',
    description:
      'Design a cast bronze plaque with a custom border, background, raised inscription, emblems, motifs, and fixing system.',
    image: '/webp/products/APP_ID_5-medium.webp',
    href: '/bronze-plaque/select-shape',
    designLabel: 'Design a bronze plaque',
    learnMoreHref: '/memorials/plaques',
  },
  {
    name: 'Full Colour Memorial Plaque',
    category: 'Personalised plaques',
    description:
      'Combine photographs, colour backgrounds, meaningful text, and decorative details in a durable personalised memorial plaque.',
    image: '/webp/products/APP_ID_32-medium.webp',
    href: '/full-colour-plaque/select-shape',
    designLabel: 'Design a memorial plaque',
    learnMoreHref: '/memorials/plaques',
  },
  {
    name: 'Black Granite Full Monument',
    category: 'Full monuments',
    description:
      'Plan a complete granite monument with a headstone, bases, kerbs, cover, inscriptions, portraits, and coordinated additions.',
    image: '/webp/products/APP_ID_100-medium.webp',
    href: '/laser-etched-black-granite-full-monument/select-shape',
    designLabel: 'Design a full monument',
    learnMoreHref: '/memorials/full-monuments',
  },
  {
    name: 'Stainless Steel Memorial Urn',
    category: 'Memorial urns',
    description:
      'Personalise a stainless steel vitreous enamel inlaid urn with imagery, colour, wording, and a carefully selected finish.',
    image: '/webp/products/APP_ID_2350-medium.webp',
    href: '/stainless-steel-vitreous-enamel-inlaid-urn/select-shape',
    designLabel: 'Design a memorial urn',
    learnMoreHref: '/memorials/urns',
  },
  {
    name: 'Black Granite Mini Headstone',
    category: 'Mini headstones',
    description:
      'Create a compact black granite memorial with a laser-etched portrait, inscription, and artwork for a garden or smaller resting place.',
    image: '/webp/products/APP_ID_22-medium.webp',
    href: '/laser-etched-black-granite-mini-headstone/select-shape',
    designLabel: 'Design a mini headstone',
    learnMoreHref: '/memorials/headstones',
  },
  {
    name: 'Stainless Steel Memorial Plaque',
    category: 'Metal memorial plaques',
    description:
      'Design a durable YAG-lasered stainless steel plaque with precise wording, imagery, motifs, and fixing options for indoor or outdoor display.',
    image: '/webp/products/APP_ID_52-medium.webp',
    href: '/yag-lasered-stainless-steel-plaque/select-shape',
    designLabel: 'Design a steel plaque',
    learnMoreHref: '/memorials/plaques',
  },
  {
    name: 'Laser-Etched Pet Memorial Plaque',
    category: 'Pet memorials',
    description:
      'Remember a beloved companion with a personalised black granite pet plaque featuring their portrait, name, dates, and a meaningful message.',
    image: '/webp/products/APP_ID_9-medium.webp',
    href: '/laser-etched-pet-plaque/select-shape',
    designLabel: 'Design a pet plaque',
    learnMoreHref: '/memorials/pet-memorials',
  },
  {
    name: 'Stainless Steel Light Transmitting Headstone',
    category: 'Stainless steel headstones',
    description:
      'Create a contemporary stainless steel headstone with light-transmitting inscriptions and motifs, a glass backing, and a matching base.',
    image: '/webp/products/APP_ID_1-medium.webp',
    href: '/stainless-steel-light-transmitting-headstone/select-shape',
    designLabel: 'Design a steel headstone',
    learnMoreHref: '/memorials/headstones',
  },
  {
    name: 'Traditional Engraved Memorial Plaque',
    category: 'Engraved granite plaques',
    description:
      'Choose a granite or stone finish and add deeply engraved lettering, borders, photographs, and motifs to a traditional memorial plaque.',
    image: '/webp/products/APP_ID_34-medium.webp',
    href: '/traditional-engraved-plaque/select-shape',
    designLabel: 'Design an engraved plaque',
    learnMoreHref: '/memorials/plaques',
  },
  {
    name: 'Traditional Engraved Full Monument',
    category: 'Traditional monuments',
    description:
      'Design a complete traditional monument with coordinated granite elements, engraved inscriptions, decorative motifs, and memorial accessories.',
    image: '/webp/products/APP_ID_101-medium.webp',
    href: '/traditional-engraved-full-monument/select-shape',
    designLabel: 'Design a full monument',
    learnMoreHref: '/memorials/full-monuments',
  },
] as const;

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
  const [activeModal, setActiveModal] = useState<HashModalKey | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleHashLink = (slug: HashModalKey) => (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setActiveModal(slug);
  };

  const closeModal = () => setActiveModal(null);
  const activeModalContent = activeModal ? HASH_MODAL_CONTENT[activeModal] : null;

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

  return (
    <div
      className="min-h-screen"
      style={{ background: 'radial-gradient(circle at 50% 100%, #3E3020 0%, #121212 60%)' }}
    >
      
      {/* Hero Section */}
      <div
        className="relative flex h-[min(600px,100svh)] min-h-[560px] max-h-[600px] flex-col overflow-hidden"
        role="banner"
      >
        
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

            <nav className="absolute left-1/2 hidden -translate-x-1/2 text-center xl:block" aria-label="Memorial product pages">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f3d48f]">
                You design it. We craft it.
              </p>
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
        
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-grow flex-col justify-center px-4 pb-14 pt-[150px] sm:px-6 sm:pb-16 sm:pt-[145px] lg:px-8">
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
                Custom Headstones, Monuments<br className="hidden lg:block" />{' '}
                &amp; Memorial Plaques
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
              Personalise every detail and preview it in 3D.
            </p>
            
            <div className="order-3 relative z-20 mt-8 flex flex-col items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <Link
                  href="/select-product"
                  prefetch={false}
                  className="inline-flex w-auto items-center justify-center gap-2 rounded-lg bg-[#cfac6c] px-7 py-3.5 text-center text-sm font-semibold tracking-wide text-slate-950 transition-colors hover:bg-[#d7b979] sm:px-10 sm:py-4 sm:text-base"
                  aria-label="Start designing a memorial in 3D"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Design Your Memorial in 3D
                  <ArrowRightIcon className="relative top-px h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex w-auto items-center justify-center rounded-lg border-2 border-white/65 bg-white/15 px-7 py-3.5 text-center text-sm font-semibold tracking-wide text-white shadow-lg shadow-black/15 backdrop-blur-sm transition-colors hover:border-[#cfac6c] hover:bg-white/25 sm:px-10 sm:py-4 sm:text-base"
                >
                  How Our Memorial Designer Works
                </Link>
              </div>
              <p className="text-center text-xs font-medium tracking-wide text-white/85 sm:text-sm">
                Design online · Save and share your proof · Review pricing before ordering
              </p>
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
                Design a Personalised Memorial Online in 3D
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

      {/* Search-friendly product entry point outside the designer shell. */}
      <section
        aria-labelledby="home-products-heading"
        className="relative overflow-hidden border-y border-white/10 bg-[#11100e] py-16 day:border-gray-200 day:bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold tracking-[0.24em] text-[#cfac6c] uppercase day:text-amber-700">
              Choose your memorial
            </p>
            <h2
              id="home-products-heading"
              className="mt-3 font-serif text-3xl leading-tight text-white sm:text-4xl day:text-gray-900"
            >
              Design a custom headstone, plaque, monument, or urn online
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-300 day:text-gray-600">
              Start with the memorial that best suits your family, cemetery, or setting. Each guided designer lets you compare shapes, materials, sizes, inscriptions, images, and meaningful details before ordering.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_PRODUCT_OPTIONS.map((product) => (
              <article
                key={product.href}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/12 bg-[#171717] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#cfac6c]/65 hover:shadow-xl hover:shadow-black/20 day:border-gray-200 day:bg-white day:hover:border-[#cfac6c]/65 day:hover:shadow-gray-200/70"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#101010] day:bg-[#f3f1ed]">
                  <Image
                    src={product.image}
                    alt={`${product.name} available to personalise online`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[11px] font-semibold tracking-[0.15em] text-[#cfac6c] uppercase day:text-amber-700">
                    {product.category}
                  </p>
                  <h3 className="mt-2 text-lg leading-snug font-semibold text-white day:text-gray-900">
                    {product.name}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-gray-300 day:text-gray-600">
                    {product.description}
                  </p>
                  <div className="mt-5 grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-2">
                    <Link
                      href={product.href}
                      prefetch={false}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-[#cfac6c] px-3 py-2.5 text-center text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d7b979] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3d48f]"
                    >
                      {product.designLabel}
                      <ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </Link>
                    <Link
                      href={product.learnMoreHref}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:border-[#cfac6c]/70 hover:bg-white/[0.06] day:border-gray-300 day:text-gray-800 day:hover:bg-gray-50"
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
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#cfac6c] px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d7b979]"
            >
              View all memorial products
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="max-w-2xl text-xs leading-5 text-gray-400 day:text-gray-500">
              You can save your design, share it with family, and review pricing before making a final decision.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f4f1eb] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.24em] text-[#a77d32] uppercase">
                A clear design process
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-[#1d1a17] sm:text-4xl">
                How to Design Your Memorial Online
              </h2>
              <p className="mt-3 text-base leading-7 text-[#625a51]">
                Work through each decision at your own pace. The 3D preview updates as you choose the product, dimensions, wording, and personal details.
              </p>
              <Link
                href="/select-product"
                prefetch={false}
                className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-[#cfac6c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d7b979]"
              >
                Choose a memorial product
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <ol className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: 'Choose the memorial',
                  description:
                    'Compare headstones, plaques, monuments, urns, and pet memorials before opening the designer.',
                },
                {
                  title: 'Personalise the details',
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
                  className="rounded-xl border border-[#d9d1c5] bg-white p-5 shadow-sm"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#cfac6c] text-sm font-bold text-slate-950">
                    {index + 1}
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
        className="relative border-t border-white/10 bg-[#0b0b0b] py-16 day:border-gray-200 day:bg-stone-100"
      >
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.24em] text-[#cfac6c] uppercase day:text-amber-700">
              Memorial design questions
            </p>
            <h2
              id="home-faq-heading"
              className="mt-3 font-serif text-3xl leading-tight text-white sm:text-4xl day:text-gray-900"
            >
              Frequently Asked Questions About Designing a Memorial
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-300 day:text-gray-600">
              Practical answers about personalisation, cemetery requirements, saving a design, and ordering from your region.
            </p>
          </div>

          <div className="mt-9 space-y-3">
            {homeFaqItems.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className="group rounded-xl border border-white/12 bg-white/[0.04] px-5 py-4 day:border-gray-200 day:bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-white marker:content-none day:text-gray-900">
                  {item.question}
                  <span
                    className="text-xl leading-none text-[#cfac6c] transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-300 day:text-gray-600">
                  {item.answer}
                </p>
              </details>
            ))}
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
                Get Help Choosing a Headstone, Plaque, or Memorial
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

