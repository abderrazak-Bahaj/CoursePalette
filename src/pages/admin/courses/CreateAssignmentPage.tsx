import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Eye,
  Calendar,
  Clock,
  FileText,
  HelpCircle,
  CheckSquare,
  Type,
  List,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import WrapperLoading from '@/components/ui/wrapper-loading';
import { formatTimeLimit } from '@/utils/dateLimit';

interface QuestionOption {
  id?: string;
  text: string;
  is_correct: boolean;
  order: number;
}

interface AssignmentQuestion {
  id?: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY' | 'SHORT_ANSWER';
  points: number;
  order: number;
  options?: QuestionOption[];
}

interface AssignmentFormData {
  title: string;
  description: string;
  instructions: string;
  type: 'QUIZ' | 'ESSAY' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MATCHING';
  date_limit: number; // Time in minutes
  max_score: number;
  status: 'DRAFT' | 'PUBLISHED';
  lesson_id: string | null;
  questions: AssignmentQuestion[];
}

const CreateAssignmentPage = () => {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditMode = !!assignmentId;

  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    instructions: '',
    type: 'QUIZ',
    date_limit: 60, // Default 60 minutes
    max_score: 100,
    status: 'DRAFT',
    lesson_id: null,
    questions: [],
  });

  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => await courseService.getCourse(courseId),
  });

  const { data: lessonsData, isLoading: lessonsLoading } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: async () => await courseService.getCourseLessons(courseId!),
    enabled: !!courseId,
  });

  const { data: assignmentData, isLoading: assignmentLoading } = useQuery({
    queryKey: ['assignment', courseId, assignmentId],
    queryFn: async () => await courseService.getAssignment(courseId!, assignmentId!),
    enabled: isEditMode && !!courseId && !!assignmentId,
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (data: AssignmentFormData) =>
      isEditMode 
        ? courseService.updateAssignment(courseId!, assignmentId!, data)
        : courseService.createAssignment(courseId!, data),
    onSuccess: () => {
      toast({
        title: isEditMode ? 'Assignment Updated' : 'Assignment Created',
        description: `Assignment has been ${isEditMode ? 'updated' : 'created'} successfully.`,
      });
      navigate(`/admin/courses/${courseId}/assignments`);
    },
    onError: () => {
      toast({
        title: isEditMode ? 'Update Failed' : 'Creation Failed',
        description: `Failed to ${isEditMode ? 'update' : 'create'} assignment. Please try again.`,
        variant: 'destructive',
      });
    },
  });

  // Populate form data when assignment data is loaded (edit mode)
  useEffect(() => {
    if (isEditMode && assignmentData?.assignment) {
      const assignment = assignmentData.assignment;
      setFormData({
        title: assignment.title || '',
        description: assignment.description || '',
        instructions: assignment.instructions || '',
        type: assignment.type || 'QUIZ',
        date_limit: assignment.date_limit || 60, // Use date_limit instead of due_date
        max_score: assignment.max_score || 100,
        status: assignment.status || 'DRAFT',
        lesson_id: assignment.lesson_id || null,
        questions: assignment.questions?.map((q: any) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          points: q.points,
          order: q.order,
          options: q.options?.map((opt: any) => ({
            id: opt.id,
            text: opt.text,
            is_correct: opt.is_correct,
            order: opt.order,
          })) || [],
        })) || [],
      });
    }
  }, [isEditMode, assignmentData]);

  const handleInputChange = (field: keyof AssignmentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addQuestion = () => {
    const newQuestion: AssignmentQuestion = {
      question: '',
      type: 'MULTIPLE_CHOICE',
      points: 10,
      order: formData.questions.length + 1,
      options: [
        { text: '', is_correct: true, order: 1 },
        { text: '', is_correct: false, order: 2 },
        { text: '', is_correct: false, order: 3 },
        { text: '', is_correct: false, order: 4 },
      ],
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (index: number, field: keyof AssignmentQuestion, value: any) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const addOption = (questionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? {
              ...q,
              options: [
                ...(q.options || []),
                { 
                  text: '', 
                  is_correct: false, 
                  order: (q.options?.length || 0) + 1 
                },
              ],
            }
          : q
      ),
    }));
  };

  const updateOption = (
    questionIndex: number, 
    optionIndex: number, 
    field: keyof QuestionOption, 
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? {
              ...q,
              options: q.options?.map((opt, j) => 
                j === optionIndex ? { ...opt, [field]: value } : opt
              ),
            }
          : q
      ),
    }));
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? {
              ...q,
              options: q.options?.filter((_, j) => j !== optionIndex),
            }
          : q
      ),
    }));
  };

  const handleSubmit = (status: 'DRAFT' | 'PUBLISHED') => {
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Assignment title is required.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.questions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one question is required.',
        variant: 'destructive',
      });
      return;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      if (!question.question.trim()) {
        toast({
          title: 'Validation Error',
          description: `Question ${i + 1} text is required.`,
          variant: 'destructive',
        });
        return;
      }

      if (question.type === 'MULTIPLE_CHOICE' && question.options) {
        const hasCorrectAnswer = question.options.some(opt => opt.is_correct);
        if (!hasCorrectAnswer) {
          toast({
            title: 'Validation Error',
            description: `Question ${i + 1} must have at least one correct answer.`,
            variant: 'destructive',
          });
          return;
        }

        const hasEmptyOption = question.options.some(opt => !opt.text.trim());
        if (hasEmptyOption) {
          toast({
            title: 'Validation Error',
            description: `Question ${i + 1} has empty options.`,
            variant: 'destructive',
          });
          return;
        }
      }
    }

    const submissionData = {
      ...formData,
      status,
      max_score: formData.questions.reduce((sum, q) => sum + q.points, 0),
      questions: formData.questions.map(question => {
        // Only include options for question types that need them
        if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
          return question;
        } else {
          // Remove options for ESSAY and SHORT_ANSWER questions
          const { options, ...questionWithoutOptions } = question;
          return questionWithoutOptions;
        }
      }),
    };

    createAssignmentMutation.mutate(submissionData);
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return <CheckSquare className="h-4 w-4" />;
      case 'TRUE_FALSE':
        return <HelpCircle className="h-4 w-4" />;
      case 'ESSAY':
        return <FileText className="h-4 w-4" />;
      case 'SHORT_ANSWER':
        return <Type className="h-4 w-4" />;
      default:
        return <List className="h-4 w-4" />;
    }
  };



  const course = courseData?.course || null;

  return (
    <AdminLayout title={isEditMode ? "Edit Assignment" : "Create Assignment"}>
      <WrapperLoading isLoading={courseLoading || lessonsLoading || (isEditMode && assignmentLoading)}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
          <div>
            <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Assignment' : 'Create Assignment'}</h1>
            <p className="text-muted-foreground">
              Course: {course?.title}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Assignment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter assignment title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                      <SelectItem value="ESSAY">Essay</SelectItem>
                      <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                      <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson">Lesson (Optional)</Label>
                <Select
                  value={formData.lesson_id || 'no-lesson'}
                  onValueChange={(value) => handleInputChange('lesson_id', value === 'no-lesson' ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lesson (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-lesson">No lesson</SelectItem>
                    {lessonsData?.lessons?.map((lesson: any) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter assignment description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Enter detailed instructions for students"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_limit">Time Limit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="date_limit"
                      type="number"
                      value={formData.date_limit}
                      onChange={(e) => handleInputChange('date_limit', parseInt(e.target.value) || 60)}
                      min="1"
                      max="600"
                      placeholder="Minutes"
                    />
                    <Select
                      value={formData.date_limit >= 60 ? 'hours' : 'minutes'}
                      onValueChange={(unit) => {
                        if (unit === 'hours' && formData.date_limit < 60) {
                          handleInputChange('date_limit', Math.ceil(formData.date_limit / 60) * 60);
                        } else if (unit === 'minutes' && formData.date_limit >= 60) {
                          handleInputChange('date_limit', Math.floor(formData.date_limit / 60));
                        }
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Min</SelectItem>
                        <SelectItem value="hours">Hrs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Students will have {formatTimeLimit(formData.date_limit)} to complete this assignment once they start.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_score">Max Score</Label>
                  <Input
                    id="max_score"
                    type="number"
                    value={formData.max_score}
                    onChange={(e) => handleInputChange('max_score', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Questions ({formData.questions.length})
                </CardTitle>
                <Button onClick={addQuestion} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No questions added yet. Click "Add Question" to get started.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.questions.map((question, questionIndex) => (
                    <QuestionEditor
                      key={questionIndex}
                      question={question}
                      questionIndex={questionIndex}
                      onUpdate={updateQuestion}
                      onRemove={removeQuestion}
                      onAddOption={addOption}
                      onUpdateOption={updateOption}
                      onRemoveOption={removeOption}
                      getQuestionTypeIcon={getQuestionTypeIcon}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Total Points: {formData.questions.reduce((sum, q) => sum + q.points, 0)}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit('DRAFT')}
                disabled={createAssignmentMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isEditMode ? 'Update as Draft' : 'Save as Draft'}
              </Button>
              <Button
                onClick={() => handleSubmit('PUBLISHED')}
                disabled={createAssignmentMutation.isPending}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {isEditMode ? 'Update & Publish' : 'Publish Assignment'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      </WrapperLoading>
    </AdminLayout>
  );
};

interface QuestionEditorProps {
  question: AssignmentQuestion;
  questionIndex: number;
  onUpdate: (index: number, field: keyof AssignmentQuestion, value: any) => void;
  onRemove: (index: number) => void;
  onAddOption: (questionIndex: number) => void;
  onUpdateOption: (questionIndex: number, optionIndex: number, field: keyof QuestionOption, value: any) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  getQuestionTypeIcon: (type: string) => JSX.Element;
}

const QuestionEditor = ({
  question,
  questionIndex,
  onUpdate,
  onRemove,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  getQuestionTypeIcon,
}: QuestionEditorProps) => {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getQuestionTypeIcon(question.type)}
            <span className="font-medium">Question {questionIndex + 1}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(questionIndex)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label>Question Text *</Label>
            <Textarea
              value={question.question}
              onChange={(e) => onUpdate(questionIndex, 'question', e.target.value)}
              placeholder="Enter your question"
              rows={2}
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={question.type}
                onValueChange={(value) => {
                  onUpdate(questionIndex, 'type', value);
                  // Set appropriate options based on question type
                  if (value === 'MULTIPLE_CHOICE') {
                    onUpdate(questionIndex, 'options', [
                      { text: '', is_correct: true, order: 1 },
                      { text: '', is_correct: false, order: 2 },
                      { text: '', is_correct: false, order: 3 },
                      { text: '', is_correct: false, order: 4 },
                    ]);
                  } else if (value === 'TRUE_FALSE') {
                    onUpdate(questionIndex, 'options', [
                      { text: 'True', is_correct: true, order: 1 },
                      { text: 'False', is_correct: false, order: 2 },
                    ]);
                  } else {
                    // Remove options for ESSAY and SHORT_ANSWER
                    onUpdate(questionIndex, 'options', undefined);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                  <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                  <SelectItem value="ESSAY">Essay</SelectItem>
                  <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                value={question.points}
                onChange={(e) => onUpdate(questionIndex, 'points', parseInt(e.target.value))}
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Options for Multiple Choice and True/False */}
        {(question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              {question.type === 'MULTIPLE_CHOICE' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddOption(questionIndex)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-3 w-3" />
                  Add Option
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {question.type === 'TRUE_FALSE' ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroup
                      value={question.options?.find(opt => opt.is_correct)?.text || 'true'}
                      onValueChange={(value) => {
                        const newOptions = [
                          { text: 'True', is_correct: value === 'true', order: 1 },
                          { text: 'False', is_correct: value === 'false', order: 2 },
                        ];
                        onUpdate(questionIndex, 'options', newOptions);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id={`q${questionIndex}-true`} />
                        <Label htmlFor={`q${questionIndex}-true`}>True</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id={`q${questionIndex}-false`} />
                        <Label htmlFor={`q${questionIndex}-false`}>False</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              ) : (
                question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={option.is_correct}
                      onCheckedChange={(checked) => 
                        onUpdateOption(questionIndex, optionIndex, 'is_correct', checked)
                      }
                    />
                    <Input
                      value={option.text}
                      onChange={(e) => 
                        onUpdateOption(questionIndex, optionIndex, 'text', e.target.value)
                      }
                      placeholder={`Option ${optionIndex + 1}`}
                      className="flex-1"
                    />
                    {question.options && question.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveOption(questionIndex, optionIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Instructions for Essay/Short Answer */}
        {(question.type === 'ESSAY' || question.type === 'SHORT_ANSWER') && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              {question.type === 'ESSAY' 
                ? 'Students will provide a long-form written response to this question.'
                : 'Students will provide a brief text response to this question.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateAssignmentPage; 