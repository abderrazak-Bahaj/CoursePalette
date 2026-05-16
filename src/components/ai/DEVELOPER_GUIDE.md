# AI Integration — Developer Guide

This guide covers setup, development workflow, testing strategy, debugging tips, and common issues for the AI integration in CoursePalette.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Development Workflow](#development-workflow)
4. [Testing Strategy](#testing-strategy)
5. [Debugging Tips](#debugging-tips)
6. [Common Issues and Solutions](#common-issues-and-solutions)
7. [Adding a New AI Feature](#adding-a-new-ai-feature)
8. [Code Style and Conventions](#code-style-and-conventions)

---

## Prerequisites

- Node.js 18+
- The `elearning-api` Laravel backend running locally (see `elearning-api/README.md`)
- A valid `.env.local` file in the `CoursePalette/` directory

---

## Setup

### 1. Install dependencies

```bash
cd CoursePalette
npm install
```

### 2. Configure environment variables

Copy the example file and fill in values:

```bash
cp .env.example .env.local
```

Minimum required variables for AI features:

```env
VITE_AI_API_BASE_URL=http://localhost:8000/api
VITE_AI_ENABLED=true
VITE_AI_STREAMING_ENABLED=true
VITE_AI_TIMEOUT_MS=30000
```

### 3. Start the backend

The AI endpoints require the Laravel backend to be running:

```bash
cd ../elearning-api
php artisan serve
```

Verify the backend is up: `curl http://localhost:8000/api/health`

### 4. Start the frontend dev server

```bash
cd CoursePalette
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Development Workflow

### File locations

When working on AI features, the relevant files are:

| What you're changing        | Where                                     |
| --------------------------- | ----------------------------------------- |
| API endpoint methods        | `src/services/ai/aiApiClient.ts`          |
| TypeScript types            | `src/services/ai/types.ts`                |
| Error classes               | `src/services/ai/errors.ts`               |
| Feature flags / env config  | `src/services/ai/config.ts`               |
| Conversation state          | `src/hooks/ai/useAiConversation.ts`       |
| Assignment generation state | `src/hooks/ai/useAssignmentGeneration.ts` |
| Question enhancement state  | `src/hooks/ai/useQuestionEnhancement.ts`  |
| Pre-grade state             | `src/hooks/ai/usePreGrade.ts`             |
| Authorization checks        | `src/hooks/ai/useAiAuth.ts`               |
| SSE streaming               | `src/utils/ai/streamingHandler.ts`        |
| Retry logic                 | `src/utils/ai/retryHandler.ts`            |
| RBAC                        | `src/utils/ai/authorizationHandler.ts`    |
| Student Q&A UI              | `src/components/ai/StudentQA/`            |
| Teacher tools UI            | `src/components/ai/TeacherTools/`         |
| Admin dashboard UI          | `src/components/ai/AdminDashboard/`       |
| Shared UI components        | `src/components/ai/Common/`               |
| Page integrations           | `src/components/ai/Integrations/`         |

### Adding a new API method

1. Add the request/response types to `src/services/ai/types.ts`.
2. Add the method to `AiApiClient` in `src/services/ai/aiApiClient.ts`.
3. Export the new types from `src/services/ai/index.ts` if needed.
4. Write unit tests in `src/services/ai/aiApiClient.test.ts`.

### Disabling a feature during development

Set the corresponding feature flag in `.env.local`:

```env
VITE_AI_FEATURE_QA=false
VITE_AI_FEATURE_GENERATION=false
```

Or disable all AI features at once:

```env
VITE_AI_ENABLED=false
```

---

## Testing Strategy

### Running tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run a specific test file
npx vitest run src/services/ai/aiApiClient.test.ts
```

### Test structure

Tests are co-located with source files using the `.test.ts` / `.test.tsx` suffix:

```
src/services/ai/aiApiClient.test.ts
src/hooks/ai/useAiConversation.test.ts
src/hooks/ai/useAssignmentGeneration.test.ts
src/utils/ai/streamingHandler.test.ts
src/utils/ai/retryHandler.test.ts
src/utils/ai/authorizationHandler.test.ts
src/utils/ai/performanceMonitor.test.ts
src/utils/ai/debounce.test.ts
src/components/ai/Common/MarkdownRenderer.test.tsx
src/components/ai/Integrations/LessonPageIntegration.test.tsx
```

### Test tools

| Tool                            | Purpose                                      |
| ------------------------------- | -------------------------------------------- |
| **Vitest**                      | Test runner (compatible with Vite, fast HMR) |
| **React Testing Library**       | Component rendering and user interaction     |
| **MSW (Mock Service Worker)**   | API mocking at the network level             |
| **@testing-library/user-event** | Realistic user interaction simulation        |

### Writing unit tests for API client methods

Use MSW to intercept HTTP requests at the network level. This tests the real `fetch` call path including error mapping.

```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { aiApiClient } from '@/services/ai/aiApiClient';
import { AiRateLimitError } from '@/services/ai/errors';

const server = setupServer(
  http.post(
    'http://localhost:8000/api/courses/:courseId/lessons/:lessonId/ai/ask',
    () => {
      return HttpResponse.json({
        data: { id: '1', role: 'assistant', content: 'Hello', created_at: '' },
      });
    }
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('returns an AiMessage on success', async () => {
  const message = await aiApiClient.askQuestion('1', '2', 'What is React?');
  expect(message.content).toBe('Hello');
});

it('throws AiRateLimitError on 429', async () => {
  server.use(
    http.post(
      '*/ai/ask',
      () =>
        new HttpResponse(null, {
          status: 429,
          headers: { 'Retry-After': '60' },
        })
    )
  );
  await expect(
    aiApiClient.askQuestion('1', '2', 'test')
  ).rejects.toBeInstanceOf(AiRateLimitError);
});
```

### Writing hook tests

Use `renderHook` from React Testing Library:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAiConversation } from '@/hooks/ai/useAiConversation';

it('adds a message to state', async () => {
  const { result } = renderHook(() => useAiConversation('1', '2'));

  act(() => {
    result.current.addMessage('user', 'Hello');
  });

  expect(result.current.messages).toHaveLength(1);
  expect(result.current.messages[0].content).toBe('Hello');
});
```

### Writing component tests

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AskAiComponent } from '@/components/ai/StudentQA/AskAiComponent';

it('disables submit button while loading', async () => {
  render(<AskAiComponent courseId="1" lessonId="2" />);
  const textarea = screen.getByRole('textbox');
  const button = screen.getByRole('button', { name: /ask/i });

  await userEvent.type(textarea, 'What is React?');
  await userEvent.click(button);

  expect(button).toBeDisabled();
});
```

### Testing streaming responses

Use a custom MSW handler that returns a `ReadableStream`:

```typescript
import { http } from 'msw';

http.post('*/ai/ask', () => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"delta":"Hello"}\n\n'));
      controller.enqueue(encoder.encode('data: {"delta":" world"}\n\n'));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
});
```

---

## Debugging Tips

### Browser DevTools

**Network tab — inspecting AI requests:**

1. Open DevTools → Network tab.
2. Filter by `ai/` to see only AI-related requests.
3. For streaming requests, look for requests with `text/event-stream` content type.
4. Click the request → Response tab to see the raw SSE stream.
5. The EventStream tab (Chrome) shows parsed SSE events in real time.

**Console logging:**

In development mode (`VITE_MODE=development` or `npm run dev`), the API client logs all requests and responses:

```
[AI API] → POST http://localhost:8000/api/courses/1/lessons/2/ai/ask {question: "…", stream: false}
[AI API] ← POST http://localhost:8000/api/courses/1/lessons/2/ai/ask {data: {…}}
[AI API] ✗ POST http://localhost:8000/api/courses/1/lessons/2/ai/ask HTTP 429
```

The streaming handler also logs reconnection attempts:

```
[StreamingHandler] Reconnecting in 1000ms (attempt 1/3)
[StreamingHandler] Error: SSE connection failed with HTTP 503
```

**Performance monitoring:**

```typescript
import { performanceMonitor } from '@/utils/ai/performanceMonitor';

// Start observing Core Web Vitals (call once on app startup)
performanceMonitor.observeWebVitals();

// Log all collected metrics to the console
performanceMonitor.logMetrics();
// Output:
// [PerformanceMonitor] Metrics Summary
//   Core Web Vitals: { fcp: 312, lcp: 890, cls: 0.002, ttfb: 45 }
//   AI Operations: [{ operation: "askQuestion:streaming", duration: 1240, success: true, … }]
```

### Laravel Telescope

Telescope is available at `http://localhost:8000/telescope` and is the primary tool for debugging backend-side AI issues.

**Useful Telescope views for AI debugging:**

- **Requests** — See every HTTP request the frontend makes to the backend. Check request headers (Authorization token), request body (question, params), and response body (AI response or error).
- **Exceptions** — If the backend throws an exception during an AI request, it appears here with a full stack trace.
- **Queries** — See the database queries triggered by AI endpoints (e.g. conversation history inserts/selects).
- **Jobs** — Pre-grading is processed as a queued job. Check here to see if the job was dispatched, is pending, or failed.
- **Logs** — Application-level log messages from the AI service layer.

**Filtering Telescope by AI requests:**

In the Requests view, filter by path `/api/courses/*/ai/*` to see only AI-related requests.

**Checking a 429 rate limit response:**

1. Open Telescope → Requests.
2. Find the request that returned 429.
3. Check the response headers for `Retry-After`.
4. Check the request body to confirm the correct user/course/lesson IDs were sent.

### MSW in Development

If you want to mock AI responses during frontend development without the backend running:

1. Create a handler file at `src/mocks/aiHandlers.ts`.
2. Register it in `src/mocks/browser.ts`.
3. Start the MSW service worker: `npm run dev` (MSW is auto-started in development if configured).

Example mock handler:

```typescript
import { http, HttpResponse } from 'msw';

export const aiHandlers = [
  http.post('*/ai/ask', () =>
    HttpResponse.json({
      data: {
        id: 'mock-1',
        role: 'assistant',
        content: 'This is a mock AI response.',
        created_at: new Date().toISOString(),
      },
    })
  ),
];
```

### React DevTools

- Use the **Components** tab to inspect hook state (`useAiConversation`, `useAssignmentGeneration`, etc.) in real time.
- Use the **Profiler** tab to identify unnecessary re-renders in streaming components. The `MarkdownRenderer` and `StreamingResponse` components use `React.memo` and debouncing to minimize re-renders during streaming.

### Checking localStorage

Conversation history is persisted to `localStorage`. To inspect or clear it:

```javascript
// In the browser console

// List all AI conversation keys
Object.keys(localStorage).filter((k) => k.startsWith('ai_conversation_'));

// Read a specific conversation
JSON.parse(localStorage.getItem('ai_conversation_1_2'));

// Clear a specific conversation
localStorage.removeItem('ai_conversation_1_2');

// Clear all AI conversations
Object.keys(localStorage)
  .filter((k) => k.startsWith('ai_conversation_'))
  .forEach((k) => localStorage.removeItem(k));
```

---

## Common Issues and Solutions

### "AI features are not showing up"

**Cause:** `VITE_AI_ENABLED` is `false` or missing.

**Fix:** Add `VITE_AI_ENABLED=true` to `.env.local` and restart the dev server.

---

### "Request failed with status 401"

**Cause:** The user is not authenticated or the token has expired.

**Fix:** Log out and log back in. The `AiAuthError` with status 401 triggers an automatic redirect to the login page.

---

### "Request failed with status 403"

**Cause:** The user does not have the required role or is not enrolled in / teaching the course.

**Fix:** Verify the user's role and course enrollment in the backend. Check `useAiAuth` to confirm the authorization check is passing the correct `courseId`.

---

### Streaming response stops mid-way

**Cause:** The SSE connection was interrupted (network blip, server restart, timeout).

**Fix:** The `StreamingHandler` automatically retries up to 3 times with exponential backoff (1 s, 2 s, 4 s). If all retries fail, an error is thrown and the component shows a retry button. Check the browser console for `[StreamingHandler] Reconnecting…` messages.

---

### "Rate limit exceeded" immediately after login

**Cause:** The backend rate limit is per-user and may have been hit in a previous session.

**Fix:** Wait for the `Retry-After` duration shown in the `RateLimitAlert`. The countdown timer clears automatically when the time elapses. In development, you can reset the rate limit by clearing the backend's cache: `php artisan cache:clear`.

---

### Generated assignment points don't sum to max_score

**Cause:** The teacher edited question points and the sum no longer matches the originally requested `max_score`.

**Fix:** The `validatePoints()` function in `useAssignmentGeneration` checks this before saving. The `validationError` state will contain a descriptive message. Adjust the question points until they sum to the correct total.

---

### TypeScript error: "Property 'X' does not exist on type 'AiMessage'"

**Cause:** The backend added a new field to the response that is not yet in `types.ts`.

**Fix:** Add the new field to the appropriate interface in `src/services/ai/types.ts`. Use `?` for optional fields.

---

### MSW not intercepting requests in tests

**Cause:** The MSW server is not set up in the test file, or the URL pattern doesn't match.

**Fix:**

1. Ensure `server.listen()` is called in `beforeAll` and `server.close()` in `afterAll`.
2. Use `*` wildcards in URL patterns: `'*/courses/:courseId/lessons/:lessonId/ai/ask'`.
3. Check that `VITE_AI_API_BASE_URL` in the test environment matches the URL pattern.

---

### Pre-grade job not completing

**Cause:** The Laravel queue worker is not running.

**Fix:** Start the queue worker in the backend:

```bash
cd elearning-api
php artisan queue:work
```

Check Telescope → Jobs to see if the pre-grading job is queued, processing, or failed.

---

### Performance: too many re-renders during streaming

**Cause:** The markdown renderer is re-rendering on every delta (potentially 10–50 times per second).

**Fix:** The `StreamingResponse` component uses `useDebounce` with a 50 ms delay during streaming. If you're building a custom streaming component, apply the same pattern:

```tsx
import { useDebounce } from '@/utils/ai/debounce';

const debouncedContent = useDebounce(content, isStreaming ? 50 : 0);

return (
  <MarkdownRenderer content={debouncedContent} isStreaming={isStreaming} />
);
```

---

## Adding a New AI Feature

Follow these steps to add a new AI feature end-to-end:

1. **Add types** — Define request/response interfaces in `src/services/ai/types.ts`.

2. **Add API method** — Add a typed method to `AiApiClient` in `src/services/ai/aiApiClient.ts`.

3. **Add feature flag** — Add a new flag to `AiFeatureFlags` in `src/services/ai/config.ts` and read it from an env variable.

4. **Add authorization** — If the feature is role-restricted, add a case to `computeAuthorization()` in `src/utils/ai/authorizationHandler.ts` and a convenience method like `canTeacherDoX()`.

5. **Create a hook** — Create `src/hooks/ai/useNewFeature.ts` following the pattern of existing hooks. Export it from `src/hooks/ai/index.ts`.

6. **Create a component** — Create the UI component in the appropriate subdirectory. Wrap it in `ErrorBoundary` and use `LoadingSkeletons` for loading states.

7. **Write tests** — Add unit tests for the API method, hook, and component. Use MSW for API mocking.

8. **Update the README** — Add the new feature to `src/components/ai/README.md`.

---

## Code Style and Conventions

- **TypeScript strict mode** — All AI files use `strict: true`. Avoid `any`; use `unknown` and narrow with type guards.
- **No direct `fetch` in components** — Always go through `aiApiClient`.
- **No direct `aiApiClient` in components** — Always go through a custom hook.
- **Error handling** — Catch errors in hooks, not components. Set `error` state and let the component render an error UI.
- **Accessibility** — All interactive elements must have `aria-label` or visible text. Use `aria-live="polite"` for dynamic content updates.
- **JSDoc** — All exported functions, classes, and interfaces must have JSDoc comments with `@param`, `@returns`, and `@example` where applicable.
- **Barrel exports** — Export from `index.ts` files so consumers import from `@/services/ai` rather than deep paths.
