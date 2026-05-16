// src/components/ds/primitives/Avatar.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarRole = 'admin' | 'teacher' | 'student';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  online?: boolean;
  role?: AvatarRole;
}

const sizeMap: Record<
  AvatarSize,
  { container: string; text: string; dot: string }
> = {
  xs: { container: 'w-6 h-6', text: 'text-xs', dot: 'w-1.5 h-1.5' },
  sm: { container: 'w-8 h-8', text: 'text-xs', dot: 'w-2 h-2' },
  md: { container: 'w-10 h-10', text: 'text-sm', dot: 'w-2.5 h-2.5' },
  lg: { container: 'w-12 h-12', text: 'text-base', dot: 'w-3 h-3' },
  xl: { container: 'w-16 h-16', text: 'text-lg', dot: 'w-3.5 h-3.5' },
};

const roleRingMap: Record<AvatarRole, string> = {
  admin: 'ring-2 ring-violet-500',
  teacher: 'ring-2 ring-coral-500',
  student: 'ring-2 ring-amber-500',
};

function Avatar({
  className,
  src,
  alt = '',
  fallback,
  size = 'md',
  online,
  role,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const sizes = sizeMap[size];

  return (
    <div
      className={cn('relative inline-flex flex-shrink-0', className)}
      {...props}
    >
      <div
        className={cn(
          'rounded-full overflow-hidden bg-neutral-700 flex items-center justify-center',
          sizes.container,
          role && roleRingMap[role],
          'ring-offset-2 ring-offset-[#0f172a]'
        )}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span
            className={cn(
              'font-medium text-neutral-300 select-none uppercase',
              sizes.text
            )}
          >
            {fallback?.slice(0, 2) ?? alt?.slice(0, 2) ?? '?'}
          </span>
        )}
      </div>
      {online && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full bg-green-500 ring-2 ring-[#0f172a]',
            sizes.dot
          )}
          aria-label="Online"
        />
      )}
    </div>
  );
}

export { Avatar };
