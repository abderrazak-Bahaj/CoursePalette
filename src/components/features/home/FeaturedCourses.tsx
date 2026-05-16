import { CourseList } from '@/components/features/course/CourseList';
import type { CourseCardProps } from '@/components/features/course/CourseCard';

export interface FeaturedCoursesProps {
  courses: CourseCardProps[];
  loading?: boolean;
}

export function FeaturedCourses({
  courses,
  loading = false,
}: FeaturedCoursesProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-3xl font-bold text-neutral-50 mb-8">
          Featured Courses
        </h2>
        <CourseList courses={courses} loading={loading} />
      </div>
    </section>
  );
}
