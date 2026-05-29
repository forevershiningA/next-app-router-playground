'use client';

import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from './ThemeProvider';

/** Fixed circle button — top-left corner, 20px margin, always on top. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDay = theme === 'day';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDay ? 'Switch to night mode' : 'Switch to day mode'}
      title={isDay ? 'Night mode' : 'Day mode'}
      style={{ top: 20, left: 20 }}
      className="
        fixed z-[9999]
        flex h-9 w-9 items-center justify-center
        rounded-full border shadow-md
        transition-all duration-200
        border-white/20 bg-[#1a1208]/80 text-white/60 backdrop-blur-sm
        hover:border-white/40 hover:bg-[#1a1208]/95 hover:text-white
        day:border-[#D7B356]/50 day:bg-white/90 day:text-amber-700
        day:hover:border-[#D7B356]/80 day:hover:bg-white day:hover:text-amber-800
      "
    >
      {isDay ? (
        <MoonIcon className="h-4 w-4" />
      ) : (
        <SunIcon className="h-4 w-4" />
      )}
    </button>
  );
}
