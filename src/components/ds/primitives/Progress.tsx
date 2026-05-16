import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// LINEAR PROGRESS COMPONENT
// ============================================================================

interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Progress value (0-100)
   */
  value: number;

  /**
   * Color variant
   */
  color?: 'violet' | 'coral' | 'amber' | 'green';

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to show percentage label
   */
  showLabel?: boolean;

  /**
   * Custom label text
   */
  label?: string | React.ReactNode;

  /**
   * Whether to animate the progress
   */
  animated?: boolean;
}

const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(
  (
    {
      className,
      value = 0,
      color = 'violet',
      size = 'md',
      showLabel = false,
      label,
      animated = true,
      ...props
    },
    ref
  ) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(Math.max(value, 0), 100);

    // Color classes
    const colorClasses = {
      violet: 'bg-violet-600',
      coral: 'bg-coral-500',
      amber: 'bg-amber-500',
      green: 'bg-green-600',
    };

    // Size classes
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* Label */}
        {(showLabel || label) && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-300">
              {label || `${clampedValue}%`}
            </span>
          </div>
        )}

        {/* Progress bar container */}
        <div
          className={cn(
            'w-full bg-neutral-700 rounded-full overflow-hidden',
            sizeClasses[size]
          )}
        >
          {/* Progress fill */}
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out',
              colorClasses[color],
              animated && 'animate-pulse'
            )}
            style={{
              width: `${clampedValue}%`,
            }}
          />
        </div>
      </div>
    );
  }
);

LinearProgress.displayName = 'LinearProgress';

// ============================================================================
// CIRCULAR PROGRESS COMPONENT
// ============================================================================

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Progress value (0-100)
   */
  value: number;

  /**
   * Color variant
   */
  color?: 'violet' | 'coral' | 'amber' | 'green';

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to show percentage label in center
   */
  showLabel?: boolean;

  /**
   * Custom label/icon in center
   */
  label?: string | React.ReactNode;

  /**
   * Stroke width
   */
  strokeWidth?: number;

  /**
   * Whether to animate the progress
   */
  animated?: boolean;
}

const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      className,
      value = 0,
      color = 'violet',
      size = 'md',
      showLabel = false,
      label,
      strokeWidth = 4,
      animated = true,
      ...props
    },
    ref
  ) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(Math.max(value, 0), 100);

    // Size configuration
    const sizeConfig = {
      sm: { width: 48, height: 48, radius: 20 },
      md: { width: 64, height: 64, radius: 28 },
      lg: { width: 96, height: 96, radius: 42 },
    };

    const config = sizeConfig[size];
    const circumference = 2 * Math.PI * config.radius;
    const offset = circumference - (clampedValue / 100) * circumference;

    // Color classes for SVG
    const colorClasses = {
      violet: '#7c3aed',
      coral: '#f43f5e',
      amber: '#f59e0b',
      green: '#22c55e',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center', className)}
        {...props}
      >
        <div
          className="relative"
          style={{ width: config.width, height: config.height }}
        >
          {/* SVG Circle */}
          <svg
            width={config.width}
            height={config.height}
            className={animated ? 'animate-spin' : ''}
            style={{
              transform: 'rotate(-90deg)',
              animationDuration: '2s',
            }}
          >
            {/* Background circle */}
            <circle
              cx={config.width / 2}
              cy={config.height / 2}
              r={config.radius}
              fill="none"
              stroke="#374151"
              strokeWidth={strokeWidth}
            />

            {/* Progress circle */}
            <circle
              cx={config.width / 2}
              cy={config.height / 2}
              r={config.radius}
              fill="none"
              stroke={colorClasses[color]}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.5s ease-out',
              }}
            />
          </svg>

          {/* Center label */}
          {(showLabel || label) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-neutral-200">
                {label || `${clampedValue}%`}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

// ============================================================================
// STEPS PROGRESS COMPONENT
// ============================================================================

interface StepsProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Current step (1-indexed)
   */
  current: number;

  /**
   * Total number of steps
   */
  total: number;

  /**
   * Color variant
   */
  color?: 'violet' | 'coral' | 'amber' | 'green';

  /**
   * Step labels
   */
  labels?: string[];

  /**
   * Whether to show labels below steps
   */
  showLabels?: boolean;
}

const StepsProgress = forwardRef<HTMLDivElement, StepsProgressProps>(
  (
    {
      className,
      current = 1,
      total = 5,
      color = 'violet',
      labels = [],
      showLabels = false,
      ...props
    },
    ref
  ) => {
    // Color classes
    const colorClasses = {
      violet: {
        completed: 'bg-violet-600 border-violet-600',
        current: 'border-violet-500 text-violet-400',
        future: 'border-neutral-600 text-neutral-500',
      },
      coral: {
        completed: 'bg-coral-500 border-coral-500',
        current: 'border-coral-500 text-coral-400',
        future: 'border-neutral-600 text-neutral-500',
      },
      amber: {
        completed: 'bg-amber-500 border-amber-500',
        current: 'border-amber-500 text-amber-400',
        future: 'border-neutral-600 text-neutral-500',
      },
      green: {
        completed: 'bg-green-600 border-green-600',
        current: 'border-green-500 text-green-400',
        future: 'border-neutral-600 text-neutral-500',
      },
    };

    const colors_config = colorClasses[color];

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* Steps container */}
        <div className="flex items-center justify-between">
          {Array.from({ length: total }).map((_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < current;
            const isCurrent = stepNumber === current;
            const isFuture = stepNumber > current;

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                {/* Step circle */}
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold transition-all',
                    isCompleted && colors_config.completed,
                    isCurrent &&
                      `border-2 ${colors_config.current} bg-transparent`,
                    isFuture &&
                      `border-2 ${colors_config.future} bg-transparent`
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span
                      className={
                        isCurrent ? colors_config.current : colors_config.future
                      }
                    >
                      {stepNumber}
                    </span>
                  )}
                </div>

                {/* Step label */}
                {showLabels && labels[index] && (
                  <span className="text-xs text-neutral-400 mt-2 text-center">
                    {labels[index]}
                  </span>
                )}

                {/* Connector line */}
                {index < total - 1 && (
                  <div
                    className={cn(
                      'absolute h-1 w-12 top-4 left-1/2 ml-4',
                      isCompleted ? colors_config.completed : 'bg-neutral-700'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

StepsProgress.displayName = 'StepsProgress';

// ============================================================================
// PROGRESS COMPONENT (Wrapper)
// ============================================================================

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Progress variant
   */
  variant?: 'linear' | 'circular' | 'steps';

  /**
   * Progress value (0-100) for linear/circular
   */
  value?: number;

  /**
   * Current step for steps variant
   */
  current?: number;

  /**
   * Total steps for steps variant
   */
  total?: number;

  /**
   * Color variant
   */
  color?: 'violet' | 'coral' | 'amber' | 'green';

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to show label
   */
  showLabel?: boolean;

  /**
   * Custom label
   */
  label?: string | React.ReactNode;

  /**
   * Step labels for steps variant
   */
  labels?: string[];

  /**
   * Whether to animate
   */
  animated?: boolean;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      variant = 'linear',
      value = 0,
      current = 1,
      total = 5,
      color = 'violet',
      size = 'md',
      showLabel = false,
      label,
      labels = [],
      animated = true,
      ...props
    },
    ref
  ) => {
    if (variant === 'circular') {
      return (
        <CircularProgress
          ref={ref}
          value={value}
          color={color}
          size={size}
          showLabel={showLabel}
          label={label}
          animated={animated}
          {...props}
        />
      );
    }

    if (variant === 'steps') {
      return (
        <StepsProgress
          ref={ref}
          current={current}
          total={total}
          color={color}
          labels={labels}
          showLabels={showLabel}
          {...props}
        />
      );
    }

    // Default to linear
    return (
      <LinearProgress
        ref={ref}
        value={value}
        color={color}
        size={size}
        showLabel={showLabel}
        label={label}
        animated={animated}
        {...props}
      />
    );
  }
);

Progress.displayName = 'Progress';

export {
  Progress,
  LinearProgress,
  CircularProgress,
  StepsProgress,
  type ProgressProps,
  type LinearProgressProps,
  type CircularProgressProps,
  type StepsProgressProps,
};
