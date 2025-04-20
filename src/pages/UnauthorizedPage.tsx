// src/pages/UnauthorizedPage.tsx
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import MainLayout from '@/components/layout/MainLayout';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const goToDashboard = () => {
    if (user?.role === 'ADMIN' || user?.role === 'TEACHER') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const getRoleText = () => {
    if (!user) return '';

    switch (user.role) {
      case 'STUDENT':
        return "Students don't have access to this area.";
      case 'TEACHER':
        return "Teachers don't have access to this administrative area.";
      default:
        return "You don't have the required permissions to access this page.";
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-red-600 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-24 w-24 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-lg mb-2 text-center max-w-lg">{getRoleText()}</p>
      <p className="text-sm mb-6 text-center text-gray-600">
        Please contact an administrator if you believe this is an error.
      </p>
      <div className="flex gap-4">
        {!(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        )}
        <Button onClick={goToDashboard} variant="outline">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
  if (user?.role === 'ADMIN' || user?.role === 'TEACHER') {
    return <AdminLayout>{content}</AdminLayout>;
  }
  return <MainLayout>{content}</MainLayout>;
};

export default UnauthorizedPage;
