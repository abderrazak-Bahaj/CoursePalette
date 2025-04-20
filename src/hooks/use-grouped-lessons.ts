import { useMemo } from 'react';

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  course_id: number;
  content: string;
  duration: number;
  duration_readable: string;
  last_position: number | null;
  order: number;
  section: number;
  video_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface GroupedSection {
  title: string;
  lessons: Lesson[];
}

const useGroupedLessons = (lessons: Lesson[]): GroupedSection[] => {
  return useMemo(() => {
    const grouped: Record<number, GroupedSection> = {};

    for (const lesson of lessons) {
      const sectionId = lesson.section;
      if (!grouped[sectionId]) {
        grouped[sectionId] = {
          title: `Section ${sectionId}`,
          lessons: [],
        };
      }
      grouped[sectionId].lessons.push(lesson);
    }
    // Sort lessons within each section
    Object.values(grouped).forEach((section) => {
      section.lessons.sort((a, b) => a.order - b.order);
    });

    // Sort sections by section ID
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([_, section]) => section);
  }, [lessons]);
};

export default useGroupedLessons;
