/**
 * Lazy-loaded AI component exports
 *
 * This module provides React.lazy() wrappers for all AI components that are
 * NOT immediately visible on page load. Importing from this file instead of
 * the direct component paths ensures each component is placed in its own
 * async chunk by the bundler (Vite), so the main bundle stays lean.
 *
 * Usage:
 * ```tsx
 * import { LazyAskAiComponent, LazyConversationHistory } from '@/components/ai/lazy';
 * import { AiLoadingFallback } from '@/components/ai/Common/AiLoadingFallback';
 *
 * <Suspense fallback={<AiLoadingFallback variant="panel" />}>
 *   <LazyAskAiComponent courseId={courseId} lessonId={lessonId} />
 * </Suspense>
 * ```
 *
 * @see Requirements 22 (Performance Optimization – Lazy Loading and Memoization)
 */

import { lazy } from 'react';

// ---------------------------------------------------------------------------
// Student Q&A
// ---------------------------------------------------------------------------

/**
 * Lazy-loaded AskAiComponent.
 * Loaded on demand when the AI assistant panel is first opened.
 */
export const LazyAskAiComponent = lazy(() =>
  import('./StudentQA/AskAiComponent').then((m) => ({
    default: m.AskAiComponent,
  }))
);

/**
 * Lazy-loaded ConversationHistory.
 * Loaded on demand when the History tab is first activated.
 */
export const LazyConversationHistory = lazy(() =>
  import('./StudentQA/ConversationHistory').then((m) => ({
    default: m.ConversationHistory,
  }))
);

/**
 * Lazy-loaded StreamingResponse.
 * Loaded on demand when a streaming Q&A response begins.
 */
export const LazyStreamingResponse = lazy(() =>
  import('./StudentQA/StreamingResponse').then((m) => ({
    default: m.StreamingResponse,
  }))
);

// ---------------------------------------------------------------------------
// Teacher Tools
// ---------------------------------------------------------------------------

/**
 * Lazy-loaded AssignmentGenerator.
 * Loaded on demand when the teacher opens the generation form.
 */
export const LazyAssignmentGenerator = lazy(() =>
  import('./TeacherTools/AssignmentGenerator').then((m) => ({
    default: m.AssignmentGenerator,
  }))
);

/**
 * Lazy-loaded QuestionEnhancer.
 * Loaded on demand when the teacher clicks "Enhance with AI".
 */
export const LazyQuestionEnhancer = lazy(() =>
  import('./TeacherTools/QuestionEnhancer').then((m) => ({
    default: m.QuestionEnhancer,
  }))
);

/**
 * Lazy-loaded PreGradeReview.
 * Loaded on demand when the teacher expands the pre-grade panel.
 */
export const LazyPreGradeReview = lazy(() =>
  import('./TeacherTools/PreGradeReview').then((m) => ({
    default: m.PreGradeReview,
  }))
);

// ---------------------------------------------------------------------------
// Admin Dashboard
// ---------------------------------------------------------------------------

/**
 * Lazy-loaded AiUsageStatistics.
 * Loaded on demand when the admin navigates to the statistics section.
 */
export const LazyAiUsageStatistics = lazy(() =>
  import('./AdminDashboard/AiUsageStatistics').then((m) => ({
    default: m.AiUsageStatistics,
  }))
);

// ---------------------------------------------------------------------------
// Integration components
// ---------------------------------------------------------------------------

/**
 * Lazy-loaded LessonPageIntegration.
 * Loaded on demand — the AI assistant is not visible on initial lesson render.
 */
export const LazyLessonPageIntegration = lazy(() =>
  import('./Integrations/LessonPageIntegration').then((m) => ({
    default: m.LessonPageIntegration,
  }))
);

/**
 * Lazy-loaded AssignmentPageIntegration.
 * Loaded on demand when the teacher views an assignment question.
 */
export const LazyAssignmentPageIntegration = lazy(() =>
  import('./Integrations/AssignmentPageIntegration').then((m) => ({
    default: m.AssignmentPageIntegration,
  }))
);

/**
 * Lazy-loaded SubmissionPageIntegration.
 * Loaded on demand when the teacher opens a submission for review.
 */
export const LazySubmissionPageIntegration = lazy(() =>
  import('./Integrations/SubmissionPageIntegration').then((m) => ({
    default: m.SubmissionPageIntegration,
  }))
);

/**
 * Lazy-loaded DashboardIntegration.
 * Loaded on demand when the admin navigates to the dashboard statistics tab.
 */
export const LazyDashboardIntegration = lazy(() =>
  import('./Integrations/DashboardIntegration').then((m) => ({
    default: m.DashboardIntegration,
  }))
);
