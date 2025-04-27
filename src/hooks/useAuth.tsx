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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Key for React Query cache
const USER_QUERY_KEY = 'currentUser';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // User data query with enabled/disabled based on token existence
  const { 
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser
  } = useQuery({
    queryKey: [USER_QUERY_KEY],
    queryFn: async () => {
      const response = await authService.getCurrentUser();
      if (!response || !response.data) {
        throw new Error('No user data received');
      }
      return response.data as User;
    },
    enabled: !!token, // Only run the query if we have a token
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1, // Retry once on failure
    refetchOnWindowFocus: false,
  });

  const isLoading = isInitializing || isLoadingUser;
  const isAdmin = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';

  // Handle initial loading and token validation
  useEffect(() => {
    if (!token) {
      setIsInitializing(false);
      return;
    }

    if (userError) {
      // If we get an error fetching the user (like a 401), clear the auth state
      console.error('Error fetching user:', userError);
      setToken(null);
      localStorage.removeItem('token');
      queryClient.removeQueries({ queryKey: [USER_QUERY_KEY] });
      setIsInitializing(false);
    } else if (user) {
      // Successfully fetched user data
      setIsInitializing(false);
    }
  }, [token, user, userError, queryClient]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await authService.login({ email, password });
      if (!response?.token) {
        throw new Error('Login failed: No token returned');
      }
      
      // Store token and trigger user data fetch
      setToken(response.token);
      localStorage.setItem('token', response.token);
      
      // Manually refetch user data after login
      const userData = await refetchUser();
      
      if (!userData.data) {
        throw new Error('Failed to fetch user data after login');
      }
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.data.name}!`,
      });

      console.log("userData", userData);
      

      return userData.user;
    } catch (error) {
      console.error('Error logging in:', error);

      toast({
        title: 'Error login',
        description: `Invalid email or password`,
        variant: 'destructive',
      });

      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<User> => {
    try {
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation: password,
        role: 'STUDENT',
      });
      
      if (!response?.token) {
        throw new Error('Registration failed: No token returned');
      }
      
      // Store token to enable automatic login after registration
      setToken(response.token);
      localStorage.setItem('token', response.token);
      
      // Manually fetch user data after registration
      const userData = await refetchUser();
      
      if (!userData.data) {
        throw new Error('Failed to fetch user data after registration');
      }

      toast({
        title: 'Registration successful',
        description: `Welcome to CoursePalette, ${name}!`,
      });

      return userData.data;
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
    }
  };

  const logout = () => {
    try {
      authService.logout();
    } catch (error) {
      console.error('API logout failed:', error);
    }
    // Clear auth state
    setToken(null);
    localStorage.removeItem('token');
    
    // Clear user data from React Query cache
    queryClient.removeQueries({ queryKey: [USER_QUERY_KEY] });

    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
  };

  // Function to refresh user data
  const refreshUserData = () => {
    return refetchUser();
  };

  const value = {
    user: user || null,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    isAdmin,
    isTeacher,
    isStudent,
    refreshUserData,
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
