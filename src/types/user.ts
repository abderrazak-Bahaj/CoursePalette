
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  createdAt?: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: UserCredentials & { name: string }) => Promise<void>;
};
