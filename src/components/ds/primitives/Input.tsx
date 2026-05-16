import React, { forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

// ============================================================================
// INPUT VARIANTS
// ============================================================================

const inputVariants = cva(
  cn(
    'w-full',
    'bg-neutral-800 text-neutral-100',
    'border border-neutral-600',
    'rounded-md',
    'px-3 py-2',
    'text-sm',
    'placeholder:text-neutral-500',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900',
    'focus:border-violet-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'disabled:bg-neutral-900',
    'read-only:bg-neutral-900 read-only:cursor-default'
  ),
  {
    variants: {
      size: {
        sm: 'h-7 text-xs px-2',
        md: 'h-9 text-sm px-3',
        lg: 'h-11 text-base px-4',
      },

      state: {
        default: 'border-neutral-600',
        focused: 'border-violet-500 ring-2 ring-violet-500/20',
        error: 'border-red-500 focus:ring-red-500/20',
        success: 'border-green-500 focus:ring-green-500/20',
        disabled: 'opacity-50 cursor-not-allowed',
      },
    },

    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
);

// ============================================================================
// TEXT INPUT COMPONENT
// ============================================================================

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  /**
   * Label text
   */
  label?: string;

  /**
   * Helper text below input
   */
  helperText?: string;

  /**
   * Error message (replaces helper text)
   */
  error?: string;

  /**
   * Icon to display on the left
   */
  icon?: React.ReactNode;

  /**
   * Icon to display on the right
   */
  iconRight?: React.ReactNode;

  /**
   * Whether to show a clear button
   */
  clearable?: boolean;

  /**
   * Callback when clear button is clicked
   */
  onClear?: () => void;

  /**
   * Whether to show character count
   */
  showCharCount?: boolean;

  /**
   * Maximum character count
   */
  maxLength?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      size,
      state,
      label,
      helperText,
      error,
      icon,
      iconRight,
      clearable = false,
      onClear,
      showCharCount = false,
      maxLength,
      value,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(
      typeof value === 'string' ? value.length : 0
    );

    // Determine state
    const effectiveState = error
      ? 'error'
      : disabled
        ? 'disabled'
        : isFocused
          ? 'focused'
          : 'default';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    const handleClear = () => {
      onClear?.();
      setCharCount(0);
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-neutral-200 mb-2">
            {label}
          </label>
        )}

        {/* Input container */}
        <div className="relative flex items-center">
          {/* Left icon */}
          {icon && (
            <div className="absolute left-3 flex items-center text-neutral-400 pointer-events-none">
              {icon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            className={cn(
              inputVariants({ size, state: effectiveState }),
              icon && 'pl-10',
              (iconRight || clearable) && 'pr-10',
              className
            )}
            value={value}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            disabled={disabled}
            maxLength={maxLength}
            {...props}
          />

          {/* Right icon or clear button */}
          <div className="absolute right-3 flex items-center gap-2">
            {clearable && value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-neutral-400 hover:text-neutral-300 transition-colors"
                tabIndex={-1}
              >
                <X size={16} />
              </button>
            )}

            {iconRight && !clearable && (
              <div className="text-neutral-400 pointer-events-none">
                {iconRight}
              </div>
            )}
          </div>
        </div>

        {/* Helper text or error message */}
        <div className="mt-1 flex justify-between items-center">
          <div>
            {error ? (
              <p className="text-xs text-red-500">{error}</p>
            ) : helperText ? (
              <p className="text-xs text-neutral-400">{helperText}</p>
            ) : null}
          </div>

          {/* Character count */}
          {showCharCount && maxLength && (
            <span className="text-xs text-neutral-500">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  /**
   * Label text
   */
  label?: string;

  /**
   * Helper text below textarea
   */
  helperText?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Whether to show character count
   */
  showCharCount?: boolean;

  /**
   * Number of rows
   */
  rows?: number;

  /**
   * Whether to allow resize
   */
  resizable?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      size,
      label,
      helperText,
      error,
      showCharCount = false,
      maxLength,
      value,
      onChange,
      disabled,
      rows = 4,
      resizable = true,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(
      typeof value === 'string' ? value.length : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-neutral-200 mb-2">
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          className={cn(
            inputVariants({ size }),
            'min-h-[100px]',
            resizable ? 'resize' : 'resize-none',
            error && 'border-red-500 focus:ring-red-500/20',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          {...props}
        />

        {/* Helper text or error message */}
        <div className="mt-1 flex justify-between items-center">
          <div>
            {error ? (
              <p className="text-xs text-red-500">{error}</p>
            ) : helperText ? (
              <p className="text-xs text-neutral-400">{helperText}</p>
            ) : null}
          </div>

          {/* Character count */}
          {showCharCount && maxLength && (
            <span className="text-xs text-neutral-500">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================================================
// SELECT COMPONENT
// ============================================================================

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Label text
   */
  label?: string;

  /**
   * Helper text below select
   */
  helperText?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Select options
   */
  options: SelectOption[];

  /**
   * Placeholder text
   */
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      size,
      label,
      helperText,
      error,
      options,
      placeholder,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-neutral-200 mb-2">
            {label}
          </label>
        )}

        {/* Select */}
        <select
          ref={ref}
          className={cn(
            inputVariants({ size }),
            'appearance-none cursor-pointer',
            'bg-neutral-800 bg-no-repeat',
            'pr-10',
            error && 'border-red-500 focus:ring-red-500/20',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1rem',
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Helper text or error message */}
        {error ? (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-neutral-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Input, Textarea, Select, inputVariants };
