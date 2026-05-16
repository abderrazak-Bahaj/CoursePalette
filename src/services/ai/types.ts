/**
 * TypeScript interfaces for the AI Learning Assistant API.
 *
 * Covers all request/response payloads, component props, and state management
 * objects for the six AI endpoints:
 *   - POST /api/courses/{course}/lessons/{lesson}/ai/ask
 *   - GET  /api/courses/{course}/lessons/{lesson}/ai/history
 *   - DELETE /api/courses/{course}/lessons/{lesson}/ai/history
 *   - POST /api/courses/{course}/assignments/generate
 *   - POST /api/courses/{course}/assignments/{assignment}/questions/{question}/enhance
 *   - POST /api/courses/{course}/assignments/{assignment}/submissions/{submission}/pregrade
 *   - GET  /api/admin/ai/usage
 *
 * @see Requirements 1, 20
 */

// ---------------------------------------------------------------------------
// Shared / Generic
// ---------------------------------------------------------------------------

/**
 * Generic wrapper for a single-item API response.
 * Most AI endpoints return `{ data: T }`.
 */
export interface AiApiResponse<T> {
  data: T;
}

/**
 * Generic wrapper for a paginated API response.
 */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

// ---------------------------------------------------------------------------
// AI Message (Student Q&A)
// ---------------------------------------------------------------------------

/** Role of a conversation participant. */
export type AiMessageRole = 'user' | 'assistant';

/**
 * A single message in a student–AI conversation.
 * Matches the shape returned by AiMessageResource and the ask endpoint.
 */
export interface AiMessage {
  /** Unique message identifier. */
  id: string | number;
  /** Who sent the message. */
  role: AiMessageRole;
  /** Markdown-formatted message content. */
  content: string;
  /** ISO 8601 timestamp. */
  created_at: string;
  /**
   * Disclaimer shown for assistant messages only.
   * Present when role === 'assistant'.
   */
  disclaimer?: string;
}

/**
 * Paginated list of conversation messages returned by the history endpoint.
 */
export interface PaginatedMessages {
  data: AiMessage[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

// ---------------------------------------------------------------------------
// Streaming (SSE)
// ---------------------------------------------------------------------------

/**
 * A single Server-Sent Event chunk received during streaming.
 * The `chunk` event carries `{ delta: string }`.
 */
export interface StreamChunk {
  delta: string;
}

/**
 * The final `done` SSE event payload that closes the stream.
 */
export interface StreamDoneEvent {
  id: string | number;
  content: string;
}

// ---------------------------------------------------------------------------
// Ask AI – Request / Response
// ---------------------------------------------------------------------------

/**
 * Request body for POST /api/courses/{course}/lessons/{lesson}/ai/ask
 */
export interface AskAiRequest {
  /** The student's question (max 2000 characters). */
  question: string;
  /** Whether to use Server-Sent Events streaming. Defaults to false. */
  stream?: boolean;
}

/**
 * Non-streaming response from the ask endpoint.
 * Wrapped in `{ data: AiMessage }`.
 */
export type AskAiResponse = AiApiResponse<AiMessage>;

// ---------------------------------------------------------------------------
// Conversation History – Request / Response
// ---------------------------------------------------------------------------

/**
 * Query parameters for GET /api/courses/{course}/lessons/{lesson}/ai/history
 */
export interface GetHistoryParams {
  /** Number of messages per page. Defaults to 20. */
  per_page?: number;
  /** Page number for pagination. */
  page?: number;
}

/**
 * Response from the history endpoint.
 * Wrapped in `{ data: AiMessage[] }`.
 */
export type GetHistoryResponse = AiApiResponse<AiMessage[]>;

/**
 * Response from DELETE /api/courses/{course}/lessons/{lesson}/ai/history
 */
export interface ClearHistoryResponse {
  message: string;
  deleted_count: number;
}

// ---------------------------------------------------------------------------
// Assignment Generation
// ---------------------------------------------------------------------------

/** Difficulty level for AI-generated assignments. */
export type AssignmentDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Request body for POST /api/courses/{course}/assignments/generate
 */
export interface GenerateAssignmentParams {
  /** ID of the lesson to base the assignment on. */
  lesson_id: string | number;
  /** Number of questions to generate (5–10). */
  num_questions: number;
  /** Maximum total score for the assignment. */
  max_score: number;
  /** Difficulty level. Defaults to 'medium'. */
  difficulty?: AssignmentDifficulty;
}

/**
 * A single option within a generated question.
 */
export interface GeneratedOption {
  /** Option text. */
  text: string;
  /** Whether this option is the correct answer. */
  is_correct: boolean;
}

/**
 * A single question within a generated assignment.
 */
export interface GeneratedQuestion {
  /** Question text. */
  text: string;
  /** Question type (e.g. 'multiple_choice', 'true_false', 'essay'). */
  type: string;
  /** Points awarded for a correct answer. */
  points: number;
  /** Answer options (empty for essay questions). */
  options: GeneratedOption[];
}

/**
 * The full generated assignment returned by the generation endpoint.
 * Wrapped in `{ data: GeneratedAssignment }`.
 */
export interface GeneratedAssignment {
  /** Unique identifier for this generation session. */
  generation_id: string;
  /** ID of the lesson the assignment was generated from. */
  lesson_id: string | number;
  /** Grading rubric / instructions for the teacher. */
  rubric: string;
  /** Generated questions. */
  questions: GeneratedQuestion[];
}

/** API response wrapper for assignment generation. */
export type GenerateAssignmentResponse = AiApiResponse<GeneratedAssignment>;

// ---------------------------------------------------------------------------
// Question Enhancement
// ---------------------------------------------------------------------------

/**
 * The original question fields returned in the enhancement response.
 */
export interface OriginalQuestion {
  /** Original question text. */
  question: string;
  /** Original answer options. */
  options: Array<{ text: string; is_correct: boolean }>;
  /** Original point value. */
  points: number;
}

/**
 * AI-suggested improvements for a question.
 */
export interface SuggestedQuestion {
  /** Improved question text. */
  improved_question: string;
  /** Improved answer options. */
  improved_options: Array<{ text: string; is_correct: boolean }>;
  /** Suggested point value. */
  suggested_points: number;
  /** Alternative question formats suggested by the AI. */
  alternative_formats: string[];
}

/**
 * A field that can be individually accepted or rejected during enhancement.
 */
export type EnhancedField = 'question' | 'options' | 'points';

/**
 * The full enhancement result returned by the enhance endpoint.
 * Wrapped in `{ data: QuestionEnhancement }`.
 */
export interface QuestionEnhancement {
  /** The original question data. */
  original: OriginalQuestion;
  /** AI-suggested improvements. */
  suggested: SuggestedQuestion;
  /** Explanation of why the changes were suggested. */
  rationale: string;
}

/** API response wrapper for question enhancement. */
export type EnhanceQuestionResponse = AiApiResponse<QuestionEnhancement>;

// ---------------------------------------------------------------------------
// Pre-Grade
// ---------------------------------------------------------------------------

/**
 * Per-answer scoring detail within a pre-grade result.
 * @alias PreGradeQuestion (kept for backwards compatibility with barrel export)
 */
export interface PreGradeAnswer {
  /** ID of the question being scored. */
  question_id: string | number;
  /** Score awarded for this answer. */
  score: number;
  /** Markdown-formatted feedback for this answer. */
  feedback: string;
}

/**
 * Alias for PreGradeAnswer — used in the barrel export for consistency.
 */
export type PreGradeQuestion = PreGradeAnswer;

/**
 * The full pre-grade result.
 * The pre-grade endpoint returns 202 Accepted (job queued).
 * The actual pre-grade data is fetched separately from the submission.
 */
export interface PreGrade {
  /** ID of the submission that was pre-graded. */
  submission_id: string | number;
  /** Total score awarded by the AI. */
  total_score: number;
  /** Maximum possible score. */
  max_score: number;
  /** Markdown-formatted overall summary feedback. */
  summary: string;
  /** Per-answer scoring breakdown. */
  per_answer: PreGradeAnswer[];
  /** ISO 8601 timestamp when the pre-grade was generated. */
  graded_at: string;
}

/**
 * Response from POST /api/courses/{course}/assignments/{assignment}/submissions/{submission}/pregrade
 * Returns 202 Accepted – the job is queued, not the pre-grade itself.
 */
export interface PreGradeJobResponse {
  message: string;
  submission_id: string | number;
}

// ---------------------------------------------------------------------------
// Usage Statistics (Admin)
// ---------------------------------------------------------------------------

/**
 * Query parameters for GET /api/admin/ai/usage
 */
export interface UsageFilters {
  /** Number of days to include (max 90). Defaults to 30. */
  days?: number;
}

/**
 * Daily usage metrics for a single day.
 */
export interface DailyUsageMetric {
  /** Date in YYYY-MM-DD format. */
  date: string;
  /** Total API requests on this day. */
  requests: number;
  /** Total input tokens consumed. */
  tokens_in: number;
  /** Total output tokens generated. */
  tokens_out: number;
  /** Average request latency in milliseconds. */
  avg_latency_ms: number;
  /** Number of errors on this day. */
  errors: number;
}

/**
 * Aggregated usage by AI feature type.
 * Derived from the daily metrics for display purposes.
 */
export interface UsageByFeature {
  qa: number;
  generation: number;
  enhancement: number;
  preGrading: number;
}

/**
 * Aggregated usage by user role.
 * Derived from the daily metrics for display purposes.
 */
export interface UsageByRole {
  student: number;
  teacher: number;
  admin: number;
}

/**
 * A single data point for a time-series chart.
 */
export interface UsageOverTime {
  /** Date label (YYYY-MM-DD, week, or month depending on grouping). */
  label: string;
  /** Number of requests in this period. */
  requests: number;
}

/**
 * Full usage statistics response from GET /api/admin/ai/usage
 */
export interface UsageStatistics {
  /** Daily breakdown for the requested period. */
  data: DailyUsageMetric[];
  /** Sum of all requests in the period. */
  total_requests: number;
  /** Sum of all input tokens in the period. */
  total_tokens_in: number;
  /** Sum of all output tokens in the period. */
  total_tokens_out: number;
  /** Sum of all errors in the period. */
  total_errors: number;
  /** Number of days included in the response. */
  period_days: number;
}

// ---------------------------------------------------------------------------
// Component Props
// ---------------------------------------------------------------------------

/**
 * Props for the AskAiComponent (student Q&A input + streaming display).
 */
export interface AskAiComponentProps {
  /** ID of the course the lesson belongs to. */
  courseId: string | number;
  /** ID of the lesson being studied. */
  lessonId: string | number;
  /** Optional CSS class name for the container. */
  className?: string;
}

/**
 * Props for the ConversationHistory component.
 */
export interface ConversationHistoryProps {
  /** ID of the course the lesson belongs to. */
  courseId: string | number;
  /** ID of the lesson whose history to display. */
  lessonId: string | number;
  /** Optional CSS class name for the container. */
  className?: string;
}

/**
 * Props for the StreamingResponse component.
 */
export interface StreamingResponseProps {
  /** Accumulated markdown content to render. */
  content: string;
  /** Whether the stream is still active. */
  isStreaming: boolean;
  /** Optional CSS class name for the container. */
  className?: string;
}

/**
 * Props for the AssignmentGenerator component (teacher tool).
 */
export interface AssignmentGeneratorProps {
  /** ID of the course to generate an assignment for. */
  courseId: string | number;
  /** Callback invoked when the teacher saves the generated assignment. */
  onSave?: (assignment: GeneratedAssignment) => void;
  /** Optional CSS class name for the container. */
  className?: string;
}

/**
 * Props for the QuestionEnhancer component (teacher tool).
 */
export interface QuestionEnhancerProps {
  /** ID of the course. */
  courseId: string | number;
  /** ID of the assignment containing the question. */
  assignmentId: string | number;
  /** ID of the question to enhance. */
  questionId: string | number;
  /** Callback invoked when the teacher saves the enhanced question. */
  onSave?: () => void;
  /** Optional CSS class name for the container. */
  className?: string;
}

/**
 * Props for the PreGradeReview component (teacher tool).
 */
export interface PreGradeReviewProps {
  /** ID of the course. */
  courseId: string | number;
  /** ID of the assignment. */
  assignmentId: string | number;
  /** ID of the submission to display the pre-grade for. */
  submissionId: string | number;
  /** Callback invoked when the teacher saves the final grade. */
  onGradeSaved?: (score: number) => void;
  /** Optional CSS class name for the container. */
  className?: string;
}

/**
 * Props for the AiUsageStatistics component (admin dashboard).
 */
export interface AiUsageStatisticsProps {
  /** Optional CSS class name for the container. */
  className?: string;
}

/**
 * Props for the MarkdownRenderer component.
 */
export interface MarkdownRendererProps {
  /** Markdown string to render. */
  content: string;
  /** Whether to apply streaming-optimised rendering (debounced). */
  isStreaming?: boolean;
  /** Optional CSS class name for the container. */
  className?: string;
}

/**
 * Props for the RateLimitAlert component.
 */
export interface RateLimitAlertProps {
  /** Unix timestamp (seconds) or ISO string when the rate limit resets. */
  retryAfter: number | string;
  /** Callback invoked when the user dismisses the alert. */
  onDismiss?: () => void;
  /** Optional CSS class name for the container. */
  className?: string;
}

/**
 * Props for the LoadingSkeletons component.
 */
export interface LoadingSkeletonsProps {
  /** Number of skeleton rows to render. */
  count?: number;
  /** Visual variant matching the content being loaded. */
  variant?: 'message' | 'question' | 'statistics' | 'generic';
  /** Optional CSS class name for the container. */
  className?: string;
}

// ---------------------------------------------------------------------------
// State Management Objects
// ---------------------------------------------------------------------------

/**
 * State shape managed by the useAiConversation hook.
 */
export interface AiConversationState {
  /** All messages in the current conversation (user + assistant). */
  messages: AiMessage[];
  /** Whether a request is in flight. */
  isLoading: boolean;
  /** Whether the streaming response is still arriving. */
  isStreaming: boolean;
  /** The current error, if any. */
  error: Error | null;
  /** Rate-limit reset time (Unix seconds), if the user is rate-limited. */
  rateLimitRetryAfter: number | null;
  /** Current pagination page for history. */
  currentPage: number;
  /** Whether there are more history pages to load. */
  hasMorePages: boolean;
}

/**
 * State shape managed by the useAssignmentGeneration hook.
 */
export interface AssignmentGenerationState {
  /** The most recently generated assignment, or null if none. */
  generatedAssignment: GeneratedAssignment | null;
  /** Whether generation is in progress. */
  isGenerating: boolean;
  /** The current error, if any. */
  error: Error | null;
  /** Rate-limit reset time (Unix seconds), if the teacher is rate-limited. */
  rateLimitRetryAfter: number | null;
}

/**
 * State shape managed by the useQuestionEnhancement hook.
 */
export interface QuestionEnhancementState {
  /** The enhancement result, or null if none. */
  enhancement: QuestionEnhancement | null;
  /** Whether enhancement is in progress. */
  isEnhancing: boolean;
  /** The current error, if any. */
  error: Error | null;
  /** Fields the teacher has accepted (will use suggested value). */
  acceptedFields: Set<EnhancedField>;
  /** Fields the teacher has rejected (will keep original value). */
  rejectedFields: Set<EnhancedField>;
}

/**
 * State shape managed by the usePreGrade hook.
 */
export interface PreGradeState {
  /** The pre-grade result, or null if not yet loaded. */
  preGrade: PreGrade | null;
  /** Whether a fetch or re-grade is in progress. */
  isLoading: boolean;
  /** The current error, if any. */
  error: Error | null;
  /** Teacher-overridden score (null means accept AI score). */
  overrideScore: number | null;
  /** Teacher's rationale for overriding the score. */
  overrideRationale: string;
}

/**
 * State shape managed by the useAiUsageStatistics hook.
 */
export interface UsageStatisticsState {
  /** The fetched statistics, or null if not yet loaded. */
  statistics: UsageStatistics | null;
  /** Whether a fetch is in progress. */
  isLoading: boolean;
  /** The current error, if any. */
  error: Error | null;
  /** Currently applied filters. */
  filters: UsageFilters;
}

// ---------------------------------------------------------------------------
// Authorization
// ---------------------------------------------------------------------------

/**
 * AI feature identifiers used for role-based access control checks.
 */
export type AiFeature =
  | 'qa'
  | 'history'
  | 'generation'
  | 'enhancement'
  | 'preGrading'
  | 'statistics';

/**
 * Return type of the useAiAuth hook.
 */
export interface AiAuthState {
  /** Student can ask questions (enrolled + lesson published). */
  canAsk: boolean;
  /** Teacher can generate assignments (teaches the course). */
  canGenerate: boolean;
  /** Teacher can enhance questions (teaches the course). */
  canEnhance: boolean;
  /** Teacher can view pre-grades (teaches the course). */
  canPreGrade: boolean;
  /** Admin can view usage statistics. */
  canViewStats: boolean;
  /** Generic check for any feature. */
  isAuthorized: (feature: AiFeature) => boolean;
}
