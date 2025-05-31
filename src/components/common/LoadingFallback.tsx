import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingFallbackProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  className,
  size = 'md',
  text = 'Loading...',
  fullPage = true,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      className
    )}>
      <Loader2 className={cn(
        'animate-spin text-primary',
        sizeClasses[size]
      )} />
      <p className={cn(
        'text-muted-foreground font-medium',
        textSizeClasses[size]
      )}>
        {text}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};

// Specific loading components for different contexts
export const PageLoadingFallback = () => (
  <LoadingFallback 
    size="lg" 
    text="Loading page..."
    fullPage
  />
);

export const ComponentLoadingFallback = () => (
  <LoadingFallback 
    size="md" 
    text="Loading..."
    fullPage={false}
  />
);

export const InlineLoadingFallback = () => (
  <LoadingFallback 
    size="sm" 
    text="Loading..."
    fullPage={false}
    className="py-4"
  />
);

export default LoadingFallback; 