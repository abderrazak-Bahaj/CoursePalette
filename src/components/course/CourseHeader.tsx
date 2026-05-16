import { Button } from '@/components/ds/primitives/Button';
import { Badge } from '@/components/ds/primitives/Badge';
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
    id?: string;
    title: string;
    description: string;
    enrolledCount?: number;
    duration_readable?: string;
    updated_at?: string;
    language?: string;
    instructor?: { name: string };
    image_url?: string;
    price?: number | string;
    level?: string;
    is_enrolled?: boolean;
    last_Lesson?: string;
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
    <div className="bg-gradient-to-br from-[#0f172a] via-[#1a1040] to-[#0f172a] border-b border-neutral-700 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Course info */}
          <div className="lg:col-span-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-50 mb-4">
              {course.title}
            </h1>
            <p className="text-lg text-neutral-300 mb-5">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-neutral-400">
              {course.enrolledCount !== undefined && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{course.enrolledCount} students</span>
                </div>
              )}
              {course.duration_readable && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration_readable}</span>
                </div>
              )}
              {course.updated_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Last updated {dayjs(course.updated_at).format('DD/MM/YYYY')}
                  </span>
                </div>
              )}
              {course.language && (
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{course.language}</span>
                </div>
              )}
            </div>

            {course.instructor?.name && (
              <div className="flex items-center gap-2 mb-6 text-sm">
                <span className="text-neutral-400">Created by</span>
                <span className="text-violet-400 font-medium">
                  {course.instructor.name}
                </span>
              </div>
            )}

            {isEnrolled ? (
              <Button variant="primary" size="lg" asChild>
                <Link to={`/courses/${course.id}/learn/${course.last_Lesson}`}>
                  Continue Learning
                </Link>
              </Button>
            ) : (
              <Button variant="action" size="lg" onClick={onEnroll}>
                Enroll Now
              </Button>
            )}
          </div>

          {/* Right: Course card */}
          <div className="lg:col-span-1">
            <div className="rounded-xl overflow-hidden border border-neutral-700 bg-[#1e293b] shadow-xl">
              <div className="relative aspect-video">
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <Play className="h-12 w-12 text-neutral-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button className="rounded-full bg-white/20 hover:bg-white/30 transition-colors h-16 w-16 flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <Play className="h-8 w-8 text-white fill-white" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-amber-400 mb-4">
                  ${Number(course.price ?? 0).toFixed(2)}
                </div>
                <Button
                  variant={isEnrolled ? 'secondary' : 'action'}
                  size="lg"
                  className="w-full mb-3"
                  onClick={onEnroll}
                  disabled={isEnrolled}
                >
                  {isEnrolled ? 'Already Enrolled' : 'Enroll Now'}
                </Button>
                <p className="text-center text-sm text-neutral-400 mb-4">
                  30-day money-back guarantee
                </p>
                <div className="space-y-2 text-sm text-neutral-300">
                  {course.duration_readable && (
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-neutral-500" />
                      <span>{course.duration_readable} of on-demand video</span>
                    </div>
                  )}
                  {course.level && (
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-neutral-500" />
                      <span>{course.level} level</span>
                    </div>
                  )}
                  {course.language && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-neutral-500" />
                      <span>{course.language}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
