export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  email_verified_at: string;
  profileUrl?: string;
  teacher?: {
    specialization: string;
    qualification: string;
    expertise: string;
    education: Array<{degree: string, institution: string, year: number}>;
    certifications: Array<{name: string, year: number}>;
    years_of_experience: number;
  };
  admin?: {
    department: string;
    position: string;
  };
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category_id: number;
  price: string;
  image_url: string;
  duration: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration_readable: string;
  skills: string;
  language: string;
  status: 'PUBLISHED' | 'DRAFT' | string;
  start_date: string | null;
  end_date: string | null;
  max_students: number | null;
  created_at: string;
  updated_at: string;
  has_available_spots: boolean;
  is_active: boolean;
}

export interface Enrollment {
  id: number;
  user_id: number | null;
  course_id: number;
  status: string | null;
  enrolled_at: string;
  completed_at: string | null;
  grade: number | null;
  certificate_issued_at: string | null;
  created_at: string;
  updated_at: string;
  course: Course;
  progress_percentage: number;
  is_completed: boolean;
  has_certificate: boolean;
}

export interface Progress {
  percentage: number;
  completed_lessons: number;
  total_lessons: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<User | null>;
  logout: () => void;
  refreshUserData: () => Promise<any>;
}
