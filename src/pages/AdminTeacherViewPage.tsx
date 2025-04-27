import { useState, useEffect } from 'react';
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
} from '@/components';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Shield, 
  BookOpen, 
  Users, 
  Calendar,
  Award,
  Key,
  GraduationCap,
  FileCheck
} from 'lucide-react';
import { userService } from '@/services/api/userService';
import { useToast } from '@/hooks/use-toast';
import { UserStatusModal } from '@/components/admin/UserStatusModal';
import { UserPasswordModal } from '@/components/admin/UserPasswordModal';
import { DeleteUserModal } from '@/components/admin/DeleteUserModal';

interface EducationItem {
  degree: string;
  institution: string;
  year: number;
}

interface CertificationItem {
  name: string;
  year: number;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  email_verified_at: string;
  my_courses: Course[];
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  last_login_at?: string;
  teacher?: {
    specialization?: string;
    years_of_experience?: number;
    qualification?: string;
    expertise?: string;
    education?: EducationItem[];
    certifications?: CertificationItem[];
    rating?: string;
  };
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  image_url: string;
  status: string;
  level: string;
  price: string;
  duration: number;
  enrollments_count: number;
  lessons_count: number;
  created_at: string;
  updated_at: string;
}

const AdminTeacherViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: responseTeacher, isLoading, isError } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => userService.getUser(id as string),
  });

  const teacher = responseTeacher?.data || {};

  // Define mutations
  const updateStatusMutation = useMutation({
    mutationFn: (status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') =>
      userService.updateStatusByAdmin(id as string, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', id] });
      toast({
        title: 'Status updated',
        description: 'Teacher status has been updated successfully',
      });
      setStatusModalOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update teacher status.',
        variant: 'destructive',
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (password: string) =>
      userService.updatePasswordByAdmin(id as string, { 
        password, 
        password_confirmation: password 
      }),
    onSuccess: () => {
      toast({
        title: 'Password reset',
        description: 'Teacher password has been reset successfully',
      });
      setPasswordModalOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to reset teacher password.',
        variant: 'destructive',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: () => userService.deleteUser(id as string),
    onSuccess: () => {
      toast({
        title: 'Teacher deleted',
        description: 'Teacher has been deleted successfully',
      });
      navigate('/admin/instructors');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete teacher.',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout title="Teacher Details">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-3xl font-bold">Loading teacher details...</h1>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !teacher) {
    return (
      <AdminLayout title="Teacher Details">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-3xl font-bold">Teacher not found</h1>
          </div>
          <Card>
            <CardContent className="py-10">
              <p className="text-center">
                The requested teacher could not be found or you don't have permission to view this information.
              </p>
              <div className="flex justify-center mt-6">
                <Button onClick={() => navigate('/admin/instructors')}>
                  Return to Instructors
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
    <AdminLayout title={`Teacher: ${teacher?.name}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Teacher Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={teacher?.avatar || undefined} alt={teacher?.name} />
                  <AvatarFallback className="text-4xl">{teacher?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{teacher?.name}</h2>
                <p className="text-muted-foreground mb-2">{teacher?.email}</p>
                
                <div className="mb-4">
                  <Badge 
                    className={`${getStatusColor(teacher?.status || 'INACTIVE')}`}
                  >
                    {teacher?.status || 'INACTIVE'}
                  </Badge>
                </div>

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
              <CardTitle>Teacher Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="info">
                <TabsList>
                  <TabsTrigger value="info">Profile</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <p>{teacher?.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <p>{teacher?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                      <p>{teacher?.teacher?.specialization || 'Not specified'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Experience</p>
                      <p>{teacher?.teacher?.years_of_experience ? `${teacher?.teacher?.years_of_experience} years` : 'Not specified'}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Qualification</p>
                      <p>{teacher?.teacher?.qualification || 'Not specified'}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Rating</p>
                      <p>{teacher?.teacher?.rating ? `${teacher?.teacher?.rating}/5` : 'Not rated yet'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <p>{formatDate(teacher?.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <p>{formatDate(teacher?.last_login_at)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Biography</p>
                    <p className="text-sm">{teacher?.bio || 'No biography provided.'}</p>
                  </div>
                  
                  {teacher?.teacher?.expertise && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Expertise</p>
                      <p className="text-sm">{teacher?.teacher?.expertise}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="education" className="space-y-6 pt-4">
                  {teacher?.teacher?.education && teacher?.teacher?.education.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <GraduationCap className="mr-2 h-5 w-5" /> 
                        Education
                      </h3>
                      <div className="space-y-4">
                        {teacher?.teacher?.education.map((edu, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex flex-col">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{edu.degree}</h4>
                                  <Badge variant="outline">{edu.year}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No education info</h3>
                      <p className="text-muted-foreground">No education details have been provided.</p>
                    </div>
                  )}

                  {teacher?.teacher?.certifications && teacher?.teacher?.certifications.length > 0 && (
                    <div className="space-y-4 mt-8">
                      <h3 className="text-lg font-medium flex items-center">
                        <FileCheck className="mr-2 h-5 w-5" /> 
                        Certifications
                      </h3>
                      <div className="space-y-4">
                        {teacher?.teacher?.certifications.map((cert, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{cert.name}</h4>
                                <Badge variant="outline">{cert.year}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="courses" className="pt-4">
                  {teacher?.my_courses && teacher?.my_courses.length > 0 ? (
                    <div className="space-y-4">
                      {teacher?.my_courses.map((course) => (
                        <Card key={course.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                                <img src={course.image_url} alt={course.title} className="h-full w-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{course.title}</h3>
                                <div className="flex items-center text-sm text-muted-foreground gap-3 mt-1">
                                  <span className="flex items-center">
                                    <Users className="mr-1 h-3 w-3" /> {course.enrollments_count} students
                                  </span>
                                  <span className="flex items-center">
                                    <BookOpen className="mr-1 h-3 w-3" /> {course.lessons_count} lessons
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {course.level}
                                  </Badge>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => navigate(`/courses/${course.id}`)}>
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No courses yet</h3>
                      <p className="text-muted-foreground">This teacher hasn't created any courses yet.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="stats" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <BookOpen className="mx-auto h-8 w-8 text-primary" />
                          <h3 className="mt-2 text-3xl font-bold">
                            {teacher?.my_courses?.length || 0}
                          </h3>
                          <p className="text-sm text-muted-foreground">Total Courses</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Users className="mx-auto h-8 w-8 text-primary" />
                          <h3 className="mt-2 text-3xl font-bold">
                            {teacher?.my_courses?.reduce((sum, course) => sum + course.enrollments_count, 0) || 0}
                          </h3>
                          <p className="text-sm text-muted-foreground">Total Students</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Award className="mx-auto h-8 w-8 text-primary" />
                          <h3 className="mt-2 text-3xl font-bold">
                            {teacher?.teacher?.years_of_experience || 0}
                          </h3>
                          <p className="text-sm text-muted-foreground">Years of Experience</p>
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
        userName={teacher?.name}
        currentStatus={teacher?.status || 'INACTIVE'}
        onStatusUpdate={handleStatusUpdate}
        isLoading={updateStatusMutation.isPending}
      />

      <UserPasswordModal
        isOpen={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
        userName={teacher?.name}
        onPasswordUpdate={handlePasswordReset}
        isLoading={updatePasswordMutation.isPending}
      />

      <DeleteUserModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        userName={teacher?.name}
        onConfirmDelete={handleDeleteUser}
        isLoading={deleteUserMutation.isPending}
      />
    </AdminLayout>
  );
};

export default AdminTeacherViewPage; 