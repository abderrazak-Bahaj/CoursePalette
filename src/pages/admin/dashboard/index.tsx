import { useAuth } from '@/hooks/useAuth';
import AdminDashboardPage from './AdminDashboardPage';
import TeacherDashboardPage from './TeacherDashboardPage';

const DashboardPage = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboardPage /> : <TeacherDashboardPage />;
};

export default DashboardPage;
