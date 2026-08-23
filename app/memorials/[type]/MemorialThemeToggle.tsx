'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '#/components/ThemeProvider';

export default function MemorialThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDay = theme === 'day';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDay ? 'Switch to night mode' : 'Switch to day mode'}
      title={isDay ? 'Night mode' : 'Day mode'}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#1a1208]/80 text-white/60 shadow-md backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-[#1a1208]/95 hover:text-white day:border-[#D7B356]/50 day:bg-white/90 day:text-amber-700 day:hover:border-[#D7B356]/80 day:hover:bg-white day:hover:text-amber-800"
    >
      {isDay ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
    </button>
  );
}
