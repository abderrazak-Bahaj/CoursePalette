import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ds/primitives/Badge';
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
  isPreview?: boolean;
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
    <div className="bg-[#1e293b] border border-neutral-700 rounded-xl p-6">
      <h2 className="font-serif text-2xl font-bold text-neutral-50 mb-2">
        Course Content
      </h2>
      <p className="text-sm text-neutral-400 mb-6">
        {lessons.length} lessons •{' '}
        {formatDuration(lessons.reduce((acc, l) => acc + l.duration, 0))} total
        length
      </p>

      <Accordion type="single" collapsible className="w-full space-y-2">
        {sections.map((section, sectionIndex) => (
          <AccordionItem
            key={sectionIndex}
            value={`section-${sectionIndex}`}
            className="border border-neutral-700 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-neutral-700/30 hover:no-underline">
              <div className="text-left">
                <div className="font-semibold text-neutral-100">
                  {section.title}
                </div>
                <div className="text-sm text-neutral-400">
                  {section.lessons.length} lessons •{' '}
                  {formatDuration(
                    section.lessons.reduce((acc, l) => acc + l.duration, 0)
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <ul className="space-y-3 pt-2">
                {section.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {isPreview ? (
                        <Play className="h-4 w-4 text-violet-400 flex-shrink-0" />
                      ) : (
                        <Lock className="h-4 w-4 text-neutral-600 flex-shrink-0" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-neutral-200">
                          {lesson.title}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {formatDuration(lesson.duration)}
                        </div>
                      </div>
                    </div>
                    {lesson.isPreview && (
                      <Badge variant="outline" size="sm">
                        Preview
                      </Badge>
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
