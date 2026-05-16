/**
 * Unit tests for StreamingHandler – SSE streaming (task 14.3)
 *
 * Validates: Requirements 11
 *
 * Tests cover:
 *  - parseChunk():
 *    - Parses `data: {"delta":"text"}` → { delta: "text", done: false }
 *    - Parses `data: [DONE]` → { delta: null, done: true }
 *    - Parses `data: {"id":1,"content":"full"}` (done event) → { delta: null, done: true }
 *    - Returns { delta: null, done: false } for blank lines
 *    - Returns { delta: null, done: false } for non-data: lines
 *    - Returns { delta: null, done: false } for malformed JSON
 *    - Returns { delta: null, done: false } for data: lines without delta or content
 *  - streamQuestion():
 *    - Yields each delta from SSE chunks
 *    - Stops yielding after a [DONE] event
 *    - Stops yielding after a done-event JSON object
 *    - Handles partial chunks buffered across reads
 *    - Exits cleanly when AbortSignal is already aborted
 *    - Exits cleanly when AbortSignal fires mid-stream
 *    - Throws on non-OK HTTP response after retries exhausted
 *    - Throws on network error after retries exhausted
 *    - Retries up to 3 times on connection interruption
 *    - Reconnects with exponential backoff (1s, 2s, 4s)
 *  - Singleton export:
 *    - streamingHandler is an instance of StreamingHandler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StreamingHandler, streamingHandler } from './streamingHandler';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build a ReadableStream that emits the given string chunks in sequence.
 * Each string is encoded as UTF-8 bytes.
 */
function buildStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index++]));
      } else {
        controller.close();
      }
    },
  });
}

/**
 * Build a mock Response with a streaming body.
 */
function buildStreamResponse(chunks: string[]): Response {
  return {
    ok: true,
    status: 200,
    body: buildStream(chunks),
  } as unknown as Response;
}

/**
 * Collect all yielded values from an AsyncGenerator into an array.
 */
async function collectGenerator<T>(gen: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const value of gen) {
    results.push(value);
  }
  return results;
}

// ============================================================================
// parseChunk()
// ============================================================================

describe('StreamingHandler.parseChunk()', () => {
  let handler: StreamingHandler;

  beforeEach(() => {
    handler = new StreamingHandler();
  });

  it('should parse a delta chunk correctly', () => {
    const result = handler.parseChunk('data: {"delta":"Hello"}');
    expect(result).toEqual({ delta: 'Hello', done: false });
  });

  it('should parse a delta chunk with extra whitespace', () => {
    const result = handler.parseChunk('  data: {"delta":"World"}  ');
    expect(result).toEqual({ delta: 'World', done: false });
  });

  it('should parse an empty delta string', () => {
    const result = handler.parseChunk('data: {"delta":""}');
    expect(result).toEqual({ delta: '', done: false });
  });

  it('should parse a delta with special characters', () => {
    const result = handler.parseChunk('data: {"delta":"Hello\\nWorld"}');
    expect(result).toEqual({ delta: 'Hello\nWorld', done: false });
  });

  it('should parse [DONE] sentinel as done=true', () => {
    const result = handler.parseChunk('data: [DONE]');
    expect(result).toEqual({ delta: null, done: true });
  });

  it('should parse a done-event JSON object (id + content) as done=true', () => {
    const result = handler.parseChunk(
      'data: {"id":1,"content":"Full response text"}'
    );
    expect(result).toEqual({ delta: null, done: true });
  });

  it('should return { delta: null, done: false } for a blank line', () => {
    expect(handler.parseChunk('')).toEqual({ delta: null, done: false });
    expect(handler.parseChunk('   ')).toEqual({ delta: null, done: false });
  });

  it('should return { delta: null, done: false } for a comment line', () => {
    expect(handler.parseChunk(': this is a comment')).toEqual({
      delta: null,
      done: false,
    });
  });

  it('should return { delta: null, done: false } for a non-data: prefixed line', () => {
    expect(handler.parseChunk('event: chunk')).toEqual({
      delta: null,
      done: false,
    });
    expect(handler.parseChunk('id: 123')).toEqual({ delta: null, done: false });
  });

  it('should return { delta: null, done: false } for malformed JSON', () => {
    expect(handler.parseChunk('data: {not valid json')).toEqual({
      delta: null,
      done: false,
    });
    expect(handler.parseChunk('data: undefined')).toEqual({
      delta: null,
      done: false,
    });
  });

  it('should return { delta: null, done: false } for a data: line with no delta or content', () => {
    expect(handler.parseChunk('data: {"other":"value"}')).toEqual({
      delta: null,
      done: false,
    });
  });

  it('should return { delta: null, done: false } for a data: line with null delta', () => {
    expect(handler.parseChunk('data: {"delta":null}')).toEqual({
      delta: null,
      done: false,
    });
  });
});

// ============================================================================
// streamQuestion() – successful streaming
// ============================================================================

describe('StreamingHandler.streamQuestion() – successful streaming', () => {
  let handler: StreamingHandler;

  beforeEach(() => {
    handler = new StreamingHandler();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should yield each delta from SSE chunks', async () => {
    const chunks = [
      'data: {"delta":"Hello"}\n',
      'data: {"delta":" World"}\n',
      'data: [DONE]\n',
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      buildStreamResponse(chunks)
    );

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
    });

    const results = await collectGenerator(gen);
    expect(results).toEqual(['Hello', ' World']);
  });

  it('should stop yielding after a [DONE] event', async () => {
    const chunks = [
      'data: {"delta":"Part 1"}\n',
      'data: [DONE]\n',
      'data: {"delta":"Part 2 (should not appear)"}\n',
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      buildStreamResponse(chunks)
    );

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
    });

    const results = await collectGenerator(gen);
    expect(results).toEqual(['Part 1']);
    expect(results).not.toContain('Part 2 (should not appear)');
  });

  it('should stop yielding after a done-event JSON object', async () => {
    const chunks = [
      'data: {"delta":"Answer"}\n',
      'data: {"id":42,"content":"Full answer text"}\n',
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      buildStreamResponse(chunks)
    );

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
    });

    const results = await collectGenerator(gen);
    expect(results).toEqual(['Answer']);
  });

  it('should handle multiple deltas in a single chunk (split by newlines)', async () => {
    // Two SSE lines delivered in one read
    const chunks = ['data: {"delta":"A"}\ndata: {"delta":"B"}\ndata: [DONE]\n'];

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      buildStreamResponse(chunks)
    );

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
    });

    const results = await collectGenerator(gen);
    expect(results).toEqual(['A', 'B']);
  });

  it('should handle partial chunks buffered across reads', async () => {
    // The SSE line is split across two reads
    const chunks = ['data: {"del', 'ta":"Hello"}\n', 'data: [DONE]\n'];

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      buildStreamResponse(chunks)
    );

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
    });

    const results = await collectGenerator(gen);
    expect(results).toEqual(['Hello']);
  });

  it('should skip blank lines (SSE event separators)', async () => {
    const chunks = [
      'data: {"delta":"A"}\n',
      '\n',
      'data: {"delta":"B"}\n',
      'data: [DONE]\n',
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      buildStreamResponse(chunks)
    );

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
    });

    const results = await collectGenerator(gen);
    expect(results).toEqual(['A', 'B']);
  });

  it('should include the Accept: text/event-stream header', async () => {
    const chunks = ['data: [DONE]\n'];
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(buildStreamResponse(chunks));

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
      headers: { Authorization: 'Bearer token' },
    });

    await collectGenerator(gen);

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.example.com/ask',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'text/event-stream',
          Authorization: 'Bearer token',
        }),
      })
    );
  });
});

// ============================================================================
// streamQuestion() – abort / cleanup
// ============================================================================

describe('StreamingHandler.streamQuestion() – abort / cleanup', () => {
  let handler: StreamingHandler;

  beforeEach(() => {
    handler = new StreamingHandler();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should exit cleanly when AbortSignal is already aborted before fetch', async () => {
    const controller = new AbortController();
    controller.abort();

    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
      signal: controller.signal,
    });

    const results = await collectGenerator(gen);

    expect(results).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should exit cleanly when AbortSignal fires mid-stream', async () => {
    const controller = new AbortController();

    // Build a stream that yields one chunk then hangs
    const encoder = new TextEncoder();
    let pullCount = 0;
    const hangingStream = new ReadableStream<Uint8Array>({
      pull(ctrl) {
        pullCount++;
        if (pullCount === 1) {
          ctrl.enqueue(encoder.encode('data: {"delta":"First"}\n'));
        } else {
          // Abort after the first chunk
          controller.abort();
          ctrl.close();
        }
      },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      body: hangingStream,
    } as unknown as Response);

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
      signal: controller.signal,
    });

    const results: string[] = [];
    for await (const delta of gen) {
      results.push(delta);
    }

    // Should have received the first chunk and then stopped cleanly
    expect(results).toContain('First');
  });
});

// ============================================================================
// streamQuestion() – error handling and reconnection
// ============================================================================

describe('StreamingHandler.streamQuestion() – error handling', () => {
  let handler: StreamingHandler;

  beforeEach(() => {
    handler = new StreamingHandler();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should throw after all retries are exhausted on network error', async () => {
    const networkError = new Error('Network failure');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(networkError);

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
    });

    const promise = collectGenerator(gen);

    // Advance through all reconnection delays: 1s + 2s + 4s
    await vi.advanceTimersByTimeAsync(1000 + 2000 + 4000);

    await expect(promise).rejects.toThrow('Network failure');
  });

  it('should throw after all retries are exhausted on non-OK HTTP response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      body: null,
    } as unknown as Response);

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
    });

    const promise = collectGenerator(gen);

    // Advance through all reconnection delays
    await vi.advanceTimersByTimeAsync(1000 + 2000 + 4000);

    await expect(promise).rejects.toThrow('503');
  });

  it('should retry up to 3 times on network error', async () => {
    const networkError = new Error('Connection refused');
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(networkError);

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
    });

    const promise = collectGenerator(gen).catch(() => 'failed');

    // Advance through all reconnection delays
    await vi.advanceTimersByTimeAsync(1000 + 2000 + 4000);
    await promise;

    // 1 initial attempt + 3 retries = 4 total calls
    expect(fetchSpy).toHaveBeenCalledTimes(4);
  });

  it('should use exponential backoff: 1s, 2s, 4s between reconnection attempts', async () => {
    const networkError = new Error('Connection refused');
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(networkError);

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
    });

    const promise = collectGenerator(gen).catch(() => 'failed');

    // After initial failure, only 1 call
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // After 1s: second attempt
    await vi.advanceTimersByTimeAsync(1000);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    // After 2s more: third attempt
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    // After 4s more: fourth attempt (last retry)
    await vi.advanceTimersByTimeAsync(4000);
    await promise;
    expect(fetchSpy).toHaveBeenCalledTimes(4);
  });

  it('should succeed after a transient failure (retry succeeds)', async () => {
    const networkError = new Error('Transient failure');
    let callCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(networkError);
      }
      return Promise.resolve(
        buildStreamResponse(['data: {"delta":"Recovered"}\n', 'data: [DONE]\n'])
      );
    });

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
    });

    const promise = collectGenerator(gen);

    // Advance past the first reconnection delay (1s)
    await vi.advanceTimersByTimeAsync(1000);
    const results = await promise;

    expect(results).toEqual(['Recovered']);
  });

  it('should throw when response body is null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      body: null,
    } as unknown as Response);

    const gen = handler.streamQuestion('https://api.example.com/ask', {
      method: 'POST',
    });

    await expect(collectGenerator(gen)).rejects.toThrow(
      'streaming not supported'
    );
  });
});

// ============================================================================
// Singleton export
// ============================================================================

describe('streamingHandler singleton', () => {
  it('should be an instance of StreamingHandler', () => {
    expect(streamingHandler).toBeInstanceOf(StreamingHandler);
  });

  it('should expose streamQuestion()', () => {
    expect(typeof streamingHandler.streamQuestion).toBe('function');
  });

  it('should expose parseChunk()', () => {
    expect(typeof streamingHandler.parseChunk).toBe('function');
  });
});
