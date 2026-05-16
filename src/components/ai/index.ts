// AI Components barrel export
// Re-export all AI components from this file

// Common
export { MarkdownRenderer } from './Common/MarkdownRenderer';

// Common
export { PermissionDenied } from './Common/PermissionDenied';
export type { PermissionDeniedProps } from './Common/PermissionDenied';

// Common
export { RateLimitAlert } from './Common/RateLimitAlert';

// Common
export { LoadingSkeletons } from './Common/LoadingSkeletons';

// Common
export { default as AiErrorBoundary } from './Common/ErrorBoundary';
export type { AiErrorBoundaryProps } from './Common/ErrorBoundary';

// Common – AI-specific loading fallback for Suspense boundaries
export { AiLoadingFallback } from './Common/AiLoadingFallback';

// StudentQA
export { ConversationHistory } from './StudentQA/ConversationHistory';

// StudentQA
export { AskAiComponent } from './StudentQA/AskAiComponent';

// StudentQA
export { StreamingResponse } from './StudentQA/StreamingResponse';

// TeacherTools
export { PreGradeReview } from './TeacherTools/PreGradeReview';

// TeacherTools
export { QuestionEnhancer } from './TeacherTools/QuestionEnhancer';

// TeacherTools
export { AssignmentGenerator } from './TeacherTools/AssignmentGenerator';
export type { AssignmentGeneratorProps } from './TeacherTools/AssignmentGenerator';

// AdminDashboard
export { AiUsageStatistics } from './AdminDashboard/AiUsageStatistics';

// Integrations
export { LessonPageIntegration } from './Integrations/LessonPageIntegration';
export type { LessonPageIntegrationProps } from './Integrations/LessonPageIntegration';

// Integrations
export { AssignmentPageIntegration } from './Integrations/AssignmentPageIntegration';
export type { AssignmentPageIntegrationProps } from './Integrations/AssignmentPageIntegration';

// Integrations
export { SubmissionPageIntegration } from './Integrations/SubmissionPageIntegration';
export type { SubmissionPageIntegrationProps } from './Integrations/SubmissionPageIntegration';

// Integrations
export { DashboardIntegration } from './Integrations/DashboardIntegration';
export type { DashboardIntegrationProps } from './Integrations/DashboardIntegration';

// Lazy-loaded variants (React.lazy wrappers for code splitting)
// Use these when you want to defer loading a component until it is needed.
export * from './lazy';
