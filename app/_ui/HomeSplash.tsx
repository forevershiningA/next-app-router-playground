'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import {
  CubeIcon,
  PencilIcon,
  PaintBrushIcon,
  CurrencyDollarIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  SparklesIcon,
  EyeIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Top Navigation */}
      <nav className="relative border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif font-light text-white">Forever Shining - Design online</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm">
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
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Atmospheric background with radial glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/30 to-yellow-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-900/20 via-transparent to-transparent rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-6 pt-12 sm:pt-16 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-serif tracking-tight text-white sm:text-6xl lg:text-7xl mb-6 leading-tight">
              <span className="block font-light">Design Your Own</span>
              <span className="block font-semibold mt-3">Headstones & Memorials</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-300 leading-relaxed">
              Create a beautiful, personalized memorial with our intuitive 3D design system. 
              Choose from hundreds of options and see your design come to life in real-time.
            </p>
            
            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-6">
                <Link
                  href="/select-product"
                  className="group rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-8 py-4 text-base font-semibold text-slate-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#cfac6c]/50 hover:from-[#d4af37] hover:to-[#cfac6c]"
                >
                  Start Designing
                </Link>
                <Link
                  href="/designs"
                  className="rounded-full border-2 border-white/20 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-white/5 hover:border-white/40 hover:shadow-white/20"
                >
                  Browse Designs →
                </Link>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                No credit card required • Trusted by 5,000+ families
              </p>
            </div>
            
            {/* 3D Canvas Preview */}
            <div className="mt-12 mb-8 min-h-[480px] flex items-center justify-center relative">
              {showCanvas ? (
                <>
                  <HeroCanvas rotation={rotation} />
                  {/* Rotation Controls */}
                  <button 
                    onClick={rotateLeft}
                    className="absolute left-[calc(50%-280px)] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] border-0 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 hover:shadow-xl hover:shadow-[#cfac6c]/50 hover:from-[#d4af37] hover:to-[#cfac6c]"
                    aria-label="Rotate left"
                  >
                    <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={rotateRight}
                    className="absolute right-[calc(50%-280px)] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] border-0 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 hover:shadow-xl hover:shadow-[#cfac6c]/50 hover:from-[#d4af37] hover:to-[#cfac6c]"
                    aria-label="Rotate right"
                  >
                    <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
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
            <div className="group relative rounded-2xl border border-amber-900/20 bg-gradient-to-br from-amber-950/10 to-gray-900/30 p-8 pt-10 text-center overflow-visible transition-all hover:border-amber-900/40">
              {/* Large background number */}
              <div className="absolute bottom-4 right-4 text-8xl font-serif text-white/[0.03] pointer-events-none">01</div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-4 py-2 text-sm font-semibold text-slate-900 z-20 transition-all group-hover:scale-110 group-hover:shadow-lg">
                Step 1
              </div>
              <div className="mt-4 mb-6 flex justify-center relative z-10">
                <div className="relative">
                  {/* Icon glow */}
                  <div className="absolute inset-0 blur-xl bg-[#cfac6c]/20 rounded-full"></div>
                  <svg className="w-12 h-12 text-[#cfac6c] relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    <rect x="8" y="16" width="8" height="5" strokeWidth={1.5} rx="1" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3 relative z-10">Choose Product</h3>
              <p className="text-sm text-gray-300 leading-relaxed relative z-10">
                Select from headstones, plaques, monuments, or urns to begin your design
              </p>
            </div>

            {/* Arrow connector 1-2 (desktop only) */}
            <div className="hidden lg:block absolute top-[100px] left-[23%] -translate-y-1/2 text-[#cfac6c]/30 text-2xl pointer-events-none">→</div>

            {/* Step 2 */}
            <div className="group relative rounded-2xl border border-amber-900/20 bg-gradient-to-br from-amber-950/10 to-gray-900/30 p-8 pt-10 text-center overflow-visible transition-all hover:border-amber-900/40">
              <div className="absolute bottom-4 right-4 text-8xl font-serif text-white/[0.03] pointer-events-none">02</div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-700 px-4 py-2 text-sm font-semibold text-white z-20 transition-all group-hover:bg-gradient-to-r group-hover:from-[#cfac6c] group-hover:to-[#b89a5a] group-hover:text-slate-900 group-hover:scale-110 group-hover:shadow-lg">
                Step 2
              </div>
              <div className="mt-4 mb-6 flex justify-center relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-white/10 rounded-full"></div>
                  <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3 relative z-10">Customize Design</h3>
              <p className="text-sm text-gray-300 leading-relaxed relative z-10">
                Pick your shape, material, size, and add inscriptions with various fonts
              </p>
            </div>

            {/* Arrow connector 2-3 (desktop only) */}
            <div className="hidden lg:block absolute top-[100px] left-[48%] -translate-y-1/2 text-[#cfac6c]/30 text-2xl pointer-events-none">→</div>

            {/* Step 3 */}
            <div className="group relative rounded-2xl border border-amber-900/20 bg-gradient-to-br from-amber-950/10 to-gray-900/30 p-8 pt-10 text-center overflow-visible transition-all hover:border-amber-900/40">
              <div className="absolute bottom-4 right-4 text-8xl font-serif text-white/[0.03] pointer-events-none">03</div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-700 px-4 py-2 text-sm font-semibold text-white z-20 transition-all group-hover:bg-gradient-to-r group-hover:from-[#cfac6c] group-hover:to-[#b89a5a] group-hover:text-slate-900 group-hover:scale-110 group-hover:shadow-lg">
                Step 3
              </div>
              <div className="mt-4 mb-6 flex justify-center relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-white/10 rounded-full"></div>
                  <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3 relative z-10">Add Details</h3>
              <p className="text-sm text-gray-300 leading-relaxed relative z-10">
                Enhance with motifs, decorative elements, and custom additions
              </p>
            </div>

            {/* Arrow connector 3-4 (desktop only) */}
            <div className="hidden lg:block absolute top-[100px] left-[73%] -translate-y-1/2 text-[#cfac6c]/30 text-2xl pointer-events-none">→</div>

            {/* Step 4 */}
            <div className="group relative rounded-2xl border border-amber-900/20 bg-gradient-to-br from-amber-950/10 to-gray-900/30 p-8 pt-10 text-center overflow-visible transition-all hover:border-amber-900/40">
              <div className="absolute bottom-4 right-4 text-8xl font-serif text-white/[0.03] pointer-events-none">04</div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-700 px-4 py-2 text-sm font-semibold text-white z-20 transition-all group-hover:bg-gradient-to-r group-hover:from-[#cfac6c] group-hover:to-[#b89a5a] group-hover:text-slate-900 group-hover:scale-110 group-hover:shadow-lg">
                Step 4
              </div>
              <div className="mt-4 mb-6 flex justify-center relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-white/10 rounded-full"></div>
                  <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-serif font-semibold text-white mb-3 relative z-10">Get Pricing</h3>
              <p className="text-sm text-gray-300 leading-relaxed relative z-10">
                View instant pricing and submit your custom design for production
              </p>
            </div>
          </div>
          
          {/* Final CTA */}
          <div className="mt-20 text-center">
            <Link
              href="/select-product"
              className="inline-block rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-10 py-4 text-lg font-bold text-slate-900 shadow-2xl transition-all hover:scale-105 hover:shadow-[#cfac6c]/30"
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
          <p className="text-center text-gray-300 mb-16 max-w-2xl mx-auto text-lg tracking-wide">
            Our comprehensive design system gives you complete creative control
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-amber-900/20 bg-[#1A1A1A] p-6 transition-all hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10">
              <h3 className="text-xl font-serif font-semibold text-white mb-3 flex items-center gap-3">
                <Squares2X2Icon className="w-6 h-6 text-[#cfac6c]" />
                Multiple Shapes
              </h3>
              <p className="text-sm text-white/75 leading-relaxed">
                Choose from 50+ traditional and modern shapes, or upload your own custom SVG design
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-amber-900/20 bg-[#1A1A1A] p-6 transition-all hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10">
              <h3 className="text-xl font-serif font-semibold text-white mb-3 flex items-center gap-3">
                <PaintBrushIcon className="w-6 h-6 text-[#cfac6c]" />
                Premium Materials
              </h3>
              <p className="text-sm text-white/75 leading-relaxed">
                Select from granite, marble, bronze and more with realistic material previews
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-amber-900/20 bg-[#1A1A1A] p-6 transition-all hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10">
              <h3 className="text-xl font-serif font-semibold text-white mb-3 flex items-center gap-3">
                <DocumentTextIcon className="w-6 h-6 text-[#cfac6c]" />
                Custom Inscriptions
              </h3>
              <p className="text-sm text-white/75 leading-relaxed">
                Add personalized text with multiple fonts, sizes, and poetic phrases
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-amber-900/20 bg-[#1A1A1A] p-6 transition-all hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10">
              <h3 className="text-xl font-serif font-semibold text-white mb-3 flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-[#cfac6c]" />
                Decorative Motifs
              </h3>
              <p className="text-sm text-white/75 leading-relaxed">
                Browse hundreds of symbols, religious icons, nature elements, and custom artwork
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl border border-amber-900/20 bg-[#1A1A1A] p-6 transition-all hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10">
              <h3 className="text-xl font-serif font-semibold text-white mb-3 flex items-center gap-3">
                <EyeIcon className="w-6 h-6 text-[#cfac6c]" />
                3D Preview
              </h3>
              <p className="text-sm text-white/75 leading-relaxed">
                See your design in stunning 3D with real-time updates as you make changes
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl border border-amber-900/20 bg-[#1A1A1A] p-6 transition-all hover:border-[#cfac6c]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#cfac6c]/10">
              <h3 className="text-xl font-serif font-semibold text-white mb-3 flex items-center gap-3">
                <BookmarkIcon className="w-6 h-6 text-[#cfac6c]" />
                Save & Share
              </h3>
              <p className="text-sm text-white/75 leading-relaxed">
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
              Try the Designer
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-[#cfac6c]/20 bg-gradient-to-r from-[#cfac6c]/10 to-[#cfac6c]/5">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
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
            Design Your Own
          </Link>
        </div>
      </div>
    </div>
  );
}
