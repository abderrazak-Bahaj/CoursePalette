// src/components/features/dashboard/CourseProgressCard.tsx
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ds/primitives/Card';
import { Progress } from '@/components/ds/primitives/Progress';
import { Badge } from '@/components/ds/primitives/Badge';
import { Button } from '@/components/ds/primitives/Button';
import { ArrowRight } from 'lucide-react';

export interface CourseProgressCardProps {
  enrollment: {
    course?: {
      id?: string;
      title?: string;
      image_url?: string;
      is_completed?: boolean;
    };
    progress_percentage?: number;
    last_Lesson?: { course_id?: string; lesson_id?: string };
  };
}

export function CourseProgressCard({ enrollment }: CourseProgressCardProps) {
  const course = enrollment?.course;
  const progress = Number(enrollment?.progress_percentage ?? 0);

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-32 md:h-auto flex-shrink-0">
          {course?.image_url ? (
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-neutral-700" />
          )}
        </div>
        <CardContent className="flex-1 pt-4">
          <h3 className="font-serif font-semibold text-neutral-50 mb-1">
            {course?.title}
          </h3>
          <div className="mb-3">
            <Progress value={progress} variant="success" size="md" showValue />
          </div>
          <div className="flex items-center gap-3">
            {course?.is_completed ? (
              <>
                <Badge variant="success">Completed</Badge>
                <Button variant="success" size="sm" asChild>
                  <Link to={`/courses/${course?.id}/certificate`}>
                    View Certificate <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </>
            ) : (
              <Button variant="primary" size="sm" asChild>
                <Link
                  to={`/courses/${enrollment?.last_Lesson?.course_id}/learn/${enrollment?.last_Lesson?.lesson_id}`}
                >
                  Continue <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
