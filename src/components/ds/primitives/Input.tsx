// src/components/ds/primitives/Input.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'w-full bg-[#1e293b] text-neutral-100 rounded-md',
    'border transition-all duration-200',
    'placeholder:text-neutral-500',
    'focus:outline-none',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        default:
          'border-neutral-600 focus:border-violet-500 focus:shadow-glow-violet',
        search:
          'border-neutral-600 focus:border-violet-500 focus:shadow-glow-violet pl-9',
        error: 'border-red-500 focus:border-red-500',
        success: 'border-amber-500 focus:border-amber-500',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-3 text-sm',
        lg: 'h-11 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type InputVariant = 'default' | 'search' | 'error' | 'success';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      hint,
      error,
      leadingIcon,
      trailingIcon,
      loading = false,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const effectiveVariant = error ? 'error' : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-200 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <span className="absolute left-3 text-neutral-400 pointer-events-none flex items-center">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant: effectiveVariant, size }),
              leadingIcon && 'pl-9',
              (trailingIcon || loading) && 'pr-9',
              className
            )}
            {...props}
          />
          {(loading || trailingIcon) && (
            <span className="absolute right-3 text-neutral-400 flex items-center pointer-events-none">
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                trailingIcon
              )}
            </span>
          )}
        </div>
        {(error || hint) && (
          <p
            className={cn(
              'mt-1 text-xs',
              error ? 'text-red-400' : 'text-neutral-500'
            )}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
