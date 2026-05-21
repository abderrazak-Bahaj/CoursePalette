import { useAuth } from '@/hooks/useAuth';
import AdminDashboardPage from './AdminDashboardPage';
import TeacherDashboardPage from './TeacherDashboardPage';
import { useSEO } from '@/hooks/useSEO';

const DashboardPage = () => {
  useSEO({
    title: 'Admin Dashboard',
    description: 'Manage admin dashboard on Skillorai.',
    noIndex: true,
  });
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboardPage /> : <TeacherDashboardPage />;
};

export default DashboardPage;
