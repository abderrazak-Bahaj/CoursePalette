
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Calendar, Download, FileText, UserCheck, BookOpen, Award } from "lucide-react";
import AdminEnrollmentStats from "@/components/admin/AdminEnrollmentStats";
import { useAuth } from "@/hooks/useAuth";

const enrollmentData = [
  { name: "JavaScript Basics", value: 400, color: "#8884d8" },
  { name: "Python for Beginners", value: 300, color: "#82ca9d" },
  { name: "Web Development", value: 300, color: "#ffc658" },
  { name: "Machine Learning", value: 200, color: "#ff8042" },
  { name: "Data Science", value: 100, color: "#0088fe" },
];

const completionRateData = [
  { name: "Completed", value: 68, color: "#4ade80" },
  { name: "In Progress", value: 22, color: "#facc15" },
  { name: "Not Started", value: 10, color: "#ef4444" },
];

const userActivityData = [
  { name: "Jan", students: 65, teachers: 28 },
  { name: "Feb", students: 59, teachers: 30 },
  { name: "Mar", students: 80, teachers: 32 },
  { name: "Apr", students: 81, teachers: 35 },
  { name: "May", students: 56, teachers: 31 },
  { name: "Jun", students: 55, teachers: 29 },
  { name: "Jul", students: 40, teachers: 25 },
];

const ReportsPage = () => {
  const { user } = useAuth();
  
  // Only render with AdminLayout if user is admin, fallback to normal view for others
  const LayoutComponent = user?.isAdmin ? AdminLayout : "div";
  const layoutProps = user?.isAdmin ? { title: "Reports & Analytics" } : {};

  return (
    <LayoutComponent {...layoutProps}>
      <div className="container mx-auto px-4 py-8">
        {!user?.isAdmin && <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          {!user?.isAdmin && <h2 className="text-2xl font-semibold">Dashboard Overview</h2>}
          <div className="flex gap-3">
            <Select defaultValue="this-month">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Custom Range</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              <span>Export</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <UserCheck className="mr-2 h-4 w-4 text-blue-500" />
                Total Students
              </CardTitle>
              <CardDescription>Current active students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2,543</div>
              <p className="text-sm text-green-500 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                </svg>
                +12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <BookOpen className="mr-2 h-4 w-4 text-indigo-500" />
                Course Enrollments
              </CardTitle>
              <CardDescription>Total enrollments this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">854</div>
              <p className="text-sm text-green-500 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                </svg>
                +8% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Award className="mr-2 h-4 w-4 text-yellow-500" />
                Completion Rate
              </CardTitle>
              <CardDescription>Average course completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">68%</div>
              <p className="text-sm text-green-500 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                </svg>
                +5% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <FileText className="mr-2 h-4 w-4 text-purple-500" />
                Certificates Issued
              </CardTitle>
              <CardDescription>Total certificates this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">128</div>
              <p className="text-sm text-green-500 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                </svg>
                +15% from last month
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card border shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
            <TabsTrigger value="completion">Completion</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="users">User Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <AdminEnrollmentStats />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Popular Courses</CardTitle>
                  <CardDescription>
                    Course enrollment distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={enrollmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {enrollmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Completion Status</CardTitle>
                  <CardDescription>
                    Overall course completion status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={completionRateData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {completionRateData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="enrollments">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Enrollment Details</CardTitle>
                <CardDescription>
                  Monthly enrollment statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={userActivityData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" name="Student Enrollments" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completion">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Completion Analytics</CardTitle>
                <CardDescription>
                  Detailed completion rate analytics by course category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Web Dev", completion: 78 },
                        { name: "Data Science", completion: 62 },
                        { name: "UX Design", completion: 85 },
                        { name: "Mobile Dev", completion: 71 },
                        { name: "Cloud Computing", completion: 68 },
                      ]}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completion" name="Completion Rate (%)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="revenue">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>
                  Monthly revenue from course enrollments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Jan", revenue: 4000 },
                        { name: "Feb", revenue: 3000 },
                        { name: "Mar", revenue: 5000 },
                        { name: "Apr", revenue: 4500 },
                        { name: "May", revenue: 3800 },
                        { name: "Jun", revenue: 4200 },
                        { name: "Jul", revenue: 4800 },
                      ]}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue ($)" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>
                  Monthly activity by user role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={userActivityData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" name="Students" fill="#8884d8" />
                      <Bar dataKey="teachers" name="Teachers" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutComponent>
  );
};

export default ReportsPage;
