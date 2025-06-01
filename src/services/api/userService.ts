import { get, post, put, del } from './apiClient';
import { User } from '@/types/user';

export interface UserData {
  name: string;
  email: string;
  bio?: string;
  phone?: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  password?: string;
  profileUrl?: string;
}

interface UserServiceParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export const userService = {
  getUsers: (params?: Record<string, string>) => {
    return get('/users', { params });
  },

  getUser: (id: string) => {
    return get(`/users/${id}`);
  },

  getTeachers: async (params: UserServiceParams = {}) => {
    // Convert numerical values to strings for API compatibility
    const convertedParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        convertedParams[key] = String(value);
      }
    });
    return get('/teachers', { params: convertedParams });
  },

  getStudents: async (params: UserServiceParams = {}) => {
    // Convert numerical values to strings for API compatibility
    const convertedParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        convertedParams[key] = String(value);
      }
    });
    return get('/students', { params: convertedParams });
  },

  updateProfile: (data: any) => {
    return put('/profile/update', data);
  },
  updateProfileAvatar: (formData: FormData) => {
    return post('/profile/avatar', formData);
  },
  updatePassword: (data: any) => {
    return put('/profile/password', data);
  },
  updateStatusByAdmin: (
    user_id: string,
    data: { status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }
  ) => {
    return put(`/admin/users/${user_id}/status`, data);
  },
  updatePasswordByAdmin: (user_id: string, data: any) => {
    return put(`/admin/users/${user_id}/password`, data);
  },
  deleteUser: (id: string) => {
    return del(`/users/${id}`);
  },
  createUserByAdmin: (data: UserData) => {
    return post('/admin/users/create', data);
  },
  createStudent: (data: UserData) => {
    return post('/students', data);
  },

  createUser: (data: UserData) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });

    return post('/users', formData);
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

  getCurrentUser: () => {
    return get('/users/me');
  },
};
