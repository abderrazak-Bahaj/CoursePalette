/**
 * Custom error classes for the AI API client.
 *
 * These classes provide structured error information for all failure modes
 * encountered when communicating with the AI backend, enabling callers to
 * handle each error type appropriately (e.g., redirect on 401, show retry
 * countdown on 429, display connection message on network failure).
 *
 * @module services/ai/errors
 */

// ---------------------------------------------------------------------------
// Base error class
// ---------------------------------------------------------------------------

/**
 * Base class for all AI API errors.
 *
 * Every error carries:
 * - `code`    – a machine-readable identifier (e.g. "AI_AUTH_ERROR")
 * - `status`  – the HTTP status code that triggered the error (0 for network/timeout)
 * - `message` – a human-readable description
 */
export class AiApiError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = 'AiApiError';
    this.code = code;
    this.status = status;

    // Restore prototype chain (required when extending built-ins in TypeScript)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Specific error sub-classes
// ---------------------------------------------------------------------------

/**
 * Thrown when a network-level failure occurs (e.g. the device is offline,
 * DNS resolution fails, or the connection is refused).
 *
 * Suggested UX: display a "connection error" message and offer a retry button.
 */
export class AiNetworkError extends AiApiError {
  constructor(
    message: string = 'A network error occurred. Please check your connection and try again.'
  ) {
    super('AI_NETWORK_ERROR', 0, message);
    this.name = 'AiNetworkError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown for HTTP 401 (Unauthorized) and 403 (Forbidden) responses.
 *
 * - 401 → the user's session has expired; redirect to login.
 * - 403 → the user lacks the required permissions; display a "permission denied" message.
 *
 * The `status` property distinguishes the two cases.
 */
export class AiAuthError extends AiApiError {
  constructor(status: 401 | 403, message?: string) {
    const defaultMessage =
      status === 401
        ? 'Your session has expired. Please log in again.'
        : 'You do not have permission to perform this action.';

    super('AI_AUTH_ERROR', status, message ?? defaultMessage);
    this.name = 'AiAuthError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown for HTTP 429 (Too Many Requests) responses.
 *
 * The `retryAfter` property contains the number of seconds the caller must
 * wait before making another request (parsed from the `Retry-After` header).
 *
 * Suggested UX: display a countdown timer showing when the user can try again.
 */
export class AiRateLimitError extends AiApiError {
  /** Seconds to wait before the next request is allowed (from Retry-After header). */
  public readonly retryAfter: number;

  constructor(retryAfter: number, message?: string) {
    const defaultMessage = `Rate limit exceeded. Please wait ${retryAfter} second${retryAfter !== 1 ? 's' : ''} before trying again.`;
    super('AI_RATE_LIMIT_ERROR', 429, message ?? defaultMessage);
    this.name = 'AiRateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a request exceeds the configured timeout.
 *
 * Suggested UX: display a "request timed out" message and offer a retry button.
 */
export class AiTimeoutError extends AiApiError {
  constructor(message: string = 'The request timed out. Please try again.') {
    super('AI_TIMEOUT_ERROR', 0, message);
    this.name = 'AiTimeoutError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown for HTTP 422 (Unprocessable Entity) responses, indicating that the
 * request payload failed server-side validation.
 *
 * Suggested UX: display field-specific validation error messages.
 */
export class AiValidationError extends AiApiError {
  constructor(
    message: string = 'The request contained invalid data. Please check your input and try again.'
  ) {
    super('AI_VALIDATION_ERROR', 422, message);
    this.name = 'AiValidationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Error mapping helpers
// ---------------------------------------------------------------------------

/**
 * Maps an HTTP status code to the appropriate custom error class.
 *
 * This is a synchronous helper for callers that have already extracted the
 * status code, message, and optional Retry-After value from the response.
 *
 * @param status     - HTTP status code (use 0 for network/timeout errors)
 * @param message    - Human-readable error message
 * @param retryAfter - Seconds to wait before retrying (only used for 429)
 *
 * @returns An instance of the appropriate AiApiError subclass
 */
export function mapHttpErrorToAiError(
  status: number,
  message: string,
  retryAfter?: number
): AiApiError {
  switch (status) {
    case 401:
      return new AiAuthError(401, message);

    case 403:
      return new AiAuthError(403, message);

    case 422:
      return new AiValidationError(message);

    case 429:
      return new AiRateLimitError(retryAfter ?? 60, message);

    case 500:
    case 502:
    case 503:
    case 504:
      return new AiApiError('AI_SERVER_ERROR', status, message);

    case 0:
      // Distinguish timeout from generic network error by convention:
      // callers should pass status=0 for both; use AiNetworkError as default.
      return new AiNetworkError(message);

    default:
      return new AiApiError('AI_API_ERROR', status, message);
  }
}

/**
 * Maps an HTTP response (or a caught fetch error) to the appropriate custom
 * error class and throws it.
 *
 * @param response - The `Response` object returned by `fetch`, or `null` when
 *                   the error occurred before a response was received.
 * @param error    - The original caught error (used when `response` is null).
 *
 * @throws {AiAuthError}       for 401 and 403 responses
 * @throws {AiRateLimitError}  for 429 responses
 * @throws {AiApiError}        for 500 / 502 / 503 / 504 responses
 * @throws {AiValidationError} for 422 responses
 * @throws {AiNetworkError}    when no response was received (network failure)
 * @throws {AiTimeoutError}    when the request was aborted due to a timeout
 */
export async function mapResponseToError(
  response: Response | null,
  error?: unknown
): Promise<never> {
  // ── No response received ──────────────────────────────────────────────────
  if (response === null) {
    // AbortError is raised by fetch when an AbortController signal fires
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AiTimeoutError();
    }
    throw new AiNetworkError();
  }

  // ── Extract a human-readable message from the response body (best-effort) ─
  let serverMessage: string | undefined;
  try {
    const body = await response.json();
    serverMessage = body?.message ?? body?.error ?? undefined;
  } catch {
    // Body is not JSON or is empty — fall back to default messages
  }

  // ── Map status codes ───────────────────────────────────────────────────────
  switch (response.status) {
    case 401:
      throw new AiAuthError(401, serverMessage);

    case 403:
      throw new AiAuthError(403, serverMessage);

    case 422:
      throw new AiValidationError(serverMessage);

    case 429: {
      const retryAfterHeader = response.headers.get('Retry-After');
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
      throw new AiRateLimitError(
        Number.isFinite(retryAfter) ? retryAfter : 60,
        serverMessage
      );
    }

    case 500:
    case 502:
    case 503:
    case 504:
      throw new AiApiError(
        'AI_SERVER_ERROR',
        response.status,
        serverMessage ??
          'A server error occurred. Please try again later or contact support.'
      );

    default:
      throw new AiApiError(
        'AI_API_ERROR',
        response.status,
        serverMessage ??
          `Unexpected error: ${response.status} ${response.statusText}`
      );
  }
}
