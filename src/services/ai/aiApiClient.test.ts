/**
 * Unit tests for AiApiClient – request deduplication (task 2.4)
 *
 * Validates: Requirements 1
 *
 * Tests cover:
 *  - Cache hit: identical non-streaming requests within the 5-minute window
 *    are served from cache without a network call.
 *  - Cache miss: first request (or after expiry) hits the network.
 *  - Cache key uniqueness: different courseId / lessonId / question produce
 *    independent cache entries.
 *  - Streaming bypass: stream=true requests are never cached.
 *  - clearCache(): empties the entire cache.
 *  - invalidateCache(courseId, lessonId): removes only entries for that lesson.
 *  - Cache expiry: entries older than 5 minutes are treated as misses.
 *  - clearConversationHistory() invalidates the cache for the lesson.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the config module before importing the client so that the module-level
// buildConfig() call does not fail in the test environment (no import.meta.env).
vi.mock('./config', () => ({
  aiConfig: {
    apiBaseUrl: 'http://localhost:8000/api',
    enabled: true,
    streamingEnabled: true,
    timeoutMs: 5000,
    features: {
      aiQA: true,
      aiGeneration: true,
      aiEnhancement: true,
      aiPreGrading: true,
      aiStatistics: true,
    },
  },
  aiFeatures: {
    aiQA: true,
    aiGeneration: true,
    aiEnhancement: true,
    aiPreGrading: true,
    aiStatistics: true,
  },
  featureFlags: {
    aiQA: true,
    aiGeneration: true,
    aiEnhancement: true,
    aiPreGrading: true,
    aiStatistics: true,
  },
}));

import { AiApiClient } from './aiApiClient';
import type { AiMessage } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal AiMessage fixture. */
function makeMessage(content: string = 'Test answer'): AiMessage {
  return {
    id: '1',
    role: 'assistant',
    content,
    created_at: new Date().toISOString(),
    disclaimer: 'AI responses should be verified.',
  };
}

/** Build a minimal fetch Response for a successful JSON payload. */
function makeJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// Setup – stub localStorage
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AiApiClient – request deduplication', () => {
  let client: AiApiClient;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Fresh client per test so caches don't bleed between tests.
    client = new AiApiClient('http://localhost:8000/api', 5000);

    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Cache miss on first request ──────────────────────────────────────────

  it('makes a network request on the first call (cache miss)', async () => {
    const message = makeMessage();
    fetchSpy.mockResolvedValueOnce(makeJsonResponse({ data: message }));

    const result = await client.askQuestion('1', '2', 'What is recursion?');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(message);
  });

  // ── Cache hit on identical request ──────────────────────────────────────

  it('returns cached response on identical non-streaming request (cache hit)', async () => {
    const message = makeMessage('Cached answer');
    fetchSpy.mockResolvedValueOnce(makeJsonResponse({ data: message }));

    const first = await client.askQuestion('1', '2', 'What is recursion?');
    const second = await client.askQuestion('1', '2', 'What is recursion?');

    expect(fetchSpy).toHaveBeenCalledTimes(1); // only one network call
    expect(first).toEqual(message);
    expect(second).toEqual(message);
  });

  // ── Different questions produce independent cache entries ────────────────

  it('makes separate network requests for different questions', async () => {
    const msg1 = makeMessage('Answer 1');
    const msg2 = makeMessage('Answer 2');
    fetchSpy
      .mockResolvedValueOnce(makeJsonResponse({ data: msg1 }))
      .mockResolvedValueOnce(makeJsonResponse({ data: msg2 }));

    const r1 = await client.askQuestion('1', '2', 'Question A');
    const r2 = await client.askQuestion('1', '2', 'Question B');

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(r1).toEqual(msg1);
    expect(r2).toEqual(msg2);
  });

  // ── Different lessonId produces a cache miss ─────────────────────────────

  it('makes a new network request when lessonId differs', async () => {
    fetchSpy
      .mockResolvedValueOnce(makeJsonResponse({ data: makeMessage('L2') }))
      .mockResolvedValueOnce(makeJsonResponse({ data: makeMessage('L3') }));

    await client.askQuestion('1', '2', 'Same question');
    await client.askQuestion('1', '3', 'Same question');

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  // ── Different courseId produces a cache miss ─────────────────────────────

  it('makes a new network request when courseId differs', async () => {
    fetchSpy
      .mockResolvedValueOnce(makeJsonResponse({ data: makeMessage('C1') }))
      .mockResolvedValueOnce(makeJsonResponse({ data: makeMessage('C2') }));

    await client.askQuestion('1', '2', 'Same question');
    await client.askQuestion('2', '2', 'Same question');

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  // ── Streaming requests are never cached ─────────────────────────────────

  it('does not cache streaming requests (stream=true)', async () => {
    const sseBody =
      'data: {"delta":"Hello"}\n\ndata: {"content":"Hello","id":"1"}\n\n';
    fetchSpy
      .mockResolvedValueOnce(
        new Response(sseBody, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        })
      )
      .mockResolvedValueOnce(
        new Response(sseBody, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        })
      );

    const gen1 = await client.askQuestion('1', '2', 'What is recursion?', true);
    const gen2 = await client.askQuestion('1', '2', 'What is recursion?', true);

    for await (const _ of gen1) {
      /* drain */
    }
    for await (const _ of gen2) {
      /* drain */
    }

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  // ── clearCache() empties the entire cache ────────────────────────────────

  it('clearCache() causes subsequent requests to hit the network again', async () => {
    const message = makeMessage();
    fetchSpy
      .mockResolvedValueOnce(makeJsonResponse({ data: message }))
      .mockResolvedValueOnce(makeJsonResponse({ data: message }));

    await client.askQuestion('1', '2', 'What is recursion?');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    client.clearCache();

    await client.askQuestion('1', '2', 'What is recursion?');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  // ── invalidateCache(courseId, lessonId) ──────────────────────────────────

  it('invalidateCache() removes entries for the specified lesson only', async () => {
    fetchSpy
      .mockResolvedValueOnce(
        makeJsonResponse({ data: makeMessage('L2 first') })
      )
      .mockResolvedValueOnce(makeJsonResponse({ data: makeMessage('L3') }))
      .mockResolvedValueOnce(
        makeJsonResponse({ data: makeMessage('L2 second') })
      );

    await client.askQuestion('1', '2', 'Question');
    await client.askQuestion('1', '3', 'Question');
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    client.invalidateCache('1', '2');

    // Lesson 2 should hit the network again
    await client.askQuestion('1', '2', 'Question');
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    // Lesson 3 should still be cached
    await client.askQuestion('1', '3', 'Question');
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  // ── Cache expiry after 5 minutes ─────────────────────────────────────────

  it('treats entries older than 5 minutes as a cache miss', async () => {
    vi.useFakeTimers();

    const message = makeMessage();
    fetchSpy
      .mockResolvedValueOnce(makeJsonResponse({ data: message }))
      .mockResolvedValueOnce(makeJsonResponse({ data: message }));

    await client.askQuestion('1', '2', 'What is recursion?');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300_001); // 5 minutes + 1 ms

    await client.askQuestion('1', '2', 'What is recursion?');
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  // ── clearConversationHistory() invalidates the cache ─────────────────────

  it('clearConversationHistory() invalidates the cache for the lesson', async () => {
    const message = makeMessage();
    const message2 = makeMessage('Fresh answer');

    fetchSpy
      .mockResolvedValueOnce(makeJsonResponse({ data: message }))
      .mockResolvedValueOnce(
        makeJsonResponse({ message: 'Cleared', deleted_count: 5 })
      )
      .mockResolvedValueOnce(makeJsonResponse({ data: message2 }));

    await client.askQuestion('1', '2', 'What is recursion?');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await client.clearConversationHistory('1', '2');
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const result = await client.askQuestion('1', '2', 'What is recursion?');
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(result).toEqual(message2);
  });
});
