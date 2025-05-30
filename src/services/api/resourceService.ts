import { get, post, put, del } from './apiClient';

interface ResourceData {
  title: string;
  description?: string;
  lesson_id?: string;
  course_id?: string;
  type?: string;
  url?: string;
  file?: File;
  order?: number;
  is_preview?: boolean;
}

interface ReorderResourcesData {
  resources: Array<{ id: number; order: number }>;
}

export const resourceService = {
  getCourseResources: (courseId: string) => {
    return get(`/courses/${courseId}/resources`);
  },

  getLessonResources: (courseId: string, lessonId: string) => {
    return get(`/courses/${courseId}/lessons/${lessonId}/resources`);
  },

  getResource: (courseId: string, resourceId: string) => {
    return get(`/courses/${courseId}/resources/${resourceId}`);
  },

  createResource: (courseId: string, data: ResourceData | FormData) => {
    // If data is already FormData, use it directly
    if (data instanceof FormData) {
      return post(`/courses/${courseId}/resources`, data);
    }

    // Otherwise, convert to FormData for file uploads
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
        formData.append(key, value.toString());
        }
      }
    });

    return post(`/courses/${courseId}/resources`, formData);
  },

  updateResource: (
    courseId: string,
    resourceId: string,
    data: ResourceData | FormData
  ) => {
    // If data is already FormData, use POST with method spoofing
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return post(`/courses/${courseId}/resources/${resourceId}`, data);
    }

    // Otherwise, convert to FormData for file uploads and use method spoofing
    const formData = new FormData();
    formData.append('_method', 'PUT');
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
        formData.append(key, value.toString());
        }
      }
    });

    return post(`/courses/${courseId}/resources/${resourceId}`, formData);
  },

  deleteResource: (courseId: string, resourceId: string) => {
    return del(`/courses/${courseId}/resources/${resourceId}`);
  },

  reorderResources: (courseId: string, data: ReorderResourcesData) => {
    return post(`/courses/${courseId}/resources/reorder`, data);
  },
};
