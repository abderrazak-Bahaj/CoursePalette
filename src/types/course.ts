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

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'OTHER';
  url?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  course_id: string;
  lesson_id: string;
  order: number;
  is_preview?: boolean;
  created_at: string;
  updated_at: string;
  file_size_formatted?: string;
  is_document: boolean;
  is_video: boolean;
  is_link: boolean;
}

export interface AssignmentOption {
  id: string;
  assignment_question_id?: string;
  question_id?: string;
  text?: string;
  option_text?: string;
  is_correct: boolean;
  order?: number;
  created_at: string;
  updated_at: string;
}

export interface AssignmentQuestion {
  id: string;
  assignment_id: string;
  question?: string;
  question_text?: string;
  type?: string;
  question_type?: string;
  points?: number;
  order?: number;
  created_at: string;
  updated_at: string;
  options?: AssignmentOption[];
  is_multiple_choice: boolean;
  is_true_false: boolean;
  is_essay: boolean;
}

export interface SubmissionAnswer {
  id: string;
  submission_id: string;
  question_id: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  assignment_id: string;
  content?: string;
  score?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'GRADED' | 'RESUBMITTED';
  submission_time?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  answers?: SubmissionAnswer[];
  user?: any;
  assignment?: Assignment;
  grader?: any;
  score_percentage?: number;
  is_draft: boolean;
  is_submitted: boolean;
  is_graded: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  course_id: string;
  due_date?: string;
  max_score?: number;
  status?: string;
  type: 'QUIZ' | 'ESSAY' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MATCHING';
  created_at: string;
  updated_at: string;
  is_overdue: boolean;
  is_active: boolean;
  questions?: AssignmentQuestion[];
  submissions?: Submission[];
  course?: Course;
  lesson?: Lesson;
  questions_count?: number;
  submissions_count?: number;
  user_submission?: Submission;
}

export interface UserProgress {
  id: string;
  user_id?: string;
  course_id: string;
  lesson_id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  started_at?: string;
  completed_at?: string;
  watch_time: number;
  last_position: number;
  created_at: string;
  updated_at: string;
  watch_time_formatted: string;
  progress_percentage: number;
  is_not_started: boolean;
  is_in_progress: boolean;
  is_completed: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  duration_readable?: string;
  videoUrl?: string;
  video_url?: string;
  isPreview?: boolean;
  completed?: boolean;
  content?: string;
  description?: string;
  order?: number;
  is_completed?: boolean;
  section?: number;
  course_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  last_position?: number;
  resources?: Resource[];
  assignments?: Assignment[];
  user_progress?: UserProgress;
  course?: Course;
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
