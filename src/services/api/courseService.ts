import { get, post, put, del } from './apiClient';

export interface CourseData {
  title: string;
  description: string;
  category_id: string;
  price: number;
  level: string;
  status: string;
  language: string;
  duration: number;
  skills: string[];
  image?: File;
}

export const courseService = {
  getAllCourses: (params?: Record<string, string>) => {
    return get('/courses', { params });
  },

  getCourse: (id: string) => {
    return get(`/courses/${id}`);
  },

  getMyCourses: (params?: Record<string, string>) => {
    return get(`/my-courses`, { params });
  },

  getAdminCources: (params?: Record<string, string>) => {
    return get(`/admin/courses`, { params });
  },

  createCourse: (formData: FormData) => {
    return post('/courses', formData);
  },

  updateCourse: (id: string, formData: FormData) => {
    return put(`/courses/${id}`, formData);
  },

  deleteCourse: (id: string) => {
    return del(`/courses/${id}`);
  },

  publishCourse: (id: string) => {
    return put(`/courses/${id}/publish`);
  },

  unpublishCourse: (id: string) => {
    return put(`/courses/${id}/unpublish`);
  },

  getCourseLessons: (courseId: string, params?: Record<string, string>) => {
    return get(`/courses/${courseId}/lessons`, { params });
  },

  getAssignment: (courseId: string, assignmentId: string) => {
    return get(`/courses/${courseId}/assignments/${assignmentId}`);
  },

  getCourseAssignments: (courseId: string, params?: Record<string, string>) => {
    return get(`/courses/${courseId}/assignments`, { params });
  },

  createAssignment: (courseId: string, data: any) => {
    return post(`/courses/${courseId}/assignments`, data);
  },

  updateAssignment: (courseId: string, assignmentId: string, data: any) => {
    return put(`/courses/${courseId}/assignments/${assignmentId}`, data);
  },

  deleteAssignment: (courseId: string, assignmentId: string) => {
    return del(`/courses/${courseId}/assignments/${assignmentId}`);
  },

  startAssignment: (courseId: string, assignmentId: string) => {
    return post(`/courses/${courseId}/assignments/${assignmentId}/start`);
  },

  getTimeRemaining: (courseId: string, assignmentId: string) => {
    return get(`/courses/${courseId}/assignments/${assignmentId}/time-remaining`);
  },

  gradeSubmission: (courseId: string, assignmentId: string, data: any) => {
    return post(`/courses/${courseId}/assignments/${assignmentId}/grade`, data);
  },
};
