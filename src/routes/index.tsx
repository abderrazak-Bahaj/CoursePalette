import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

import { RouteWrapper } from './RouteWrapper';
import { AuthRouteWrapper } from './AuthRouteWrapper';
import { PageLoadingFallback } from '@/components/common/LoadingFallback';

// Lazy load all components
// Public pages
const Home = lazy(() => import('@/pages/public/Home'));
const CoursesPage = lazy(() => import('@/pages/public/courses/CoursesPage'));
const CourseDetailPage = lazy(() => import('@/pages/public/courses/CourseDetailPage'));
const CategoriesPage = lazy(() => import('@/pages/public/categories/CategoriesPage'));
const SearchResultsPage = lazy(() => import('@/pages/public/utility/SearchResultsPage'));
const CheckCertificatePage = lazy(() => import('@/pages/public/certificates/CheckCertificatePage'));
const HelpPage = lazy(() => import('@/pages/public/utility/HelpPage'));
const ContactPage = lazy(() => import('@/pages/public/utility/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/public/utility/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('@/pages/public/utility/TermsPage'));
const BlogPage = lazy(() => import('@/pages/public/blog/BlogPage'));
const BlogDetailPage = lazy(() => import('@/pages/public/blog/BlogDetailPage'));
const UnauthorizedPage = lazy(() => import('@/pages/public/UnauthorizedPage'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));

// User pages
const DashboardPage = lazy(() => import('@/pages/user/DashboardPage'));
const ProfilePage = lazy(() => import('@/pages/user/ProfilePage'));
const LessonPage = lazy(() => import('@/pages/user/learning/LessonPage'));
const AssignmentPage = lazy(() => import('@/pages/user/learning/AssignmentPage'));
const CertificatesPage = lazy(() => import('@/pages/user/certificates/CertificatesPage'));
const CertificateDetailPage = lazy(() => import('@/pages/user/certificates/CertificateDetailPage'));

// Admin pages
const CreateAssignmentPage = lazy(() => import('@/pages/admin/courses/CreateAssignmentPage'));
const AssignmentManagementPage = lazy(() => import('@/pages/admin/courses/AssignmentManagementPage'));
const SubmissionsReviewPage = lazy(() => import('@/pages/admin/courses/SubmissionsReviewPage'));
const SubmissionReviewDetailPage = lazy(() => import('@/pages/admin/courses/SubmissionReviewDetailPage'));
const AdminAssignmentsPage = lazy(() => import('@/pages/admin/courses/AdminAssignmentsPage'));
const ResourceManagementPage = lazy(() => import('@/pages/admin/courses/ResourceManagementPage'));
const AdminProfilePage = lazy(() => import('@/pages/admin/AdminProfilePage'));
const AdminCoursesPage = lazy(() => import('@/pages/admin/courses/AdminCoursesPage'));
const AdminLessonsPage = lazy(() => import('@/pages/admin/courses/AdminLessonsPage'));
const CreateLessonPage = lazy(() => import('@/pages/admin/courses/CreateLessonPage'));
const LessonDetailPage = lazy(() => import('@/pages/admin/courses/LessonDetailPage'));
const AdminCourseDetailPage = lazy(() => import('@/pages/admin/courses/CourseDetailPage'));
const StudentsPage = lazy(() => import('@/pages/admin/users/StudentsPage'));
const ReportsPage = lazy(() => import('@/pages/admin/analytics/ReportsPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/dashboard'));
const AdminTeacherViewPage = lazy(() => import('@/pages/admin/users/AdminTeacherViewPage'));
const AdminStudentsPage = lazy(() => import('@/pages/admin/users/AdminStudentsPage'));
const AdminStudentViewPage = lazy(() => import('@/pages/admin/users/AdminStudentViewPage'));
const AdminInstructorsPage = lazy(() => import('@/pages/admin/users/AdminInstructorsPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/categories/AdminCategoriesPage'));
const AdminCategoriesViewPage = lazy(() => import('@/pages/admin/categories/AdminCategoriesViewPage'));
const Checkout = lazy(() => import('@/pages/public/checkout/Checkout'));
const StudentInvoicesPage = lazy(() => import('@/pages/user/invoices/StudentInvoicesPage'));
const TeacherInvoicesPage = lazy(() => import('@/pages/user/invoices/TeacherInvoicesPage'));
const AdminInvoicesPage = lazy(() => import('@/pages/admin/invoices/AdminInvoicesPage'));
const InvoiceDetailPage = lazy(() => import('@/pages/user/invoices/InvoiceDetailPage'));

// Wrapper component for Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoadingFallback />}>
    {children}
  </Suspense>
);

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route
      path="/"
      element={
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <Home />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />

    {/* Public Routes with RouteWrapper */}
    <Route
      path="/courses"
      element={
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <CoursesPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/courses/:courseId"
      element={
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <CourseDetailPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/categories"
      element={
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <CategoriesPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/search"
      element={
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <SearchResultsPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/check-certificate"
      element={
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <CheckCertificatePage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/help"
      element={
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <HelpPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/contact"
      element={
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <ContactPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/privacy"
      element={
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <PrivacyPolicyPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/terms"
      element={
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <TermsPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/blog"
      element={
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <BlogPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/blog/:id"
      element={
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <BlogDetailPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/unauthorized"
      element={
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <UnauthorizedPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />

    {/* Auth Routes */}
    <Route
      path="/login"
      element={
        <AuthRouteWrapper>
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        </AuthRouteWrapper>
      }
    />
    <Route
      path="/register"
      element={
        <AuthRouteWrapper>
          <SuspenseWrapper>
            <RegisterPage />
          </SuspenseWrapper>
        </AuthRouteWrapper>
      }
    />
    <Route
      path="/forgot-password"
      element={
        <AuthRouteWrapper>
          <SuspenseWrapper>
            <ForgotPasswordPage />
          </SuspenseWrapper>
        </AuthRouteWrapper>
      }
    />
    <Route
      path="/reset-password"
      element={
        <AuthRouteWrapper>
          <SuspenseWrapper>
            <ResetPasswordPage />
          </SuspenseWrapper>
        </AuthRouteWrapper>
      }
    />
    <Route
      path="/verify-email"
      element={
        <AuthRouteWrapper>
          <SuspenseWrapper>
            <VerifyEmailPage />
          </SuspenseWrapper>
        </AuthRouteWrapper>
      }
    />

    {/* Authenticated User Routes */}
    <Route
      path="/dashboard"
      element={
        <RouteWrapper accessType="ALL">
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/profile"
      element={
        <RouteWrapper accessType="ALL">
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/checkout"
      element={
        <RouteWrapper accessType="ALL">
          <SuspenseWrapper>
            <Checkout />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/courses/:courseId/learn/:lessonId"
      element={
        <RouteWrapper accessType="ALL">
          <SuspenseWrapper>
            <LessonPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/courses/:courseId/assignments/:assignmentId"
      element={
        <RouteWrapper accessType="ALL">
          <SuspenseWrapper>
            <AssignmentPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/certificates"
      element={
        <RouteWrapper accessType="ALL">
          <SuspenseWrapper>
            <CertificatesPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/certificates/:courseId"
      element={
        <RouteWrapper accessType="ALL">
          <SuspenseWrapper>
            <CertificateDetailPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/courses/:courseId/certificate"
      element={
        <RouteWrapper accessType="ALL">
          <SuspenseWrapper>
            <CertificateDetailPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />

    {/* Teacher & Admin Routes */}
    <Route
      path="/admin/profile"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <AdminProfilePage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/courses"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <AdminCoursesPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/courses/:courseId"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <AdminCourseDetailPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/lessons"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <AdminLessonsPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/courses/:courseId/lessons/create"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <CreateLessonPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/courses/:courseId/lessons/:lessonId"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <LessonDetailPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/courses/:courseId/lessons/:lessonId/resources"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <ResourceManagementPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/courses/:courseId/assignments"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <AssignmentManagementPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
        path="/admin/courses/:courseId/assignments/create"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <CreateAssignmentPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/courses/:courseId/assignments/:assignmentId"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <AssignmentPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/courses/:courseId/assignments/:assignmentId/edit"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <CreateAssignmentPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/courses/:courseId/assignments/:assignmentId/submissions"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <SubmissionsReviewPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/courses/:courseId/assignments/:assignmentId/submissions/:submissionId/review"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <SubmissionReviewDetailPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />

    <Route
      path="/admin/students"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <StudentsPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/reports"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <ReportsPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/dashboard"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <AdminDashboardPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />

    {/* Admin-only Routes */}
    <Route
      path="/admin/instructors"
      element={
        <RouteWrapper accessType={'ADMIN'}>
          <SuspenseWrapper>
            <AdminInstructorsPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/instructors/:id"
      element={
        <RouteWrapper accessType={'ADMIN'}>
          <SuspenseWrapper>
            <AdminTeacherViewPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/students"
      element={
        <RouteWrapper accessType="ADMIN">
          <SuspenseWrapper>
            <AdminStudentsPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/students/:id"
      element={
        <RouteWrapper accessType="ADMIN">
          <SuspenseWrapper>
            <AdminStudentViewPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/categories"
      element={
        <RouteWrapper accessType="ADMIN">
          <SuspenseWrapper>
            <AdminCategoriesPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/categories/:slug"
      element={
        <RouteWrapper accessType="ADMIN">
          <SuspenseWrapper>
            <AdminCategoriesViewPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/reports"
      element={
        <RouteWrapper accessType="ADMIN">
          <SuspenseWrapper>
            <ReportsPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />


    <Route
      path="/invoices/:id"
      element={
        <RouteWrapper accessType="STUDENT">
          <SuspenseWrapper>
            <InvoiceDetailPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />

    {/* Teacher Invoice Routes */}
    <Route
      path="/admin/invoices"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <TeacherInvoicesPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/admin/invoices/:id"
      element={
        <RouteWrapper accessType={['TEACHER', 'ADMIN']}>
          <SuspenseWrapper>
            <InvoiceDetailPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />

    {/* Admin Invoice Routes */}
    <Route
      path="/admin/all-invoices"
      element={
        <RouteWrapper accessType="ADMIN">
          <SuspenseWrapper>
            <AdminInvoicesPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />

    {/* Catch-all for 404 */}
    <Route 
      path="*" 
      element={
        <SuspenseWrapper>
          <NotFound />
        </SuspenseWrapper>
      } 
    />
  </Routes>
);

export default AppRoutes;