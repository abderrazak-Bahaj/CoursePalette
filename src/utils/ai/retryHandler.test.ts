/**
 * Unit tests for RetryHandler – error recovery and retry logic (task 14.3)
 *
 * Validates: Requirements 19
 *
 * Tests cover:
 *  - retry():
 *    - Returns the result on first success
 *    - Retries on network errors (up to 3 attempts)
 *    - Uses exponential backoff delays: 200ms, 800ms, 3200ms
 *    - Throws after all retries are exhausted
 *    - Does NOT retry on AiAuthError (401)
 *    - Does NOT retry on AiAuthError (403)
 *    - Does NOT retry on AiRateLimitError (429)
 *    - Retries on AiApiError with 5xx status
 *    - Retries on AiNetworkError
 *    - Retries on AiTimeoutError
 *    - Retries on unknown errors
 *    - Respects custom maxAttempts
 *    - Respects custom baseDelay
 *    - Returns the successful response after a retry
 *  - Singleton export:
 *    - retryHandler is an instance of RetryHandler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RetryHandler, retryHandler } from './retryHandler';
import {
  AiAuthError,
  AiRateLimitError,
  AiNetworkError,
  AiTimeoutError,
  AiApiError,
} from '../../services/ai/errors';

// ============================================================================
// Helpers
// ============================================================================

/** Create a function that fails `failCount` times then resolves with `value`. */
function failThenSucceed<T>(
  failCount: number,
  value: T,
  error: Error
): () => Promise<T> {
  let calls = 0;
  return () => {
    calls++;
    if (calls <= failCount) {
      return Promise.reject(error);
    }
    return Promise.resolve(value);
  };
}

// ============================================================================
// retry() – success path
// ============================================================================

describe('RetryHandler.retry() – success path', () => {
  let handler: RetryHandler;

  beforeEach(() => {
    vi.useFakeTimers();
    handler = new RetryHandler();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('should return the result immediately when the function succeeds on the first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await handler.retry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should return the result after a retry when the function succeeds on the second attempt', async () => {
    const networkError = new AiNetworkError();
    const fn = failThenSucceed(1, 'recovered', networkError);

    const promise = handler.retry(fn);
    // Advance past the first backoff delay (200ms)
    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;

    expect(result).toBe('recovered');
  });

  it('should return the result after two retries when the function succeeds on the third attempt', async () => {
    const networkError = new AiNetworkError();
    const fn = failThenSucceed(2, 'final', networkError);

    const promise = handler.retry(fn);
    // First backoff: 200ms, second backoff: 800ms
    await vi.advanceTimersByTimeAsync(200 + 800);
    const result = await promise;

    expect(result).toBe('final');
  });
});

// ============================================================================
// retry() – exponential backoff delays
// ============================================================================

describe('RetryHandler.retry() – exponential backoff', () => {
  let handler: RetryHandler;

  beforeEach(() => {
    vi.useFakeTimers();
    handler = new RetryHandler();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('should wait 200ms before the first retry (attempt 0)', async () => {
    const networkError = new AiNetworkError();
    let callCount = 0;
    const fn = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 2) return Promise.reject(networkError);
      return Promise.resolve('ok');
    });

    const promise = handler.retry(fn);

    // Before the delay, only 1 call should have been made
    expect(fn).toHaveBeenCalledOnce();

    // Advance exactly 200ms — the retry should fire
    await vi.advanceTimersByTimeAsync(200);
    await promise;

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should wait 800ms before the second retry (attempt 1)', async () => {
    const networkError = new AiNetworkError();
    let callCount = 0;
    const fn = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 3) return Promise.reject(networkError);
      return Promise.resolve('ok');
    });

    const promise = handler.retry(fn);

    // After first delay (200ms), second call fires and fails
    await vi.advanceTimersByTimeAsync(200);
    expect(fn).toHaveBeenCalledTimes(2);

    // After second delay (800ms), third call fires and succeeds
    await vi.advanceTimersByTimeAsync(800);
    await promise;

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use baseDelay * 4^attempt formula: 200ms, 800ms, 3200ms', async () => {
    // Verify the formula by checking that all 3 attempts fail and the total
    // wait time is 200 + 800 = 1000ms (no wait after the last attempt)
    const networkError = new AiNetworkError();
    const fn = vi.fn().mockRejectedValue(networkError);

    const promise = handler.retry(fn).catch(() => 'exhausted');

    // After 200ms: second attempt fires
    await vi.advanceTimersByTimeAsync(200);
    expect(fn).toHaveBeenCalledTimes(2);

    // After 800ms more: third attempt fires
    await vi.advanceTimersByTimeAsync(800);
    expect(fn).toHaveBeenCalledTimes(3);

    // No more retries — promise should reject
    const result = await promise;
    expect(result).toBe('exhausted');
  });

  it('should respect a custom baseDelay', async () => {
    const networkError = new AiNetworkError();
    let callCount = 0;
    const fn = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 2) return Promise.reject(networkError);
      return Promise.resolve('ok');
    });

    const promise = handler.retry(fn, 3, 100);

    // With baseDelay=100, first retry delay = 100 * 4^0 = 100ms
    await vi.advanceTimersByTimeAsync(100);
    await promise;

    expect(fn).toHaveBeenCalledTimes(2);
  });
});

// ============================================================================
// retry() – non-retryable errors (no retry)
// ============================================================================

describe('RetryHandler.retry() – non-retryable errors', () => {
  let handler: RetryHandler;

  beforeEach(() => {
    vi.useFakeTimers();
    handler = new RetryHandler();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('should NOT retry on AiAuthError with status 401', async () => {
    const authError = new AiAuthError(401);
    const fn = vi.fn().mockRejectedValue(authError);

    await expect(handler.retry(fn)).rejects.toThrow(AiAuthError);
    // Only one call — no retry
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should NOT retry on AiAuthError with status 403', async () => {
    const authError = new AiAuthError(403);
    const fn = vi.fn().mockRejectedValue(authError);

    await expect(handler.retry(fn)).rejects.toThrow(AiAuthError);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should NOT retry on AiRateLimitError (429)', async () => {
    const rateLimitError = new AiRateLimitError(60);
    const fn = vi.fn().mockRejectedValue(rateLimitError);

    await expect(handler.retry(fn)).rejects.toThrow(AiRateLimitError);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should re-throw the original AiAuthError (401) without modification', async () => {
    const authError = new AiAuthError(401, 'Session expired');
    const fn = vi.fn().mockRejectedValue(authError);

    const caught = await handler.retry(fn).catch((e) => e);
    expect(caught).toBe(authError);
    expect(caught.status).toBe(401);
  });

  it('should re-throw the original AiRateLimitError with retryAfter intact', async () => {
    const rateLimitError = new AiRateLimitError(120);
    const fn = vi.fn().mockRejectedValue(rateLimitError);

    const caught = await handler.retry(fn).catch((e) => e);
    expect(caught).toBe(rateLimitError);
    expect(caught.retryAfter).toBe(120);
  });
});

// ============================================================================
// retry() – retryable errors
// ============================================================================

describe('RetryHandler.retry() – retryable errors', () => {
  let handler: RetryHandler;

  beforeEach(() => {
    vi.useFakeTimers();
    handler = new RetryHandler();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('should retry on AiNetworkError', async () => {
    const networkError = new AiNetworkError();
    const fn = failThenSucceed(1, 'ok', networkError);

    const promise = handler.retry(fn);
    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;

    expect(result).toBe('ok');
  });

  it('should retry on AiTimeoutError', async () => {
    const timeoutError = new AiTimeoutError();
    const fn = failThenSucceed(1, 'ok', timeoutError);

    const promise = handler.retry(fn);
    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;

    expect(result).toBe('ok');
  });

  it('should retry on AiApiError with 500 status', async () => {
    const serverError = new AiApiError(
      'AI_SERVER_ERROR',
      500,
      'Internal Server Error'
    );
    const fn = failThenSucceed(1, 'ok', serverError);

    const promise = handler.retry(fn);
    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;

    expect(result).toBe('ok');
  });

  it('should retry on AiApiError with 502 status', async () => {
    const serverError = new AiApiError('AI_SERVER_ERROR', 502, 'Bad Gateway');
    const fn = failThenSucceed(1, 'ok', serverError);

    const promise = handler.retry(fn);
    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;

    expect(result).toBe('ok');
  });

  it('should retry on AiApiError with 503 status', async () => {
    const serverError = new AiApiError(
      'AI_SERVER_ERROR',
      503,
      'Service Unavailable'
    );
    const fn = failThenSucceed(1, 'ok', serverError);

    const promise = handler.retry(fn);
    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;

    expect(result).toBe('ok');
  });

  it('should retry on unknown/generic errors', async () => {
    const unknownError = new Error('Something unexpected');
    const fn = failThenSucceed(1, 'ok', unknownError);

    const promise = handler.retry(fn);
    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;

    expect(result).toBe('ok');
  });

  it('should throw the last error after all retries are exhausted', async () => {
    const networkError = new AiNetworkError('Persistent failure');
    const fn = vi.fn().mockRejectedValue(networkError);

    // Attach a catch handler immediately to prevent unhandled rejection
    let caughtError: unknown;
    const promise = handler.retry(fn).catch((e) => {
      caughtError = e;
    });

    // Advance through all backoff delays: 200ms + 800ms
    await vi.advanceTimersByTimeAsync(200 + 800);
    await promise;

    expect(caughtError).toBeInstanceOf(AiNetworkError);
    expect((caughtError as AiNetworkError).message).toBe('Persistent failure');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

// ============================================================================
// retry() – custom maxAttempts
// ============================================================================

describe('RetryHandler.retry() – custom maxAttempts', () => {
  let handler: RetryHandler;

  beforeEach(() => {
    vi.useFakeTimers();
    handler = new RetryHandler();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('should attempt exactly once when maxAttempts=1', async () => {
    const networkError = new AiNetworkError();
    const fn = vi.fn().mockRejectedValue(networkError);

    await expect(handler.retry(fn, 1)).rejects.toThrow(AiNetworkError);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should attempt exactly twice when maxAttempts=2', async () => {
    const networkError = new AiNetworkError();
    const fn = vi.fn().mockRejectedValue(networkError);

    const promise = handler.retry(fn, 2).catch(() => 'failed');
    await vi.advanceTimersByTimeAsync(200);
    await promise;

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should attempt exactly 5 times when maxAttempts=5', async () => {
    const networkError = new AiNetworkError();
    const fn = vi.fn().mockRejectedValue(networkError);

    const promise = handler.retry(fn, 5).catch(() => 'failed');
    // Advance through all delays: 200 + 800 + 3200 + 12800
    await vi.advanceTimersByTimeAsync(200 + 800 + 3200 + 12800);
    await promise;

    expect(fn).toHaveBeenCalledTimes(5);
  });
});

// ============================================================================
// Singleton export
// ============================================================================

describe('retryHandler singleton', () => {
  it('should be an instance of RetryHandler', () => {
    expect(retryHandler).toBeInstanceOf(RetryHandler);
  });

  it('should expose a retry() method', () => {
    expect(typeof retryHandler.retry).toBe('function');
  });

  it('should work correctly as a singleton', async () => {
    vi.useFakeTimers();
    const fn = vi.fn().mockResolvedValue(42);

    const result = await retryHandler.retry(fn);
    expect(result).toBe(42);

    vi.useRealTimers();
  });
});
