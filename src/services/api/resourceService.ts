
import { get, post, put } from "./apiClient";

interface ResourceData {
  title: string;
  description?: string;
  lesson_id?: string;
  type?: string;
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
  
  getResource: (courseId: string, resourceId: string) => {
    return get(`/courses/${courseId}/resources/${resourceId}`);
  },
  
  createResource: (courseId: string, data: ResourceData) => {
    // Use FormData for file uploads
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    return post(`/courses/${courseId}/resources`, formData);
  },
  
  updateResource: (courseId: string, resourceId: string, data: ResourceData) => {
    // Use FormData for file uploads
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    return put(`/courses/${courseId}/resources/${resourceId}`, formData);
  },
  
  reorderResources: (courseId: string, data: ReorderResourcesData) => {
    return post(`/courses/${courseId}/resources/reorder`, data);
  }
};
