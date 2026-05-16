// src/components/features/dashboard/StatCard.tsx
import { Card, CardContent } from '@/components/ds/primitives/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendValue,
}: StatCardProps) {
  return (
    <Card variant="elevated">
      <CardContent className="pt-4">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-600/10 flex items-center justify-center text-violet-400">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-400">{label}</p>
            <p className="font-serif text-2xl font-bold text-neutral-50">
              {value}
            </p>
            {trend && trendValue && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs mt-0.5',
                  trend === 'up' ? 'text-amber-400' : 'text-coral-400'
                )}
              >
                {trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trendValue}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
