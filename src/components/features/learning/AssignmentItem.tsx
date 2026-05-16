import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ds/primitives/Card';
import { Badge } from '@/components/ds/primitives/Badge';
import { Button } from '@/components/ds/primitives/Button';
import { ClipboardList } from 'lucide-react';

export interface AssignmentItemProps {
  id: string;
  courseId: string;
  title: string;
  status?: 'pending' | 'submitted' | 'graded';
  dueDate?: string;
  score?: number;
  maxScore?: number;
}

const statusVariantMap = {
  pending: 'warning',
  submitted: 'primary',
  graded: 'success',
} as const;

export function AssignmentItem({
  id,
  courseId,
  title,
  status = 'pending',
  dueDate,
  score,
  maxScore,
}: AssignmentItemProps) {
  return (
    <Card variant="elevated">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-neutral-100 line-clamp-2">
                {title}
              </h4>
              <Badge
                variant={statusVariantMap[status]}
                size="sm"
                className="flex-shrink-0"
              >
                {status}
              </Badge>
            </div>
            {dueDate && (
              <p className="text-xs text-neutral-500 mb-2">Due {dueDate}</p>
            )}
            {score !== undefined && maxScore !== undefined && (
              <p className="text-sm text-amber-400 font-medium mb-2">
                {score}/{maxScore} pts
              </p>
            )}
            <Button variant="primary" size="sm" asChild>
              <Link to={`/courses/${courseId}/assignments/${id}`}>
                {status === 'pending' ? 'Start' : 'View'}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
