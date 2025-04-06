import { get, post } from './apiClient';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  register: (data: RegisterData) => {
    return post('/register', data);
  },

  login: async (data: LoginData) => {
    const response = await post('/login', data);
    if (response.token) {
      // Store user with token in localStorage
      const user = {
        ...response.user,
        token: response.token,
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response;
  },

  logout: () => {
    return post('/logout').finally(() => {
      localStorage.removeItem('user');
    });
  },

  getCurrentUser: () => {
    return get('/me');
  },
};
