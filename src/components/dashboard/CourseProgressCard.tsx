import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CourseProgressCardProps {
  enrollment: any;
}

const CourseProgressCard = ({ enrollment }: CourseProgressCardProps) => {
  const course = enrollment?.course;
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-64 h-40 md:h-auto">
          <img
            src={course?.image_url}
            alt={course?.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-6">
          <h3 className="font-semibold text-xl mb-2">{course?.title}</h3>
          <p className="text-sm text-gray-500 mb-4">{course?.instructor}</p>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Your progress</span>
              <span>{enrollment?.progress_percentage}%</span>
            </div>
            <Progress value={Number(enrollment?.progress_percentage)} className={`h-2 ${course?.is_completed ? 'bg-green-500' : 'bg-blue-100'}`} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start"></div>

            <div className="flex items-center gap-4">
              {course?.is_completed ? (
                <Button
                  asChild
                  variant="default"
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Link to={`/courses/${course?.id}/certificate`}>
                    View Certificate
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              ) : (
                
                  <Button asChild>
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
