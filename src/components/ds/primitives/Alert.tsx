// src/components/ds/primitives/Alert.tsx
import * as React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  description: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

const variantConfig: Record<
  AlertVariant,
  { border: string; icon: React.ReactNode; titleColor: string }
> = {
  info: {
    border: 'border-l-violet-500',
    icon: <Info className="w-4 h-4 text-violet-400" />,
    titleColor: 'text-violet-300',
  },
  success: {
    border: 'border-l-amber-500',
    icon: <CheckCircle className="w-4 h-4 text-amber-400" />,
    titleColor: 'text-amber-300',
  },
  warning: {
    border: 'border-l-amber-300',
    icon: <AlertTriangle className="w-4 h-4 text-amber-300" />,
    titleColor: 'text-amber-200',
  },
  error: {
    border: 'border-l-red-500',
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    titleColor: 'text-red-300',
  },
};

function Alert({
  className,
  variant = 'info',
  title,
  description,
  dismissible = false,
  onDismiss,
  icon,
  ...props
}: AlertProps) {
  const config = variantConfig[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative flex gap-3 p-4 rounded-lg',
        'bg-[#1e293b] border border-neutral-700 border-l-4',
        config.border,
        className
      )}
      {...props}
    >
      <span className="flex-shrink-0 mt-0.5">{icon ?? config.icon}</span>
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn('text-sm font-semibold mb-0.5', config.titleColor)}>
            {title}
          </p>
        )}
        <p className="text-sm text-neutral-300">{description}</p>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 text-neutral-500 hover:text-neutral-300 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export { Alert };
