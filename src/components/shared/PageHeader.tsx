// src/components/shared/PageHeader.tsx
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('border-b border-neutral-700 pb-6 mb-8', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-50">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
