// src/components/ds/primitives/Badge.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'bg-neutral-700 text-neutral-200 border border-neutral-600',
        primary: 'bg-violet-600 text-white border border-transparent',
        action: 'bg-coral-500 text-white border border-transparent',
        success: 'bg-amber-500 text-white border border-transparent',
        warning: 'bg-transparent text-amber-400 border border-amber-500',
        error: 'bg-red-700 text-white border border-transparent',
        outline: 'bg-transparent text-neutral-300 border border-neutral-600',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'action'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const dotColorMap: Record<BadgeVariant, string> = {
  default: 'bg-neutral-400',
  primary: 'bg-violet-300',
  action: 'bg-coral-300',
  success: 'bg-amber-300',
  warning: 'bg-amber-400',
  error: 'bg-red-300',
  outline: 'bg-neutral-400',
};

function Badge({
  className,
  variant = 'default',
  size,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'inline-block w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotColorMap[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
