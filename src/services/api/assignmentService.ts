
import { get, post } from "./apiClient";

interface AssignmentData {
  title: string;
  description?: string;
  type?: string;
  max_score?: number;
  due_date?: string;
  questions?: Array<{
    question: string;
    type: string;
    points: number;
    order: number;
    options?: Array<{
      text: string;
      is_correct: boolean;
    }>;
  }>;
}

interface GradeAssignmentData {
  submission_id: number;
  score: number;
  feedback?: string;
}

export const assignmentService = {
  getCourseAssignments: (courseId: string) => {
    return get(`/courses/${courseId}/assignments`);
  },
  
  getAssignment: (courseId: string, assignmentId: string) => {
    return get(`/courses/${courseId}/assignments/${assignmentId}`);
  },
  
  createAssignment: (courseId: string, data: AssignmentData) => {
    return post(`/courses/${courseId}/assignments`, data);
  },
  
  gradeAssignment: (courseId: string, assignmentId: string, data: GradeAssignmentData) => {
    return post(`/courses/${courseId}/assignments/${assignmentId}/grade`, data);
  }
};
