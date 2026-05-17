import { useState, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import WrapperLoading from '@/components/ui/wrapper-loading';

const LazyAssignmentGenerator = lazy(() =>
  import('@/components/ai/TeacherTools/AssignmentGenerator').then((m) => ({
    default: m.AssignmentGenerator,
  }))
);

const GenerateAssignmentPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [questionCounts, setQuestionCounts] = useState({
    multiple_choice: 5,
    essay: 0,
    short_answer: 0,
  });
  const [extraInstructions, setExtraInstructions] = useState('');

  const totalQuestions =
    questionCounts.multiple_choice +
    questionCounts.essay +
    questionCounts.short_answer;

  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => await courseService.getCourse(courseId),
  });

  const { data: lessonsData, isLoading: lessonsLoading } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: async () => await courseService.getCourseLessons(courseId!),
    enabled: !!courseId,
  });

  const course = courseData?.course;
  const lessons = lessonsData?.lessons || [];

  const handleGenerated = () => {
    navigate(`/admin/courses/${courseId}/assignments`);
  };

  return (
    <AdminLayout title="Generate Assignment with AI">
      <WrapperLoading isLoading={courseLoading || lessonsLoading}>
        <div className="container mx-auto px-4 py-6 ">
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
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-violet-500" />
                Generate Assignment with AI
              </h1>
              <p className="text-muted-foreground">Course: {course?.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Configuration */}
            <div className="lg:col-span-1 space-y-6">
              {/* Title */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Title</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    placeholder="e.g. Quiz: Laravel MVC Basics"
                  />
                </CardContent>
              </Card>

              {/* Lesson Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Lesson</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedLessonId || ''}
                    onValueChange={(value) => setSelectedLessonId(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lesson..." />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.map((lesson: any) => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Question Types */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Question Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Multiple Choice</Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={questionCounts.multiple_choice}
                      onChange={(e) =>
                        setQuestionCounts((prev) => ({
                          ...prev,
                          multiple_choice: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-16 h-8 text-center text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Essay</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={questionCounts.essay}
                      onChange={(e) =>
                        setQuestionCounts((prev) => ({
                          ...prev,
                          essay: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-16 h-8 text-center text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Short Answer</Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={questionCounts.short_answer}
                      onChange={(e) =>
                        setQuestionCounts((prev) => ({
                          ...prev,
                          short_answer: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-16 h-8 text-center text-sm"
                    />
                  </div>
                  <div className="pt-2 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-sm font-bold text-violet-500">
                      {totalQuestions}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Extra Instructions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Extra Instructions (optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={extraInstructions}
                    onChange={(e) => setExtraInstructions(e.target.value)}
                    placeholder="E.g. Focus on chapter 3, avoid theoretical questions, include real-world scenarios..."
                    rows={3}
                    className="text-sm resize-none"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right: Generator */}
            <div className="lg:col-span-2">
              {selectedLessonId && totalQuestions > 0 ? (
                <Suspense
                  fallback={
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Loader2 className="h-8 w-8 mx-auto animate-spin text-violet-500" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Loading generator...
                        </p>
                      </CardContent>
                    </Card>
                  }
                >
                  <LazyAssignmentGenerator
                    courseId={courseId!}
                    lessonId={selectedLessonId}
                    title={assignmentTitle}
                    numMultipleChoice={questionCounts.multiple_choice}
                    numEssay={questionCounts.essay}
                    numShortAnswer={questionCounts.short_answer}
                    extraInstructions={extraInstructions}
                    onSave={() => handleGenerated()}
                  />
                </Suspense>
              ) : (
                <Card className="border-dashed h-full">
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <Sparkles className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-center">
                      {!selectedLessonId
                        ? 'Select a lesson to start generating.'
                        : 'Set at least one question type.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </WrapperLoading>
    </AdminLayout>
  );
};

export default GenerateAssignmentPage;
