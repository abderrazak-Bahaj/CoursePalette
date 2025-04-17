import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Play, Check, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Lesson } from '@/types/course';
import { courseService, lessonService } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import WrapperLoading from '@/components/ui/wrapper-loading';
import VideoPlayer from '@/components/ui/video-player';
import useGroupedLessons from '@/hooks/use-grouped-lessons';

interface Section {
  title: string;
  lessons: Lesson[];
}

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId?: string;
  }>();
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
        description: `You have successfully completed "${lesson?.title}"`,
      });
      queryClient.invalidateQueries({
        queryKey: ['learn-lesson', courseId, lessonId],
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

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const sections = useGroupedLessons(course?.lessons || []);

  if (!(course?.lessons?.length > 0) && !isLoading && !courseLoading) {
    return (
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
    );
  }

  if (!lesson && !isLoading && !courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
          <p className="mb-6">The lesson you are looking for does not exist.</p>
          <Button asChild>
            <Link to={`/courses/${courseId}/learn`}>Back to Course</Link>
          </Button>
        </div>
      </div>
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

  const progressPercentage =
    (completedLessons.length / (course?.lessons?.length || 0)) * 100;

  const markAsCompleted = async () => {
    await completeLessonMutation.mutateAsync();
  };

  // Helper function to check if a lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId);
  };

  return (
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
          <h1 className="text-lg font-medium line-clamp-1">{course?.title}</h1>
          <div className="w-24">
            <Progress value={progressPercentage} className="h-2" />
          </div>
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
              <div className="prose max-w-none mb-8">{lesson?.content}</div>

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
                  <div></div> // Empty div to maintain flex spacing
                )}
                <Button
                  onClick={markAsCompleted}
                  disabled={isLessonCompleted(currentLessonId)}
                  className="flex items-center bg-course-blue"
                >
                  {isLessonCompleted(currentLessonId) ? (
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
                  <Button asChild className="flex items-center bg-course-blue">
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
                            isCompleted={isLessonCompleted(lesson.id)}
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
  );
};

// LessonItem component
interface LessonItemProps {
  lesson: Lesson;
  courseId: string;
  isActive: boolean;
  isCompleted: boolean;
  duration_readable: string;
}

const LessonItem = ({
  lesson,
  courseId,
  isActive,
  isCompleted,
}: LessonItemProps) => {
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
          {isCompleted ? (
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
