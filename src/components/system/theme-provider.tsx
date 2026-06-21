'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

// keep in sync with the no-flash script in src/app/layout.tsx
const STORAGE_KEY = 'aetch-theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// 'system' clears the attribute and defers to prefers-color-scheme
function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    // hydration-safe one-time read; localStorage is unavailable during ssr
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(stored);
    apply(stored);
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private mode or storage disabled — theme still applies for the session
    }
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
