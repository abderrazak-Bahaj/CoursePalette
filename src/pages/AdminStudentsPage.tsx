import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Download,
  Filter,
  UserPlus,
  FileEdit,
  Trash2,
  EyeIcon,
  BookOpen,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { userService } from '@/services/api/userService';
import { useQuery } from '@tanstack/react-query';
import { Pagination } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/useDebounce';
import StudentModal from '@/components/admin/StudentModal';
import { Progress } from '@/components/ui/progress';

interface Enrollment {
  id: number;
  course: Course;
  enrolled_at: string;
  completed_at: string | null;
  status: string;
  progress: {
    percentage: number;
    completed_lessons: number;
    total_lessons: number;
  };
}

interface Course {
  id: number;
  title: string;
  description: string;
  image_url: string;
  level: string;
  duration: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  email_verified_at: string;
  my_enrollments: Enrollment[];
}

interface StudentsResponse {
  students: Student[];
  meta: {
    total: number;
    page: number;
    last_page: number;
    per_page: number;
  };
}

const AdminStudentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<StudentsResponse>({
    queryKey: ['students', debouncedSearchQuery, currentPage],
    queryFn: () =>
      userService.getStudents({
        search: debouncedSearchQuery,
        page: currentPage,
      }),
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAction = (action: string, id: number, name: string) => {
    toast({
      title: `${action} student`,
      description: `You ${action.toLowerCase()}ed student ${name}`,
    });
  };

  const calculateAverageProgress = (enrollments: Enrollment[]) => {
    if (!enrollments || enrollments.length === 0) return 0;

    const totalPercentage = enrollments.reduce(
      (sum, enrollment) => sum + enrollment.progress.percentage,
      0
    );

    return Math.round(totalPercentage / enrollments.length);
  };

  const countCompletedCourses = (enrollments: Enrollment[]) => {
    return enrollments.filter(
      (enrollment) =>
        enrollment.progress.percentage === 100 || enrollment.completed_at
    ).length;
  };

  const exportToCSV = () => {
    if (!data?.students) return;

    // Prepare CSV content
    const headers = [
      'ID',
      'Name',
      'Email',
      'Courses Enrolled',
      'Completed Courses',
      'Average Progress',
      'Enrollment Date',
    ];

    const csvContent = data.students.map((student) => {
      const coursesEnrolled = student.my_enrollments.length;
      const completedCourses = countCompletedCourses(student.my_enrollments);
      const averageProgress = calculateAverageProgress(student.my_enrollments);
      const latestEnrollment =
        student.my_enrollments.length > 0
          ? new Date(
              Math.max(
                ...student.my_enrollments.map((e) =>
                  new Date(e.enrolled_at).getTime()
                )
              )
            ).toLocaleDateString()
          : 'N/A';

      return [
        student.id,
        student.name,
        student.email,
        coursesEnrolled,
        completedCourses,
        `${averageProgress}%`,
        latestEnrollment,
      ].join(',');
    });

    // Create CSV file
    const csvData = [headers.join(','), ...csvContent].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Download CSV file
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-800';
      case 'ADVANCED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout title={'Manage Students'}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Students</h1>
        <Card className="mb-8 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Manage Students</CardTitle>
              <Button
                className="flex items-center gap-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <UserPlus size={16} />
                <span>Add Student</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search students..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  <span>Filter</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={exportToCSV}
                >
                  <Download size={16} />
                  <span>Export</span>
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Student</TableHead>
                    <TableHead>Courses Enrolled</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Completed Courses</TableHead>
                    <TableHead>Latest Course</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading students...
                      </TableCell>
                    </TableRow>
                  ) : data?.students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.students.map((student) => {
                      const coursesEnrolled = student.my_enrollments.length;
                      const completedCourses = countCompletedCourses(
                        student.my_enrollments
                      );
                      const averageProgress = calculateAverageProgress(
                        student.my_enrollments
                      );

                      // Get the latest course
                      const latestCourse =
                        student.my_enrollments.length > 0
                          ? student.my_enrollments.reduce(
                              (latest, current) =>
                                new Date(current.enrolled_at) >
                                new Date(latest.enrolled_at)
                                  ? current
                                  : latest,
                              student.my_enrollments[0]
                            )
                          : null;

                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={student.avatar || undefined}
                                  alt={student.name}
                                />
                                <AvatarFallback>
                                  {student.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {student.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {student.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              <span>{coursesEnrolled}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 w-32">
                              <Progress
                                value={averageProgress}
                                className="h-2"
                              />
                              <p className="text-xs text-muted-foreground">
                                {averageProgress}% Avg. Progress
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>
                                {completedCourses} of {coursesEnrolled}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {latestCourse ? (
                              <div className="max-w-[200px]">
                                <div
                                  className="text-sm font-medium truncate"
                                  title={latestCourse.course.title}
                                >
                                  {latestCourse.course.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className={getLevelBadgeColor(
                                      latestCourse.course.level
                                    )}
                                  >
                                    {latestCourse.course.level}
                                  </Badge>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(
                                      latestCourse.enrolled_at
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                No courses
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleAction(
                                      'View',
                                      student.id,
                                      student.name
                                    )
                                  }
                                >
                                  <EyeIcon className="mr-2 h-4 w-4" />
                                  <span>View</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleAction(
                                      'Edit',
                                      student.id,
                                      student.name
                                    )
                                  }
                                >
                                  <FileEdit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleAction(
                                      'Delete',
                                      student.id,
                                      student.name
                                    )
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {data && data.meta.last_page > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={data.meta.page}
                  totalPages={data.meta.last_page}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Modal */}
      <StudentModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </AdminLayout>
  );
};

export default AdminStudentsPage;
