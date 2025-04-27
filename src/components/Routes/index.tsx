import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RouteWrapper } from '@/components/Routes/RouteWrapper';
import { AuthRouteWrapper } from './AuthRouteWrapper';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import CoursesPage from '@/pages/CoursesPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import CheckCertificatePage from '@/pages/CheckCertificatePage';
import CategoriesPage from '@/pages/CategoriesPage';
import SearchResultsPage from '@/pages/SearchResultsPage';
import HelpPage from '@/pages/HelpPage';
import ContactPage from '@/pages/ContactPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsPage from '@/pages/TermsPage';
import BlogPage from '@/pages/BlogPage';
import BlogDetailPage from '@/pages/BlogDetailPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import DashboardPage from '@/pages/DashboardPage';
import LessonPage from '@/pages/LessonPage';
import ProfilePage from '@/pages/ProfilePage';
import CertificatesPage from '@/pages/CertificatesPage';
import CertificateDetailPage from '@/pages/CertificateDetailPage';
import AdminCoursesPage from '@/pages/AdminCoursesPage';
import AdminLessonsPage from '@/pages/AdminLessonsPage';
import CreateLessonPage from '@/pages/CreateLessonPage';
import LessonDetailPage from '@/pages/LessonDetailPage';
import StudentsPage from '@/pages/StudentsPage';
import ReportsPage from '@/pages/ReportsPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminProfilePage from '@/pages/AdminProfilePage';
import AdminSecurity from '@/pages/AdminSecurity';
import AdminStudentsPage from '@/pages/AdminStudentsPage';
import AdminInstructorsPage from '@/pages/AdminInstructorsPage';
import AdminTeacherViewPage from '@/pages/AdminTeacherViewPage';
import AdminStudentViewPage from '@/pages/AdminStudentViewPage';
import AdminCategoriesPage from '@/pages/AdminCategoriesPage';
import AdminCategoriesViewPage from '@/pages/AdminCategoriesViewPage';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <RouteWrapper accessType="PUBLIC">
            <Home />
          </RouteWrapper>
        }
      />

      {/* Public Routes with RouteWrapper */}
      <Route
        path="/courses"
        element={
          <RouteWrapper accessType="PUBLIC">
            <CoursesPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <RouteWrapper accessType="PUBLIC">
            <CourseDetailPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/categories"
        element={
          <RouteWrapper accessType="PUBLIC">
            <CategoriesPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/search"
        element={
          <RouteWrapper accessType="PUBLIC">
            <SearchResultsPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/check-certificate"
        element={
          <RouteWrapper accessType="PUBLIC">
            <CheckCertificatePage />
          </RouteWrapper>
        }
      />
      <Route
        path="/help"
        element={
          <RouteWrapper accessType="PUBLIC">
            <HelpPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/contact"
        element={
          <RouteWrapper accessType="PUBLIC">
            <ContactPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/privacy"
        element={
          <RouteWrapper accessType="PUBLIC">
            <PrivacyPolicyPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/terms"
        element={
          <RouteWrapper accessType="PUBLIC">
            <TermsPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/blog"
        element={
          <RouteWrapper accessType="PUBLIC">
            <BlogPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/blog/:id"
        element={
          <RouteWrapper accessType="PUBLIC">
            <BlogDetailPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/unauthorized"
        element={
          <RouteWrapper accessType="PUBLIC">
            <UnauthorizedPage />
          </RouteWrapper>
        }
      />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <AuthRouteWrapper>
            <LoginPage />
          </AuthRouteWrapper>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRouteWrapper>
            <RegisterPage />
          </AuthRouteWrapper>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthRouteWrapper>
            <ForgotPasswordPage />
          </AuthRouteWrapper>
        }
      />

      {/* Authenticated User Routes */}
      <Route
        path="/dashboard"
        element={
          <RouteWrapper accessType="ALL">
            <DashboardPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/profile"
        element={
          <RouteWrapper accessType="ALL">
            <ProfilePage />
          </RouteWrapper>
        }
      />
      <Route
        path="/courses/:courseId/learn"
        element={
          <RouteWrapper accessType="ALL">
            <LessonPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/courses/:courseId/learn/:lessonId"
        element={
          <RouteWrapper accessType="ALL">
            <LessonPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/certificates"
        element={
          <RouteWrapper accessType="ALL">
            <CertificatesPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/certificates/:id"
        element={
          <RouteWrapper accessType="ALL">
            <CertificateDetailPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/courses/:courseId/certificate"
        element={
          <RouteWrapper accessType="ALL">
            <CertificateDetailPage />
          </RouteWrapper>
        }
      />

      {/* Teacher & Admin Routes */}

      <Route
        path="/admin/profile"
        element={
          <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
            <AdminProfilePage />
          </RouteWrapper>
        }
      />

      <Route
        path="/admin/courses"
        element={
          <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
            <AdminCoursesPage />
          </RouteWrapper>
        }
      />

      <Route
        path="/admin/lessons"
        element={
          <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
            <AdminLessonsPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/admin/courses/:courseId/lessons/create"
        element={
          <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
            <CreateLessonPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/admin/courses/:courseId/lessons/:lessonId"
        element={
          <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
            <LessonDetailPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/students"
        element={
          <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
            <StudentsPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/reports"
        element={
          <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
            <ReportsPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
            <AdminDashboardPage />
          </RouteWrapper>
        }
      />

      {/* Admin-only Routes */}

      <Route
        path="/admin/instructors"
        element={
          <RouteWrapper accessType={'ADMIN'}>
            <AdminInstructorsPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/admin/instructors/:id"
        element={
          <RouteWrapper accessType={'ADMIN'}>
            <AdminTeacherViewPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/admin/students"
        element={
          <RouteWrapper accessType="ADMIN">
            <AdminStudentsPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/admin/students/:id"
        element={
          <RouteWrapper accessType="ADMIN">
            <AdminStudentViewPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <RouteWrapper accessType="ADMIN">
            <AdminCategoriesPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/admin/categories/:slug"
        element={
          <RouteWrapper accessType="ADMIN">
            <AdminCategoriesViewPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RouteWrapper accessType="ADMIN">
            <ReportsPage />
          </RouteWrapper>
        }
      />

      {/* Catch-all for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
