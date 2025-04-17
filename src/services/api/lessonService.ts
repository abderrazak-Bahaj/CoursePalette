import { get, post, put, del } from './apiClient';

export interface LessonData {
  title: string;
  description?: string;
  content?: string;
  duration?: number;
  order?: number;
  status?: string;
  video_url?: string;
  is_preview?: boolean;
}

export interface ReorderLessonsData {
  lessons: Array<{ id: string; order: number }>;
}

export const lessonService = {
  getCourseLessons: (courseId: string, params?: Record<string, string>) => {
    return get(`/courses/${courseId}/lessons`, { params });
  },

  getLesson: (courseId: string, lessonId: string) => {
    return get(`/courses/${courseId}/lessons/${lessonId}`);
  },

  createLesson: (courseId: string, data: LessonData) => {
    return post(`/courses/${courseId}/lessons`, data);
  },

  updateLesson: (courseId: string, lessonId: string, data: LessonData) => {
    return put(`/courses/${courseId}/lessons/${lessonId}`, data);
  },

  deleteLesson: (courseId: string, lessonId: string) => {
    return del(`/courses/${courseId}/lessons/${lessonId}`);
  },

  completeLesson: (courseId: string, lessonId: string) => {
    return post(`/courses/${courseId}/lessons/${lessonId}/complete`);
  },

  reorderLessons: (courseId: string, data: ReorderLessonsData) => {
    return post(`/courses/${courseId}/lessons/reorder`, data);
  },

  publishLesson: (courseId: string, lessonId: string) => {
    return put(`/courses/${courseId}/lessons/${lessonId}/publish`);
  },

  unpublishLesson: (courseId: string, lessonId: string) => {
    return put(`/courses/${courseId}/lessons/${lessonId}/unpublish`);
  },
};
