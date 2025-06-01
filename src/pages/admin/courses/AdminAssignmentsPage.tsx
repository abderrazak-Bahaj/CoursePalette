import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Search,
  Plus,
  Eye,
  Users,
  Clock,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  BookOpen,
  ClipboardList,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '@/services/api';
import { Assignment } from '@/types/course';
import AdminLayout from '@/components/layout/AdminLayout';
import WrapperLoading from '@/components/ui/wrapper-loading';

const AdminAssignmentsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Get all courses first
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => await courseService.getAdminCources(),
  });

  // Get assignments for all courses
  const { data: allAssignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['all-assignments', statusFilter, typeFilter],
    queryFn: async () => {
      const courses = coursesData?.courses || [];
      const allAssignments: Array<
        Assignment & { course_title: string; course_id: string }
      > = [];

      for (const course of courses) {
        try {
          const params: Record<string, string> = {};
          if (statusFilter !== 'all') params.status = statusFilter;
          if (typeFilter !== 'all') params.type = typeFilter;

          const assignmentsResponse = await courseService.getCourseAssignments(
            course.id,
            params
          );
          const assignments = assignmentsResponse.assignments || [];

          assignments.forEach((assignment: Assignment) => {
            allAssignments.push({
              ...assignment,
              course_title: course.title,
              course_id: course.id,
            });
          });
        } catch (error) {
          console.error(
            `Failed to fetch assignments for course ${course.id}:`,
            error
          );
        }
      }

      return { assignments: allAssignments };
    },
    enabled: !!coursesData?.courses,
  });

  const courses = coursesData?.courses || [];
  const assignments = allAssignmentsData?.assignments || [];

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course_title.toLowerCase().includes(searchTerm.toLowerCase())
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

  const assignmentStats = {
    total: assignments.length,
    active: assignments.filter((a) => a.is_active).length,
    draft: assignments.filter((a) => a.status === 'DRAFT').length,
    overdue: assignments.filter((a) => a.is_overdue).length,
  };

  return (
    <AdminLayout title="All Assignments">
      <WrapperLoading isLoading={coursesLoading || assignmentsLoading}>
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Assignment Overview</h1>
              <p className="text-muted-foreground">
                Manage assignments across all your courses
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin/courses')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">
                      {assignmentStats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">
                      {assignmentStats.active}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Drafts</p>
                    <p className="text-2xl font-bold">
                      {assignmentStats.draft}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold">
                      {assignmentStats.overdue}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search assignments or courses..."
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
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400" />
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
                    onClick={() => navigate('/admin/courses')}
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
              {filteredAssignments.map((assignment) => (
                <Card
                  key={`${assignment.course_id}-${assignment.id}`}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(assignment)}
                          <h3 className="text-lg font-semibold">
                            {assignment.title}
                          </h3>
                          {getStatusBadge(assignment)}
                          <Badge variant="outline">{assignment.type}</Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-muted-foreground">
                            Course: {assignment.course_title}
                          </span>
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
                              <p className="text-muted-foreground">
                                Submissions
                              </p>
                              <p className="font-medium">
                                {assignment.submissions_count || 0}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-muted-foreground">Max Score</p>
                              <p className="font-medium">
                                {assignment.max_score || 0} pts
                              </p>
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
                            to={`/admin/courses/${assignment.course_id}/assignments`}
                          >
                            <Eye className="h-4 w-4" />
                            Manage
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex items-center gap-2"
                        >
                          <Link
                            to={`/admin/courses/${assignment.course_id}/assignments/${assignment.id}/submissions`}
                          >
                            <Users className="h-4 w-4" />
                            Submissions
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </WrapperLoading>
    </AdminLayout>
  );
};

export default AdminAssignmentsPage;
