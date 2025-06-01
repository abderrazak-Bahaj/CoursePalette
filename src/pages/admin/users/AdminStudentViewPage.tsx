import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AdminLayout,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Progress,
} from '@/components';
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  BookOpen,
  Users,
  Calendar,
  GraduationCap,
  Key,
  MapPin,
  BookmarkIcon,
  Brain,
  Star,
  Tag,
  CheckCircle,
  Clock,
  Activity,
  Heart,
} from 'lucide-react';
import { userService } from '@/services/api/userService';
import { useToast } from '@/hooks/use-toast';
import { UserStatusModal } from '@/components/admin/UserStatusModal';
import { UserPasswordModal } from '@/components/admin/UserPasswordModal';
import { DeleteUserModal } from '@/components/admin/DeleteUserModal';
import WrapperLoading from '@/components/ui/wrapper-loading';

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  email_verified_at: string;
  last_login_at?: string;
  student?: {
    student_id: string;
    enrollment_status: string;
    education_level: string;
    major: string;
    interests: string[];
    date_of_birth: string;
    learning_preferences: string[];
    gpa: string;
  };
  enrollments?: Enrollment[];
  created_at: string;
}

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
  status: string;
  level: string;
  price: string;
  duration: number;
  duration_readable: string;
  skills: string;
  language: string;
}

const AdminStudentViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['student', id],
    queryFn: () => userService.getUser(id as string),
  });

  const student = response?.data || {};

  // Define mutations
  const updateStatusMutation = useMutation({
    mutationFn: (status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') =>
      userService.updateStatusByAdmin(id as string, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      toast({
        title: 'Status updated',
        description: 'Student status has been updated successfully',
      });
      setStatusModalOpen(false);
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
    mutationFn: (password: string) =>
      userService.updatePasswordByAdmin(id as string, {
        password,
        password_confirmation: password,
      }),
    onSuccess: () => {
      toast({
        title: 'Password reset',
        description: 'Student password has been reset successfully',
      });
      setPasswordModalOpen(false);
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
    mutationFn: () => userService.deleteUser(id as string),
    onSuccess: () => {
      toast({
        title: 'Student deleted',
        description: 'Student has been deleted successfully',
      });
      navigate('/admin/students');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete student.',
        variant: 'destructive',
      });
    },
  });

  if (isError || (!student && !isLoading)) {
    return (
      <AdminLayout title="Student Details">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-3xl font-bold">Student not found</h1>
          </div>
          <Card>
            <CardContent className="py-10">
              <p className="text-center">
                The requested student could not be found or you don't have
                permission to view this information.
              </p>
              <div className="flex justify-center mt-6">
                <Button onClick={() => navigate('/admin/students')}>
                  Return to Students
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAverageProgress = (enrollments?: Enrollment[]) => {
    if (!enrollments || enrollments.length === 0) return 0;
    const totalPercentage = enrollments.reduce(
      (sum, enrollment) => sum + enrollment.progress_percentage,
      0
    );
    return Math.round(totalPercentage / enrollments.length);
  };

  const countCompletedCourses = (enrollments?: Enrollment[]) => {
    if (!enrollments) return 0;
    return enrollments.filter((enrollment) => enrollment.is_completed).length;
  };

  const handleStatusUpdate = (status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    updateStatusMutation.mutate(status);
  };

  const handlePasswordReset = (password: string) => {
    updatePasswordMutation.mutate(password);
  };

  const handleDeleteUser = () => {
    deleteUserMutation.mutate();
  };

  return (
    <AdminLayout title={`Student: ${student?.name}`}>
      <WrapperLoading isLoading={isLoading}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-3xl font-bold">Student Profile</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage
                      src={student?.avatar || undefined}
                      alt={student?.name}
                    />
                    <AvatarFallback className="text-4xl">
                      {student?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold">{student?.name}</h2>
                  <p className="text-muted-foreground mb-2">{student?.email}</p>

                  <div className="mb-2">
                    <Badge
                      className={`${getStatusColor(student?.status || 'INACTIVE')}`}
                    >
                      {student?.status || 'INACTIVE'}
                    </Badge>
                  </div>

                  {student?.student?.student_id && (
                    <p className="text-sm text-muted-foreground mb-4">
                      ID: {student.student.student_id}
                    </p>
                  )}

                  <div className="w-full mt-4 space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setStatusModalOpen(true)}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Change Status
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setPasswordModalOpen(true)}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Reset Password
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setDeleteModalOpen(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info">
                  <TabsList>
                    <TabsTrigger value="info">Profile</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="courses">Courses</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Email
                        </p>
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <p>{student?.email}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Phone
                        </p>
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <p>{student?.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Address
                        </p>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <p>{student?.address || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Date of Birth
                        </p>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <p>
                            {student?.student?.date_of_birth
                              ? formatDate(student.student.date_of_birth)
                              : 'Not provided'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Member Since
                        </p>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <p>{formatDate(student?.created_at)}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Last Login
                        </p>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <p>{formatDate(student?.last_login_at)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Biography
                      </p>
                      <p className="text-sm">
                        {student?.bio || 'No biography provided.'}
                      </p>
                    </div>

                    {student?.student?.interests &&
                      student.student.interests.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Interests
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {student.student.interests.map(
                              (interest, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  <BookmarkIcon className="h-3 w-3" />
                                  {interest}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {student?.student?.learning_preferences &&
                      student.student.learning_preferences.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Learning Preferences
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {student.student.learning_preferences.map(
                              (preference, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <Brain className="h-3 w-3" />
                                  {preference}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </TabsContent>

                  <TabsContent value="academic" className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Education Level</h3>
                          </div>
                          <p>
                            {student?.student?.education_level ||
                              'Not specified'}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Major</h3>
                          </div>
                          <p>{student?.student?.major || 'Not specified'}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">GPA</h3>
                          </div>
                          <p>{student?.student?.gpa || 'Not specified'}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Tag className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Enrollment Status</h3>
                          </div>
                          <Badge
                            className={getStatusColor(
                              student?.student?.enrollment_status || 'INACTIVE'
                            )}
                          >
                            {student?.student?.enrollment_status ||
                              'Not specified'}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="courses" className="pt-4">
                    {student?.enrollments && student.enrollments.length > 0 ? (
                      <div className="space-y-4">
                        {student.enrollments.map((enrollment) => (
                          <Card key={enrollment.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                                  <img
                                    src={enrollment.course.image_url}
                                    alt={enrollment.course.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium">
                                    {enrollment.course.title}
                                  </h3>
                                  <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-3 mt-1">
                                    <Badge
                                      variant="outline"
                                      className={
                                        enrollment.is_completed
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }
                                    >
                                      {enrollment.status}
                                    </Badge>
                                    <span className="flex items-center">
                                      <Calendar className="mr-1 h-3 w-3" />
                                      Enrolled:{' '}
                                      {formatDate(enrollment.enrolled_at)}
                                    </span>
                                    {enrollment.completed_at && (
                                      <span className="flex items-center">
                                        <Calendar className="mr-1 h-3 w-3" />
                                        Completed:{' '}
                                        {formatDate(enrollment.completed_at)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-lg">
                                    {enrollment.progress_percentage}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {enrollment.course.duration_readable}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="mt-4 text-lg font-medium">
                          No courses enrolled
                        </h3>
                        <p className="text-muted-foreground">
                          This student hasn't enrolled in any courses yet.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="stats" className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <BookOpen className="mx-auto h-8 w-8 text-primary" />
                            <h3 className="mt-2 text-3xl font-bold">
                              {student?.enrollments?.length || 0}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Total Courses
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <CheckCircle className="mx-auto h-8 w-8 text-primary" />
                            <h3 className="mt-2 text-3xl font-bold">
                              {countCompletedCourses(student?.enrollments)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Completed Courses
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Users className="mx-auto h-8 w-8 text-primary" />
                            <h3 className="mt-2 text-3xl font-bold">
                              {calculateAverageProgress(student?.enrollments)}%
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Average Progress
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        <UserStatusModal
          isOpen={statusModalOpen}
          onOpenChange={setStatusModalOpen}
          userName={student?.name}
          currentStatus={student?.status || 'INACTIVE'}
          onStatusUpdate={handleStatusUpdate}
          isLoading={updateStatusMutation.isPending}
        />

        <UserPasswordModal
          isOpen={passwordModalOpen}
          onOpenChange={setPasswordModalOpen}
          userName={student?.name}
          onPasswordUpdate={handlePasswordReset}
          isLoading={updatePasswordMutation.isPending}
        />

        <DeleteUserModal
          isOpen={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          userName={student?.name}
          onConfirmDelete={handleDeleteUser}
          isLoading={deleteUserMutation.isPending}
        />
      </WrapperLoading>
    </AdminLayout>
  );
};

export default AdminStudentViewPage;
