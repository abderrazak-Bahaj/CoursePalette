import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import useGroupedLessons from '@/hooks/use-grouped-lessons';
import { Play, Lock } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  duration: number;
  isPreview?: boolean;
  order: number;
}

interface CourseCurriculumProps {
  lessons: Lesson[];
}

const formatDuration = (minutes: number): string => {
  if (minutes === 0) return '0m';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;

  return `${hours}h ${mins}m`;
};

export const CourseCurriculum = ({
  lessons,
  isPreview,
}: CourseCurriculumProps) => {
  const sections = useGroupedLessons(lessons || []);
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Course Content</h2>
      <div className="text-sm text-gray-500 mb-6">
        {lessons.length} lessons •{' '}
        {formatDuration(
          lessons.reduce((acc, lesson) => acc + lesson.duration, 0)
        )}{' '}
        total length
      </div>

      <Accordion type="single" collapsible className="w-full">
        {sections.map((section, sectionIndex) => (
          <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`}>
            <AccordionTrigger>
              <div className="text-left">
                <div className="font-semibold">{section.title}</div>
                <div className="text-sm text-gray-500">
                  {section.lessons.length} lessons •{' '}
                  {formatDuration(
                    section.lessons.reduce(
                      (acc, lesson) => acc + lesson.duration,
                      0
                    )
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-4">
                {section.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {isPreview ? (
                        <Play className="h-5 w-5 mr-3 text-course-blue" />
                      ) : (
                        <Lock className="h-5 w-5 mr-3 text-gray-400" />
                      )}
                      <div>
                        <div className="font-medium">{lesson.title}</div>
                        <div className="text-sm text-gray-500">
                          {formatDuration(lesson.duration)}
                        </div>
                      </div>
                    </div>
                    {lesson.isPreview && (
                      <Badge variant="outline">Preview</Badge>
                    )}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
