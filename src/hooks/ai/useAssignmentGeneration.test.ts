/**
 * Unit tests for useAssignmentGeneration hook
 *
 * Validates: Requirements 21 (3 – unit tests for state management hooks)
 *
 * Covers:
 *  - Initial state is correct
 *  - generate: loading transitions, success, error, rate-limit
 *  - updateQuestion: immutably updates a question
 *  - updateOption: immutably updates an option text
 *  - updatePoints: immutably updates question points
 *  - validatePoints: returns true when sum equals max_score, false otherwise
 *  - saveAssignment: validates then calls assignmentService.createAssignment
 *  - reset: clears all state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAssignmentGeneration } from './useAssignmentGeneration';
import type {
  GeneratedAssignment,
  GenerateAssignmentParams,
} from '../../services/ai/types';
import { AiRateLimitError } from '../../services/ai/errors';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/services/ai/aiApiClient', () => ({
  aiApiClient: {
    generateAssignment: vi.fn(),
  },
}));

vi.mock('@/services/api/assignmentService', () => ({
  assignmentService: {
    createAssignment: vi.fn(),
  },
}));

vi.mock('@/utils/ai/performanceMonitor', () => ({
  performanceMonitor: {
    measureOperation: vi.fn(() => vi.fn()),
  },
}));

import { aiApiClient } from '@/services/ai/aiApiClient';
import { assignmentService } from '@/services/api/assignmentService';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const COURSE_ID = '10';

const PARAMS: GenerateAssignmentParams = {
  lesson_id: '5',
  num_questions: 3,
  max_score: 30,
  difficulty: 'medium',
};

function makeGeneratedAssignment(
  numQuestions = 3,
  pointsEach = 10
): GeneratedAssignment {
  return {
    generation_id: 'gen-1',
    lesson_id: '5',
    rubric: 'Grade based on accuracy.',
    questions: Array.from({ length: numQuestions }, (_, i) => ({
      text: `Question ${i + 1}`,
      type: 'multiple_choice',
      points: pointsEach,
      options: [
        { text: 'Option A', is_correct: true },
        { text: 'Option B', is_correct: false },
      ],
    })),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAssignmentGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with null assignment and all flags false', () => {
      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      expect(result.current.generatedAssignment).toBeNull();
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.rateLimitRetryAfter).toBeNull();
      expect(result.current.validationError).toBeNull();
    });
  });

  // ── generate ──────────────────────────────────────────────────────────────

  describe('generate', () => {
    it('sets generatedAssignment on success', async () => {
      const assignment = makeGeneratedAssignment();
      vi.mocked(aiApiClient.generateAssignment).mockResolvedValueOnce(
        assignment
      );

      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      await act(async () => {
        await result.current.generate(PARAMS);
      });

      expect(result.current.generatedAssignment).toEqual(assignment);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('calls aiApiClient.generateAssignment with correct arguments', async () => {
      vi.mocked(aiApiClient.generateAssignment).mockResolvedValueOnce(
        makeGeneratedAssignment()
      );

      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      await act(async () => {
        await result.current.generate(PARAMS);
      });

      expect(aiApiClient.generateAssignment).toHaveBeenCalledWith(
        COURSE_ID,
        PARAMS
      );
    });

    it('sets isGenerating true during generation and false after', async () => {
      let resolve!: (v: GeneratedAssignment) => void;
      const pending = new Promise<GeneratedAssignment>((res) => {
        resolve = res;
      });
      vi.mocked(aiApiClient.generateAssignment).mockReturnValueOnce(
        pending as any
      );

      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      act(() => {
        void result.current.generate(PARAMS);
      });

      // isGenerating should be true while pending
      expect(result.current.isGenerating).toBe(true);

      await act(async () => {
        resolve(makeGeneratedAssignment());
      });

      expect(result.current.isGenerating).toBe(false);
    });

    it('sets error state when generation fails', async () => {
      vi.mocked(aiApiClient.generateAssignment).mockRejectedValueOnce(
        new Error('AI unavailable')
      );

      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      await act(async () => {
        await result.current.generate(PARAMS);
      });

      expect(result.current.error?.message).toBe('AI unavailable');
      expect(result.current.generatedAssignment).toBeNull();
    });

    it('sets rateLimitRetryAfter on rate-limit error', async () => {
      vi.mocked(aiApiClient.generateAssignment).mockRejectedValueOnce(
        new AiRateLimitError(1700000000, 'Rate limited')
      );

      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      await act(async () => {
        await result.current.generate(PARAMS);
      });

      expect(result.current.rateLimitRetryAfter).toBe(1700000000);
    });
  });

  // ── updateQuestion ────────────────────────────────────────────────────────

  describe('updateQuestion', () => {
    it('updates the text of a question at the given index', async () => {
      vi.mocked(aiApiClient.generateAssignment).mockResolvedValueOnce(
        makeGeneratedAssignment()
      );

      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      await act(async () => {
        await result.current.generate(PARAMS);
      });

      act(() => {
        result.current.updateQuestion(0, { text: 'Updated question text' });
      });

      expect(result.current.generatedAssignment?.questions[0].text).toBe(
        'Updated question text'
      );
      // Other questions unchanged
      expect(result.current.generatedAssignment?.questions[1].text).toBe(
        'Question 2'
      );
    });

    it('does nothing when generatedAssignment is null', () => {
      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      act(() => {
        result.current.updateQuestion(0, { text: 'Should not crash' });
      });

      expect(result.current.generatedAssignment).toBeNull();
    });
  });

  // ── updateOption ──────────────────────────────────────────────────────────

  describe('updateOption', () => {
    it('updates the text of a specific option', async () => {
      vi.mocked(aiApiClient.generateAssignment).mockResolvedValueOnce(
        makeGeneratedAssignment()
      );

      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      await act(async () => {
        await result.current.generate(PARAMS);
      });

      act(() => {
        result.current.updateOption(0, 1, 'New Option B text');
      });

      expect(
        result.current.generatedAssignment?.questions[0].options[1].text
      ).toBe('New Option B text');
      // Other option unchanged
      expect(
        result.current.generatedAssignment?.questions[0].options[0].text
      ).toBe('Option A');
    });

    it('does nothing when generatedAssignment is null', () => {
      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      act(() => {
        result.current.updateOption(0, 0, 'Should not crash');
      });

      expect(result.current.generatedAssignment).toBeNull();
    });
  });

  // ── updatePoints ──────────────────────────────────────────────────────────

  describe('updatePoints', () => {
    it('updates the points of a specific question', async () => {
      vi.mocked(aiApiClient.generateAssignment).mockResolvedValueOnce(
        makeGeneratedAssignment(3, 10)
      );

      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      await act(async () => {
        await result.current.generate(PARAMS);
      });

      act(() => {
        result.current.updatePoints(1, 15);
      });

      expect(result.current.generatedAssignment?.questions[1].points).toBe(15);
      // Other questions unchanged
      expect(result.current.generatedAssignment?.questions[0].points).toBe(10);
    });
  });

  // ── validatePoints ────────────────────────────────────────────────────────

  describe('validatePoints', () => {
    it('returns true when sum of points equals max_score', async () => {
      // 3 questions × 10 points = 30 = max_score
      vi.mocked(aiApiClient.generateAssignment).mockResolvedValueOnce(
        makeGeneratedAssignment(3, 10)
      );

      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      await act(async () => {
        await result.current.generate(PARAMS);
      });

      let isValid!: boolean;
      act(() => {
        isValid = result.current.validatePoints();
      });

      expect(isValid).toBe(true);
      expect(result.current.validationError).toBeNull();
    });

    it('returns false and sets validationError when sum does not match', async () => {
      vi.mocked(aiApiClient.generateAssignment).mockResolvedValueOnce(
        makeGeneratedAssignment(3, 10)
      );

      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      await act(async () => {
        await result.current.generate(PARAMS);
      });

      // Change one question's points so sum (35) ≠ max_score (30)
      act(() => {
        result.current.updatePoints(0, 15);
      });

      let isValid!: boolean;
      act(() => {
        isValid = result.current.validatePoints();
      });

      expect(isValid).toBe(false);
      expect(result.current.validationError).toContain('35');
      expect(result.current.validationError).toContain('30');
    });

    it('returns false when no assignment has been generated', () => {
      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      let isValid!: boolean;
      act(() => {
        isValid = result.current.validatePoints();
      });

      expect(isValid).toBe(false);
      expect(result.current.validationError).toBeTruthy();
    });
  });

  // ── saveAssignment ────────────────────────────────────────────────────────

  describe('saveAssignment', () => {
    it('calls assignmentService.createAssignment when points are valid', async () => {
      vi.mocked(aiApiClient.generateAssignment).mockResolvedValueOnce(
        makeGeneratedAssignment(3, 10)
      );
      vi.mocked(assignmentService.createAssignment).mockResolvedValueOnce({});

      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      await act(async () => {
        await result.current.generate(PARAMS);
      });
      await act(async () => {
        await result.current.saveAssignment();
      });

      expect(assignmentService.createAssignment).toHaveBeenCalledWith(
        COURSE_ID,
        expect.objectContaining({ max_score: 30 })
      );
    });

    it('throws when points validation fails', async () => {
      vi.mocked(aiApiClient.generateAssignment).mockResolvedValueOnce(
        makeGeneratedAssignment(3, 10)
      );

      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      await act(async () => {
        await result.current.generate(PARAMS);
      });

      // Make points invalid
      act(() => {
        result.current.updatePoints(0, 20);
      });

      await expect(
        act(async () => {
          await result.current.saveAssignment();
        })
      ).rejects.toThrow();
    });

    it('throws when no assignment has been generated', async () => {
      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      await expect(
        act(async () => {
          await result.current.saveAssignment();
        })
      ).rejects.toThrow('No assignment has been generated yet.');
    });
  });

  // ── reset ─────────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('clears all state back to initial values', async () => {
      vi.mocked(aiApiClient.generateAssignment).mockResolvedValueOnce(
        makeGeneratedAssignment()
      );

      const { result } = renderHook(() => useAssignmentGeneration(COURSE_ID));

      await act(async () => {
        await result.current.generate(PARAMS);
      });

      expect(result.current.generatedAssignment).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.generatedAssignment).toBeNull();
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.rateLimitRetryAfter).toBeNull();
      expect(result.current.validationError).toBeNull();
    });
  });
});
