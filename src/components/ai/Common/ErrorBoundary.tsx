/**
 * AiErrorBoundary
 *
 * React error boundary that catches errors thrown by child AI components and
 * displays a user-friendly fallback card with a "Try Again" button. Different
 * error types (auth, rate-limit, network, timeout, generic) get distinct
 * messages and icons.
 *
 * Keyboard navigation (Requirement 15):
 * - The fallback card renders a single interactive control: the shadcn
 *   `<Button>` "Try Again". It receives focus on Tab and inherits the
 *   design-system focus ring from the Button base CVA variant
 *   (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
 *   focus-visible:ring-offset-2`), which meets WCAG 2.1 AA contrast.
 * - In development mode an additional `<details>` element ("Error Details")
 *   is rendered before the button. `<details>` is natively keyboard
 *   accessible — its `<summary>` toggles on Enter / Space.
 * - Tab order: [Error details summary (dev only)] → [Try Again button].
 * - No focus trap is needed because this is not a modal — the boundary is
 *   inline and the surrounding page remains interactive.
 * - No custom keyboard shortcuts are defined.
 *
 * @see Requirements 8 – Error Handling and User Feedback
 * @see Requirements 15 – Accessibility Compliance
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Clock,
  ShieldOff,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AiAuthError,
  AiRateLimitError,
  AiNetworkError,
  AiTimeoutError,
} from '@/services/ai/errors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AiErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback UI to render instead of the default error card. */
  fallback?: ReactNode;
  /** Called when an error is caught, useful for external error reporting. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Called when the user clicks "Try Again".
   * If provided, this is called instead of (or in addition to) resetting
   * the internal error state.
   */
  onRetry?: () => void;
}

interface AiErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ErrorDisplay {
  title: string;
  description: string;
  icon: ReactNode;
}

/**
 * Maps a caught error to a user-friendly title, description, and icon.
 * Never exposes stack traces or technical details to the user.
 */
function getErrorDisplay(error: Error | null): ErrorDisplay {
  // Note: All status icons below are marked aria-hidden="true" because the
  // accompanying title and description text already convey the error context
  // to assistive technology. The role="alert" wrapper announces the message.
  if (error instanceof AiAuthError) {
    if (error.status === 401) {
      return {
        title: 'Session Expired',
        description: 'Session expired. Please log in again.',
        icon: (
          <ShieldOff className="h-6 w-6 text-yellow-600" aria-hidden="true" />
        ),
      };
    }
    // 403
    return {
      title: 'Access Denied',
      description: "You don't have permission to use this feature.",
      icon: <ShieldAlert className="h-6 w-6 text-red-600" aria-hidden="true" />,
    };
  }

  if (error instanceof AiRateLimitError) {
    return {
      title: 'Rate Limit Exceeded',
      description: 'Rate limit exceeded. Please try again later.',
      icon: <Clock className="h-6 w-6 text-orange-600" aria-hidden="true" />,
    };
  }

  if (error instanceof AiNetworkError) {
    return {
      title: 'Connection Error',
      description: 'Connection error. Please check your internet connection.',
      icon: <WifiOff className="h-6 w-6 text-blue-600" aria-hidden="true" />,
    };
  }

  if (error instanceof AiTimeoutError) {
    return {
      title: 'Request Timed Out',
      description: 'Request timed out. Please try again.',
      icon: <Clock className="h-6 w-6 text-orange-600" aria-hidden="true" />,
    };
  }

  // Generic fallback
  return {
    title: 'Something Went Wrong',
    description: 'Something went wrong. Please try again.',
    icon: <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Error boundary for AI components.
 *
 * Catches errors thrown by child components and displays a user-friendly
 * error message with a "Try Again" button. Supports different messages for
 * different AI error types (auth, rate limit, network, timeout, generic).
 *
 * Usage:
 * ```tsx
 * <AiErrorBoundary onRetry={() => refetch()}>
 *   <AskAiComponent />
 * </AiErrorBoundary>
 * ```
 *
 * @see Requirements 8 – Error Handling and User Feedback
 */
class AiErrorBoundary extends Component<
  AiErrorBoundaryProps,
  AiErrorBoundaryState
> {
  public state: AiErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): AiErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console in development mode only (Requirement 8.9)
    if (import.meta.env.DEV) {
      console.error('[AiErrorBoundary] Caught error:', error);
      console.error(
        '[AiErrorBoundary] Component stack:',
        errorInfo.componentStack
      );
    }

    // Notify parent if a handler was provided
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = (): void => {
    // Reset internal error state so children re-render
    this.setState({ hasError: false, error: null });

    // Also call the external retry handler if provided
    this.props.onRetry?.();
  };

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Render custom fallback if provided
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const { title, description, icon } = getErrorDisplay(this.state.error);

    return (
      // role="alert" + aria-live="assertive" ensures screen readers announce
      // the error immediately (Requirement 8.10, 15.8)
      <div role="alert" aria-live="assertive">
        <Card className="w-full border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                {icon}
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  {title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Development-only error details – never shown in production */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-3 rounded-md bg-white p-3 border border-red-100">
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium text-red-800 hover:text-red-900">
                    Error Details (Development Only)
                  </summary>
                  <p className="mt-2 font-mono text-red-700 break-all">
                    {this.state.error.message}
                  </p>
                </details>
              </div>
            )}

            <Button
              onClick={this.handleRetry}
              variant="default"
              size="sm"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default AiErrorBoundary;
