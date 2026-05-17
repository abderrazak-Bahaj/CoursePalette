/**
 * useAssignmentGeneration hook
 *
 * Manages the state for AI-generated assignments, including generation,
 * editing (questions, options, points), validation, saving, and reset.
 *
 * The hook tracks the original `max_score` requested during generation so
 * that `validatePoints` can verify the sum of edited question points still
 * equals the intended total.
 *
 * @module hooks/ai/useAssignmentGeneration
 * @see Requirements 4, 12
 */

import { useState, useCallback, useRef } from 'react';
import { aiApiClient } from '@/services/ai/aiApiClient';
import { AiRateLimitError } from '@/services/ai/errors';
import { assignmentService } from '@/services/api/assignmentService';
import { performanceMonitor } from '@/utils/ai/performanceMonitor';
import type {
  GeneratedAssignment,
  GeneratedQuestion,
  GenerateAssignmentParams,
} from '@/services/ai/types';

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseAssignmentGenerationReturn {
  /** The most recently generated assignment, or null if none. */
  generatedAssignment: GeneratedAssignment | null;
  /** Whether generation is in progress. */
  isGenerating: boolean;
  /** The current error, if any. */
  error: Error | null;
  /** Rate-limit reset time (Unix seconds), if the teacher is rate-limited. */
  rateLimitRetryAfter: number | null;
  /** Validation error message, if points do not sum to max_score. */
  validationError: string | null;
  /**
   * Trigger AI assignment generation.
   * Stores the result in state on success; sets error on failure.
   */
  generate: (params: GenerateAssignmentParams) => Promise<void>;
  /**
   * Immutably update a question at the given index.
   * Partial updates are merged with the existing question.
   */
  updateQuestion: (
    questionIndex: number,
    updates: Partial<GeneratedQuestion>
  ) => void;
  /**
   * Immutably update the text of a specific option within a question.
   */
  updateOption: (
    questionIndex: number,
    optionIndex: number,
    text: string
  ) => void;
  /**
   * Immutably update the points value for a specific question.
   */
  updatePoints: (questionIndex: number, points: number) => void;
  /**
   * Validate that the sum of all question points equals the assignment's
   * max_score (the value requested during generation).
   *
   * @returns `true` when the sum matches; `false` otherwise.
   *          Also sets/clears `validationError` as a side-effect.
   */
  validatePoints: () => boolean;
  /**
   * Validate points, then save the generated assignment via the existing
   * assignment creation endpoint.
   *
   * @throws When validation fails or the API call fails.
   */
  saveAssignment: (title?: string) => Promise<void>;
  /** Reset all state back to initial values. */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Custom hook for managing AI-generated assignment state.
 *
 * @param courseId - The course the assignment belongs to.
 *
 * @example
 * ```tsx
 * const {
 *   generatedAssignment,
 *   isGenerating,
 *   error,
 *   generate,
 *   updateQuestion,
 *   updateOption,
 *   updatePoints,
 *   validatePoints,
 *   saveAssignment,
 *   reset,
 * } = useAssignmentGeneration(courseId);
 * ```
 */
export function useAssignmentGeneration(
  courseId: string | number
): UseAssignmentGenerationReturn {
  // ── State ──────────────────────────────────────────────────────────────────
  const [generatedAssignment, setGeneratedAssignment] =
    useState<GeneratedAssignment | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number | null>(
    null
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Tracks the max_score requested during generation.
   * Used by validatePoints to check that edited question points still sum
   * to the originally requested total.
   *
   * A ref is used (rather than state) because this value should not trigger
   * re-renders on its own — it is a stable reference value set once per
   * generation call.
   */
  const maxScoreRef = useRef<number | null>(null);

  // ── generate ──────────────────────────────────────────────────────────────

  const generate = useCallback(
    async (params: GenerateAssignmentParams): Promise<void> => {
      setIsGenerating(true);
      setError(null);
      setRateLimitRetryAfter(null);
      setValidationError(null);

      const doneGenerate =
        performanceMonitor.measureOperation('generateAssignment');

      try {
        const result = await aiApiClient.generateAssignment(courseId, params);
        // Store the requested max_score so validatePoints can use it later
        maxScoreRef.current = params.max_score;
        setGeneratedAssignment(result);
        doneGenerate();
      } catch (err) {
        if (err instanceof AiRateLimitError) {
          setRateLimitRetryAfter(err.retryAfter);
        }
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsGenerating(false);
      }
    },
    [courseId]
  );

  // ── updateQuestion ────────────────────────────────────────────────────────

  const updateQuestion = useCallback(
    (questionIndex: number, updates: Partial<GeneratedQuestion>): void => {
      setGeneratedAssignment((prev) => {
        if (!prev) return prev;

        const updatedQuestions = prev.questions.map((q, idx) =>
          idx === questionIndex ? { ...q, ...updates } : q
        );

        return { ...prev, questions: updatedQuestions };
      });
    },
    []
  );

  // ── updateOption ──────────────────────────────────────────────────────────

  const updateOption = useCallback(
    (questionIndex: number, optionIndex: number, text: string): void => {
      setGeneratedAssignment((prev) => {
        if (!prev) return prev;

        const updatedQuestions = prev.questions.map((q, qIdx) => {
          if (qIdx !== questionIndex) return q;

          const updatedOptions = q.options.map((opt, oIdx) =>
            oIdx === optionIndex ? { ...opt, text } : opt
          );

          return { ...q, options: updatedOptions };
        });

        return { ...prev, questions: updatedQuestions };
      });
    },
    []
  );

  // ── updatePoints ──────────────────────────────────────────────────────────

  const updatePoints = useCallback(
    (questionIndex: number, points: number): void => {
      setGeneratedAssignment((prev) => {
        if (!prev) return prev;

        const updatedQuestions = prev.questions.map((q, idx) =>
          idx === questionIndex ? { ...q, points } : q
        );

        return { ...prev, questions: updatedQuestions };
      });
    },
    []
  );

  // ── validatePoints ────────────────────────────────────────────────────────

  const validatePoints = useCallback((): boolean => {
    if (!generatedAssignment) {
      setValidationError('No assignment has been generated yet.');
      return false;
    }

    const totalPoints = generatedAssignment.questions.reduce(
      (sum, q) => sum + q.points,
      0
    );

    // Use the max_score from the generation params (stored in ref).
    // Fall back to the initial sum of question points if the ref is not set
    // (e.g. if the hook is used with a pre-populated assignment).
    const expectedMaxScore = maxScoreRef.current ?? totalPoints;

    if (totalPoints !== expectedMaxScore) {
      const msg = `The sum of question points (${totalPoints}) must equal the assignment max score (${expectedMaxScore}).`;
      setValidationError(msg);
      return false;
    }

    setValidationError(null);
    return true;
  }, [generatedAssignment]);

  // ── saveAssignment ────────────────────────────────────────────────────────

  const saveAssignment = useCallback(
    async (customTitle?: string): Promise<void> => {
      if (!generatedAssignment) {
        throw new Error('No assignment has been generated yet.');
      }

      // Validate points before saving
      const isValid = validatePoints();
      if (!isValid) {
        // validatePoints() already set validationError in state; read it from
        // the assignment's current points sum so we don't need validationError
        // in the dependency array (which would cause stale-closure issues).
        throw new Error(
          'Points validation failed. Please ensure the sum of question points equals the assignment max score.'
        );
      }

      // Map GeneratedAssignment to the shape expected by assignmentService.createAssignment
      const totalScore = generatedAssignment.questions.reduce(
        (sum, q) => sum + q.points,
        0
      );

      const assignmentData = {
        title: customTitle || 'AI Generated Assignment',
        description: generatedAssignment.rubric,
        type: 'QUIZ',
        status: 'DRAFT',
        max_score: totalScore,
        questions: generatedAssignment.questions.map((q, idx) => ({
          question: q.text,
          type:
            q.type === 'multiple_choice'
              ? 'MULTIPLE_CHOICE'
              : q.type === 'true_false'
                ? 'TRUE_FALSE'
                : q.type === 'essay'
                  ? 'ESSAY'
                  : q.type === 'short_answer'
                    ? 'SHORT_ANSWER'
                    : q.type.toUpperCase(),
          points: q.points,
          order: idx + 1,
          options: q.options.map((opt, optIdx) => ({
            text: opt.text,
            is_correct: opt.is_correct,
            order: optIdx + 1,
          })),
        })),
      };

      await assignmentService.createAssignment(
        String(courseId),
        assignmentData
      );
    },
    [courseId, generatedAssignment, validatePoints]
  );

  // ── reset ─────────────────────────────────────────────────────────────────

  const reset = useCallback((): void => {
    setGeneratedAssignment(null);
    setIsGenerating(false);
    setError(null);
    setRateLimitRetryAfter(null);
    setValidationError(null);
    maxScoreRef.current = null;
  }, []);

  // ── Return ────────────────────────────────────────────────────────────────

  return {
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
  };
}

export default useAssignmentGeneration;
