export interface Course {
  id: string;
  title: string;
  instructor: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: number;
  category: string;
  level: string;
  description?: string;
  lessons?: Lesson[];
  duration?: string;
  enrolledCount?: number;
  skills?: string[];
  lastUpdated?: string;
  language?: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  isPreview?: boolean;
  completed?: boolean;
  content?: string;
  description?: string;
  order?: number;
  is_completed?: boolean;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

export interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  courseId: string;
  courseName: string;
  image: string;
}
