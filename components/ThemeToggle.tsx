'use client';

import { usePathname } from 'next/navigation';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { isDesignerRoutePath } from '#/lib/designer-route-state';
import { useTheme } from './ThemeProvider';

/** Fixed circle button — top-left corner, always on top. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const isDay = theme === 'day';

  // Designs pages always use white background — toggle not needed and would overlap the sidebar logo
  if (pathname?.startsWith('/designs')) return null;

  // On designer steps the day/night toggle lives inside the left sidebar on
  // mobile, so hide the floating toggle below md there (keep it on md+).
  const insideDesignerSidebarOnMobile =
    isDesignerRoutePath(pathname) && pathname !== '/';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDay ? 'Switch to night mode' : 'Switch to day mode'}
      title={isDay ? 'Night mode' : 'Day mode'}
      className={`
        fixed top-5 left-5 z-[9999]
        h-9 w-9 items-center justify-center
        rounded-full border shadow-md
        transition-all duration-200
        border-white/20 bg-[#1a1208]/80 text-white/60 backdrop-blur-sm
        hover:border-white/40 hover:bg-[#1a1208]/95 hover:text-white
        day:border-[#D7B356]/50 day:bg-white/90 day:text-amber-700
        day:hover:border-[#D7B356]/80 day:hover:bg-white day:hover:text-amber-800
        ${insideDesignerSidebarOnMobile ? 'hidden md:flex' : 'flex'}
      `}
    >
      {isDay ? (
        <MoonIcon className="h-4 w-4" />
      ) : (
        <SunIcon className="h-4 w-4" />
      )}
    </button>
  );
}
