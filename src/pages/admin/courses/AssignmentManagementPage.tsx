import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  ChevronLeft,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  BookOpen,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/api';
import { Assignment } from '@/types/course';
import AdminLayout from '@/components/layout/AdminLayout';
import WrapperLoading from '@/components/ui/wrapper-loading';

const AssignmentManagementPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
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
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.status === 'DRAFT') {
      return <Badge variant="secondary">Draft</Badge>;
    }
    if (assignment.is_overdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (assignment.is_active) {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="outline">Inactive</Badge>;
  };

  const getStatusIcon = (assignment: Assignment) => {
    if (assignment.status === 'DRAFT') {
      return <FileText className="h-4 w-4 text-gray-500" />;
    }
    if (assignment.is_overdue) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (assignment.is_active) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    deleteAssignmentMutation.mutate(assignmentId);
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
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Assignment Management</h1>
              <p className="text-muted-foreground">Course: {course?.title}</p>
            </div>
            <Button
              onClick={() =>
                navigate(`/admin/courses/${courseId}/assignments/create`)
              }
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search assignments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[140px]">
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

          {/* Assignments List */}
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">
                  No assignments found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {assignments.length === 0
                    ? "You haven't created any assignments yet."
                    : 'No assignments match your current filters.'}
                </p>
                {assignments.length === 0 && (
                  <Button
                    onClick={() =>
                      navigate(`/admin/courses/${courseId}/assignments/create`)
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Assignment
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment: Assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  courseId={courseId!}
                  onDelete={handleDeleteAssignment}
                  getStatusBadge={getStatusBadge}
                  getStatusIcon={getStatusIcon}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      </WrapperLoading>
    </AdminLayout>
  );
};

interface AssignmentCardProps {
  assignment: Assignment;
  courseId: string;
  onDelete: (assignmentId: string) => void;
  getStatusBadge: (assignment: Assignment) => JSX.Element;
  getStatusIcon: (assignment: Assignment) => JSX.Element;
  formatDate: (dateString: string) => string;
}

const AssignmentCard = ({
  assignment,
  courseId,
  onDelete,
  getStatusBadge,
  getStatusIcon,
  formatDate,
}: AssignmentCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(assignment)}
              <h3 className="text-lg font-semibold">{assignment.title}</h3>
              {getStatusBadge(assignment)}
              <Badge variant="outline">{assignment.type}</Badge>
            </div>

            <p className="text-muted-foreground mb-4 line-clamp-2">
              {assignment.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {assignment.due_date
                      ? formatDate(assignment.due_date)
                      : 'No due date'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-muted-foreground">Questions</p>
                  <p className="font-medium">
                    {assignment.questions_count || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-muted-foreground">Submissions</p>
                  <p className="font-medium">
                    {assignment.submissions_count || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-muted-foreground">Max Score</p>
                  <p className="font-medium">{assignment.max_score || 0} pts</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex items-center gap-2"
            >
              <Link
                to={`/admin/courses/${courseId}/assignments/${assignment.id}/submissions`}
              >
                <Users className="h-4 w-4" />
                View Submissions
              </Link>
            </Button>

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
                      <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{assignment.title}"?
                        This action cannot be undone.
                        {assignment.submissions_count &&
                          assignment.submissions_count > 0 && (
                            <span className="block mt-2 text-red-600 font-medium">
                              Warning: This assignment has{' '}
                              {assignment.submissions_count} submission(s).
                            </span>
                          )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(assignment.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentManagementPage;
