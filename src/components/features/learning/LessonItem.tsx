import { Link } from 'react-router-dom';
import { Badge } from '@/components/ds/primitives/Badge';
import { Check, Play, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/types/course';

export interface LessonItemProps {
  lesson: Lesson;
  courseId: string;
  isActive?: boolean;
}

export function LessonItem({
  lesson,
  courseId,
  isActive = false,
}: LessonItemProps) {
  return (
    <li>
      <Link
        to={`/courses/${courseId}/learn/${lesson.id}`}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg text-sm font-medium',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:shadow-glow-violet',
          isActive
            ? 'bg-violet-600/10 text-violet-400 border-l-2 border-violet-500 pl-[10px]'
            : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-neutral-100'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <div className="flex-shrink-0">
          {lesson.is_completed ? (
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          ) : isActive ? (
            <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
              <Play className="w-3 h-3 text-white" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center">
              <Lock className="w-3 h-3 text-neutral-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="line-clamp-2">{lesson.title}</p>
          {lesson.duration_readable && (
            <p className="text-xs text-neutral-500 mt-0.5">
              {lesson.duration_readable}
            </p>
          )}
          {lesson.is_completed && (
            <Badge variant="success" size="sm" className="mt-1">
              Completed
            </Badge>
          )}
        </div>
        {isActive && (
          <div className="flex-shrink-0 w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
        )}
      </Link>
    </li>
  );
}
