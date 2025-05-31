import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  Save,
  Clock,
  Calendar,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  MessageSquare,
  BookOpen,
  Award,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService, submissionService } from '@/services/api';
import { Assignment, Submission, AssignmentQuestion, SubmissionAnswer } from '@/types/course';
import AdminLayout from '@/components/layout/AdminLayout';
import WrapperLoading from '@/components/ui/wrapper-loading';
import { formatTimeLimit } from '@/utils/dateLimit';

interface GradingData {
  score: number;
  feedback: string;
}

const SubmissionReviewDetailPage = () => {
  const { courseId, assignmentId, submissionId } = useParams<{
    courseId: string;
    assignmentId: string;
    submissionId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [gradingData, setGradingData] = useState<GradingData>({
    score: 0,
    feedback: '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  const { data: assignmentData, isLoading: assignmentLoading } = useQuery({
    queryKey: ['assignment', courseId, assignmentId],
    queryFn: async () =>
      await courseService.getAssignment(courseId, assignmentId),
  });

  const { data: submissionData, isLoading: submissionLoading } = useQuery({
    queryKey: ['submission', courseId, assignmentId, submissionId],
    queryFn: async () =>
      await submissionService.getSubmission(courseId!, assignmentId!, submissionId!),
  });

  const gradeSubmissionMutation = useMutation({
    mutationFn: (data: { score: number; feedback: string }) =>
      courseService.gradeSubmission(courseId!, assignmentId!, {
        submission_id: submissionId!,
        score: data.score,
        feedback: data.feedback,
      }),
    onSuccess: () => {
      toast({
        title: 'Submission Graded',
        description: 'The submission has been graded successfully.',
      });
      setHasChanges(false);
      queryClient.invalidateQueries({
        queryKey: ['submission', courseId, assignmentId, submissionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['assignment-submissions', courseId, assignmentId],
      });
    },
    onError: () => {
      toast({
        title: 'Grading Failed',
        description: 'Failed to grade submission. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const assignment = assignmentData?.assignment;
  const submission = submissionData?.submission;

  // Initialize grading data when submission loads
  useEffect(() => {
    if (submission) {
      setGradingData({
        score: submission.score || 0,
        feedback: submission.feedback || '',
      });
    }
  }, [submission]);

  // Track changes
  useEffect(() => {
    if (submission) {
      const hasScoreChanged = gradingData.score !== (submission.score || 0);
      const hasFeedbackChanged = gradingData.feedback !== (submission.feedback || '');
      setHasChanges(hasScoreChanged || hasFeedbackChanged);
    }
  }, [gradingData, submission]);

  const handleSaveGrade = () => {
    const maxScore = assignment?.max_score || 100; // Default to 100 if not defined

    if (gradingData.score < 0 || gradingData.score > maxScore) {
      toast({
        title: 'Invalid Score',
        description: `Score must be between 0 and ${maxScore}.`,
        variant: 'destructive',
      });
      return;
    }

    gradeSubmissionMutation.mutate(gradingData);
  };

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

  const getScorePercentage = (score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100);
  };

  if (assignmentLoading || submissionLoading) {
    return (
      <AdminLayout title="Review Submission">
        <WrapperLoading isLoading={true}>
          <div />
        </WrapperLoading>
      </AdminLayout>
    );
  }

  if (!assignment || !submission) {
    return (
      <AdminLayout title="Review Submission">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium mb-2">Submission Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The submission you are looking for does not exist.
              </p>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Review Submission">
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
            Back to Submissions
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Review Submission</h1>
            <p className="text-muted-foreground">{assignment.title}</p>
          </div>
          {hasChanges && (
            <Button
              onClick={handleSaveGrade}
              disabled={gradeSubmissionMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Grade
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Submission Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{assignment.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="outline">{assignment.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Score</p>
                    <p className="font-medium">{assignment.max_score || 100} points</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date Limit</p>
                    <p className="font-medium">
                      {assignment.date_limit ? formatTimeLimit(assignment.date_limit) : 'No date limit'}
                    </p>
                  </div>
                </div>
                {assignment.description && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="mt-1">{assignment.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Student Answers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Student Answers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {submission.answers?.map((answer: SubmissionAnswer, index: number) => {
                  const question = assignment.questions?.find(
                    (q: AssignmentQuestion) => q.id === answer.question_id
                  );
                  return (
                    <div key={answer.id} className="border-l-4 border-l-blue-500 pl-4">
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-lg">Question {index + 1}</p>
                          <p className="text-muted-foreground mt-1">
                            {question?.question || question?.question_text}
                          </p>
                          {question?.points && (
                            <p className="text-sm text-muted-foreground">
                              Points: {question.points}
                            </p>
                          )}
                        </div>

                        {/* Show options for multiple choice questions */}
                        {question?.options && question.options.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Options:</p>
                            {question.options.map((option, optIndex) => (
                              <div
                                key={option.id}
                                className={`p-2 rounded border ${
                                  option.is_correct
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <span>{option.text || option.option_text}</span>
                                  {option.is_correct && (
                                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-2">
                            Student's Answer:
                          </p>
                          <p className="text-blue-800">{
                            question?.options?.length > 0 ? question.options.find(option => option.id === answer.answer)?.text || answer.answer : answer.answer
                            }</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(!submission.answers || submission.answers.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No answers submitted yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Student Info and Grading */}
          <div className="space-y-6">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{submission.user?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{submission.user?.email || 'No email'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(submission.status)}
                      {getStatusBadge(submission.status)}
                    </div>
                  </div>
                  {submission.submitted_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted At</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p className="font-medium">{formatDate(submission.submitted_at)}</p>
                      </div>
                    </div>
                  )}
                  {submission.graded_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Graded At</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <p className="font-medium">{formatDate(submission.graded_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Grading Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Grading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Score Display */}
                {submission.score !== null && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Current Score</p>
                    <div className="flex items-center gap-2">
                                             <span
                         className={`text-2xl font-bold ${getScoreColor(
                           submission.score,
                           assignment.max_score || 100
                         )}`}
                       >
                         {submission.score}/{assignment.max_score || 100}
                       </span>
                       <span className="text-lg text-muted-foreground">
                         ({getScorePercentage(submission.score, assignment.max_score || 100)}%)
                       </span>
                    </div>
                  </div>
                )}

                {/* Score Input */}
                <div className="space-y-2">
                  <Label htmlFor="score">
                    Score (out of {assignment.max_score || 100})
                  </Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max={assignment.max_score || 100}
                    value={gradingData.score}
                    onChange={(e) =>
                      setGradingData((prev) => ({
                        ...prev,
                        score: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="text-lg font-medium"
                  />
                  <p className="text-sm text-muted-foreground">
                    Percentage: {getScorePercentage(gradingData.score, assignment.max_score || 100)}%
                  </p>
                </div>

                {/* Feedback Input */}
                <div className="space-y-2">
                  <Label htmlFor="feedback" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Feedback
                  </Label>
                  <Textarea
                    id="feedback"
                    value={gradingData.feedback}
                    onChange={(e) =>
                      setGradingData((prev) => ({
                        ...prev,
                        feedback: e.target.value,
                      }))
                    }
                    placeholder="Provide feedback for the student..."
                    rows={6}
                    className="resize-none"
                  />
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSaveGrade}
                  disabled={gradeSubmissionMutation.isPending || !hasChanges}
                  className="w-full flex items-center gap-2"
                  size="lg"
                >
                  <Save className="h-4 w-4" />
                  {gradeSubmissionMutation.isPending ? 'Saving...' : 'Save Grade'}
                </Button>

                {hasChanges && (
                  <p className="text-sm text-orange-600 text-center">
                    You have unsaved changes
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Current Feedback Display */}
            {submission.feedback && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Current Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800">{submission.feedback}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SubmissionReviewDetailPage; 