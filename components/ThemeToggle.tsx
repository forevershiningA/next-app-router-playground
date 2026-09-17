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
  // mobile/tablet, so hide the floating toggle below lg there (keep it on lg+).
  const insideDesignerSidebarOnMobile =
    isDesignerRoutePath(pathname) && pathname !== '/';
  const accountRoutePrefixes = [
    '/my-account',
    '/orders',
    '/account',
    '/privacy',
  ];
  const insideAccountSidebarOnMobile = accountRoutePrefixes.some((prefix) =>
    pathname?.startsWith(prefix),
  );
  // On the home page, the mobile control is placed alongside the
  // "Created from experience" heading instead of covering the hero.
  const insideHomeSectionOnMobile = pathname === '/';
  const insideMemorialsOnMobile = pathname?.startsWith('/memorials');

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDay ? 'Switch to night mode' : 'Switch to day mode'}
      title={isDay ? 'Night mode' : 'Day mode'}
      className={`fixed top-5 z-[9999] ${insideMemorialsOnMobile ? 'right-5 left-auto lg:right-auto lg:left-5' : 'left-5'} day:border-[#D7B356]/50 day:bg-white/90 day:text-amber-700 day:hover:border-[#D7B356]/80 day:hover:bg-white day:hover:text-amber-800 h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#1a1208]/80 text-white/60 shadow-md backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-[#1a1208]/95 hover:text-white ${insideDesignerSidebarOnMobile || insideAccountSidebarOnMobile || insideHomeSectionOnMobile || insideMemorialsOnMobile ? 'hidden lg:flex' : 'flex'} `}
    >
      {isDay ? (
        <MoonIcon className="h-4 w-4" />
      ) : (
        <SunIcon className="h-4 w-4" />
      )}
    </button>
  );
}
