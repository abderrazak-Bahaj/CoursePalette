import { Link } from 'react-router-dom';
import { Check, Play, Lock } from 'lucide-react';
import { Lesson } from '@/types/course';

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
        className={`flex items-center p-3 rounded-md transition-all duration-200 ${
          isActive
            ? 'bg-course-blue bg-opacity-10 text-course-blue border-l-4 border-course-blue'
            : 'hover:bg-gray-100 hover:shadow-sm'
        }`}
      >
        <div className="flex-shrink-0 mr-3">
          {lesson?.is_completed ? (
            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          ) : isActive ? (
            <div className="h-6 w-6 rounded-full bg-course-blue flex items-center justify-center">
              <Play className="h-3 w-3 text-white" />
            </div>
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
              <Lock className="h-3 w-3 text-gray-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div 
            className={`text-sm font-medium line-clamp-2 ${
              isActive ? 'text-course-blue' : 'text-gray-900'
            }`}
          >
            {lesson.title}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {lesson.duration_readable}
          </div>
          {lesson.is_completed && (
            <div className="text-xs text-green-600 mt-1 font-medium">
              Completed
            </div>
          )}
        </div>
        {isActive && (
          <div className="flex-shrink-0 ml-2">
            <div className="w-2 h-2 bg-course-blue rounded-full animate-pulse"></div>
          </div>
        )}
      </Link>
    </li>
  );
};

export default LessonItem; 