/**
 * AssignmentPageIntegration component
 *
 * Integrates the AI question enhancement feature into the assignment page.
 * Renders an "Enhance with AI" button next to an assignment question; when
 * clicked it opens an accessible modal dialog containing the QuestionEnhancer
 * component.
 *
 * Authorization gates:
 *   1. `useAiContext().features.aiEnhancement` — master feature flag
 *   2. `useAiAuth(courseId).canEnhance`        — role-based check (teacher)
 *
 * If either gate fails the component renders nothing (`null`).
 *
 * Performance:
 * - QuestionEnhancer is lazy-loaded via React.lazy() so its JS chunk is only
 *   fetched when the modal is first opened, keeping the assignment page
 *   initial bundle lean.
 *
 * Accessibility:
 *   - Modal has `role="dialog"` and `aria-modal="true"`
 *   - Focus is trapped inside the modal while it is open
 *   - Pressing Escape closes the modal
 *   - Focus returns to the trigger button on close
 *
 * Keyboard navigation (Requirement 15):
 * - The "Enhance with AI" trigger receives focus on Tab and uses
 *   `aria-haspopup="dialog"` + `aria-expanded` so screen readers announce
 *   that activating it opens a dialog.
 * - When the dialog opens, focus moves to the first focusable element
 *   inside it (the close button). Tab / Shift+Tab cycle focus inside the
 *   modal — no element outside the modal can receive focus while it is
 *   open. Escape closes the modal and returns focus to the trigger.
 * - Body scroll is locked while the modal is open to prevent the
 *   underlying page from interfering with focus.
 * - All controls (trigger, close button, lazy-loaded QuestionEnhancer
 *   buttons) expose the design-system focus ring
 *   (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
 *   focus-visible:ring-offset-1`).
 * - No custom keyboard shortcuts are defined; Escape (built-in) is the
 *   only documented shortcut.
 *
 * @see Requirements 13 (Integration with Existing Course/Lesson Pages)
 * @see Requirements 5  (Teacher Question Enhancement)
 * @see Requirements 15 (Accessibility Compliance)
 * @see Requirements 22 (Performance Optimization – Lazy Loading)
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
  type JSX,
} from 'react';
import { Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAiContext } from '@/context/AiContext';
import { useAiAuth } from '@/hooks/ai/useAiAuth';
import { AiLoadingFallback } from '../Common/AiLoadingFallback';
import { LazyQuestionEnhancer } from '../lazy';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AssignmentPageIntegrationProps {
  /** ID of the course that owns the assignment. */
  courseId: string | number;
  /** ID of the assignment containing the question. */
  assignmentId: string | number;
  /** ID of the question to enhance. */
  questionId: string | number;
  /** Callback invoked after the teacher saves enhanced changes. */
  onSave?: () => void;
  /** Optional CSS class name applied to the trigger button wrapper. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Focusable element selector used for focus-trap
// ---------------------------------------------------------------------------

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Adds an "Enhance with AI" button to an assignment question.
 * Clicking the button opens a modal containing the QuestionEnhancer tool.
 *
 * Returns `null` when:
 *   - The `aiEnhancement` feature flag is disabled, or
 *   - The current user does not have the `canEnhance` permission.
 *
 * @example
 * ```tsx
 * <AssignmentPageIntegration
 *   courseId={course.id}
 *   assignmentId={assignment.id}
 *   questionId={question.id}
 *   onSave={() => refetchAssignment()}
 * />
 * ```
 */
export function AssignmentPageIntegration({
  courseId,
  assignmentId,
  questionId,
  onSave,
  className,
}: AssignmentPageIntegrationProps): JSX.Element | null {
  // ── Authorization gates ──────────────────────────────────────────────────
  //
  // Authorization is handled here via two checks (Requirement 14):
  //   1. `features.aiEnhancement` — master feature flag from AiContext
  //   2. `canEnhance`             — role-based check: user must be a teacher
  //                                 of the course.
  //
  // If either check fails the component returns null, hiding the "Enhance
  // with AI" button entirely from unauthorized users. Use <PermissionDenied />
  // in place of `return null` if you prefer to surface an explicit message.

  const { features } = useAiContext();
  const { canEnhance } = useAiAuth(courseId);

  // Return null early if the feature is disabled or the user is not authorized.
  if (!features.aiEnhancement || !canEnhance) {
    return null;
  }

  return (
    <AssignmentPageIntegrationInner
      courseId={courseId}
      assignmentId={assignmentId}
      questionId={questionId}
      onSave={onSave}
      className={className}
    />
  );
}

// ---------------------------------------------------------------------------
// Inner component (rendered only when authorized)
// ---------------------------------------------------------------------------

/**
 * Inner component that manages modal state and renders the trigger + dialog.
 * Separated from the outer component so hooks are not called conditionally.
 */
function AssignmentPageIntegrationInner({
  courseId,
  assignmentId,
  questionId,
  onSave,
  className,
}: AssignmentPageIntegrationProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  // Ref to the trigger button so we can return focus on close.
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Ref to the modal container for focus-trap logic.
  const modalRef = useRef<HTMLDivElement>(null);

  // ── Open / close handlers ────────────────────────────────────────────────

  const openModal = useCallback(() => setIsOpen(true), []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Return focus to the trigger button after the modal closes.
    // Use a microtask so the DOM has time to update.
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  const handleSave = useCallback(() => {
    onSave?.();
    closeModal();
  }, [onSave, closeModal]);

  // ── Keyboard handling ────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        return;
      }

      // Focus trap: keep Tab / Shift+Tab inside the modal.
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => !el.closest('[aria-hidden="true"]'));

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: if focus is on the first element, wrap to last.
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab: if focus is on the last element, wrap to first.
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  // ── Move focus into the modal when it opens ──────────────────────────────

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Focus the first focusable element inside the modal.
    const firstFocusable =
      modalRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstFocusable?.focus();
  }, [isOpen]);

  // ── Prevent body scroll while modal is open ──────────────────────────────

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

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Trigger button ──────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openModal}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
          // Min-h-[44px] satisfies WCAG 2.5.5 / Requirement 16.4 (touch
          // target ≥ 44 px). The trigger sits inline on the assignment
          // question row so it must remain a comfortable mobile target.
          'min-h-[44px]',
          'bg-primary/10 text-primary hover:bg-primary/20',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          className
        )}
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Enhance with AI
      </button>

      {/* ── Modal backdrop + dialog ──────────────────────────────────────── */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={closeModal}
          />

          {/* Dialog */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="enhance-modal-title"
            className={cn(
              // Mobile-first positioning:
              // - Pin to left/right with a small gutter (inset-x-2) and
              //   constrain the height so the dialog reflows inside the
              //   viewport at 320 px without horizontal scroll.
              // - From `sm` upward, switch to a centred fixed-width modal
              //   (max-w-3xl) using translate-x to recentre.
              'fixed inset-x-2 top-1/2 z-50 max-h-[90vh] -translate-y-1/2 overflow-y-auto',
              'sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-3xl sm:-translate-x-1/2',
              'rounded-xl border border-border bg-background shadow-2xl',
              'focus:outline-none'
            )}
            // Allow the dialog itself to receive focus if no child is focusable.
            tabIndex={-1}
          >
            {/* ── Dialog header ──────────────────────────────────────── */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2
                id="enhance-modal-title"
                className="flex items-center gap-2 text-base font-semibold text-foreground"
              >
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                Enhance Question with AI
              </h2>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close enhancement dialog"
                className={cn(
                  // 44×44 touch target (WCAG 2.5.5 / Requirement 16.4).
                  'flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
                )}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* ── Dialog body ────────────────────────────────────────── */}
            <div className="px-6 py-5">
              {/*
               * Suspense boundary: QuestionEnhancer is lazy-loaded so its
               * chunk is only fetched when the modal is first opened.
               * (Requirement 22 – lazy-load AI components not immediately visible)
               */}
              <Suspense
                fallback={
                  <AiLoadingFallback
                    variant="modal"
                    label="Loading question enhancer…"
                  />
                }
              >
                <LazyQuestionEnhancer
                  courseId={courseId}
                  assignmentId={assignmentId}
                  questionId={questionId}
                  onSave={handleSave}
                />
              </Suspense>
            </div>
          </div>
        </>
      )}

      {/* ── Screen reader live region ────────────────────────────────────── */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isOpen ? 'Enhancement dialog opened.' : null}
      </div>
    </>
  );
}

export default AssignmentPageIntegration;
