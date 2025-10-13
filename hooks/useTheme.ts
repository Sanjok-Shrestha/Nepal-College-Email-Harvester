
import { useState, useEffect } from 'react';

/**
 * A custom hook to manage the theme (light or dark mode).
 */
export function useTheme(): [string, () => void] {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove(theme === 'light' ? 'dark' : 'light');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  return [theme, toggleTheme];
}
