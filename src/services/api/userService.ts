
import { get, post, put, del } from "./apiClient";
import { User } from "@/types/user";

export interface UserData {
  name: string;
  email: string;
  role?: "admin" | "teacher" | "student";
  password?: string;
  profileUrl?: string;
}

export const userService = {
  getUsers: (params?: Record<string, string>) => {
    return get("/users", { params });
  },
  
  getUser: (id: string) => {
    return get(`/users/${id}`);
  },
  
  createUser: (data: UserData) => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
    return post("/users", formData);
  },
  
  updateUser: (id: string, data: Partial<UserData>) => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
    return put(`/users/${id}`, formData);
  },
  
  deleteUser: (id: string) => {
    return del(`/users/${id}`);
  },
  
  getCurrentUser: () => {
    return get("/users/me");
  },
  
  getStudents: (params?: Record<string, string>) => {
    return get("/users", { params: { role: "student", ...params } });
  },
  
  getTeachers: (params?: Record<string, string>) => {
    return get("/users", { params: { role: "teacher", ...params } });
  }
};
