import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/services/api/authService';
import { Loader } from '@/components/ui/loader';
import { AuthContextType, User } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getMe = async () => {
      const response = await authService.getCurrentUser();
      if (!response && !response.data) return;
      setUser(response.data as User);
      setIsLoading(false);
    };
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      getMe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      if (!response?.user) {
        throw new Error('Login failed: No user returned');
      }
      const user = response.user as User;
      setUser(user);
      setToken(response.token);
      localStorage.setItem('token', response.token);

      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name}!`,
      });

      return user;
    } catch (error) {
      console.error('Error logging in:', error);

      toast({
        title: 'Error login',
        description: `Invalid email or password`,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation: password,
        role: 'STUDENT',
      });
      if (!response?.user) {
        throw new Error('Registration failed: No user returned');
      }

      toast({
        title: 'Registration successful',
        description: `Welcome to CoursePalette, ${name}!`,
      });

      return response.user as User;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const validationErrors = error.response?.data?.errors || {};
        const errorMessages = Object.values(validationErrors)
          .flat()
          .filter((msg) => typeof msg === 'string');
        const errorMessage = errorMessages.join('\n');

        toast({
          title: 'Registration failed',
          description: errorMessage || 'Validation failed',
          variant: 'destructive',
        });
        throw new Error(errorMessage || 'Validation failed');
      } else {
        console.error('Error registering:', error);

        toast({
          title: 'Registration failed',
          description: 'Please check your credentials and try again',
          variant: 'destructive',
        });

        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      authService.logout();
    } catch (error) {
      console.error('API logout failed:', error);
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem('token');

    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading && <Loader fullPage />}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
