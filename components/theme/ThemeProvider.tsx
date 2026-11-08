'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type UiTheme = 'dark' | 'day';

const LS_KEY = 'fs_ui_theme';

interface ThemeContextValue {
  theme: UiTheme;
  toggleTheme: () => void;
  setTheme: (t: UiTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/** Read stored theme from localStorage (client-only, safe for lazy useState init). */
function readStoredTheme(): UiTheme {
  if (typeof window === 'undefined') return 'day';
  try {
    const stored = localStorage.getItem(LS_KEY);
    return stored === 'dark' ? 'dark' : 'day';
  } catch {
    return 'day';
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with 'day' to match SSR; sync from localStorage after mount to avoid hydration mismatch.
  const [theme, setThemeState] = useState<UiTheme>('day');

  // On mount: read localStorage and align state + DOM attribute.
  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    document.documentElement.setAttribute('data-theme', stored);
    document.documentElement.style.colorScheme = stored === 'dark' ? 'dark' : 'light';
  }, []);

  const setTheme = useCallback((t: UiTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem(LS_KEY, t);
    } catch {}
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.style.colorScheme = t === 'dark' ? 'dark' : 'light';
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: UiTheme = prev === 'dark' ? 'day' : 'dark';
      try {
        localStorage.setItem(LS_KEY, next);
      } catch {}
      document.documentElement.setAttribute('data-theme', next);
      document.documentElement.style.colorScheme = next === 'dark' ? 'dark' : 'light';
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
