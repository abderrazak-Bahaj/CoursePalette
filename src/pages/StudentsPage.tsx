import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Filter, UserPlus, FileEdit, Trash2, EyeIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StudentForm from "@/components/admin/StudentForm";

const StudentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [formMode, setFormMode] = useState<"view" | "edit" | "create">("create");
  
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => userService.getStudents().then(res => res.data || []),
    enabled: user?.isAdmin === true || user?.role === 'admin',
  });
  
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
        title: "Student deleted",
        description: "The student has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    }
  });

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
        setFormMode("view");
        setShowStudentForm(true);
        break;
      case 'edit':
        setFormMode("edit");
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
    setFormMode("create");
    setShowStudentForm(true);
  };

  const LayoutComponent = user?.isAdmin ? AdminLayout : "div";
  const layoutProps = user?.isAdmin ? { title: "Manage Students" } : {};

  return (
    <LayoutComponent {...layoutProps}>
      <div className="container mx-auto px-4 py-8">
        {!user?.isAdmin && <h1 className="text-3xl font-bold mb-6">Students</h1>}
        
        <Card className="mb-8 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Manage Students</CardTitle>
              <Button className="flex items-center gap-2" onClick={handleAddStudent}>
                <UserPlus size={16} />
                <span>Add Student</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                <Button variant="outline" className="flex items-center gap-2">
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
                      <TableCell colSpan={6} className="text-center py-8">Loading students...</TableCell>
                    </TableRow>
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">No students found</TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student: User) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={student.profileUrl || ''} alt={student.name} />
                              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-muted-foreground">{student.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(student.role)} variant="outline">
                            {student.role.charAt(0).toUpperCase() + student.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(student.status || 'active')} variant="outline">
                            {(student.status || 'active').charAt(0).toUpperCase() + (student.status || 'active').slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.enrolledCourses || 0}</TableCell>
                        <TableCell>{student.lastActive || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleAction('view', student)}>
                                <EyeIcon className="mr-2 h-4 w-4" />
                                <span>View</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('edit', student)}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('delete', student)} className="text-red-600">
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
              This action will permanently delete the student {selectedStudent?.name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showStudentForm} onOpenChange={setShowStudentForm}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>
              {formMode === 'view' ? 'Student Details' : formMode === 'edit' ? 'Edit Student' : 'Add Student'}
            </DialogTitle>
          </DialogHeader>
          <StudentForm 
            onCancel={() => setShowStudentForm(false)}
            editStudent={selectedStudent}
            viewOnly={formMode === 'view'}
          />
        </DialogContent>
      </Dialog>
    </LayoutComponent>
  );
};

export default StudentsPage;
