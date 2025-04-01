
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/services/api/authService";


interface User {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  avatar: string | null;
  bio?: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}






const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);  
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getMe = async () => {
      const user = await authService.getCurrentUser();
      setUser(user);

    }
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      getMe();
    }
    setIsLoading(false);
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
      localStorage.setItem("token", response.token);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
      
      return user;
    } catch (error) {
      console.error("Error logging in:", error);
      
      toast({
        title: "Error login",
        description: `Invalid email or password`,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation: password,
        role: "STUDENT"
      });

      const newUser = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        profileUrl: response.user.profile_url || `https://ui-avatars.com/api/?name=${name.split(' ').join('+')}&background=0D8ABC&color=fff`,
        isAdmin: response.user.role === "ADMIN",
        token: response.token,
      };

      setUser(newUser);

      toast({
        title: "Registration successful",
        description: `Welcome to CoursePalette, ${name}!`,
      });

    } catch (error) {
      // Fall back to mock data if API fails
      console.error("API registration failed, using mock data:", error);

      const existingUser = MOCK_USERS.find((u) => u.email === email);

      if (existingUser) {
        setIsLoading(false);
        throw new Error("Email is already in use");
      }

      // In a real app, we would create a new user in the database
      const newUser = {
        id: `${MOCK_USERS.length + 1}`,
        name,
        email,
        profileUrl: `https://ui-avatars.com/api/?name=${name.split(' ').join('+')}&background=0D8ABC&color=fff`,
        isAdmin: false,
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));

      toast({
        title: "Registration successful (mock)",
        description: `Welcome to CoursePalette, ${name}!`,
      });
    }

    setIsLoading(false);
  };

  const logout = () => {
    try {
      authService.logout();
    } catch (error) {
      console.error("API logout failed:", error);
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem("token");

    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
