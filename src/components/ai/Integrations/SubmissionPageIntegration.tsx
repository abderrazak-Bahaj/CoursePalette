/**
 * SubmissionPageIntegration component
 *
 * Integrates the AI pre-grade panel into the existing submission/grading page.
 * Renders a collapsible "AI Pre-grade" section alongside the submission details
 * so teachers can review the AI-generated score without leaving the grading
 * workflow.
 *
 * Guard rails (both must pass before anything is rendered):
 *   1. `useAiContext().features.aiPreGrading` — master feature flag
 *   2. `useAiAuth(courseId).canPreGrade`       — teacher is authorised
 *
 * If either check fails the component returns `null` so it is completely
 * invisible to unauthorised users and in environments where the feature is
 * disabled.
 *
 * Performance:
 * - PreGradeReview is lazy-loaded via React.lazy() so its JS chunk is only
 *   fetched when the collapsible panel is first expanded, keeping the
 *   submission page initial bundle lean.
 *
 * Keyboard navigation (Requirement 15):
 * - The collapsible header is a real `<button>` with `aria-expanded` /
 *   `aria-controls` pointing to the panel — it receives focus on Tab,
 *   activates with Enter / Space, and exposes the design-system focus ring
 *   (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
 *   focus-visible:ring-offset-1`).
 * - Tab order follows DOM order: collapsible toggle → (when expanded)
 *   PreGradeReview controls — Retry / Generate Pre-grade → Accept AI Score
 *   → Modify Score → Re-grade → custom-score input (in Modify mode) →
 *   rationale textarea → Save Grade.
 * - This integration is NOT a modal — no focus trap is needed because the
 *   surrounding submission page remains interactive.
 * - No custom keyboard shortcuts are defined.
 *
 * @see Requirements 13 (Integration with Existing Course/Lesson Pages)
 * @see Requirements 6  (Teacher Pre-Grade Review)
 * @see Requirements 14 (Authorization Checks)
 * @see Requirements 15 (Accessibility Compliance)
 * @see Requirements 22 (Performance Optimization – Lazy Loading)
 */

import { useState, useCallback, useId, Suspense } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAiContext } from '@/context/AiContext';
import { useAiAuth } from '@/hooks/ai/useAiAuth';
import { AiLoadingFallback } from '../Common/AiLoadingFallback';
import { LazyPreGradeReview } from '../lazy';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SubmissionPageIntegrationProps {
  /** ID of the course the assignment belongs to. */
  courseId: string | number;
  /** ID of the assignment being graded. */
  assignmentId: string | number;
  /** ID of the submission to display the pre-grade for. */
  submissionId: string | number;
  /**
   * Optional callback invoked when the teacher saves the final grade.
   * Receives the saved score so the parent page can update its own state.
   */
  onGradeSaved?: (score: number) => void;
  /** Optional CSS class name applied to the outermost container. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Collapsible AI pre-grade panel for the submission grading page.
 *
 * @example
 * ```tsx
 * // Inside your submission detail / grading page:
 * <SubmissionPageIntegration
 *   courseId={course.id}
 *   assignmentId={assignment.id}
 *   submissionId={submission.id}
 *   onGradeSaved={(score) => setFinalScore(score)}
 * />
 * ```
 */
export function SubmissionPageIntegration({
  courseId,
  assignmentId,
  submissionId,
  onGradeSaved,
  className,
}: SubmissionPageIntegrationProps): JSX.Element | null {
  // ── Feature flag guard ────────────────────────────────────────────────────
  //
  // Authorization is handled here via two checks (Requirement 14):
  //   1. `features.aiPreGrading` — master feature flag from AiContext
  //   2. `canPreGrade`           — role-based check: user must be a teacher
  //                                of the course.
  //
  // If either check fails the component returns null, hiding the pre-grade
  // panel entirely from unauthorized users. Use <PermissionDenied /> in place
  // of `return null` if you prefer to surface an explicit message.
  const { features } = useAiContext();
  if (!features.aiPreGrading) return null;

  // ── Authorization guard ───────────────────────────────────────────────────
  const { canPreGrade } = useAiAuth(courseId);
  if (!canPreGrade) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <CollapsiblePreGradePanel
      courseId={courseId}
      assignmentId={assignmentId}
      submissionId={submissionId}
      onGradeSaved={onGradeSaved}
      className={className}
    />
  );
}

// ---------------------------------------------------------------------------
// CollapsiblePreGradePanel (internal)
// ---------------------------------------------------------------------------

/**
 * The actual collapsible UI.  Extracted into its own component so that the
 * hook calls above (useAiContext / useAiAuth) are always called
 * unconditionally at the top of `SubmissionPageIntegration`, while the
 * collapsible state lives here.
 */
function CollapsiblePreGradePanel({
  courseId,
  assignmentId,
  submissionId,
  onGradeSaved,
  className,
}: SubmissionPageIntegrationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const headingId = useId();
  const panelId = useId();

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <section
      aria-labelledby={headingId}
      className={cn('rounded-xl border bg-card shadow-sm', className)}
    >
      {/* ── Collapsible header ─────────────────────────────────────────── */}
      <button
        type="button"
        id={headingId}
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cn(
          'flex w-full items-center justify-between gap-3 px-5 py-4 text-left',
          'rounded-xl transition-colors hover:bg-accent/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          // When open, keep the bottom corners square so the panel connects
          isOpen && 'rounded-b-none'
        )}
      >
        <span className="flex items-center gap-2">
          <Sparkles
            className="h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-foreground">
            AI Pre-grade
          </span>
        </span>

        {isOpen ? (
          <ChevronUp
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        ) : (
          <ChevronDown
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </button>

      {/* ── Collapsible panel ──────────────────────────────────────────── */}
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          className="border-t px-5 py-5"
        >
          {/*
           * Suspense boundary: PreGradeReview is lazy-loaded so its chunk is
           * only fetched when the panel is first expanded.
           * (Requirement 22 – lazy-load AI components not immediately visible)
           */}
          <Suspense
            fallback={
              <AiLoadingFallback
                variant="card"
                label="Loading pre-grade review…"
              />
            }
          >
            <LazyPreGradeReview
              courseId={courseId}
              assignmentId={assignmentId}
              submissionId={submissionId}
              onGradeSaved={onGradeSaved}
            />
          </Suspense>
        </div>
      )}
    </section>
  );
}

export default SubmissionPageIntegration;
