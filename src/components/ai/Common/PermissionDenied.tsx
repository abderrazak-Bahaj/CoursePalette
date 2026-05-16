/**
 * PermissionDenied component
 *
 * A reusable fallback component displayed when a user attempts to access an
 * AI feature they are not authorized to use. Use this instead of returning
 * `null` when you want to show an explicit "permission denied" message rather
 * than silently hiding the feature.
 *
 * The integration components (LessonPageIntegration, AssignmentPageIntegration,
 * SubmissionPageIntegration, DashboardIntegration) return `null` by default
 * when authorization fails. Mount this component in their place if you prefer
 * to surface a visible message to the user.
 *
 * Accessibility:
 *   - Uses `role="alert"` so screen readers announce the message immediately.
 *   - The lock icon is decorative (`aria-hidden="true"`).
 *   - The message text is the accessible label for the alert region.
 *
 * @see Requirements 14 (Authorization Checks – Role-Based Access Control)
 *
 * @example
 * ```tsx
 * // Show a permission denied message instead of returning null:
 * if (!canAsk) {
 *   return <PermissionDenied />;
 * }
 *
 * // Customise the message:
 * <PermissionDenied message="Only enrolled students can use the AI assistant." />
 * ```
 */

import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PermissionDeniedProps {
  /**
   * The message shown to the user.
   * Defaults to "You don't have permission to access this feature."
   */
  message?: string;
  /** Optional extra CSS class names applied to the outermost container. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Displays a user-friendly "permission denied" message with a lock icon.
 *
 * Intended as a reusable fallback for AI features that require specific roles
 * or permissions. The component is fully accessible: it uses `role="alert"` so
 * assistive technologies announce the message as soon as it appears.
 */
export function PermissionDenied({
  message = "You don't have permission to access this feature.",
  className,
}: PermissionDeniedProps): JSX.Element {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-muted/40 px-6 py-10 text-center',
        className
      )}
    >
      {/* Decorative lock icon */}
      <Lock className="h-8 w-8 text-muted-foreground" aria-hidden="true" />

      {/* Permission denied message */}
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}

export default PermissionDenied;
