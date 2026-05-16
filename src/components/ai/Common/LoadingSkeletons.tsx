/**
 * LoadingSkeletons component — animated placeholder screens for AI content.
 *
 * Renders skeleton layouts that match the shape of the final content so the
 * page doesn't jump when real data arrives.  Four variants are supported:
 *
 * - `message`    – Q&A message row (avatar circle + text lines)
 * - `question`   – Assignment question card (title + option rows)
 * - `statistics` – Statistics card (large number + chart bar)
 * - `generic`    – Generic multi-line text block (default)
 *
 * @see Requirements 9
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { LoadingSkeletonsProps } from '@/services/ai/types';

// ---------------------------------------------------------------------------
// Variant renderers
// ---------------------------------------------------------------------------

/** Skeleton for a single Q&A message (avatar + text lines). */
function MessageSkeleton() {
  return (
    <div className="flex items-start gap-3 w-full">
      {/* Avatar circle */}
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      {/* Text lines */}
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

/** Skeleton for an assignment question card (title + option rows). */
function QuestionSkeleton() {
  return (
    <div className="w-full rounded-lg border p-4 space-y-3">
      {/* Question title */}
      <Skeleton className="h-5 w-4/5" />
      {/* Option rows */}
      <div className="space-y-2 pl-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full shrink-0" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full shrink-0" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full shrink-0" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full shrink-0" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for a statistics card (large metric number + chart bars). */
function StatisticsSkeleton() {
  return (
    <div className="w-full rounded-lg border p-4 space-y-4">
      {/* Card header */}
      <Skeleton className="h-4 w-1/3" />
      {/* Large metric number */}
      <Skeleton className="h-10 w-1/4" />
      {/* Mini bar chart */}
      <div className="flex items-end gap-1 h-16">
        {[60, 80, 45, 90, 55, 70, 40].map((height, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Generic multi-line text skeleton. */
function GenericSkeleton() {
  return (
    <div className="w-full space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Map variant → renderer
// ---------------------------------------------------------------------------

const variantRenderers: Record<
  NonNullable<LoadingSkeletonsProps['variant']>,
  () => React.ReactElement
> = {
  message: MessageSkeleton,
  question: QuestionSkeleton,
  statistics: StatisticsSkeleton,
  generic: GenericSkeleton,
};

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

/**
 * Renders `count` animated skeleton placeholders for the given `variant`.
 *
 * @example
 * // Show 3 message skeletons while conversation history loads
 * <LoadingSkeletons count={3} variant="message" />
 *
 * @example
 * // Show 5 question skeletons while an assignment generates
 * <LoadingSkeletons count={5} variant="question" />
 */
export function LoadingSkeletons({
  count = 3,
  variant = 'generic',
  className,
}: LoadingSkeletonsProps): React.JSX.Element {
  const SkeletonItem = variantRenderers[variant];

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading..."
      className={cn('space-y-4', className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonItem key={index} />
      ))}
      {/* Visually hidden text for screen readers */}
      <span className="sr-only">Loading content, please wait…</span>
    </div>
  );
}

export default LoadingSkeletons;
