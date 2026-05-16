// src/components/ds/primitives/Skeleton.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  lines?: number;
}

function SkeletonBlock({
  className,
  width,
  height,
  rounded,
  style,
  ...props
}: Omit<SkeletonProps, 'lines'>) {
  return (
    <div
      className={cn(
        'animate-shimmer bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%]',
        rounded ? 'rounded-full' : 'rounded-md',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
}

function Skeleton({
  lines,
  width,
  height,
  rounded,
  className,
  ...props
}: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div
        className={cn('space-y-2', className)}
        aria-busy="true"
        aria-label="Loading"
        {...props}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBlock
            key={i}
            height={height ?? 16}
            width={i === lines - 1 ? '75%' : '100%'}
            rounded={rounded}
          />
        ))}
      </div>
    );
  }

  return (
    <SkeletonBlock
      width={width ?? '100%'}
      height={height ?? 16}
      rounded={rounded}
      className={className}
      aria-busy="true"
      aria-label="Loading"
      {...props}
    />
  );
}

export { Skeleton };
