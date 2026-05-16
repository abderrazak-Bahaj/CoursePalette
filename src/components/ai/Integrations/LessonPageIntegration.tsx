/**
 * LessonPageIntegration
 *
 * Integrates the AI Q&A feature into the lesson page as a non-intrusive
 * floating button + slide-over panel. The panel contains two tabs:
 *   1. "Ask AI"  — renders `AskAiComponent` for real-time Q&A
 *   2. "History" — renders `ConversationHistory` for past exchanges
 *
 * Behaviour:
 * - Returns `null` when `features.aiQA` is disabled (feature flag gate).
 * - Returns `null` when the current user is not authorized to ask questions
 *   (`useAiAuth(courseId).canAsk === false`).
 * - A floating "Ask AI" button (bottom-right) opens the panel.
 * - The panel slides in from the right without covering the lesson content
 *   (it is positioned fixed so the lesson scroll is unaffected).
 * - Pressing Escape or clicking the close button closes the panel.
 * - Focus is trapped inside the panel while it is open (WCAG 2.1 AA).
 * - The panel is marked with `role="dialog"` and `aria-modal="true"`.
 *
 * Keyboard navigation (Requirement 15):
 * - The floating "Open AI assistant" button is reachable via Tab from
 *   anywhere on the page (it is fixed-positioned but a regular `<button>`
 *   in the DOM, so it appears at the very end of the lesson page tab order).
 *   It uses `aria-haspopup="dialog"` + `aria-expanded` so screen-reader
 *   users know that activating it opens a dialog.
 * - When the panel opens, focus moves to the first focusable element
 *   inside it (the close button). Tab / Shift+Tab cycle focus through:
 *   close button → "Ask AI" tab → "History" tab → tab-panel content
 *   (textarea, submit button, or history controls). No element outside
 *   the panel can receive focus while it is open.
 * - Escape closes the panel and returns focus to the trigger button.
 * - Body scroll is locked while the panel is open so the underlying page
 *   cannot steal focus or scroll unexpectedly.
 * - All controls expose the design-system focus ring
 *   (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`)
 *   and meet 44×44 px touch-target sizes.
 * - No custom keyboard shortcuts are defined; Escape (built-in) is the
 *   only documented shortcut, surfaced visually in the panel footer
 *   ("Press Esc to close").
 *
 * Performance:
 * - AskAiComponent and ConversationHistory are lazy-loaded via React.lazy()
 *   so their JS chunks are only fetched when the panel is first opened.
 *   This keeps the lesson page initial bundle lean.
 *
 * @see Requirements 13 (Integration with Existing Course/Lesson Pages)
 * @see Requirements 15 (Accessibility Compliance – WCAG 2.1 AA)
 * @see Requirements 22 (Performance Optimization – Lazy Loading)
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
  type KeyboardEvent,
} from 'react';
import { Bot, X, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAiContext } from '@/context/AiContext';
import { useAiAuth } from '@/hooks/ai/useAiAuth';
import { AiLoadingFallback } from '../Common/AiLoadingFallback';
import { LazyAskAiComponent, LazyConversationHistory } from '../lazy';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LessonPageIntegrationProps {
  /** ID of the course the lesson belongs to. */
  courseId: string | number;
  /** ID of the lesson being studied. */
  lessonId: string | number;
  /** Optional extra CSS class applied to the floating button. */
  className?: string;
}

type ActiveTab = 'ask' | 'history';

// ---------------------------------------------------------------------------
// Focus-trap helper
// ---------------------------------------------------------------------------

/** Selector for all naturally focusable elements. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Returns the first and last focusable elements inside a container.
 */
function getFocusableEdges(
  container: HTMLElement
): [HTMLElement | null, HTMLElement | null] {
  const all = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((el) => !el.closest('[aria-hidden="true"]'));
  return [all[0] ?? null, all[all.length - 1] ?? null];
}

// ---------------------------------------------------------------------------
// LessonPageIntegration
// ---------------------------------------------------------------------------

/**
 * Floating AI assistant panel for the lesson page.
 *
 * @example
 * ```tsx
 * // Inside your lesson page component:
 * <LessonPageIntegration courseId={course.id} lessonId={lesson.id} />
 * ```
 */
export function LessonPageIntegration({
  courseId,
  lessonId,
  className,
}: LessonPageIntegrationProps): JSX.Element | null {
  // ── Feature / auth gates ─────────────────────────────────────────────────
  //
  // Authorization is handled here via two checks (Requirement 14):
  //   1. `features.aiQA`  — master feature flag from AiContext (env-driven)
  //   2. `canAsk`         — role-based check: student must be enrolled in the
  //                         course and the course/lesson must be published.
  //
  // If either check fails the component returns null, hiding the feature
  // entirely from unauthorized users. Use <PermissionDenied /> in place of
  // `return null` if you prefer to surface an explicit message.

  const { features } = useAiContext();
  const { canAsk } = useAiAuth(courseId);

  // Return null early if the feature is disabled or the user is not authorized
  if (!features.aiQA || !canAsk) {
    return null;
  }

  return (
    <LessonPageIntegrationInner
      courseId={courseId}
      lessonId={lessonId}
      className={className}
    />
  );
}

// ---------------------------------------------------------------------------
// Inner component (rendered only when authorized)
// ---------------------------------------------------------------------------

/**
 * The actual UI — separated so the hooks below are only called when the
 * feature is enabled and the user is authorized (avoids hook-order issues
 * with the early return above).
 */
function LessonPageIntegrationInner({
  courseId,
  lessonId,
  className,
}: LessonPageIntegrationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('ask');

  const panelRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  // ── Open / close helpers ─────────────────────────────────────────────────

  const openPanel = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    // Return focus to the trigger button when the panel closes
    requestAnimationFrame(() => {
      openButtonRef.current?.focus();
    });
  }, []);

  // ── Keyboard handling (Escape to close + focus trap) ─────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePanel();
        return;
      }

      // Focus trap: cycle focus within the panel on Tab / Shift+Tab
      if (e.key === 'Tab' && panelRef.current) {
        const [first, last] = getFocusableEdges(panelRef.current);
        if (!first || !last) return;

        if (e.shiftKey) {
          // Shift+Tab: if focus is on the first element, wrap to last
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab: if focus is on the last element, wrap to first
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [closePanel]
  );

  // ── Move focus into the panel when it opens ──────────────────────────────

  useEffect(() => {
    if (isOpen && panelRef.current) {
      const [first] = getFocusableEdges(panelRef.current);
      requestAnimationFrame(() => {
        first?.focus();
      });
    }
  }, [isOpen]);

  // ── Prevent body scroll while panel is open (optional UX improvement) ────

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating trigger button ──────────────────────────────────────── */}
      <button
        ref={openButtonRef}
        type="button"
        onClick={openPanel}
        aria-label="Open AI assistant"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          // Positioning
          'fixed bottom-6 right-6 z-40',
          // Size & shape
          'flex h-14 w-14 items-center justify-center rounded-full shadow-lg',
          // Colours
          'bg-primary text-primary-foreground',
          // Hover / focus
          'hover:bg-primary/90 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // Hide when panel is open (panel has its own close button)
          isOpen && 'hidden',
          className
        )}
      >
        <Bot className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
          onClick={closePanel}
        />
      )}

      {/* ── Slide-over panel ─────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="AI Learning Assistant"
        onKeyDown={handleKeyDown}
        className={cn(
          // Positioning — fixed right-side panel, full height on mobile
          'fixed inset-y-0 right-0 z-50 flex flex-col',
          // Width: full on mobile, fixed on larger screens
          'w-full sm:w-[420px]',
          // Background & shadow
          'bg-background shadow-2xl border-l border-border',
          // Slide animation
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        // Keep the panel in the DOM for animation; hide from AT when closed
        aria-hidden={!isOpen}
        // Prevent interaction when closed
        inert={!isOpen ? ('' as unknown as boolean) : undefined}
      >
        {/* ── Panel header ───────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-foreground">
              AI Assistant
            </h2>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={closePanel}
            aria-label="Close AI assistant panel"
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground',
              'hover:bg-muted hover:text-foreground transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Tab bar ────────────────────────────────────────────────────── */}
        <div
          role="tablist"
          aria-label="AI assistant sections"
          className="flex shrink-0 border-b"
        >
          <TabButton
            id="tab-ask"
            panelId="tabpanel-ask"
            isActive={activeTab === 'ask'}
            onClick={() => setActiveTab('ask')}
            icon={<Bot className="h-4 w-4" aria-hidden="true" />}
            label="Ask AI"
          />
          <TabButton
            id="tab-history"
            panelId="tabpanel-history"
            isActive={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            icon={<History className="h-4 w-4" aria-hidden="true" />}
            label="History"
          />
        </div>

        {/* ── Tab panels ─────────────────────────────────────────────────── */}
        {/*
         * Each tab panel wraps its content in a Suspense boundary so the
         * lazy chunk for AskAiComponent / ConversationHistory is only
         * fetched when the respective tab is first activated.
         * (Requirement 22 – lazy-load AI components not immediately visible)
         */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Ask AI tab panel */}
          <div
            id="tabpanel-ask"
            role="tabpanel"
            aria-labelledby="tab-ask"
            hidden={activeTab !== 'ask'}
            className="p-4"
          >
            {activeTab === 'ask' && (
              <Suspense
                fallback={
                  <AiLoadingFallback
                    variant="inline"
                    label="Loading AI assistant…"
                  />
                }
              >
                <LazyAskAiComponent courseId={courseId} lessonId={lessonId} />
              </Suspense>
            )}
          </div>

          {/* History tab panel */}
          <div
            id="tabpanel-history"
            role="tabpanel"
            aria-labelledby="tab-history"
            hidden={activeTab !== 'history'}
            className="p-4"
          >
            {activeTab === 'history' && (
              <Suspense
                fallback={
                  <AiLoadingFallback
                    variant="inline"
                    label="Loading conversation history…"
                  />
                }
              >
                <LazyConversationHistory
                  courseId={courseId}
                  lessonId={lessonId}
                />
              </Suspense>
            )}
          </div>
        </div>

        {/* ── Panel footer — quick switch hint ───────────────────────────── */}
        <div className="shrink-0 border-t px-4 py-2">
          <p className="text-xs text-muted-foreground text-center">
            Press{' '}
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-xs">
              Esc
            </kbd>{' '}
            to close
          </p>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// TabButton sub-component
// ---------------------------------------------------------------------------

interface TabButtonProps {
  id: string;
  panelId: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({
  id,
  panelId,
  isActive,
  onClick,
  icon,
  label,
}: TabButtonProps) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={panelId}
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
        // Min-h ensures tab targets meet WCAG 2.5.5 / Requirement 16.4 on
        // mobile and tablet (44 px minimum touch target).
        'min-h-[44px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
        isActive
          ? 'border-b-2 border-primary text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export default LessonPageIntegration;
