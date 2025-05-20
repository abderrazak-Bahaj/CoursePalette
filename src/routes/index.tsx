import { Routes, Route } from 'react-router-dom';

import { RouteWrapper } from './RouteWrapper';
import { AuthRouteWrapper } from './AuthRouteWrapper';

import Home from '@/pages/public/Home'
import CoursesPage from '@/pages/public/courses/CoursesPage';
import CourseDetailPage from '@/pages/public/courses/CourseDetailPage';
import CategoriesPage from '@/pages/public/categories/CategoriesPage';
import SearchResultsPage from '@/pages/public/utility/SearchResultsPage';
import CheckCertificatePage from '@/pages/public/certificates/CheckCertificatePage';
import HelpPage from '@/pages/public/utility/HelpPage';
import ContactPage from '@/pages/public/utility/ContactPage';
import PrivacyPolicyPage from '@/pages/public/utility/PrivacyPolicyPage';
import TermsPage from '@/pages/public/utility/TermsPage';
import BlogPage from '@/pages/public/blog/BlogPage';
import BlogDetailPage from '@/pages/public/blog/BlogDetailPage';
import UnauthorizedPage from '@/pages/public/UnauthorizedPage';
import NotFound from '@/pages/public/NotFound';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import DashboardPage from '@/pages/user/DashboardPage';
import ProfilePage from '@/pages/user/ProfilePage';
import LessonPage from '@/pages/user/learning/LessonPage';
import CertificatesPage from '@/pages/user/certificates/CertificatesPage';
import CertificateDetailPage from '@/pages/user/certificates/CertificateDetailPage';
import AdminProfilePage from '@/pages/admin/AdminProfilePage';
import AdminCoursesPage from '@/pages/admin/courses/AdminCoursesPage';
import AdminLessonsPage from '@/pages/admin/courses/AdminLessonsPage';
import CreateLessonPage from '@/pages/admin/courses/CreateLessonPage';
import LessonDetailPage from '@/pages/admin/courses/LessonDetailPage';
import StudentsPage from '@/pages/admin/users/StudentsPage';
import ReportsPage from '@/pages/admin/analytics/ReportsPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminTeacherViewPage from '@/pages/admin/users/AdminTeacherViewPage';
import AdminStudentsPage from '@/pages/admin/users/AdminStudentsPage';
import AdminStudentViewPage from '@/pages/admin/users/AdminStudentViewPage';
import AdminInstructorsPage from '@/pages/admin/users/AdminInstructorsPage';
import AdminCategoriesPage from '@/pages/admin/categories/AdminCategoriesPage';
import AdminCategoriesViewPage from '@/pages/admin/categories/AdminCategoriesViewPage';
import Checkout from '@/pages/public/checkout/Checkout';
import StudentInvoicesPage from '@/pages/user/invoices/StudentInvoicesPage';
import TeacherInvoicesPage from '@/pages/user/invoices/TeacherInvoicesPage';
import AdminInvoicesPage from '@/pages/admin/invoices/AdminInvoicesPage';
import InvoiceDetailPage from '@/pages/user/invoices/InvoiceDetailPage';

const AppRoutes = () => (
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
    <Route
      path="/reset-password"
      element={
        <AuthRouteWrapper>
          <ResetPasswordPage />
        </AuthRouteWrapper>
      }
    />
    <Route
      path="/verify-email"
      element={
        <AuthRouteWrapper>
          <VerifyEmailPage />
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
      path="/checkout"
      element={
        <RouteWrapper accessType="ALL">
          <Checkout />
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


    <Route
      path="/invoices/:id"
      element={
        <RouteWrapper accessType="STUDENT">
          <InvoiceDetailPage />
        </RouteWrapper>
      }
    />

    {/* Teacher Invoice Routes */}
    <Route
      path="/admin/invoices"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <TeacherInvoicesPage />
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/invoices/:id"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <InvoiceDetailPage />
        </RouteWrapper>
      }
    />

    {/* Admin Invoice Routes */}
    <Route
      path="/admin/all-invoices"
      element={
        <RouteWrapper accessType="ADMIN">
          <AdminInvoicesPage />
        </RouteWrapper>
      }
    />

    {/* Catch-all for 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;