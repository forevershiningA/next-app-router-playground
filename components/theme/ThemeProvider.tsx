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

function readStoredTheme(): UiTheme | null {
  try {
    const stored = localStorage.getItem(LS_KEY);
    return stored === 'dark' || stored === 'day' ? stored : null;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with 'day' to match SSR; sync from localStorage after mount to avoid hydration mismatch.
  const [theme, setThemeState] = useState<UiTheme>('day');

  // Follow the system until the user explicitly chooses a theme.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = () => {
      const resolved = readStoredTheme() ?? (media.matches ? 'dark' : 'day');
      setThemeState(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
      document.documentElement.style.colorScheme = resolved === 'dark' ? 'dark' : 'light';
    };
    syncTheme();
    media.addEventListener('change', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      media.removeEventListener('change', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
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
