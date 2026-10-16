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
      <div className="day:border-[#cfc5b7] hidden min-h-36 items-center justify-between border-b border-white/10 px-6 md:flex">
        <Link
          href="/"
          className="transition-opacity hover:opacity-75"
          aria-label="Forever Shining home"
        >
          <Image
            src="/ico/forever-transparent-logo-bw.png"
            alt="Forever Shining — Design Online"
            width={400}
            height={246}
            className="h-32 w-auto object-contain"
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
          className="day:border-[#bdb4a6] day:bg-white/25 day:text-[#1d1a17] flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-white/75 transition-colors hover:border-[#cfac6c] hover:text-[#cfac6c]"
        >
          {isDayTheme ? (
            <MoonIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <SunIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Header */}
      <div className="day:border-[#cfc5b7] day:bg-[#eee9df] border-b border-white/10 bg-[#1d1a17] px-5 py-4 md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDayTheme ? 'Switch to night mode' : 'Switch to day mode'
              }
              title={isDayTheme ? 'Night mode' : 'Day mode'}
              className="day:border-gray-300 day:bg-white/70 day:text-amber-700 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 transition-colors hover:border-white/40 hover:text-white"
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
            className="transition-opacity hover:opacity-75"
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
