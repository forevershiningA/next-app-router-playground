'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';
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
      id="video-tutorials"
      aria-labelledby="video-tutorials-heading"
      className="day:bg-[#f7f4ee] day:text-[#1d1a17] border-b border-white/10 bg-[#171512] py-20 text-white"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-6 border-b border-[#8f826f]/45 pb-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="max-w-3xl">
            <p className="day:text-[#7b5a20] text-xs font-semibold tracking-[0.12em] text-[#d0ad68]">
              Video tutorials
            </p>
            <h2
              id="video-tutorials-heading"
              className="mt-4 font-serif text-3xl leading-[1.16] text-pretty sm:text-5xl"
            >
              Learn the 3D memorial designer step by step
            </h2>
          </div>
          <p className="day:text-[#625a51] text-sm leading-6 text-gray-300 lg:pb-1">
            Jump directly to the feature you need. See how each choice changes
            the memorial before working on your own design.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,.65fr)] lg:items-start">
          <div>
            <div className="day:border-[#cfc5b7] day:bg-[#e7e0d5] overflow-hidden border border-white/15 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
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
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Add a personalised inscription
                </h3>
                <p className="day:text-[#625a51] mt-1 max-w-2xl text-sm leading-6 text-gray-300">
                  Write your message, adjust its size, position it directly on
                  the memorial, and review the result in 3D.
                </p>
              </div>
              <span className="day:border-[#bdb4a6] day:text-[#625a51] shrink-0 border border-white/20 px-3 py-1.5 text-xs text-gray-300">
                19 seconds
              </span>
            </div>
          </div>

          <div aria-label="Tutorial chapters">
            <p className="day:text-[#625a51] mb-3 text-sm font-semibold text-gray-300">
              Chapters
            </p>
            <ol className="day:border-[#bdb4a6] border-t border-white/15">
              {DESIGNER_TUTORIAL_CHAPTERS.map((chapter, index) => {
                const isActive = activeTutorialChapter === index;
                return (
                  <li
                    key={chapter.title}
                    className="day:border-[#bdb4a6] border-b border-white/15"
                  >
                    <button
                      type="button"
                      onClick={() => playTutorialChapter(index, chapter.time)}
                      aria-current={isActive ? 'step' : undefined}
                      className={`group flex min-h-16 w-full items-center gap-4 px-2 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[#cfac6c] focus-visible:outline-none focus-visible:ring-inset ${
                        isActive
                          ? 'day:bg-[#eee9df] bg-white/[0.07]'
                          : 'day:hover:bg-[#eee9df]/70 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                          isActive
                            ? 'border-[#cfac6c] bg-[#cfac6c] text-[#17120a]'
                            : 'day:border-[#9a742f] day:text-[#7b5a20] border-white/25 text-white group-hover:border-[#cfac6c]'
                        }`}
                      >
                        <PlayIcon
                          className="ml-0.5 h-4 w-4"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">
                          {chapter.title}
                        </span>
                        <span className="day:text-[#756c62] mt-0.5 block text-xs text-gray-400">
                          Starts at {chapter.duration}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <Link
              href="/select-product"
              prefetch={false}
              className="day:text-[#6f511c] mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#e3c887] underline decoration-[#cfac6c]/60 underline-offset-4 transition-colors hover:text-[#f0d89f]"
            >
              Try these steps in the designer
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
