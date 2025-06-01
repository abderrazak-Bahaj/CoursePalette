import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronLeft,
  Search,
  Eye,
  Clock,
  Calendar,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  Users,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService, submissionService } from '@/services/api';
import { Assignment, Submission, AssignmentQuestion } from '@/types/course';
import AdminLayout from '@/components/layout/AdminLayout';
import WrapperLoading from '@/components/ui/wrapper-loading';

const SubmissionsReviewPage = () => {
  const { courseId, assignmentId } = useParams<{
    courseId: string;
    assignmentId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: assignmentData, isLoading: assignmentLoading } = useQuery({
    queryKey: ['assignment', courseId, assignmentId],
    queryFn: async () =>
      await courseService.getAssignment(courseId, assignmentId),
  });

  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ['assignment-submissions', courseId, assignmentId],
    queryFn: async () =>
      await submissionService.getAssignmentSubmissions(
        courseId!,
        assignmentId!
      ),
  });

  const assignment = assignmentData?.assignment;
  const submissions = submissionsData?.submissions || [];

  const filteredSubmissions = submissions.filter((submission: Submission) => {
    const matchesSearch =
      submission.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'SUBMITTED':
        return <Badge variant="default">Submitted</Badge>;
      case 'GRADED':
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            Graded
          </Badge>
        );
      case 'RESUBMITTED':
        return <Badge variant="destructive">Resubmitted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'SUBMITTED':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'GRADED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'RESUBMITTED':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
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

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const submissionStats = {
    total: submissions.length,
    submitted: submissions.filter((s: Submission) => s.status === 'SUBMITTED')
      .length,
    graded: submissions.filter((s: Submission) => s.status === 'GRADED').length,
    draft: submissions.filter((s: Submission) => s.status === 'DRAFT').length,
    averageScore:
      submissions.filter((s: Submission) => s.score !== null).length > 0
        ? submissions
            .filter((s: Submission) => s.score !== null)
            .reduce((sum: number, s: Submission) => sum + (s.score || 0), 0) /
          submissions.filter((s: Submission) => s.score !== null).length
        : 0,
  };

  return (
    <AdminLayout title="Review Submissions">
      <WrapperLoading isLoading={assignmentLoading || submissionsLoading}>
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
              <h1 className="text-2xl font-bold">Assignment Submissions</h1>
              <p className="text-muted-foreground">{assignment?.title}</p>
              {/* Course Title */}
              <p className="text-muted-foreground">
                <span className="font-bold">Course:</span>{' '}
                {assignment?.course?.title}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">
                      {submissionStats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="text-2xl font-bold">
                      {submissionStats.submitted}
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
                    <p className="text-sm text-muted-foreground">Graded</p>
                    <p className="text-2xl font-bold">
                      {submissionStats.graded}
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
                      {submissionStats.draft}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-2xl font-bold">
                      {submissionStats.averageScore.toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by student name or email..."
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
                      <SelectItem value="SUBMITTED">Submitted</SelectItem>
                      <SelectItem value="GRADED">Graded</SelectItem>
                      <SelectItem value="RESUBMITTED">Resubmitted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submissions ({filteredSubmissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No submissions found matching your criteria.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Graded At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission: Submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">
                                {submission.user?.name || 'Unknown'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {submission.user?.email || 'No email'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(submission.status)}
                            {getStatusBadge(submission.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {submission.submitted_at ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              {formatDate(submission.submitted_at)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Not submitted
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission.score !== null ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-medium ${getScoreColor(submission.score, assignment?.max_score || 100)}`}
                              >
                                {submission.score}/
                                {assignment?.max_score || 100}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ({submission.score_percentage}%)
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Not graded
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission.graded_at ? (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              {formatDate(submission.graded_at)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Not graded
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/admin/courses/${courseId}/assignments/${assignmentId}/submissions/${submission.id}/review`
                                )
                              }
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review & Grade
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </WrapperLoading>
    </AdminLayout>
  );
};

export default SubmissionsReviewPage;
