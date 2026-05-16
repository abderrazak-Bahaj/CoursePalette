/**
 * Memoization utilities for expensive computations
 *
 * Provides helpers for memoizing expensive operations in React components
 * and hooks to improve performance and reduce unnecessary re-renders.
 *
 * @module utils/ai/memoization
 * @see Requirements 22 (Performance Optimization – Lazy Loading and Memoization)
 */

/**
 * Memoizes the result of an expensive computation function.
 *
 * Useful for expensive operations like:
 * - Sorting large arrays
 * - Filtering large datasets
 * - Complex calculations
 * - Markdown parsing
 *
 * @example
 * ```tsx
 * const sortedMessages = useMemo(
 *   () => memoizeComputation(() => [...messages].sort(...)),
 *   [messages]
 * );
 * ```
 */
export function memoizeComputation<T>(fn: () => T): T {
  return fn();
}

/**
 * Creates a stable reference for an object that may be recreated on each render.
 *
 * Useful for:
 * - Stable object references for dependency arrays
 * - Preventing unnecessary re-renders of memoized components
 * - Stable callback dependencies
 *
 * @example
 * ```tsx
 * const stableConfig = useMemo(
 *   () => createStableReference({ difficulty: 'hard', numQuestions: 5 }),
 *   [difficulty, numQuestions]
 * );
 * ```
 */
export function createStableReference<T extends Record<string, unknown>>(
  obj: T
): T {
  return obj;
}

/**
 * Compares two arrays for shallow equality.
 *
 * Useful for:
 * - Custom dependency array comparisons
 * - Determining if an array has changed
 * - Optimizing re-renders
 *
 * @example
 * ```tsx
 * const hasMessagesChanged = !shallowArrayEqual(prevMessages, messages);
 * ```
 */
export function shallowArrayEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Compares two objects for shallow equality.
 *
 * Useful for:
 * - Custom dependency array comparisons
 * - Determining if an object has changed
 * - Optimizing re-renders
 *
 * @example
 * ```tsx
 * const hasConfigChanged = !shallowObjectEqual(prevConfig, config);
 * ```
 */
export function shallowObjectEqual<T extends Record<string, unknown>>(
  a: T,
  b: T
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}

/**
 * Creates a memoized selector function for extracting and transforming data.
 *
 * Useful for:
 * - Deriving computed values from state
 * - Filtering and transforming arrays
 * - Selecting specific properties from objects
 *
 * @example
 * ```tsx
 * const selectAssistantMessages = createMemoizedSelector(
 *   (messages: AiMessage[]) => messages.filter(m => m.role === 'assistant')
 * );
 *
 * const assistantMessages = useMemo(
 *   () => selectAssistantMessages(messages),
 *   [messages]
 * );
 * ```
 */
export function createMemoizedSelector<T, R>(
  selector: (input: T) => R
): (input: T) => R {
  let lastInput: T | undefined;
  let lastOutput: R | undefined;

  return (input: T): R => {
    if (lastInput !== input) {
      lastInput = input;
      lastOutput = selector(input);
    }
    return lastOutput as R;
  };
}

export default {
  memoizeComputation,
  createStableReference,
  shallowArrayEqual,
  shallowObjectEqual,
  createMemoizedSelector,
};
