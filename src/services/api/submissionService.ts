
import { get, post } from "./apiClient";

interface SubmissionData {
  status?: string;
  answers?: Array<{
    question_id: number;
    answer: string;
  }>;
}

export const submissionService = {
  getAssignmentSubmissions: (courseId: string, assignmentId: string) => {
    return get(`/courses/${courseId}/assignments/${assignmentId}/submissions`);
  },
  
  getSubmission: (courseId: string, assignmentId: string, submissionId: string) => {
    return get(`/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}`);
  },
  
  createSubmission: (courseId: string, assignmentId: string, data: SubmissionData) => {
    return post(`/courses/${courseId}/assignments/${assignmentId}/submissions`, data);
  },
  
  submitAssignment: (courseId: string, assignmentId: string, submissionId: string) => {
    return post(`/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/submit`);
  }
};
