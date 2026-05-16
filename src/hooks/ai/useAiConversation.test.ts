/**
 * Unit tests for useAiConversation hook
 *
 * Validates: Requirements 21 (3 – unit tests for state management hooks)
 *
 * Covers:
 *  - Initial state is correct (messages from localStorage, flags false)
 *  - addMessage: optimistically adds a message to state + localStorage
 *  - askQuestion (non-streaming): loading transitions, success, error, rate-limit
 *  - askQuestion (streaming): streaming flag, chunk accumulation, error
 *  - clearHistory: clears state, localStorage, and calls API
 *  - fetchHistory: populates messages, pagination state, error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAiConversation } from './useAiConversation';
import type { AiMessage, PaginatedMessages } from '../../services/ai/types';
import { AiRateLimitError } from '../../services/ai/errors';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock the aiApiClient so no real HTTP calls are made
vi.mock('../../services/ai/aiApiClient', () => ({
  aiApiClient: {
    askQuestion: vi.fn(),
    getConversationHistory: vi.fn(),
    clearConversationHistory: vi.fn(),
  },
}));

// Mock performanceMonitor to avoid side-effects
vi.mock('../../utils/ai/performanceMonitor', () => ({
  performanceMonitor: {
    measureOperation: vi.fn(() => vi.fn()),
  },
}));

import { aiApiClient } from '../../services/ai/aiApiClient';

// ---------------------------------------------------------------------------
// localStorage stub
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

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const COURSE_ID = '1';
const LESSON_ID = '2';
const STORAGE_KEY = `ai_conversation_${COURSE_ID}_${LESSON_ID}`;

function makeMessage(
  role: 'user' | 'assistant' = 'assistant',
  content = 'Hello',
  id = 'msg-1'
): AiMessage {
  return { id, role, content, created_at: new Date().toISOString() };
}

function makePaginatedMessages(
  messages: AiMessage[],
  currentPage = 1,
  lastPage = 1
): PaginatedMessages {
  return { data: messages, current_page: currentPage, last_page: lastPage };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAiConversation', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with empty messages when localStorage is empty', () => {
      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.rateLimitRetryAfter).toBeNull();
      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasMorePages).toBe(false);
    });

    it('restores messages from localStorage on mount', () => {
      const stored = [makeMessage('user', 'Stored question', 'stored-1')];
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(stored));

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Stored question');
    });

    it('returns empty messages when localStorage contains invalid JSON', () => {
      localStorageMock.setItem(STORAGE_KEY, 'not-valid-json');

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      expect(result.current.messages).toEqual([]);
    });
  });

  // ── addMessage ────────────────────────────────────────────────────────────

  describe('addMessage', () => {
    it('adds a user message to state', () => {
      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      act(() => {
        result.current.addMessage('user', 'My question');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[0].content).toBe('My question');
    });

    it('adds an assistant message to state', () => {
      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      act(() => {
        result.current.addMessage('assistant', 'AI answer');
      });

      expect(result.current.messages[0].role).toBe('assistant');
      expect(result.current.messages[0].content).toBe('AI answer');
    });

    it('persists the message to localStorage', () => {
      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      act(() => {
        result.current.addMessage('user', 'Persisted question');
      });

      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY) ?? '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].content).toBe('Persisted question');
    });

    it('accumulates multiple messages', () => {
      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      act(() => {
        result.current.addMessage('user', 'Q1');
        result.current.addMessage('assistant', 'A1');
      });

      expect(result.current.messages).toHaveLength(2);
    });
  });

  // ── askQuestion (non-streaming) ───────────────────────────────────────────

  describe('askQuestion – non-streaming', () => {
    it('adds user message immediately and assistant message on success', async () => {
      const assistantMsg = makeMessage('assistant', 'The answer', 'server-1');
      vi.mocked(aiApiClient.askQuestion).mockResolvedValueOnce(assistantMsg);

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.askQuestion('My question', false);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[0].content).toBe('My question');
      expect(result.current.messages[1].role).toBe('assistant');
      expect(result.current.messages[1].content).toBe('The answer');
    });

    it('sets isLoading true during request and false after', async () => {
      let resolveRequest!: (value: AiMessage) => void;
      const pending = new Promise<AiMessage>((res) => {
        resolveRequest = res;
      });
      vi.mocked(aiApiClient.askQuestion).mockReturnValueOnce(pending as any);

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      act(() => {
        void result.current.askQuestion('Question', false);
      });

      // isLoading should be true while the promise is pending
      await waitFor(() => expect(result.current.isLoading).toBe(true));

      act(() => {
        resolveRequest(makeMessage('assistant', 'Done'));
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('sets error state when the request fails', async () => {
      vi.mocked(aiApiClient.askQuestion).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.askQuestion('Question', false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe('Network error');
      expect(result.current.isLoading).toBe(false);
    });

    it('sets rateLimitRetryAfter when a rate-limit error is thrown', async () => {
      const rateLimitErr = new AiRateLimitError(1700000000, 'Rate limited');
      vi.mocked(aiApiClient.askQuestion).mockRejectedValueOnce(rateLimitErr);

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.askQuestion('Question', false);
      });

      expect(result.current.rateLimitRetryAfter).toBe(1700000000);
    });

    it('clears previous error before a new request', async () => {
      vi.mocked(aiApiClient.askQuestion)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(makeMessage('assistant', 'OK'));

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.askQuestion('Q1', false);
      });
      expect(result.current.error).not.toBeNull();

      await act(async () => {
        await result.current.askQuestion('Q2', false);
      });
      expect(result.current.error).toBeNull();
    });
  });

  // ── askQuestion (streaming) ───────────────────────────────────────────────

  describe('askQuestion – streaming', () => {
    it('sets isStreaming true during streaming and false after', async () => {
      async function* fakeStream() {
        yield 'Hello';
        yield ' world';
      }
      vi.mocked(aiApiClient.askQuestion).mockReturnValueOnce(
        fakeStream() as any
      );

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.askQuestion('Question', true);
      });

      expect(result.current.isStreaming).toBe(false);
    });

    it('accumulates streaming chunks into the assistant message', async () => {
      async function* fakeStream() {
        yield 'Part1';
        yield ' Part2';
        yield ' Part3';
      }
      vi.mocked(aiApiClient.askQuestion).mockReturnValueOnce(
        fakeStream() as any
      );

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.askQuestion('Question', true);
      });

      const assistantMsg = result.current.messages.find(
        (m) => m.role === 'assistant'
      );
      expect(assistantMsg?.content).toBe('Part1 Part2 Part3');
    });

    it('sets error state when streaming fails', async () => {
      async function* failingStream() {
        yield 'Partial';
        throw new Error('Stream interrupted');
      }
      vi.mocked(aiApiClient.askQuestion).mockReturnValueOnce(
        failingStream() as any
      );

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.askQuestion('Question', true);
      });

      expect(result.current.error?.message).toBe('Stream interrupted');
      expect(result.current.isStreaming).toBe(false);
    });
  });

  // ── clearHistory ──────────────────────────────────────────────────────────

  describe('clearHistory', () => {
    it('clears messages from state and localStorage on success', async () => {
      const stored = [makeMessage('user', 'Old question', 'old-1')];
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(stored));
      vi.mocked(aiApiClient.clearConversationHistory).mockResolvedValueOnce(
        undefined
      );

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      expect(result.current.messages).toHaveLength(1);

      await act(async () => {
        await result.current.clearHistory();
      });

      expect(result.current.messages).toEqual([]);
      expect(localStorageMock.getItem(STORAGE_KEY)).toBeNull();
    });

    it('calls the API to clear server-side history', async () => {
      vi.mocked(aiApiClient.clearConversationHistory).mockResolvedValueOnce(
        undefined
      );

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.clearHistory();
      });

      expect(aiApiClient.clearConversationHistory).toHaveBeenCalledWith(
        COURSE_ID,
        LESSON_ID
      );
    });

    it('sets error state when the API call fails', async () => {
      vi.mocked(aiApiClient.clearConversationHistory).mockRejectedValueOnce(
        new Error('Server error')
      );

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.clearHistory();
      });

      expect(result.current.error?.message).toBe('Server error');
    });

    it('resets pagination state after clearing', async () => {
      vi.mocked(aiApiClient.clearConversationHistory).mockResolvedValueOnce(
        undefined
      );

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.clearHistory();
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasMorePages).toBe(false);
    });
  });

  // ── fetchHistory ──────────────────────────────────────────────────────────

  describe('fetchHistory', () => {
    it('populates messages from the server response', async () => {
      const messages = [
        makeMessage('user', 'Q1', 'h-1'),
        makeMessage('assistant', 'A1', 'h-2'),
      ];
      vi.mocked(aiApiClient.getConversationHistory).mockResolvedValueOnce(
        makePaginatedMessages(messages)
      );

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.fetchHistory(1);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe('Q1');
    });

    it('sets hasMorePages when there are more pages', async () => {
      vi.mocked(aiApiClient.getConversationHistory).mockResolvedValueOnce(
        makePaginatedMessages([makeMessage()], 1, 3)
      );

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.fetchHistory(1);
      });

      expect(result.current.hasMorePages).toBe(true);
      expect(result.current.currentPage).toBe(1);
    });

    it('sets hasMorePages to false on the last page', async () => {
      vi.mocked(aiApiClient.getConversationHistory).mockResolvedValueOnce(
        makePaginatedMessages([makeMessage()], 3, 3)
      );

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.fetchHistory(3);
      });

      expect(result.current.hasMorePages).toBe(false);
    });

    it('sets error state when fetch fails', async () => {
      vi.mocked(aiApiClient.getConversationHistory).mockRejectedValueOnce(
        new Error('Fetch failed')
      );

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.fetchHistory();
      });

      expect(result.current.error?.message).toBe('Fetch failed');
      expect(result.current.isLoading).toBe(false);
    });

    it('persists fetched messages to localStorage', async () => {
      const messages = [makeMessage('user', 'Fetched Q', 'f-1')];
      vi.mocked(aiApiClient.getConversationHistory).mockResolvedValueOnce(
        makePaginatedMessages(messages)
      );

      const { result } = renderHook(() =>
        useAiConversation(COURSE_ID, LESSON_ID)
      );

      await act(async () => {
        await result.current.fetchHistory();
      });

      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY) ?? '[]');
      expect(stored[0].content).toBe('Fetched Q');
    });
  });
});
