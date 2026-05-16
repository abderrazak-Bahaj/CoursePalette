/**
 * StreamingResponse component
 *
 * Renders an AI-generated response in real-time as it streams in.
 *
 * Features:
 * - Real-time markdown rendering via MarkdownRenderer (debounced during streaming)
 * - Animated blinking cursor while streaming is active
 * - "Generating…" label with spinner while streaming
 * - "AI is thinking…" skeleton when streaming has started but no content has
 *   arrived yet
 * - aria-live="polite" so screen readers announce new content incrementally
 * - aria-busy={isStreaming} to signal the loading state to assistive technology
 *
 * Keyboard navigation (Requirement 15):
 * - This component renders no interactive elements; it is a read-only
 *   region. Focus passes through it naturally so the surrounding form (e.g.
 *   AskAiComponent) keeps a clean tab order: previous control → textarea →
 *   submit button. No `tabIndex` overrides are applied.
 * - The blinking cursor and "Generating…" spinner are decorative
 *   (`aria-hidden`) so they never interrupt screen-reader announcements.
 *
 * @see Requirements 2, 11, 15, 17
 */

import { useEffect, useRef, memo } from 'react';
import { MarkdownRenderer } from '../Common/MarkdownRenderer';
import type { StreamingResponseProps } from '../../../services/ai/types';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Animated "AI is thinking…" skeleton shown before the first chunk arrives.
 */
const ThinkingSkeleton = memo(function ThinkingSkeleton(): JSX.Element {
  return (
    <div className="space-y-2 py-2" role="status" aria-label="AI is thinking…">
      {/* Three animated placeholder lines */}
      <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-3 w-5/8 animate-pulse rounded bg-muted" />
    </div>
  );
});

/**
 * Blinking cursor appended to the response while streaming.
 */
const BlinkingCursor = memo(function BlinkingCursor(): JSX.Element {
  return (
    <span
      className="ml-0.5 inline-block h-4 w-0.5 animate-[blink_1s_step-end_infinite] bg-foreground align-middle"
      aria-hidden="true"
    />
  );
});

/**
 * "Generating…" status bar shown at the bottom while streaming.
 */
const GeneratingLabel = memo(function GeneratingLabel(): JSX.Element {
  return (
    <div
      className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"
      aria-live="off"
    >
      {/* Tiny spinner */}
      <svg
        className="h-3 w-3 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span>Generating…</span>
    </div>
  );
});

// ---------------------------------------------------------------------------
// StreamingResponse
// ---------------------------------------------------------------------------

/**
 * Renders an AI response that may still be streaming.
 *
 * Wrapped with React.memo so parent components that pass stable `content`,
 * `isStreaming`, and `className` props do not cause unnecessary re-renders
 * of the streaming pipeline (Requirement 22.4).
 *
 * @example
 * ```tsx
 * <StreamingResponse content={accumulatedText} isStreaming={isStreaming} />
 * ```
 */
export const StreamingResponse = memo(function StreamingResponse({
  content,
  isStreaming,
  className,
}: StreamingResponseProps): JSX.Element {
  // Whether we have received any content yet.
  const hasContent = content.length > 0;

  // Keep a ref to the container so we can scroll it into view when new content
  // arrives during streaming (improves UX without forcing a full-page scroll).
  const containerRef = useRef<HTMLDivElement>(null);

  // Announce to screen readers when streaming completes.
  const announcementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isStreaming && hasContent && announcementRef.current) {
      announcementRef.current.textContent = 'Response complete.';
    }
  }, [isStreaming, hasContent]);

  return (
    <div
      ref={containerRef}
      className={className}
      // Announce incremental content updates to screen readers.
      aria-live="polite"
      // Signal that the region is still loading while streaming.
      aria-busy={isStreaming}
      aria-label={
        isStreaming ? 'AI response is being generated' : 'AI response'
      }
    >
      {/* ------------------------------------------------------------------ */}
      {/* Case 1: Streaming has started but no content yet → thinking skeleton */}
      {/* ------------------------------------------------------------------ */}
      {isStreaming && !hasContent && <ThinkingSkeleton />}

      {/* ------------------------------------------------------------------ */}
      {/* Case 2: Content is available (streaming or complete)               */}
      {/* ------------------------------------------------------------------ */}
      {hasContent && (
        <div className="relative">
          {/* Markdown content */}
          <MarkdownRenderer
            content={content}
            isStreaming={isStreaming}
            className="prose-sm max-w-none"
          />

          {/* Blinking cursor appended inline while streaming */}
          {isStreaming && <BlinkingCursor />}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* "Generating…" label at the bottom while streaming                  */}
      {/* ------------------------------------------------------------------ */}
      {isStreaming && <GeneratingLabel />}

      {/* ------------------------------------------------------------------ */}
      {/* Hidden live region that announces completion to screen readers      */}
      {/* role="status" + aria-live="assertive" ensures the "Response         */}
      {/* complete." message is announced immediately when streaming ends.    */}
      {/* ------------------------------------------------------------------ */}
      <span
        ref={announcementRef}
        role="status"
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
      />
    </div>
  );
});

export default StreamingResponse;
