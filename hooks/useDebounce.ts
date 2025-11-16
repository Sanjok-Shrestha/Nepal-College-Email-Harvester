import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook to debounce a value.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  // Ref to avoid setting state on unmounted component
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    // Ensure non-negative delay
    const effectiveDelay = Math.max(0, delay);
    const handler: ReturnType<typeof setTimeout> = setTimeout(() => {
      if (mountedRef.current) {
        setDebouncedValue(value);
      }
    }, effectiveDelay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      mountedRef.current = false;
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}

export default useDebounce;
