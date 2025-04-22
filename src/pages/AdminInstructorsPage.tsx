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
  Star,
  UserPlus,
  FileEdit,
  Trash2,
  EyeIcon,
  Copy,
  CheckCircle2,
  RefreshCw,
  X,
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pagination } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast as toastify } from '@/components/ui/use-toast';
import InstructorModal from '@/components/admin/InstructorModal';

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

interface TeachersResponse {
  teachers: Teacher[];
  meta: {
    total: number;
    page: number;
    last_page: number;
    per_page: number;
  };
}

interface NewTeacherData {
  name: string;
  email: string;
  password: string;
  bio?: string;
  phone?: string;
  address?: string;
}

const InstructorsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState<NewTeacherData>({
    name: '',
    email: '',
    password: '',
    bio: '',
    phone: '',
    address: '',
  });
  const [isCopied, setIsCopied] = useState({
    email: false,
    password: false,
    both: false,
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<TeachersResponse>({
    queryKey: ['teachers', debouncedSearchQuery, currentPage],
    queryFn: () =>
      userService.getTeachers({
        search: debouncedSearchQuery,
        page: currentPage,
      }),
  });

  const createTeacherMutation = useMutation({
    mutationFn: (data: NewTeacherData) =>
      userService.createUserByAdmin({
        name: data.name,
        email: data.email,
        password: data.password,
        bio: data.bio,
        phone: data.phone,
        address: data.address,
        role: 'teacher',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: 'Teacher created',
        description: 'New instructor has been added successfully',
      });
      setIsCreateModalOpen(false);
      resetNewTeacherForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create instructor. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const resetNewTeacherForm = () => {
    setNewTeacher({
      name: '',
      email: '',
      password: '',
      bio: '',
      phone: '',
      address: '',
    });
    setIsCopied({
      email: false,
      password: false,
      both: false,
    });
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    setNewTeacher({
      ...newTeacher,
      password,
    });
    // Reset copy states
    setIsCopied({
      email: false,
      password: false,
      both: false,
    });
  };

  const copyToClipboard = (
    text: string,
    type: 'email' | 'password' | 'both'
  ) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied((prev) => ({ ...prev, [type]: true }));

      // Reset copied state after 3 seconds
      setTimeout(() => {
        setIsCopied((prev) => ({ ...prev, [type]: false }));
      }, 3000);
    });
  };

  const handleCreateTeacher = () => {
    // Basic validation
    if (
      !newTeacher.name.trim() ||
      !newTeacher.email.trim() ||
      !newTeacher.password.trim()
    ) {
      toast({
        title: 'Validation Error',
        description: 'Name, email and password are required',
        variant: 'destructive',
      });
      return;
    }

    createTeacherMutation.mutate(newTeacher);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAction = (action: string, id: number, name: string) => {
    toast({
      title: `${action} instructor`,
      description: `You ${action.toLowerCase()}ed instructor ${name}`,
    });
  };

  const exportToCSV = () => {
    if (!data?.teachers) return;

    // Prepare CSV content
    const headers = [
      'ID',
      'Name',
      'Email',
      'Role',
      'Courses Count',
      'Total Students',
      'Total Lessons',
    ];
    const csvContent = data.teachers.map((teacher) => {
      const coursesCount = teacher.my_courses.length;
      const totalStudents = teacher.my_courses.reduce(
        (sum, course) => sum + course.enrollments_count,
        0
      );
      const totalLessons = teacher.my_courses.reduce(
        (sum, course) => sum + course.lessons_count,
        0
      );

      return [
        teacher.id,
        teacher.name,
        teacher.email,
        teacher.role,
        coursesCount,
        totalStudents,
        totalLessons,
      ].join(',');
    });

    // Create CSV file
    const csvData = [headers.join(','), ...csvContent].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Download CSV file
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'instructors.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title={'Manage Instructors'}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Instructors</h1>
        <Card className="mb-8 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Manage Instructors</CardTitle>
              <Button
                className="flex items-center gap-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <UserPlus size={16} />
                <span>Add Instructor</span>
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
                  placeholder="Search instructors..."
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
                    <TableHead>Instructor</TableHead>
                    <TableHead>Total Courses</TableHead>
                    <TableHead>Total Students</TableHead>
                    <TableHead>Total Lessons</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading instructors...
                      </TableCell>
                    </TableRow>
                  ) : data?.teachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No instructors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.teachers.map((teacher) => {
                      const coursesCount = teacher.my_courses.length;
                      const totalStudents = teacher.my_courses.reduce(
                        (sum, course) => sum + course.enrollments_count,
                        0
                      );
                      const totalLessons = teacher.my_courses.reduce(
                        (sum, course) => sum + course.lessons_count,
                        0
                      );

                      return (
                        <TableRow key={teacher.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={teacher.avatar || undefined}
                                  alt={teacher.name}
                                />
                                <AvatarFallback>
                                  {teacher.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {teacher.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {teacher.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{coursesCount}</TableCell>
                          <TableCell>{totalStudents}</TableCell>
                          <TableCell>{totalLessons}</TableCell>
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
                                      teacher.id,
                                      teacher.name
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
                                      teacher.id,
                                      teacher.name
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
                                      teacher.id,
                                      teacher.name
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

      {/* Instructor Modal */}
      <InstructorModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </AdminLayout>
  );
};

export default InstructorsPage;
