
import { get, post, put, del } from "./apiClient";

export interface CourseData {
  title: string;
  description?: string;
  content?: string;
  category_id?: string;
  price?: number;
  level?: string;
  thumbnail?: File;
  status?: string;
  instructor_id?: string;
}

export const courseService = {
  getCourses: (params?: Record<string, string>) => {
    return get("/courses", { params });
  },
  
  getCourse: (id: string) => {
    return get(`/courses/${id}`);
  },
  
  createCourse: (data: CourseData) => {
    // Use FormData for file uploads
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
    return post("/courses", formData);
  },
  
  updateCourse: (id: string, data: CourseData) => {
    // Use FormData for file uploads
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
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
  }
};
