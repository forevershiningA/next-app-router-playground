'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900/20 to-yellow-900/20" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-serif font-light tracking-tight text-white sm:text-6xl lg:text-7xl mb-6">
              Design Your Own Headstone & Memorials Online
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-300 leading-relaxed">
              Create a beautiful, personalized memorial with our intuitive 3D design system. 
              Choose from hundreds of options and see your design come to life in real-time.
            </p>
            
            {/* 3D Canvas Preview */}
            <div className="mt-10 mb-8">
              <HeroCanvas />
            </div>
            
            <div className="flex items-center justify-center gap-6">
              <Link
                href="/select-product"
                className="rounded-full bg-gradient-to-r from-[#cfac6c] to-[#b89a5a] px-8 py-4 text-base font-semibold text-slate-900 shadow-lg transition-all hover:scale-105 hover:shadow-[#cfac6c]/30"
              >
                Start Designing
              </Link>
              <Link
                href="/designs"
                className="rounded-full border border-[#cfac6c]/40 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#cfac6c]/10 hover:border-[#cfac6c]/60"
              >
                Browse Designs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-white/10 bg-gray-900/30">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <h2 className="text-3xl font-serif font-light text-center text-white mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gray-400 px-4 py-2 text-sm font-semibold text-slate-900">
                Step 1
              </div>
              <div className="mt-4 mb-4 flex justify-center">
                <CubeIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Choose Product</h3>
              <p className="text-sm text-gray-400">
                Select from headstones, plaques, monuments, or urns to begin your design
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gray-400 px-4 py-2 text-sm font-semibold text-slate-900">
                Step 2
              </div>
              <div className="mt-4 mb-4 flex justify-center">
                <PencilIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Customize Design</h3>
              <p className="text-sm text-gray-400">
                Pick your shape, material, size, and add inscriptions with various fonts
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gray-400 px-4 py-2 text-sm font-semibold text-slate-900">
                Step 3
              </div>
              <div className="mt-4 mb-4 flex justify-center">
                <PaintBrushIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Add Details</h3>
              <p className="text-sm text-gray-400">
                Enhance with motifs, decorative elements, and custom additions
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-semibold text-slate-900" style={{ backgroundColor: '#cfac6c' }}>
                Step 4
              </div>
              <div className="mt-4 mb-4 flex justify-center">
                <CurrencyDollarIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Get Pricing</h3>
              <p className="text-sm text-gray-400">
                View instant pricing and submit your custom design for production
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <h2 className="text-3xl font-serif font-light text-center text-white mb-4">
            Design Possibilities
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Our comprehensive design system gives you complete creative control
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-3">
                <Squares2X2Icon className="w-6 h-6" />
                Multiple Shapes
              </h3>
              <p className="text-sm text-gray-400">
                Choose from 50+ traditional and modern shapes, or upload your own custom SVG design
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-3">
                <PaintBrushIcon className="w-6 h-6" />
                Premium Materials
              </h3>
              <p className="text-sm text-gray-400">
                Select from granite, marble, bronze and more with realistic material previews
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-3">
                <DocumentTextIcon className="w-6 h-6" />
                Custom Inscriptions
              </h3>
              <p className="text-sm text-gray-400">
                Add personalized text with multiple fonts, sizes, and poetic phrases
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-3">
                <SparklesIcon className="w-6 h-6" />
                Decorative Motifs
              </h3>
              <p className="text-sm text-gray-400">
                Browse hundreds of symbols, religious icons, nature elements, and custom artwork
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-3">
                <EyeIcon className="w-6 h-6" />
                3D Preview
              </h3>
              <p className="text-sm text-gray-400">
                See your design in stunning 3D with real-time updates as you make changes
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-3">
                <BookmarkIcon className="w-6 h-6" />
                Save & Share
              </h3>
              <p className="text-sm text-gray-400">
                Save your designs and share them with family members for input and approval
              </p>
            </div>
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
