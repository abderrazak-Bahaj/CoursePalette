import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Play,
  Check,
  Lock,
  ChevronLeft,
  ChevronRight,
  Award,
  FileText,
  Download,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle,
  Video,
  Headphones,
  Link as LinkIcon,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Lesson, Resource, Assignment } from '@/types/course';
import { courseService, lessonService } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import WrapperLoading from '@/components/ui/wrapper-loading';
import VideoPlayer from '@/components/ui/video-player';
import useGroupedLessons from '@/hooks/use-grouped-lessons';
import MainLayout from '@/components/layout/MainLayout';

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId?: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { toast } = useToast();

  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course'],
    queryFn: async () => await courseService.getCourse(courseId),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['learn-lesson', courseId, lessonId],
    queryFn: async () => await lessonService.getLesson(courseId, lessonId),
  });

  const completeLessonMutation = useMutation({
    mutationFn: () => lessonService.completeLesson(courseId, lessonId),
    onSuccess: () => {
      toast({
        title: 'Lesson Completed',
        description: `You have successfully completed "${data?.lesson?.title}"`,
      });
      queryClient.invalidateQueries({
        queryKey: ['learn-lesson', courseId, lessonId],
      });
      queryClient.invalidateQueries({
        queryKey: ['course'],
      });
    },
    onError: (error) => {
      toast({
        title: 'Lesson Completion Failed',
        description:
          'There was an error completing this lesson. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const course = courseData?.course;
  const lesson = data?.lesson;

  const currentLessonId = lesson?.id;

  const sections = useGroupedLessons(course?.lessons || []);

  const completedLessons = useMemo(() => {
    return (
      course?.lessons?.filter((lesson) => lesson.is_completed)?.length || 0
    );
  }, [course?.lessons]);

  const progressPercentage =
    (completedLessons / (course?.lessons?.length || 0)) * 100;

  const isFullyCourseCompleted = useMemo(() => {
    return progressPercentage === 100;
  }, [progressPercentage]);

  if (!lesson && !isLoading && !courseLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
            <p className="mb-6">
              The lesson you are looking for does not exist.
            </p>
            <Button asChild>
              <Link to={`/courses/${courseId}/learn`}>Back to Course</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentIndex = course?.lessons?.findIndex(
    (lesson) => lesson.id === currentLessonId
  );
  const previousLesson =
    currentIndex > 0 ? course?.lessons?.[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < (course?.lessons?.length || 0) - 1
      ? course?.lessons?.[currentIndex + 1]
      : null;

  const markAsCompleted = async () => {
    if (lesson?.is_completed) {
      return;
    }
    await completeLessonMutation.mutateAsync();
    if (nextLesson) {
      navigate(`/courses/${courseId}/learn/${nextLesson.id}`);
    }
  };

  if (!(course?.lessons?.length > 0) && !isLoading && !courseLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
            <p className="mb-6">
              The course you are looking for does not exist or has no lessons.
            </p>
            <Button asChild>
              <Link to="/courses">Back to Courses</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <WrapperLoading isLoading={isLoading || courseLoading}>
        <div className="flex flex-col h-screen">
          {/* Top navigation bar */}
          <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
            <Link
              to={`/courses/${courseId}`}
              className="flex items-center text-gray-700 hover:text-course-blue transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              <span>Back to Course</span>
            </Link>
            {isFullyCourseCompleted && (
              <Button asChild variant="outline" className="flex items-center">
                <Link to={`/courses/${courseId}/certificate`}>
                  <Award className="h-5 w-5 mr-2" />
                  View Certificate
                </Link>
              </Button>
            )}
          </div>

          {/* Main content area */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Video/content area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{lesson?.title}</h2>
                  <p className="text-gray-500">{lesson?.duration_readable}</p>
                </div>

                <VideoPlayer url={lesson?.video_url || ''} />

                {/* Lesson content */}
                <div
                  className="prose max-w-none mb-8"
                  dangerouslySetInnerHTML={{
                    __html: lesson?.content || '',
                  }}
                />

                {/* Resources Section */}
                {lesson?.resources && lesson.resources.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Resources</h3>
                    <div className="grid gap-4">
                      {lesson.resources.map((resource) => (
                        <ResourceItem key={resource.id} resource={resource} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignments Section */}
                {lesson?.assignments && lesson.assignments.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Assignments</h3>
                    <div className="space-y-4">
                      {lesson.assignments.map((assignment) => (
                        <AssignmentItem key={assignment.id} assignment={assignment} courseId={courseId} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Next/Previous navigation */}
                <div className="flex justify-between border-t pt-6">
                  {previousLesson ? (
                    <Button
                      asChild
                      variant="outline"
                      className="flex items-center"
                    >
                      <Link
                        to={`/courses/${courseId}/learn/${previousLesson.id}`}
                      >
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        Previous Lesson
                      </Link>
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  <Button
                    onClick={markAsCompleted}
                    disabled={lesson?.is_completed}
                    className="flex items-center bg-course-blue"
                  >
                    {lesson?.is_completed ? (
                      <>
                        <Check className="h-5 w-5 mr-1" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-1" />
                        Mark as Completed
                      </>
                    )}
                  </Button>
                  {nextLesson ? (
                    <Button
                      asChild
                      className="flex items-center bg-course-blue"
                    >
                      <Link to={`/courses/${courseId}/learn/${nextLesson.id}`}>
                        Next Lesson
                        <ChevronRight className="h-5 w-5 ml-1" />
                      </Link>
                    </Button>
                  ) : (
                    <div></div> // Empty div to maintain flex spacing
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar with dynamic course curriculum */}
            <div className="md:w-80 border-l flex-shrink-0 overflow-y-auto bg-gray-50">
              <div className="p-4">
                <h3 className="font-bold mb-4">{course?.title}</h3>

                <div className="w-24">
                  <Progress
                    value={progressPercentage}
                    className={`h-2 ${
                      progressPercentage === 100
                        ? 'bg-green-500'
                        : 'bg-course-blue'
                    }`}
                  />
                </div>
                <Accordion
                  type="multiple"
                  defaultValue={sections.map((_, idx) => `section-${idx}`)}
                  className="w-full"
                >
                  {sections.map((section, idx) => (
                    <AccordionItem
                      key={`section-${idx}`}
                      value={`section-${idx}`}
                    >
                      <AccordionTrigger>
                        <div className="text-left">
                          <div className="font-semibold">{section.title}</div>
                          <div className="text-sm text-gray-500">
                            {section.lessons.length} lessons
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {section.lessons.map((lesson) => (
                            <LessonItem
                              key={lesson.id}
                              lesson={lesson}
                              courseId={courseId}
                              isActive={lesson.id === currentLessonId}
                            />
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </WrapperLoading>
    </MainLayout>
  );
};

// ResourceItem component
interface ResourceItemProps {
  resource: Resource;
}

const ResourceItem = ({ resource }: ResourceItemProps) => {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'VIDEO':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'AUDIO':
        return <Headphones className="h-5 w-5 text-purple-500" />;
      case 'LINK':
        return <LinkIcon className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'Document';
      case 'VIDEO':
        return 'Video';
      case 'AUDIO':
        return 'Audio';
      case 'LINK':
        return 'Link';
      default:
        return 'File';
    }
  };

  const handleResourceClick = () => {
    if (resource.url) {
      window.open(resource.url, '_blank');
    } else if (resource.file_path) {
      window.open(resource.file_path, '_blank');
    }
  };

  return (
    <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleResourceClick}>
      <div className="flex-shrink-0 mr-3">
        {getResourceIcon(resource.type)}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{resource.title}</h4>
        {resource.description && (
          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
        )}
        <div className="flex items-center space-x-4 mt-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {getResourceTypeLabel(resource.type)}
          </span>
          {resource.file_size_formatted && (
            <span className="text-xs text-gray-500">
              {resource.file_size_formatted}
            </span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 ml-3">
        {resource.is_link ? (
          <ExternalLink className="h-4 w-4 text-gray-400" />
        ) : (
          <Download className="h-4 w-4 text-gray-400" />
        )}
      </div>
    </div>
  );
};

// AssignmentItem component
interface AssignmentItemProps {
  assignment: Assignment;
  courseId: string;
}

const AssignmentItem = ({ assignment, courseId }: AssignmentItemProps) => {
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAssignmentIcon = (type: string) => {
    switch (type) {
      case 'QUIZ':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'ESSAY':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'MULTIPLE_CHOICE':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getAssignmentIcon(assignment.type)}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
            <div className="flex items-center space-x-4 mt-3">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {assignment.type}
              </span>
              {assignment.max_score && (
                <span className="text-xs text-gray-500">
                  Max Score: {assignment.max_score}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {assignment.due_date && (
            <div className={`flex items-center space-x-1 text-xs ${assignment.is_overdue ? 'text-red-500' : 'text-gray-500'}`}>
              <Clock className="h-3 w-3" />
              <span>Due: {formatDueDate(assignment.due_date)}</span>
            </div>
          )}
          {assignment.is_overdue && (
            <div className="flex items-center space-x-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              <span>Overdue</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button asChild size="sm" className="bg-course-blue">
          <Link to={`/courses/${courseId}/assignments/${assignment.id}`}>
            {assignment.type === 'QUIZ' ? 'Start Quiz' : 'View Assignment'}
          </Link>
        </Button>
      </div>
    </div>
  );
};

// LessonItem component
interface LessonItemProps {
  lesson: Lesson;
  courseId: string;
  isActive: boolean;
}

const LessonItem = ({ lesson, courseId, isActive }: LessonItemProps) => {
  return (
    <li>
      <Link
        to={`/courses/${courseId}/learn/${lesson.id}`}
        className={`flex items-center p-2 rounded-md ${
          isActive
            ? 'bg-course-blue bg-opacity-10 text-course-blue'
            : 'hover:bg-gray-100'
        }`}
      >
        <div className="flex-shrink-0 mr-2">
          {lesson?.is_completed ? (
            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          ) : isActive ? (
            <Play className="h-5 w-5 text-course-blue" />
          ) : (
            <Lock className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium line-clamp-1">{lesson.title}</div>
          <div className="text-xs text-gray-500">
            {lesson.duration_readable}
          </div>
        </div>
      </Link>
    </li>
  );
};

export default LessonPage;
