import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ds/primitives/Button';
import { Progress } from '@/components/ds/primitives/Progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Check, ChevronLeft, ChevronRight, Award, Folders } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Lesson } from '@/types/course';
import { courseService, lessonService } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import WrapperLoading from '@/components/ui/wrapper-loading';
import VideoPlayer from '@/components/ui/video-player';
import useGroupedLessons from '@/hooks/use-grouped-lessons';
import MainLayout from '@/components/layout/MainLayout';
import ResourceItem from '@/components/learning/ResourceItem';
import AssignmentItem from '@/components/learning/AssignmentItem';
import LessonItem from '@/components/learning/LessonItem';
import { LessonPageIntegration } from '@/components/ai/Integrations/LessonPageIntegration';
import ReactMarkdown from 'react-markdown';
import { useSEO } from '@/hooks/useSEO';

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId?: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { toast } = useToast();

  useSEO({
    title: 'Lesson',
    description: 'Watch lessons and track your learning progress on Skillorai.',
    noIndex: true,
  });

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

    // Check if all assignments are submitted
    const unsubmittedAssignments =
      lesson?.assignments?.filter(
        (assignment) => assignment.is_active && !assignment.is_submitted
      ) || [];

    if (unsubmittedAssignments.length > 0) {
      toast({
        title: 'Cannot Complete Lesson',
        description: `You must submit all assignments before marking this lesson as completed. ${unsubmittedAssignments.length} assignment(s) remaining.`,
        variant: 'destructive',
      });
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
      {/* AI Q&A floating assistant — renders only when authorized (Requirement 13) */}
      {courseId && lessonId && (
        <LessonPageIntegration courseId={courseId} lessonId={lessonId} />
      )}
      <WrapperLoading isLoading={isLoading || courseLoading}>
        <div className="flex flex-col h-screen">
          {/* Top navigation bar */}
          <div className="bg-[#0f172a] border-b border-neutral-700 px-4 py-2 flex items-center justify-between">
            <Link
              to={`/courses/${courseId}`}
              className="flex items-center text-neutral-400 hover:text-violet-400 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              <span>Back to Course</span>
            </Link>
            {isFullyCourseCompleted && (
              <Button asChild variant="secondary" className="flex items-center">
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
                  <h2 className="font-serif text-2xl font-bold text-neutral-50 mb-2">
                    {lesson?.title}
                  </h2>
                  <p className="text-neutral-400">
                    {lesson?.duration_readable}
                  </p>
                </div>

                <VideoPlayer url={lesson?.video_url || ''} />

                {/* Lesson content */}
                <div className="py-6">
                  <ReactMarkdown>{lesson?.content}</ReactMarkdown>
                </div>
                {/* Resources Section */}
                {lesson?.resources && lesson.resources.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-serif text-xl font-semibold text-neutral-50 mb-4 flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10">
                        <Folders className="h-4 w-4 text-violet-400" />
                      </div>
                      Resources
                      <span className="text-sm font-normal text-neutral-500 ml-1">
                        ({lesson.resources.length})
                      </span>
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {lesson.resources.map((resource) => (
                        <ResourceItem key={resource.id} resource={resource} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignments Section */}
                {lesson?.assignments && lesson.assignments.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-serif text-xl font-semibold text-neutral-50 mb-4 flex items-center">
                      <span className="mr-2">📝</span>
                      Assignments
                    </h3>
                    <div className="space-y-4">
                      {lesson.assignments.map((assignment) => (
                        <AssignmentItem
                          key={assignment.id}
                          assignment={assignment}
                          courseId={courseId!}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Next/Previous navigation */}
                <div className="flex justify-between border-t border-neutral-700 pt-6">
                  {previousLesson ? (
                    <Button
                      asChild
                      variant="secondary"
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

                  {/* Completion Status */}
                  {(() => {
                    const unsubmittedAssignments =
                      lesson?.assignments?.filter(
                        (assignment) =>
                          assignment.is_active && !assignment.is_submitted
                      ) || [];

                    const hasUnsubmittedAssignments =
                      unsubmittedAssignments.length > 0;
                    const isCompleted = lesson?.is_completed;

                    return (
                      <div className="flex flex-col items-center">
                        {hasUnsubmittedAssignments && !isCompleted && (
                          <div className="text-xs text-amber-400 mb-2 text-center">
                            Complete {unsubmittedAssignments.length}{' '}
                            assignment(s) first
                          </div>
                        )}
                        <Button
                          onClick={markAsCompleted}
                          disabled={isCompleted || hasUnsubmittedAssignments}
                          variant={
                            hasUnsubmittedAssignments ? 'secondary' : 'success'
                          }
                          className="flex items-center"
                        >
                          {isCompleted ? (
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
                      </div>
                    );
                  })()}

                  {nextLesson ? (
                    <Button
                      asChild
                      variant="primary"
                      className="flex items-center"
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
            <div className="md:w-80 border-l border-neutral-700 flex-shrink-0 overflow-y-auto bg-[#0f172a]">
              <div className="p-4">
                <h3 className="font-serif font-bold mb-4 text-lg text-neutral-50">
                  {course?.title}
                </h3>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-400">Progress</span>
                    <span className="text-neutral-300">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress
                    value={progressPercentage}
                    variant={progressPercentage === 100 ? 'success' : 'default'}
                    size="sm"
                  />
                  <div className="text-xs text-neutral-500 mt-1">
                    {completedLessons} of {course?.lessons?.length || 0} lessons
                    completed
                  </div>
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
                      <AccordionTrigger className="hover:no-underline">
                        <div className="text-left">
                          <div className="font-semibold">{section.title}</div>
                          <div className="text-sm text-neutral-500">
                            {section.lessons.length} lessons
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1">
                          {section.lessons.map((lesson) => (
                            <LessonItem
                              key={lesson.id}
                              lesson={lesson}
                              courseId={courseId!}
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

export default LessonPage;
