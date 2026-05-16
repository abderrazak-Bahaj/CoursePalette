/**
 * DashboardIntegration component
 *
 * Integrates the AiUsageStatistics component into the admin dashboard.
 * Performs feature-flag and authorization checks before rendering — returns
 * `null` when the statistics feature is disabled or the current user is not
 * authorized to view stats.
 *
 * Performance:
 * - AiUsageStatistics is lazy-loaded via React.lazy() so its JS chunk (which
 *   includes charting libraries) is only fetched when the admin navigates to
 *   the dashboard statistics section, keeping the initial bundle lean.
 *
 * Usage:
 * ```tsx
 * // Drop this anywhere inside the admin dashboard layout:
 * <DashboardIntegration className="mt-8" />
 * ```
 *
 * @see Requirements 13 (Integration with Existing Course/Lesson Pages — AC 5)
 * @see Requirements 22 (Performance Optimization – Lazy Loading)
 * @module components/ai/Integrations/DashboardIntegration
 */

import { Suspense } from 'react';
import { useAiContext } from '@/context/AiContext';
import { useAiAuth } from '@/hooks/ai/useAiAuth';
import { AiLoadingFallback } from '../Common/AiLoadingFallback';
import { LazyAiUsageStatistics } from '../lazy';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DashboardIntegrationProps {
  /** Optional Tailwind / CSS class names forwarded to the wrapper element. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * DashboardIntegration
 *
 * Renders the AI Usage Statistics section inside the admin dashboard.
 * Returns `null` when:
 *   - The `aiStatistics` feature flag is disabled, OR
 *   - The current user does not have the `canViewStats` permission.
 *
 * This keeps the integration point clean: the parent dashboard simply mounts
 * `<DashboardIntegration />` and the component self-gates based on context
 * and authorization, without requiring the parent to know about AI internals.
 *
 * Accessibility:
 *   - The wrapper is a `<section>` with an `aria-labelledby` pointing to the
 *     visible heading, giving screen-reader users a clear landmark.
 *   - The heading uses `h2` so it fits naturally into the dashboard's heading
 *     hierarchy (the dashboard page title is typically `h1`).
 *
 * Keyboard navigation (Requirement 15):
 * - This component is a plain section wrapper; it adds no interactive
 *   elements of its own, so it does not modify the tab order. All
 *   interactive controls (Days-filter buttons, Retry) live inside the
 *   lazy-loaded `AiUsageStatistics` and inherit its keyboard navigation.
 * - No focus trap is required because this is not a modal.
 * - No custom keyboard shortcuts are defined.
 *
 * @example
 * ```tsx
 * function AdminDashboard() {
 *   return (
 *     <main>
 *       <h1>Admin Dashboard</h1>
 *       <OverviewCards />
 *       <DashboardIntegration className="mt-8" />
 *     </main>
 *   );
 * }
 * ```
 */
export function DashboardIntegration({
  className,
}: DashboardIntegrationProps): JSX.Element | null {
  const { features } = useAiContext();
  const { canViewStats } = useAiAuth();

  // Authorization is handled here via two checks (Requirement 14):
  //   1. `features.aiStatistics` — master feature flag from AiContext
  //   2. `canViewStats`          — role-based check: user must have admin role.
  //
  // If either check fails the component returns null, hiding the statistics
  // section entirely from unauthorized users. Use <PermissionDenied /> in
  // place of `return null` if you prefer to surface an explicit message.

  // Gate 1: feature flag
  if (!features.aiStatistics) {
    return null;
  }

  // Gate 2: authorization
  if (!canViewStats) {
    return null;
  }

  return (
    <section
      aria-labelledby="ai-usage-statistics-heading"
      className={className}
    >
      <h2
        id="ai-usage-statistics-heading"
        className="mb-4 text-lg font-semibold text-foreground"
      >
        AI Usage Statistics
      </h2>

      {/*
       * Suspense boundary: AiUsageStatistics (and its charting dependencies)
       * are lazy-loaded so the chunk is only fetched when the admin reaches
       * this section of the dashboard.
       * (Requirement 22 – lazy-load AI components not immediately visible)
       */}
      <Suspense
        fallback={
          <AiLoadingFallback
            variant="card"
            label="Loading AI usage statistics…"
          />
        }
      >
        {/* The AiUsageStatistics component renders its own internal heading
            ("AI Usage Statistics") as an h2 inside the section. We suppress
            that duplicate heading by passing a className that visually hides
            the inner heading — the outer h2 above serves as the section label
            for accessibility purposes. */}
        <LazyAiUsageStatistics className="[&>div:first-child_h2]:sr-only" />
      </Suspense>
    </section>
  );
}

export default DashboardIntegration;
