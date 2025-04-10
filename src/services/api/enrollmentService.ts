import { get, post, put } from './apiClient';

interface EnrollmentData {
  status?: string;
  grade?: number;
  completed_at?: string;
}

export const enrollmentService = {
  getCourseEnrollments: (courseId: string) => {
    return get(`/courses/${courseId}/enrollments`);
  },

  getMyEnrollments: () => {
    return get('/my-enrollments');
  },

  enrollInCourse: (
    courseId: string,
    data: EnrollmentData = { status: 'ACTIVE' }
  ) => {
    return post(`/courses/${courseId}/enrollments`, data);
  },

  getEnrollment: (courseId: string, enrollmentId: string) => {
    return get(`/courses/${courseId}/enrollments/${enrollmentId}`);
  },

  updateEnrollment: (
    courseId: string,
    enrollmentId: string,
    data: EnrollmentData
  ) => {
    return put(`/courses/${courseId}/enrollments/${enrollmentId}`, data);
  },

  completeCourse: (courseId: string, enrollmentId: string) => {
    return post(`/courses/${courseId}/enrollments/${enrollmentId}/complete`);
  },

  dropCourse: (courseId: string, enrollmentId: string) => {
    return post(`/courses/${courseId}/enrollments/${enrollmentId}/drop`);
  },
};
