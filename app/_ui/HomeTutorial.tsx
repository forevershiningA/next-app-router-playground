'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { DESIGNER_TUTORIAL_CHAPTERS } from '#/app/_internal/home-tutorial-content';

export default function HomeTutorial() {
  const tutorialVideoRef = useRef<HTMLVideoElement>(null);
  const [activeTutorialChapter, setActiveTutorialChapter] = useState(0);

  const playTutorialChapter = (index: number, time: number) => {
    const video = tutorialVideoRef.current;
    if (!video) return;
    video.currentTime = time;
    setActiveTutorialChapter(index);
    void video.play();
  };

  return (
    <section
      id="how-it-works-tutorial"
      aria-labelledby="tutorial-heading"
      className="day:border-[#e2dad0] day:bg-[#f8f6f0] border-t border-b border-white/10 bg-[#12100e] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center">
          <span className="day:text-[#8a651f] text-xs font-semibold tracking-widest text-[#cfac6c] uppercase">
            Simple 3-Step Process & Interactive Studio
          </span>
          <h2
            id="tutorial-heading"
            className="day:text-[#1d1a17] mt-2 font-serif text-3xl font-normal text-white sm:text-4xl lg:text-5xl"
          >
            How to Design Your Memorial Online
          </h2>
          <p className="day:text-[#625a51] mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/70">
            Design at your own pace. See every photo, granite color, and letter engraving update in realistic 3D lighting with instant pricing.
          </p>
        </div>

        {/* 3 Steps Row */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="day:border-[#e4ddd2] day:bg-white day:shadow-sm relative rounded-sm border border-white/10 bg-[#171512] p-6">
            <span className="day:text-[#8a651f] font-serif text-3xl font-semibold text-[#cfac6c]">
              01
            </span>
            <h3 className="day:text-[#1d1a17] mt-3 font-serif text-xl font-normal text-white">
              Choose Style & Dimensions
            </h3>
            <p className="day:text-[#625a51] mt-2 text-sm leading-relaxed text-white/70">
              Browse upright monuments, cemetery wall plaques, or urns. Pick your foundation profile and enter cemetery plot dimensions.
            </p>
          </div>

          <div className="day:border-[#e4ddd2] day:bg-white day:shadow-sm relative rounded-sm border border-white/10 bg-[#171512] p-6">
            <span className="day:text-[#8a651f] font-serif text-3xl font-semibold text-[#cfac6c]">
              02
            </span>
            <h3 className="day:text-[#1d1a17] mt-3 font-serif text-xl font-normal text-white">
              Personalize in Real-time 3D
            </h3>
            <p className="day:text-[#625a51] mt-2 text-sm leading-relaxed text-white/70">
              Upload photos, position engraved names and verses, add emblems, and rotate your tribute in realistic lighting with instant pricing.
            </p>
          </div>

          <div className="day:border-[#e4ddd2] day:bg-white day:shadow-sm relative rounded-sm border border-white/10 bg-[#171512] p-6">
            <span className="day:text-[#8a651f] font-serif text-3xl font-semibold text-[#cfac6c]">
              03
            </span>
            <h3 className="day:text-[#1d1a17] mt-3 font-serif text-xl font-normal text-white">
              Cemetery Check & Delivery
            </h3>
            <p className="day:text-[#625a51] mt-2 text-sm leading-relaxed text-white/70">
              Our specialists verify cemetery regulations, provide an architectural proof for your sign-off, and craft your memorial with a 30-year warranty.
            </p>
          </div>
        </div>

        {/* Video Tutorial Interactive Player */}
        <div className="day:border-[#e2dad0] day:bg-white day:shadow-sm mt-12 overflow-hidden rounded-sm border border-white/10 bg-[#171512] p-6 lg:p-8">
          <div className="grid gap-6 border-b border-white/10 pb-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end day:border-[#ebe4da]">
            <div>
              <p className="day:text-[#8a651f] text-xs font-semibold tracking-wider text-[#cfac6c] uppercase">
                Guided Video Walkthrough
              </p>
              <h3 className="day:text-[#1d1a17] mt-2 font-serif text-2xl font-normal text-white sm:text-3xl">
                See the 3D Configurator in Action
              </h3>
            </div>
            <p className="day:text-[#625a51] text-sm leading-relaxed text-white/70">
              Click chapters to see how easy it is to customize text, fonts, and photos before starting your own design.
            </p>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.65fr)] lg:items-start">
            <div>
              <div className="overflow-hidden rounded-sm border border-white/15 bg-black shadow-lg">
                <video
                  ref={tutorialVideoRef}
                  controls
                  playsInline
                  preload="metadata"
                  poster="/videos/tutorial-add-inscription-poster.webp"
                  className="aspect-[8/5] w-full bg-black object-cover"
                  aria-label="Tutorial showing how to add and position a personalised inscription in the 3D memorial designer"
                >
                  <source
                    src="/videos/tutorial-add-inscription.webm"
                    type="video/webm"
                  />
                  <source
                    src="/videos/tutorial-add-inscription.mp4"
                    type="video/mp4"
                  />
                </video>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="day:text-[#1d1a17] font-serif text-lg font-medium text-white">
                    Add a personalised inscription
                  </h4>
                  <p className="day:text-[#625a51] text-xs text-white/60">
                    Write your message, adjust size, position directly on stone, and review in 3D.
                  </p>
                </div>
                <span className="day:border-[#cfbfa9] day:text-[#74551d] day:bg-[#ece4d4] rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/80">
                  19 seconds
                </span>
              </div>
            </div>

            <div aria-label="Tutorial chapters">
              <p className="day:text-[#1d1a17] mb-3 text-sm font-semibold text-white/90">
                Chapters
              </p>
              <ol className="day:border-[#ebe4da] divide-y divide-white/10 border-t border-b border-white/10">
                {DESIGNER_TUTORIAL_CHAPTERS.map((chapter, index) => {
                  const isActive = activeTutorialChapter === index;
                  return (
                    <li key={chapter.title}>
                      <button
                        type="button"
                        onClick={() => playTutorialChapter(index, chapter.time)}
                        aria-current={isActive ? 'step' : undefined}
                        className={`group flex min-h-14 w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors ${
                          isActive
                            ? 'day:bg-[#f6f2ea] day:text-[#7b5a20] bg-white/10 text-[#f0d89f]'
                            : 'day:text-[#50483f] day:hover:bg-[#faf8f4] text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="text-sm font-medium">
                          {chapter.title}
                        </span>
                        <span className="text-xs text-white/40 day:text-[#8c8275]">
                          {chapter.duration}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-6">
                <Link
                  href="/select-product"
                  prefetch={false}
                  className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#342e26] inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#cfac6c] px-4 py-2.5 text-xs font-semibold tracking-wider text-[#181611] uppercase transition-colors hover:bg-[#e0c48c]"
                >
                  <span>Try It in 3D Studio</span>
                  <ArrowRightIcon className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
