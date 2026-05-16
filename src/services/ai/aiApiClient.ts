/**
 * AI API Client Service
 *
 * Centralized TypeScript service for all AI Learning Assistant API calls.
 * Provides typed methods for all six AI endpoints with:
 *   - Bearer token authentication
 *   - Streaming response support via async generators (SSE)
 *   - Structured error handling with custom exceptions
 *   - Rate limit header extraction (Retry-After)
 *   - Request/response logging in development mode
 *   - Configurable base URL and timeout via environment variables
 *
 * @module services/ai/aiApiClient
 * @see Requirements 1, 6, 11
 */

import { aiConfig } from './config';
import { mapResponseToError, AiNetworkError, AiTimeoutError } from './errors';
import type {
  AiMessage,
  PaginatedMessages,
  AskAiRequest,
  GenerateAssignmentParams,
  GeneratedAssignment,
  QuestionEnhancement,
  PreGrade,
  PreGradeJobResponse,
  UsageFilters,
  UsageStatistics,
  StreamChunk,
  StreamDoneEvent,
} from './types';

// ---------------------------------------------------------------------------
// Auth helper (mirrors the existing apiClient.ts pattern)
// ---------------------------------------------------------------------------

/**
 * Retrieves the Bearer token from localStorage.
 * Matches the pattern used by the existing `apiClient.ts`.
 */
function getAuthToken(): string | null {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user) as { token?: string };
      return parsed.token ?? null;
    }
  } catch {
    // localStorage unavailable or JSON parse failed
  }
  return null;
}

// ---------------------------------------------------------------------------
// Logging helper
// ---------------------------------------------------------------------------

const isDev =
  import.meta.env.DEV === true || import.meta.env.MODE === 'development';

function logRequest(method: string, url: string, body?: unknown): void {
  if (isDev) {
    console.debug(`[AI API] → ${method} ${url}`, body ?? '');
  }
}

function logResponse(method: string, url: string, data: unknown): void {
  if (isDev) {
    console.debug(`[AI API] ← ${method} ${url}`, data);
  }
}

function logError(method: string, url: string, error: unknown): void {
  if (isDev) {
    console.error(`[AI API] ✗ ${method} ${url}`, error);
  }
}

// ---------------------------------------------------------------------------
// Base request helper
// ---------------------------------------------------------------------------

/**
 * Builds the common headers for every AI API request.
 */
function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extra,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Performs a regular (non-streaming) fetch with timeout support.
 * Throws a typed AI error on failure.
 */
async function fetchJson<T>(
  method: string,
  url: string,
  body?: unknown
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), aiConfig.timeoutMs);

  logRequest(method, url, body);

  let response: Response | null = null;
  try {
    response = await fetch(url, {
      method,
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    logError(method, url, err);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AiTimeoutError();
    }
    throw new AiNetworkError(
      err instanceof Error ? err.message : 'Network request failed'
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    logError(method, url, `HTTP ${response.status}`);
    await mapResponseToError(response);
  }

  const data = (await response.json()) as T;
  logResponse(method, url, data);
  return data;
}

// ---------------------------------------------------------------------------
// SSE / Streaming helpers
// ---------------------------------------------------------------------------

/**
 * Parses a single SSE `data:` line and returns the delta string, or `null`
 * when the line should be skipped (e.g. `[DONE]`, empty, or non-chunk event).
 *
 * Expected formats:
 *   data: {"delta":"some text"}   → returns "some text"
 *   data: [DONE]                  → returns null (signals end of stream)
 *   data: {"id":1,"content":"…"}  → returns null (done event, handled separately)
 */
function parseSseLine(line: string): { delta: string | null; done: boolean } {
  if (!line.startsWith('data: ')) {
    return { delta: null, done: false };
  }

  const payload = line.slice('data: '.length).trim();

  // Sentinel value that signals the end of the stream
  if (payload === '[DONE]') {
    return { delta: null, done: true };
  }

  try {
    const parsed = JSON.parse(payload) as Partial<
      StreamChunk & StreamDoneEvent
    >;

    // `done` event: { id, content } — signals end of stream
    if ('content' in parsed && 'id' in parsed && !('delta' in parsed)) {
      return { delta: null, done: true };
    }

    // `chunk` event: { delta: string }
    if (typeof parsed.delta === 'string') {
      return { delta: parsed.delta, done: false };
    }
  } catch {
    // Malformed JSON — skip this line
  }

  return { delta: null, done: false };
}

/**
 * Reads a `ReadableStream<Uint8Array>` and yields each SSE delta as it
 * arrives.  Handles partial chunks by buffering incomplete lines.
 *
 * @param stream - The response body stream from a streaming fetch response.
 * @yields Each text delta extracted from SSE `data:` lines.
 */
async function* readSseStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        // Process any remaining buffered content
        if (buffer.trim()) {
          const { delta, done: isDone } = parseSseLine(buffer.trim());
          if (delta !== null) yield delta;
          if (isDone) break;
        }
        break;
      }

      // Decode the incoming chunk and append to buffer
      buffer += decoder.decode(value, { stream: true });

      // Split on newlines; the last element may be an incomplete line
      const lines = buffer.split('\n');

      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue; // blank line (SSE event separator)

        const { delta, done: isDone } = parseSseLine(trimmed);

        if (delta !== null) {
          yield delta;
        }

        if (isDone) {
          return; // generator is done
        }
      }
    }
  } finally {
    // Always release the reader lock, even if the caller abandons the generator
    try {
      reader.releaseLock();
    } catch {
      // Already released
    }
  }
}

// ---------------------------------------------------------------------------
// Cache types (request deduplication – task 2.4)
// ---------------------------------------------------------------------------

/** A single entry in the Q&A deduplication cache. */
interface CacheEntry {
  response: AiMessage;
  timestamp: number;
  /** Raw key prefix used for lesson-level invalidation. */
  _raw: string;
}

/** Cache window in milliseconds (5 minutes). */
const CACHE_WINDOW_MS = 300_000;

// ---------------------------------------------------------------------------
// AiApiClient class
// ---------------------------------------------------------------------------

/**
 * Centralized client for all AI Learning Assistant API endpoints.
 *
 * Usage:
 * ```ts
 * import { aiApiClient } from '@/services/ai/aiApiClient';
 *
 * // Non-streaming
 * const message = await aiApiClient.askQuestion('1', '2', 'What is React?');
 *
 * // Streaming
 * const stream = aiApiClient.askQuestion('1', '2', 'What is React?', true);
 * for await (const delta of stream as AsyncGenerator<string>) {
 *   console.log(delta);
 * }
 * ```
 */
export class AiApiClient {
  private get baseUrl(): string {
    return aiConfig.apiBaseUrl;
  }

  /**
   * In-memory deduplication cache for non-streaming Q&A requests.
   * Key: djb2 hash of `courseId::lessonId::question`.
   * Value: cached response + timestamp + raw key for invalidation.
   *
   * @see Requirements 1 (request deduplication)
   */
  private readonly _cache = new Map<string, CacheEntry>();

  // -------------------------------------------------------------------------
  // Cache helpers
  // -------------------------------------------------------------------------

  /**
   * Generates a compact hash key from the Q&A request parameters using the
   * djb2 algorithm.  Collision probability is negligible for typical Q&A
   * inputs.
   */
  private _buildCacheKey(
    courseId: string | number,
    lessonId: string | number,
    question: string
  ): string {
    const raw = `${courseId}::${lessonId}::${question}`;
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
      hash = hash >>> 0; // keep as unsigned 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Returns a cached response if one exists and is within the 5-minute window.
   * Automatically evicts stale entries.
   */
  private _getCached(key: string): AiMessage | null {
    const entry = this._cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_WINDOW_MS) {
      this._cache.delete(key);
      return null;
    }
    return entry.response;
  }

  /**
   * Stores a response in the deduplication cache.
   */
  private _setCached(key: string, response: AiMessage, raw: string): void {
    this._cache.set(key, { response, timestamp: Date.now(), _raw: raw });
  }

  /**
   * Clears the entire in-memory Q&A cache.
   *
   * Call this when the user logs out or when a global cache reset is needed.
   */
  public clearCache(): void {
    this._cache.clear();
    logRequest('CACHE', 'clearCache()');
  }

  /**
   * Removes all cached entries for a specific lesson.
   *
   * The cache key is a hash, so we use the stored `_raw` prefix
   * (`courseId::lessonId::`) to identify matching entries.
   *
   * @param courseId - Course identifier
   * @param lessonId - Lesson identifier
   */
  public invalidateCache(
    courseId: string | number,
    lessonId: string | number
  ): void {
    const prefix = `${courseId}::${lessonId}::`;
    const toDelete: string[] = [];
    for (const [hashKey, entry] of this._cache.entries()) {
      if (entry._raw.startsWith(prefix)) {
        toDelete.push(hashKey);
      }
    }
    toDelete.forEach((k) => this._cache.delete(k));
    logRequest(
      'CACHE',
      `invalidateCache(course=${courseId}, lesson=${lessonId}) removed=${toDelete.length}`
    );
  }

  // -------------------------------------------------------------------------
  // Student Q&A
  // -------------------------------------------------------------------------

  /**
   * Ask the AI a question about a lesson.
   *
   * @param courseId  - Course identifier
   * @param lessonId  - Lesson identifier
   * @param question  - The student's question (max 2000 characters)
   * @param stream    - When `true`, returns an `AsyncGenerator<string>` that
   *                    yields text deltas in real-time via SSE.
   *                    When `false` (default), returns a resolved `AiMessage`.
   *
   * @returns `AiMessage` when `stream` is false; `AsyncGenerator<string>` when true.
   *
   * @see Requirements 1.6, 11
   */
  askQuestion(
    courseId: string | number,
    lessonId: string | number,
    question: string,
    stream: true
  ): AsyncGenerator<string>;
  askQuestion(
    courseId: string | number,
    lessonId: string | number,
    question: string,
    stream?: false
  ): Promise<AiMessage>;
  askQuestion(
    courseId: string | number,
    lessonId: string | number,
    question: string,
    stream?: boolean
  ): Promise<AiMessage> | AsyncGenerator<string>;

  askQuestion(
    courseId: string | number,
    lessonId: string | number,
    question: string,
    stream: boolean = false
  ): Promise<AiMessage> | AsyncGenerator<string> {
    const url = `${this.baseUrl}/courses/${courseId}/lessons/${lessonId}/ai/ask`;
    const body: AskAiRequest = { question, stream };

    if (stream && aiConfig.streamingEnabled) {
      return this._streamQuestion(url, body);
    }

    // ── Non-streaming path with deduplication cache ──────────────────────
    const raw = `${courseId}::${lessonId}::${question}`;
    const cacheKey = this._buildCacheKey(courseId, lessonId, question);
    const cached = this._getCached(cacheKey);

    if (cached) {
      logRequest('CACHE HIT', url, {
        courseId,
        lessonId,
        question: question.slice(0, 50),
      });
      return Promise.resolve(cached);
    }

    return fetchJson<{ data: AiMessage }>('POST', url, {
      question,
      stream: false,
    }).then((res) => {
      this._setCached(cacheKey, res.data, raw);
      return res.data;
    });
  }

  /**
   * Internal async generator that establishes the SSE connection and yields
   * text deltas.
   *
   * @param url  - Full endpoint URL
   * @param body - Request body (includes `stream: true`)
   */
  private async *_streamQuestion(
    url: string,
    body: AskAiRequest
  ): AsyncGenerator<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), aiConfig.timeoutMs);

    logRequest('POST (stream)', url, body);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders({ Accept: 'text/event-stream' }),
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      logError('POST (stream)', url, err);
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new AiTimeoutError();
      }
      throw new AiNetworkError(
        err instanceof Error ? err.message : 'Streaming request failed'
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      logError('POST (stream)', url, `HTTP ${response.status}`);
      await mapResponseToError(response);
    }

    if (!response.body) {
      throw new AiNetworkError(
        'Response body is null — streaming not supported by server.'
      );
    }

    logResponse('POST (stream)', url, '[SSE stream opened]');

    try {
      yield* readSseStream(response.body);
    } catch (err) {
      logError('POST (stream)', url, err);
      throw err;
    }
  }

  /**
   * Fetch the conversation history for a lesson.
   *
   * @param courseId - Course identifier
   * @param lessonId - Lesson identifier
   * @param page     - Page number (1-based, defaults to 1)
   * @param perPage  - Items per page (defaults to 20)
   *
   * @returns Paginated list of messages (most recent first).
   */
  async getConversationHistory(
    courseId: string | number,
    lessonId: string | number,
    page: number = 1,
    perPage: number = 20
  ): Promise<PaginatedMessages> {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    const url = `${this.baseUrl}/courses/${courseId}/lessons/${lessonId}/ai/history?${params}`;

    const res = await fetchJson<{
      data: AiMessage[];
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
    }>('GET', url);
    return res;
  }

  /**
   * Clear the conversation history for a lesson.
   *
   * Also invalidates the Q&A deduplication cache for the lesson so stale
   * responses are not served after the history is cleared.
   *
   * @param courseId - Course identifier
   * @param lessonId - Lesson identifier
   */
  async clearConversationHistory(
    courseId: string | number,
    lessonId: string | number
  ): Promise<{ message: string; deleted_count: number }> {
    const url = `${this.baseUrl}/courses/${courseId}/lessons/${lessonId}/ai/history`;
    const result = await fetchJson<{ message: string; deleted_count: number }>(
      'DELETE',
      url
    );
    // Invalidate cache so subsequent questions hit the network
    this.invalidateCache(courseId, lessonId);
    return result;
  }

  // -------------------------------------------------------------------------
  // Teacher Tools
  // -------------------------------------------------------------------------

  /**
   * Generate an AI-powered assignment for a course lesson.
   *
   * @param courseId - Course identifier
   * @param params   - Generation parameters (lesson_id, num_questions, max_score, difficulty)
   *
   * @returns The generated assignment with questions, options, and rubric.
   */
  async generateAssignment(
    courseId: string | number,
    params: GenerateAssignmentParams
  ): Promise<GeneratedAssignment> {
    const url = `${this.baseUrl}/courses/${courseId}/assignments/generate`;
    const res = await fetchJson<{ data: GeneratedAssignment }>(
      'POST',
      url,
      params
    );
    return res.data;
  }

  /**
   * Enhance an existing assignment question with AI suggestions.
   *
   * @param courseId     - Course identifier
   * @param assignmentId - Assignment identifier
   * @param questionId   - Question identifier
   *
   * @returns Enhancement result with original, suggested, and rationale.
   */
  async enhanceQuestion(
    courseId: string | number,
    assignmentId: string | number,
    questionId: string | number
  ): Promise<QuestionEnhancement> {
    const url = `${this.baseUrl}/courses/${courseId}/assignments/${assignmentId}/questions/${questionId}/enhance`;
    const res = await fetchJson<{ data: QuestionEnhancement }>('POST', url);
    return res.data;
  }

  /**
   * Trigger AI pre-grading for a student submission.
   *
   * The backend returns 202 Accepted — the job is queued asynchronously.
   * The actual pre-grade data is fetched separately from the submission resource.
   *
   * @param courseId     - Course identifier
   * @param assignmentId - Assignment identifier
   * @param submissionId - Submission identifier
   *
   * @returns Job queued confirmation.
   */
  async preGradeSubmission(
    courseId: string | number,
    assignmentId: string | number,
    submissionId: string | number
  ): Promise<PreGradeJobResponse> {
    const url = `${this.baseUrl}/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/pregrade`;
    return fetchJson<PreGradeJobResponse>('POST', url);
  }

  /**
   * Fetch the pre-grade result for a submission.
   *
   * @param courseId     - Course identifier
   * @param assignmentId - Assignment identifier
   * @param submissionId - Submission identifier
   *
   * @returns The pre-grade result with scores and feedback.
   */
  async getPreGrade(
    courseId: string | number,
    assignmentId: string | number,
    submissionId: string | number
  ): Promise<PreGrade> {
    const url = `${this.baseUrl}/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/pregrade`;
    const res = await fetchJson<{ data: PreGrade }>('GET', url);
    return res.data;
  }

  // -------------------------------------------------------------------------
  // Admin
  // -------------------------------------------------------------------------

  /**
   * Fetch AI usage statistics for the admin dashboard.
   *
   * @param filters - Optional filters (days: number of days to include, max 90)
   *
   * @returns Usage statistics with daily breakdown and totals.
   */
  async getAiUsageStatistics(filters?: UsageFilters): Promise<UsageStatistics> {
    const params = new URLSearchParams();
    if (filters?.days !== undefined) {
      params.set('days', String(filters.days));
    }
    const query = params.toString();
    const url = `${this.baseUrl}/admin/ai/usage${query ? `?${query}` : ''}`;
    return fetchJson<UsageStatistics>('GET', url);
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

/**
 * Singleton instance of the AI API client.
 *
 * Import this wherever you need to call AI endpoints:
 *
 * ```ts
 * import { aiApiClient } from '@/services/ai/aiApiClient';
 * ```
 */
export const aiApiClient = new AiApiClient();

export default aiApiClient;
