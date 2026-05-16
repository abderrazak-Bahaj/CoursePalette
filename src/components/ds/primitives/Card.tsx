import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { colors, shadows, transitions } from '../tokens';

// ============================================================================
// CARD VARIANTS
// ============================================================================

const cardVariants = cva(
  cn(
    'rounded-lg',
    'transition-all duration-200',
    'bg-neutral-800 text-neutral-100'
  ),
  {
    variants: {
      variant: {
        // Elevated - Default with soft shadow
        elevated: cn(
          'shadow-md hover:shadow-lg',
          'border border-neutral-700/50'
        ),

        // Flat - Minimal, no shadow
        flat: cn('shadow-none', 'border border-neutral-700/30'),

        // Interactive - Violet border + glow on hover/focus
        interactive: cn(
          'border border-neutral-700/50',
          'hover:border-violet-500/50 hover:shadow-md',
          'focus-within:border-violet-500 focus-within:shadow-lg',
          'cursor-pointer'
        ),

        // Accent - Colored left border for semantic highlights
        accent: cn(
          'border-l-4',
          'shadow-md hover:shadow-lg',
          'border-r border-t border-b border-neutral-700/50'
        ),
      },

      size: {
        sm: 'p-3 rounded-md',
        md: 'p-4 rounded-lg',
        lg: 'p-5 rounded-lg',
      },

      accentColor: {
        violet: 'border-l-violet-500',
        coral: 'border-l-coral-500',
        amber: 'border-l-amber-500',
      },
    },

    defaultVariants: {
      variant: 'elevated',
      size: 'md',
    },
  }
);

// ============================================================================
// CARD COMPONENT
// ============================================================================

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Whether the card is clickable/interactive
   */
  interactive?: boolean;

  /**
   * Callback when card is clicked (if interactive)
   */
  onClick?: () => void;

  /**
   * Whether to show a glow effect on hover
   */
  showGlow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      size,
      accentColor,
      interactive = false,
      onClick,
      showGlow = false,
      children,
      ...props
    },
    ref
  ) => {
    // Determine if we should use interactive variant
    const effectiveVariant = interactive ? 'interactive' : variant;

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({
            variant: effectiveVariant,
            size,
            accentColor: variant === 'accent' ? accentColor : undefined,
          }),
          interactive && 'hover:scale-105 active:scale-95',
          showGlow && 'hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]',
          className
        )}
        onClick={onClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onClick?.();
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// CARD HEADER
// ============================================================================

const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

// ============================================================================
// CARD TITLE
// ============================================================================

const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

// ============================================================================
// CARD DESCRIPTION
// ============================================================================

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-400', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

// ============================================================================
// CARD CONTENT
// ============================================================================

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));

CardContent.displayName = 'CardContent';

// ============================================================================
// CARD FOOTER
// ============================================================================

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};
