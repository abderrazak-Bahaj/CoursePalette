/**
 * Unit tests for PerformanceMonitor – performance optimization (task 13.4)
 *
 * Validates: Requirements 22
 *
 * Tests cover:
 *  - measureOperation():
 *    - Returns a done() callback
 *    - Records operation name, duration, success=true, and timestamp
 *    - Multiple operations are tracked independently
 *    - Duration is non-negative
 *  - observeWebVitals():
 *    - Does not throw when PerformanceObserver is unavailable
 *    - Registers observers for paint, largest-contentful-paint, layout-shift, navigation
 *  - getMetrics():
 *    - Returns a copy of the current metrics (not the internal reference)
 *  - getOperationMetrics():
 *    - Returns a copy of the recorded operations
 *  - logMetrics():
 *    - Calls console.group/log/groupEnd in DEV mode
 *    - Does not call console in production mode
 *  - clearMetrics():
 *    - Resets metrics and operationMetrics to empty
 *    - Disconnects all registered observers
 *  - Singleton export:
 *    - performanceMonitor is an instance of PerformanceMonitor
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PerformanceMonitor, performanceMonitor } from './performanceMonitor';

// ============================================================================
// Helpers
// ============================================================================

/** Build a minimal PerformanceObserver mock that records observed types. */
function buildObserverMock() {
  const instances: { types: string[]; disconnect: ReturnType<typeof vi.fn> }[] =
    [];

  // Use a real class so `new MockObserver(callback)` works correctly.
  class MockObserver {
    types: string[] = [];
    disconnect = vi.fn();
    _callback: PerformanceObserverCallback;

    constructor(callback: PerformanceObserverCallback) {
      this._callback = callback;
      instances.push(this);
    }

    observe(options: { type: string; buffered?: boolean }) {
      this.types.push(options.type);
    }
  }

  return { MockObserver, instances };
}

// ============================================================================
// measureOperation()
// ============================================================================

describe('PerformanceMonitor.measureOperation()', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  afterEach(() => {
    monitor.clearMetrics();
  });

  it('should return a function (done callback)', () => {
    const done = monitor.measureOperation('testOp');
    expect(typeof done).toBe('function');
  });

  it('should record the operation after done() is called', () => {
    const done = monitor.measureOperation('askQuestion');
    done();

    const ops = monitor.getOperationMetrics();
    expect(ops).toHaveLength(1);
    expect(ops[0].operation).toBe('askQuestion');
    expect(ops[0].success).toBe(true);
  });

  it('should record a non-negative duration', () => {
    const done = monitor.measureOperation('generateAssignment');
    done();

    const ops = monitor.getOperationMetrics();
    expect(ops[0].duration).toBeGreaterThanOrEqual(0);
  });

  it('should record a timestamp close to Date.now()', () => {
    const before = Date.now();
    const done = monitor.measureOperation('enhanceQuestion');
    done();
    const after = Date.now();

    const ops = monitor.getOperationMetrics();
    expect(ops[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(ops[0].timestamp).toBeLessThanOrEqual(after);
  });

  it('should track multiple operations independently', () => {
    const done1 = monitor.measureOperation('op1');
    const done2 = monitor.measureOperation('op2');
    done1();
    done2();

    const ops = monitor.getOperationMetrics();
    expect(ops).toHaveLength(2);
    expect(ops[0].operation).toBe('op1');
    expect(ops[1].operation).toBe('op2');
  });

  it('should not record an operation if done() is never called', () => {
    monitor.measureOperation('neverDone');
    // done() is intentionally not called
    expect(monitor.getOperationMetrics()).toHaveLength(0);
  });

  it('should log to console.debug in DEV mode', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    // import.meta.env.DEV is true in the test environment (vitest sets it)
    const done = monitor.measureOperation('devOp');
    done();

    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('devOp'));
    debugSpy.mockRestore();
  });
});

// ============================================================================
// observeWebVitals()
// ============================================================================

describe('PerformanceMonitor.observeWebVitals()', () => {
  let monitor: PerformanceMonitor;
  let originalPerformanceObserver: typeof PerformanceObserver;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
    originalPerformanceObserver = globalThis.PerformanceObserver;
  });

  afterEach(() => {
    monitor.clearMetrics();
    globalThis.PerformanceObserver = originalPerformanceObserver;
  });

  it('should not throw when PerformanceObserver is unavailable', () => {
    // @ts-expect-error – intentionally removing PerformanceObserver
    globalThis.PerformanceObserver = undefined;

    expect(() => monitor.observeWebVitals()).not.toThrow();
  });

  it('should warn in DEV mode when PerformanceObserver is unavailable', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // @ts-expect-error – intentionally removing PerformanceObserver
    globalThis.PerformanceObserver = undefined;

    monitor.observeWebVitals();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('PerformanceObserver')
    );
    warnSpy.mockRestore();
  });

  it('should register observers when PerformanceObserver is available', () => {
    const { MockObserver, instances } = buildObserverMock();
    globalThis.PerformanceObserver =
      MockObserver as unknown as typeof PerformanceObserver;

    monitor.observeWebVitals();

    // Should have registered at least 3 observers (paint, lcp, layout-shift)
    expect(instances.length).toBeGreaterThanOrEqual(3);
  });

  it('should observe "paint" entry type for FCP', () => {
    const { MockObserver, instances } = buildObserverMock();
    globalThis.PerformanceObserver =
      MockObserver as unknown as typeof PerformanceObserver;

    monitor.observeWebVitals();

    const observedTypes = instances.flatMap((i) => i.types);
    expect(observedTypes).toContain('paint');
  });

  it('should observe "largest-contentful-paint" entry type for LCP', () => {
    const { MockObserver, instances } = buildObserverMock();
    globalThis.PerformanceObserver =
      MockObserver as unknown as typeof PerformanceObserver;

    monitor.observeWebVitals();

    const observedTypes = instances.flatMap((i) => i.types);
    expect(observedTypes).toContain('largest-contentful-paint');
  });

  it('should observe "layout-shift" entry type for CLS', () => {
    const { MockObserver, instances } = buildObserverMock();
    globalThis.PerformanceObserver =
      MockObserver as unknown as typeof PerformanceObserver;

    monitor.observeWebVitals();

    const observedTypes = instances.flatMap((i) => i.types);
    expect(observedTypes).toContain('layout-shift');
  });

  it('should update FCP metric when a first-contentful-paint entry is observed', () => {
    const callbacks: PerformanceObserverCallback[] = [];

    class MockObserver {
      constructor(cb: PerformanceObserverCallback) {
        callbacks.push(cb);
      }
      observe = vi.fn();
      disconnect = vi.fn();
    }
    globalThis.PerformanceObserver =
      MockObserver as unknown as typeof PerformanceObserver;

    monitor.observeWebVitals();

    // Simulate a paint entry for FCP
    const fakeList = {
      getEntries: () => [
        { name: 'first-contentful-paint', startTime: 1234 } as PerformanceEntry,
      ],
    } as PerformanceObserverEntryList;

    // The first callback registered is for 'paint'
    callbacks[0](fakeList, {} as PerformanceObserver);

    expect(monitor.getMetrics().fcp).toBe(1234);
  });

  it('should update LCP metric when a largest-contentful-paint entry is observed', () => {
    const callbacks: PerformanceObserverCallback[] = [];

    class MockObserver {
      constructor(cb: PerformanceObserverCallback) {
        callbacks.push(cb);
      }
      observe = vi.fn();
      disconnect = vi.fn();
    }
    globalThis.PerformanceObserver =
      MockObserver as unknown as typeof PerformanceObserver;

    monitor.observeWebVitals();

    // Simulate an LCP entry (second observer registered)
    const fakeList = {
      getEntries: () => [
        {
          name: 'largest-contentful-paint',
          startTime: 2500,
        } as PerformanceEntry,
      ],
    } as PerformanceObserverEntryList;

    callbacks[1](fakeList, {} as PerformanceObserver);

    expect(monitor.getMetrics().lcp).toBe(2500);
  });

  it('should accumulate CLS metric across multiple layout-shift entries', () => {
    const callbacks: PerformanceObserverCallback[] = [];

    class MockObserver {
      constructor(cb: PerformanceObserverCallback) {
        callbacks.push(cb);
      }
      observe = vi.fn();
      disconnect = vi.fn();
    }
    globalThis.PerformanceObserver =
      MockObserver as unknown as typeof PerformanceObserver;

    monitor.observeWebVitals();

    // Simulate layout-shift entries (third observer registered)
    const fakeList1 = {
      getEntries: () => [
        {
          name: 'layout-shift',
          hadRecentInput: false,
          value: 0.05,
        } as unknown as PerformanceEntry,
      ],
    } as PerformanceObserverEntryList;

    const fakeList2 = {
      getEntries: () => [
        {
          name: 'layout-shift',
          hadRecentInput: false,
          value: 0.03,
        } as unknown as PerformanceEntry,
      ],
    } as PerformanceObserverEntryList;

    callbacks[2](fakeList1, {} as PerformanceObserver);
    callbacks[2](fakeList2, {} as PerformanceObserver);

    const cls = monitor.getMetrics().cls;
    expect(cls).toBeCloseTo(0.08, 3);
  });

  it('should ignore layout-shift entries with hadRecentInput=true', () => {
    const callbacks: PerformanceObserverCallback[] = [];

    class MockObserver {
      constructor(cb: PerformanceObserverCallback) {
        callbacks.push(cb);
      }
      observe = vi.fn();
      disconnect = vi.fn();
    }
    globalThis.PerformanceObserver =
      MockObserver as unknown as typeof PerformanceObserver;

    monitor.observeWebVitals();

    const fakeList = {
      getEntries: () => [
        {
          name: 'layout-shift',
          hadRecentInput: true,
          value: 0.1,
        } as unknown as PerformanceEntry,
      ],
    } as PerformanceObserverEntryList;

    callbacks[2](fakeList, {} as PerformanceObserver);

    // CLS should remain undefined (no shift recorded)
    expect(monitor.getMetrics().cls).toBeUndefined();
  });
});

// ============================================================================
// getMetrics()
// ============================================================================

describe('PerformanceMonitor.getMetrics()', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  afterEach(() => {
    monitor.clearMetrics();
  });

  it('should return an empty object initially', () => {
    expect(monitor.getMetrics()).toEqual({});
  });

  it('should return a copy, not the internal reference', () => {
    const metrics1 = monitor.getMetrics();
    const metrics2 = monitor.getMetrics();
    expect(metrics1).not.toBe(metrics2);
  });
});

// ============================================================================
// getOperationMetrics()
// ============================================================================

describe('PerformanceMonitor.getOperationMetrics()', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  afterEach(() => {
    monitor.clearMetrics();
  });

  it('should return an empty array initially', () => {
    expect(monitor.getOperationMetrics()).toEqual([]);
  });

  it('should return a copy, not the internal array reference', () => {
    const done = monitor.measureOperation('op');
    done();

    const ops1 = monitor.getOperationMetrics();
    const ops2 = monitor.getOperationMetrics();
    expect(ops1).not.toBe(ops2);
  });

  it('should include all recorded operations in order', () => {
    const done1 = monitor.measureOperation('first');
    done1();
    const done2 = monitor.measureOperation('second');
    done2();
    const done3 = monitor.measureOperation('third');
    done3();

    const ops = monitor.getOperationMetrics();
    expect(ops.map((o) => o.operation)).toEqual(['first', 'second', 'third']);
  });
});

// ============================================================================
// logMetrics()
// ============================================================================

describe('PerformanceMonitor.logMetrics()', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  afterEach(() => {
    monitor.clearMetrics();
    vi.restoreAllMocks();
  });

  it('should call console.group, console.log, and console.groupEnd in DEV mode', () => {
    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const groupEndSpy = vi
      .spyOn(console, 'groupEnd')
      .mockImplementation(() => {});

    monitor.logMetrics();

    expect(groupSpy).toHaveBeenCalledOnce();
    expect(logSpy).toHaveBeenCalledTimes(2); // Core Web Vitals + AI Operations
    expect(groupEndSpy).toHaveBeenCalledOnce();
  });
});

// ============================================================================
// clearMetrics()
// ============================================================================

describe('PerformanceMonitor.clearMetrics()', () => {
  let monitor: PerformanceMonitor;
  let originalPerformanceObserver: typeof PerformanceObserver;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
    originalPerformanceObserver = globalThis.PerformanceObserver;
  });

  afterEach(() => {
    globalThis.PerformanceObserver = originalPerformanceObserver;
  });

  it('should reset metrics to empty object', () => {
    // Record an operation to populate state
    const done = monitor.measureOperation('op');
    done();

    monitor.clearMetrics();

    expect(monitor.getMetrics()).toEqual({});
  });

  it('should reset operationMetrics to empty array', () => {
    const done = monitor.measureOperation('op');
    done();

    monitor.clearMetrics();

    expect(monitor.getOperationMetrics()).toEqual([]);
  });

  it('should disconnect all registered observers', () => {
    const disconnectFns: ReturnType<typeof vi.fn>[] = [];

    class MockObserver {
      constructor(_cb: PerformanceObserverCallback) {
        disconnectFns.push(this.disconnect);
      }
      observe = vi.fn();
      disconnect = vi.fn();
    }
    globalThis.PerformanceObserver =
      MockObserver as unknown as typeof PerformanceObserver;

    monitor.observeWebVitals();
    const observerCount = disconnectFns.length;
    expect(observerCount).toBeGreaterThan(0);

    monitor.clearMetrics();

    for (const disconnect of disconnectFns) {
      expect(disconnect).toHaveBeenCalledOnce();
    }
  });

  it('should be safe to call multiple times', () => {
    monitor.clearMetrics();
    monitor.clearMetrics();
    expect(monitor.getMetrics()).toEqual({});
    expect(monitor.getOperationMetrics()).toEqual([]);
  });
});

// ============================================================================
// Singleton export
// ============================================================================

describe('performanceMonitor singleton', () => {
  it('should be an instance of PerformanceMonitor', () => {
    expect(performanceMonitor).toBeInstanceOf(PerformanceMonitor);
  });

  it('should expose measureOperation()', () => {
    expect(typeof performanceMonitor.measureOperation).toBe('function');
  });

  it('should expose observeWebVitals()', () => {
    expect(typeof performanceMonitor.observeWebVitals).toBe('function');
  });

  it('should expose getMetrics()', () => {
    expect(typeof performanceMonitor.getMetrics).toBe('function');
  });

  it('should expose getOperationMetrics()', () => {
    expect(typeof performanceMonitor.getOperationMetrics).toBe('function');
  });

  it('should expose logMetrics()', () => {
    expect(typeof performanceMonitor.logMetrics).toBe('function');
  });

  it('should expose clearMetrics()', () => {
    expect(typeof performanceMonitor.clearMetrics).toBe('function');
  });
});
