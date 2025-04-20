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
};
