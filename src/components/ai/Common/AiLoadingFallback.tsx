/**
 * AiLoadingFallback
 *
 * Lightweight fallback component used as the Suspense boundary placeholder
 * while AI components are being lazy-loaded. Renders a skeleton that matches
 * the approximate shape of the AI panel so there is no jarring layout shift
 * when the real component mounts.
 *
 * @see Requirements 22 (Performance Optimization – Lazy Loading)
 * @see Requirements 9  (Loading States and Skeleton Screens)
 */

import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AiLoadingFallbackProps {
  /** Visual variant — controls the skeleton shape. */
  variant?: 'panel' | 'inline' | 'modal' | 'card';
  /** Optional extra CSS class applied to the outermost element. */
  className?: string;
  /** Accessible label for screen readers. */
  label?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Skeleton placeholder shown while an AI component chunk is loading.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<AiLoadingFallback variant="panel" />}>
 *   <LazyAskAiComponent ... />
 * </Suspense>
 * ```
 */
export function AiLoadingFallback({
  variant = 'inline',
  className,
  label = 'Loading AI component…',
}: AiLoadingFallbackProps) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className={cn(getVariantClasses(variant), className)}
    >
      {variant === 'panel' && <PanelSkeleton />}
      {variant === 'modal' && <ModalSkeleton />}
      {variant === 'card' && <CardSkeleton />}
      {variant === 'inline' && <InlineSkeleton />}

      {/* Visually hidden text for screen readers */}
      <span className="sr-only">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Variant class helpers
// ---------------------------------------------------------------------------

function getVariantClasses(variant: AiLoadingFallbackProps['variant']) {
  switch (variant) {
    case 'panel':
      return 'flex flex-col h-full w-full bg-background';
    case 'modal':
      return 'flex flex-col w-full max-w-3xl bg-background rounded-xl border border-border p-6';
    case 'card':
      return 'rounded-xl border bg-card shadow-sm p-5';
    case 'inline':
    default:
      return 'flex items-center justify-center p-6';
  }
}

// ---------------------------------------------------------------------------
// Skeleton shapes
// ---------------------------------------------------------------------------

/** Full-height panel skeleton (used for the lesson page slide-over). */
function PanelSkeleton() {
  return (
    <>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot
            className="h-5 w-5 text-muted-foreground/40"
            aria-hidden="true"
          />
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Tab bar */}
      <div className="flex shrink-0 border-b">
        <div className="flex-1 px-4 py-2.5">
          <div className="mx-auto h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex-1 px-4 py-2.5">
          <div className="mx-auto h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-24 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </>
  );
}

/** Modal skeleton (used for the assignment enhancement dialog). */
function ModalSkeleton() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Two-column comparison skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-32 w-full animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-32 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </>
  );
}

/** Card skeleton (used for the submission pre-grade panel). */
function CardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      <div className="mt-4 flex gap-2">
        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

/** Inline spinner skeleton (generic fallback). */
function InlineSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Bot className="h-8 w-8 animate-pulse" aria-hidden="true" />
      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
    </div>
  );
}

export default AiLoadingFallback;
