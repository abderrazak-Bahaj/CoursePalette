/**
 * PreGradeReview component
 *
 * Displays the AI-generated pre-grade for a student submission and allows
 * the teacher to accept, modify, or re-grade the score before saving the
 * final grade.
 *
 * Features:
 * - Fetches pre-grade on mount via usePreGrade hook
 * - LoadingSkeletons while fetching
 * - Displays total score / max score, per-answer scores and feedback
 * - Renders all feedback with MarkdownRenderer
 * - "Accept AI Score", "Modify Score", and "Re-grade" action buttons
 * - Modify mode: custom score input + rationale textarea
 * - Save Grade calls saveGrade() and fires onGradeSaved callback
 * - "No pre-grade available" empty state when preGrade is null
 * - Error message with retry button on failure
 * - Accessible (aria-live, labels, keyboard nav) and responsive
 *
 * Keyboard navigation (Requirement 15):
 * - Tab order follows DOM order: Retry (when error) → Generate Pre-grade
 *   (empty state) → Accept AI Score → Modify Score → Re-grade → custom-score
 *   input (in Modify mode) → rationale textarea → Save Grade.
 * - Action buttons use `aria-pressed` / `aria-expanded` / `aria-controls`
 *   (Modify Score) so screen readers announce the current state.
 * - All buttons, inputs, and the textarea expose the design-system focus
 *   ring (`focus-visible:outline-none focus-visible:ring-2
 *   focus-visible:ring-ring focus-visible:ring-offset-1`) — the destructive
 *   variant uses `focus-visible:ring-destructive` for higher contrast on
 *   error states.
 * - No custom keyboard shortcuts are defined.
 *
 * @see Requirements 6, 8, 9, 15
 */

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import {
  CheckCircle,
  Edit3,
  RefreshCw,
  Save,
  AlertCircle,
  Loader2,
  X,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePreGrade } from '@/hooks/ai/usePreGrade';
import { MarkdownRenderer } from '../Common/MarkdownRenderer';
import { LoadingSkeletons } from '../Common/LoadingSkeletons';
import type { PreGradeReviewProps, PreGradeAnswer } from '@/services/ai/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Which action mode the teacher has selected. */
type ReviewMode = 'idle' | 'accepted' | 'modifying';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Score badge showing X / Y with colour coding and a textual performance label. */
const ScoreBadge = memo(function ScoreBadge({
  score,
  maxScore,
  className,
}: {
  score: number;
  maxScore: number;
  className?: string;
}) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

  // Determine performance tier — conveyed by both colour AND text label so
  // that colour-blind users and high-contrast mode users get the same info.
  const tier =
    pct >= 80
      ? {
          label: 'Good',
          colour:
            'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/30 dark:border-green-800',
        }
      : pct >= 60
        ? {
            label: 'Average',
            colour:
              'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800',
          }
        : {
            label: 'Needs improvement',
            colour:
              'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800',
          };

  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold tabular-nums',
        // forced-colors: use system highlight colours so the badge remains
        // visible in Windows High Contrast mode.
        'forced-colors:border-[ButtonText] forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText]',
        tier.colour,
        className
      )}
      aria-label={`Score: ${score} out of ${maxScore} — ${tier.label}`}
    >
      {score}
      <span className="text-xs font-normal opacity-70">/ {maxScore}</span>
      {/* Textual tier label — visible to all users, not just screen readers */}
      <span className="ml-1 text-xs font-medium opacity-80">
        ({tier.label})
      </span>
    </span>
  );
});

/** A single per-answer row with score and markdown feedback. */
const AnswerRow = memo(function AnswerRow({
  answer,
  index,
}: {
  answer: PreGradeAnswer;
  index: number;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">
          Question {index + 1}
        </span>
        <span
          className="text-sm font-semibold tabular-nums text-muted-foreground"
          aria-label={`Score for question ${index + 1}: ${answer.score}`}
        >
          {answer.score} pts
        </span>
      </div>
      {answer.feedback && (
        <MarkdownRenderer
          content={answer.feedback}
          className="text-sm text-muted-foreground"
        />
      )}
    </div>
  );
});

// ---------------------------------------------------------------------------
// PreGradeReview
// ---------------------------------------------------------------------------

/**
 * Teacher tool for reviewing and acting on an AI-generated pre-grade.
 *
 * Wrapped with React.memo so parent components that pass stable `courseId`,
 * `assignmentId`, `submissionId`, `onGradeSaved`, and `className` props do
 * not cause unnecessary re-renders (Requirement 22.4).
 *
 * @example
 * ```tsx
 * <PreGradeReview
 *   courseId={course.id}
 *   assignmentId={assignment.id}
 *   submissionId={submission.id}
 *   onGradeSaved={(score) => console.log('Saved:', score)}
 * />
 * ```
 */
export const PreGradeReview = memo(function PreGradeReview({
  courseId,
  assignmentId,
  submissionId,
  onGradeSaved,
  className,
}: PreGradeReviewProps): JSX.Element {
  const {
    preGrade,
    isLoading,
    error,
    overrideScore,
    overrideRationale,
    fetchPreGrade,
    updateScore,
    saveGrade,
    reGrade,
    reset,
  } = usePreGrade();

  // Local UI state
  const [mode, setMode] = useState<ReviewMode>('idle');
  const [customScore, setCustomScore] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  // ── Fetch on mount ────────────────────────────────────────────────────────

  useEffect(() => {
    fetchPreGrade(courseId, assignmentId, submissionId);
    // Reset local UI state when IDs change
    return () => {
      reset();
      setMode('idle');
      setCustomScore('');
      setRationale('');
      setSaveError(null);
      setSavedSuccessfully(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, assignmentId, submissionId]);

  // ── Derived values ────────────────────────────────────────────────────────

  const effectiveScore = useMemo(
    () =>
      mode === 'modifying' && customScore !== ''
        ? Number(customScore)
        : overrideScore !== null
          ? overrideScore
          : (preGrade?.total_score ?? 0),
    [mode, customScore, overrideScore, preGrade]
  );

  const maxScore = preGrade?.max_score ?? 0;

  const isCustomScoreValid = useMemo(
    () =>
      customScore !== '' &&
      !isNaN(Number(customScore)) &&
      Number(customScore) >= 0 &&
      Number(customScore) <= maxScore,
    [customScore, maxScore]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAccept = useCallback(() => {
    setMode('accepted');
    setSaveError(null);
    setSavedSuccessfully(false);
  }, []);

  const handleModify = useCallback(() => {
    setMode('modifying');
    setCustomScore(String(preGrade?.total_score ?? ''));
    setRationale('');
    setSaveError(null);
    setSavedSuccessfully(false);
  }, [preGrade]);

  const handleCancelModify = useCallback(() => {
    setMode('idle');
    setCustomScore('');
    setRationale('');
    setSaveError(null);
  }, []);

  const handleReGrade = useCallback(async () => {
    setMode('idle');
    setSaveError(null);
    setSavedSuccessfully(false);
    await reGrade(courseId, assignmentId, submissionId);
  }, [reGrade, courseId, assignmentId, submissionId]);

  const handleSave = useCallback(async () => {
    setSaveError(null);
    setIsSaving(true);

    try {
      if (mode === 'modifying') {
        if (!isCustomScoreValid) {
          setSaveError(`Score must be a number between 0 and ${maxScore}.`);
          return;
        }
        updateScore(Number(customScore), rationale);
      }

      await saveGrade();
      setSavedSuccessfully(true);
      onGradeSaved?.(effectiveScore);
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : 'Failed to save grade. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    mode,
    isCustomScoreValid,
    maxScore,
    customScore,
    rationale,
    updateScore,
    saveGrade,
    effectiveScore,
    onGradeSaved,
  ]);

  const handleRetryFetch = useCallback(() => {
    fetchPreGrade(courseId, assignmentId, submissionId);
  }, [fetchPreGrade, courseId, assignmentId, submissionId]);

  // ── Render: loading ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <LoadingSkeletons count={3} variant="generic" />
      </div>
    );
  }

  // ── Render: fetch error ───────────────────────────────────────────────────

  if (error && !preGrade) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className={cn(
          'flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive',
          className
        )}
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-medium">Failed to load pre-grade</p>
          <p className="mt-0.5 text-destructive/80">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRetryFetch}
          aria-label="Retry loading pre-grade"
          className={cn(
            'ml-auto flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2.5 text-xs font-medium transition-colors',
            // 44 px min-height ensures the touch target meets WCAG 2.5.5.
            'min-h-[44px]',
            'border border-destructive/40 text-destructive hover:bg-destructive/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-1'
          )}
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  // ── Render: no pre-grade ──────────────────────────────────────────────────

  if (!preGrade) {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-3 rounded-lg border border-dashed bg-muted/30 p-8 text-center',
          className
        )}
      >
        <ClipboardList
          className="h-8 w-8 text-muted-foreground/50"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-medium text-foreground">
            No pre-grade available
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            This submission has not been pre-graded by AI yet.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReGrade}
          disabled={isLoading}
          className={cn(
            'mt-1 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            // 44 px touch target for primary CTA on the empty-state card.
            'min-h-[44px]',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            'disabled:pointer-events-none disabled:opacity-50'
          )}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Generate Pre-grade
        </button>
      </div>
    );
  }

  // ── Render: pre-grade available ───────────────────────────────────────────

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* ── Header: score summary ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4 shadow-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            AI Pre-grade
          </p>
          <div className="mt-1 flex items-center gap-3">
            <ScoreBadge
              score={preGrade.total_score}
              maxScore={preGrade.max_score}
            />
            {mode === 'accepted' && (
              <span className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Score accepted
              </span>
            )}
          </div>
        </div>

        {/* Action buttons (req 5) */}
        {!savedSuccessfully && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Accept AI Score */}
            <button
              type="button"
              onClick={handleAccept}
              disabled={isLoading || isSaving || mode === 'accepted'}
              aria-pressed={mode === 'accepted'}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
                // 44 px touch target (WCAG 2.5.5 / Requirement 16.4) so the
                // action row works on phones and tablets.
                'min-h-[44px]',
                mode === 'accepted'
                  ? // bg-green-700 + white = 4.55:1 — meets WCAG AA 4.5:1
                    // (was bg-green-600 = 3.04:1 — failed for normal text).
                    'bg-green-700 text-white forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]'
                  : // text-green-700 on white = 4.85:1 — meets WCAG AA 4.5:1.
                    'border border-green-700/40 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                'disabled:pointer-events-none disabled:opacity-50'
              )}
            >
              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Accept AI Score
            </button>

            {/* Modify Score */}
            <button
              type="button"
              onClick={mode === 'modifying' ? handleCancelModify : handleModify}
              disabled={isLoading || isSaving}
              aria-pressed={mode === 'modifying'}
              aria-expanded={mode === 'modifying'}
              aria-controls="modify-score-panel"
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
                'min-h-[44px]',
                mode === 'modifying'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-input text-foreground hover:bg-accent',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                'disabled:pointer-events-none disabled:opacity-50'
              )}
            >
              {mode === 'modifying' ? (
                <>
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  Modify Score
                </>
              )}
            </button>

            {/* Re-grade */}
            <button
              type="button"
              onClick={handleReGrade}
              disabled={isLoading || isSaving}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
                'min-h-[44px]',
                'border border-input text-foreground hover:bg-accent',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                'disabled:pointer-events-none disabled:opacity-50'
              )}
            >
              {isLoading ? (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Re-grade
            </button>
          </div>
        )}
      </div>

      {/* ── Modify score panel (req 6) ─────────────────────────────────── */}
      {mode === 'modifying' && (
        <div
          id="modify-score-panel"
          role="group"
          aria-label="Modify score"
          className="rounded-lg border bg-card p-4 shadow-sm space-y-4"
        >
          <p className="text-sm font-medium text-foreground">
            Enter a custom score
          </p>

          {/* Score input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="custom-score-input"
              className="text-xs font-medium text-muted-foreground"
            >
              Score{' '}
              <span className="text-muted-foreground/60">(0 – {maxScore})</span>
            </label>
            <input
              id="custom-score-input"
              type="number"
              min={0}
              max={maxScore}
              step={0.5}
              value={customScore}
              onChange={(e) => setCustomScore(e.target.value)}
              aria-describedby="custom-score-hint"
              aria-invalid={
                customScore !== '' && !isCustomScoreValid ? 'true' : undefined
              }
              className={cn(
                'w-32 rounded-lg border bg-background px-3 py-2 text-sm tabular-nums',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                customScore !== '' && !isCustomScoreValid
                  ? 'border-destructive focus-visible:ring-destructive'
                  : 'border-input'
              )}
            />
            {customScore !== '' && !isCustomScoreValid && (
              <p
                id="custom-score-hint"
                role="alert"
                className="text-xs text-destructive"
              >
                Score must be between 0 and {maxScore}.
              </p>
            )}
          </div>

          {/* Rationale textarea */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="score-rationale"
              className="text-xs font-medium text-muted-foreground"
            >
              Rationale{' '}
              <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <textarea
              id="score-rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Explain why you are modifying the score…"
              rows={3}
              className={cn(
                'w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
              )}
            />
          </div>
        </div>
      )}

      {/* ── Save Grade button (req 7) ──────────────────────────────────── */}
      {(mode === 'accepted' || mode === 'modifying') && !savedSuccessfully && (
        <div className="flex flex-col gap-2">
          {saveError && (
            <p
              role="alert"
              aria-live="assertive"
              className="text-xs text-destructive"
            >
              {saveError}
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={
              isSaving ||
              isLoading ||
              (mode === 'modifying' && !isCustomScoreValid)
            }
            className={cn(
              'flex items-center justify-center gap-2 self-start rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              // 44 px touch target on the primary "Save Grade" CTA.
              'min-h-[44px]',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              'disabled:pointer-events-none disabled:opacity-50'
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                Save Grade
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Save success notice ────────────────────────────────────────── */}
      {savedSuccessfully && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
        >
          <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Grade saved successfully — final score:{' '}
            <strong className="tabular-nums">{effectiveScore}</strong> /{' '}
            {maxScore}
          </span>
        </div>
      )}

      {/* ── Summary feedback ──────────────────────────────────────────── */}
      {preGrade.summary && (
        <section aria-labelledby="summary-heading">
          <h3
            id="summary-heading"
            className="mb-2 text-sm font-semibold text-foreground"
          >
            Summary Feedback
          </h3>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <MarkdownRenderer content={preGrade.summary} className="text-sm" />
          </div>
        </section>
      )}

      {/* ── Per-answer breakdown ──────────────────────────────────────── */}
      {preGrade.per_answer && preGrade.per_answer.length > 0 && (
        <section aria-labelledby="per-answer-heading">
          <h3
            id="per-answer-heading"
            className="mb-3 text-sm font-semibold text-foreground"
          >
            Per-Question Breakdown
          </h3>
          <div className="space-y-3">
            {preGrade.per_answer.map((answer, index) => (
              <AnswerRow
                key={answer.question_id}
                answer={answer}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Re-grade loading overlay (screen reader) ──────────────────── */}
      <div role="status" aria-live="polite" className="sr-only">
        {isLoading ? 'Re-grading submission, please wait…' : null}
      </div>
    </div>
  );
});

export default PreGradeReview;
