import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * A custom hook to manage the theme (light or dark mode).
 * - Keeps SSR-safe access to window/localStorage
 * - Respects explicit user preference stored in localStorage
 * - Listens to system preference changes only when user hasn't set a preference
 * - Provides a typed theme and a stable toggle function
 */
type Theme = 'light' | 'dark';

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

function getInitialTheme(): Theme {
  if (!isBrowser) return 'light';
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored as Theme;
  } catch {
    // ignore storage errors
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const userPreference = useRef<boolean>(false);

  // detect if a stored preference exists (run once on mount)
  useEffect(() => {
    if (!isBrowser) return;
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') userPreference.current = true;
    } catch {
      /* ignore */
    }
  }, []);

  // apply theme to document and persist
  useEffect(() => {
    if (!isBrowser) return;
    try {
      const root = window.document.documentElement;
      root.classList.remove(theme === 'light' ? 'dark' : 'light');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
      userPreference.current = true;
    } catch {
      /* ignore storage/dom errors */
    }
  }, [theme]);

  // respond to system changes only if user hasn't explicitly chosen a theme
  useEffect(() => {
    if (!isBrowser) return;
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent | MediaQueryList) => {
        if (!userPreference.current) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      };

      // support both modern and legacy APIs
      if ('addEventListener' in mq) {
        mq.addEventListener('change', handler as EventListener);
      } else {
        // Type coercion for legacy TS types
        (mq as any).addListener(handler);
      }

      return () => {
        if ('removeEventListener' in mq) {
          mq.removeEventListener('change', handler as EventListener);
        } else {
          (mq as any).removeListener(handler);
        }
      };
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return [theme, toggleTheme];
}

export default useTheme;
