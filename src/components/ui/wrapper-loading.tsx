import React from "react";
import { Loader2 } from "lucide-react";
import { SkeletonLoader } from "./skeleton-loader";

interface WrapperLoadingProps {
    children: React.ReactNode;
    isLoading: boolean;
    useSkeletonLoader?: boolean;
    skeletonVariant?: "card" | "list" | "grid" | "text" | "custom" | "card-horizontal";
    skeletonCount?: number;
}

const WrapperLoading = ({ 
    children, 
    isLoading, 
    useSkeletonLoader = true,
    skeletonVariant = "card",
    skeletonCount = 1 
}: WrapperLoadingProps) => {
    if (!isLoading) return children;
    
    if (useSkeletonLoader) {
        return (
            <SkeletonLoader 
                isLoading={isLoading} 
                variant={skeletonVariant} 
                count={skeletonCount}
            >
                {children}
            </SkeletonLoader>
        );
    }
    
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="w-10 h-10 animate-spin" />
        </div>
    );
};

export default WrapperLoading;

