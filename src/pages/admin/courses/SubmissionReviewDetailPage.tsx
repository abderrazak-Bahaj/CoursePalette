import { useState, useEffect, useRef } from 'react';
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
  MessageSquare,
  BookOpen,
  Award,
  Bot,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService, submissionService } from '@/services/api';
import {
  Assignment,
  Submission,
  AssignmentQuestion,
  SubmissionAnswer,
} from '@/types/course';
import AdminLayout from '@/components/layout/AdminLayout';
import WrapperLoading from '@/components/ui/wrapper-loading';
import { formatTimeLimit } from '@/utils/dateLimit';
import { aiApiClient } from '@/services/ai/aiApiClient';
import type { PreGrade } from '@/services/ai/types';
import ReactMarkdown from 'react-markdown';
import { useSEO } from '@/hooks/useSEO';

/** Auto-resizing textarea that adjusts height to content */
function AutoResizeTextarea({
  value,
  onChange,
  className,
  placeholder,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <Textarea
      ref={ref}
      value={value}
      onChange={onChange}
      className={`resize-none overflow-hidden ${className || ''}`}
      placeholder={placeholder}
      rows={2}
      {...props}
    />
  );
}

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

  useSEO({
    title: 'Submission Review',
    description: 'Review and grade a student submission on Skillorai.',
    noIndex: true,
  });

  const [gradingData, setGradingData] = useState<GradingData>({
    score: 0,
    feedback: '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [preGradeApplied, setPreGradeApplied] = useState(false);
  // Per-answer feedback editable by teacher (keyed by question_id)
  const [perAnswerFeedback, setPerAnswerFeedback] = useState<
    Record<string, { score: number; feedback: string }>
  >({});

  const { data: assignmentData, isLoading: assignmentLoading } = useQuery({
    queryKey: ['assignment', courseId, assignmentId],
    queryFn: async () =>
      await courseService.getAssignment(courseId, assignmentId),
  });

  const { data: submissionData, isLoading: submissionLoading } = useQuery({
    queryKey: ['submission', courseId, assignmentId, submissionId],
    queryFn: async () =>
      await submissionService.getSubmission(
        courseId!,
        assignmentId!,
        submissionId!
      ),
  });

  // Fetch AI pre-grade data
  // Fetch AI pre-grade data
  const { data: preGradeData } = useQuery<PreGrade | null>({
    queryKey: ['pregrade', courseId, assignmentId, submissionId],
    queryFn: async () => {
      try {
        return await aiApiClient.getPreGrade(
          courseId!,
          assignmentId!,
          submissionId!
        );
      } catch {
        return null;
      }
    },
    enabled: !!courseId && !!assignmentId && !!submissionId,
  });

  const gradeSubmissionMutation = useMutation({
    mutationFn: async (data: { score: number; feedback: string }) => {
      // Save per-answer edits to the pre-grade record if any exist
      if (preGrade && Object.keys(perAnswerFeedback).length > 0) {
        const updatedPerAnswer = (preGrade.per_answer || []).map((pa) => {
          const edited = perAnswerFeedback[String(pa.question_id)];
          if (edited) {
            return {
              question_id: String(pa.question_id),
              score: edited.score,
              feedback: edited.feedback,
            };
          }
          return {
            question_id: String(pa.question_id),
            score: pa.score,
            feedback: pa.feedback,
          };
        });

        try {
          await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/pregrade`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}`,
              },
              body: JSON.stringify({
                total_score: data.score,
                summary: data.feedback,
                per_answer: updatedPerAnswer,
              }),
            }
          );
        } catch {
          // Non-blocking — continue with grade save even if pre-grade update fails
        }
      }

      // Save the final grade
      return courseService.gradeSubmission(courseId!, assignmentId!, {
        submission_id: submissionId!,
        score: data.score,
        feedback: data.feedback,
      });
    },
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
      queryClient.invalidateQueries({
        queryKey: ['pregrade', courseId, assignmentId, submissionId],
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Grading Failed',
        description:
          error?.message || 'Failed to grade submission. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const assignment = assignmentData?.assignment;
  const submission = submissionData?.submission;
  const preGrade = preGradeData;

  // Initialize grading data: prefer existing grade, then AI pre-grade, then defaults
  useEffect(() => {
    if (submission) {
      if (submission.score !== null && submission.score !== undefined) {
        // Already graded — use existing grade
        setGradingData({
          score: submission.score,
          feedback: submission.feedback || '',
        });
      } else if (preGrade && !preGradeApplied) {
        // AI pre-grade available — pre-fill with AI suggestion
        const aiScore = Math.round(preGrade.total_score);
        const aiFeedback = preGrade.summary || '';
        setGradingData({
          score: aiScore,
          feedback: aiFeedback,
        });
        setHasChanges(true); // Mark as changed so teacher can save
      }
    }

    // Always load per-answer feedback from pre-grade record (covers reload)
    if (preGrade?.per_answer && !preGradeApplied) {
      const perAnswer: Record<string, { score: number; feedback: string }> = {};
      preGrade.per_answer.forEach((pa) => {
        perAnswer[String(pa.question_id)] = {
          score: pa.score,
          feedback: pa.feedback,
        };
      });
      setPerAnswerFeedback(perAnswer);
      setPreGradeApplied(true);
    }
  }, [submission, preGrade, preGradeApplied]);

  // Auto-calculate total score from per-answer scores
  useEffect(() => {
    if (Object.keys(perAnswerFeedback).length > 0) {
      const totalScore = Object.values(perAnswerFeedback).reduce(
        (sum, pa) => sum + (pa.score || 0),
        0
      );
      setGradingData((prev) => ({ ...prev, score: totalScore }));
    }
  }, [perAnswerFeedback]);

  // Track changes
  useEffect(() => {
    if (submission) {
      const hasScoreChanged = gradingData.score !== (submission.score || 0);
      const hasFeedbackChanged =
        gradingData.feedback !== (submission.feedback || '');
      const hasPerAnswerChanges = Object.keys(perAnswerFeedback).length > 0;
      setHasChanges(
        hasScoreChanged || hasFeedbackChanged || hasPerAnswerChanges
      );
    }
  }, [gradingData, submission, perAnswerFeedback]);

  const handleSaveGrade = () => {
    const maxScore = assignment?.max_score || 100;

    if (gradingData.score < 0 || gradingData.score > maxScore) {
      toast({
        title: 'Invalid Score',
        description: `Score must be between 0 and ${maxScore}.`,
        variant: 'destructive',
      });
      return;
    }

    // Build combined feedback: overall + per-answer details
    let combinedFeedback = gradingData.feedback;
    const perAnswerEntries = Object.entries(perAnswerFeedback).filter(([, v]) =>
      v.feedback.trim()
    );
    if (perAnswerEntries.length > 0) {
      const perAnswerText = perAnswerEntries
        .map(([qId, v]) => {
          const question = assignment?.questions?.find(
            (q: AssignmentQuestion) => q.id === qId
          );
          const qLabel = question
            ? `Q${(assignment?.questions?.indexOf(question) ?? 0) + 1}`
            : qId;
          return `${qLabel} (${v.score}pts): ${v.feedback}`;
        })
        .join('\n');
      combinedFeedback = combinedFeedback
        ? `${combinedFeedback}\n\n--- Per-Question Feedback ---\n${perAnswerText}`
        : `--- Per-Question Feedback ---\n${perAnswerText}`;
    }

    gradeSubmissionMutation.mutate({
      score: gradingData.score,
      feedback: combinedFeedback,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'SUBMITTED':
        return <Badge variant="default">Submitted</Badge>;
      case 'GRADED':
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Graded
          </Badge>
        );
      case 'AI_GRADED':
        return (
          <Badge
            variant="outline"
            className="border-violet-500 text-violet-500"
          >
            AI Pre-Graded
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
      case 'AI_GRADED':
        return <Bot className="h-4 w-4 text-violet-500" />;
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
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 80) return 'text-blue-500';
    if (percentage >= 70) return 'text-yellow-500';
    if (percentage >= 60) return 'text-orange-500';
    return 'text-red-500';
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

  const maxScore = assignment.max_score || 100;

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
              {gradeSubmissionMutation.isPending
                ? 'Saving...'
                : 'Confirm Grade'}
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
                    <p className="font-medium">{maxScore} points</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date Limit</p>
                    <p className="font-medium">
                      {assignment.date_limit
                        ? formatTimeLimit(assignment.date_limit)
                        : 'No date limit'}
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

            {/* Student Answers with AI per-answer feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Student Answers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {submission.answers?.map(
                  (answer: SubmissionAnswer, index: number) => {
                    const question = assignment.questions?.find(
                      (q: AssignmentQuestion) => q.id === answer.question_id
                    );
                    const aiAnswerFeedback = preGrade?.per_answer?.find(
                      (pa) => pa.question_id === answer.question_id
                    );
                    return (
                      <div
                        key={answer.id}
                        className="border-l-4 border-l-blue-500 pl-4"
                      >
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-lg">
                                Question {index + 1}
                              </p>
                              {aiAnswerFeedback && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-violet-500/50 text-violet-500"
                                >
                                  <Bot className="h-3 w-3 mr-1" />
                                  AI: {aiAnswerFeedback.score}/
                                  {question?.points || 0}
                                </Badge>
                              )}
                            </div>
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
                              <p className="text-sm font-medium text-muted-foreground">
                                Options:
                              </p>
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={option.id}
                                  className={`p-2 rounded border ${
                                    option.is_correct
                                      ? 'bg-green-500/10 border-green-500/30'
                                      : 'bg-muted/30 border-border'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {String.fromCharCode(65 + optIndex)}.
                                    </span>
                                    <span>
                                      {option.text || option.option_text}
                                    </span>
                                    {option.is_correct && (
                                      <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                            <p className="text-sm font-medium text-blue-400 mb-2">
                              Student's Answer:
                            </p>
                            <p className="text-foreground">
                              {question?.options?.length > 0
                                ? question.options.find(
                                    (option) => option.id === answer.answer
                                  )?.text || answer.answer
                                : answer.answer}
                            </p>
                          </div>

                          {/* AI per-answer feedback — editable by teacher */}
                          {aiAnswerFeedback && (
                            <div className="bg-violet-500/10 border border-violet-500/20 p-3 rounded-lg space-y-2">
                              <p className="text-xs font-medium text-violet-400 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                AI Feedback (editable):
                              </p>
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground whitespace-nowrap">
                                  Score:
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={question?.points || 100}
                                  value={
                                    perAnswerFeedback[answer.question_id]
                                      ?.score ?? aiAnswerFeedback.score
                                  }
                                  onChange={(e) =>
                                    setPerAnswerFeedback((prev) => ({
                                      ...prev,
                                      [answer.question_id]: {
                                        ...prev[answer.question_id],
                                        score: parseInt(e.target.value) || 0,
                                        feedback:
                                          prev[answer.question_id]?.feedback ??
                                          aiAnswerFeedback.feedback,
                                      },
                                    }))
                                  }
                                  className="h-7 w-20 text-sm"
                                />
                                <span className="text-xs text-muted-foreground">
                                  / {question?.points || 0}
                                </span>
                              </div>
                              <AutoResizeTextarea
                                value={
                                  perAnswerFeedback[answer.question_id]
                                    ?.feedback ?? aiAnswerFeedback.feedback
                                }
                                onChange={(e) =>
                                  setPerAnswerFeedback((prev) => ({
                                    ...prev,
                                    [answer.question_id]: {
                                      ...prev[answer.question_id],
                                      score:
                                        prev[answer.question_id]?.score ??
                                        aiAnswerFeedback.score,
                                      feedback: e.target.value,
                                    },
                                  }))
                                }
                                className="text-sm"
                                placeholder="Edit feedback for this answer..."
                              />
                              {/* Rendered markdown preview */}
                              <div className="border-t border-violet-500/20 pt-2">
                                <p className="text-[10px] uppercase tracking-wide mb-1 text-violet-400/60">
                                  Preview:
                                </p>
                                <div className="prose prose-sm prose-invert max-w-none text-xs [&_p]:mb-1 [&_ul]:mb-1 [&_li]:mb-0 [&_strong]:text-violet-300">
                                  <ReactMarkdown>
                                    {perAnswerFeedback[answer.question_id]
                                      ?.feedback ?? aiAnswerFeedback.feedback}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}

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
                    <p className="font-medium">
                      {submission.user?.name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">
                      {submission.user?.email || 'No email'}
                    </p>
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
                      <p className="text-sm text-muted-foreground">
                        Submitted At
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {formatDate(submission.submitted_at)}
                        </p>
                      </div>
                    </div>
                  )}
                  {submission.graded_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Graded At</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {formatDate(submission.graded_at)}
                        </p>
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
                  {preGrade && submission.status !== 'GRADED' && (
                    <Badge
                      variant="outline"
                      className="ml-auto text-xs border-violet-500/50 text-violet-500"
                    >
                      Pre-filled by AI
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score Display (auto-calculated from per-answer scores) */}
                <div className="space-y-2">
                  <Label htmlFor="score">Score (out of {maxScore})</Label>
                  <Input
                    id="score"
                    type="number"
                    value={gradingData.score}
                    readOnly
                    className="text-lg font-medium bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated from per-question scores
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Percentage:{' '}
                      <span
                        className={`font-medium ${getScoreColor(gradingData.score, maxScore)}`}
                      >
                        {getScorePercentage(gradingData.score, maxScore)}%
                      </span>
                    </p>
                    {/* Visual score bar */}
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, getScorePercentage(gradingData.score, maxScore))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Feedback Input */}
                <div className="space-y-2">
                  <Label htmlFor="feedback" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Overall Feedback
                  </Label>
                  <AutoResizeTextarea
                    id="feedback"
                    value={gradingData.feedback}
                    onChange={(e) =>
                      setGradingData((prev) => ({
                        ...prev,
                        feedback: e.target.value,
                      }))
                    }
                    placeholder="Provide overall feedback for the student..."
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
                  {gradeSubmissionMutation.isPending
                    ? 'Saving...'
                    : submission.status === 'GRADED'
                      ? 'Update Grade'
                      : 'Confirm & Save Grade'}
                </Button>

                {hasChanges && (
                  <p className="text-sm text-amber-500 text-center">
                    {preGrade && submission.status !== 'GRADED'
                      ? 'Review the AI suggestion and click to confirm'
                      : 'You have unsaved changes'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SubmissionReviewDetailPage;
