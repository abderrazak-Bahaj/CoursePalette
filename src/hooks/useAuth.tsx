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
      
      // Check if email is not verified
      if (response.email_verified === false) {
        toast({
          title: 'Email not verified',
          description: 'Please check your email for verification link.',
          variant: 'destructive',
        });
        throw new Error('Email not verified');
      }
      
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
      
      return userData.data;
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
    password: string,
    recaptchaToken?: string
  ): Promise<User | null> => {
    try {
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation: password,
        role: 'STUDENT',
        recaptcha_token: recaptchaToken
      });
      
      // In email verification flow, we won't auto-login the user
      // We'll just show a success message and redirect to login
      toast({
        title: 'Registration successful',
        description: 'Please check your email to verify your account.',
      });

      return response.user || null;
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

  // Email verification methods
  const verifyEmail = async (id: string, hash: string) => {
    try {
      const response = await authService.verifyEmail(id, hash);
      toast({
        title: 'Email verified',
        description: 'Your email has been verified successfully. You can now log in.',
      });
      return response;
    } catch (error) {
      console.error('Error verifying email:', error);
      toast({
        title: 'Verification failed',
        description: 'Unable to verify your email. Please try again or contact support.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      await authService.resendVerificationEmail(email);
      toast({
        title: 'Verification email sent',
        description: 'Please check your email for the verification link.',
      });
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast({
        title: 'Failed to resend',
        description: 'Unable to resend verification email. Please try again later.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Password reset methods
  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
      toast({
        title: 'Password reset email sent',
        description: 'Please check your email for password reset instructions.',
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast({
        title: 'Request failed',
        description: 'Unable to send password reset email. Please try again later.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const resetPassword = async (token: string, email: string, password: string, passwordConfirmation: string) => {
    try {
      await authService.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      
      toast({
        title: 'Password reset successful',
        description: 'Your password has been reset. You can now log in with your new password.',
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Reset failed',
        description: 'Unable to reset your password. Please try again or request a new reset link.',
        variant: 'destructive',
      });
      throw error;
    }
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
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
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
