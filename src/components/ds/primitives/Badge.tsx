import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// BADGE VARIANTS
// ============================================================================

const badgeVariants = cva(
  cn(
    'inline-flex items-center gap-1.5',
    'font-medium rounded-full',
    'transition-colors duration-200',
    'whitespace-nowrap'
  ),
  {
    variants: {
      variant: {
        // Solid - Filled background with white text
        solid: 'text-white',

        // Outline - Transparent background with colored border
        outline: 'bg-transparent border',

        // Subtle - Muted background with darker text
        subtle: 'bg-opacity-10',
      },

      color: {
        // Violet - Status, information, default
        violet: {
          solid: 'bg-violet-600',
          outline: 'border-violet-500 text-violet-400',
          subtle: 'bg-violet-500 text-violet-200',
        },

        // Coral - Alert, action required, urgent
        coral: {
          solid: 'bg-coral-500',
          outline: 'border-coral-500 text-coral-400',
          subtle: 'bg-coral-500 text-coral-100',
        },

        // Amber - Warning, achievement, progress
        amber: {
          solid: 'bg-amber-500',
          outline: 'border-amber-500 text-amber-400',
          subtle: 'bg-amber-500 text-amber-100',
        },

        // Green - Success, completed, active
        green: {
          solid: 'bg-green-600',
          outline: 'border-green-500 text-green-400',
          subtle: 'bg-green-500 text-green-100',
        },

        // Gray - Neutral, inactive, disabled
        gray: {
          solid: 'bg-neutral-600 text-neutral-100',
          outline: 'border-neutral-500 text-neutral-400',
          subtle: 'bg-neutral-700 text-neutral-300',
        },
      },

      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
    },

    defaultVariants: {
      variant: 'solid',
      color: 'violet',
      size: 'md',
    },

    compoundVariants: [
      // Solid variants
      {
        variant: 'solid',
        color: 'violet',
        className: 'bg-violet-600 text-white',
      },
      {
        variant: 'solid',
        color: 'coral',
        className: 'bg-coral-500 text-white',
      },
      {
        variant: 'solid',
        color: 'amber',
        className: 'bg-amber-500 text-white',
      },
      {
        variant: 'solid',
        color: 'green',
        className: 'bg-green-600 text-white',
      },
      {
        variant: 'solid',
        color: 'gray',
        className: 'bg-neutral-600 text-neutral-100',
      },

      // Outline variants
      {
        variant: 'outline',
        color: 'violet',
        className: 'border border-violet-500 text-violet-400',
      },
      {
        variant: 'outline',
        color: 'coral',
        className: 'border border-coral-500 text-coral-400',
      },
      {
        variant: 'outline',
        color: 'amber',
        className: 'border border-amber-500 text-amber-400',
      },
      {
        variant: 'outline',
        color: 'green',
        className: 'border border-green-500 text-green-400',
      },
      {
        variant: 'outline',
        color: 'gray',
        className: 'border border-neutral-500 text-neutral-400',
      },

      // Subtle variants
      {
        variant: 'subtle',
        color: 'violet',
        className: 'bg-violet-500/10 text-violet-200',
      },
      {
        variant: 'subtle',
        color: 'coral',
        className: 'bg-coral-500/10 text-coral-100',
      },
      {
        variant: 'subtle',
        color: 'amber',
        className: 'bg-amber-500/10 text-amber-100',
      },
      {
        variant: 'subtle',
        color: 'green',
        className: 'bg-green-500/10 text-green-100',
      },
      {
        variant: 'subtle',
        color: 'gray',
        className: 'bg-neutral-700/50 text-neutral-300',
      },
    ],
  }
);

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Icon to display before the text
   */
  icon?: React.ReactNode;

  /**
   * Icon to display after the text
   */
  iconRight?: React.ReactNode;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant, color, size, icon, iconRight, children, ...props },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, color, size }), className)}
        {...props}
      >
        {/* Left icon */}
        {icon && <span className="flex-shrink-0">{icon}</span>}

        {/* Text content */}
        {children}

        {/* Right icon */}
        {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
