/**
 * usePreGrade Hook
 *
 * Manages pre-grade state for teacher review of AI-generated submission scores.
 * Provides fetch, update, save, re-grade, and reset capabilities.
 *
 * @module hooks/ai/usePreGrade
 * @see Requirements 6, 12
 */

import { useState, useCallback } from 'react';
import { aiApiClient } from '@/services/ai/aiApiClient';
import type { PreGrade } from '@/services/ai/types';
import { API_BASE_URL, getAuthToken } from '@/services/api/apiClient';
import { performanceMonitor } from '@/utils/ai/performanceMonitor';

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UsePreGradeReturn {
  /** The fetched pre-grade result, or null if not yet loaded. */
  preGrade: PreGrade | null;
  /** Whether a fetch or re-grade operation is in progress. */
  isLoading: boolean;
  /** The current error, if any. */
  error: Error | null;
  /** Teacher-overridden score (null means accept AI score). */
  overrideScore: number | null;
  /** Teacher's rationale for overriding the score. */
  overrideRationale: string;
  /**
   * Fetch the pre-grade for a submission.
   *
   * @param courseId     - Course identifier
   * @param assignmentId - Assignment identifier
   * @param submissionId - Submission identifier
   */
  fetchPreGrade: (
    courseId: string | number,
    assignmentId: string | number,
    submissionId: string | number
  ) => Promise<void>;
  /**
   * Update the teacher's score override and rationale in local state.
   * Does not persist to the server — call saveGrade() to persist.
   *
   * @param newScore  - The teacher's custom score
   * @param rationale - Explanation for the override
   */
  updateScore: (newScore: number, rationale: string) => void;
  /**
   * Save the final grade via the existing submission grading endpoint.
   * Uses overrideScore if set, otherwise falls back to preGrade.total_score.
   *
   * Endpoint: PUT /courses/{course}/assignments/{assignment}/submissions/{submission}
   */
  saveGrade: () => Promise<void>;
  /**
   * Trigger a new AI pre-grading job for the submission, then fetch the
   * updated pre-grade result.
   *
   * @param courseId     - Course identifier
   * @param assignmentId - Assignment identifier
   * @param submissionId - Submission identifier
   */
  reGrade: (
    courseId: string | number,
    assignmentId: string | number,
    submissionId: string | number
  ) => Promise<void>;
  /** Reset all state to initial values. */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const INITIAL_STATE = {
  preGrade: null as PreGrade | null,
  isLoading: false,
  error: null as Error | null,
  overrideScore: null as number | null,
  overrideRationale: '',
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Custom hook for managing pre-grade state in the teacher's submission review.
 *
 * Usage:
 * ```tsx
 * const {
 *   preGrade,
 *   isLoading,
 *   error,
 *   overrideScore,
 *   overrideRationale,
 *   fetchPreGrade,
 *   updateScore,
 *   saveGrade,
 *   reGrade,
 *   reset,
 * } = usePreGrade();
 *
 * // Fetch the pre-grade when the component mounts
 * useEffect(() => {
 *   fetchPreGrade(courseId, assignmentId, submissionId);
 * }, [courseId, assignmentId, submissionId]);
 * ```
 *
 * @returns UsePreGradeReturn
 * @see Requirements 6, 12
 */
export function usePreGrade(): UsePreGradeReturn {
  const [preGrade, setPreGrade] = useState<PreGrade | null>(
    INITIAL_STATE.preGrade
  );
  const [isLoading, setIsLoading] = useState<boolean>(INITIAL_STATE.isLoading);
  const [error, setError] = useState<Error | null>(INITIAL_STATE.error);
  const [overrideScore, setOverrideScore] = useState<number | null>(
    INITIAL_STATE.overrideScore
  );
  const [overrideRationale, setOverrideRationale] = useState<string>(
    INITIAL_STATE.overrideRationale
  );

  // Store the last-used IDs so saveGrade() can reference them without
  // requiring the caller to pass them again.
  const [savedIds, setSavedIds] = useState<{
    courseId: string | number;
    assignmentId: string | number;
    submissionId: string | number;
  } | null>(null);

  // -------------------------------------------------------------------------
  // fetchPreGrade
  // -------------------------------------------------------------------------

  const fetchPreGrade = useCallback(
    async (
      courseId: string | number,
      assignmentId: string | number,
      submissionId: string | number
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);

      const doneFetch = performanceMonitor.measureOperation('fetchPreGrade');

      try {
        const result = await aiApiClient.getPreGrade(
          courseId,
          assignmentId,
          submissionId
        );
        setPreGrade(result);
        setSavedIds({ courseId, assignmentId, submissionId });
        doneFetch();
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // -------------------------------------------------------------------------
  // updateScore
  // -------------------------------------------------------------------------

  const updateScore = useCallback(
    (newScore: number, rationale: string): void => {
      setOverrideScore(newScore);
      setOverrideRationale(rationale);
    },
    []
  );

  // -------------------------------------------------------------------------
  // saveGrade
  // -------------------------------------------------------------------------

  /**
   * Saves the final grade via the existing submission update endpoint.
   *
   * The score used is:
   *   - overrideScore  — if the teacher has set a custom score
   *   - preGrade.total_score — otherwise (accept AI score)
   *
   * Endpoint: PUT /api/courses/{course}/assignments/{assignment}/submissions/{submission}
   */
  const saveGrade = useCallback(async (): Promise<void> => {
    if (!savedIds) {
      throw new Error(
        'No submission loaded. Call fetchPreGrade() before saveGrade().'
      );
    }

    if (!preGrade && overrideScore === null) {
      throw new Error('No pre-grade or override score available to save.');
    }

    const finalScore =
      overrideScore !== null ? overrideScore : preGrade!.total_score;

    setIsLoading(true);
    setError(null);

    try {
      const { courseId, assignmentId, submissionId } = savedIds;
      const url = `${API_BASE_URL}/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}`;

      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const body: Record<string, unknown> = {
        score: finalScore,
      };
      if (overrideRationale) {
        body.rationale = overrideRationale;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(
          errorData.message ?? `Failed to save grade: HTTP ${response.status}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [savedIds, preGrade, overrideScore, overrideRationale]);

  // -------------------------------------------------------------------------
  // reGrade
  // -------------------------------------------------------------------------

  /**
   * Triggers a new AI pre-grading job and then fetches the updated result.
   *
   * The backend returns 202 Accepted when the job is queued.  After queuing,
   * we immediately attempt to fetch the updated pre-grade.  In production you
   * may want to poll until the job completes; for now a single fetch after
   * triggering is sufficient per the spec.
   */
  const reGrade = useCallback(
    async (
      courseId: string | number,
      assignmentId: string | number,
      submissionId: string | number
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);

      const doneReGrade =
        performanceMonitor.measureOperation('reGradeSubmission');

      try {
        // Trigger the new pre-grading job (202 Accepted)
        await aiApiClient.preGradeSubmission(
          courseId,
          assignmentId,
          submissionId
        );

        // Fetch the updated pre-grade result
        const result = await aiApiClient.getPreGrade(
          courseId,
          assignmentId,
          submissionId
        );
        setPreGrade(result);
        setSavedIds({ courseId, assignmentId, submissionId });

        // Clear any previous override when re-grading
        setOverrideScore(null);
        setOverrideRationale('');

        doneReGrade();
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // -------------------------------------------------------------------------
  // reset
  // -------------------------------------------------------------------------

  const reset = useCallback((): void => {
    setPreGrade(INITIAL_STATE.preGrade);
    setIsLoading(INITIAL_STATE.isLoading);
    setError(INITIAL_STATE.error);
    setOverrideScore(INITIAL_STATE.overrideScore);
    setOverrideRationale(INITIAL_STATE.overrideRationale);
    setSavedIds(null);
  }, []);

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------

  return {
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
  };
}

export default usePreGrade;
