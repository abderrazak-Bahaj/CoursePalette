import { Link } from 'react-router-dom';
import { Check, Play, Lock } from 'lucide-react';
import { Lesson } from '@/types/course';
import { cn } from '@/lib/utils';

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
        className={cn(
          'flex items-center p-3 rounded-lg transition-all duration-200',
          isActive
            ? 'bg-violet-600/10 text-violet-400 border-l-2 border-violet-500 pl-[10px]'
            : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-neutral-100'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <div className="flex-shrink-0 mr-3">
          {lesson?.is_completed ? (
            <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          ) : isActive ? (
            <div className="h-6 w-6 rounded-full bg-violet-600 flex items-center justify-center">
              <Play className="h-3 w-3 text-white" />
            </div>
          ) : (
            <div className="h-6 w-6 rounded-full bg-neutral-700 flex items-center justify-center">
              <Lock className="h-3 w-3 text-neutral-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium line-clamp-2">{lesson.title}</div>
          <div className="text-xs text-neutral-500 mt-0.5">
            {lesson.duration_readable}
          </div>
          {lesson.is_completed && (
            <div className="text-xs text-amber-400 mt-0.5 font-medium">
              Completed
            </div>
          )}
        </div>
        {isActive && (
          <div className="flex-shrink-0 ml-2">
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
          </div>
        )}
      </Link>
    </li>
  );
};

export default LessonItem;
