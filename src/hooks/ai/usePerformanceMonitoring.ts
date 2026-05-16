/**
 * usePerformanceMonitoring Hook
 *
 * Provides easy access to performance monitoring functionality in React components.
 * Automatically measures AI operation durations and provides access to Core Web Vitals.
 *
 * Usage:
 * ```tsx
 * const { measureOperation, getMetrics } = usePerformanceMonitoring();
 *
 * const handleAskQuestion = async () => {
 *   const done = measureOperation('askQuestion');
 *   try {
 *     await aiApiClient.askQuestion(...);
 *     done(); // Records success
 *   } catch (err) {
 *     // Operation not recorded on error
 *     throw err;
 *   }
 * };
 * ```
 *
 * @module usePerformanceMonitoring
 */

import { useCallback, useEffect, useState } from 'react';
import {
  performanceMonitor,
  PerformanceMetrics,
  AiOperationMetrics,
} from '@/utils/ai/performanceMonitor';

/**
 * Hook for accessing performance monitoring functionality.
 *
 * @returns Object with performance monitoring methods and data
 */
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [operations, setOperations] = useState<AiOperationMetrics[]>([]);

  /**
   * Measure an AI operation's duration.
   * Returns a callback to call when the operation completes.
   *
   * @param operationName - Human-readable name for the operation
   * @returns Callback to call when operation completes
   */
  const measureOperation = useCallback((operationName: string) => {
    return performanceMonitor.measureOperation(operationName);
  }, []);

  /**
   * Get current Core Web Vitals metrics.
   *
   * @returns Current performance metrics
   */
  const getMetrics = useCallback(() => {
    return performanceMonitor.getMetrics();
  }, []);

  /**
   * Get all recorded AI operation metrics.
   *
   * @returns Array of operation metrics
   */
  const getOperationMetrics = useCallback(() => {
    return performanceMonitor.getOperationMetrics();
  }, []);

  /**
   * Log all metrics to console (development mode only).
   */
  const logMetrics = useCallback(() => {
    performanceMonitor.logMetrics();
  }, []);

  /**
   * Clear all collected metrics.
   */
  const clearMetrics = useCallback(() => {
    performanceMonitor.clearMetrics();
    setMetrics({});
    setOperations([]);
  }, []);

  /**
   * Refresh metrics from the performance monitor.
   */
  const refreshMetrics = useCallback(() => {
    setMetrics(performanceMonitor.getMetrics());
    setOperations(performanceMonitor.getOperationMetrics());
  }, []);

  // Set up polling to refresh metrics
  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  return {
    metrics,
    operations,
    measureOperation,
    getMetrics,
    getOperationMetrics,
    logMetrics,
    clearMetrics,
    refreshMetrics,
  };
}

export default usePerformanceMonitoring;
