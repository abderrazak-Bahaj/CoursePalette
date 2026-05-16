/**
 * AskAiComponent
 *
 * Student Q&A component that allows students to ask questions about lesson
 * content and receive AI-generated streaming responses in real-time.
 *
 * Features:
 * - Textarea input (max 2000 chars) with character counter
 * - Submit button disabled while loading/streaming
 * - Streaming response rendered via MarkdownRenderer with isStreaming=true
 * - Spinner indicator while streaming
 * - AI disclaimer message
 * - RateLimitAlert when rate limited
 * - Error message with retry button on failure
 * - Input cleared after successful submission
 * - Most recent assistant message displayed prominently
 * - Accessible: proper labels, aria-live for streaming content, keyboard nav
 *
 * Keyboard navigation (Requirement 15):
 * - Tab order follows DOM order: rate-limit dismiss (when shown) → response
 *   region → retry (when error) → textarea → submit button.
 * - All controls expose visible focus indicators
 *   (focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1)
 *   meeting WCAG 2.1 AA contrast requirements via the design-token --ring.
 * - Custom keyboard shortcut: Ctrl+Enter / Cmd+Enter inside the textarea
 *   submits the question (mirrored visually in the placeholder and hint
 *   text). The shortcut only fires when the form is in a submittable state
 *   (canSubmit === true) and never conflicts with browser defaults because
 *   it is preventDefaulted only when handled.
 *
 * @see Requirements 2, 8, 9, 10, 11, 15
 */

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { Send, RefreshCw, AlertCircle, Loader2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAiConversation } from '@/hooks/ai/useAiConversation';
import { MarkdownRenderer } from '../Common/MarkdownRenderer';
import { RateLimitAlert } from '../Common/RateLimitAlert';
import { LoadingSkeletons } from '../Common/LoadingSkeletons';
import { aiConfig } from '@/services/ai/config';
import type { AskAiComponentProps } from '@/services/ai/types';

// ---------------------------------------------------------------------------
// Memoized sub-components
// ---------------------------------------------------------------------------

/**
 * Memoized disclaimer text component to prevent re-renders when parent updates.
 * This is a pure component that only depends on isStreaming prop.
 */
const DisclaimerText = memo(function DisclaimerText({
  isStreaming,
}: {
  isStreaming: boolean;
}): JSX.Element | null {
  if (isStreaming) return null;

  return (
    <p className="mt-3 text-xs text-muted-foreground italic border-t border-border pt-2">
      AI responses may not be accurate. Please verify with course materials.
    </p>
  );
});

/**
 * Memoized character counter component to prevent re-renders of parent.
 * Only re-renders when charsLeft or isOverLimit changes.
 */
const CharacterCounter = memo(function CharacterCounter({
  charsLeft,
  isOverLimit,
}: {
  charsLeft: number;
  isOverLimit: boolean;
}): JSX.Element {
  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'text-xs tabular-nums',
        isOverLimit
          ? 'font-semibold text-destructive'
          : charsLeft <= 100
            ? // text-amber-700 on white = 4.55:1 — meets WCAG AA 4.5:1
              // (was text-amber-600 = 3.34:1 — failed for normal text).
              'text-amber-700 dark:text-amber-400'
            : 'text-muted-foreground'
      )}
    >
      {charsLeft < 0
        ? `${Math.abs(charsLeft)} characters over limit`
        : charsLeft <= 100
          ? `Warning: ${charsLeft} characters remaining`
          : `${charsLeft} remaining`}
    </span>
  );
});

/**
 * Memoized error display component to prevent re-renders when parent updates.
 * Only re-renders when error or lastSubmittedQuestion changes.
 */
const ErrorDisplay = memo(function ErrorDisplay({
  error,
  lastSubmittedQuestion,
  isBusy,
  onRetry,
}: {
  error: Error;
  lastSubmittedQuestion: string;
  isBusy: boolean;
  onRetry: () => void;
}): JSX.Element {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-medium">Something went wrong</p>
        <p className="mt-0.5 text-destructive/80">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      {lastSubmittedQuestion && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isBusy}
          aria-label="Retry the last question"
          className={cn(
            'ml-auto flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2.5 text-xs font-medium transition-colors',
            'min-h-[44px]',
            'border border-destructive/40 text-destructive hover:bg-destructive/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-1',
            'disabled:pointer-events-none disabled:opacity-50'
          )}
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
});

/**
 * Memoized response display component to prevent re-renders when parent updates.
 * Only re-renders when lastAssistantMessage or isStreaming changes.
 */
const ResponseDisplay = memo(function ResponseDisplay({
  lastAssistantMessage,
  isStreaming,
  responseRegionRef,
}: {
  lastAssistantMessage: { role: string; content: string } | undefined;
  isStreaming: boolean;
  responseRegionRef: React.RefObject<HTMLDivElement>;
}): JSX.Element | null {
  if (!lastAssistantMessage) return null;

  return (
    <div
      ref={responseRegionRef}
      className={cn(
        'rounded-lg border bg-card p-4 shadow-sm',
        isStreaming && 'border-primary/30 bg-primary/5'
      )}
    >
      {/* Header row */}
      <div className="mb-3 flex items-center gap-2">
        <Bot className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="text-xs font-medium text-muted-foreground">
          AI Assistant
        </span>
        {isStreaming && (
          <span className="ml-auto flex items-center gap-1 text-xs text-primary">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            <span>Responding…</span>
          </span>
        )}
      </div>

      {/* Streaming markdown response (req 4) */}
      <MarkdownRenderer
        content={lastAssistantMessage.content}
        isStreaming={isStreaming}
        className="text-sm"
      />

      {/* Disclaimer (req 6) */}
      <DisclaimerText isStreaming={isStreaming} />
    </div>
  );
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_QUESTION_LENGTH = 2000;
const DISCLAIMER_TEXT =
  'AI responses may not be accurate. Please verify with course materials.';

// ---------------------------------------------------------------------------
// AskAiComponent
// ---------------------------------------------------------------------------

/**
 * Student Q&A component for asking questions about lesson content.
 *
 * Wrapped with React.memo so parent components that pass stable `courseId`,
 * `lessonId`, and `className` props do not cause unnecessary re-renders
 * (Requirement 22.4).
 *
 * @example
 * ```tsx
 * <AskAiComponent courseId={course.id} lessonId={lesson.id} />
 * ```
 */
export const AskAiComponent = memo(function AskAiComponent({
  courseId,
  lessonId,
  className,
}: AskAiComponentProps): JSX.Element {
  const [question, setQuestion] = useState('');
  const [lastSubmittedQuestion, setLastSubmittedQuestion] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const responseRegionRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isStreaming,
    error,
    rateLimitRetryAfter,
    askQuestion,
  } = useAiConversation(courseId, lessonId);

  // ── Derived state ─────────────────────────────────────────────────────────

  const isBusy = isLoading || isStreaming;
  const charsLeft = MAX_QUESTION_LENGTH - question.length;
  const isOverLimit = question.length > MAX_QUESTION_LENGTH;
  const canSubmit =
    question.trim().length > 0 && !isBusy && !isOverLimit && aiConfig.enabled;

  // Memoize the most recent assistant message to avoid re-scanning the full
  // messages array on every render (Requirement 22.2).
  const lastAssistantMessage = useMemo(
    () => [...messages].reverse().find((m) => m.role === 'assistant'),
    [messages]
  );

  // ── Auto-scroll to response when streaming starts ─────────────────────────

  useEffect(() => {
    if (isStreaming && responseRegionRef.current) {
      responseRegionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isStreaming]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = question.trim();
      if (!canSubmit || !trimmed) return;

      setLastSubmittedQuestion(trimmed);
      setQuestion(''); // Clear input immediately (req 9)

      await askQuestion(trimmed, true); // stream=true (req 3)
    },
    [question, canSubmit, askQuestion]
  );

  const handleRetry = useCallback(async () => {
    if (!lastSubmittedQuestion || isBusy) return;
    await askQuestion(lastSubmittedQuestion, true);
  }, [lastSubmittedQuestion, isBusy, askQuestion]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // ---------------------------------------------------------------
      // Custom keyboard shortcut: Ctrl+Enter / Cmd+Enter submits
      //
      // - Plain Enter is intentionally NOT intercepted so users can insert
      //   newlines into multi-line questions.
      // - Cmd+Enter (macOS) and Ctrl+Enter (Windows/Linux) submit the form.
      // - The shortcut is prevented from firing when canSubmit is false
      //   (busy, empty, over-limit, AI disabled) so it cannot trigger a
      //   spurious submit while a request is already in flight.
      // - We only call preventDefault when we actually handle the event,
      //   leaving the browser default (newline) intact otherwise.
      // ---------------------------------------------------------------
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (canSubmit) {
          handleSubmit(e as unknown as React.FormEvent);
        }
      }
    },
    [canSubmit, handleSubmit]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* ── AI disabled notice ─────────────────────────────────────────── */}
      {!aiConfig.enabled && (
        <div
          role="status"
          className="rounded-lg border border-muted bg-muted/30 p-4 text-sm text-muted-foreground"
        >
          AI features are currently disabled.
        </div>
      )}

      {/* ── Rate limit alert ───────────────────────────────────────────── */}
      {rateLimitRetryAfter !== null && (
        <RateLimitAlert
          retryAfter={rateLimitRetryAfter}
          onDismiss={() => {
            /* The alert auto-dismisses via its own countdown; no extra state
               needed here since rateLimitRetryAfter is managed by the hook. */
          }}
        />
      )}

      {/* ── Streaming / loading response area ─────────────────────────── */}
      {(isStreaming || isLoading) && !lastAssistantMessage?.content && (
        <LoadingSkeletons count={2} variant="message" />
      )}

      {/* ── Most recent assistant message ─────────────────────────────── */}
      <ResponseDisplay
        lastAssistantMessage={lastAssistantMessage}
        isStreaming={isStreaming}
        responseRegionRef={responseRegionRef}
      />

      {/* ── Error message with retry (req 8) ──────────────────────────── */}
      {/* role="alert" already implies aria-live="assertive"; no need to duplicate */}
      {error && !rateLimitRetryAfter && (
        <ErrorDisplay
          error={error}
          lastSubmittedQuestion={lastSubmittedQuestion}
          isBusy={isBusy}
          onRetry={handleRetry}
        />
      )}

      {/* ── Question input form ────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} aria-label="Ask AI a question" noValidate>
        <div className="flex flex-col gap-2">
          {/* Label */}
          <label
            htmlFor="ai-question-input"
            className="text-sm font-medium text-foreground"
          >
            Ask a question about this lesson
          </label>

          {/* Textarea (req 1) */}
          <div className="relative">
            <textarea
              id="ai-question-input"
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question here… (Ctrl+Enter to submit)"
              rows={3}
              maxLength={MAX_QUESTION_LENGTH + 1} // +1 so we can detect over-limit
              disabled={isBusy || !aiConfig.enabled}
              aria-describedby="ai-question-hint ai-question-chars"
              aria-invalid={isOverLimit ? 'true' : undefined}
              className={cn(
                'w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isOverLimit
                  ? 'border-destructive focus-visible:ring-destructive'
                  : 'border-input'
              )}
            />
          </div>

          {/* Hint + character counter row */}
          <div className="flex items-center justify-between gap-2">
            <p id="ai-question-hint" className="text-xs text-muted-foreground">
              Press Ctrl+Enter to submit
            </p>
            <CharacterCounter charsLeft={charsLeft} isOverLimit={isOverLimit} />
          </div>

          {/* Submit button (req 2) */}
          <button
            type="submit"
            disabled={!canSubmit}
            aria-label={
              isBusy ? 'Waiting for AI response…' : 'Submit question to AI'
            }
            className={cn(
              'flex items-center justify-center gap-2 self-end rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              'min-h-[44px]',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              'disabled:pointer-events-none disabled:opacity-50'
            )}
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>{isStreaming ? 'Streaming…' : 'Loading…'}</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>Ask AI</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Streaming live region for screen readers (req 11) ─────────── */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="sr-only"
      >
        {isStreaming
          ? 'AI is generating a response…'
          : lastAssistantMessage && !isStreaming
            ? 'AI response received.'
            : null}
      </div>
    </div>
  );
});

export default AskAiComponent;
