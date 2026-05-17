import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  MoreHorizontal,
  ShieldAlert,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/api/userService';
import { User } from '@/types/user';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import StudentForm from '@/components/admin/StudentForm';
import { UserStatusModal } from '@/components/admin/UserStatusModal';
import { UserPasswordModal } from '@/components/admin/UserPasswordModal';

const StudentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAdmin, isTeacher } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [formMode, setFormMode] = useState<'view' | 'edit' | 'create'>(
    'create'
  );
  const [statusModalState, setStatusModalState] = useState({
    isOpen: false,
    student: null as User | null,
  });
  const [passwordModalState, setPasswordModalState] = useState({
    isOpen: false,
    student: null as User | null,
  });

  const { data: dataStudents = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => await userService.getStudents(),
    enabled: isAdmin || isTeacher,
  });

  const students = useMemo(() => dataStudents?.students || [], [dataStudents]);

  const filteredStudents = students.filter(
    (student: User) =>
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteStudentMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      toast({
        title: 'Student deleted',
        description: 'The student has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete student',
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    }) => userService.updateStatusByAdmin(userId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Status updated',
        description: 'Student status has been updated successfully.',
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
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      userService.updatePasswordByAdmin(userId, {
        password,
        password_confirmation: password,
      }),
    onSuccess: () => {
      toast({
        title: 'Password reset',
        description: 'Student password has been reset successfully.',
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

  const exportToCSV = () => {
    if (!filteredStudents.length) return;
    const headers = ['Name', 'Email', 'Role', 'Status'];
    const rows = filteredStudents.map((s: User) =>
      [s.name, s.email, s.role, (s as any).status || 'active'].join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAction = (action: string, student: User) => {
    setSelectedStudent(student);

    switch (action) {
      case 'view':
        setFormMode('view');
        setShowStudentForm(true);
        break;
      case 'edit':
        setFormMode('edit');
        setShowStudentForm(true);
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
      default:
        break;
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedStudent) {
      deleteStudentMutation.mutate(selectedStudent.id);
      setShowDeleteDialog(false);
    }
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setFormMode('create');
    setShowStudentForm(true);
  };

  return (
    <AdminLayout title={'Manage Students'}>
      <div className="container mx-auto px-4 ">
        <Card className="mb-8 shadow-md py-8">
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
                <Button
                  className="flex items-center gap-2"
                  onClick={handleAddStudent}
                >
                  <UserPlus size={16} />
                  <span>Add Student</span>
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Student</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrolled Courses</TableHead>
                    <TableHead>Last Active</TableHead>
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
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student: User) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={student.profileUrl || ''}
                                alt={student.name}
                              />
                              <AvatarFallback>
                                {student.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getRoleColor(student.role)}
                            variant="outline"
                          >
                            {student.role.charAt(0).toUpperCase() +
                              student.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(
                              student.status || 'active'
                            )}
                            variant="outline"
                          >
                            {(student.status || 'active')
                              .charAt(0)
                              .toUpperCase() +
                              (student.status || 'active').slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.enrolledCourses || 0}</TableCell>
                        <TableCell>{student.lastActive || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleAction('view', student)}
                              >
                                <EyeIcon className="mr-2 h-4 w-4" />
                                <span>View</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction('edit', student)}
                              >
                                <FileEdit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setStatusModalState({
                                    isOpen: true,
                                    student,
                                  })
                                }
                              >
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                <span>Change Status</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setPasswordModalState({
                                    isOpen: true,
                                    student,
                                  })
                                }
                              >
                                <KeyRound className="mr-2 h-4 w-4" />
                                <span>Reset Password</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction('delete', student)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the student{' '}
              {selectedStudent?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showStudentForm} onOpenChange={setShowStudentForm}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>
              {formMode === 'view'
                ? 'Student Details'
                : formMode === 'edit'
                  ? 'Edit Student'
                  : 'Add Student'}
            </DialogTitle>
          </DialogHeader>
          <StudentForm
            onCancel={() => setShowStudentForm(false)}
            editStudent={selectedStudent}
            viewOnly={formMode === 'view'}
          />
        </DialogContent>
      </Dialog>

      {/* Status update modal */}
      {statusModalState.student && (
        <UserStatusModal
          isOpen={statusModalState.isOpen}
          onOpenChange={(open) =>
            setStatusModalState((prev) => ({ ...prev, isOpen: open }))
          }
          userName={statusModalState.student.name}
          currentStatus={(statusModalState.student as any).status || 'ACTIVE'}
          onStatusUpdate={(status) =>
            updateStatusMutation.mutate({
              userId: statusModalState.student!.id,
              status,
            })
          }
          isLoading={updateStatusMutation.isPending}
        />
      )}

      {/* Password reset modal */}
      {passwordModalState.student && (
        <UserPasswordModal
          isOpen={passwordModalState.isOpen}
          onOpenChange={(open) =>
            setPasswordModalState((prev) => ({ ...prev, isOpen: open }))
          }
          userName={passwordModalState.student.name}
          onPasswordUpdate={(password) =>
            updatePasswordMutation.mutate({
              userId: passwordModalState.student!.id,
              password,
            })
          }
          isLoading={updatePasswordMutation.isPending}
        />
      )}
    </AdminLayout>
  );
};

export default StudentsPage;
