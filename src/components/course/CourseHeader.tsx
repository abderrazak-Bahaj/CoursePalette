import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Clock,
  Calendar,
  Globe,
  Play,
  Video,
  BarChart,
} from 'lucide-react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

interface CourseHeaderProps {
  course: {
    title: string;
    description: string;
    enrolledCount: number;
    duration_readable: string;
    updated_at: string;
    language: string;
    instructor: {
      name: string;
    };
    image: string;
    price: number;
    level: string;
  };
  isEnrolled: boolean;
  onEnroll: () => void;
}

export const CourseHeader = ({
  course,
  isEnrolled,
  onEnroll,
}: CourseHeaderProps) => {
  return (
    <div className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg mb-4">{course.description}</p>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-1 text-gray-300" />
                <span>{course.enrolledCount} students</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-1 text-gray-300" />
                <span>{course.duration_readable}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-1 text-gray-300" />
                <span>
                  Last updated {dayjs(course.updated_at).format('DD/MM/YYYY')}
                </span>
              </div>
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-1 text-gray-300" />
                <span>{course.language}</span>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <span className="text-gray-300 mr-2">Created by</span>
              <Link to="#" className="text-course-blue hover:underline">
                {course.instructor?.name}
              </Link>
            </div>

            {isEnrolled ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-course-blue">
                  <Link to={`/courses/${course.id}/learn`}>
                    Continue Learning
                  </Link>
                </Button>
                <div className="flex-1 flex items-center">
                  <div className="w-full">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Your progress</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </div>
            ) : (
              <Button size="lg" className="bg-course-blue" onClick={onEnroll}>
                Enroll Now
              </Button>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-lg overflow-hidden shadow-xl bg-gray-800">
              <div className="relative aspect-video">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 h-16 w-16"
                  >
                    <Play className="h-8 w-8 text-white" fill="white" />
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold">
                    ${Number(course.price).toFixed(2)}
                  </div>
                </div>
                <Button
                  className="w-full mb-3 bg-course-blue"
                  size="lg"
                  onClick={onEnroll}
                >
                  {isEnrolled ? 'Already Enrolled' : 'Enroll Now'}
                </Button>
                <p className="text-center text-sm mb-4">
                  30-day money-back guarantee
                </p>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Video className="h-5 w-5 mr-2 mt-0.5 text-gray-300" />
                    <span>{course.duration_readable} of on-demand video</span>
                  </div>
                  <div className="flex items-start">
                    <BarChart className="h-5 w-5 mr-2 mt-0.5 text-gray-300" />
                    <span>{course.level} level</span>
                  </div>
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 mr-2 mt-0.5 text-gray-300" />
                    <span>{course.language}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
