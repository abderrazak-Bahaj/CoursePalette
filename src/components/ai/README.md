# AI Integration — CoursePalette Frontend

This document covers the architecture, directory structure, and usage of the AI Learning Assistant integration in the CoursePalette React frontend.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Environment Variables](#environment-variables)
4. [API Client Usage](#api-client-usage)
5. [Hook Usage](#hook-usage)
6. [Component Usage](#component-usage)
7. [Error Handling](#error-handling)
8. [Streaming Responses](#streaming-responses)
9. [Authorization](#authorization)
10. [State Management](#state-management)

---

## Architecture Overview

The AI integration follows a strict layered architecture that separates concerns across four layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Components Layer                       │
│  (StudentQA, TeacherTools, AdminDashboard, Integrations)    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              State Management Layer (Hooks)                  │
│  (useAiConversation, useAssignmentGeneration, etc.)         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Client Layer                           │
│  (aiApiClient — typed methods for all six endpoints)        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              HTTP Transport & Utilities                      │
│  (streamingHandler, retryHandler, authorizationHandler)     │
└─────────────────────────────────────────────────────────────┘
```

**Key design decisions:**

- All AI API calls go through the singleton `aiApiClient` — never call `fetch` directly from components.
- State is managed exclusively via custom hooks — components receive data and callbacks as props or hook return values.
- Streaming responses use the Fetch API with `ReadableStream` (not the `EventSource` API) so that POST requests with a body can be streamed.
- Authorization is checked client-side before making API calls to avoid unnecessary network requests; the backend enforces authorization independently.
- The `retryHandler` wraps transient failures with exponential backoff (200 ms → 800 ms → 3 200 ms). It never retries 401, 403, or 429 errors.

---

## Directory Structure

```
src/
├── services/ai/
│   ├── aiApiClient.ts          # Singleton API client (all six endpoints)
│   ├── types.ts                # TypeScript interfaces for requests/responses/props
│   ├── errors.ts               # Custom error classes (AiApiError hierarchy)
│   ├── config.ts               # Environment variable reading + feature flags
│   └── index.ts                # Barrel export
│
├── hooks/ai/
│   ├── useAiConversation.ts    # Student Q&A conversation state + localStorage
│   ├── useAssignmentGeneration.ts  # Teacher assignment generation state
│   ├── useQuestionEnhancement.ts   # Teacher question enhancement state
│   ├── usePreGrade.ts          # Teacher pre-grade review state
│   ├── useAiAuth.ts            # Role-based authorization checks
│   └── index.ts                # Barrel export
│
├── context/
│   └── AiContext.tsx           # Shared AI context provider (wraps the app)
│
├── components/ai/
│   ├── StudentQA/
│   │   ├── AskAiComponent.tsx      # Question input + streaming response display
│   │   ├── ConversationHistory.tsx # Paginated history list + clear button
│   │   └── StreamingResponse.tsx   # Real-time markdown rendering
│   ├── TeacherTools/
│   │   ├── AssignmentGenerator.tsx # Generation form + editable result
│   │   ├── QuestionEnhancer.tsx    # Side-by-side comparison + accept/reject
│   │   └── PreGradeReview.tsx      # Pre-grade display + score override
│   ├── AdminDashboard/
│   │   └── AiUsageStatistics.tsx   # Usage metrics + bar chart
│   ├── Common/
│   │   ├── ErrorBoundary.tsx       # React error boundary for AI components
│   │   ├── LoadingSkeletons.tsx    # Skeleton screens (message, history, stats)
│   │   ├── RateLimitAlert.tsx      # Rate limit countdown alert
│   │   └── MarkdownRenderer.tsx    # react-markdown with sanitization
│   └── Integrations/
│       ├── LessonPageIntegration.tsx       # Q&A sidebar on lesson page
│       ├── AssignmentPageIntegration.tsx   # Enhancement button on assignment
│       ├── SubmissionPageIntegration.tsx   # Pre-grade on submission page
│       └── DashboardIntegration.tsx        # Statistics on admin dashboard
│
└── utils/ai/
    ├── streamingHandler.ts     # SSE connection management + reconnection
    ├── retryHandler.ts         # Exponential backoff retry logic
    ├── authorizationHandler.ts # RBAC checks with 5-minute cache
    ├── performanceMonitor.ts   # Core Web Vitals + operation timing
    ├── debounce.ts             # debounce() + useDebounce() hook
    ├── memoization.ts          # Memoization helpers
    └── index.ts                # Barrel export
```

---

## Environment Variables

All variables use the `VITE_` prefix (required by Vite for client-side exposure).

| Variable                      | Default                     | Description                                               |
| ----------------------------- | --------------------------- | --------------------------------------------------------- |
| `VITE_AI_API_BASE_URL`        | `http://localhost:8000/api` | Backend API base URL                                      |
| `VITE_AI_ENABLED`             | `true`                      | Master switch — set to `false` to hide all AI UI          |
| `VITE_AI_STREAMING_ENABLED`   | `true`                      | Enable SSE streaming; `false` falls back to non-streaming |
| `VITE_AI_TIMEOUT_MS`          | `30000`                     | Request timeout in milliseconds                           |
| `VITE_AI_FEATURE_QA`          | `true`                      | Enable student Q&A feature                                |
| `VITE_AI_FEATURE_GENERATION`  | `true`                      | Enable teacher assignment generation                      |
| `VITE_AI_FEATURE_ENHANCEMENT` | `true`                      | Enable teacher question enhancement                       |
| `VITE_AI_FEATURE_PRE_GRADING` | `true`                      | Enable teacher pre-grading                                |
| `VITE_AI_FEATURE_STATISTICS`  | `true`                      | Enable admin usage statistics                             |

Example `.env.local`:

```env
VITE_AI_API_BASE_URL=http://localhost:8000/api
VITE_AI_ENABLED=true
VITE_AI_STREAMING_ENABLED=true
VITE_AI_TIMEOUT_MS=30000
```

---

## API Client Usage

The `aiApiClient` singleton is the single entry point for all AI API calls. Import it from `@/services/ai/aiApiClient`.

### Student Q&A

```typescript
import { aiApiClient } from '@/services/ai/aiApiClient';

// Non-streaming — returns a resolved AiMessage
const message = await aiApiClient.askQuestion(
  courseId,
  lessonId,
  'What is React?'
);
console.log(message.content);

// Streaming — returns an AsyncGenerator<string> yielding text deltas
const stream = aiApiClient.askQuestion(
  courseId,
  lessonId,
  'What is React?',
  true
);
let accumulated = '';
for await (const delta of stream) {
  accumulated += delta;
  // update UI incrementally
}

// Fetch paginated conversation history (most recent first)
const history = await aiApiClient.getConversationHistory(
  courseId,
  lessonId,
  1,
  20
);
// history.data: AiMessage[]
// history.last_page: number

// Clear conversation history
await aiApiClient.clearConversationHistory(courseId, lessonId);
```

### Teacher Tools

```typescript
// Generate an assignment
const assignment = await aiApiClient.generateAssignment(courseId, {
  lesson_id: lessonId,
  num_questions: 5,
  max_score: 100,
  difficulty: 'medium',
});
// assignment.questions: GeneratedQuestion[]
// assignment.rubric: string

// Enhance a question
const enhancement = await aiApiClient.enhanceQuestion(
  courseId,
  assignmentId,
  questionId
);
// enhancement.original: OriginalQuestion
// enhancement.suggested: SuggestedQuestion
// enhancement.rationale: string

// Trigger AI pre-grading (returns 202 Accepted — job is queued)
await aiApiClient.preGradeSubmission(courseId, assignmentId, submissionId);

// Fetch the pre-grade result
const preGrade = await aiApiClient.getPreGrade(
  courseId,
  assignmentId,
  submissionId
);
// preGrade.total_score: number
// preGrade.answers: PreGradeAnswer[]
// preGrade.summary_feedback: string
```

### Admin Statistics

```typescript
// Fetch usage statistics (last 30 days)
const stats = await aiApiClient.getAiUsageStatistics({ days: 30 });
// stats.total_requests: number
// stats.by_feature: UsageByFeature
// stats.by_role: UsageByRole
// stats.over_time: UsageOverTime[]
```

### Cache Management

The client maintains a 5-minute in-memory deduplication cache for non-streaming Q&A requests.

```typescript
// Clear the entire cache (e.g. on logout)
aiApiClient.clearCache();

// Invalidate cache for a specific lesson (called automatically on clearConversationHistory)
aiApiClient.invalidateCache(courseId, lessonId);
```

---

## Hook Usage

Hooks encapsulate all state management. Use them in components instead of calling `aiApiClient` directly.

### `useAiConversation`

Manages conversation history for a student–AI session scoped to a lesson. Persists to `localStorage`.

```tsx
import { useAiConversation } from '@/hooks/ai/useAiConversation';

function LessonQA({ courseId, lessonId }) {
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    rateLimitRetryAfter,
    askQuestion,
    clearHistory,
    fetchHistory,
  } = useAiConversation(courseId, lessonId);

  const handleSubmit = async (question: string) => {
    await askQuestion(question); // streams by default
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      {isStreaming && <span>Generating…</span>}
      {error && <span>{error.message}</span>}
    </div>
  );
}
```

### `useAssignmentGeneration`

Manages AI-generated assignment state with editing and validation.

```tsx
import { useAssignmentGeneration } from '@/hooks/ai/useAssignmentGeneration';

function GeneratorPage({ courseId }) {
  const {
    generatedAssignment,
    isGenerating,
    error,
    validationError,
    generate,
    updateQuestion,
    updateOption,
    updatePoints,
    validatePoints,
    saveAssignment,
    reset,
  } = useAssignmentGeneration(courseId);

  const handleGenerate = () =>
    generate({
      lesson_id: lessonId,
      num_questions: 5,
      max_score: 100,
      difficulty: 'medium',
    });

  const handleSave = async () => {
    if (validatePoints()) {
      await saveAssignment();
    }
  };
}
```

### `useQuestionEnhancement`

Manages field-level accept/reject for AI question enhancement suggestions.

```tsx
import { useQuestionEnhancement } from '@/hooks/ai/useQuestionEnhancement';

function EnhancerPanel({ courseId, assignmentId, questionId }) {
  const {
    enhancement,
    isEnhancing,
    acceptedFields,
    enhance,
    acceptField,
    rejectField,
    saveChanges,
  } = useQuestionEnhancement();

  return (
    <div>
      <button onClick={() => enhance(courseId, assignmentId, questionId)}>
        Enhance with AI
      </button>
      {enhancement && (
        <>
          <p>Original: {enhancement.original.question}</p>
          <p>Suggested: {enhancement.suggested.improved_question}</p>
          <button onClick={() => acceptField('question')}>Accept</button>
          <button onClick={() => rejectField('question')}>Reject</button>
          <button onClick={saveChanges}>Save Changes</button>
        </>
      )}
    </div>
  );
}
```

### `usePreGrade`

Manages pre-grade display and teacher score overrides.

```tsx
import { usePreGrade } from '@/hooks/ai/usePreGrade';

function PreGradePanel({ courseId, assignmentId, submissionId }) {
  const {
    preGrade,
    isLoading,
    overrideScore,
    fetchPreGrade,
    updateScore,
    saveGrade,
    reGrade,
  } = usePreGrade();

  useEffect(() => {
    fetchPreGrade(courseId, assignmentId, submissionId);
  }, [courseId, assignmentId, submissionId]);
}
```

### `useAiAuth`

Provides role-based authorization flags. Checks are memoized and backed by a 5-minute cache.

```tsx
import { useAiAuth } from '@/hooks/ai/useAiAuth';

function LessonPage({ courseId }) {
  const { canAsk, canGenerate, canViewStats } = useAiAuth(courseId);

  return (
    <div>
      {canAsk && <AskAiComponent courseId={courseId} lessonId={lessonId} />}
      {canGenerate && <AssignmentGenerator courseId={courseId} />}
    </div>
  );
}
```

---

## Component Usage

### Student Q&A

```tsx
import { AskAiComponent } from '@/components/ai/StudentQA/AskAiComponent';
import { ConversationHistory } from '@/components/ai/StudentQA/ConversationHistory';

// Full Q&A panel with streaming
<AskAiComponent courseId={courseId} lessonId={lessonId} />

// Paginated history with clear button
<ConversationHistory courseId={courseId} lessonId={lessonId} />
```

### Teacher Tools

```tsx
import { AssignmentGenerator } from '@/components/ai/TeacherTools/AssignmentGenerator';
import { QuestionEnhancer } from '@/components/ai/TeacherTools/QuestionEnhancer';
import { PreGradeReview } from '@/components/ai/TeacherTools/PreGradeReview';

<AssignmentGenerator courseId={courseId} lessonId={lessonId} />

<QuestionEnhancer
  courseId={courseId}
  assignmentId={assignmentId}
  question={question}
  onSave={(updatedQuestion) => handleUpdate(updatedQuestion)}
/>

<PreGradeReview
  courseId={courseId}
  assignmentId={assignmentId}
  submissionId={submissionId}
/>
```

### Admin Dashboard

```tsx
import { AiUsageStatistics } from '@/components/ai/AdminDashboard/AiUsageStatistics';

<AiUsageStatistics />;
```

### Common Components

```tsx
import { MarkdownRenderer } from '@/components/ai/Common/MarkdownRenderer';
import { RateLimitAlert } from '@/components/ai/Common/RateLimitAlert';
import { LoadingSkeletons } from '@/components/ai/Common/LoadingSkeletons';
import { ErrorBoundary } from '@/components/ai/Common/ErrorBoundary';

// Render AI-generated markdown safely (XSS-sanitized)
<MarkdownRenderer content={markdownText} isStreaming={false} />

// Show rate limit countdown
<RateLimitAlert retryAfter={60} onDismiss={() => setRateLimit(null)} />

// Skeleton screens while loading
<LoadingSkeletons variant="message" count={3} />
<LoadingSkeletons variant="history" count={5} />
<LoadingSkeletons variant="statistics" />

// Wrap AI sections to catch render errors
<ErrorBoundary>
  <AskAiComponent courseId={courseId} lessonId={lessonId} />
</ErrorBoundary>
```

### Page Integration Components

These components handle the integration of AI features into existing pages:

```tsx
import { LessonPageIntegration } from '@/components/ai/Integrations/LessonPageIntegration';
import { AssignmentPageIntegration } from '@/components/ai/Integrations/AssignmentPageIntegration';
import { SubmissionPageIntegration } from '@/components/ai/Integrations/SubmissionPageIntegration';
import { DashboardIntegration } from '@/components/ai/Integrations/DashboardIntegration';

// On the lesson page — renders Q&A sidebar/modal
<LessonPageIntegration courseId={courseId} lessonId={lessonId} />

// On the assignment page — adds "Enhance with AI" buttons to questions
<AssignmentPageIntegration courseId={courseId} assignmentId={assignmentId} questions={questions} />

// On the submission page — shows pre-grade alongside submission
<SubmissionPageIntegration courseId={courseId} assignmentId={assignmentId} submissionId={submissionId} />

// On the admin dashboard — adds AI statistics tab
<DashboardIntegration />
```

---

## Error Handling

All AI errors extend `AiApiError` from `@/services/ai/errors`. Use `instanceof` checks to handle specific cases:

```typescript
import {
  AiAuthError,
  AiRateLimitError,
  AiNetworkError,
  AiTimeoutError,
  AiValidationError,
} from '@/services/ai/errors';

try {
  await aiApiClient.askQuestion(courseId, lessonId, question);
} catch (err) {
  if (err instanceof AiAuthError) {
    if (err.status === 401) navigate('/login');
    else showError('You do not have permission to use this feature.');
  } else if (err instanceof AiRateLimitError) {
    showRateLimitAlert(err.retryAfter); // seconds until reset
  } else if (err instanceof AiNetworkError) {
    showError('Connection error. Please check your internet connection.');
  } else if (err instanceof AiTimeoutError) {
    showError('Request timed out. Please try again.');
  } else {
    showError('An unexpected error occurred.');
  }
}
```

| Error Class         | HTTP Status | When Thrown                                             |
| ------------------- | ----------- | ------------------------------------------------------- |
| `AiAuthError`       | 401 / 403   | Session expired or insufficient permissions             |
| `AiRateLimitError`  | 429         | Rate limit exceeded; `err.retryAfter` = seconds to wait |
| `AiNetworkError`    | 0           | Network failure (offline, DNS, connection refused)      |
| `AiTimeoutError`    | 0           | Request exceeded `VITE_AI_TIMEOUT_MS`                   |
| `AiValidationError` | 422         | Invalid request payload                                 |
| `AiApiError`        | 5xx         | Server-side error                                       |

---

## Streaming Responses

Streaming uses the Fetch API with `ReadableStream`. The `aiApiClient.askQuestion()` overload with `stream: true` returns an `AsyncGenerator<string>` that yields text deltas.

```typescript
// In a hook or component
const generator = aiApiClient.askQuestion(courseId, lessonId, question, true);

let accumulated = '';
for await (const delta of generator) {
  accumulated += delta;
  setContent(accumulated); // trigger re-render with each delta
}
```

The `StreamingHandler` utility handles lower-level SSE parsing and reconnection. It is used internally by `aiApiClient` but can also be used directly if you need more control:

```typescript
import { streamingHandler } from '@/utils/ai/streamingHandler';

const controller = new AbortController();
const options: RequestInit = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ question, stream: true }),
  signal: controller.signal,
};

for await (const delta of streamingHandler.streamQuestion(url, options)) {
  accumulated += delta;
}

// Clean up on navigation away
controller.abort();
```

---

## Authorization

Authorization is checked client-side via `useAiAuth` before rendering AI components or making API calls. The backend enforces authorization independently on every request.

```typescript
// Role → Feature mapping
// student  + enrolled in course  → canAsk, history
// teacher  + teaches course      → canGenerate, canEnhance, canPreGrade
// admin                          → canViewStats
```

The `authorizationHandler` singleton caches results for 5 minutes. Call `authorizationHandler.clearCache()` after role or enrollment changes.

---

## State Management

| Hook                      | Persisted        | Scope                            |
| ------------------------- | ---------------- | -------------------------------- |
| `useAiConversation`       | `localStorage`   | Per lesson (courseId + lessonId) |
| `useAssignmentGeneration` | In-memory        | Per component instance           |
| `useQuestionEnhancement`  | In-memory        | Per component instance           |
| `usePreGrade`             | In-memory        | Per component instance           |
| `useAiAuth`               | Memoized (React) | Per render tree                  |

Conversation history is stored in `localStorage` under the key `ai_conversation_{courseId}_{lessonId}` and is restored on page refresh. It is cleared when the user calls `clearHistory()`.
