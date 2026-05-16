// src/components/shared/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ds/primitives/Separator';
import { cn } from '@/lib/utils';

export interface SidebarNavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export interface SidebarProps {
  items: SidebarNavItem[];
  footer?: React.ReactNode;
  collapsed?: boolean;
}

export function Sidebar({ items, footer, collapsed = false }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path.endsWith('/dashboard')) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[#0f172a] border-r border-neutral-700',
        'transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <nav className="flex-1 px-2 py-4 space-y-1">
        {items.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
              'transition-all duration-200',
              isActive(to)
                ? 'bg-violet-600/10 text-violet-400 border-l-2 border-violet-500 pl-[10px]'
                : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-neutral-100',
              'focus-visible:outline-none focus-visible:shadow-glow-violet'
            )}
            aria-current={isActive(to) ? 'page' : undefined}
          >
            <span className="flex-shrink-0 w-4 h-4">{icon}</span>
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>
      {footer && (
        <>
          <Separator />
          <div className="p-3">{footer}</div>
        </>
      )}
    </aside>
  );
}
