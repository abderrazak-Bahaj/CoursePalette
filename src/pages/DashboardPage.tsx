
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, BookOpen, Users, GraduationCap, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/layout/AdminLayout";
import MainLayout from "@/components/layout/MainLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import CourseProgressTabs from "@/components/dashboard/CourseProgressTabs";
import CertificatesSection from "@/components/dashboard/CertificatesSection";
import AdminCourseList from "@/components/admin/AdminCourseList";
import AdminEnrollmentStats from "@/components/admin/AdminEnrollmentStats";

const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (user?.isAdmin) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">34</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">235</div>
              <p className="text-xs text-muted-foreground">+18% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,734</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <AdminEnrollmentStats />
          </TabsContent>
          <TabsContent value="courses" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Manage Courses</h3>
              <Button asChild>
                <Link to="/admin/courses/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Course
                </Link>
              </Button>
            </div>
            <AdminCourseList />
          </TabsContent>
          <TabsContent value="enrollments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Enrollments</CardTitle>
                <CardDescription>
                  Students who recently enrolled in your courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Loading enrollment data...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminLayout>
    );
  }

  // For regular users, show the normal dashboard
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
