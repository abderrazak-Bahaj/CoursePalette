import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui/loader';

interface AuthRouteWrapperProps {
  children: ReactNode;
  redirectTo?: string;
}

export const AuthRouteWrapper = ({
  children,
  redirectTo = '/dashboard',
}: AuthRouteWrapperProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loader while authentication status is being determined
  if (isLoading) {
    return <Loader fullPage />;
  }

  // If already authenticated, redirect to the specified path
  if (isAuthenticated) {
    // Check if we have a redirect in state from a previous navigation attempt
    const from = location.state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  // Not authenticated, show login/register page
  return <>{children}</>;
};
