/**
 * Authorization handler for AI features.
 *
 * Implements role-based access control (RBAC) for all AI features,
 * with a 5-minute in-memory cache to avoid redundant permission checks.
 *
 * Authorization rules:
 *   - Q&A / History : role === 'student' AND courseId in enrolledCourseIds
 *   - Generation    : role === 'teacher' AND courseId in teachingCourseIds
 *   - Enhancement   : role === 'teacher' AND courseId in teachingCourseIds
 *   - Pre-grading   : role === 'teacher' AND courseId in teachingCourseIds
 *   - Statistics    : role === 'admin'
 *
 * @see Requirements 14
 */

import type { AiFeature } from '@/services/ai/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Lowercase role identifiers used by the authorization handler. */
export type UserRole = 'student' | 'teacher' | 'admin';

/**
 * Minimal user context required to perform authorization checks.
 * Mirrors the shape of the authenticated user but only includes
 * the fields needed for RBAC decisions.
 */
export interface UserContext {
  /** Unique user identifier. */
  id: string | number;
  /** The user's role in the system. */
  role: UserRole;
  /** IDs of courses the student is enrolled in (relevant for students). */
  enrolledCourseIds?: (string | number)[];
  /** IDs of courses the teacher is assigned to (relevant for teachers). */
  teachingCourseIds?: (string | number)[];
}

/** Optional context passed alongside a feature check. */
export interface AuthorizationContext {
  /** Course ID relevant to the feature being checked. */
  courseId?: string | number;
  /** Lesson ID relevant to the feature being checked. */
  lessonId?: string | number;
}

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

/** Duration (ms) for which a cached authorization result is considered valid. */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  result: boolean;
  expiresAt: number;
}

/**
 * Build a composite cache key from the user, feature, and optional context.
 *
 * @example
 * buildCacheKey({ id: 1, role: 'student' }, 'qa', { courseId: 42 })
 * // → "1:student:qa:42:"
 */
function buildCacheKey(
  user: UserContext,
  feature: AiFeature,
  context?: AuthorizationContext
): string {
  return [
    user.id,
    user.role,
    feature,
    context?.courseId ?? '',
    context?.lessonId ?? '',
  ].join(':');
}

// ---------------------------------------------------------------------------
// AuthorizationHandler
// ---------------------------------------------------------------------------

/**
 * Handles role-based access control for all AI features.
 *
 * Results are cached for 5 minutes using a `Map` keyed by a composite string
 * of `userId:role:feature:courseId:lessonId`.
 *
 * @example
 * ```ts
 * import { authorizationHandler } from '@/utils/ai/authorizationHandler';
 *
 * const user: UserContext = { id: 1, role: 'student', enrolledCourseIds: [10] };
 *
 * if (authorizationHandler.isAuthorized(user, 'qa', { courseId: 10 })) {
 *   // proceed with Q&A
 * }
 * ```
 */
export class AuthorizationHandler {
  private readonly cache = new Map<string, CacheEntry>();

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Check if a user can access a specific AI feature.
   * Results are cached for 5 minutes.
   *
   * @param user    - The authenticated user context.
   * @param feature - The AI feature being accessed.
   * @param context - Optional course/lesson context for the check.
   * @returns `true` if the user is authorized, `false` otherwise.
   */
  isAuthorized(
    user: UserContext,
    feature: AiFeature,
    context?: AuthorizationContext
  ): boolean {
    const key = buildCacheKey(user, feature, context);
    const cached = this.cache.get(key);

    if (cached && Date.now() < cached.expiresAt) {
      return cached.result;
    }

    const result = this.computeAuthorization(user, feature, context);
    this.cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  }

  /**
   * Check if a student can use the Q&A feature for a given course.
   * The student must be enrolled in the course.
   *
   * @param user     - The authenticated user context.
   * @param courseId - The course to check enrollment for.
   * @returns `true` if the student is enrolled in the course.
   */
  canStudentAsk(user: UserContext, courseId: string | number): boolean {
    return this.isAuthorized(user, 'qa', { courseId });
  }

  /**
   * Check if a teacher can generate assignments for a given course.
   * The teacher must be assigned to teach the course.
   *
   * @param user     - The authenticated user context.
   * @param courseId - The course to check teaching assignment for.
   * @returns `true` if the teacher teaches the course.
   */
  canTeacherGenerate(user: UserContext, courseId: string | number): boolean {
    return this.isAuthorized(user, 'generation', { courseId });
  }

  /**
   * Check if a teacher can enhance questions for a given course.
   * The teacher must be assigned to teach the course.
   *
   * @param user     - The authenticated user context.
   * @param courseId - The course to check teaching assignment for.
   * @returns `true` if the teacher teaches the course.
   */
  canTeacherEnhance(user: UserContext, courseId: string | number): boolean {
    return this.isAuthorized(user, 'enhancement', { courseId });
  }

  /**
   * Check if a teacher can view pre-grades for a given course.
   * The teacher must be assigned to teach the course.
   *
   * @param user     - The authenticated user context.
   * @param courseId - The course to check teaching assignment for.
   * @returns `true` if the teacher teaches the course.
   */
  canTeacherPreGrade(user: UserContext, courseId: string | number): boolean {
    return this.isAuthorized(user, 'preGrading', { courseId });
  }

  /**
   * Check if a user can view AI usage statistics.
   * Only admins are allowed.
   *
   * @param user - The authenticated user context.
   * @returns `true` if the user has the admin role.
   */
  canViewStatistics(user: UserContext): boolean {
    return this.isAuthorized(user, 'statistics');
  }

  /**
   * Clear all cached authorization results.
   * Useful after a user's role or enrollment changes.
   */
  clearCache(): void {
    this.cache.clear();
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Compute the authorization result without consulting the cache.
   */
  private computeAuthorization(
    user: UserContext,
    feature: AiFeature,
    context?: AuthorizationContext
  ): boolean {
    switch (feature) {
      case 'qa':
      case 'history':
        return this.checkStudentCourseAccess(user, context?.courseId);

      case 'generation':
      case 'enhancement':
      case 'preGrading':
        return this.checkTeacherCourseAccess(user, context?.courseId);

      case 'statistics':
        return user.role === 'admin';

      default:
        return false;
    }
  }

  /**
   * Verify that the user is a student enrolled in the given course.
   *
   * @param user     - The user context.
   * @param courseId - The course to check. If undefined, returns false.
   */
  private checkStudentCourseAccess(
    user: UserContext,
    courseId: string | number | undefined
  ): boolean {
    if (user.role !== 'student') return false;
    if (courseId === undefined || courseId === null) return false;

    const enrolled = user.enrolledCourseIds ?? [];
    return enrolled.some((id) => String(id) === String(courseId));
  }

  /**
   * Verify that the user is a teacher assigned to the given course.
   *
   * @param user     - The user context.
   * @param courseId - The course to check. If undefined, returns false.
   */
  private checkTeacherCourseAccess(
    user: UserContext,
    courseId: string | number | undefined
  ): boolean {
    if (user.role !== 'teacher') return false;
    if (courseId === undefined || courseId === null) return false;

    const teaching = user.teachingCourseIds ?? [];
    return teaching.some((id) => String(id) === String(courseId));
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

/**
 * Shared singleton instance of the authorization handler.
 * Import this in hooks and components instead of creating new instances.
 *
 * @example
 * ```ts
 * import { authorizationHandler } from '@/utils/ai/authorizationHandler';
 * ```
 */
export const authorizationHandler = new AuthorizationHandler();
