import Link from 'next/link';
import Image from 'next/image';
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import MemorialPublicHeader from '#/components/MemorialPublicHeader';

export default function HomeSplash() {
  return (
    <>
      <a
        href="#home-heading"
        className="fixed top-4 left-4 z-[10001] -translate-y-24 rounded-md bg-[#cfac6c] px-4 py-2 font-semibold text-slate-950 transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      <MemorialPublicHeader />

      {/* Hero Section */}
      <div
        className="day:border-[#bdb4a6] day:bg-none day:bg-[#f1ede3] relative flex flex-col overflow-hidden border-b border-[#cfac6c]/20 bg-[#100d09]"
        role="banner"
      >
        <div
          id="how-it-works"
          className="relative z-10 mx-auto w-full max-w-7xl scroll-mt-24 px-4 pt-10 pb-14 sm:px-6 sm:pt-12 sm:pb-16 lg:px-8 lg:pb-20"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
            <div className="flex max-w-xl flex-col items-start text-left">
              {/* Category / Craftsmanship pill */}
              <span className="day:border-[#d0c2ad] day:bg-[#e8e0d1] day:text-[#74551d] mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#cfac6c]/40 bg-[#cfac6c]/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#e6cb8b] uppercase">
                <SparklesIcon className="size-3.5" />
                Handcrafted Precision · 3D Online Studio
              </span>

              <h1
                id="home-heading"
                className="day:text-[#1d1a17] !mb-0 scroll-mt-24 !pb-0 font-serif text-[2.25rem] leading-[1.10] tracking-[-0.025em] text-[#f4eee4] sm:text-[2.85rem] lg:text-5xl lg:leading-[1.08]"
              >
                Design a Custom Headstone
                <br className="hidden lg:block" /> or Memorial Plaque
              </h1>

              <p className="day:text-[#5c544a] mt-5 max-w-lg text-base leading-7 text-pretty text-[#bdb3a5] sm:text-lg sm:leading-8">
                Choose the stone, shape, inscription, and meaningful details in
                one guided designer. See every change and the price in 3D, then
                save or share your design when you are ready.
              </p>

              {/* Dual Action CTAs */}
              <div className="relative z-20 mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/select-product"
                  prefetch={false}
                  className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#342e26] inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#cfac6c] px-6 py-3 text-center text-sm font-semibold tracking-[0.015em] text-[#1d1a17] shadow-sm transition-all hover:bg-[#e0c48c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6f511c]"
                  aria-label="Design your memorial in 3D"
                >
                  <span>Start Designing in 3D</span>
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/designs"
                  className="day:border-[#b8ad9e] day:text-[#1d1a17] day:hover:bg-[#e4ddcf] inline-flex min-h-12 items-center justify-center rounded-sm border border-white/20 bg-transparent px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6f511c]"
                >
                  Browse Ready Designs
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Visual Container */}
            <div className="order-first lg:order-none">
              <Link
                href="/select-product"
                prefetch={false}
                aria-label="Open the 3D memorial designer"
                className="group day:border-[#e2dad0] day:bg-white day:shadow-xl relative block overflow-hidden rounded-sm border border-white/15 bg-[#171410] p-3 shadow-2xl transition-all duration-300 hover:border-[#cfac6c]/50"
              >
                <div className="day:border-[#ece5d9] relative aspect-video overflow-hidden rounded-sm border border-white/10 bg-black">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/videos/hero-garden-v9-poster.webp"
                    aria-hidden="true"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:hidden"
                  >
                    <source src="/videos/hero-garden-v9.webm" type="video/webm" />
                    <source src="/videos/hero-garden-v9.mp4" type="video/mp4" />
                  </video>
                  <Image
                    src="/videos/hero-garden-v9-poster.webp"
                    alt="A laptop showing the 3D memorial designer beside a headstone in a garden"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="hidden object-cover motion-reduce:block"
                  />

                  <div className="day:border-[#d5c9b7] day:bg-white/90 day:text-[#70521c] absolute right-3 bottom-3 rounded-full border border-white/20 bg-black/75 px-3 py-1 text-[11px] font-semibold tracking-wider text-[#e6cb8b] uppercase backdrop-blur-xs">
                    ✦ Real-time 3D Configurator
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between px-2 py-1 text-xs">
                  <span className="day:text-[#1d1a17] font-medium text-white/90">
                    Interactive 3D Preview with Instant Pricing
                  </span>
                  <span className="day:text-[#8a651f] flex items-center gap-1 font-semibold text-[#cfac6c]">
                    <span>Explore Studio</span>
                    <ArrowRightIcon className="size-3" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
