import { Enrollment } from '@/types';
import { useMemo } from 'react';

export const useFilteredCourses = (enrollments: Enrollment[]) => {
  console.log('enrollments', enrollments);
  const inProgress = useMemo(
    () => enrollments.filter((e) => !e.course?.is_completed) || [],
    [enrollments]
  );

  const completed = useMemo(
    () => enrollments.filter((e) => e.course?.is_completed) || [],
    [enrollments]
  );

  const all = useMemo(() => enrollments || [], [enrollments]);

  return { inProgress, completed, all };
};
