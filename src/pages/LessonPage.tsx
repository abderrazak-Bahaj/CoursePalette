
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Play, Check, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { mockCourses } from "@/data/mockData";
import { Lesson } from "@/types/course";

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId?: string }>();
  const { toast } = useToast();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  
  // Find the course by ID
  const course = mockCourses.find((course) => course.id === courseId);
  
  if (!course || !course.lessons || course.lessons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="mb-6">The course you are looking for does not exist or has no lessons.</p>
          <Button asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  // If no lessonId is provided, use the first lesson
  const currentLessonId = lessonId || course.lessons[0].id;
  const currentLesson = course.lessons.find(lesson => lesson.id === currentLessonId);
  
  if (!currentLesson) {
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

  // Calculate the current lesson index and determine next/previous lessons
  const currentIndex = course.lessons.findIndex(lesson => lesson.id === currentLessonId);
  const previousLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;
  
  // Calculate progress percentage
  const progressPercentage = (completedLessons.length / course.lessons.length) * 100;

  const markAsCompleted = () => {
    if (!completedLessons.includes(currentLessonId)) {
      const newCompletedLessons = [...completedLessons, currentLessonId];
      setCompletedLessons(newCompletedLessons);
      
      toast({
        title: "Lesson Completed",
        description: "Your progress has been updated.",
      });

      // If there's a next lesson, suggest navigating to it
      if (nextLesson) {
        toast({
          title: "Next Lesson",
          description: "Continue to the next lesson to keep learning.",
          action: (
            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <Link to={`/courses/${courseId}/learn/${nextLesson.id}`}>
                Continue
              </Link>
            </Button>
          ),
        });
      } else {
        toast({
          title: "Course Completed",
          description: "Congratulations on completing the course!",
        });
      }
    }
  };

  // Helper function to check if a lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId);
  };

  return (
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
        <h1 className="text-lg font-medium line-clamp-1">{course.title}</h1>
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
              <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
              <p className="text-gray-500">{currentLesson.duration}</p>
            </div>

            {/* Video player placeholder */}
            <div className="relative aspect-video bg-gray-900 mb-8 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 h-16 w-16"
                >
                  <Play className="h-8 w-8 text-white" fill="white" />
                </Button>
              </div>
            </div>

            {/* Lesson content */}
            <div className="prose max-w-none mb-8">
              <h3>Lesson Notes</h3>
              <p>
                This is where the lesson content would appear. In a real application, 
                this would include detailed explanations, code examples, images, and other 
                educational materials relevant to this specific lesson.
              </p>
              <p>
                The content would be structured to help students understand the concepts 
                being taught and provide practical examples to reinforce learning.
              </p>
              <h4>Key Points</h4>
              <ul>
                <li>Important concept #1 related to this lesson</li>
                <li>Important concept #2 related to this lesson</li>
                <li>Important concept #3 related to this lesson</li>
              </ul>
              <h4>Example</h4>
              <pre><code>
                // Example code or demonstration
                // This would be specific to the course subject
              </code></pre>
            </div>

            {/* Next/Previous navigation */}
            <div className="flex justify-between border-t pt-6">
              {previousLesson ? (
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center"
                >
                  <Link to={`/courses/${courseId}/learn/${previousLesson.id}`}>
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

        {/* Sidebar with course curriculum */}
        <div className="md:w-80 border-l flex-shrink-0 overflow-y-auto bg-gray-50">
          <div className="p-4">
            <h3 className="font-bold mb-4">Course Curriculum</h3>
            <Accordion type="multiple" defaultValue={["section-1"]} className="w-full">
              <AccordionItem value="section-1">
                <AccordionTrigger>
                  <div className="text-left">
                    <div className="font-semibold">
                      Section 1: Introduction
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.lessons?.filter((_, i) => i < 2).length || 0} lessons
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {course.lessons?.filter((_, i) => i < 2).map((lesson) => (
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

              <AccordionItem value="section-2">
                <AccordionTrigger>
                  <div className="text-left">
                    <div className="font-semibold">
                      Section 2: Getting Started
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.lessons?.filter((_, i) => i >= 2).length || 0} lessons
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {course.lessons?.filter((_, i) => i >= 2).map((lesson) => (
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
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
};

// LessonItem component
interface LessonItemProps {
  lesson: Lesson;
  courseId: string;
  isActive: boolean;
  isCompleted: boolean;
}

const LessonItem = ({ lesson, courseId, isActive, isCompleted }: LessonItemProps) => {
  return (
    <li>
      <Link
        to={`/courses/${courseId}/learn/${lesson.id}`}
        className={`flex items-center p-2 rounded-md ${
          isActive
            ? "bg-course-blue bg-opacity-10 text-course-blue"
            : "hover:bg-gray-100"
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
          <div className="text-xs text-gray-500">{lesson.duration}</div>
        </div>
      </Link>
    </li>
  );
};

export default LessonPage;
