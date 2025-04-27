import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AdminLayout,
  Pagination,
  InstructorModal,
  Input,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
} from '@/components';
import {
  Search,
  Download,
  Filter,
  MoreHorizontal,
  EyeIcon,
  FileEdit,
  Trash2,
  UserPlus,
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
  };
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
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
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

  // Modal states for the new actions
  const [statusModalState, setStatusModalState] = useState({
    isOpen: false,
    teacher: null as Teacher | null,
  });

  const [passwordModalState, setPasswordModalState] = useState({
    isOpen: false,
    teacher: null as Teacher | null,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    teacher: null as Teacher | null,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data, isLoading } = useQuery<TeachersResponse>({
    queryKey: ['teachers', debouncedSearchQuery, currentPage],
    queryFn: () =>
      userService.getTeachers({
        search: debouncedSearchQuery,
        page: currentPage,
      }),
  });

  const createTeacherMutation = useMutation({
    mutationFn: (payload: NewTeacherData) =>
      userService.createUserByAdmin({ ...payload, role: 'TEACHER' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: 'Teacher created',
        description: 'New instructor has been added successfully',
      });
      setIsCreateModalOpen(false);
      resetNewTeacherForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create instructor.',
        variant: 'destructive',
      });
    },
  });

  // New mutations for status, password and delete
  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }) =>
      userService.updateStatusByAdmin(userId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: 'Status updated',
        description: `Instructor status has been updated successfully`,
      });
      setStatusModalState({ isOpen: false, teacher: null });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update instructor status.',
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
        description: 'Instructor password has been reset successfully',
      });
      setPasswordModalState({ isOpen: false, teacher: null });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to reset instructor password.',
        variant: 'destructive',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: 'User deleted',
        description: 'Instructor has been deleted successfully',
      });
      setDeleteModalState({ isOpen: false, teacher: null });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete instructor.',
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
    setIsCopied({ email: false, password: false, both: false });
  };

  
  const exportToCSV = () => {
    if (!data?.teachers) return;
    const headers = [
      'ID',
      'Name',
      'Email',
      'Role',
      'Courses Count',
      'Total Students',
      'Total Lessons',
    ];
    const rows = data.teachers.map((t) =>
      [
        t.id,
        t.name,
        t.email,
        t.role,
        t.my_courses.length,
        t.my_courses.reduce((sum, c) => sum + c.enrollments_count, 0),
        t.my_courses.reduce((sum, c) => sum + c.lessons_count, 0),
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'instructors.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // New handler functions for our user actions
  const handleUpdateStatus = (status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    if (statusModalState.teacher) {
      updateStatusMutation.mutate({
        userId: String(statusModalState.teacher.id),
        status,
      });
    }
  };

  const handleUpdatePassword = (password: string) => {
    if (passwordModalState.teacher) {
      updatePasswordMutation.mutate({
        userId: String(passwordModalState.teacher.id),
        password,
      });
    }
  };

  const handleDeleteUser = () => {
    if (deleteModalState.teacher) {
      deleteUserMutation.mutate(String(deleteModalState.teacher.id));
    }
  };

  const actions = [
    {
      name: 'View',
      icon: <EyeIcon className="mr-2 h-4 w-4" />,
      onClick: (teacher: Teacher) => {
        navigate(`/admin/instructors/${teacher.id}`);
      },
    },
 /*    {
      name: 'Edit',
      icon: <FileEdit className="mr-2 h-4 w-4" />,
      onClick: (teacher: Teacher) => {
        toast({
          title: 'Edit instructor',
          description: `You edited instructor ${teacher.name}`,
        });
      },
    }, */
    {
      name: 'Change Status',
      icon: <ShieldAlert className="mr-2 h-4 w-4" />,
      onClick: (teacher: Teacher) => {
        setStatusModalState({ isOpen: true, teacher });
      },
    },
    {
      name: 'Reset Password',
      icon: <KeyRound className="mr-2 h-4 w-4" />,
      onClick: (teacher: Teacher) => {
        setPasswordModalState({ isOpen: true, teacher });
      },
    },
    {
      name: 'Delete',
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: (teacher: Teacher) => {
        setDeleteModalState({ isOpen: true, teacher });
      },
    },
  ];

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8">
            Loading instructors...
          </TableCell>
        </TableRow>
      );
    }

    if (!data?.teachers.length) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8">
            No instructors found
          </TableCell>
        </TableRow>
      );
    }

    return data.teachers.map((teacher) => {
      const coursesCount = teacher.my_courses.length;
      const specialization = teacher.teacher?.specialization || '-';
      const experience = teacher.teacher?.years_of_experience
        ? `${teacher.teacher.years_of_experience} yrs`
        : '-';
      const lastLogin = teacher.last_login_at
        ? new Date(teacher.last_login_at).toLocaleDateString()
        : '-';
      const status = teacher.status || 'INACTIVE';

      return (
        <TableRow key={teacher.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={teacher.avatar || undefined} alt={teacher.name} />
              <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{teacher.name}</div>
              <div className="text-sm text-muted-foreground">{teacher.email}</div>
            </div>
          </div>
        </TableCell>

        <TableCell>{specialization}</TableCell>
        <TableCell>{coursesCount}</TableCell>
        <TableCell>{experience}</TableCell>
        <TableCell>{lastLogin}</TableCell>
        <TableCell>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : status === 'SUSPENDED'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {status}
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
                  onClick={() => action.onClick(teacher)}
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
    });
  };

  return (
    <AdminLayout title="Manage Instructors">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Instructors</h1>

        <Card className="mb-8 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <CardTitle>Manage Instructors</CardTitle>
              <Button
                className="flex items-center gap-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <UserPlus size={16} /> Add Instructor
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search instructors..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                
                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  className="flex items-center gap-2"
                >
                  <Download size={16} /> Export
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Instructor</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Total Courses</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderTableBody()}</TableBody>
              </Table>
            </div>

            {data && data.meta.last_page > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={data.meta.page}
                  totalPages={data.meta.last_page}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create instructor modal */}
      <InstructorModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Status update modal */}
      {statusModalState.teacher && (
        <UserStatusModal
          isOpen={statusModalState.isOpen}
          onOpenChange={(open) => setStatusModalState(prev => ({ ...prev, isOpen: open }))}
          userName={statusModalState.teacher.name}
          currentStatus={statusModalState.teacher.status || 'INACTIVE'}
          onStatusUpdate={handleUpdateStatus}
          isLoading={updateStatusMutation.isPending}
        />
      )}

      {/* Password reset modal */}
      {passwordModalState.teacher && (
        <UserPasswordModal
          isOpen={passwordModalState.isOpen}
          onOpenChange={(open) => setPasswordModalState(prev => ({ ...prev, isOpen: open }))}
          userName={passwordModalState.teacher.name}
          onPasswordUpdate={handleUpdatePassword}
          isLoading={updatePasswordMutation.isPending}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteModalState.teacher && (
        <DeleteUserModal
          isOpen={deleteModalState.isOpen}
          onOpenChange={(open) => setDeleteModalState(prev => ({ ...prev, isOpen: open }))}
          userName={deleteModalState.teacher.name}
          onConfirmDelete={handleDeleteUser}
          isLoading={deleteUserMutation.isPending}
        />
      )}
    </AdminLayout>
  );
};

export default InstructorsPage;
