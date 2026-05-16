// src/components/features/dashboard/DashboardGrid.tsx
import { StatCard, StatCardProps } from './StatCard';

export interface DashboardGridProps {
  stats: StatCardProps[];
}

export function DashboardGrid({ stats }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
}
