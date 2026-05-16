import { Link } from 'react-router-dom';
import { Button } from '@/components/ds/primitives/Button';
import { Badge } from '@/components/ds/primitives/Badge';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Timer,
  Check,
} from 'lucide-react';
import { Assignment } from '@/types/course';
import { cn } from '@/lib/utils';

interface AssignmentItemProps {
  assignment: Assignment;
  courseId: string;
}

const AssignmentItem = ({ assignment, courseId }: AssignmentItemProps) => {
  const formatTimeLimit = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getAssignmentIcon = (type: string) => {
    switch (type) {
      case 'QUIZ':
        return <CheckCircle className="h-5 w-5 text-violet-400" />;
      case 'ESSAY':
        return <FileText className="h-5 w-5 text-violet-400" />;
      case 'MULTIPLE_CHOICE':
        return <CheckCircle className="h-5 w-5 text-amber-400" />;
      default:
        return <FileText className="h-5 w-5 text-neutral-400" />;
    }
  };

  const getStatusBadge = () => {
    if (assignment.is_submitted)
      return (
        <Badge variant="success" size="sm">
          <Check className="h-3 w-3 mr-1" />
          Submitted
        </Badge>
      );
    if (assignment.status === 'DRAFT')
      return (
        <Badge variant="default" size="sm">
          Draft
        </Badge>
      );
    if (assignment.is_expired)
      return (
        <Badge variant="error" size="sm">
          Expired
        </Badge>
      );
    if (assignment.is_active)
      return (
        <Badge variant="primary" size="sm">
          Active
        </Badge>
      );
    return (
      <Badge variant="warning" size="sm">
        Inactive
      </Badge>
    );
  };

  const getButtonText = () => {
    if (assignment.is_submitted) return 'View Submission';
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

  const getButtonVariant = () => {
    if (assignment.is_submitted) return 'success' as const;
    if (assignment.is_expired) return 'danger' as const;
    return 'primary' as const;
  };

  const isDisabled = assignment.status === 'DRAFT' || assignment.is_expired;

  return (
    <div className="border border-neutral-700 rounded-xl p-4 bg-[#1e293b] hover:border-violet-500/50 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getAssignmentIcon(assignment.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-neutral-100">
              {assignment.title}
            </h4>
            {assignment.date_limit && (
              <div className="flex items-center gap-1 text-xs text-neutral-500 flex-shrink-0">
                <Timer className="h-3 w-3" />
                <span>{formatTimeLimit(assignment.date_limit)}</span>
              </div>
            )}
          </div>

          {assignment.description && (
            <p className="text-sm text-neutral-400 mb-2 line-clamp-2">
              {assignment.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" size="sm">
              {assignment.type}
            </Badge>
            {getStatusBadge()}
            {assignment.max_score && (
              <span className="text-xs text-neutral-500">
                Max: {assignment.max_score} pts
              </span>
            )}
            {assignment.questions_count && (
              <span className="text-xs text-neutral-500">
                {assignment.questions_count} questions
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {assignment.is_expired && (
              <div className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="h-3 w-3" />
                <span>Time Expired</span>
              </div>
            )}
            {assignment.remaining_time && !assignment.is_submitted && (
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <Clock className="h-3 w-3" />
                <span>
                  {Math.floor(assignment.remaining_time / 60)}m{' '}
                  {assignment.remaining_time % 60}s remaining
                </span>
              </div>
            )}
            {assignment.is_submitted && (
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <CheckCircle className="h-3 w-3" />
                <span>Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          asChild
          size="sm"
          variant={getButtonVariant()}
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
