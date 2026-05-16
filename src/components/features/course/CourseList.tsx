// src/components/features/course/CourseList.tsx
import { CourseCard, CourseCardProps } from './CourseCard';

export interface CourseListProps {
  courses: CourseCardProps[];
  loading?: boolean;
  skeletonCount?: number;
}

export function CourseList({
  courses,
  loading = false,
  skeletonCount = 6,
}: CourseListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <CourseCard key={i} id="" title="" loading />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} {...course} />
      ))}
    </div>
  );
}
