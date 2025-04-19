import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LessonPage from './pages/LessonPage';
import DashboardPage from './pages/DashboardPage';
import AdminCoursesPage from './pages/AdminCoursesPage';
import AdminLessonsPage from './pages/AdminLessonsPage';
import CertificatesPage from './pages/CertificatesPage';
import CertificateDetailPage from './pages/CertificateDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage';

import { AuthProvider } from './hooks/useAuth';
import HelpPage from './pages/HelpPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import StudentsPage from './pages/StudentsPage';
import ReportsPage from './pages/ReportsPage';
import InstructorsPage from './pages/InstructorsPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/Login';
import CreateLessonPage from './pages/CreateLessonPage';
import LessonDetailPage from './pages/LessonDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/courses/:courseId/learn" element={<LessonPage />} />
            <Route
              path="/courses/:courseId/learn/:lessonId"
              element={<LessonPage />}
            />

            <Route path="/courses/:courseId/learn" element={<LessonPage />} />
            <Route
              path="/courses/:courseId/learn/:lessonId"
              element={<LessonPage />}
            />

            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/lessons" element={<AdminLessonsPage />} />
            <Route
              path="/admin/courses/:courseId/lessons/create"
              element={<CreateLessonPage />}
            />
            <Route
              path="/admin/courses/:courseId/lessons/:lessonId"
              element={<LessonDetailPage />}
            />

            <Route path="/admin/students" element={<StudentsPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/instructors" element={<InstructorsPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route
              path="/certificates/:id"
              element={<CertificateDetailPage />}
            />
            <Route
              path="/courses/:courseId/certificate"
              element={<CertificateDetailPage />}
            />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Regular Routes */}
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/instructors" element={<InstructorsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
