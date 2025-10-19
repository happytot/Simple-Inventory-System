// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * A custom hook to debounce a value.
 * @param value The value to debounce (e.g., search text)
 * @param delay The delay in milliseconds (e.g., 300)
 * @returns The debounced value
 */
export default function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function that will be called ...
    // ... if value or delay changes before the timeout clears.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}