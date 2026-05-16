// src/components/ds/primitives/Tooltip.tsx
import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  content: string;
  side?: TooltipSide;
  children: React.ReactNode;
  delayDuration?: number;
}

function Tooltip({
  content,
  side = 'top',
  children,
  delayDuration = 300,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={cn(
              'z-50 px-3 py-1.5 text-xs font-medium rounded-md',
              'bg-[#334155] text-neutral-100 border border-neutral-600',
              'shadow-lg',
              'animate-fade-in',
              'select-none'
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-[#334155]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export { Tooltip };
