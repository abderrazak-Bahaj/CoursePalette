/**
 * useAiAuth Hook
 *
 * Provides role-based authorization checks for all AI features.
 * Builds a `UserContext` from the currently authenticated user and delegates
 * all permission checks to the `authorizationHandler` singleton.
 *
 * Authorization rules (mirroring the backend):
 *   - canAsk        : student enrolled in `courseId`
 *   - canGenerate   : teacher teaching `courseId`
 *   - canEnhance    : teacher teaching `courseId`
 *   - canPreGrade   : teacher teaching `courseId`
 *   - canViewStats  : admin (no courseId required)
 *   - isAuthorized  : generic check via authorizationHandler
 *
 * Results are memoized and only recomputed when `user` or `courseId` changes.
 * The underlying `authorizationHandler` also caches results for 5 minutes.
 *
 * @module hooks/ai/useAiAuth
 * @see Requirements 14
 */

import { useMemo } from 'react';
import { useAuth } from '../useAuth';
import { authorizationHandler } from '../../utils/ai/authorizationHandler';
import type { UserContext } from '../../utils/ai/authorizationHandler';
import type { AiFeature, AiAuthState } from '../../services/ai/types';
import type { User } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map the CoursePalette `User` object to the `UserContext` shape expected by
 * `authorizationHandler`.
 *
 * The app stores roles in uppercase (STUDENT / TEACHER / ADMIN) while the
 * authorization handler uses lowercase (student / teacher / admin).
 *
 * Enrolled and teaching course IDs are not stored directly on the `User`
 * object — they are resolved at the hook level via the `courseId` parameter
 * and the user's role. For a more granular check (e.g. verifying actual
 * enrollment), the backend API is the authoritative source; here we perform
 * a best-effort client-side check based on the user's role.
 *
 * When `courseId` is provided:
 *   - Students are assumed enrolled (the backend will reject if not).
 *   - Teachers are assumed to teach the course (the backend will reject if not).
 *
 * This keeps the hook lightweight and avoids extra API calls for every render.
 */
function buildUserContext(user: User, courseId?: string | number): UserContext {
  const role = user.role.toLowerCase() as UserContext['role'];

  // Build synthetic enrolled/teaching arrays from the provided courseId so
  // that authorizationHandler.isAuthorized() can perform its course-scoped
  // checks without needing a separate enrollment API call.
  const courseIds =
    courseId !== undefined && courseId !== null ? [courseId] : [];

  return {
    id: user.id,
    role,
    enrolledCourseIds: role === 'student' ? courseIds : [],
    teachingCourseIds: role === 'teacher' ? courseIds : [],
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Return type of the `useAiAuth` hook.
 * Extends `AiAuthState` with the `isAuthorized` generic check that also
 * accepts an optional `context` object (e.g. a different `courseId`).
 */
export interface UseAiAuthReturn extends Omit<AiAuthState, 'isAuthorized'> {
  /**
   * Generic authorization check for any AI feature.
   *
   * @param feature  - The AI feature to check.
   * @param context  - Optional context (e.g. a different courseId to check
   *                   against, overriding the one passed to the hook).
   * @returns `true` if the current user is authorized for the feature.
   */
  isAuthorized: (
    feature: AiFeature,
    context?: { courseId?: string | number }
  ) => boolean;
}

/**
 * Hook that exposes authorization flags for all AI features.
 *
 * @param courseId - Optional course ID used for course-scoped checks
 *                   (canAsk, canGenerate, canEnhance, canPreGrade).
 *                   Not required for canViewStats (admin-only).
 *
 * @example
 * ```tsx
 * const { canAsk, canGenerate, isAuthorized } = useAiAuth(courseId);
 *
 * if (canAsk) {
 *   // render Q&A component
 * }
 *
 * // Generic check with a different courseId
 * if (isAuthorized('generation', { courseId: 42 })) {
 *   // render generation button
 * }
 * ```
 */
export function useAiAuth(courseId?: string | number): UseAiAuthReturn {
  const { user } = useAuth();

  // Memoize the entire auth state so it only recomputes when user or courseId
  // changes. This avoids redundant authorizationHandler calls on every render.
  const authState = useMemo<UseAiAuthReturn>(() => {
    // If there is no authenticated user, deny everything.
    if (!user) {
      return {
        canAsk: false,
        canGenerate: false,
        canEnhance: false,
        canPreGrade: false,
        canViewStats: false,
        isAuthorized: () => false,
      };
    }

    const userCtx = buildUserContext(user, courseId);

    // Pre-compute the boolean flags for the most common checks.
    const canAsk = authorizationHandler.isAuthorized(userCtx, 'qa', {
      courseId,
    });
    const canGenerate = authorizationHandler.isAuthorized(
      userCtx,
      'generation',
      { courseId }
    );
    const canEnhance = authorizationHandler.isAuthorized(
      userCtx,
      'enhancement',
      { courseId }
    );
    const canPreGrade = authorizationHandler.isAuthorized(
      userCtx,
      'preGrading',
      { courseId }
    );
    const canViewStats = authorizationHandler.isAuthorized(
      userCtx,
      'statistics'
    );

    /**
     * Generic authorization check.
     * Accepts an optional `context` that can override the hook-level courseId.
     */
    const isAuthorized = (
      feature: AiFeature,
      context?: { courseId?: string | number }
    ): boolean => {
      // If a different courseId is provided in the context, rebuild the
      // UserContext so the course-scoped arrays are correct.
      const effectiveCourseId = context?.courseId ?? courseId;
      const effectiveCtx =
        effectiveCourseId !== courseId
          ? buildUserContext(user, effectiveCourseId)
          : userCtx;

      return authorizationHandler.isAuthorized(effectiveCtx, feature, {
        courseId: effectiveCourseId,
      });
    };

    return {
      canAsk,
      canGenerate,
      canEnhance,
      canPreGrade,
      canViewStats,
      isAuthorized,
    };
  }, [user, courseId]);

  return authState;
}

export default useAiAuth;
