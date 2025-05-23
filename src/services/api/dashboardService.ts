import { get } from './apiClient';

export interface DashboardStatistics {
  overview: {
    total_courses: number;
    total_students: number;
    total_teachers: number;
    total_enrollments: number;
    total_revenue: number;
  };
  monthly_stats: Array<{
    month: string;
    total_invoices: number;
    total_revenue: number;
  }>;
  top_courses: Array<{
    id: string;
    title: string;
    enrollments_count: number;
  }>;
  enrollment_trends: Array<{
    month: string;
    total_enrollments: number;
  }>;
  recent_enrollments: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    course: {
      id: string;
      title: string;
    };
    created_at: string;
  }>;
  teacher_performance: Array<{
    id: string;
    name: string;
    courses_count: number;
    total_enrollments: number;
    courses_avg_rating: number;
  }>;
}

export interface TeacherStatistics {
  overview: {
    total_courses: number;
    total_enrollments: number;
    average_rating: number;
  };
  monthly_revenue: Array<{
    month: string;
    total_revenue: string;
  }>;
  top_courses: Array<{
    id: string;
    title: string;
    description: string;
    image_url: string;
    price: string;
    status: string;
    category_id: string;
    teacher_id: string;
    level: string;
    skills: string;
    language: string;
    duration: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    enrollments_count: number;
    category?: {
      id: string;
      name: string;
    };
  }>;
  recent_enrollments: Array<{
    id: string;
    student_id: string;
    status: string;
    course_id: string;
    enrolled_at: string;
    completed_at: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    student: {
      id: string;
      name: string;
      avatar: string | null;
      email: string;
      phone: string;
      address: string;
      bio: string | null;
      email_verified_at: string;
      role: string;
      status: string;
      last_login_at: string;
      deleted_at: string | null;
      created_at: string;
      updated_at: string;
    };
    course: {
      id: string;
      title: string;
      description: string;
      image_url: string;
      price: string;
      status: string;
      category_id: string;
      teacher_id: string;
      level: string;
      skills: string;
      language: string;
      duration: number;
      deleted_at: string | null;
      created_at: string;
      updated_at: string;
      category?: {
        id: string;
        name: string;
      };
    };
  }>;
}

export const dashboardService = {
  getStatistics: async (): Promise<DashboardStatistics> => {
    const response = await get('/dashboard/statistics');
    return response;
  },

  getTeacherStatistics: async (): Promise<TeacherStatistics> => {
    try {
      const response = await get('/dashboard/teacher-statistics');
      if (!response) {
        return {
          overview: {
            total_courses: 0,
            total_enrollments: 0,
            average_rating: 0
          },
          monthly_revenue: [],
          top_courses: [],
          recent_enrollments: []
        };
      }
      return response;
    } catch (error) {
      console.error('Error fetching teacher statistics:', error);
      return {
        overview: {
          total_courses: 0,
          total_enrollments: 0,
          average_rating: 0
        },
        monthly_revenue: [],
        top_courses: [],
        recent_enrollments: []
      };
    }
  },
}; 