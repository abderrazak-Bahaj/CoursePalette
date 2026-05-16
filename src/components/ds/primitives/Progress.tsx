// src/components/ds/primitives/Progress.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export type ProgressVariant = 'default' | 'success' | 'action';
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  label?: string;
  showValue?: boolean;
  animated?: boolean;
}

const fillColorMap: Record<ProgressVariant, string> = {
  default: 'bg-violet-600',
  success: 'bg-amber-500',
  action: 'bg-coral-500',
};

const sizeMap: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      variant = 'default',
      size = 'md',
      label,
      showValue = false,
      animated = true,
      ...props
    },
    ref
  ) => {
    const clamped = Math.min(Math.max(value, 0), 100);

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-1.5">
            {label && <span className="text-sm text-neutral-300">{label}</span>}
            {showValue && (
              <span className="text-sm font-medium text-neutral-300">
                {clamped}%
              </span>
            )}
          </div>
        )}
        <div
          className={cn(
            'w-full bg-neutral-700 rounded-full overflow-hidden',
            sizeMap[size]
          )}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        >
          <div
            className={cn(
              'h-full rounded-full',
              fillColorMap[variant],
              animated && 'transition-[width] duration-500 ease-out'
            )}
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
