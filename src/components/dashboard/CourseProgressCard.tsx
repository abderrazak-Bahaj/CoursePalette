import { Link } from 'react-router-dom';
import { Card } from '@/components/ds/primitives/Card';
import { Progress } from '@/components/ds/primitives/Progress';
import { Play, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ds/primitives/Button';

interface CourseProgressCardProps {
  enrollment: any;
}

const CourseProgressCard = ({ enrollment }: CourseProgressCardProps) => {
  const course = enrollment?.course;
  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-64 h-40 md:h-auto">
          <img
            src={course?.image_url}
            alt={course?.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-6">
          <h3 className="font-serif font-semibold text-xl text-neutral-50 mb-2">
            {course?.title}
          </h3>
          <p className="text-sm text-neutral-400 mb-4">{course?.instructor}</p>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-neutral-400">Your progress</span>
              <span className="text-neutral-300">
                {enrollment?.progress_percentage}%
              </span>
            </div>
            <Progress
              value={Number(enrollment?.progress_percentage)}
              variant={course?.is_completed ? 'success' : 'default'}
              size="md"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start"></div>

            <div className="flex items-center gap-4">
              {course?.is_completed ? (
                <Button asChild variant="success">
                  <Link to={`/courses/${course?.id}/certificate`}>
                    View Certificate
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="primary">
                  <Link
                    to={`/courses/${enrollment?.last_Lesson?.course_id}/learn/${enrollment?.last_Lesson?.lesson_id}`}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CourseProgressCard;
