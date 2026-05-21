import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  BookOpen,
  Sparkles,
  PenLine,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/api';
import { Assignment } from '@/types/course';
import AdminLayout from '@/components/layout/AdminLayout';
import WrapperLoading from '@/components/ui/wrapper-loading';
import { useSEO } from '@/hooks/useSEO';

const AssignmentManagementPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useSEO({
    title: 'Manage Assignments',
    description: 'Manage course assignments on Skillorai.',
    noIndex: true,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => await courseService.getCourse(courseId),
  });

  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['course-assignments', courseId, statusFilter, typeFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      return await courseService.getCourseAssignments(courseId!, params);
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) =>
      courseService.deleteAssignment(courseId!, assignmentId),
    onSuccess: () => {
      toast({
        title: 'Assignment Deleted',
        description: 'Assignment has been deleted successfully.',
      });
      queryClient.invalidateQueries({
        queryKey: ['course-assignments', courseId],
      });
    },
    onError: () => {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete assignment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const course = courseData?.course;
  const assignments = assignmentsData?.assignments || [];

  const filteredAssignments = assignments.filter(
    (assignment: Assignment) =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'PUBLISHED':
        return <Badge variant="default">Published</Badge>;
      case 'ACTIVE':
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Active
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimeLimit = (minutes: number) => {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes}min`;
    if (minutes === 60) return '1hr';
    if (minutes % 60 === 0) return `${minutes / 60}hrs`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <AdminLayout title="Assignment Management">
      <WrapperLoading isLoading={courseLoading || assignmentsLoading}>
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 border border-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Assignment Management</h1>
              <p className="text-muted-foreground">Course: {course?.title}</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          </div>

          {/* Create Assignment Choice Modal */}
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Assignment</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 py-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    navigate(`/admin/courses/${courseId}/assignments/generate`);
                  }}
                  className="flex items-start gap-4 p-4 rounded-lg border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 transition-colors text-left"
                >
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <Sparkles className="h-6 w-6 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Generate with AI</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      AI generates questions from your lesson content.
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    navigate(`/admin/courses/${courseId}/assignments/create`);
                  }}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="p-2 rounded-lg bg-muted">
                    <PenLine className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Create Manually</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Write your own questions and configure scoring.
                    </p>
                  </div>
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                      <SelectItem value="ESSAY">Essay</SelectItem>
                      <SelectItem value="MULTIPLE_CHOICE">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignments Table */}
          <Card>
            <CardContent className="p-0">
              {filteredAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                  <h3 className="text-lg font-medium mb-2">
                    No assignments found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {assignments.length === 0
                      ? "You haven't created any assignments yet."
                      : 'No assignments match your filters.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Time Limit</TableHead>
                        <TableHead>Max Score</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssignments.map((assignment: Assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium max-w-[200px]">
                            <Link
                              to={`/admin/courses/${courseId}/assignments/${assignment.id}`}
                              className="hover:text-primary transition-colors line-clamp-1"
                            >
                              {assignment.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {assignment.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(assignment.status)}
                          </TableCell>
                          <TableCell>
                            {assignment.questions_count || 0}
                          </TableCell>
                          <TableCell>
                            <Link
                              to={`/admin/courses/${courseId}/assignments/${assignment.id}/submissions`}
                              className="text-primary hover:underline"
                            >
                              {assignment.submissions_count || 0}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {formatTimeLimit(assignment.date_limit)}
                          </TableCell>
                          <TableCell>{assignment.max_score || 0} pts</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    to={`/admin/courses/${courseId}/assignments/${assignment.id}`}
                                    className="flex items-center gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Preview
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    to={`/admin/courses/${courseId}/assignments/${assignment.id}/edit`}
                                    className="flex items-center gap-2"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    to={`/admin/courses/${courseId}/assignments/${assignment.id}/submissions`}
                                    className="flex items-center gap-2"
                                  >
                                    <Users className="h-4 w-4" />
                                    Submissions
                                  </Link>
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Assignment
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "
                                        {assignment.title}"? This cannot be
                                        undone.
                                        {(assignment.submissions_count ?? 0) >
                                          0 && (
                                          <span className="block mt-2 text-red-600 font-medium">
                                            Warning:{' '}
                                            {assignment.submissions_count}{' '}
                                            submission(s) exist.
                                          </span>
                                        )}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          deleteAssignmentMutation.mutate(
                                            assignment.id
                                          )
                                        }
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </WrapperLoading>
    </AdminLayout>
  );
};

export default AssignmentManagementPage;
