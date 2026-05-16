/**
 * QuestionEnhancer component
 *
 * Allows a teacher to enhance an existing assignment question with AI
 * suggestions. Displays a side-by-side comparison of the original question
 * and the AI-suggested improvements, with field-level accept/reject controls
 * for question text, answer options, and point value.
 *
 * Features:
 * - "Enhance with AI" button that triggers the enhancement request
 * - Loading skeleton while the request is in progress
 * - Side-by-side comparison: Original (left) vs Suggested (right)
 * - Per-field accept (✓) / reject (✗) buttons with green/red visual feedback
 * - Rationale section explaining the AI's suggestions
 * - "Save Changes" button that persists accepted fields and calls onSave
 * - Error message with retry on failure
 * - Accessible and responsive
 *
 * Keyboard navigation (Requirement 15):
 * - Tab order follows DOM order. Per field section the order is:
 *   Accept (✓) → Reject (✗) (44×44 px touch targets), repeated for
 *   question text, options, and points. Trailing actions: Save Changes →
 *   Re-enhance → Discard.
 * - Each Accept / Reject button is a 44×44 px circular control with a
 *   visible focus ring (`focus-visible:ring-2 focus-visible:ring-ring`) and
 *   forced-colors fallbacks (`forced-colors:border-[ButtonText]`) so the
 *   control is also visible in Windows High Contrast mode.
 * - `aria-pressed` reflects the current accept/reject decision.
 * - No custom keyboard shortcuts are defined; controls activate on
 *   Enter / Space (native button behaviour).
 *
 * @see Requirements 5, 8, 9, 15
 */

import { useCallback, memo } from 'react';
import {
  Check,
  X,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Loader2,
  Save,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuestionEnhancement } from '@/hooks/ai/useQuestionEnhancement';
import { LoadingSkeletons } from '../Common/LoadingSkeletons';
import type { QuestionEnhancerProps, EnhancedField } from '@/services/ai/types';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface FieldDecisionBadgeProps {
  field: EnhancedField;
  accepted: boolean;
  rejected: boolean;
  onAccept: (field: EnhancedField) => void;
  onReject: (field: EnhancedField) => void;
}

/**
 * Accept / Reject button pair for a single field.
 * Shows a green checkmark and a red X; highlights the active decision.
 */
const FieldDecisionButtons = memo(function FieldDecisionButtons({
  field,
  accepted,
  rejected,
  onAccept,
  onReject,
}: FieldDecisionBadgeProps) {
  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={`Accept or reject ${field} suggestion`}
    >
      <button
        type="button"
        onClick={() => onAccept(field)}
        aria-pressed={accepted}
        aria-label={`Accept suggested ${field}`}
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full border transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          // forced-colors: keep button visible in Windows High Contrast mode
          'forced-colors:border-[ButtonText] forced-colors:text-[ButtonText]',
          accepted
            ? // bg-green-700 + white icon = 4.86:1 — meets WCAG AA 4.5:1
              // (was bg-green-500 = 1.85:1 — failed even 3:1 for graphical UI).
              'border-green-700 bg-green-700 text-white forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]'
            : // text-green-700 on white = 4.85:1 — meets WCAG AA 4.5:1
              // (was text-green-600 = 3.36:1 — failed for normal text).
              'border-green-400 bg-transparent text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950'
        )}
      >
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onReject(field)}
        aria-pressed={rejected}
        aria-label={`Reject suggested ${field}`}
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full border transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          'forced-colors:border-[ButtonText] forced-colors:text-[ButtonText]',
          rejected
            ? // bg-red-600 + white icon = 4.83:1 — meets WCAG AA 4.5:1
              // (was bg-red-500 = 3.76:1 — failed for normal text).
              'border-red-600 bg-red-600 text-white forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]'
            : // text-red-700 on white = 6.18:1 — exceeds WCAG AA 4.5:1.
              'border-red-400 bg-transparent text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950'
        )}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Field status indicator
// ---------------------------------------------------------------------------

const FieldStatusIndicator = memo(function FieldStatusIndicator({
  accepted,
  rejected,
}: {
  accepted: boolean;
  rejected: boolean;
}) {
  if (accepted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300 forced-colors:border forced-colors:border-[ButtonText] forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText]">
        <Check className="h-3 w-3" aria-hidden="true" />
        Accepted
      </span>
    );
  }
  if (rejected) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300 forced-colors:border forced-colors:border-[ButtonText] forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText]">
        <X className="h-3 w-3" aria-hidden="true" />
        Rejected
      </span>
    );
  }
  return null;
});

// ---------------------------------------------------------------------------
// QuestionEnhancer
// ---------------------------------------------------------------------------

/**
 * Teacher tool for AI-powered question enhancement.
 *
 * Wrapped with React.memo so parent components that pass stable `courseId`,
 * `assignmentId`, `questionId`, `onSave`, and `className` props do not cause
 * unnecessary re-renders (Requirement 22.4).
 *
 * @example
 * ```tsx
 * <QuestionEnhancer
 *   courseId={course.id}
 *   assignmentId={assignment.id}
 *   questionId={question.id}
 *   onSave={() => refetchAssignment()}
 * />
 * ```
 */
export const QuestionEnhancer = memo(function QuestionEnhancer({
  courseId,
  assignmentId,
  questionId,
  onSave,
  className,
}: QuestionEnhancerProps): JSX.Element {
  const {
    enhancement,
    isEnhancing,
    error,
    acceptedFields,
    rejectedFields,
    enhance,
    acceptField,
    rejectField,
    saveChanges,
    reset,
  } = useQuestionEnhancement();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEnhance = useCallback(async () => {
    await enhance(courseId, assignmentId, questionId);
  }, [enhance, courseId, assignmentId, questionId]);

  const handleSave = useCallback(async () => {
    await saveChanges();
    onSave?.();
  }, [saveChanges, onSave]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const hasAnyDecision = acceptedFields.size > 0 || rejectedFields.size > 0;

  // ── Render: initial state (no enhancement yet) ────────────────────────────

  if (!enhancement && !isEnhancing && !error) {
    return (
      <div className={cn('flex flex-col items-start gap-3', className)}>
        <button
          type="button"
          onClick={handleEnhance}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            'min-h-[44px]',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
          )}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Enhance with AI
        </button>
      </div>
    );
  }

  // ── Render: loading state ─────────────────────────────────────────────────

  if (isEnhancing) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>Enhancing question with AI…</span>
        </div>
        <LoadingSkeletons count={2} variant="question" />
      </div>
    );
  }

  // ── Render: error state ───────────────────────────────────────────────────

  if (error && !enhancement) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-medium">Enhancement failed</p>
            <p className="mt-0.5 text-destructive/80">
              {error.message ||
                'An unexpected error occurred. Please try again.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleEnhance}
          className={cn(
            'flex items-center gap-2 self-start rounded-lg border border-input px-4 py-2.5 text-sm font-medium transition-colors',
            'min-h-[44px]',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
          )}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  // ── Render: enhancement result ────────────────────────────────────────────

  if (!enhancement) return <></>;

  const { original, suggested, rationale } = enhancement;

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* ── Save error (shown inline when enhancement is visible) ──────── */}
      {error && enhancement && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-medium">Save failed: </span>
            {error.message || 'An unexpected error occurred.'}
          </p>
        </div>
      )}

      {/* ── Rationale ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-medium">AI Rationale</p>
          <p className="mt-0.5 leading-relaxed">{rationale}</p>
        </div>
      </div>

      {/* ── Side-by-side comparison ────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {/* ── Question text field ──────────────────────────────────────── */}
        <section aria-labelledby="field-question-heading">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3
              id="field-question-heading"
              className="text-sm font-semibold text-foreground"
            >
              Question Text
            </h3>
            <div className="flex items-center gap-2">
              <FieldStatusIndicator
                accepted={acceptedFields.has('question')}
                rejected={rejectedFields.has('question')}
              />
              <FieldDecisionButtons
                field="question"
                accepted={acceptedFields.has('question')}
                rejected={rejectedFields.has('question')}
                onAccept={acceptField}
                onReject={rejectField}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Original */}
            <div
              className={cn(
                'rounded-lg border p-3 text-sm',
                rejectedFields.has('question')
                  ? 'border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30'
                  : 'border-border bg-muted/30'
              )}
            >
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Original
              </p>
              <p className="leading-relaxed text-foreground">
                {original.question}
              </p>
            </div>

            {/* Suggested */}
            <div
              className={cn(
                'rounded-lg border p-3 text-sm',
                acceptedFields.has('question')
                  ? 'border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-950/50'
                  : 'border-primary/30 bg-primary/5'
              )}
            >
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Suggested
              </p>
              <p className="leading-relaxed text-foreground">
                {suggested.improved_question}
              </p>
            </div>
          </div>
        </section>

        {/* ── Options field ────────────────────────────────────────────── */}
        <section aria-labelledby="field-options-heading">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3
              id="field-options-heading"
              className="text-sm font-semibold text-foreground"
            >
              Answer Options
            </h3>
            <div className="flex items-center gap-2">
              <FieldStatusIndicator
                accepted={acceptedFields.has('options')}
                rejected={rejectedFields.has('options')}
              />
              <FieldDecisionButtons
                field="options"
                accepted={acceptedFields.has('options')}
                rejected={rejectedFields.has('options')}
                onAccept={acceptField}
                onReject={rejectField}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Original options */}
            <div
              className={cn(
                'rounded-lg border p-3 text-sm',
                rejectedFields.has('options')
                  ? 'border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30'
                  : 'border-border bg-muted/30'
              )}
            >
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Original
              </p>
              <ul className="space-y-1.5" aria-label="Original answer options">
                {original.options.map((opt, i) => (
                  <li
                    key={i}
                    className={cn(
                      'flex items-start gap-2 leading-relaxed',
                      opt.is_correct &&
                        'font-medium text-green-700 dark:text-green-400'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-xs',
                        opt.is_correct
                          ? 'border-green-500 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'border-border bg-background text-muted-foreground'
                      )}
                      aria-label={
                        opt.is_correct ? 'Correct answer' : 'Incorrect answer'
                      }
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested options */}
            <div
              className={cn(
                'rounded-lg border p-3 text-sm',
                acceptedFields.has('options')
                  ? 'border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-950/50'
                  : 'border-primary/30 bg-primary/5'
              )}
            >
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Suggested
              </p>
              <ul className="space-y-1.5" aria-label="Suggested answer options">
                {suggested.improved_options.map((opt, i) => (
                  <li
                    key={i}
                    className={cn(
                      'flex items-start gap-2 leading-relaxed',
                      opt.is_correct &&
                        'font-medium text-green-700 dark:text-green-400'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-xs',
                        opt.is_correct
                          ? 'border-green-500 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'border-border bg-background text-muted-foreground'
                      )}
                      aria-label={
                        opt.is_correct ? 'Correct answer' : 'Incorrect answer'
                      }
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Points field ─────────────────────────────────────────────── */}
        <section aria-labelledby="field-points-heading">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3
              id="field-points-heading"
              className="text-sm font-semibold text-foreground"
            >
              Point Value
            </h3>
            <div className="flex items-center gap-2">
              <FieldStatusIndicator
                accepted={acceptedFields.has('points')}
                rejected={rejectedFields.has('points')}
              />
              <FieldDecisionButtons
                field="points"
                accepted={acceptedFields.has('points')}
                rejected={rejectedFields.has('points')}
                onAccept={acceptField}
                onReject={rejectField}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Original points */}
            <div
              className={cn(
                'rounded-lg border p-3 text-sm',
                rejectedFields.has('points')
                  ? 'border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30'
                  : 'border-border bg-muted/30'
              )}
            >
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Original
              </p>
              <p className="text-2xl font-bold text-foreground">
                {original.points}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  pts
                </span>
              </p>
            </div>

            {/* Suggested points */}
            <div
              className={cn(
                'rounded-lg border p-3 text-sm',
                acceptedFields.has('points')
                  ? 'border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-950/50'
                  : 'border-primary/30 bg-primary/5'
              )}
            >
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Suggested
              </p>
              <p className="text-2xl font-bold text-foreground">
                {suggested.suggested_points}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  pts
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* ── Alternative formats (informational) ──────────────────────── */}
        {suggested.alternative_formats.length > 0 && (
          <section aria-labelledby="alt-formats-heading">
            <h3
              id="alt-formats-heading"
              className="mb-2 text-sm font-semibold text-foreground"
            >
              Alternative Formats
            </h3>
            <ul className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-3 text-sm">
              {suggested.alternative_formats.map((fmt, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-muted-foreground"
                >
                  <span
                    className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground"
                    aria-hidden="true"
                  />
                  {fmt}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* ── Action buttons ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        {/* Save Changes */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasAnyDecision}
          aria-label="Save accepted changes to the question"
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            'min-h-[44px]',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            'disabled:pointer-events-none disabled:opacity-50'
          )}
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Save Changes
        </button>

        {/* Re-enhance */}
        <button
          type="button"
          onClick={handleEnhance}
          disabled={isEnhancing}
          aria-label="Request a new AI enhancement"
          className={cn(
            'flex items-center gap-2 rounded-lg border border-input px-4 py-2.5 text-sm font-medium transition-colors',
            'min-h-[44px]',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            'disabled:pointer-events-none disabled:opacity-50'
          )}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Re-enhance
        </button>

        {/* Discard */}
        <button
          type="button"
          onClick={reset}
          aria-label="Discard AI suggestions and close"
          className={cn(
            'flex items-center gap-2 rounded-lg border border-input px-4 py-2.5 text-sm font-medium transition-colors',
            'min-h-[44px]',
            'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Discard
        </button>
      </div>

      {/* ── Screen reader live region ──────────────────────────────────── */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isEnhancing
          ? 'Enhancing question with AI, please wait…'
          : enhancement
            ? 'AI enhancement suggestions are ready. Review and accept or reject each field.'
            : null}
      </div>
    </div>
  );
});

export default QuestionEnhancer;
