/**
 * RateLimitAlert component
 *
 * Displays a dismissible warning when the user has exceeded the AI rate limit.
 * Shows a live countdown timer (in seconds) until the user can make their next
 * request. When the countdown reaches zero the alert is automatically cleared.
 *
 * Keyboard navigation (Requirement 15):
 * - The single interactive control is the dismiss (×) button at the end of
 *   the alert. It receives focus on Tab and exposes a visible focus ring
 *   (`focus-visible:ring-2 focus-visible:ring-amber-500`) that meets WCAG
 *   2.1 AA contrast against the amber background.
 * - The alert itself uses `role="alert"` + `aria-live="polite"` so screen
 *   readers announce the rate-limit message and countdown without stealing
 *   focus from the user's current task.
 * - No custom keyboard shortcuts are defined.
 *
 * @see Requirements 10 (Rate Limit Awareness and User Messaging)
 * @see Requirements 15 (Accessibility Compliance)
 */

import { useEffect, useRef, useState } from 'react';
import { X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RateLimitAlertProps } from '@/services/ai/types';

/**
 * Normalise the `retryAfter` prop to a number of seconds.
 *
 * The prop accepts either:
 *  - a plain number (seconds to wait), or
 *  - an ISO 8601 string / Unix timestamp string (seconds since epoch).
 */
function toSecondsRemaining(retryAfter: number | string): number {
  if (typeof retryAfter === 'number') {
    // Treat values > 1_000_000_000 as a Unix timestamp, otherwise as a duration
    if (retryAfter > 1_000_000_000) {
      return Math.max(0, Math.ceil(retryAfter - Date.now() / 1000));
    }
    return Math.max(0, Math.ceil(retryAfter));
  }

  // Try to parse as an ISO date string first
  const parsed = Date.parse(retryAfter);
  if (!isNaN(parsed)) {
    return Math.max(0, Math.ceil((parsed - Date.now()) / 1000));
  }

  // Fall back to treating it as a numeric string (seconds)
  const numeric = parseFloat(retryAfter);
  if (!isNaN(numeric)) {
    return Math.max(0, Math.ceil(numeric));
  }

  return 0;
}

/**
 * RateLimitAlert
 *
 * Renders an amber/warning alert with:
 *  - A live countdown showing seconds remaining until retry is allowed.
 *  - A dismiss (×) button that calls `onDismiss` when clicked.
 *  - Automatic dismissal when the countdown reaches 0.
 *  - Proper ARIA attributes for screen-reader accessibility.
 *
 * @example
 * ```tsx
 * <RateLimitAlert
 *   retryAfter={60}
 *   onDismiss={() => setRateLimitError(null)}
 * />
 * ```
 */
export function RateLimitAlert({
  retryAfter,
  onDismiss,
  className,
}: RateLimitAlertProps): JSX.Element {
  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    toSecondsRemaining(retryAfter)
  );

  // Keep a stable ref to onDismiss so the interval closure doesn't go stale
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    // Re-initialise when retryAfter changes (e.g. a new rate-limit error)
    setSecondsLeft(toSecondsRemaining(retryAfter));
  }, [retryAfter]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      // Countdown already at zero – auto-dismiss
      onDismissRef.current?.();
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(intervalId);
          // Schedule dismiss after the state update has been applied
          setTimeout(() => onDismissRef.current?.(), 0);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secondsLeft <= 0 ? 'zero' : 'counting']); // re-run only when crossing zero

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        // Amber / warning colour scheme
        'relative flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900',
        'dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200',
        // forced-colors: use system colours so the alert remains visible in
        // Windows High Contrast mode.
        'forced-colors:border-[ButtonText] forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText]',
        className
      )}
    >
      {/* Icon */}
      <Clock
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
        aria-hidden="true"
      />

      {/* Message */}
      <div className="flex-1 text-sm">
        <p className="font-semibold leading-snug">Rate limit reached</p>
        <p className="mt-0.5 leading-relaxed">
          {secondsLeft > 0 ? (
            <>
              You can ask again in{' '}
              <span
                aria-label={`${secondsLeft} seconds`}
                className="font-bold tabular-nums"
              >
                {secondsLeft}
              </span>{' '}
              {secondsLeft === 1 ? 'second' : 'seconds'}.
            </>
          ) : (
            'You can ask again now.'
          )}
        </p>
      </div>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss rate limit alert"
          className={cn(
            // Touch-target sizing — 44×44 px square so the control meets
            // WCAG 2.5.5 / Requirement 16.4 on mobile and tablet devices.
            'ml-auto flex shrink-0 items-center justify-center rounded transition-colors',
            'min-h-[44px] min-w-[44px]',
            'text-amber-700 hover:bg-amber-200 hover:text-amber-900',
            'dark:text-amber-400 dark:hover:bg-amber-800 dark:hover:text-amber-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1'
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default RateLimitAlert;
