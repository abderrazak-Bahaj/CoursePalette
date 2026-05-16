/**
 * useAiConversation Hook
 *
 * Manages conversation history for a student–AI Q&A session scoped to a
 * specific course lesson.  Provides:
 *   - Local state for messages, loading/streaming flags, errors, and pagination
 *   - localStorage persistence (restored on mount, cleared on clearHistory)
 *   - `addMessage`    – optimistically adds a message to state + localStorage
 *   - `askQuestion`   – sends a question (streaming or non-streaming) and
 *                       accumulates the assistant reply in real-time
 *   - `clearHistory`  – deletes server-side history and wipes local state
 *   - `fetchHistory`  – loads paginated history from the server
 *
 * @module hooks/ai/useAiConversation
 * @see Requirements 3, 12
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { aiApiClient } from '../../services/ai/aiApiClient';
import { AiRateLimitError } from '../../services/ai/errors';
import type { AiMessage } from '../../services/ai/types';
import { performanceMonitor } from '../../utils/ai/performanceMonitor';

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseAiConversationReturn {
  /** All messages in the current conversation (user + assistant). */
  messages: AiMessage[];
  /** Whether a non-streaming request is in flight. */
  isLoading: boolean;
  /** Whether a streaming response is still arriving. */
  isStreaming: boolean;
  /** The current error, if any. */
  error: Error | null;
  /** Unix timestamp (seconds) when the rate limit resets, or null. */
  rateLimitRetryAfter: number | null;
  /** Current pagination page for history. */
  currentPage: number;
  /** Whether there are more history pages to load. */
  hasMorePages: boolean;
  /**
   * Adds a message to local state and persists it to localStorage.
   * Does NOT call the backend — use `askQuestion` for that.
   */
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  /**
   * Sends a question to the AI and adds both the user message and the
   * assistant reply to the conversation.
   *
   * @param question - The student's question text
   * @param stream   - When `true` (default), uses SSE streaming so the
   *                   assistant message updates in real-time.
   */
  askQuestion: (question: string, stream?: boolean) => Promise<void>;
  /**
   * Clears all conversation history on the server and in local state /
   * localStorage.
   */
  clearHistory: () => Promise<void>;
  /**
   * Fetches paginated conversation history from the server and replaces the
   * current message list.
   *
   * @param page - 1-based page number (defaults to 1)
   */
  fetchHistory: (page?: number) => Promise<void>;
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

/**
 * Builds the localStorage key for a given course + lesson pair.
 */
function buildStorageKey(
  courseId: string | number,
  lessonId: string | number
): string {
  return `ai_conversation_${courseId}_${lessonId}`;
}

/**
 * Reads messages from localStorage.  Returns an empty array on any error.
 */
function loadFromStorage(key: string): AiMessage[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as AiMessage[];
  } catch {
    return [];
  }
}

/**
 * Persists messages to localStorage.  Silently ignores write errors (e.g.
 * storage quota exceeded or private-browsing restrictions).
 */
function saveToStorage(key: string, messages: AiMessage[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(messages));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Removes the conversation entry from localStorage.
 */
function clearStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Custom hook for managing a student–AI conversation for a specific lesson.
 *
 * @param courseId - Course identifier
 * @param lessonId - Lesson identifier
 *
 * @example
 * ```tsx
 * const { messages, askQuestion, isStreaming } = useAiConversation(courseId, lessonId);
 *
 * // Ask with streaming (default)
 * await askQuestion('What is a React hook?');
 *
 * // Ask without streaming
 * await askQuestion('What is a React hook?', false);
 * ```
 */
export function useAiConversation(
  courseId: string | number,
  lessonId: string | number
): UseAiConversationReturn {
  const storageKey = buildStorageKey(courseId, lessonId);

  // ── State ────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<AiMessage[]>(() =>
    loadFromStorage(storageKey)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);

  /**
   * Ref that always holds the latest messages array so that async callbacks
   * (streaming generator) can append to the current list without stale
   * closure issues.
   */
  const messagesRef = useRef<AiMessage[]>(messages);

  // ── Restore from localStorage on mount / when courseId|lessonId changes ──
  useEffect(() => {
    const stored = loadFromStorage(storageKey);
    setMessages(stored);
    messagesRef.current = stored;
    // Reset pagination state when the lesson changes
    setCurrentPage(1);
    setHasMorePages(false);
    setError(null);
    setRateLimitRetryAfter(null);
  }, [storageKey]);

  // Keep the ref in sync with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // ── addMessage ────────────────────────────────────────────────────────────

  const addMessage = useCallback(
    (role: 'user' | 'assistant', content: string) => {
      const newMessage: AiMessage = {
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        role,
        content,
        created_at: new Date().toISOString(),
        ...(role === 'assistant' ? { disclaimer: undefined } : {}),
      };

      setMessages((prev) => {
        const updated = [...prev, newMessage];
        messagesRef.current = updated;
        saveToStorage(storageKey, updated);
        return updated;
      });
    },
    [storageKey]
  );

  // ── askQuestion ───────────────────────────────────────────────────────────

  const askQuestion = useCallback(
    async (question: string, stream: boolean = true): Promise<void> => {
      setError(null);
      setRateLimitRetryAfter(null);

      // 1. Add the user message immediately
      const userMessage: AiMessage = {
        id: `local_user_${Date.now()}`,
        role: 'user',
        content: question,
        created_at: new Date().toISOString(),
      };

      const withUser = [...messagesRef.current, userMessage];
      messagesRef.current = withUser;
      setMessages(withUser);
      saveToStorage(storageKey, withUser);

      // Track the duration of the entire ask-question operation
      const doneAskQuestion = performanceMonitor.measureOperation(
        stream ? 'askQuestion:streaming' : 'askQuestion:nonStreaming'
      );

      try {
        if (stream) {
          // ── Streaming path ──────────────────────────────────────────────
          setIsStreaming(true);

          // Create a placeholder assistant message that we'll update in-place
          const assistantId = `local_assistant_${Date.now()}`;
          const assistantPlaceholder: AiMessage = {
            id: assistantId,
            role: 'assistant',
            content: '',
            created_at: new Date().toISOString(),
          };

          const withAssistant = [...withUser, assistantPlaceholder];
          messagesRef.current = withAssistant;
          setMessages(withAssistant);

          let accumulated = '';

          const generator = aiApiClient.askQuestion(
            courseId,
            lessonId,
            question,
            true
          );

          for await (const delta of generator) {
            accumulated += delta;

            // Update the last message (the assistant placeholder) in-place
            setMessages((prev) => {
              const updated = prev.map((msg) =>
                msg.id === assistantId ? { ...msg, content: accumulated } : msg
              );
              messagesRef.current = updated;
              return updated;
            });
          }

          // Persist the final accumulated message to localStorage
          setMessages((prev) => {
            const finalMessages = prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: accumulated } : msg
            );
            messagesRef.current = finalMessages;
            saveToStorage(storageKey, finalMessages);
            return finalMessages;
          });

          // Record successful streaming operation
          doneAskQuestion();
        } else {
          // ── Non-streaming path ──────────────────────────────────────────
          setIsLoading(true);

          const response = await aiApiClient.askQuestion(
            courseId,
            lessonId,
            question,
            false
          );

          const assistantMessage: AiMessage = {
            ...response,
            // Ensure we have a local fallback id if the server doesn't return one
            id: response.id ?? `local_assistant_${Date.now()}`,
          };

          const withResponse = [...messagesRef.current, assistantMessage];
          messagesRef.current = withResponse;
          setMessages(withResponse);
          saveToStorage(storageKey, withResponse);

          // Record successful non-streaming operation
          doneAskQuestion();
        }
      } catch (err) {
        if (err instanceof AiRateLimitError) {
          setRateLimitRetryAfter(err.retryAfter);
        }
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [courseId, lessonId, storageKey]
  );

  // ── clearHistory ──────────────────────────────────────────────────────────

  const clearHistory = useCallback(async (): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      await aiApiClient.clearConversationHistory(courseId, lessonId);
      clearStorage(storageKey);
      messagesRef.current = [];
      setMessages([]);
      setCurrentPage(1);
      setHasMorePages(false);
    } catch (err) {
      if (err instanceof AiRateLimitError) {
        setRateLimitRetryAfter(err.retryAfter);
      }
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId, storageKey]);

  // ── fetchHistory ──────────────────────────────────────────────────────────

  const fetchHistory = useCallback(
    async (page: number = 1): Promise<void> => {
      setError(null);
      setIsLoading(true);

      try {
        const result = await aiApiClient.getConversationHistory(
          courseId,
          lessonId,
          page
        );

        const fetched = result.data ?? [];
        const lastPage = result.last_page ?? 1;
        const currentPageFromServer = result.current_page ?? page;

        messagesRef.current = fetched;
        setMessages(fetched);
        setCurrentPage(currentPageFromServer);
        setHasMorePages(currentPageFromServer < lastPage);

        // Persist fetched history to localStorage so it survives a refresh
        saveToStorage(storageKey, fetched);
      } catch (err) {
        if (err instanceof AiRateLimitError) {
          setRateLimitRetryAfter(err.retryAfter);
        }
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [courseId, lessonId, storageKey]
  );

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    rateLimitRetryAfter,
    currentPage,
    hasMorePages,
    addMessage,
    askQuestion,
    clearHistory,
    fetchHistory,
  };
}

export default useAiConversation;
