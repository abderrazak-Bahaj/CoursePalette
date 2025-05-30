import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { Assignment } from '@/types/course';

interface AssignmentItemProps {
  assignment: Assignment;
  courseId: string;
}

const AssignmentItem = ({ assignment, courseId }: AssignmentItemProps) => {
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    if (assignment.status === 'DRAFT') {
      return (
        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
          Draft
        </span>
      );
    }
    if (assignment.is_overdue) {
      return (
        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
          Overdue
        </span>
      );
    }
    if (assignment.is_active) {
      return (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
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
    switch (assignment.type) {
      case 'QUIZ':
        return 'Start Quiz';
      case 'ESSAY':
        return 'Submit Essay';
      case 'MULTIPLE_CHOICE':
        return 'Take Test';
      default:
        return 'View Assignment';
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getAssignmentIcon(assignment.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
              {assignment.due_date && (
                <div className={`flex items-center space-x-1 text-xs ${
                  assignment.is_overdue ? 'text-red-500' : 'text-gray-500'
                }`}>
                  <Clock className="h-3 w-3" />
                  <span>Due: {formatDueDate(assignment.due_date)}</span>
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
              {assignment.is_overdue && (
                <div className="flex items-center space-x-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>Overdue</span>
                </div>
              )}
              {assignment.time_limit && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>Time Limit: {assignment.time_limit} minutes</span>
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
            assignment.is_overdue 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-course-blue hover:bg-course-blue/90'
          }`}
          disabled={assignment.status === 'DRAFT'}
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