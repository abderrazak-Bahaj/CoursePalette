import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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

const AssignmentPage = () => {
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
  if (!hasStarted && !isSubmitted && !isExpired) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto p-6">
            <Card className="mt-20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-4">
                  {assignment.title}
                </CardTitle>
                <p className="text-gray-600 mb-6">{assignment.description}</p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-medium mb-2">Time Limit</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    {formatTimeLimit(assignment.date_limit)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Once you start, you'll have{' '}
                    {formatTimeLimit(assignment.date_limit)} to complete and
                    submit this assignment.
                  </p>
                </div>

                {assignment.instructions && (
                  <div className="bg-gray-50 p-4 rounded-lg text-left">
                    <h4 className="font-medium mb-2">Instructions:</h4>
                    <p className="text-gray-700">{assignment.instructions}</p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" onClick={() => navigate(-1)}>
                    Back to Course
                  </Button>
                  <Button
                    onClick={handleStartAssignment}
                    disabled={startAssignmentMutation.isPending}
                    className="bg-course-blue flex items-center gap-2"
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  navigate(-1);
                }}
                className="flex bg-gray-50 hover:bg-gray-100 items-center text-gray-700 hover:text-course-blue cursor-pointer transition-colors"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                <span>Back to Course</span>
              </Button>

              {timeRemaining !== null && !isSubmitted && (
                <div
                  className={`flex items-center space-x-2 ${isExpired ? 'text-red-500' : timeRemaining < 300000 ? 'text-orange-500' : 'text-gray-600'}`}
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
        <div className="max-w-4xl mx-auto p-6">
          {/* Assignment Info */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    {assignment.title}
                  </CardTitle>
                  <p className="text-gray-600 mb-4">{assignment.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span>Submitted</span>
                    </div>
                  ) : isExpired ? (
                    <div className="flex items-center text-red-500">
                      <AlertCircle className="h-5 w-5 mr-1" />
                      <span>Expired</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-blue-600">
                      <FileText className="h-5 w-5 mr-1" />
                      <span>In Progress</span>
                    </div>
                  )}
                </div>
              </div>

              {!isSubmitted && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm text-gray-600">
                      {Math.round(getProgressPercentage())}% Complete
                    </span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-2" />
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
                variant="outline"
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
                className="flex items-center bg-course-blue"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Assignment
              </Button>
            </div>
          )}

          {/* Submission Info */}
          {existingSubmission && (
            <Card className="mt-6">
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
                          ? 'bg-green-100 text-green-800'
                          : existingSubmission.status === 'SUBMITTED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {existingSubmission.status}
                    </span>
                  </div>
                  {existingSubmission.submitted_at && (
                    <div>
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
                      <span className="ml-2">
                        {existingSubmission.score}/{assignment.max_score || 100}
                      </span>
                    </div>
                  )}
                  {existingSubmission.feedback && (
                    <div className="col-span-2">
                      <span className="font-medium">Feedback:</span>
                      <p className="mt-1 text-gray-600">
                        {existingSubmission.feedback}
                      </p>
                    </div>
                  )}
                </div>
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
    } else if (question.is_essay) {
      return (
        <Textarea
          value={(answer as string) || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter your answer here..."
          className="min-h-[120px]"
        />
      );
    } else {
      return (
        <Textarea
          value={(answer as string) || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter your answer here..."
          className="min-h-[80px]"
        />
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Question {questionNumber}
          {question.points && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({question.points} points)
            </span>
          )}
        </CardTitle>
        {question.question && (
          <p className="text-gray-700">{question.question}</p>
        )}
      </CardHeader>
      <CardContent>{renderQuestionContent()}</CardContent>
    </Card>
  );
};

export default AssignmentPage;
