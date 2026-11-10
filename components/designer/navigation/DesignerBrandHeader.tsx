'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

type DesignerBrandHeaderProps = {
  isDayTheme: boolean;
  toggleTheme: () => void;
};

export default function DesignerBrandHeader({
  isDayTheme,
  toggleTheme,
}: DesignerBrandHeaderProps) {
  return (
    <>
      {/* Desktop Header */}
      <div className="day:bg-[#f5f1e8] hidden h-24 shrink-0 items-center justify-between bg-[#161412] px-6 md:flex">
        <Link
          href="/"
          className="transition-opacity hover:opacity-85"
          aria-label="Forever Shining home"
        >
          <Image
            src="/ico/forever-transparent-logo-bw.png"
            alt="Forever Shining — Design Online"
            width={400}
            height={246}
            className="h-20 w-auto object-contain"
            priority
          />
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            isDayTheme ? 'Switch to night mode' : 'Switch to day mode'
          }
          title={isDayTheme ? 'Night mode' : 'Day mode'}
          className="day:border-[#dfd7ca] day:bg-white day:text-[#5a5248] day:hover:border-[#9a742f] day:hover:text-[#9a742f] flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white/75 shadow-sm transition-all hover:border-[#c49a45] hover:text-[#c49a45]"
        >
          {isDayTheme ? (
            <MoonIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <SunIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Header */}
      <div className="day:bg-[#f5f1e8] bg-[#161412] px-5 py-4 md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDayTheme ? 'Switch to night mode' : 'Switch to day mode'
              }
              title={isDayTheme ? 'Night mode' : 'Day mode'}
              className="day:border-[#dfd7ca] day:bg-white day:text-[#5a5248] day:hover:border-[#9a742f] day:hover:text-[#9a742f] flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/70 shadow-sm transition-all hover:border-white/40 hover:text-white"
            >
              {isDayTheme ? (
                <MoonIcon className="h-4 w-4" />
              ) : (
                <SunIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          <Link
            href="/"
            className="transition-opacity hover:opacity-85"
            aria-label="Forever Shining home"
          >
            <Image
              src="/ico/forever-transparent-logo-bw.png"
              alt="Forever Shining — Design Online"
              width={400}
              height={246}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>
      </div>
    </>
  );
}
