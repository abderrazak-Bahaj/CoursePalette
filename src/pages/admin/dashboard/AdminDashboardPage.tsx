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
  TrendingUp,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/api/dashboardService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { format } from 'date-fns';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: string;
  status: string;
  category_id: string;
  teacher_id: string;
  level: string;
  skills: string;
  language: string;
  duration: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  enrollments_count: number;
  category?: {
    id: string;
    name: string;
  };
}

interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  student: {
    id: string;
    name: string;
    avatar: string | null;
    email: string;
    phone: string;
    address: string;
    bio: string | null;
    email_verified_at: string;
    role: string;
    status: string;
    last_login_at: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  };
  course: Course;
}

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStatistics,
    retry: false,
  });

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Calculate course categories distribution
  const courseCategories = stats?.top_courses?.reduce(
    (acc: Record<string, number>, course: Course) => {
      const category = course.category?.name || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {}
  );

  const categoryData = courseCategories
    ? Object.entries(courseCategories).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  if (isLoading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="flex items-center justify-center h-96">
          <p className="text-lg text-muted-foreground">
            Loading dashboard data...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats?.overview?.total_courses || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Active courses
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Students
            </CardTitle>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats?.overview?.total_students || 0}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Enrolled students
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {stats?.overview?.total_enrollments || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Total enrollments
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {formatCurrency(stats?.overview?.total_revenue || 0)}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Total revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly revenue for the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.monthly_stats || []}>
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8884d8"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8884d8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => formatCurrency(value)}
                      />
                      <Area
                        type="monotone"
                        dataKey="total_revenue"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Revenue"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trends</CardTitle>
                <CardDescription>
                  Monthly enrollments for the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.enrollment_trends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="total_enrollments"
                        fill="#82ca9d"
                        name="Enrollments"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Categories</CardTitle>
                <CardDescription>
                  Distribution of courses by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `${value} courses`}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Teachers</CardTitle>
                <CardDescription>
                  Teachers with highest enrollments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.teacher_performance?.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {teacher.courses_count} courses •{' '}
                          {teacher.total_enrollments} enrollments
                        </p>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span>{teacher.total_enrollments}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Courses</CardTitle>
                <CardDescription>Most enrolled courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.top_courses?.map((course: Course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                          <img
                            src={course.image_url}
                            alt={course.title}
                            className="w-12 h-12 min-w-12 min-h-12 rounded-md object-cover object-center"
                          />
                        </div>
                        <div>
                          <Link
                            to={`/admin/courses/${course.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary"
                          >
                            {course.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {course.category?.name || 'Uncategorized'} •{' '}
                            {course.enrollments_count} enrollments
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(course.price || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {course.level || 'All Levels'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Enrollments</CardTitle>
              <CardDescription>Latest course enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recent_enrollments?.map((enrollment: any) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {enrollment.student.avatar ? (
                          <img
                            src={enrollment.student.avatar}
                            alt={enrollment.student.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {enrollment.student.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <Link
                          to={`/admin/courses/${enrollment.course.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary"
                        >
                          {enrollment.course.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.course.category?.name || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(enrollment.created_at)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {enrollment.student.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
