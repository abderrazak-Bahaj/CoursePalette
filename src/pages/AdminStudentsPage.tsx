import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AdminLayout,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Pagination,
  Progress,
} from '@/components';
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
  MoreHorizontal,
  ShieldAlert,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { userService } from '@/services/api/userService';
import { UserStatusModal } from '@/components/admin/UserStatusModal';
import { UserPasswordModal } from '@/components/admin/UserPasswordModal';
import { DeleteUserModal } from '@/components/admin/DeleteUserModal';
import StudentModal from '@/components/admin/StudentModal';

interface Lesson {
  id: string;
  student_id: string;
  lesson_id: string;
  started_at: string;
  completed_at: string | null;
  course_id: string;
  status: string;
  watch_time: number;
  last_position: number;
  created_at: string;
}

interface Enrollment {
  id: string;
  user_id: string | null;
  course_id: string;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  grade: string | null;
  certificate_issued_at: string | null;
  created_at: string;
  updated_at: string;
  course: Course;
  progress_percentage: number;
  is_completed: boolean;
  has_certificate: boolean;
  last_Lesson: Lesson;
}

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  level: string;
  duration: number;
  duration_readable: string;
  skills: string;
  language: string;
  status: string;
  lessons_count: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  email_verified_at: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  enrollments: Enrollment[];
  student?: {
    student_id?: string;
    enrollment_status?: string;
    education_level?: string;
    major?: string;
    interests?: string[];
    learning_preferences?: string[];
    date_of_birth?: string;
    gpa?: string;
  };
  last_login_at?: string;
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
  
  // Modal states for user actions
  const [statusModalState, setStatusModalState] = useState({
    isOpen: false,
    student: null as Student | null,
  });

  const [passwordModalState, setPasswordModalState] = useState({
    isOpen: false,
    student: null as Student | null,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    student: null as Student | null,
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<StudentsResponse>({
    queryKey: ['students', debouncedSearchQuery, currentPage],
    queryFn: () =>
      userService.getStudents({
        search: debouncedSearchQuery,
        page: currentPage,
      }),
  });

  // Define mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }) =>
      userService.updateStatusByAdmin(userId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Status updated',
        description: 'Student status has been updated successfully',
      });
      setStatusModalState({ isOpen: false, student: null });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update student status.',
        variant: 'destructive',
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: string, password: string }) =>
      userService.updatePasswordByAdmin(userId, { 
        password, 
        password_confirmation: password 
      }),
    onSuccess: () => {
      toast({
        title: 'Password reset',
        description: 'Student password has been reset successfully',
      });
      setPasswordModalState({ isOpen: false, student: null });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to reset student password.',
        variant: 'destructive',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'User deleted',
        description: 'Student has been deleted successfully',
      });
      setDeleteModalState({ isOpen: false, student: null });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete student.',
        variant: 'destructive',
      });
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handler functions for user actions
  const handleUpdateStatus = (status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    if (statusModalState.student) {
      updateStatusMutation.mutate({
        userId: String(statusModalState.student.id),
        status,
      });
    }
  };

  const handleUpdatePassword = (password: string) => {
    if (passwordModalState.student) {
      updatePasswordMutation.mutate({
        userId: String(passwordModalState.student.id),
        password,
      });
    }
  };

  const handleDeleteUser = () => {
    if (deleteModalState.student) {
      deleteUserMutation.mutate(String(deleteModalState.student.id));
    }
  };

  const calculateAverageProgress = (enrollments: Enrollment[]) => {
    if (!enrollments || enrollments?.length === 0) return 0;

    const totalPercentage = enrollments?.reduce(
      (sum, enrollment) => sum + enrollment?.progress_percentage,
      0
    );

    return Math.round(totalPercentage / enrollments?.length);
  };

  const countCompletedCourses = (enrollments: Enrollment[]) => {
    return enrollments?.filter(
      (enrollment) => enrollment.is_completed
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

    const csvContent = data.students?.map((student) => {
      const coursesEnrolled = student.enrollments.length;
      const completedCourses = countCompletedCourses(student.enrollments);
      const averageProgress = calculateAverageProgress(student.enrollments);
      const latestEnrollment =
        student.enrollments.length > 0
          ? new Date(
              Math.max(
                ...student.enrollments.map((e) =>
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Define dropdown actions
  const actions = [
    {
      name: 'View',
      icon: <EyeIcon className="mr-2 h-4 w-4" />,
      onClick: (student: Student) => {
        navigate(`/admin/students/${student.id}`);
      },
    },
    {
      name: 'Change Status',
      icon: <ShieldAlert className="mr-2 h-4 w-4" />,
      onClick: (student: Student) => {
        setStatusModalState({ isOpen: true, student });
      },
    },
    {
      name: 'Reset Password',
      icon: <KeyRound className="mr-2 h-4 w-4" />,
      onClick: (student: Student) => {
        setPasswordModalState({ isOpen: true, student });
      },
    },
    {
      name: 'Delete',
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: (student: Student) => {
        setDeleteModalState({ isOpen: true, student });
      },
    },
  ];

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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading students...
                      </TableCell>
                    </TableRow>
                  ) : data?.students?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.students?.map((student) => {
                      const coursesEnrolled = student?.enrollments?.length;
                      const completedCourses = countCompletedCourses(
                        student?.enrollments
                      );
                      const averageProgress = calculateAverageProgress(
                        student?.enrollments
                      );

                      // Get the latest course
                      const latestCourse =
                        student?.enrollments?.length > 0
                          ? student?.enrollments?.reduce(
                              (latest, current) =>
                                new Date(current.enrolled_at) >
                                new Date(latest.enrolled_at)
                                  ? current
                                  : latest,
                              student?.enrollments[0]
                            )
                          : null;

                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={student?.avatar || undefined}
                                  alt={student?.name}
                                />
                                <AvatarFallback>
                                  {student?.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {student?.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {student?.email}
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
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                student.status
                              )}`}
                            >
                              {student.status || 'INACTIVE'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {actions.map((action) => (
                                <DropdownMenuItem
                                    key={action.name}
                                    onClick={() => action.onClick(student)}
                                  >
                                    {action.icon}
                                    <span>{action.name}</span>
                                </DropdownMenuItem>
                                ))}
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

      {/* Create Student Modal */}
      <StudentModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Status update modal */}
      {statusModalState.student && (
        <UserStatusModal
          isOpen={statusModalState.isOpen}
          onOpenChange={(open) => setStatusModalState(prev => ({ ...prev, isOpen: open }))}
          userName={statusModalState.student.name}
          currentStatus={statusModalState.student.status || 'INACTIVE'}
          onStatusUpdate={handleUpdateStatus}
          isLoading={updateStatusMutation.isPending}
        />
      )}

      {/* Password reset modal */}
      {passwordModalState.student && (
        <UserPasswordModal
          isOpen={passwordModalState.isOpen}
          onOpenChange={(open) => setPasswordModalState(prev => ({ ...prev, isOpen: open }))}
          userName={passwordModalState.student.name}
          onPasswordUpdate={handleUpdatePassword}
          isLoading={updatePasswordMutation.isPending}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteModalState.student && (
        <DeleteUserModal
          isOpen={deleteModalState.isOpen}
          onOpenChange={(open) => setDeleteModalState(prev => ({ ...prev, isOpen: open }))}
          userName={deleteModalState.student.name}
          onConfirmDelete={handleDeleteUser}
          isLoading={deleteUserMutation.isPending}
        />
      )}
    </AdminLayout>
  );
};

export default AdminStudentsPage;
