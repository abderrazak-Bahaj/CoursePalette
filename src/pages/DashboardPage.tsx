import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlusCircle,
  BookOpen,
  Users,
  GraduationCap,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import MainLayout from '@/components/layout/MainLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import CourseProgressTabs from '@/components/dashboard/CourseProgressTabs';
import CertificatesSection from '@/components/dashboard/CertificatesSection';
import AdminCourseList from '@/components/admin/AdminCourseList';
import AdminEnrollmentStats from '@/components/admin/AdminEnrollmentStats';

const DashboardPage = () => {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Learning</h1>
              <p className="text-gray-600">
                Track your progress and continue learning
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button asChild>
                <Link to="/courses">Browse More Courses</Link>
              </Button>
            </div>
          </div>

          <DashboardStats />
          <CourseProgressTabs />
          <CertificatesSection />
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
