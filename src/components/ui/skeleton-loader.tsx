import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
  children: React.ReactNode;
  variant?: "card" | "list" | "grid" | "text" | "custom" | "card-horizontal";
  count?: number;
}

const SkeletonLoader = ({
  isLoading,
  children,
  variant = "card",
  count = 1,
  className,
  ...props
}: SkeletonLoaderProps) => {
  if (!isLoading) return children;

  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return Array(count)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="w-full rounded-lg overflow-hidden">
              <Skeleton className="h-40 w-full mb-3" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ));
      case "card-horizontal":
        return Array(count)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="flex gap-4 w-full rounded-lg overflow-hidden border p-4">
              <Skeleton className="h-24 w-24 rounded-md" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-8 w-24 mt-2" />
              </div>
            </div>
          ));
      case "grid":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(count)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="w-full rounded-lg overflow-hidden border p-6">
                  <Skeleton className="h-16 w-16 rounded-md mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-8 w-2/3 mt-auto" />
                </div>
              ))}
          </div>
        );
      case "list":
        return Array(count)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="flex items-center gap-3 w-full mb-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-4/5 mb-2" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            </div>
          ));
      case "text":
        return Array(count)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="w-full mb-2">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6 mb-1" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ));
      default:
        return children;
    }
  };

  return (
    <div className={cn(variant !== "grid" ? "space-y-3" : "", className)} {...props}>
      {renderSkeleton()}
    </div>
  );
};

export { SkeletonLoader }; 