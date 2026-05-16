/**
 * AssignmentGenerator component
 *
 * Teacher tool for generating AI-powered assignments from a lesson.
 *
 * Features:
 * - Form with num_questions (5–10), max_score, and difficulty fields
 * - Validation before submission
 * - LoadingSkeletons with variant="question" while generating
 * - Generated assignment display with editable questions, options, and points
 * - Inline validation error when points don't sum to max_score
 * - Save button that calls saveAssignment() and the onSave callback
 * - RateLimitAlert when rate limited
 * - Error message with retry on failure
 * - Accessible and responsive
 *
 * Keyboard navigation (Requirement 15):
 * - Tab order follows DOM order: rate-limit dismiss (when shown) → form
 *   fields (num_questions → max_score → difficulty) → Generate → Reset
 *   (when present) → Retry (when error) → question collapse toggles →
 *   question text → option inputs → points input → Save Assignment.
 * - All form inputs, selects, textareas, and buttons expose the
 *   design-system focus ring (`focus-visible:outline-none focus-visible:ring-2
 *   focus-visible:ring-ring focus-visible:ring-offset-1`) so the focus
 *   indicator meets WCAG 2.1 AA contrast.
 * - No custom keyboard shortcuts are defined; the form submits on Enter
 *   inside any text input via native browser behaviour.
 *
 * @see Requirements 4, 8, 9, 15
 */

import { useState, useCallback, useId, memo } from 'react';
import {
  Wand2,
  Save,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAssignmentGeneration } from '@/hooks/ai/useAssignmentGeneration';
import { LoadingSkeletons } from '../Common/LoadingSkeletons';
import { RateLimitAlert } from '../Common/RateLimitAlert';
import type {
  AssignmentDifficulty,
  GeneratedAssignment,
  GeneratedQuestion,
} from '@/services/ai/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AssignmentGeneratorProps {
  /** ID of the course to generate an assignment for. */
  courseId: string | number;
  /** ID of the lesson to base the assignment on (required by GenerateAssignmentParams). */
  lessonId: string | number;
  /** Callback invoked when the teacher saves the generated assignment. */
  onSave?: (assignment: GeneratedAssignment) => void;
  /** Optional CSS class name for the container. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIFFICULTY_OPTIONS: { value: AssignmentDifficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const DEFAULT_NUM_QUESTIONS = 7;
const DEFAULT_MAX_SCORE = 100;
const DEFAULT_DIFFICULTY: AssignmentDifficulty = 'medium';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface QuestionEditorProps {
  question: GeneratedQuestion;
  index: number;
  onUpdateQuestion: (
    index: number,
    updates: Partial<GeneratedQuestion>
  ) => void;
  onUpdateOption: (qIdx: number, oIdx: number, text: string) => void;
  onUpdatePoints: (index: number, points: number) => void;
}

/** Collapsible editor for a single generated question. */
const QuestionEditor = memo(function QuestionEditor({
  question,
  index,
  onUpdateQuestion,
  onUpdateOption,
  onUpdatePoints,
}: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const headingId = useId();

  // Memoize the toggle handler to prevent unnecessary re-renders
  const handleToggle = useCallback(() => {
    setIsExpanded((v) => !v);
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      {/* Question header / toggle */}
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={`question-body-${index}`}
        onClick={handleToggle}
        className={cn(
          'flex w-full items-center justify-between gap-3 px-4 py-3 text-left',
          'rounded-t-lg transition-colors hover:bg-muted/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
        )}
      >
        <span id={headingId} className="text-sm font-semibold text-foreground">
          Question {index + 1}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({question.points} {question.points === 1 ? 'pt' : 'pts'})
          </span>
        </span>
        {isExpanded ? (
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

      {/* Question body */}
      {isExpanded && (
        <div
          id={`question-body-${index}`}
          role="region"
          aria-labelledby={headingId}
          className="space-y-4 border-t border-border px-4 pb-4 pt-3"
        >
          {/* Question text */}
          <div className="space-y-1.5">
            <label
              htmlFor={`question-text-${index}`}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Question text
            </label>
            <textarea
              id={`question-text-${index}`}
              value={question.text}
              onChange={(e) =>
                onUpdateQuestion(index, { text: e.target.value })
              }
              rows={2}
              className={cn(
                'w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
              )}
            />
          </div>

          {/* Options */}
          {question.options.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Answer options
              </p>
              <ul
                className="space-y-2"
                aria-label={`Options for question ${index + 1}`}
              >
                {question.options.map((option, oIdx) => (
                  <li key={oIdx} className="flex items-center gap-2">
                    {/* Correct indicator */}
                    <span
                      aria-label={
                        option.is_correct
                          ? 'Correct answer'
                          : 'Incorrect answer'
                      }
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs',
                        // forced-colors: keep indicator visible in Windows High Contrast mode
                        'forced-colors:border forced-colors:border-[ButtonText]',
                        option.is_correct
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {option.is_correct ? (
                        <CheckCircle2
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      ) : (
                        <span aria-hidden="true">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                      )}
                    </span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        onUpdateOption(index, oIdx, e.target.value)
                      }
                      aria-label={`Option ${String.fromCharCode(65 + oIdx)} for question ${index + 1}${option.is_correct ? ' (correct)' : ''}`}
                      className={cn(
                        'flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                        option.is_correct &&
                          'border-green-300 dark:border-green-700'
                      )}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Points */}
          <div className="flex items-center gap-3">
            <label
              htmlFor={`question-points-${index}`}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap"
            >
              Points
            </label>
            <input
              id={`question-points-${index}`}
              type="number"
              min={0}
              step={1}
              value={question.points}
              onChange={(e) => onUpdatePoints(index, Number(e.target.value))}
              className={cn(
                'w-24 rounded-md border border-input bg-background px-3 py-1.5 text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
});

// ---------------------------------------------------------------------------
// AssignmentGenerator
// ---------------------------------------------------------------------------

/**
 * Teacher tool for generating AI-powered assignments.
 *
 * Wrapped with React.memo so parent components that pass stable `courseId`,
 * `lessonId`, `onSave`, and `className` props do not cause unnecessary
 * re-renders of the entire generator (Requirement 22.4).
 *
 * @example
 * ```tsx
 * <AssignmentGenerator
 *   courseId={course.id}
 *   lessonId={lesson.id}
 *   onSave={(assignment) => console.log('Saved', assignment)}
 * />
 * ```
 */
export const AssignmentGenerator = memo(function AssignmentGenerator({
  courseId,
  lessonId,
  onSave,
  className,
}: AssignmentGeneratorProps): JSX.Element {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [numQuestions, setNumQuestions] = useState<number>(
    DEFAULT_NUM_QUESTIONS
  );
  const [maxScore, setMaxScore] = useState<number>(DEFAULT_MAX_SCORE);
  const [difficulty, setDifficulty] =
    useState<AssignmentDifficulty>(DEFAULT_DIFFICULTY);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Hook ───────────────────────────────────────────────────────────────────
  const {
    generatedAssignment,
    isGenerating,
    error,
    rateLimitRetryAfter,
    validationError,
    generate,
    updateQuestion,
    updateOption,
    updatePoints,
    validatePoints,
    saveAssignment,
    reset,
  } = useAssignmentGeneration(courseId);

  // ── Derived ────────────────────────────────────────────────────────────────
  const numQuestionsValid = numQuestions >= 5 && numQuestions <= 10;
  const maxScoreValid = maxScore > 0;
  const canGenerate = numQuestionsValid && maxScoreValid && !isGenerating;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canGenerate) return;

      setSaveSuccess(false);
      await generate({
        lesson_id: lessonId,
        num_questions: numQuestions,
        max_score: maxScore,
        difficulty,
      });
    },
    [canGenerate, generate, lessonId, numQuestions, maxScore, difficulty]
  );

  const handleSave = useCallback(async () => {
    if (!generatedAssignment || isSaving) return;

    // Run validation first — saveAssignment also validates, but we want to
    // surface the error without throwing.
    if (!validatePoints()) return;

    setIsSaving(true);
    try {
      await saveAssignment();
      setSaveSuccess(true);
      onSave?.(generatedAssignment);
    } catch {
      // Error is already set in the hook state; nothing extra needed here.
    } finally {
      setIsSaving(false);
    }
  }, [generatedAssignment, isSaving, validatePoints, saveAssignment, onSave]);

  const handleReset = useCallback(() => {
    reset();
    setSaveSuccess(false);
  }, [reset]);

  const handleDismissRateLimit = useCallback(() => {
    // The RateLimitAlert auto-dismisses; we just need to reset the hook error
    // so the alert disappears when the user manually dismisses it.
    reset();
  }, [reset]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* ── Rate limit alert ─────────────────────────────────────────────── */}
      {rateLimitRetryAfter !== null && (
        <RateLimitAlert
          retryAfter={rateLimitRetryAfter}
          onDismiss={handleDismissRateLimit}
        />
      )}

      {/* ── Generation form ──────────────────────────────────────────────── */}
      <form
        onSubmit={handleGenerate}
        aria-label="Generate AI assignment"
        noValidate
        className="rounded-lg border border-border bg-card p-5 shadow-sm"
      >
        <h2 className="mb-4 text-base font-semibold text-foreground flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" aria-hidden="true" />
          Generate Assignment with AI
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Number of questions */}
          <div className="space-y-1.5">
            <label
              htmlFor="gen-num-questions"
              className="text-sm font-medium text-foreground"
            >
              Number of questions
            </label>
            <input
              id="gen-num-questions"
              type="number"
              min={5}
              max={10}
              step={1}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              disabled={isGenerating}
              aria-describedby="gen-num-questions-hint"
              aria-invalid={!numQuestionsValid ? 'true' : undefined}
              className={cn(
                'w-full rounded-md border bg-background px-3 py-2 text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-50',
                !numQuestionsValid ? 'border-destructive' : 'border-input'
              )}
            />
            <p
              id="gen-num-questions-hint"
              className="text-xs text-muted-foreground"
            >
              Between 5 and 10
            </p>
            {!numQuestionsValid && (
              <p role="alert" className="text-xs text-destructive">
                Must be between 5 and 10.
              </p>
            )}
          </div>

          {/* Max score */}
          <div className="space-y-1.5">
            <label
              htmlFor="gen-max-score"
              className="text-sm font-medium text-foreground"
            >
              Max score
            </label>
            <input
              id="gen-max-score"
              type="number"
              min={1}
              step={1}
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              disabled={isGenerating}
              aria-invalid={!maxScoreValid ? 'true' : undefined}
              className={cn(
                'w-full rounded-md border bg-background px-3 py-2 text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-50',
                !maxScoreValid ? 'border-destructive' : 'border-input'
              )}
            />
            {!maxScoreValid && (
              <p role="alert" className="text-xs text-destructive">
                Must be greater than 0.
              </p>
            )}
          </div>

          {/* Difficulty */}
          <div className="space-y-1.5">
            <label
              htmlFor="gen-difficulty"
              className="text-sm font-medium text-foreground"
            >
              Difficulty
            </label>
            <select
              id="gen-difficulty"
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as AssignmentDifficulty)
              }
              disabled={isGenerating}
              className={cn(
                'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {DIFFICULTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={!canGenerate}
            aria-label={
              isGenerating
                ? 'Generating assignment…'
                : 'Generate assignment with AI'
            }
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              'min-h-[44px]',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              'disabled:pointer-events-none disabled:opacity-50'
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Generating…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" aria-hidden="true" />
                Generate
              </>
            )}
          </button>

          {generatedAssignment && !isGenerating && (
            <button
              type="button"
              onClick={handleReset}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                'min-h-[44px]',
                'border border-input bg-background text-foreground hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
              )}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          )}
        </div>
      </form>

      {/* ── Loading skeletons ─────────────────────────────────────────────── */}
      {isGenerating && (
        <div aria-live="polite" aria-label="Generating assignment, please wait">
          <LoadingSkeletons count={numQuestions} variant="question" />
        </div>
      )}

      {/* ── API error (non-rate-limit) ────────────────────────────────────── */}
      {error && !rateLimitRetryAfter && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-medium">Generation failed</p>
            <p className="mt-0.5 text-destructive/80">
              {error.message ||
                'An unexpected error occurred. Please try again.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerate as unknown as React.MouseEventHandler}
            disabled={isGenerating}
            aria-label="Retry generating the assignment"
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
        </div>
      )}

      {/* ── Generated assignment editor ───────────────────────────────────── */}
      {generatedAssignment && !isGenerating && (
        <section aria-label="Generated assignment" className="space-y-4">
          {/* Section header */}
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              Generated Assignment
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({generatedAssignment.questions.length} questions)
              </span>
            </h3>
          </div>

          {/* Rubric */}
          {generatedAssignment.rubric && (
            <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Rubric / Instructions
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {generatedAssignment.rubric}
              </p>
            </div>
          )}

          {/* Question editors */}
          <div
            className="space-y-3"
            role="list"
            aria-label="Assignment questions"
          >
            {generatedAssignment.questions.map((question, idx) => (
              <div key={idx} role="listitem">
                <QuestionEditor
                  question={question}
                  index={idx}
                  onUpdateQuestion={updateQuestion}
                  onUpdateOption={updateOption}
                  onUpdatePoints={updatePoints}
                />
              </div>
            ))}
          </div>

          {/* Points validation error */}
          {validationError && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>{validationError}</span>
            </div>
          )}

          {/* Save success */}
          {saveSuccess && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-200"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Assignment saved successfully.
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
              aria-label={
                isSaving ? 'Saving assignment…' : 'Save generated assignment'
              }
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                'min-h-[44px]',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                'disabled:pointer-events-none disabled:opacity-50'
              )}
            >
              {isSaving ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Save Assignment
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* ── Screen reader live region ─────────────────────────────────────── */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isGenerating
          ? 'Generating assignment, please wait…'
          : generatedAssignment && !isGenerating
            ? 'Assignment generated. Review and edit questions below.'
            : null}
      </div>
    </div>
  );
});

export default AssignmentGenerator;
