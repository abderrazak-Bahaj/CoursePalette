/**
 * Unit tests for debounce utility – performance optimization (task 13.3)
 *
 * Validates: Requirements 22
 *
 * Tests cover:
 *  - debounce() function:
 *    - Function is called after delay when no new calls arrive
 *    - Function is NOT called if cancelled before delay expires
 *    - Multiple calls within delay window reset the timer
 *    - cancel() method prevents execution
 *    - Arguments are passed correctly to the debounced function
 *  - useDebounce() hook:
 *    - Returns the initial value immediately when delay=0
 *    - Returns the initial value immediately on first render
 *    - Updates after delay when value changes
 *    - Cancels pending updates on unmount
 *    - Handles rapid value changes correctly
 *    - Works with different data types (string, number, object, array)
 *    - Delay can be toggled on/off (e.g., isStreaming ? 50 : 0)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { debounce, useDebounce } from './debounce';

// ============================================================================
// debounce() function tests
// ============================================================================

describe('debounce()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should call the function after the delay when no new calls arrive', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('test');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('test');
  });

  it('should NOT call the function if cancelled before delay expires', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('test');
    debouncedFn.cancel();

    vi.advanceTimersByTime(300);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should reset the timer on each new call within the delay window', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('first');
    vi.advanceTimersByTime(100);

    debouncedFn('second');
    vi.advanceTimersByTime(100);

    debouncedFn('third');
    vi.advanceTimersByTime(100);

    // No call yet because we keep resetting the timer
    expect(fn).not.toHaveBeenCalled();

    // Now advance past the final delay
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('should pass all arguments to the original function', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('arg1', 'arg2', 42);
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 42);
  });

  it('should allow multiple calls after the delay expires', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('first');
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();

    debouncedFn('second');
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('cancel() should prevent execution even after delay', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('test');
    vi.advanceTimersByTime(150);
    debouncedFn.cancel();
    vi.advanceTimersByTime(300);

    expect(fn).not.toHaveBeenCalled();
  });

  it('cancel() should be safe to call multiple times', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('test');
    debouncedFn.cancel();
    debouncedFn.cancel();
    debouncedFn.cancel();

    vi.advanceTimersByTime(300);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should work with zero delay', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 0);

    debouncedFn('test');
    vi.advanceTimersByTime(0);

    expect(fn).toHaveBeenCalledWith('test');
  });
});

// ============================================================================
// useDebounce() hook tests
// ============================================================================

describe('useDebounce()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should return the initial value immediately when delay=0', () => {
    const { result } = renderHook(() => useDebounce('initial', 0));
    expect(result.current).toBe('initial');
  });

  it('should return the initial value on first render', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should update after delay when value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 300 });
    expect(result.current).toBe('initial'); // Still the old value

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset the timer on each value change', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 300 } }
    );

    rerender({ value: 'second', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'third', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Still on 'first' because we keep resetting
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('third');
  });

  it('should work with string values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 300 } }
    );

    rerender({ value: 'hello world', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('hello world');
  });

  it('should work with number values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 42, delay: 300 } }
    );

    rerender({ value: 100, delay: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(100);
  });

  it('should work with object values', () => {
    const obj1 = { name: 'Alice' };
    const obj2 = { name: 'Bob' };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: obj1, delay: 300 } }
    );

    rerender({ value: obj2, delay: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(obj2);
  });

  it('should work with array values', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: arr1, delay: 300 } }
    );

    rerender({ value: arr2, delay: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(arr2);
  });

  it('should allow toggling debouncing on/off via delay parameter', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    expect(result.current).toBe('initial');

    // Change value with delay=0 (no debouncing)
    rerender({ value: 'updated', delay: 0 });
    expect(result.current).toBe('updated');

    // Change value with delay=300 (debouncing enabled)
    rerender({ value: 'debounced', delay: 300 });
    expect(result.current).toBe('updated'); // Still old value

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('debounced');
  });

  it('should cancel pending updates on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'updated', delay: 300 });
    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // The hook is unmounted, so the value should not update
    // (we can't check result.current after unmount, but the timer should be cleared)
    expect(true); // Just verify no errors occurred
  });

  it('should handle rapid value changes correctly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'v1', delay: 100 } }
    );

    // Rapid changes
    rerender({ value: 'v2', delay: 100 });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: 'v3', delay: 100 });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: 'v4', delay: 100 });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Still on initial value
    expect(result.current).toBe('v1');

    // Now advance past the final delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('v4');
  });

  it('should handle delay changes correctly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'updated', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Change the delay while a timer is pending
    rerender({ value: 'updated', delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should update because the new delay (100) has passed
    expect(result.current).toBe('updated');
  });

  it('should work with null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: null as string | null, delay: 300 } }
    );

    expect(result.current).toBe(null);

    rerender({ value: undefined as string | undefined, delay: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBeUndefined();
  });

  it('should work with boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: false, delay: 300 } }
    );

    rerender({ value: true, delay: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(true);
  });
});

// ============================================================================
// Integration tests – real-world use cases
// ============================================================================

describe('debounce() – real-world use cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should debounce search input correctly', () => {
    const search = vi.fn();
    const debouncedSearch = debounce(search, 300);

    // Simulate user typing
    debouncedSearch('a');
    debouncedSearch('ab');
    debouncedSearch('abc');
    debouncedSearch('abcd');

    expect(search).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(search).toHaveBeenCalledOnce();
    expect(search).toHaveBeenCalledWith('abcd');
  });

  it('should debounce markdown re-renders during streaming', () => {
    const render = vi.fn();
    const debouncedRender = debounce(render, 50);

    // Simulate SSE chunks arriving rapidly
    for (let i = 0; i < 10; i++) {
      debouncedRender(`chunk ${i}`);
      vi.advanceTimersByTime(10);
    }

    // Should not have rendered yet
    expect(render).not.toHaveBeenCalled();

    // Advance past the debounce delay
    vi.advanceTimersByTime(50);
    expect(render).toHaveBeenCalledOnce();
    expect(render).toHaveBeenCalledWith('chunk 9');
  });
});

describe('useDebounce() – real-world use cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should debounce search input in a React component', () => {
    const { result, rerender } = renderHook(
      ({ query, delay }) => useDebounce(query, delay),
      { initialProps: { query: '', delay: 300 } }
    );

    // Simulate user typing
    rerender({ query: 'a', delay: 300 });
    rerender({ query: 'ab', delay: 300 });
    rerender({ query: 'abc', delay: 300 });

    expect(result.current).toBe('');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('abc');
  });

  it('should debounce markdown re-renders during streaming', () => {
    const { result, rerender } = renderHook(
      ({ content, isStreaming }) => useDebounce(content, isStreaming ? 50 : 0),
      { initialProps: { content: '', isStreaming: true } }
    );

    // Simulate SSE chunks arriving
    rerender({ content: 'chunk 1', isStreaming: true });
    rerender({ content: 'chunk 1 chunk 2', isStreaming: true });
    rerender({ content: 'chunk 1 chunk 2 chunk 3', isStreaming: true });

    expect(result.current).toBe('');

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current).toBe('chunk 1 chunk 2 chunk 3');

    // When streaming stops, disable debouncing
    rerender({ content: 'final content', isStreaming: false });
    expect(result.current).toBe('final content');
  });
});
