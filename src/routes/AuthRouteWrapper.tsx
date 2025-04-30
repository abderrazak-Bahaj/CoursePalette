import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui/loader';

interface AuthRouteWrapperProps {
  children: ReactNode;
}

export const AuthRouteWrapper = ({
  children,
}: AuthRouteWrapperProps) => {
  const { isAuthenticated, isLoading,isAdmin,isTeacher } = useAuth();
  const location = useLocation();

  // Show loader while authentication status is being determined
  if (isLoading) {
    return <Loader fullPage />;
  }

  // If already authenticated, redirect to the specified path
  if (isAuthenticated) {
    // Check if we have a redirect in state from a previous navigation attempt
    const nextPath = (isAdmin || isTeacher) ? '/admin/dashboard' : '/dashboard';
    const from = location.state?.from?.pathname || nextPath;
    return <Navigate to={from} replace />;
  }

  // Not authenticated, show login/register page
  return <>{children}</>;
};
