// src/components/ds/primitives/Card.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva('rounded-lg transition-all duration-200', {
  variants: {
    variant: {
      elevated: 'bg-[#1e293b] border border-neutral-700 shadow-md',
      flat: 'bg-transparent border border-neutral-700',
      interactive:
        'bg-[#1e293b] border border-neutral-700 shadow-md cursor-pointer hover:border-violet-500 hover:shadow-glow-violet focus-visible:outline-none focus-visible:border-violet-500 focus-visible:shadow-glow-violet',
      accent:
        'bg-[#1e293b] border-r border-t border-b border-neutral-700 shadow-md border-l-4',
    },
    size: {
      sm: 'p-3 rounded-md',
      md: 'p-4 rounded-lg',
      lg: 'p-6 rounded-xl',
    },
    accentColor: {
      violet: 'border-l-violet-600',
      coral: 'border-l-coral-500',
      amber: 'border-l-amber-500',
    },
  },
  defaultVariants: {
    variant: 'elevated',
    size: 'md',
  },
});

export type CardVariant = 'elevated' | 'flat' | 'interactive' | 'accent';
export type CardAccentColor = 'violet' | 'coral' | 'amber';
export type CardSize = 'sm' | 'md' | 'lg';

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, accentColor, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({
          variant,
          size,
          accentColor: variant === 'accent' ? accentColor : undefined,
        }),
        className
      )}
      tabIndex={variant === 'interactive' ? 0 : undefined}
      role={variant === 'interactive' ? 'button' : undefined}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
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

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-serif text-lg font-semibold leading-none tracking-tight text-neutral-50',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
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

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
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
