'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  GOOGLE_REVIEW_HIGHLIGHTS,
  GOOGLE_REVIEWS_URL,
} from '#/app/_internal/home-reviews-content';

export default function HomeReviews() {
  const [reviewsPaused, setReviewsPaused] = useState(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const reviewsTrackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      reviewsPaused ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let resetTimeout: ReturnType<typeof setTimeout> | undefined;
    const interval = window.setInterval(() => {
      const track = reviewsTrackRef.current;
      const firstReview = track?.firstElementChild as HTMLElement | null;
      const secondReview = track?.children[1] as HTMLElement | undefined;
      const loopStart = track?.children[GOOGLE_REVIEW_HIGHLIGHTS.length] as
        | HTMLElement
        | undefined;
      if (!track || !firstReview || !secondReview || !loopStart) return;

      const cardStep = secondReview.offsetLeft - firstReview.offsetLeft;
      const loopWidth = loopStart.offsetLeft - firstReview.offsetLeft;
      const nextPosition = track.scrollLeft + cardStep;
      track.scrollTo({ left: nextPosition, behavior: 'smooth' });

      if (nextPosition >= loopWidth) {
        resetTimeout = setTimeout(() => {
          track.scrollTo({ left: nextPosition - loopWidth, behavior: 'auto' });
        }, 800);
      }
    }, 10_000);

    return () => {
      window.clearInterval(interval);
      if (resetTimeout) clearTimeout(resetTimeout);
    };
  }, [reviewsPaused]);
  const scrollReviews = (direction: -1 | 1) => {
    const track = reviewsTrackRef.current;
    const firstReview = track?.firstElementChild as HTMLElement | null;
    const secondReview = track?.children[1] as HTMLElement | undefined;
    const loopStart = track?.children[GOOGLE_REVIEW_HIGHLIGHTS.length] as
      | HTMLElement
      | undefined;
    if (!track || !firstReview || !secondReview || !loopStart) return;

    const cardStep = secondReview.offsetLeft - firstReview.offsetLeft;
    const loopWidth = loopStart.offsetLeft - firstReview.offsetLeft;
    let currentPosition = track.scrollLeft;

    if (currentPosition >= loopWidth) {
      currentPosition -= loopWidth;
      track.scrollTo({ left: currentPosition, behavior: 'auto' });
    }

    if (direction === -1 && currentPosition <= 1) {
      track.scrollTo({ left: loopWidth, behavior: 'auto' });
      requestAnimationFrame(() => {
        track.scrollTo({ left: loopWidth - cardStep, behavior: 'smooth' });
      });
      return;
    }

    const nextPosition = currentPosition + direction * cardStep;
    track.scrollTo({ left: nextPosition, behavior: 'smooth' });

    if (direction === 1 && nextPosition >= loopWidth) {
      setTimeout(() => {
        track.scrollTo({ left: nextPosition - loopWidth, behavior: 'auto' });
      }, 800);
    }
  };

  const scrollToReview = (index: number) => {
    const track = reviewsTrackRef.current;
    const firstReview = track?.firstElementChild as HTMLElement | null;
    const targetReview = track?.children[index] as HTMLElement | undefined;
    if (!track || !firstReview || !targetReview) return;

    track.scrollTo({
      left: targetReview.offsetLeft - firstReview.offsetLeft,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
    setActiveReviewIndex(index);
  };

  const handleReviewsScroll = () => {
    const track = reviewsTrackRef.current;
    const firstReview = track?.firstElementChild as HTMLElement | null;
    const secondReview = track?.children[1] as HTMLElement | undefined;
    if (!track || !firstReview || !secondReview) return;

    const cardStep = secondReview.offsetLeft - firstReview.offsetLeft;
    const index = Math.round(track.scrollLeft / cardStep);
    setActiveReviewIndex(index % GOOGLE_REVIEW_HIGHLIGHTS.length);
  };
  return (
    <section
      aria-labelledby="google-reviews-heading"
      className="day:border-[#d8cdb9] day:bg-[#f7f4ee] day:text-[#1d1a17] relative overflow-hidden border-b border-[#cfac6c]/20 bg-[#1d1a17] py-10 text-white lg:py-12"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="day:text-[#8a651f] text-sm font-semibold text-[#d8b66f]">
              ★★★★★{' '}
              <span className="day:text-[#625a51] ml-2 text-white/70">
                4.8 from 72 Google reviews
              </span>
            </p>
            <h2
              id="google-reviews-heading"
              className="mt-2 font-serif text-3xl leading-tight"
            >
              Words from families we have helped
            </h2>
          </div>
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="day:border-[#9a742f] day:text-[#6f511c] day:hover:text-[#1d1a17] w-fit border-b border-[#d8b66f] pb-1 text-sm font-semibold text-[#f0d89f] transition-colors hover:text-white"
          >
            Read all reviews on Google
          </a>
        </div>

        <div
          ref={reviewsTrackRef}
          tabIndex={0}
          aria-label="Customer review highlights. Scroll horizontally to see more. Reviews advance automatically every 10 seconds."
          onMouseEnter={() => setReviewsPaused(true)}
          onMouseLeave={() => setReviewsPaused(false)}
          onFocus={() => setReviewsPaused(true)}
          onBlur={() => setReviewsPaused(false)}
          onPointerDown={() => setReviewsPaused(true)}
          onPointerUp={() => setReviewsPaused(false)}
          onScroll={handleReviewsScroll}
          className="day:gap-4 day:border-transparent day:py-3 mt-6 flex touch-pan-x snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth border-t border-l border-white/20 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {[0, 1].map((cycle) =>
            GOOGLE_REVIEW_HIGHLIGHTS.map((review) => (
              <figure
                key={`${cycle}-${review.author}`}
                aria-hidden={cycle === 1}
                className="day:rounded-sm day:border day:border-[#e4ddd2] day:bg-white day:shadow-[0_10px_30px_rgba(0,0,0,0.03)] day:lg:min-w-[calc((100%-2rem)/3)] day:xl:min-w-[calc((100%-3rem)/4)] flex min-h-40 min-w-[270px] snap-start flex-col justify-between border-r border-b border-white/20 p-5 sm:min-w-[310px] sm:p-6 lg:min-w-[33.333333%] xl:min-w-[25%]"
              >
                <span
                  aria-hidden="true"
                  className="day:text-[#9a742f] mb-2 block h-8 font-serif text-5xl leading-none text-[#d8b66f]"
                >
                  “
                </span>
                <p className="day:text-[#1d1a17] font-sans text-base leading-7 text-pretty text-white">
                  {review.text}
                </p>
                <figcaption className="day:text-[#625a51] mt-6 flex flex-col gap-1 text-sm text-white/80">
                  <span className="day:text-[#1d1a17] font-semibold text-white">
                    {review.author}
                  </span>
                  {'category' in review && <span>{review.category}</span>}
                  <span>Google review highlight</span>
                </figcaption>
              </figure>
            )),
          )}
        </div>

        <div
          className="mt-4 flex items-center gap-4"
          onMouseEnter={() => setReviewsPaused(true)}
          onMouseLeave={() => setReviewsPaused(false)}
          onFocus={() => setReviewsPaused(true)}
          onBlur={() => setReviewsPaused(false)}
        >
          <button
            type="button"
            onClick={() => scrollReviews(-1)}
            aria-label="Show previous review"
            className="day:border-[#9a742f]/70 day:text-[#7b5a20] day:hover:border-[#7b5a20] day:hover:bg-[#eee9df] day:hover:text-[#1d1a17] day:focus-visible:ring-[#9a742f] inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d8b66f]/70 text-[#f0d89f] transition-colors hover:border-[#f0d89f] hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#f0d89f] focus-visible:outline-none"
          >
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="group/slider relative flex h-10 flex-1 items-center focus-within:outline-none">
            <div className="day:bg-[#c9bead] pointer-events-none absolute right-0 left-0 h-px overflow-hidden bg-white/20 group-focus-within/slider:h-0.5">
              <span
                className="day:bg-[#9a742f] absolute inset-y-0 left-0 bg-[#d8b66f] transition-[width] duration-500"
                style={{
                  width: `${((activeReviewIndex + 1) / GOOGLE_REVIEW_HIGHLIGHTS.length) * 100}%`,
                }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={GOOGLE_REVIEW_HIGHLIGHTS.length - 1}
              step={1}
              value={activeReviewIndex}
              onChange={(event) => scrollToReview(Number(event.target.value))}
              aria-label="Choose a customer review"
              aria-valuetext={`Review ${activeReviewIndex + 1} of ${GOOGLE_REVIEW_HIGHLIGHTS.length}`}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
          <span className="sr-only" aria-live="polite">
            Review {activeReviewIndex + 1} of {GOOGLE_REVIEW_HIGHLIGHTS.length}
          </span>
          <button
            type="button"
            onClick={() => scrollReviews(1)}
            aria-label="Show next review"
            className="day:border-[#9a742f]/70 day:text-[#7b5a20] day:hover:border-[#7b5a20] day:hover:bg-[#eee9df] day:hover:text-[#1d1a17] day:focus-visible:ring-[#9a742f] inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d8b66f]/70 text-[#f0d89f] transition-colors hover:border-[#f0d89f] hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#f0d89f] focus-visible:outline-none"
          >
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
