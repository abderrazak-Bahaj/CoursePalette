/**
 * Retry handler with exponential backoff for AI API requests.
 *
 * Implements the retry strategy defined in Requirement 19:
 * - Up to 3 attempts with exponential backoff (200ms, 800ms, 3200ms)
 * - No retry for 401 (AiAuthError), 403 (AiAuthError), 429 (AiRateLimitError)
 * - Retry for network errors, timeout errors, and 5xx server errors
 *
 * @module utils/ai/retryHandler
 */

import { AiAuthError, AiRateLimitError } from '../../services/ai/errors';

/**
 * Handles automatic retry of async operations with exponential backoff.
 *
 * @example
 * ```typescript
 * const result = await retryHandler.retry(() => apiClient.askQuestion(...));
 * ```
 */
export class RetryHandler {
  /**
   * Retry an async function with exponential backoff.
   *
   * Attempts the function up to `maxAttempts` times. Between each attempt,
   * waits for `calculateDelay(attempt, baseDelay)` milliseconds. If the error
   * is non-retryable (401, 403, 429), it is re-thrown immediately without
   * further attempts.
   *
   * @param fn          - The async function to retry
   * @param maxAttempts - Maximum number of attempts (default: 3)
   * @param baseDelay   - Base delay in ms for backoff calculation (default: 200)
   * @returns           The resolved value of `fn` on success
   * @throws            The last error encountered if all attempts fail, or the
   *                    first non-retryable error immediately
   *
   * @example
   * ```typescript
   * // With defaults: up to 3 attempts, delays of 200ms and 800ms between them
   * const data = await retryHandler.retry(() => fetch('/api/ai/ask'));
   *
   * // Custom attempts and base delay
   * const data = await retryHandler.retry(() => fetch('/api/ai/ask'), 5, 100);
   * ```
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 200
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Non-retryable errors: throw immediately without waiting
        if (!this.shouldRetry(error)) {
          throw error;
        }

        // If this was the last attempt, stop — don't wait before throwing
        if (attempt === maxAttempts - 1) {
          break;
        }

        // Wait before the next attempt
        const delay = this.calculateDelay(attempt, baseDelay);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Calculate the delay (in ms) before a given retry attempt using exponential
   * backoff with base multiplier of 4.
   *
   * Formula: `baseDelay * 4^attempt`
   *
   * | attempt | delay (baseDelay=200) |
   * |---------|----------------------|
   * |    0    |  200 ms              |
   * |    1    |  800 ms              |
   * |    2    | 3200 ms              |
   *
   * @param attempt   - Zero-based attempt index (0 = first retry wait)
   * @param baseDelay - Base delay in milliseconds
   * @returns         Delay in milliseconds
   */
  private calculateDelay(attempt: number, baseDelay: number): number {
    return baseDelay * Math.pow(4, attempt);
  }

  /**
   * Determine whether an error should trigger a retry.
   *
   * Non-retryable errors (return `false`):
   * - `AiAuthError` with status 401 (Unauthorized) — session expired
   * - `AiAuthError` with status 403 (Forbidden) — insufficient permissions
   * - `AiRateLimitError` with status 429 — rate limit exceeded
   *
   * Retryable errors (return `true`):
   * - `AiNetworkError` (status 0) — transient connectivity issue
   * - `AiTimeoutError` (status 0) — request timed out
   * - `AiApiError` with 5xx status — server-side error
   * - Any other unknown error — retry optimistically
   *
   * @param error - The caught error to evaluate
   * @returns     `true` if the operation should be retried, `false` otherwise
   */
  private shouldRetry(error: unknown): boolean {
    // Never retry authentication or rate-limit errors
    if (error instanceof AiAuthError) {
      return false;
    }
    if (error instanceof AiRateLimitError) {
      return false;
    }

    // All other errors (network, timeout, 5xx, unknown) are retryable
    return true;
  }

  /**
   * Returns a promise that resolves after the specified number of milliseconds.
   *
   * @param ms - Duration to sleep in milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Singleton instance of `RetryHandler` for use throughout the application.
 *
 * @example
 * ```typescript
 * import { retryHandler } from '@/utils/ai/retryHandler';
 *
 * const result = await retryHandler.retry(() => aiApiClient.askQuestion(...));
 * ```
 */
export const retryHandler = new RetryHandler();
