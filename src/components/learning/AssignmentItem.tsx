import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Timer,
  Check,
} from 'lucide-react';
import { Assignment } from '@/types/course';

interface AssignmentItemProps {
  assignment: Assignment;
  courseId: string;
}

const AssignmentItem = ({ assignment, courseId }: AssignmentItemProps) => {
  const formatTimeLimit = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hour${hours > 1 ? 's' : ''}`;
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

  const getStatusBadge = () => {
    if (assignment.is_submitted) {
      return (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
          <Check className="h-3 w-3" />
          Submitted
        </span>
      );
    }

    if (assignment.status === 'DRAFT') {
      return (
        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
          Draft
        </span>
      );
    }

    if (assignment.is_expired) {
      return (
        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
          Expired
        </span>
      );
    }

    if (assignment.is_active) {
      return (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          Active
        </span>
      );
    }

    return (
      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
        Inactive
      </span>
    );
  };

  const getButtonText = () => {
    if (assignment.is_submitted) {
      return 'View Submission';
    }

    switch (assignment.type) {
      case 'QUIZ':
        return 'Start Quiz';
      case 'ESSAY':
        return 'Submit Essay';
      case 'MULTIPLE_CHOICE':
        return 'Take Test';
      default:
        return 'Start Assignment';
    }
  };

  const isDisabled = assignment.status === 'DRAFT' || assignment.is_expired;

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getAssignmentIcon(assignment.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-gray-900">
                {assignment.title}
              </h4>
              {assignment.date_limit && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Timer className="h-3 w-3" />
                  <span>
                    Time Limit: {formatTimeLimit(assignment.date_limit)}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {assignment.description}
            </p>

            <div className="flex items-center space-x-4 mt-3">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {assignment.type}
              </span>
              {getStatusBadge()}
              {assignment.max_score && (
                <span className="text-xs text-gray-500">
                  Max Score: {assignment.max_score}
                </span>
              )}
              {assignment.questions_count && (
                <span className="text-xs text-gray-500">
                  {assignment.questions_count} Questions
                </span>
              )}
            </div>

            {/* Status indicators */}
            <div className="flex items-center space-x-4 mt-2">
              {assignment.is_expired && (
                <div className="flex items-center space-x-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>Time Expired</span>
                </div>
              )}
              {assignment.remaining_time && !assignment.is_submitted && (
                <div className="flex items-center space-x-1 text-xs text-orange-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    Time remaining: {Math.floor(assignment.remaining_time / 60)}
                    m {assignment.remaining_time % 60}s
                  </span>
                </div>
              )}
              {assignment.is_submitted && (
                <div className="flex items-center space-x-1 text-xs text-green-500">
                  <CheckCircle className="h-3 w-3" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          asChild
          size="sm"
          className={`${
            assignment.is_submitted
              ? 'bg-green-500 hover:bg-green-600'
              : assignment.is_expired
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-course-blue hover:bg-course-blue/90'
          }`}
          disabled={isDisabled}
        >
          <Link to={`/courses/${courseId}/assignments/${assignment.id}`}>
            {getButtonText()}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default AssignmentItem;
