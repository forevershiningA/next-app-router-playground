'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useAdminTheme } from './AdminThemeProvider';

export function ThemeToggle() {
  const { theme, toggle } = useAdminTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to day mode' : 'Switch to night mode'}
      className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {isDark ? (
        <>
          <SunIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Day</span>
        </>
      ) : (
        <>
          <MoonIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Night</span>
        </>
      )}
    </button>
  );
}
