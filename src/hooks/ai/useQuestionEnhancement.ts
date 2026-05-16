/**
 * useQuestionEnhancement Hook
 *
 * Manages the state for AI-powered question enhancement suggestions.
 * Provides field-level accept/reject logic and a save method that merges
 * accepted suggestions back into the question via the existing assignment
 * update endpoint.
 *
 * @module hooks/ai/useQuestionEnhancement
 * @see Requirements 5, 12
 */

import { useState, useCallback } from 'react';
import { aiApiClient } from '@/services/ai/aiApiClient';
import type { QuestionEnhancement, EnhancedField } from '@/services/ai/types';
import { put } from '@/services/api/apiClient';
import { performanceMonitor } from '@/utils/ai/performanceMonitor';

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseQuestionEnhancementReturn {
  /** The enhancement result from the AI, or null if not yet fetched. */
  enhancement: QuestionEnhancement | null;
  /** Whether an enhancement request is in progress. */
  isEnhancing: boolean;
  /** The current error, if any. */
  error: Error | null;
  /** Fields the teacher has accepted (will use the suggested value on save). */
  acceptedFields: Set<EnhancedField>;
  /** Fields the teacher has rejected (will keep the original value on save). */
  rejectedFields: Set<EnhancedField>;
  /**
   * Fetch AI enhancement suggestions for a question.
   * Resets acceptedFields and rejectedFields on each call.
   */
  enhance: (
    courseId: string | number,
    assignmentId: string | number,
    questionId: string | number
  ) => Promise<void>;
  /**
   * Accept a field: moves it to acceptedFields and removes from rejectedFields.
   */
  acceptField: (field: EnhancedField) => void;
  /**
   * Reject a field: moves it to rejectedFields and removes from acceptedFields.
   */
  rejectField: (field: EnhancedField) => void;
  /**
   * Persist the accepted changes via the existing assignment update endpoint.
   * Builds the final question by merging original values with accepted
   * suggested values, then PUTs to
   * `/courses/{courseId}/assignments/{assignmentId}`.
   */
  saveChanges: () => Promise<void>;
  /** Clears all state back to initial values. */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Custom hook for managing AI question enhancement state.
 *
 * Usage:
 * ```tsx
 * const {
 *   enhancement, isEnhancing, error,
 *   acceptedFields, rejectedFields,
 *   enhance, acceptField, rejectField, saveChanges, reset,
 * } = useQuestionEnhancement();
 *
 * // Trigger enhancement
 * await enhance(courseId, assignmentId, questionId);
 *
 * // Accept the improved question text
 * acceptField('question');
 *
 * // Save accepted changes
 * await saveChanges();
 * ```
 *
 * @see Requirements 5, 12
 */
export function useQuestionEnhancement(): UseQuestionEnhancementReturn {
  // ── State ────────────────────────────────────────────────────────────────

  const [enhancement, setEnhancement] = useState<QuestionEnhancement | null>(
    null
  );
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [acceptedFields, setAcceptedFields] = useState<Set<EnhancedField>>(
    new Set()
  );
  const [rejectedFields, setRejectedFields] = useState<Set<EnhancedField>>(
    new Set()
  );

  /**
   * We store the IDs used for the last enhance() call so that saveChanges()
   * can build the correct endpoint URL without requiring the caller to pass
   * them again.
   */
  const [savedIds, setSavedIds] = useState<{
    courseId: string | number;
    assignmentId: string | number;
    questionId: string | number;
  } | null>(null);

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Calls the AI enhance endpoint and stores the result.
   * Resets accepted/rejected sets so the teacher starts fresh.
   *
   * @see Requirement 5.2, 5.3
   */
  const enhance = useCallback(
    async (
      courseId: string | number,
      assignmentId: string | number,
      questionId: string | number
    ): Promise<void> => {
      setIsEnhancing(true);
      setError(null);

      const doneEnhance =
        performanceMonitor.measureOperation('enhanceQuestion');

      try {
        const result = await aiApiClient.enhanceQuestion(
          courseId,
          assignmentId,
          questionId
        );
        setEnhancement(result);
        // Reset field decisions for the new enhancement
        setAcceptedFields(new Set());
        setRejectedFields(new Set());
        // Remember IDs for saveChanges()
        setSavedIds({ courseId, assignmentId, questionId });
        doneEnhance();
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsEnhancing(false);
      }
    },
    []
  );

  /**
   * Marks a field as accepted.
   * Removes it from rejectedFields if it was previously rejected.
   *
   * @see Requirement 5.6, 5.7
   */
  const acceptField = useCallback((field: EnhancedField): void => {
    setAcceptedFields((prev) => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
    setRejectedFields((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  /**
   * Marks a field as rejected.
   * Removes it from acceptedFields if it was previously accepted.
   *
   * @see Requirement 5.6, 5.8
   */
  const rejectField = useCallback((field: EnhancedField): void => {
    setRejectedFields((prev) => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
    setAcceptedFields((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  /**
   * Builds the final question payload by merging original values with
   * accepted suggested values, then persists via the existing assignment
   * update endpoint (PUT /courses/{courseId}/assignments/{assignmentId}).
   *
   * Fields not explicitly accepted keep their original values.
   *
   * @see Requirement 5.9, 12
   */
  const saveChanges = useCallback(async (): Promise<void> => {
    if (!enhancement || !savedIds) {
      throw new Error('No enhancement data available. Call enhance() first.');
    }

    const { original, suggested } = enhancement;
    const { courseId, assignmentId, questionId } = savedIds;

    // Build the merged question using accepted fields
    const mergedQuestion = {
      question: acceptedFields.has('question')
        ? suggested.improved_question
        : original.question,
      options: acceptedFields.has('options')
        ? suggested.improved_options
        : original.options,
      points: acceptedFields.has('points')
        ? suggested.suggested_points
        : original.points,
    };

    setError(null);

    try {
      // Use the existing assignment update endpoint.
      // The payload wraps the updated question under a `questions` array
      // keyed by the question ID so the backend can identify which question
      // to update.
      await put(`/courses/${courseId}/assignments/${assignmentId}`, {
        questions: [
          {
            id: questionId,
            ...mergedQuestion,
          },
        ],
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [enhancement, savedIds, acceptedFields]);

  /**
   * Resets all state back to initial values.
   *
   * @see Requirement 12
   */
  const reset = useCallback((): void => {
    setEnhancement(null);
    setIsEnhancing(false);
    setError(null);
    setAcceptedFields(new Set());
    setRejectedFields(new Set());
    setSavedIds(null);
  }, []);

  // ── Return ───────────────────────────────────────────────────────────────

  return {
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
  };
}

export default useQuestionEnhancement;
