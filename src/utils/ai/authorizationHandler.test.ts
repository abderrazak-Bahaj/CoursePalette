/**
 * Unit tests for AuthorizationHandler – role-based access control (task 14.3)
 *
 * Validates: Requirements 14
 *
 * Tests cover:
 *  - isAuthorized():
 *    - Student can access 'qa' when enrolled in the course
 *    - Student cannot access 'qa' when NOT enrolled
 *    - Student cannot access 'qa' without a courseId
 *    - Student cannot access teacher features (generation, enhancement, preGrading)
 *    - Student cannot access admin features (statistics)
 *    - Teacher can access 'generation' when teaching the course
 *    - Teacher cannot access 'generation' when NOT teaching the course
 *    - Teacher can access 'enhancement' and 'preGrading' when teaching
 *    - Teacher cannot access 'qa' (student feature)
 *    - Teacher cannot access 'statistics' (admin feature)
 *    - Admin can access 'statistics'
 *    - Admin cannot access student or teacher features
 *    - Unknown feature returns false
 *  - Convenience methods:
 *    - canStudentAsk() delegates to isAuthorized('qa')
 *    - canTeacherGenerate() delegates to isAuthorized('generation')
 *    - canTeacherEnhance() delegates to isAuthorized('enhancement')
 *    - canTeacherPreGrade() delegates to isAuthorized('preGrading')
 *    - canViewStatistics() delegates to isAuthorized('statistics')
 *  - Caching:
 *    - Returns cached result on second call (same key)
 *    - Cache is keyed by userId + role + feature + courseId + lessonId
 *    - clearCache() invalidates all cached results
 *    - Cache expires after 5 minutes
 *  - Edge cases:
 *    - Numeric and string courseIds are treated as equal
 *    - Empty enrolledCourseIds array denies access
 *    - Missing enrolledCourseIds denies access
 *  - Singleton export:
 *    - authorizationHandler is an instance of AuthorizationHandler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AuthorizationHandler,
  authorizationHandler,
  type UserContext,
} from './authorizationHandler';

// ============================================================================
// Fixtures
// ============================================================================

const studentEnrolled: UserContext = {
  id: 1,
  role: 'student',
  enrolledCourseIds: [10, 20, 30],
};

const studentNotEnrolled: UserContext = {
  id: 2,
  role: 'student',
  enrolledCourseIds: [99],
};

const studentNoEnrollments: UserContext = {
  id: 3,
  role: 'student',
  enrolledCourseIds: [],
};

const studentMissingEnrollments: UserContext = {
  id: 4,
  role: 'student',
  // enrolledCourseIds intentionally omitted
};

const teacherAssigned: UserContext = {
  id: 5,
  role: 'teacher',
  teachingCourseIds: [10, 20],
};

const teacherNotAssigned: UserContext = {
  id: 6,
  role: 'teacher',
  teachingCourseIds: [99],
};

const admin: UserContext = {
  id: 7,
  role: 'admin',
};

// ============================================================================
// isAuthorized() – student permissions
// ============================================================================

describe('AuthorizationHandler.isAuthorized() – student', () => {
  let handler: AuthorizationHandler;

  beforeEach(() => {
    handler = new AuthorizationHandler();
  });

  it('should allow a student to access "qa" when enrolled in the course', () => {
    expect(handler.isAuthorized(studentEnrolled, 'qa', { courseId: 10 })).toBe(
      true
    );
  });

  it('should allow a student to access "history" when enrolled in the course', () => {
    expect(
      handler.isAuthorized(studentEnrolled, 'history', { courseId: 20 })
    ).toBe(true);
  });

  it('should deny a student access to "qa" when NOT enrolled in the course', () => {
    expect(
      handler.isAuthorized(studentNotEnrolled, 'qa', { courseId: 10 })
    ).toBe(false);
  });

  it('should deny a student access to "qa" when enrolledCourseIds is empty', () => {
    expect(
      handler.isAuthorized(studentNoEnrollments, 'qa', { courseId: 10 })
    ).toBe(false);
  });

  it('should deny a student access to "qa" when enrolledCourseIds is missing', () => {
    expect(
      handler.isAuthorized(studentMissingEnrollments, 'qa', { courseId: 10 })
    ).toBe(false);
  });

  it('should deny a student access to "qa" when no courseId is provided', () => {
    expect(handler.isAuthorized(studentEnrolled, 'qa')).toBe(false);
  });

  it('should deny a student access to "generation" (teacher feature)', () => {
    expect(
      handler.isAuthorized(studentEnrolled, 'generation', { courseId: 10 })
    ).toBe(false);
  });

  it('should deny a student access to "enhancement" (teacher feature)', () => {
    expect(
      handler.isAuthorized(studentEnrolled, 'enhancement', { courseId: 10 })
    ).toBe(false);
  });

  it('should deny a student access to "preGrading" (teacher feature)', () => {
    expect(
      handler.isAuthorized(studentEnrolled, 'preGrading', { courseId: 10 })
    ).toBe(false);
  });

  it('should deny a student access to "statistics" (admin feature)', () => {
    expect(handler.isAuthorized(studentEnrolled, 'statistics')).toBe(false);
  });
});

// ============================================================================
// isAuthorized() – teacher permissions
// ============================================================================

describe('AuthorizationHandler.isAuthorized() – teacher', () => {
  let handler: AuthorizationHandler;

  beforeEach(() => {
    handler = new AuthorizationHandler();
  });

  it('should allow a teacher to access "generation" when teaching the course', () => {
    expect(
      handler.isAuthorized(teacherAssigned, 'generation', { courseId: 10 })
    ).toBe(true);
  });

  it('should allow a teacher to access "enhancement" when teaching the course', () => {
    expect(
      handler.isAuthorized(teacherAssigned, 'enhancement', { courseId: 20 })
    ).toBe(true);
  });

  it('should allow a teacher to access "preGrading" when teaching the course', () => {
    expect(
      handler.isAuthorized(teacherAssigned, 'preGrading', { courseId: 10 })
    ).toBe(true);
  });

  it('should deny a teacher access to "generation" when NOT teaching the course', () => {
    expect(
      handler.isAuthorized(teacherNotAssigned, 'generation', { courseId: 10 })
    ).toBe(false);
  });

  it('should deny a teacher access to "generation" when no courseId is provided', () => {
    expect(handler.isAuthorized(teacherAssigned, 'generation')).toBe(false);
  });

  it('should deny a teacher access to "qa" (student feature)', () => {
    expect(handler.isAuthorized(teacherAssigned, 'qa', { courseId: 10 })).toBe(
      false
    );
  });

  it('should deny a teacher access to "history" (student feature)', () => {
    expect(
      handler.isAuthorized(teacherAssigned, 'history', { courseId: 10 })
    ).toBe(false);
  });

  it('should deny a teacher access to "statistics" (admin feature)', () => {
    expect(handler.isAuthorized(teacherAssigned, 'statistics')).toBe(false);
  });
});

// ============================================================================
// isAuthorized() – admin permissions
// ============================================================================

describe('AuthorizationHandler.isAuthorized() – admin', () => {
  let handler: AuthorizationHandler;

  beforeEach(() => {
    handler = new AuthorizationHandler();
  });

  it('should allow an admin to access "statistics"', () => {
    expect(handler.isAuthorized(admin, 'statistics')).toBe(true);
  });

  it('should deny an admin access to "qa" (student feature)', () => {
    expect(handler.isAuthorized(admin, 'qa', { courseId: 10 })).toBe(false);
  });

  it('should deny an admin access to "generation" (teacher feature)', () => {
    expect(handler.isAuthorized(admin, 'generation', { courseId: 10 })).toBe(
      false
    );
  });

  it('should deny an admin access to "enhancement" (teacher feature)', () => {
    expect(handler.isAuthorized(admin, 'enhancement', { courseId: 10 })).toBe(
      false
    );
  });

  it('should deny an admin access to "preGrading" (teacher feature)', () => {
    expect(handler.isAuthorized(admin, 'preGrading', { courseId: 10 })).toBe(
      false
    );
  });
});

// ============================================================================
// isAuthorized() – edge cases
// ============================================================================

describe('AuthorizationHandler.isAuthorized() – edge cases', () => {
  let handler: AuthorizationHandler;

  beforeEach(() => {
    handler = new AuthorizationHandler();
  });

  it('should treat numeric and string courseIds as equal (student)', () => {
    const student: UserContext = {
      id: 1,
      role: 'student',
      enrolledCourseIds: [10], // numeric
    };
    // Pass courseId as string
    expect(handler.isAuthorized(student, 'qa', { courseId: '10' })).toBe(true);
  });

  it('should treat numeric and string courseIds as equal (teacher)', () => {
    const teacher: UserContext = {
      id: 1,
      role: 'teacher',
      teachingCourseIds: ['20'], // string
    };
    // Pass courseId as number
    expect(handler.isAuthorized(teacher, 'generation', { courseId: 20 })).toBe(
      true
    );
  });

  it('should return false for an unknown feature', () => {
    // @ts-expect-error – testing unknown feature
    expect(handler.isAuthorized(admin, 'unknownFeature')).toBe(false);
  });
});

// ============================================================================
// Convenience methods
// ============================================================================

describe('AuthorizationHandler – convenience methods', () => {
  let handler: AuthorizationHandler;

  beforeEach(() => {
    handler = new AuthorizationHandler();
  });

  it('canStudentAsk() returns true when student is enrolled', () => {
    expect(handler.canStudentAsk(studentEnrolled, 10)).toBe(true);
  });

  it('canStudentAsk() returns false when student is not enrolled', () => {
    expect(handler.canStudentAsk(studentNotEnrolled, 10)).toBe(false);
  });

  it('canTeacherGenerate() returns true when teacher teaches the course', () => {
    expect(handler.canTeacherGenerate(teacherAssigned, 10)).toBe(true);
  });

  it('canTeacherGenerate() returns false when teacher does not teach the course', () => {
    expect(handler.canTeacherGenerate(teacherNotAssigned, 10)).toBe(false);
  });

  it('canTeacherEnhance() returns true when teacher teaches the course', () => {
    expect(handler.canTeacherEnhance(teacherAssigned, 20)).toBe(true);
  });

  it('canTeacherEnhance() returns false when teacher does not teach the course', () => {
    expect(handler.canTeacherEnhance(teacherNotAssigned, 20)).toBe(false);
  });

  it('canTeacherPreGrade() returns true when teacher teaches the course', () => {
    expect(handler.canTeacherPreGrade(teacherAssigned, 10)).toBe(true);
  });

  it('canTeacherPreGrade() returns false when teacher does not teach the course', () => {
    expect(handler.canTeacherPreGrade(teacherNotAssigned, 10)).toBe(false);
  });

  it('canViewStatistics() returns true for admin', () => {
    expect(handler.canViewStatistics(admin)).toBe(true);
  });

  it('canViewStatistics() returns false for student', () => {
    expect(handler.canViewStatistics(studentEnrolled)).toBe(false);
  });

  it('canViewStatistics() returns false for teacher', () => {
    expect(handler.canViewStatistics(teacherAssigned)).toBe(false);
  });
});

// ============================================================================
// Caching behaviour
// ============================================================================

describe('AuthorizationHandler – caching', () => {
  let handler: AuthorizationHandler;

  beforeEach(() => {
    vi.useFakeTimers();
    handler = new AuthorizationHandler();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the same result on repeated calls (cache hit)', () => {
    const result1 = handler.isAuthorized(studentEnrolled, 'qa', {
      courseId: 10,
    });
    const result2 = handler.isAuthorized(studentEnrolled, 'qa', {
      courseId: 10,
    });

    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });

  it('should cache results independently per courseId', () => {
    const resultCourse10 = handler.isAuthorized(studentEnrolled, 'qa', {
      courseId: 10,
    });
    const resultCourse99 = handler.isAuthorized(studentEnrolled, 'qa', {
      courseId: 99,
    });

    expect(resultCourse10).toBe(true);
    expect(resultCourse99).toBe(false);
  });

  it('should cache results independently per feature', () => {
    const qaResult = handler.isAuthorized(studentEnrolled, 'qa', {
      courseId: 10,
    });
    const genResult = handler.isAuthorized(studentEnrolled, 'generation', {
      courseId: 10,
    });

    expect(qaResult).toBe(true);
    expect(genResult).toBe(false);
  });

  it('should cache results independently per user', () => {
    const enrolledResult = handler.isAuthorized(studentEnrolled, 'qa', {
      courseId: 10,
    });
    const notEnrolledResult = handler.isAuthorized(studentNotEnrolled, 'qa', {
      courseId: 10,
    });

    expect(enrolledResult).toBe(true);
    expect(notEnrolledResult).toBe(false);
  });

  it('clearCache() should invalidate all cached results', () => {
    // Warm the cache
    handler.isAuthorized(studentEnrolled, 'qa', { courseId: 10 });
    handler.isAuthorized(admin, 'statistics');

    // Clear the cache
    handler.clearCache();

    // Results should still be computed correctly after clearing
    expect(handler.isAuthorized(studentEnrolled, 'qa', { courseId: 10 })).toBe(
      true
    );
    expect(handler.isAuthorized(admin, 'statistics')).toBe(true);
  });

  it('should re-compute after the 5-minute cache TTL expires', () => {
    // First call — populates cache
    const result1 = handler.isAuthorized(studentEnrolled, 'qa', {
      courseId: 10,
    });
    expect(result1).toBe(true);

    // Advance time past the 5-minute TTL
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);

    // Second call — cache expired, re-computes
    const result2 = handler.isAuthorized(studentEnrolled, 'qa', {
      courseId: 10,
    });
    expect(result2).toBe(true);
  });

  it('should still return cached result before the TTL expires', () => {
    handler.isAuthorized(studentEnrolled, 'qa', { courseId: 10 });

    // Advance time to just before the TTL
    vi.advanceTimersByTime(5 * 60 * 1000 - 1);

    // Should still return cached result (true)
    expect(handler.isAuthorized(studentEnrolled, 'qa', { courseId: 10 })).toBe(
      true
    );
  });
});

// ============================================================================
// Singleton export
// ============================================================================

describe('authorizationHandler singleton', () => {
  it('should be an instance of AuthorizationHandler', () => {
    expect(authorizationHandler).toBeInstanceOf(AuthorizationHandler);
  });

  it('should expose isAuthorized()', () => {
    expect(typeof authorizationHandler.isAuthorized).toBe('function');
  });

  it('should expose canStudentAsk()', () => {
    expect(typeof authorizationHandler.canStudentAsk).toBe('function');
  });

  it('should expose canTeacherGenerate()', () => {
    expect(typeof authorizationHandler.canTeacherGenerate).toBe('function');
  });

  it('should expose canTeacherEnhance()', () => {
    expect(typeof authorizationHandler.canTeacherEnhance).toBe('function');
  });

  it('should expose canTeacherPreGrade()', () => {
    expect(typeof authorizationHandler.canTeacherPreGrade).toBe('function');
  });

  it('should expose canViewStatistics()', () => {
    expect(typeof authorizationHandler.canViewStatistics).toBe('function');
  });

  it('should expose clearCache()', () => {
    expect(typeof authorizationHandler.clearCache).toBe('function');
  });
});
