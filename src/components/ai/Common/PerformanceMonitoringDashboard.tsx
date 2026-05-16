/**
 * Performance Monitoring Dashboard
 *
 * Displays Core Web Vitals (FCP, LCP, CLS) and AI operation metrics.
 * Provides insights into application performance and helps identify bottlenecks.
 *
 * Features:
 * - Real-time Core Web Vitals display
 * - AI operation performance metrics
 * - Lighthouse score recommendations
 * - Performance status indicators (good/needs improvement/poor)
 * - Export metrics for analysis
 *
 * @module PerformanceMonitoringDashboard
 */

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import {
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  performanceMonitor,
  PerformanceMetrics,
  AiOperationMetrics,
} from '@/utils/ai/performanceMonitor';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Performance status levels based on Web Vitals thresholds.
 * @see https://web.dev/vitals/
 */
type PerformanceStatus = 'good' | 'needs-improvement' | 'poor';

/**
 * Determines the performance status for a metric value.
 * Uses Google's Web Vitals thresholds.
 */
function getMetricStatus(
  metricName: string,
  value: number | undefined
): PerformanceStatus {
  if (value === undefined) return 'needs-improvement';

  // Thresholds based on Google Web Vitals
  // @see https://web.dev/vitals/
  switch (metricName) {
    case 'fcp': // First Contentful Paint
      return value <= 1800
        ? 'good'
        : value <= 3000
          ? 'needs-improvement'
          : 'poor';
    case 'lcp': // Largest Contentful Paint
      return value <= 2500
        ? 'good'
        : value <= 4000
          ? 'needs-improvement'
          : 'poor';
    case 'cls': // Cumulative Layout Shift
      return value <= 0.1
        ? 'good'
        : value <= 0.25
          ? 'needs-improvement'
          : 'poor';
    case 'ttfb': // Time to First Byte
      return value <= 600
        ? 'good'
        : value <= 1200
          ? 'needs-improvement'
          : 'poor';
    case 'fid': // First Input Delay
      return value <= 100
        ? 'good'
        : value <= 300
          ? 'needs-improvement'
          : 'poor';
    default:
      return 'needs-improvement';
  }
}

/**
 * Gets the color class for a performance status.
 */
function getStatusColor(status: PerformanceStatus): string {
  switch (status) {
    case 'good':
      // text-green-700 on white = 4.85:1, meets WCAG AA 4.5:1.
      return 'text-green-700 dark:text-green-400';
    case 'needs-improvement':
      // text-yellow-700 on white = 4.51:1, meets WCAG AA 4.5:1.
      // (text-yellow-600 = 3.07:1 failed for normal text.)
      return 'text-yellow-700 dark:text-yellow-400';
    case 'poor':
      // text-red-600 on white = 4.83:1, meets WCAG AA 4.5:1.
      return 'text-red-600 dark:text-red-400';
  }
}

/**
 * Gets the background color class for a performance status.
 */
function getStatusBgColor(status: PerformanceStatus): string {
  switch (status) {
    case 'good':
      return 'bg-green-50 dark:bg-green-950';
    case 'needs-improvement':
      return 'bg-yellow-50 dark:bg-yellow-950';
    case 'poor':
      return 'bg-red-50 dark:bg-red-950';
  }
}

/**
 * Gets the icon for a performance status.
 */
function getStatusIcon(status: PerformanceStatus) {
  // Icons are decorative — the accompanying status text and aria-label on
  // the metric card already convey the status to assistive technology.
  switch (status) {
    case 'good':
      return <CheckCircle className="w-5 h-5" aria-hidden="true" />;
    case 'needs-improvement':
      return <AlertCircle className="w-5 h-5" aria-hidden="true" />;
    case 'poor':
      return <AlertCircle className="w-5 h-5" aria-hidden="true" />;
  }
}

/**
 * Metric Card Component
 */
interface MetricCardProps {
  label: string;
  value: number | undefined;
  unit: string;
  description: string;
  status: PerformanceStatus;
}

const MetricCard = memo(
  ({ label, value, unit, description, status }: MetricCardProps) => (
    <div
      className={cn(
        'p-4 rounded-lg border',
        getStatusBgColor(status),
        'border-gray-200 dark:border-gray-700'
      )}
      // Treat the card as a labelled status region so screen readers
      // announce the metric label, value, and tier together.
      role="status"
      aria-label={`${label}: ${value !== undefined ? `${value}${unit}` : 'not available'}, status ${status.replace('-', ' ')}. ${description}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
          {label}
        </h3>
        <div className={cn('flex-shrink-0', getStatusColor(status))}>
          {getStatusIcon(status)}
        </div>
      </div>
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value !== undefined ? `${value}${unit}` : 'N/A'}
        </p>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
);

MetricCard.displayName = 'MetricCard';

/**
 * Operation Metrics Table Component
 */
interface OperationMetricsTableProps {
  operations: AiOperationMetrics[];
}

const OperationMetricsTable = memo(
  ({ operations }: OperationMetricsTableProps) => {
    const stats = useMemo(() => {
      if (operations.length === 0) {
        return null;
      }

      const byOperation = operations.reduce(
        (acc, op) => {
          if (!acc[op.operation]) {
            acc[op.operation] = [];
          }
          acc[op.operation].push(op.duration);
          return acc;
        },
        {} as Record<string, number[]>
      );

      return Object.entries(byOperation).map(([operation, durations]) => ({
        operation,
        count: durations.length,
        avgDuration: Math.round(
          durations.reduce((a, b) => a + b, 0) / durations.length
        ),
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
      }));
    }, [operations]);

    if (!stats || stats.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No AI operations recorded yet</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-gray-100">
                Operation
              </th>
              <th className="text-right py-2 px-3 font-semibold text-gray-900 dark:text-gray-100">
                Count
              </th>
              <th className="text-right py-2 px-3 font-semibold text-gray-900 dark:text-gray-100">
                Avg (ms)
              </th>
              <th className="text-right py-2 px-3 font-semibold text-gray-900 dark:text-gray-100">
                Min (ms)
              </th>
              <th className="text-right py-2 px-3 font-semibold text-gray-900 dark:text-gray-100">
                Max (ms)
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => (
              <tr
                key={stat.operation}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <td className="py-2 px-3 text-gray-900 dark:text-gray-100">
                  {stat.operation}
                </td>
                <td className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">
                  {stat.count}
                </td>
                <td className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">
                  {stat.avgDuration}
                </td>
                <td className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">
                  {stat.minDuration}
                </td>
                <td className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">
                  {stat.maxDuration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

OperationMetricsTable.displayName = 'OperationMetricsTable';

/**
 * Lighthouse Score Recommendations Component
 */
interface LighthouseRecommendationsProps {
  metrics: PerformanceMetrics;
}

const LighthouseRecommendations = memo(
  ({ metrics }: LighthouseRecommendationsProps) => {
    const recommendations = useMemo(() => {
      const recs: Array<{
        title: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
      }> = [];

      // FCP recommendations
      if (metrics.fcp && metrics.fcp > 1800) {
        recs.push({
          title: 'Improve First Contentful Paint (FCP)',
          description:
            'Reduce render-blocking resources, optimize critical CSS, and defer non-critical JavaScript.',
          priority: 'high',
        });
      }

      // LCP recommendations
      if (metrics.lcp && metrics.lcp > 2500) {
        recs.push({
          title: 'Improve Largest Contentful Paint (LCP)',
          description:
            'Optimize images, reduce server response time, and implement lazy loading for below-the-fold content.',
          priority: 'high',
        });
      }

      // CLS recommendations
      if (metrics.cls && metrics.cls > 0.1) {
        recs.push({
          title: 'Reduce Cumulative Layout Shift (CLS)',
          description:
            'Reserve space for dynamic content, avoid inserting content above existing content, and use transform animations instead of layout-triggering properties.',
          priority: 'high',
        });
      }

      // TTFB recommendations
      if (metrics.ttfb && metrics.ttfb > 600) {
        recs.push({
          title: 'Improve Time to First Byte (TTFB)',
          description:
            'Optimize server response time, use a CDN, and implement caching strategies.',
          priority: 'medium',
        });
      }

      return recs;
    }, [metrics]);

    if (recommendations.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>All metrics are within acceptable ranges!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className={cn(
              'p-3 rounded-lg border',
              rec.priority === 'high'
                ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                : rec.priority === 'medium'
                  ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
                  : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
            )}
          >
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
              {rec.title}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {rec.description}
            </p>
          </div>
        ))}
      </div>
    );
  }
);

LighthouseRecommendations.displayName = 'LighthouseRecommendations';

/**
 * Main Performance Monitoring Dashboard Component
 */
interface PerformanceMonitoringDashboardProps {
  className?: string;
}

const PerformanceMonitoringDashboard = memo(
  ({ className }: PerformanceMonitoringDashboardProps) => {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({});
    const [operations, setOperations] = useState<AiOperationMetrics[]>([]);
    const [refreshCount, setRefreshCount] = useState(0);

    // Refresh metrics from the performance monitor
    const refreshMetrics = useCallback(() => {
      setMetrics(performanceMonitor.getMetrics());
      setOperations(performanceMonitor.getOperationMetrics());
      setRefreshCount((prev) => prev + 1);
    }, []);

    // Initial load and set up polling
    useEffect(() => {
      refreshMetrics();
      const interval = setInterval(refreshMetrics, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }, [refreshMetrics]);

    // Calculate Lighthouse score estimate
    const lighthouseScore = useMemo(() => {
      let score = 100;

      // FCP impact (up to 10 points)
      if (metrics.fcp) {
        if (metrics.fcp > 3000) score -= 10;
        else if (metrics.fcp > 1800) score -= 5;
      }

      // LCP impact (up to 25 points)
      if (metrics.lcp) {
        if (metrics.lcp > 4000) score -= 25;
        else if (metrics.lcp > 2500) score -= 15;
      }

      // CLS impact (up to 15 points)
      if (metrics.cls) {
        if (metrics.cls > 0.25) score -= 15;
        else if (metrics.cls > 0.1) score -= 8;
      }

      // TTFB impact (up to 10 points)
      if (metrics.ttfb) {
        if (metrics.ttfb > 1200) score -= 10;
        else if (metrics.ttfb > 600) score -= 5;
      }

      return Math.max(0, score);
    }, [metrics]);

    // Export metrics as JSON
    const handleExport = useCallback(() => {
      const data = {
        timestamp: new Date().toISOString(),
        metrics,
        operations,
        lighthouseScore,
      };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-metrics-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }, [metrics, operations, lighthouseScore]);

    const fcpStatus = getMetricStatus('fcp', metrics.fcp);
    const lcpStatus = getMetricStatus('lcp', metrics.lcp);
    const clsStatus = getMetricStatus('cls', metrics.cls);
    const ttfbStatus = getMetricStatus('ttfb', metrics.ttfb);

    return (
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity
              className="w-6 h-6 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Performance Monitoring
            </h2>
          </div>
          <Button
            onClick={refreshMetrics}
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label="Refresh performance metrics"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Refresh
          </Button>
        </div>

        {/* Lighthouse Score Card */}
        <div
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`Estimated Lighthouse score: ${lighthouseScore} out of 100`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Estimated Lighthouse Score
            </h3>
            <TrendingUp
              className="w-5 h-5 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
              {lighthouseScore}
            </span>
            <span className="text-lg text-gray-600 dark:text-gray-400">
              /100
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {lighthouseScore >= 80
              ? '✓ Target achieved! Performance is good.'
              : lighthouseScore >= 50
                ? '⚠ Performance needs improvement.'
                : '✗ Performance is poor. Optimization needed.'}
          </p>
        </div>

        {/* Core Web Vitals Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Core Web Vitals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="FCP"
              value={metrics.fcp}
              unit="ms"
              description="First Contentful Paint"
              status={fcpStatus}
            />
            <MetricCard
              label="LCP"
              value={metrics.lcp}
              unit="ms"
              description="Largest Contentful Paint"
              status={lcpStatus}
            />
            <MetricCard
              label="CLS"
              value={metrics.cls}
              unit=""
              description="Cumulative Layout Shift"
              status={clsStatus}
            />
            <MetricCard
              label="TTFB"
              value={metrics.ttfb}
              unit="ms"
              description="Time to First Byte"
              status={ttfbStatus}
            />
          </div>
        </div>

        {/* AI Operations Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            AI Operations Performance
          </h3>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <OperationMetricsTable operations={operations} />
          </div>
        </div>

        {/* Lighthouse Recommendations */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Optimization Recommendations
          </h3>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <LighthouseRecommendations metrics={metrics} />
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleExport}
            variant="outline"
            className="gap-2"
            aria-label="Export performance metrics as JSON"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Export Metrics
          </Button>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
          Last updated: {new Date().toLocaleTimeString()} (refresh #
          {refreshCount})
        </p>
      </div>
    );
  }
);

PerformanceMonitoringDashboard.displayName = 'PerformanceMonitoringDashboard';

export default PerformanceMonitoringDashboard;
