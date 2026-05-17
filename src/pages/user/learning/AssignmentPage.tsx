import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ds/primitives/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ds/primitives/Card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ds/primitives/Progress';
import ReactMarkdown from 'react-markdown';
import {
  ChevronLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Send,
  Save,
  Play,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Assignment, AssignmentQuestion, Submission } from '@/types/course';
import { courseService } from '@/services/api';
import { submissionService } from '@/services/api/submissionService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import WrapperLoading from '@/components/ui/wrapper-loading';
import MainLayout from '@/components/layout/MainLayout';

interface AnswerData {
  question_id: string;
  answer: string | string[];
}

const AssignmentPage = ({ isPreview = false }: { isPreview: boolean }) => {
  const { courseId, assignmentId } = useParams<{
    courseId: string;
    assignmentId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const { data: assignmentData, isLoading } = useQuery({
    queryKey: ['assignment', courseId, assignmentId],
    retry: false,
    queryFn: async () =>
      await courseService.getAssignment(courseId, assignmentId),
  });

  const { data: courseData } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => await courseService.getCourse(courseId),
  });

  const assignment = assignmentData?.assignment;
  const course = courseData?.course;
  const existingSubmission = assignment?.submissions?.[0];

  // Check if assignment is started and set timer
  useEffect(() => {
    if (assignment) {
      const isSubmitted = assignment.is_submitted;
      const isExpired = assignment.is_expired;
      const remainingTime = assignment.remaining_time;

      setHasStarted(
        !!(assignment.assignment_start || isSubmitted || isExpired)
      );

      if (remainingTime && remainingTime > 0 && !isSubmitted && !isExpired) {
        setTimeRemaining(remainingTime * 1000); // Convert seconds to milliseconds

        const timer = setInterval(() => {
          setTimeRemaining((prev) => {
            if (!prev || prev <= 1000) {
              clearInterval(timer);
              // Refresh assignment data when timer expires
              queryClient.invalidateQueries({
                queryKey: ['assignment', courseId, assignmentId],
              });
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);

        return () => clearInterval(timer);
      } else if (isExpired) {
        setTimeRemaining(0);
      }
    }
  }, [assignment, courseId, assignmentId, queryClient]);

  // Load existing answers if there's a submission
  useEffect(() => {
    if (existingSubmission?.answers) {
      const existingAnswers: Record<string, string | string[]> = {};
      existingSubmission.answers.forEach((answer: any) => {
        existingAnswers[answer.question_id] = answer.answer;
      });
      setAnswers(existingAnswers);
    }
  }, [existingSubmission]);

  const startAssignmentMutation = useMutation({
    mutationFn: () => courseService.startAssignment(courseId!, assignmentId!),
    onSuccess: () => {
      toast({
        title: 'Assignment Started',
        description: 'Your timer has started. Good luck!',
      });
      setHasStarted(true);
      queryClient.invalidateQueries({
        queryKey: ['assignment', courseId, assignmentId],
      });
    },
    onError: () => {
      toast({
        title: 'Failed to Start',
        description: 'Failed to start assignment timer. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const saveSubmissionMutation = useMutation({
    mutationFn: (data: { status: string; answers: AnswerData[] }) =>
      submissionService.createSubmission(courseId!, assignmentId!, data),
    onSuccess: () => {
      toast({
        title: 'Progress Saved',
        description: 'Your answers have been saved as draft.',
      });
      queryClient.invalidateQueries({
        queryKey: ['assignment', courseId, assignmentId],
      });
    },
    onError: () => {
      toast({
        title: 'Save Failed',
        description: 'Failed to save your progress. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const submitAssignmentMutation = useMutation({
    mutationFn: (data: { status: string; answers: AnswerData[] }) =>
      submissionService.createSubmission(courseId!, assignmentId!, data),
    onSuccess: () => {
      toast({
        title: 'Assignment Submitted',
        description: 'Your assignment has been submitted successfully.',
      });
      queryClient.invalidateQueries({
        queryKey: ['assignment', courseId, assignmentId],
      });
      navigate(-1);
    },
    onError: () => {
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit your assignment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleAnswerChange = (
    questionId: string,
    answer: string | string[]
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleStartAssignment = () => {
    startAssignmentMutation.mutate();
  };

  const handleSaveDraft = () => {
    const answersArray: AnswerData[] = Object.entries(answers).map(
      ([questionId, answer]) => ({
        question_id: questionId,
        answer: Array.isArray(answer) ? answer.join(',') : answer,
      })
    );

    saveSubmissionMutation.mutate({
      status: 'DRAFT',
      answers: answersArray,
    });
  };

  const handleSubmit = () => {
    const answersArray: AnswerData[] = Object.entries(answers).map(
      ([questionId, answer]) => ({
        question_id: questionId,
        answer: Array.isArray(answer) ? answer.join(',') : answer,
      })
    );

    // Validate all questions are answered
    const unansweredQuestions = assignment?.questions?.filter(
      (q: AssignmentQuestion) => !answers[q.id]
    );

    if (unansweredQuestions && unansweredQuestions.length > 0) {
      toast({
        title: 'Incomplete Assignment',
        description: `Please answer all questions before submitting. ${unansweredQuestions.length} question(s) remaining.`,
        variant: 'destructive',
      });
      return;
    }

    submitAssignmentMutation.mutate({
      status: 'SUBMITTED',
      answers: answersArray,
    });
  };

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatTimeLimit = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes === 60) {
      return '1 hour';
    } else if (minutes % 60 === 0) {
      return `${minutes / 60} hours`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
    }
  };

  const getProgressPercentage = () => {
    if (!assignment?.questions) return 0;
    const answeredQuestions = assignment.questions.filter(
      (q: AssignmentQuestion) => answers[q.id]
    );
    return (answeredQuestions.length / assignment.questions.length) * 100;
  };

  const isExpired = assignment?.is_expired;
  const isSubmitted = assignment?.is_submitted;

  if (isLoading) {
    return (
      <MainLayout>
        <WrapperLoading isLoading={true}>
          <div></div>
        </WrapperLoading>
      </MainLayout>
    );
  }

  if (!assignment) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Assignment Not Found</h1>
            <p className="mb-6">
              The assignment you are looking for does not exist.
            </p>
            <Button
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
            >
              Back to Course
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show start screen if assignment hasn't been started yet
  if (!hasStarted && !isSubmitted && !isExpired && !isPreview) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#0f172a]">
          <div className="max-w-4xl mx-auto p-6">
            <Card variant="elevated" className="mt-20">
              <CardHeader className="text-center">
                <CardTitle className="font-serif text-2xl mb-4 text-neutral-50">
                  {assignment.title}
                </CardTitle>
                <p className="text-neutral-400 mb-6">
                  {assignment.description}
                </p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-violet-600/10 border border-violet-500/30 p-6 rounded-xl">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-violet-400" />
                  <h3 className="text-lg font-medium mb-2">Time Limit</h3>
                  <p className="font-serif text-2xl font-bold text-violet-400 mb-2">
                    {formatTimeLimit(assignment.date_limit)}
                  </p>
                  <p className="text-sm text-neutral-400">
                    Once you start, you'll have{' '}
                    {formatTimeLimit(assignment.date_limit)} to complete and
                    submit this assignment.
                  </p>
                </div>

                {assignment.instructions && (
                  <div className="bg-[#0f172a] border border-neutral-700 p-4 rounded-lg text-left">
                    <h4 className="font-medium mb-2">Instructions:</h4>
                    <p className="text-neutral-300">
                      {assignment.instructions}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-4">
                  <Button variant="secondary" onClick={() => navigate(-1)}>
                    Back to Course
                  </Button>
                  <Button
                    onClick={handleStartAssignment}
                    disabled={startAssignmentMutation.isPending}
                    variant="primary"
                  >
                    <Play className="h-4 w-4" />
                    Start Assignment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0f172a]">
        {/* Header */}
        <div className="bg-[#0f172a] border-b border-neutral-700 px-4 py-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  navigate(-1);
                }}
                variant="ghost"
                className="flex items-center gap-1 text-neutral-400 hover:text-violet-400"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Back to Course</span>
              </Button>

              {timeRemaining !== null && !isSubmitted && (
                <div
                  className={`flex items-center space-x-2 ${isExpired ? 'text-red-400' : timeRemaining < 300000 ? 'text-amber-400' : 'text-neutral-400'}`}
                >
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">
                    {isExpired
                      ? 'Time Expired'
                      : `${formatTimeRemaining(timeRemaining)} remaining`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container p-6">
          {/* Assignment Info */}
          <Card variant="elevated" className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-serif text-2xl mb-2 text-neutral-50">
                    {assignment.title}
                  </CardTitle>
                  <p className="text-neutral-400 mb-4">
                    {assignment.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-neutral-500">
                    <span>Course: {course?.title}</span>
                    <span>Type: {assignment.type}</span>
                    <span>
                      Time Limit: {formatTimeLimit(assignment.date_limit)}
                    </span>
                    {assignment.max_score && (
                      <span>Max Score: {assignment.max_score}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isSubmitted ? (
                    <div className="flex items-center text-amber-400">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span>Submitted</span>
                    </div>
                  ) : isExpired ? (
                    <div className="flex items-center text-red-400">
                      <AlertCircle className="h-5 w-5 mr-1" />
                      <span>Expired</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-violet-400">
                      <FileText className="h-5 w-5 mr-1" />
                      <span>In Progress</span>
                    </div>
                  )}
                </div>
              </div>

              {!isSubmitted && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-400">Progress</span>
                    <span className="text-sm text-neutral-400">
                      {Math.round(getProgressPercentage())}% Complete
                    </span>
                  </div>
                  <Progress
                    value={getProgressPercentage()}
                    variant="default"
                    size="sm"
                  />
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            {assignment.questions?.map(
              (question: AssignmentQuestion, index: number) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  questionNumber={index + 1}
                  answer={answers[question.id]}
                  onAnswerChange={(answer) =>
                    handleAnswerChange(question.id, answer)
                  }
                  disabled={isSubmitted || isExpired}
                />
              )
            )}
          </div>

          {/* Action Buttons */}
          {!isSubmitted && !isExpired && (
            <div className="mt-8 flex justify-between">
              <Button
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={saveSubmissionMutation.isPending}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={submitAssignmentMutation.isPending}
                variant="action"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Assignment
              </Button>
            </div>
          )}

          {/* Submission Info */}
          {existingSubmission && (
            <Card variant="elevated" className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Submission Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs ${
                        existingSubmission.status === 'GRADED'
                          ? 'bg-amber-500/20 text-amber-300'
                          : existingSubmission.status === 'SUBMITTED'
                            ? 'bg-violet-600/20 text-violet-300'
                            : existingSubmission.status === 'AI_GRADED'
                              ? 'bg-violet-600/20 text-violet-300'
                              : 'bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {existingSubmission.status}
                    </span>
                  </div>
                  {existingSubmission.submitted_at && (
                    <div className="flex justify-end">
                      <span className="font-medium">Submitted:</span>
                      <span className="ml-2">
                        {new Date(
                          existingSubmission.submitted_at
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {existingSubmission.score !== null && (
                    <div>
                      <span className="font-medium">Score:</span>
                      <span className="ml-2 text-amber-300 font-bold">
                        {existingSubmission.score}/{assignment.max_score || 100}
                        <span className="ml-1 text-neutral-400 font-normal">
                          (
                          {Math.round(
                            (existingSubmission.score /
                              (assignment.max_score || 100)) *
                              100
                          )}
                          %)
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Per-question feedback (parsed from feedback field) */}
                {existingSubmission.feedback && (
                  <div className="mt-4 space-y-3">
                    <p className="font-medium text-neutral-200">
                      Teacher Feedback:
                    </p>
                    {existingSubmission.feedback.includes(
                      '--- Per-Question Feedback ---'
                    ) ? (
                      <>
                        {/* Overall feedback */}
                        <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-1 [&_ul]:mb-1 [&_li]:mb-0">
                          <ReactMarkdown>
                            {existingSubmission.feedback
                              .split('--- Per-Question Feedback ---')[0]
                              .trim()}
                          </ReactMarkdown>
                        </div>
                        {/* Per-question feedback */}
                        <div className="space-y-2 mt-3">
                          <p className="text-xs font-medium text-violet-400">
                            Per-Question Feedback:
                          </p>
                          {existingSubmission.feedback
                            .split('--- Per-Question Feedback ---')[1]
                            .trim()
                            .split('\n')
                            .filter((line: string) => line.trim())
                            .map((line: string, i: number) => (
                              <div
                                key={i}
                                className="bg-violet-500/10 border border-violet-500/20 p-3 rounded-lg"
                              >
                                <div className="prose prose-sm prose-invert max-w-none text-sm [&_p]:mb-0">
                                  <ReactMarkdown>{line}</ReactMarkdown>
                                </div>
                              </div>
                            ))}
                        </div>
                      </>
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-1 [&_ul]:mb-1 [&_li]:mb-0">
                        <ReactMarkdown>
                          {existingSubmission.feedback}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

// Question Card Component
interface QuestionCardProps {
  question: AssignmentQuestion;
  questionNumber: number;
  answer?: string | string[];
  onAnswerChange: (answer: string | string[]) => void;
  disabled?: boolean;
}

const QuestionCard = ({
  question,
  questionNumber,
  answer,
  onAnswerChange,
  disabled = false,
}: QuestionCardProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea on value change and initial render
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      // Reset to 0 to get accurate scrollHeight measurement
      el.style.height = '0px';
      const scrollHeight = el.scrollHeight;
      const minH = question.is_essay ? 120 : 80;
      el.style.height = Math.max(scrollHeight, minH) + 'px';
    }
  }, [answer, question.is_essay]);

  const renderQuestionContent = () => {
    if (question.is_multiple_choice) {
      return (
        <RadioGroup
          value={answer as string}
          onValueChange={onAnswerChange}
          disabled={disabled}
          className="space-y-3"
        >
          {question.options?.map((option: any) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                {option.text ||
                  option.option_text ||
                  `Option ${option.id.slice(0, 8)}`}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    } else {
      return (
        <textarea
          ref={textareaRef}
          value={(answer as string) || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter your answer here..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden"
          style={{ minHeight: question.is_essay ? '120px' : '80px' }}
        />
      );
    }
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="font-serif text-lg text-neutral-50">
          Question {questionNumber}
          {question.points && (
            <span className="ml-2 text-sm font-normal text-neutral-500">
              ({question.points} points)
            </span>
          )}
        </CardTitle>
        {question.question && (
          <p className="text-neutral-300">{question.question}</p>
        )}
      </CardHeader>
      <CardContent>{renderQuestionContent()}</CardContent>
    </Card>
  );
};

export default AssignmentPage;
