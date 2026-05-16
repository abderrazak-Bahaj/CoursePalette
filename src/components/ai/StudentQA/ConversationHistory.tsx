/**
 * ConversationHistory component
 *
 * Displays a paginated list of past Q&A exchanges for a student–AI conversation
 * scoped to a specific course lesson. Features:
 *
 * - Fetches history on mount via `useAiConversation`
 * - Chronological display (oldest first) with role indicators and timestamps
 * - Skeleton screens while loading (`LoadingSkeletons` with `variant="message"`)
 * - Empty state when no history exists
 * - "Clear History" button with an AlertDialog confirmation before clearing
 * - Previous / Next pagination controls when `hasMorePages` is true
 * - Accessible: proper heading, list semantics, descriptive button labels
 *
 * Keyboard navigation (Requirement 15):
 * - Tab order follows DOM order: Clear-History trigger → Retry (when error)
 *   → Previous → Next.
 * - All focusable controls inherit the design-system focus ring
 *   (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
 *   focus-visible:ring-offset-2`) via the shadcn `<Button>` component, which
 *   meets WCAG 2.1 AA contrast.
 * - The clear-history confirmation uses the Radix `AlertDialog`, which traps
 *   focus inside the dialog while open, closes on Escape, and returns focus
 *   to the trigger on close — no extra wiring required.
 * - No custom keyboard shortcuts are defined; the component relies on native
 *   button/link activation (Enter / Space).
 *
 * @see Requirements 3 (Conversation History – View and Clear)
 * @see Requirements 9 (Loading States and Skeleton Screens)
 * @see Requirements 15 (Accessibility Compliance)
 */

import { useEffect, useCallback, useMemo, memo } from 'react';
import {
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Bot,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LoadingSkeletons } from '../Common/LoadingSkeletons';
import { MarkdownRenderer } from '../Common/MarkdownRenderer';
import { useAiConversation } from '@/hooks/ai/useAiConversation';
import type { ConversationHistoryProps, AiMessage } from '@/services/ai/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats an ISO 8601 timestamp into a human-readable date/time string.
 * Falls back to the raw string if parsing fails.
 */
function formatTimestamp(isoString: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Role badge shown next to each message. */
const RoleBadge = memo(function RoleBadge({
  role,
}: {
  role: AiMessage['role'];
}) {
  const isAssistant = role === 'assistant';
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        isAssistant
          ? 'bg-primary/10 text-primary'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
    </div>
  );
});

/** A single message item in the history list. */
const MessageItem = memo(function MessageItem({
  message,
}: {
  message: AiMessage;
}) {
  const isAssistant = message.role === 'assistant';
  const roleLabel = isAssistant ? 'AI Assistant' : 'You';

  return (
    <li className="flex items-start gap-3">
      <RoleBadge role={message.role} />

      <div className="min-w-0 flex-1">
        {/* Role + timestamp header */}
        <div className="mb-1 flex flex-wrap items-baseline gap-2">
          <span
            className={cn(
              'text-sm font-semibold',
              isAssistant ? 'text-primary' : 'text-foreground'
            )}
          >
            {roleLabel}
          </span>
          <time
            dateTime={message.created_at}
            className="text-xs text-muted-foreground"
          >
            {formatTimestamp(message.created_at)}
          </time>
        </div>

        {/* Message content */}
        {isAssistant ? (
          <MarkdownRenderer
            content={message.content}
            className="text-sm text-foreground"
          />
        ) : (
          <p className="text-sm leading-relaxed text-foreground">
            {message.content}
          </p>
        )}

        {/* Disclaimer for assistant messages */}
        {isAssistant && message.disclaimer && (
          <p className="mt-2 text-xs italic text-muted-foreground">
            {message.disclaimer}
          </p>
        )}
      </div>
    </li>
  );
});

/** Empty state shown when there are no history messages. */
function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-12 text-center"
      role="status"
      aria-label="No conversation history"
    >
      <MessageSquare
        className="h-10 w-10 text-muted-foreground/50"
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">
        No previous questions. Ask your first question below!
      </p>
    </div>
  );
}

/** Error state shown when history fetch fails. */
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center"
    >
      <p className="text-sm text-destructive">
        {error.message || 'Failed to load conversation history.'}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        aria-label="Retry loading conversation history"
      >
        Try again
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConversationHistory
// ---------------------------------------------------------------------------

/**
 * Displays the paginated conversation history for a student–AI Q&A session.
 *
 * Wrapped with React.memo so parent components that pass stable `courseId`,
 * `lessonId`, and `className` props do not cause unnecessary re-renders of
 * the entire history list (Requirement 22.4).
 *
 * @example
 * ```tsx
 * <ConversationHistory courseId={course.id} lessonId={lesson.id} />
 * ```
 */
export const ConversationHistory = memo(function ConversationHistory({
  courseId,
  lessonId,
  className,
}: ConversationHistoryProps): JSX.Element {
  const {
    messages,
    isLoading,
    error,
    currentPage,
    hasMorePages,
    clearHistory,
    fetchHistory,
  } = useAiConversation(courseId, lessonId);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId]);

  // ── Pagination handlers ──────────────────────────────────────────────────

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      fetchHistory(currentPage - 1);
    }
  }, [currentPage, fetchHistory]);

  const handleNext = useCallback(() => {
    if (hasMorePages) {
      fetchHistory(currentPage + 1);
    }
  }, [currentPage, hasMorePages, fetchHistory]);

  // Memoize the sorted message list to avoid re-sorting on every render
  // (Requirement 22.2). Messages are already ordered by the server (most
  // recent first for history), but we keep the sort stable here in case the
  // local state is updated out-of-order during streaming.
  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [messages]
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <section
      aria-labelledby="conversation-history-heading"
      className={cn('flex flex-col gap-4', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2
          id="conversation-history-heading"
          className="text-base font-semibold text-foreground"
        >
          Conversation History
        </h2>

        {/* Clear History button — only shown when there are messages */}
        {messages.length > 0 && !isLoading && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                // size="default" gives h-10 (40 px) baseline. Combined with
                // min-h-[44px] below it satisfies WCAG 2.5.5 / Requirement
                // 16.4 on touch devices.
                className="min-h-[44px] gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label="Clear all conversation history"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Clear History</span>
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear conversation history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your previous questions and
                  AI responses for this lesson. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={clearHistory}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear History
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1">
        {/* Loading state */}
        {isLoading && <LoadingSkeletons count={3} variant="message" />}

        {/* Error state */}
        {!isLoading && error && (
          <ErrorState error={error} onRetry={() => fetchHistory(currentPage)} />
        )}

        {/* Empty state */}
        {!isLoading && !error && messages.length === 0 && <EmptyState />}

        {/* Message list */}
        {!isLoading && !error && messages.length > 0 && (
          <ol aria-label="Conversation history messages" className="space-y-6">
            {sortedMessages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
          </ol>
        )}
      </div>

      {/* Pagination controls */}
      {!isLoading && !error && (hasMorePages || currentPage > 1) && (
        <nav
          aria-label="Conversation history pagination"
          className="flex items-center justify-between border-t pt-3"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage <= 1}
            aria-label="Go to previous page of conversation history"
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </Button>

          <span
            className="text-xs text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            Page {currentPage}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!hasMorePages}
            aria-label="Go to next page of conversation history"
            className="gap-1.5"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </nav>
      )}
    </section>
  );
});

export default ConversationHistory;
