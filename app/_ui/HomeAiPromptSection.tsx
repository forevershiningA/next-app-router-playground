'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';
import HomeVirtualDesignerBar from './HomeVirtualDesignerBar';

export default function HomeAiPromptSection() {
  return (
    <section
      aria-labelledby="ai-designer-heading"
      className="day:border-[#e2dad0] day:bg-[#f1ede3] relative border-y border-white/10 bg-[#12100e] py-14 sm:py-16"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="day:border-[#d0c2ad] day:bg-[#e8e0d1] day:text-[#74551d] inline-flex items-center gap-1.5 rounded-full border border-[#cfac6c]/40 bg-[#cfac6c]/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#e6cb8b] uppercase">
            <SparklesIcon className="size-3.5" />
            AI Memorial Assistant
          </span>

          <h2
            id="ai-designer-heading"
            className="day:text-[#1d1a17] mt-3 font-serif text-2xl font-normal text-white sm:text-3xl lg:text-4xl"
          >
            Describe Your Memorial Idea in Your Own Words
          </h2>

          <p className="day:text-[#5c544a] mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Tell our assistant who the tribute is for, preferred materials (granite, bronze, stainless steel),
            or heartfelt inscriptions. We will instantly configure a 3D draft for you.
          </p>
        </div>

        <div className="mt-8">
          <HomeVirtualDesignerBar />
        </div>
      </div>
    </section>
  );
}
