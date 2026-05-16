/**
 * Debounce utility for the AI integration layer.
 *
 * Provides:
 * - `debounce()` — wraps any function so it only fires after `delay` ms of
 *   inactivity. The returned function also exposes a `.cancel()` method to
 *   clear any pending invocation.
 * - `useDebounce()` — React hook that returns a debounced copy of a value,
 *   updating only after the value has been stable for `delay` ms. Useful for
 *   debouncing search/filter inputs and streaming markdown re-renders.
 *
 * @see Requirements 22 (Performance Optimization – Debouncing)
 */

import { useState, useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A debounced function that also exposes a `.cancel()` method. */
export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  /** Cancel any pending invocation without calling the original function. */
  cancel(): void;
}

// ---------------------------------------------------------------------------
// debounce()
// ---------------------------------------------------------------------------

/**
 * Returns a debounced version of `fn` that delays invocation until `delay` ms
 * have elapsed since the last call.
 *
 * The returned function exposes a `.cancel()` method to clear any pending
 * invocation without executing `fn`.
 *
 * @param fn    - The function to debounce.
 * @param delay - Milliseconds to wait after the last call before invoking `fn`.
 *
 * @example
 * ```ts
 * const debouncedSearch = debounce((query: string) => search(query), 300);
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 * // On unmount:
 * debouncedSearch.cancel();
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): DebouncedFunction<T> {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      timerId = null;
      fn(...args);
    }, delay);
  };

  debounced.cancel = (): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced as DebouncedFunction<T>;
}

// ---------------------------------------------------------------------------
// useDebounce()
// ---------------------------------------------------------------------------

/**
 * React hook that returns a debounced copy of `value`.
 *
 * The returned value only updates after `value` has been stable (unchanged)
 * for `delay` milliseconds. When `delay` is 0 the value is returned
 * immediately without any debouncing.
 *
 * Typical use-cases:
 * - Debouncing a search/filter input so the API is not called on every
 *   keystroke.
 * - Debouncing markdown re-renders during SSE streaming to reduce render
 *   pressure.
 *
 * @param value - The value to debounce.
 * @param delay - Milliseconds to wait before updating the returned value.
 *                Pass `0` to disable debouncing.
 *
 * @example
 * ```tsx
 * // Debounce a search input
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebounce(query, 300);
 *
 * useEffect(() => {
 *   if (debouncedQuery) fetchResults(debouncedQuery);
 * }, [debouncedQuery]);
 * ```
 *
 * @example
 * ```tsx
 * // Debounce markdown re-renders during streaming
 * const debouncedContent = useDebounce(content, isStreaming ? 50 : 0);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  // When delay is 0 skip the state/effect overhead entirely.
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // Keep a stable ref to the latest value so the effect closure always sees
  // the most recent one even if it fires after a re-render.
  const valueRef = useRef<T>(value);
  valueRef.current = value;

  useEffect(() => {
    // No debouncing needed — update synchronously.
    if (delay <= 0) {
      setDebouncedValue(value);
      return;
    }

    const timerId = setTimeout(() => {
      setDebouncedValue(valueRef.current);
    }, delay);

    return () => {
      clearTimeout(timerId);
    };
    // `value` is the dependency that triggers the timer reset.
    // `delay` changes are intentionally included so callers can toggle
    // debouncing on/off (e.g. isStreaming ? 50 : 0).
  }, [value, delay]);

  return debouncedValue;
}
