/**
 * Performance Monitor for AI Integration
 *
 * Collects and logs Core Web Vitals (FCP, LCP, CLS) and AI operation metrics.
 * Metrics are logged to the console in development mode only.
 *
 * @module performanceMonitor
 */

/**
 * Core Web Vitals and additional performance metrics.
 */
export interface PerformanceMetrics {
  /** First Contentful Paint in milliseconds */
  fcp?: number;
  /** Largest Contentful Paint in milliseconds */
  lcp?: number;
  /** Cumulative Layout Shift score (unitless) */
  cls?: number;
  /** Time to First Byte in milliseconds */
  ttfb?: number;
  /** First Input Delay in milliseconds */
  fid?: number;
}

/**
 * Metrics for a single AI operation (e.g., ask question, generate assignment).
 */
export interface AiOperationMetrics {
  /** Name of the AI operation */
  operation: string;
  /** Duration of the operation in milliseconds */
  duration: number;
  /** Whether the operation completed successfully */
  success: boolean;
  /** Unix timestamp (ms) when the operation started */
  timestamp: number;
}

/**
 * Collects Core Web Vitals and AI operation performance metrics.
 *
 * Usage:
 * ```ts
 * // Observe web vitals (call once on app startup)
 * performanceMonitor.observeWebVitals();
 *
 * // Measure an AI operation
 * const done = performanceMonitor.measureOperation('askQuestion');
 * await aiApiClient.askQuestion(...);
 * done(); // records duration and success=true
 * ```
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private operationMetrics: AiOperationMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  /**
   * Start measuring a named AI operation.
   * Returns a function to call when the operation completes (marks success=true).
   * If the returned function is never called, the operation is not recorded.
   *
   * @param operationName - Human-readable name for the operation
   * @returns A completion callback that records the operation metrics
   */
  measureOperation(operationName: string): () => void {
    const startTime = performance.now();
    const timestamp = Date.now();

    return () => {
      const duration = performance.now() - startTime;
      const entry: AiOperationMetrics = {
        operation: operationName,
        duration: Math.round(duration),
        success: true,
        timestamp,
      };
      this.operationMetrics.push(entry);

      if (import.meta.env.DEV) {
        console.debug(
          `[PerformanceMonitor] Operation "${operationName}" completed in ${entry.duration}ms`
        );
      }
    };
  }

  /**
   * Observe Core Web Vitals using PerformanceObserver.
   * Observes FCP (paint), LCP (largest-contentful-paint), and CLS (layout-shift).
   * Logs metrics to the console in development mode.
   *
   * Safe to call in environments that don't support PerformanceObserver — errors
   * are caught and silently ignored.
   *
   * @alias measureWebVitals
   */
  observeWebVitals(): void {
    if (typeof PerformanceObserver === 'undefined') {
      if (import.meta.env.DEV) {
        console.warn(
          '[PerformanceMonitor] PerformanceObserver is not supported in this environment.'
        );
      }
      return;
    }

    // First Contentful Paint
    this._observe('paint', (entries) => {
      for (const entry of entries) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = Math.round(entry.startTime);
          if (import.meta.env.DEV) {
            console.debug(`[PerformanceMonitor] FCP: ${this.metrics.fcp}ms`);
          }
        }
      }
    });

    // Largest Contentful Paint
    this._observe('largest-contentful-paint', (entries) => {
      // The last entry is the most accurate LCP value
      const last = entries[entries.length - 1];
      if (last) {
        this.metrics.lcp = Math.round(last.startTime);
        if (import.meta.env.DEV) {
          console.debug(`[PerformanceMonitor] LCP: ${this.metrics.lcp}ms`);
        }
      }
    });

    // Cumulative Layout Shift
    this._observe('layout-shift', (entries) => {
      let clsDelta = 0;
      for (const entry of entries) {
        // LayoutShift entries have a `hadRecentInput` flag and `value` property
        const layoutShiftEntry = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (
          !layoutShiftEntry.hadRecentInput &&
          layoutShiftEntry.value != null
        ) {
          clsDelta += layoutShiftEntry.value;
        }
      }
      if (clsDelta > 0) {
        this.metrics.cls = parseFloat(
          ((this.metrics.cls ?? 0) + clsDelta).toFixed(4)
        );
        if (import.meta.env.DEV) {
          console.debug(
            `[PerformanceMonitor] CLS updated: ${this.metrics.cls}`
          );
        }
      }
    });

    // Time to First Byte (via navigation timing)
    this._observeNavigation();
  }

  /**
   * Get the current collected Core Web Vitals metrics.
   *
   * @returns A snapshot of the current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Alias for {@link observeWebVitals} — starts observing Core Web Vitals.
   * Provided for compatibility with the task 13.4 specification naming.
   */
  measureWebVitals(): void {
    this.observeWebVitals();
  }

  /**
   * Get the history of all recorded AI operation metrics.
   *
   * @returns Array of AI operation metrics, in the order they were recorded
   */
  getOperationMetrics(): AiOperationMetrics[] {
    return [...this.operationMetrics];
  }

  /**
   * Log all collected metrics to the console.
   * Only outputs in development mode (import.meta.env.DEV).
   */
  logMetrics(): void {
    if (!import.meta.env.DEV) return;

    console.group('[PerformanceMonitor] Metrics Summary');
    console.log('Core Web Vitals:', this.metrics);
    console.log('AI Operations:', this.operationMetrics);
    console.groupEnd();
  }

  /**
   * Clear all collected metrics and disconnect all PerformanceObservers.
   * Useful for testing or resetting state between page navigations.
   */
  clearMetrics(): void {
    this.metrics = {};
    this.operationMetrics = [];
    for (const observer of this.observers) {
      observer.disconnect();
    }
    this.observers = [];
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Create and register a PerformanceObserver for the given entry type.
   * Silently ignores unsupported entry types.
   */
  private _observe(
    type: string,
    callback: (entries: PerformanceEntry[]) => void
  ): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch {
      if (import.meta.env.DEV) {
        console.warn(
          `[PerformanceMonitor] Could not observe entry type "${type}". It may not be supported.`
        );
      }
    }
  }

  /**
   * Extract TTFB from the Navigation Timing API if available.
   */
  private _observeNavigation(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming;
          if (navEntry.responseStart != null && navEntry.requestStart != null) {
            this.metrics.ttfb = Math.round(
              navEntry.responseStart - navEntry.requestStart
            );
            if (import.meta.env.DEV) {
              console.debug(
                `[PerformanceMonitor] TTFB: ${this.metrics.ttfb}ms`
              );
            }
          }
        }
      });
      observer.observe({ type: 'navigation', buffered: true });
      this.observers.push(observer);
    } catch {
      // Navigation timing not supported — skip silently
    }
  }
}

/**
 * Singleton instance of PerformanceMonitor for use across the application.
 *
 * @example
 * ```ts
 * import { performanceMonitor } from '@/utils/ai';
 *
 * // On app startup
 * performanceMonitor.observeWebVitals();
 *
 * // Around an AI operation
 * const done = performanceMonitor.measureOperation('generateAssignment');
 * try {
 *   await aiApiClient.generateAssignment(courseId, params);
 *   done();
 * } catch (err) {
 *   // operation not recorded on failure — handle error separately
 *   throw err;
 * }
 * ```
 */
export const performanceMonitor = new PerformanceMonitor();
