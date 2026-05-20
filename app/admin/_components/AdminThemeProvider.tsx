'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggle: () => {},
});

export function useAdminTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = 'admin-theme';

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const ref = useRef<HTMLDivElement>(null);

  // Initialise from localStorage on mount (after hydration)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') setTheme('dark');
  }, []);

  // Keep data attribute in sync
  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute(
        'data-admin-theme',
        theme === 'dark' ? 'dark' : 'light',
      );
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div
        ref={ref}
        data-admin-theme="light"
        className="contents"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
