'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
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

const HeroCanvas = dynamic(() => import('#/components/HeroCanvas'), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex items-center justify-center" style={{ width: '480px', height: '480px' }}>
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
    </div>
  ),
});

export default function HomeSplash() {
  const router = useRouter();
  const [showCanvas, setShowCanvas] = useState(false);
  const [rotation, setRotation] = useState(0);

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

  const rotateLeft = () => {
    setRotation((prev) => prev - Math.PI / 4);
  };

  const rotateRight = () => {
    setRotation((prev) => prev + Math.PI / 4);
  };

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at 50% 100%, #3E3020 0%, #121212 60%)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden" role="banner">
        {/* Blurred background image with increased blur and desaturation */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ 
            backgroundImage: 'url(/backgrounds/tree-2916763_1920.webp)',
            filter: 'blur(12px) saturate(0.85)',
            transform: 'scale(1.1)'
          }}
          role="presentation"
          aria-hidden="true"
        />
        
        {/* Dark gradient from top → middle for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/30" aria-hidden="true" />
        
        {/* Additional subtle overlay for emotional tone */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" aria-hidden="true" />
        
        <div className="relative mx-auto max-w-7xl px-6 pt-3 sm:pt-4 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-serif tracking-tight text-white sm:text-4xl lg:text-5xl mb-2.5 leading-tight">
              <span className="block font-light">Create a Personal Headstone</span>
              <span className="block font-semibold mt-1">Design in Real-Time 3D</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-300 leading-relaxed">
              Create a beautiful, personalized memorial using our free and simple 3D design tool.
              See your headstone exactly as it will look - before you commit.
            </p>
            
            {/* CTAs */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/select-product"
                  className="group rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-7 py-3 text-base font-semibold text-slate-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#cfac6c]/50 hover:from-[#d4af37] hover:to-[#cfac6c]"
                  aria-label="Start designing your custom memorial headstone - choose product type, shape, and personalize with inscriptions"
                >
                  Start Designing (Free)
                </Link>
                <Link
                  href="/designs"
                  className="rounded-full border-2 border-white/20 px-7 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-white/5 hover:border-white/40 hover:shadow-white/20"
                  aria-label="Browse our gallery of pre-designed memorial headstones and monuments for inspiration"
                >
                  Browse Designs →
                </Link>
              </div>
              <div className="flex flex-col items-center gap-1.5 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5 text-[#d4af37]" aria-label="5 star rating">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <p className="text-base font-medium text-white">
                    Trusted by 5,000+ families
                  </p>
                </div>
                <p className="text-sm text-gray-300">
                  No obligation · No credit card required
                </p>
              </div>
            </div>
            
            {/* 3D Canvas Preview */}
            <div className="mt-8 mb-6 min-h-[480px] flex items-center justify-center relative">
              {/* Soft vignette behind the headstone only - tighter and more focused */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[500px] h-[500px] bg-gradient-radial from-black/60 via-black/30 to-transparent rounded-full blur-3xl"></div>
              </div>
              {/* Subtle warm spotlight glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[400px] h-[400px] bg-gradient-radial from-amber-900/25 via-transparent to-transparent rounded-full blur-2xl"></div>
              </div>
              {/* Ground shadow - elliptical shadow under base */}
              <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 w-[320px] h-[80px] bg-black/40 rounded-full pointer-events-none" style={{ filter: 'blur(20px)' }}></div>
              {showCanvas ? (
                <>
                  <HeroCanvas rotation={rotation} />
                  
                  {/* Rotation Label - centered below canvas */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-gray-400 pointer-events-none">
                    <span>← Rotate to View →</span>
                  </div>
                  
                  {/* Rotation Controls - smaller and subtler */}
                  <button 
                    onClick={rotateLeft}
                    className="absolute left-[calc(50%-280px)] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:bg-white/20 hover:border-white/40"
                    aria-label="Rotate headstone left to view different angles"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={rotateRight}
                    className="absolute right-[calc(50%-280px)] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:bg-white/20 hover:border-white/40"
                    aria-label="Rotate headstone right to view different angles"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center" style={{ width: '480px', height: '480px' }}>
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - How It Works */}
      <div className="border-t border-white/10 bg-gradient-to-br from-amber-950/20 via-gray-900/50 to-gray-950">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <h2 className="text-3xl font-serif font-light text-center text-white mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-300 mb-20 max-w-2xl mx-auto text-lg tracking-wide">
            Four simple steps to create a lasting memorial
          </p>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 relative">
            {/* Step 1 */}
            <div className="group relative rounded-2xl border-2 border-[#cfac6c]/30 bg-[#1A1A1A] p-8 pt-10 text-center overflow-visible transition-all hover:border-[#cfac6c]/50 hover:shadow-lg hover:shadow-[#cfac6c]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-4 py-2 text-sm font-semibold text-slate-900 z-20 transition-all group-hover:scale-110 group-hover:shadow-lg">
                Step 1
              </div>
              <div className="mt-4 mb-6 flex justify-center relative z-10">
                <div className="relative">
                  {/* Icon glow */}
                  <div className="absolute inset-0 blur-xl bg-[#cfac6c]/20 rounded-full"></div>
                  <svg className="w-12 h-12 text-[#cfac6c] relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    <rect x="8" y="16" width="8" height="5" strokeWidth={2} rx="1" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3 relative z-10 min-h-[3.5rem] flex items-center justify-center">Choose Product</h3>
              <p className="text-sm text-gray-300 leading-relaxed relative z-10">
                Select from headstones, plaques, monuments, or urns to begin
              </p>
            </div>

            {/* Arrow connector 1-2 (desktop only) */}
            <div className="hidden lg:block absolute top-[100px] left-[23%] -translate-y-1/2 pointer-events-none">
              <svg className="w-8 h-8 text-[#cfac6c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            {/* Step 2 */}
            <div className="group relative rounded-2xl border-2 border-[#cfac6c]/30 bg-[#1A1A1A] p-8 pt-10 text-center overflow-visible transition-all hover:border-[#cfac6c]/50 hover:shadow-lg hover:shadow-[#cfac6c]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-4 py-2 text-sm font-semibold text-slate-900 z-20 transition-all group-hover:scale-110 group-hover:shadow-lg">
                Step 2
              </div>
              <div className="mt-4 mb-6 flex justify-center relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-[#cfac6c]/20 rounded-full"></div>
                  <svg className="w-12 h-12 text-[#cfac6c] relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3 relative z-10 min-h-[3.5rem] flex items-center justify-center">Customize Design</h3>
              <p className="text-sm text-gray-300 leading-relaxed relative z-10">
                Select your shape, material, and size. Add personal inscriptions and choose your fonts
              </p>
            </div>

            {/* Arrow connector 2-3 (desktop only) */}
            <div className="hidden lg:block absolute top-[100px] left-[48%] -translate-y-1/2 pointer-events-none">
              <svg className="w-8 h-8 text-[#cfac6c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            {/* Step 3 */}
            <div className="group relative rounded-2xl border-2 border-[#cfac6c]/30 bg-[#1A1A1A] p-8 pt-10 text-center overflow-visible transition-all hover:border-[#cfac6c]/50 hover:shadow-lg hover:shadow-[#cfac6c]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-4 py-2 text-sm font-semibold text-slate-900 z-20 transition-all group-hover:scale-110 group-hover:shadow-lg">
                Step 3
              </div>
              <div className="mt-4 mb-6 flex justify-center relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-[#cfac6c]/20 rounded-full"></div>
                  <svg className="w-12 h-12 text-[#cfac6c] relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3 relative z-10 min-h-[3.5rem] flex items-center justify-center">Add Details</h3>
              <p className="text-sm text-gray-300 leading-relaxed relative z-10">
                Enhance your memorial with motifs, decorative elements, and custom additions
              </p>
            </div>

            {/* Arrow connector 3-4 (desktop only) */}
            <div className="hidden lg:block absolute top-[100px] left-[73%] -translate-y-1/2 pointer-events-none">
              <svg className="w-8 h-8 text-[#cfac6c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            {/* Step 4 */}
            <div className="group relative rounded-2xl border-2 border-[#cfac6c]/30 bg-[#1A1A1A] p-8 pt-10 text-center overflow-visible transition-all hover:border-[#cfac6c]/50 hover:shadow-lg hover:shadow-[#cfac6c]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-4 py-2 text-sm font-semibold text-slate-900 z-20 transition-all group-hover:scale-110 group-hover:shadow-lg">
                Step 4
              </div>
              <div className="mt-4 mb-6 flex justify-center relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-[#cfac6c]/20 rounded-full"></div>
                  <svg className="w-12 h-12 text-[#cfac6c] relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3 relative z-10 min-h-[3.5rem] flex items-center justify-center">Get Pricing</h3>
              <p className="text-sm text-gray-300 leading-relaxed relative z-10">
                View instant pricing and submit your custom design for production
              </p>
            </div>
          </div>
          
          {/* Final CTA */}
          <div className="mt-20 text-center">
            <Link
              href="/select-product"
              className="inline-block rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-8 py-4 text-lg font-bold text-slate-900 shadow-2xl transition-all hover:scale-105 hover:shadow-[#cfac6c]/30"
            >
              Start Your Design
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid - Design Possibilities */}
      <div className="relative border-t border-white/10 bg-gradient-to-br from-amber-950/10 via-gray-900/50 to-gray-950 overflow-hidden">
        {/* Radial glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-amber-900/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <h2 className="text-3xl font-serif font-light text-center text-white mb-4">
            Design Possibilities
          </h2>
          <p className="text-center text-gray-300 mb-20 max-w-2xl mx-auto text-xl tracking-wide">
            Our comprehensive design system gives you complete creative control
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border-2 border-white/10 bg-[#1A1A1A] p-6 transition-all hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10 text-center">
              <div className="flex justify-center mb-4">
                <Squares2X2Icon className="w-12 h-12 text-[#cfac6c]" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3">
                Multiple Shapes
              </h3>
              <p className="text-sm text-[#E0E0E0] leading-relaxed">
                Choose from 50+ traditional and modern shapes, or upload your own custom SVG design
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border-2 border-white/10 bg-[#1A1A1A] p-6 transition-all hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10 text-center">
              <div className="flex justify-center mb-4">
                <CubeIcon className="w-12 h-12 text-[#cfac6c]" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3">
                Premium Materials
              </h3>
              <p className="text-sm text-[#E0E0E0] leading-relaxed">
                Select from granite, marble, bronze and more with realistic material previews
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border-2 border-white/10 bg-[#1A1A1A] p-6 transition-all hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10 text-center">
              <div className="flex justify-center mb-4">
                <DocumentTextIcon className="w-12 h-12 text-[#cfac6c]" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3">
                Custom Inscriptions
              </h3>
              <p className="text-sm text-[#E0E0E0] leading-relaxed">
                Add personalized text with multiple fonts, sizes, and poetic phrases
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border-2 border-white/10 bg-[#1A1A1A] p-6 transition-all hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10 text-center">
              <div className="flex justify-center mb-4">
                <SparklesIcon className="w-12 h-12 text-[#cfac6c]" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3">
                Decorative Motifs
              </h3>
              <p className="text-sm text-[#E0E0E0] leading-relaxed">
                Browse hundreds of symbols, religious icons, nature elements, and custom artwork
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl border-2 border-white/10 bg-[#1A1A1A] p-6 transition-all hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10 text-center">
              <div className="flex justify-center mb-4">
                <EyeIcon className="w-12 h-12 text-[#cfac6c]" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3">
                3D Preview
              </h3>
              <p className="text-sm text-[#E0E0E0] leading-relaxed">
                See your design in stunning 3D with real-time updates as you make changes
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl border-2 border-white/10 bg-[#1A1A1A] p-6 transition-all hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10 text-center">
              <div className="flex justify-center mb-4">
                <BookmarkIcon className="w-12 h-12 text-[#cfac6c]" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3">
                Save & Share
              </h3>
              <p className="text-sm text-[#E0E0E0] leading-relaxed">
                Save your designs and share them with family members for input and approval
              </p>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="mt-16 text-center">
            <Link
              href="/select-product"
              className="inline-block rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-10 py-4 text-lg font-bold text-slate-900 shadow-2xl transition-all hover:scale-105 hover:shadow-[#cfac6c]/30"
            >
              Try the Designer →
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative border-t border-[#cfac6c]/20 bg-gradient-to-r from-[#cfac6c]/10 to-[#cfac6c]/5 overflow-hidden">
        {/* Radial spotlight background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#cfac6c]/10 via-amber-950/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
          <h2 className="text-3xl font-serif font-light text-white mb-6">
            Ready to Create Your Memorial?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-300 mb-10">
            Start designing in minutes with our easy-to-use online tool. No software to download, 
            design right in your browser.
          </p>
          <Link
            href="/select-product"
            className="inline-block rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-10 py-5 text-lg font-semibold text-slate-900 shadow-2xl transition-all hover:scale-105 hover:shadow-[#cfac6c]/30"
          >
            Start Designing Now →
          </Link>
          <p className="mt-4 text-sm text-gray-400">
            Free to use • No signup required to start
          </p>
        </div>
      </div>

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
