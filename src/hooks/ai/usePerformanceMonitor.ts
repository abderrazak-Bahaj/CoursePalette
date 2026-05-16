/**
 * usePerformanceMonitor Hook
 *
 * Provides React components with access to the singleton PerformanceMonitor.
 * Exposes the current Core Web Vitals snapshot and AI operation history,
 * and logs a metrics summary to the console (dev mode only) when the
 * component unmounts.
 *
 * Usage:
 * ```tsx
 * const { metrics, operationMetrics, logMetrics } = usePerformanceMonitor();
 * ```
 *
 * @module hooks/ai/usePerformanceMonitor
 * @see Requirement 22 – Performance Optimization
 */

import { useEffect, useCallback } from 'react';
import {
  performanceMonitor,
  type PerformanceMetrics,
  type AiOperationMetrics,
} from '@/utils/ai/performanceMonitor';

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UsePerformanceMonitorReturn {
  /**
   * Returns a snapshot of the current Core Web Vitals metrics (FCP, LCP, CLS,
   * TTFB).  Values are `undefined` until the browser fires the corresponding
   * PerformanceObserver entry.
   */
  getMetrics: () => PerformanceMetrics;
  /**
   * Returns the history of all recorded AI operation metrics in the order
   * they were completed.
   */
  getOperationMetrics: () => AiOperationMetrics[];
  /**
   * Manually trigger a metrics summary log to the browser console.
   * Only outputs in development mode (import.meta.env.DEV).
   */
  logMetrics: () => void;
  /**
   * Start measuring a named AI operation.
   * Returns a completion callback — call it when the operation finishes
   * successfully to record the duration.
   *
   * @param operationName - Human-readable name for the operation
   * @returns Completion callback
   */
  measureOperation: (operationName: string) => () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * React hook that provides access to the global PerformanceMonitor singleton.
 *
 * Logs a metrics summary on unmount (dev mode only) so developers can see
 * the final state of all collected metrics when a component is torn down.
 *
 * @example
 * ```tsx
 * function MyAiComponent() {
 *   const { measureOperation, getMetrics } = usePerformanceMonitor();
 *
 *   const handleAction = async () => {
 *     const done = measureOperation('myAction');
 *     await doSomething();
 *     done();
 *   };
 *
 *   return <button onClick={handleAction}>Run</button>;
 * }
 * ```
 */
export function usePerformanceMonitor(): UsePerformanceMonitorReturn {
  // Log a summary when the component unmounts (dev only)
  useEffect(() => {
    return () => {
      performanceMonitor.logMetrics();
    };
  }, []);

  const getMetrics = useCallback(() => performanceMonitor.getMetrics(), []);

  const getOperationMetrics = useCallback(
    () => performanceMonitor.getOperationMetrics(),
    []
  );

  const logMetrics = useCallback(() => performanceMonitor.logMetrics(), []);

  const measureOperation = useCallback(
    (operationName: string) =>
      performanceMonitor.measureOperation(operationName),
    []
  );

  return {
    getMetrics,
    getOperationMetrics,
    logMetrics,
    measureOperation,
  };
}

export default usePerformanceMonitor;
