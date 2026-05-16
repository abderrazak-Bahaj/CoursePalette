/**
 * AiUsageStatistics component — Admin dashboard for AI usage metrics.
 *
 * Features:
 * - Fetches usage statistics on mount via aiApiClient.getAiUsageStatistics()
 * - Shows LoadingSkeletons (variant="statistics") while loading
 * - Displays metric cards: total requests, tokens in, tokens out, total errors
 * - Renders a bar chart of daily requests using recharts
 * - "Days" filter (7, 14, 30, 60, 90) that re-fetches on change
 * - Error message with retry button on failure
 * - "No data available" empty state when statistics are empty
 * - Accessible (aria-live, labels, keyboard nav) and responsive
 *
 * Keyboard navigation (Requirement 15):
 * - Tab order follows DOM order: Days-filter buttons (7d → 14d → 30d →
 *   60d → 90d, each `aria-pressed` toggled) → Retry (only when error).
 *   Metric cards and the bar chart are non-interactive and therefore not in
 *   the tab order.
 * - All buttons expose the design-system focus ring
 *   (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
 *   focus-visible:ring-offset-1`) and meet the 44×44 px touch-target size.
 * - The bar chart is `aria-hidden`; an equivalent screen-reader-only `<table>`
 *   provides the same data accessibly. No keyboard interaction is required
 *   for the chart itself.
 * - No custom keyboard shortcuts are defined.
 *
 * @see Requirements 7, 9, 15
 */

import { useEffect, useState, useCallback, useRef, useMemo, memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertCircle,
  RefreshCw,
  Activity,
  Zap,
  ZapOff,
  BarChart2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiApiClient } from '@/services/ai/aiApiClient';
import { LoadingSkeletons } from '../Common/LoadingSkeletons';
import { useDebounce } from '../../../utils/ai/debounce';
import type {
  AiUsageStatisticsProps,
  UsageStatistics,
  DailyUsageMetric,
} from '@/services/ai/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Available "days" filter options. */
const DAY_OPTIONS = [7, 14, 30, 60, 90] as const;
type DayOption = (typeof DAY_OPTIONS)[number];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A single metric card showing a label, value, and icon. */
const MetricCard = memo(function MetricCard({
  label,
  value,
  icon: Icon,
  description,
  className,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  className?: string;
}) {
  const formattedValue =
    typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm',
        className
      )}
      // aria-label on the card container gives screen readers a concise
      // summary of the metric (label + value) without relying on aria-label
      // on a non-interactive <p> element (which is not valid ARIA usage).
      aria-label={`${label}: ${formattedValue}`}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          aria-hidden="true"
        >
          {label}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
      </div>
      {/* aria-hidden because the value is already announced via the container's aria-label */}
      <p
        className="text-2xl font-bold tabular-nums text-foreground"
        aria-hidden="true"
      >
        {formattedValue}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
});

/** Days filter button group. */
const DaysFilter = memo(function DaysFilter({
  selected,
  onChange,
}: {
  selected: DayOption;
  onChange: (days: DayOption) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter by number of days"
      className="flex flex-wrap items-center gap-1"
    >
      <span className="mr-1 text-xs font-medium text-muted-foreground">
        Period:
      </span>
      {DAY_OPTIONS.map((days) => (
        <button
          key={days}
          type="button"
          onClick={() => onChange(days)}
          aria-pressed={selected === days}
          className={cn(
            'rounded-md px-3 py-2.5 text-xs font-medium transition-colors',
            'min-h-[44px] min-w-[44px]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            selected === days
              ? 'bg-primary text-primary-foreground'
              : 'border border-input text-foreground hover:bg-accent'
          )}
        >
          {days}d
        </button>
      ))}
    </div>
  );
});

/** Custom tooltip for the recharts bar chart. */
const ChartTooltip = memo(function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-muted-foreground">
        Requests:{' '}
        <span className="font-semibold tabular-nums text-foreground">
          {payload[0].value.toLocaleString()}
        </span>
      </p>
    </div>
  );
});

/** Formats a YYYY-MM-DD date string to a short label like "Jan 5". */
function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/** Prepares chart data from daily metrics, thinning labels for readability. */
function buildChartData(
  data: DailyUsageMetric[],
  days: number
): Array<{ date: string; requests: number; fullDate: string }> {
  // Show every Nth label to avoid crowding on small screens
  const labelEvery = days <= 14 ? 1 : days <= 30 ? 3 : 7;

  return data.map((d, i) => ({
    date: i % labelEvery === 0 ? formatDateLabel(d.date) : '',
    fullDate: formatDateLabel(d.date),
    requests: d.requests,
  }));
}

// ---------------------------------------------------------------------------
// AiUsageStatistics
// ---------------------------------------------------------------------------

/**
 * Admin dashboard component for viewing AI usage statistics.
 *
 * Wrapped with React.memo so parent components that pass a stable `className`
 * prop do not cause unnecessary re-renders of the statistics dashboard
 * (Requirement 22.4).
 *
 * @example
 * ```tsx
 * <AiUsageStatistics className="mt-6" />
 * ```
 */
export const AiUsageStatistics = memo(function AiUsageStatistics({
  className,
}: AiUsageStatisticsProps): JSX.Element {
  const [statistics, setStatistics] = useState<UsageStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<DayOption>(30);

  // Debounce the selected days value (300 ms) so rapid filter clicks don't
  // fire multiple API requests. The loading state is set immediately on the
  // raw value change so the UI feels responsive.
  const debouncedDays = useDebounce(selectedDays, 300);

  // Track whether this is the initial mount so we show loading immediately
  // without waiting for the debounce delay on first render.
  const isFirstRender = useRef(true);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchStatistics = useCallback(async (days: DayOption) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiApiClient.getAiUsageStatistics({ days });
      setStatistics(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load statistics. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger fetch when the debounced days value settles.
  useEffect(() => {
    // On the very first render the debounced value equals the initial state
    // (30 days) so we fetch immediately without waiting for the debounce timer.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchStatistics(debouncedDays);
      return;
    }
    fetchStatistics(debouncedDays);
  }, [fetchStatistics, debouncedDays]);

  const handleDaysChange = useCallback((days: DayOption) => {
    // Update the raw value immediately so the filter buttons reflect the
    // selection right away. The actual API call is deferred via debouncedDays.
    setSelectedDays(days);
    // Show loading state immediately so the user gets instant feedback.
    setIsLoading(true);
  }, []);

  const handleRetry = useCallback(() => {
    fetchStatistics(selectedDays);
  }, [fetchStatistics, selectedDays]);

  // ── Render: loading ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)} aria-busy="true">
        {/* Filter skeleton */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="flex gap-1">
            {DAY_OPTIONS.map((d) => (
              <div
                key={d}
                className="h-7 w-10 animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        </div>
        {/* Metric card skeletons */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LoadingSkeletons count={4} variant="statistics" />
        </div>
        {/* Chart skeleton */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="h-4 w-40 animate-pulse rounded bg-muted mb-4" />
          <div className="h-48 animate-pulse rounded bg-muted" />
        </div>
        <span className="sr-only">Loading AI usage statistics…</span>
      </div>
    );
  }

  // ── Render: error ─────────────────────────────────────────────────────────

  if (error) {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive',
          className
        )}
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-medium">Failed to load statistics</p>
          <p className="mt-0.5 text-destructive/80">{error}</p>
        </div>
        <button
          type="button"
          onClick={handleRetry}
          aria-label="Retry loading statistics"
          className={cn(
            'ml-auto flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2.5 text-xs font-medium transition-colors',
            'min-h-[44px]',
            'border border-destructive/40 text-destructive hover:bg-destructive/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-1'
          )}
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  // ── Render: no data ───────────────────────────────────────────────────────

  const hasData =
    statistics !== null &&
    (statistics.total_requests > 0 || statistics.data.length > 0);

  if (!hasData) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Keep the filter visible so the user can try a different range */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-base font-semibold text-foreground">
            AI Usage Statistics
          </h2>
          <DaysFilter selected={selectedDays} onChange={handleDaysChange} />
        </div>
        <div
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-muted/30 p-10 text-center"
          role="status"
          aria-live="polite"
        >
          <BarChart2
            className="h-8 w-8 text-muted-foreground/50"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-foreground">
              No data available
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              No AI usage data found for the last {selectedDays} days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: statistics ────────────────────────────────────────────────────

  // Memoize chart data to avoid recomputing on every render (Requirement 22.2)
  const chartData = useMemo(
    () => buildChartData(statistics.data, selectedDays),
    [statistics.data, selectedDays]
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* ── Header + filter ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-base font-semibold text-foreground">
          AI Usage Statistics
        </h2>
        <DaysFilter selected={selectedDays} onChange={handleDaysChange} />
      </div>

      {/* ── Metric cards ────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Usage summary"
      >
        <MetricCard
          label="Total Requests"
          value={statistics.total_requests}
          icon={Activity}
          description={`Over the last ${statistics.period_days} days`}
        />
        <MetricCard
          label="Tokens In"
          value={statistics.total_tokens_in}
          icon={Zap}
          description="Input tokens consumed"
        />
        <MetricCard
          label="Tokens Out"
          value={statistics.total_tokens_out}
          icon={ZapOff}
          description="Output tokens generated"
        />
        <MetricCard
          label="Total Errors"
          value={statistics.total_errors}
          icon={AlertCircle}
          description="Failed requests"
          className={
            statistics.total_errors > 0
              ? 'border-destructive/30 bg-destructive/5'
              : undefined
          }
        />
      </div>

      {/* ── Daily requests chart ─────────────────────────────────────────── */}
      <section
        aria-labelledby="chart-heading"
        className="rounded-lg border bg-card p-4 shadow-sm"
      >
        <h3
          id="chart-heading"
          className="mb-4 text-sm font-semibold text-foreground"
        >
          Daily Requests
        </h3>

        {/* Accessible table fallback for screen readers */}
        <div className="sr-only">
          <table>
            <caption>Daily AI request counts</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Requests</th>
              </tr>
            </thead>
            <tbody>
              {statistics.data.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{d.requests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual chart (aria-hidden so screen readers use the table above) */}
        <div aria-hidden="true" className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                className="fill-muted-foreground"
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
              />
              <Bar
                dataKey="requests"
                fill="hsl(var(--primary))"
                radius={[3, 3, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Screen reader live region ────────────────────────────────────── */}
      <div role="status" aria-live="polite" className="sr-only">
        Showing AI usage statistics for the last {statistics.period_days} days.
        Total requests: {statistics.total_requests}.
      </div>
    </div>
  );
});

export default AiUsageStatistics;
