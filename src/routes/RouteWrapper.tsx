import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui/loader';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Role } from '@/types';
import LoadingFallback from '@/components/common/LoadingFallback';

// Define the possible access types
export type AccessType = 'PUBLIC' | 'ALL' | Role | Array<Role>;

interface RouteWrapperProps {
  children: ReactNode;
  accessType: AccessType;
  redirectPath?: string;
  errorFallback?: ReactNode;
}

export const RouteWrapper = ({
  children,
  accessType,
  redirectPath = '/login',
  errorFallback,
}: RouteWrapperProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loader while authentication status is being determined
  if (isLoading) {
    return <LoadingFallback size="lg" text="Loading page..." fullPage />;
  }
  // Public routes are accessible to everyone
  if (accessType === 'PUBLIC') {
    return <ErrorBoundary fallback={errorFallback}>{children}</ErrorBoundary>;
  }
  // If not authenticated, redirect to login for any non-public route
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
  // For authenticated users
  if (user) {
    // ALL means any authenticated user can access
    if (accessType === 'ALL') {
      return <ErrorBoundary fallback={errorFallback}>{children}</ErrorBoundary>;
    }
    // Check if user has the required role(s)
    const requiredRoles = Array.isArray(accessType) ? accessType : [accessType];

    if (requiredRoles.includes(user.role)) {
      return <ErrorBoundary fallback={errorFallback}>{children}</ErrorBoundary>;
    }
  }
  // User doesn't have required role - redirect to unauthorized
  return <Navigate to="/unauthorized" replace />;
};
