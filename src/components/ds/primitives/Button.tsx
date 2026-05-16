// src/components/ds/primitives/Button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles — shared across all variants
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium transition-colors duration-200',
    'disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-none focus-visible:shadow-glow-violet',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        // Violet — Authority, navigation, primary actions
        primary: [
          'bg-violet-600 text-white rounded-lg',
          'hover:bg-violet-700 active:bg-violet-800',
        ],
        // Coral — CTAs, enroll, high-energy actions
        action: [
          'bg-coral-500 text-white rounded-lg',
          'hover:bg-coral-600 active:bg-coral-700',
        ],
        // Amber — Achievements, certificates, completions
        success: [
          'bg-amber-500 text-white rounded-lg',
          'hover:bg-amber-600 active:bg-amber-700',
        ],
        // Neutral outline — Cancel, back, secondary
        secondary: [
          'bg-transparent text-neutral-200 rounded-lg',
          'border border-neutral-600',
          'hover:bg-neutral-700/50 active:bg-neutral-700',
        ],
        // Red — Destructive actions (delete, remove)
        danger: [
          'bg-transparent text-red-400 rounded-lg',
          'border border-red-900',
          'hover:bg-red-900/50 hover:text-red-300 active:bg-red-900',
        ],
        // Ghost — Nav links, breadcrumbs, icon buttons
        ghost: [
          'bg-transparent border-none text-neutral-300 rounded-lg',
          'hover:bg-neutral-700/50 hover:text-neutral-100',
          'active:bg-neutral-700',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-lg font-semibold',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariant =
  | 'primary'
  | 'action'
  | 'success'
  | 'secondary'
  | 'danger'
  | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      icon,
      iconPosition = 'left',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    // When asChild=true, Slot requires exactly one child element.
    // Pass children directly — icons are not supported with asChild.
    if (asChild) {
      return (
        <Comp
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    const leadingIcon = loading ? (
      <Loader2 className="animate-spin" />
    ) : iconPosition === 'left' ? (
      icon
    ) : null;

    const trailingIcon = !loading && iconPosition === 'right' ? icon : null;

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {leadingIcon}
        {children}
        {trailingIcon}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
