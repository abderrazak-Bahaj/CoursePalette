/**
 * Streaming Handler Utility
 *
 * Manages Server-Sent Events (SSE) connections for real-time AI Q&A responses.
 * Provides chunk parsing, delta accumulation, and automatic reconnection with
 * exponential backoff.
 *
 * Key behaviours:
 *   - Parses `data: {"delta":"text"}` SSE lines and yields each delta
 *   - Treats `data: [DONE]` and `data: {"id":…,"content":…}` as stream-end signals
 *   - Retries up to 3 times on connection interruption (delays: 1s, 2s, 4s)
 *   - Cleans up the connection when the caller's AbortSignal fires (navigation away)
 *
 * @module utils/ai/streamingHandler
 * @see Requirements 11
 */

import type { StreamChunk, StreamDoneEvent } from '../../services/ai/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of reconnection attempts after a connection interruption. */
const MAX_RECONNECT_ATTEMPTS = 3;

/** Base delay in milliseconds for the first reconnection attempt. */
const BASE_RECONNECT_DELAY_MS = 1000;

// ---------------------------------------------------------------------------
// StreamingHandler class
// ---------------------------------------------------------------------------

/**
 * Handles SSE streaming connections for AI Q&A responses.
 *
 * Usage:
 * ```ts
 * import { streamingHandler } from '@/utils/ai/streamingHandler';
 *
 * const controller = new AbortController();
 * const options: RequestInit = {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json', Authorization: 'Bearer …' },
 *   body: JSON.stringify({ question: 'What is React?', stream: true }),
 *   signal: controller.signal,
 * };
 *
 * for await (const delta of streamingHandler.streamQuestion(url, options)) {
 *   accumulatedText += delta;
 * }
 *
 * // On navigation away:
 * controller.abort();
 * ```
 */
export class StreamingHandler {
  /**
   * Stream a question response via SSE.
   *
   * Establishes a fetch-based SSE connection to `url` using `options`.
   * Yields each text delta as it arrives.  On connection interruption,
   * automatically retries up to {@link MAX_RECONNECT_ATTEMPTS} times with
   * exponential backoff (1 s, 2 s, 4 s).
   *
   * When the caller's `options.signal` is aborted (e.g. the user navigates
   * away), the generator exits cleanly without throwing.
   *
   * @param url     - Full endpoint URL for the streaming ask request
   * @param options - `RequestInit` options (must include method, headers, body)
   * @yields Each text delta extracted from SSE `data:` lines
   *
   * @see Requirements 11.1 – 11.8
   */
  async *streamQuestion(
    url: string,
    options: RequestInit
  ): AsyncGenerator<string> {
    let attempt = 0;

    while (true) {
      // If the caller's signal is already aborted, stop immediately
      if (options.signal?.aborted) {
        return;
      }

      let response: Response;
      try {
        response = await fetch(url, {
          ...options,
          headers: {
            Accept: 'text/event-stream',
            ...(options.headers as Record<string, string> | undefined),
          },
        });
      } catch (err) {
        // Network-level error (DNS failure, connection refused, etc.)
        if (options.signal?.aborted) {
          // Clean navigation-away exit — not an error
          return;
        }

        this.handleError(err instanceof Error ? err : new Error(String(err)));

        if (attempt < MAX_RECONNECT_ATTEMPTS) {
          await this.reconnect(url, options, attempt);
          attempt++;
          continue;
        }

        // All retries exhausted — propagate the error
        throw err instanceof Error ? err : new Error(String(err));
      }

      if (!response.ok) {
        const httpError = new Error(
          `SSE connection failed with HTTP ${response.status}`
        );
        this.handleError(httpError);

        if (attempt < MAX_RECONNECT_ATTEMPTS) {
          await this.reconnect(url, options, attempt);
          attempt++;
          continue;
        }

        throw httpError;
      }

      if (!response.body) {
        throw new Error(
          'Response body is null — streaming not supported by server.'
        );
      }

      // ── Read the SSE stream ──────────────────────────────────────────────
      let streamInterrupted = false;
      try {
        yield* this._readStream(response.body, options.signal ?? null);
        // Stream completed normally — exit the retry loop
        return;
      } catch (err) {
        if (options.signal?.aborted) {
          // Clean navigation-away exit
          return;
        }

        streamInterrupted = true;
        this.handleError(err instanceof Error ? err : new Error(String(err)));
      }

      if (streamInterrupted && attempt < MAX_RECONNECT_ATTEMPTS) {
        await this.reconnect(url, options, attempt);
        attempt++;
        continue;
      }

      // All retries exhausted
      throw new Error(
        `SSE stream failed after ${MAX_RECONNECT_ATTEMPTS} reconnection attempts.`
      );
    }
  }

  /**
   * Parse a single SSE `data:` line.
   *
   * Handles the three formats emitted by the backend:
   *   - `data: {"delta":"text"}` → `{ delta: "text", done: false }`
   *   - `data: [DONE]`           → `{ delta: null, done: true }`
   *   - `data: {"id":…,"content":…}` → `{ delta: null, done: true }`
   *
   * Any other line (blank, comment, non-`data:` prefix, malformed JSON) is
   * silently skipped: `{ delta: null, done: false }`.
   *
   * @param data - A single raw SSE line (may or may not start with `data: `)
   * @returns Parsed result with optional delta text and a done flag
   *
   * @see Requirements 11.2, 11.5
   */
  parseChunk(data: string): { delta: string | null; done: boolean } {
    const trimmed = data.trim();

    if (!trimmed.startsWith('data: ')) {
      return { delta: null, done: false };
    }

    const payload = trimmed.slice('data: '.length).trim();

    // Sentinel value that signals the end of the stream
    if (payload === '[DONE]') {
      return { delta: null, done: true };
    }

    try {
      const parsed = JSON.parse(payload) as Partial<
        StreamChunk & StreamDoneEvent
      >;

      // Done event: { id, content } — no `delta` key
      if ('content' in parsed && 'id' in parsed && !('delta' in parsed)) {
        return { delta: null, done: true };
      }

      // Chunk event: { delta: string }
      if (typeof parsed.delta === 'string') {
        return { delta: parsed.delta, done: false };
      }
    } catch {
      // Malformed JSON — skip
    }

    return { delta: null, done: false };
  }

  /**
   * Log a streaming error to the console (development) and record it for
   * potential user feedback.
   *
   * This method does **not** throw — callers decide whether to retry or
   * propagate the error.
   *
   * @param error - The error that occurred during streaming
   */
  private handleError(error: Error): void {
    if (
      import.meta.env.DEV === true ||
      import.meta.env.MODE === 'development'
    ) {
      console.error('[StreamingHandler] Error:', error.message, error);
    }
  }

  /**
   * Wait before the next reconnection attempt using exponential backoff.
   *
   * Delays:
   *   - attempt 0 → 1 000 ms
   *   - attempt 1 → 2 000 ms
   *   - attempt 2 → 4 000 ms
   *
   * @param _url     - Endpoint URL (reserved for future use, e.g. logging)
   * @param _options - Request options (reserved for future use)
   * @param attempt  - Zero-based attempt index (0 = first retry)
   *
   * @see Requirements 11.6
   */
  private reconnect(
    _url: string,
    _options: RequestInit,
    attempt: number
  ): Promise<void> {
    const delayMs = BASE_RECONNECT_DELAY_MS * Math.pow(2, attempt);

    if (
      import.meta.env.DEV === true ||
      import.meta.env.MODE === 'development'
    ) {
      console.debug(
        `[StreamingHandler] Reconnecting in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RECONNECT_ATTEMPTS})`
      );
    }

    return new Promise<void>((resolve) => setTimeout(resolve, delayMs));
  }

  // ---------------------------------------------------------------------------
  // Private stream reader
  // ---------------------------------------------------------------------------

  /**
   * Reads a `ReadableStream<Uint8Array>` and yields each SSE delta.
   *
   * Handles partial chunks by buffering incomplete lines across reads.
   * Respects the provided `AbortSignal` to stop reading when the caller
   * navigates away.
   *
   * @param stream - The response body stream
   * @param signal - Optional AbortSignal from the caller
   * @yields Each text delta extracted from SSE `data:` lines
   *
   * @see Requirements 11.2, 11.3, 11.5, 11.8
   */
  private async *_readStream(
    stream: ReadableStream<Uint8Array>,
    signal: AbortSignal | null
  ): AsyncGenerator<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        // Honour abort signal between reads
        if (signal?.aborted) {
          return;
        }

        const { value, done } = await reader.read();

        if (done) {
          // Flush any remaining buffered content
          if (buffer.trim()) {
            const { delta, done: isDone } = this.parseChunk(buffer.trim());
            if (delta !== null) yield delta;
            if (isDone) return;
          }
          return;
        }

        // Decode the incoming bytes and append to the line buffer
        buffer += decoder.decode(value, { stream: true });

        // Split on newlines; the last element may be an incomplete line
        const lines = buffer.split('\n');

        // Keep the last (potentially incomplete) line in the buffer
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue; // blank line (SSE event separator)

          const { delta, done: isDone } = this.parseChunk(trimmed);

          if (delta !== null) {
            yield delta; // Requirement 11.3 – append delta to accumulated text
          }

          if (isDone) {
            return; // Requirement 11.5 – close connection on done event
          }
        }
      }
    } finally {
      // Always release the reader lock, even if the caller abandons the generator
      // Requirement 11.8 – clean up resources on navigation away
      try {
        reader.releaseLock();
      } catch {
        // Already released
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

/**
 * Singleton instance of the StreamingHandler.
 *
 * Import this wherever you need to stream AI responses:
 *
 * ```ts
 * import { streamingHandler } from '@/utils/ai/streamingHandler';
 * ```
 */
export const streamingHandler = new StreamingHandler();

export default streamingHandler;
