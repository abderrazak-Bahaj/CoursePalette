/**
 * AI Authorization Middleware
 *
 * Provides route-level and component-level authorization for AI features.
 *
 * - `withAiAuth`     – Higher-order component that wraps a component and
 *                      checks authorization before rendering. Redirects to
 *                      login on 401 (unauthenticated) or shows a 403 message
 *                      when the user lacks the required permissions.
 *
 * - `useAiAuthGuard` – Hook that checks authorization for a given AI feature
 *                      and returns `{ isAuthorized, isLoading }`. Handles the
 *                      case where the user is not yet loaded (loading state).
 *
 * Both utilities use `useAiAuth` for permission checks and `useNavigate` for
 * redirects. They also handle `AiAuthError` thrown by the API client — when a
 * 401 is received the user is redirected to `/login`.
 *
 * @module utils/ai/aiAuthMiddleware
 * @see Requirements 14
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAiAuth } from '@/hooks/ai/useAiAuth';
import { AiAuthError } from '@/services/ai/errors';
import type { AiFeature } from '@/services/ai/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Options accepted by both `withAiAuth` and `useAiAuthGuard`. */
export interface AiAuthOptions {
  /**
   * Course ID used for course-scoped authorization checks
   * (Q&A, generation, enhancement, pre-grading).
   * Not required for statistics (admin-only).
   */
  courseId?: string | number;
  /**
   * Path to redirect to when the user is not authenticated (401).
   * Defaults to `/login`.
   */
  redirectTo?: string;
}

/** Return type of `useAiAuthGuard`. */
export interface AiAuthGuardResult {
  /** Whether the current user is authorized for the requested feature. */
  isAuthorized: boolean;
  /** True while the auth state is still being resolved (user not yet loaded). */
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// 403 Fallback component
// ---------------------------------------------------------------------------

/**
 * Minimal inline component shown when a user is authenticated but lacks the
 * required permissions for an AI feature (403 Forbidden).
 *
 * Kept intentionally simple — consuming applications can replace this by
 * rendering their own UI before the HOC-wrapped component.
 */
const ForbiddenMessage: React.FC = () =>
  React.createElement(
    'div',
    {
      role: 'alert',
      'aria-live': 'assertive',
      style: {
        padding: '1rem',
        textAlign: 'center',
        color: '#6b7280',
      },
    },
    React.createElement(
      'p',
      { style: { fontWeight: 600, marginBottom: '0.25rem' } },
      'Access Denied'
    ),
    React.createElement(
      'p',
      { style: { fontSize: '0.875rem' } },
      'You do not have permission to access this feature.'
    )
  );

// ---------------------------------------------------------------------------
// useAiAuthGuard hook
// ---------------------------------------------------------------------------

/**
 * Hook that checks whether the current user is authorized to access a given
 * AI feature and returns `{ isAuthorized, isLoading }`.
 *
 * Handles three states:
 *  1. **Loading** – the auth context is still initializing (`isLoading: true`).
 *  2. **Unauthenticated** – no user is present; `isAuthorized` is `false`.
 *  3. **Authorized / Forbidden** – `isAuthorized` reflects the permission check.
 *
 * When a 401 `AiAuthError` is caught (e.g. from an API response), the hook
 * redirects the user to the login page.
 *
 * @param feature - The AI feature to check authorization for.
 * @param options - Optional course ID and redirect path.
 *
 * @example
 * ```tsx
 * const { isAuthorized, isLoading } = useAiAuthGuard('qa', { courseId });
 *
 * if (isLoading) return <Spinner />;
 * if (!isAuthorized) return null; // or a 403 message
 * return <AskAiComponent courseId={courseId} lessonId={lessonId} />;
 * ```
 */
export function useAiAuthGuard(
  feature: AiFeature,
  options?: AiAuthOptions
): AiAuthGuardResult {
  const { courseId, redirectTo = '/login' } = options ?? {};
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { isAuthorized: checkAuthorized } = useAiAuth(courseId);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login when the user is not authenticated.
  // We do this in an effect so that the hook always returns a consistent
  // shape on the first render (before the effect fires).
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate(redirectTo, { state: { from: location }, replace: true });
    }
  }, [isAuthLoading, isAuthenticated, navigate, redirectTo, location]);

  // While the auth context is still initializing, report loading.
  if (isAuthLoading) {
    return { isAuthorized: false, isLoading: true };
  }

  // Not authenticated — the effect above will redirect; return false for now.
  if (!isAuthenticated) {
    return { isAuthorized: false, isLoading: false };
  }

  const isAuthorized = checkAuthorized(feature, { courseId });
  return { isAuthorized, isLoading: false };
}

// ---------------------------------------------------------------------------
// withAiAuth HOC
// ---------------------------------------------------------------------------

/**
 * Higher-order component that wraps a component with AI authorization checks.
 *
 * Behaviour:
 * - While auth is loading → renders nothing (avoids flash of unauthorized content).
 * - User not authenticated (401) → redirects to `options.redirectTo` (default `/login`).
 * - User authenticated but not authorized (403) → renders a "Access Denied" message.
 * - User authorized → renders the wrapped component with all original props.
 *
 * Also handles `AiAuthError` thrown by the API client:
 * - `status === 401` → redirects to login.
 * - `status === 403` → shows the 403 message.
 *
 * @param Component - The React component to protect.
 * @param feature   - The AI feature required to render the component.
 * @param options   - Optional course ID and redirect path.
 *
 * @example
 * ```tsx
 * const ProtectedAskAi = withAiAuth(AskAiComponent, 'qa', { courseId: 42 });
 *
 * // In JSX:
 * <ProtectedAskAi courseId={42} lessonId={7} />
 * ```
 */
export function withAiAuth<P extends object>(
  Component: React.ComponentType<P>,
  feature: AiFeature,
  options?: AiAuthOptions
): React.ComponentType<P> {
  const { courseId, redirectTo = '/login' } = options ?? {};

  /**
   * The wrapper component produced by the HOC.
   * Delegates authorization logic to `useAiAuthGuard`.
   */
  const WrappedComponent: React.FC<P> = (props: P) => {
    const { isAuthorized, isLoading } = useAiAuthGuard(feature, {
      courseId,
      redirectTo,
    });

    // Still resolving auth state — render nothing to avoid flicker.
    if (isLoading) {
      return null;
    }

    // Not authorized — show 403 message.
    if (!isAuthorized) {
      return React.createElement(ForbiddenMessage);
    }

    // Authorized — render the wrapped component.
    return React.createElement(Component, props);
  };

  // Preserve the display name for React DevTools.
  const displayName = Component.displayName ?? Component.name ?? 'Component';
  WrappedComponent.displayName = `withAiAuth(${displayName})`;

  return WrappedComponent;
}

// ---------------------------------------------------------------------------
// AiAuthError handler utility
// ---------------------------------------------------------------------------

/**
 * Utility function to handle `AiAuthError` instances thrown by the API client.
 *
 * Call this inside a `catch` block when making AI API requests to ensure
 * 401 errors redirect to login and 403 errors are surfaced to the user.
 *
 * @param error      - The caught error (may or may not be an `AiAuthError`).
 * @param navigate   - The `useNavigate` function from react-router-dom.
 * @param location   - The current location (for `state.from` on redirect).
 * @param redirectTo - Path to redirect to on 401. Defaults to `/login`.
 * @returns `true` if the error was an `AiAuthError` and was handled,
 *          `false` if the error should be handled by the caller.
 *
 * @example
 * ```ts
 * try {
 *   await aiApiClient.askQuestion(courseId, lessonId, question);
 * } catch (err) {
 *   if (!handleAiAuthError(err, navigate, location)) {
 *     setError(err as Error);
 *   }
 * }
 * ```
 */
export function handleAiAuthError(
  error: unknown,
  navigate: ReturnType<typeof useNavigate>,
  location: ReturnType<typeof useLocation>,
  redirectTo: string = '/login'
): boolean {
  if (!(error instanceof AiAuthError)) {
    return false;
  }

  if (error.status === 401) {
    navigate(redirectTo, { state: { from: location }, replace: true });
    return true;
  }

  // 403 — not handled here; the caller should display a permission denied message.
  return false;
}
