# CoursePalette Frontend - Quick Reference Guide

## 🎯 Quick Navigation

### Finding Things

| What                   | Where                                          |
| ---------------------- | ---------------------------------------------- |
| **Page Components**    | `src/pages/{admin,auth,public,user}/`          |
| **UI Components**      | `src/components/ui/` (60+ shadcn components)   |
| **Feature Components** | `src/components/{admin,course,dashboard,etc}/` |
| **AI Components**      | `src/components/ai/`                           |
| **Custom Hooks**       | `src/hooks/`                                   |
| **API Services**       | `src/services/api/`                            |
| **AI API Client**      | `src/services/ai/`                             |
| **Types**              | `src/types/`                                   |
| **Utilities**          | `src/utils/`                                   |
| **Tests**              | `src/**/*.test.ts(x)`                          |
| **Documentation**      | `docs/` and `src/components/ai/`               |

---

## 📦 Component Organization

### By Feature Area

```
Admin Features
├── src/components/admin/          (30+ components)
├── src/pages/admin/               (6 page sections)
└── src/services/api/              (admin-related services)

Course Management
├── src/components/course/         (7 components)
├── src/pages/public/courses/      (course pages)
└── src/services/api/courseService.ts

Student Learning
├── src/components/learning/       (3 components)
├── src/pages/user/learning/       (learning pages)
└── src/services/api/lessonService.ts

AI Features
├── src/components/ai/             (14 components)
├── src/hooks/ai/                  (5 hooks)
├── src/services/ai/               (API client)
└── src/utils/ai/                  (utilities)

Authentication
├── src/pages/auth/                (5 pages)
├── src/services/api/authService.ts
└── src/hooks/useAuth.tsx
```

---

## 🔧 Common Tasks

### Adding a New Page

1. Create page component in `src/pages/{section}/`
2. Add route in `src/routes/index.tsx`
3. Import and use in route definition
4. Add navigation link in `src/components/layout/Navbar.tsx`

**Example:**

```typescript
// src/pages/user/MyNewPage.tsx
export default function MyNewPage() {
  return <div>My Page</div>;
}

// src/routes/index.tsx
import MyNewPage from '../pages/user/MyNewPage';
// Add to routes array
```

### Adding a New Component

1. Create component in appropriate `src/components/{feature}/`
2. Export from `src/components/index.ts`
3. Use in pages or other components

**Example:**

```typescript
// src/components/course/MyNewComponent.tsx
export function MyNewComponent() {
  return <div>Component</div>;
}

// src/components/index.ts
export { MyNewComponent } from './course/MyNewComponent';
```

### Adding a New API Service

1. Create service in `src/services/api/`
2. Extend `apiClient` for HTTP calls
3. Export from `src/services/api/index.ts`
4. Use in components via React Query

**Example:**

```typescript
// src/services/api/myService.ts
import { apiClient } from './apiClient';

export const myService = {
  getItems: () => apiClient.get('/items'),
  createItem: (data) => apiClient.post('/items', data),
};

// In component
import { useQuery } from '@tanstack/react-query';
import { myService } from '@/services/api';

const { data } = useQuery({
  queryKey: ['items'],
  queryFn: myService.getItems,
});
```

### Adding a Custom Hook

1. Create hook in `src/hooks/`
2. Follow naming convention: `use{FeatureName}`
3. Export from hook file

**Example:**

```typescript
// src/hooks/useMyFeature.ts
import { useState } from 'react';

export function useMyFeature() {
  const [state, setState] = useState(null);
  return { state, setState };
}

// In component
import { useMyFeature } from '@/hooks/useMyFeature';

function MyComponent() {
  const { state, setState } = useMyFeature();
  return <div>{state}</div>;
}
```

### Adding Tests

1. Create `.test.ts(x)` file next to source file
2. Use Vitest + React Testing Library
3. Mock external dependencies

**Example:**

```typescript
// src/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

---

## 🎨 Using shadcn/ui Components

### Available Components (60+)

```typescript
// Import from src/components/ui/
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Toast, Toaster } from '@/components/ui/toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// ... and 40+ more
```

### Common Patterns

**Button:**

```typescript
<Button variant="default" size="lg">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button disabled>Disabled</Button>
```

**Card:**

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

**Form:**

```typescript
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

---

## 🤖 Using AI Features

### AI Components

```typescript
// Student Q&A
import {
  AskAiComponent,
  ConversationHistory,
  StreamingResponse,
} from '@/components/ai';

// Teacher Tools
import {
  AssignmentGenerator,
  QuestionEnhancer,
  PreGradeReview,
} from '@/components/ai';

// Admin Dashboard
import { AiUsageStatistics } from '@/components/ai';

// Common
import {
  ErrorBoundary,
  LoadingSkeletons,
  RateLimitAlert,
  MarkdownRenderer,
} from '@/components/ai';
```

### AI Hooks

```typescript
import {
  useAiConversation, // Q&A conversation state
  useAssignmentGeneration, // Generated assignment state
  useQuestionEnhancement, // Enhancement suggestions
  usePreGrade, // Pre-grading state
  useAiAuth, // Authorization checks
} from '@/hooks/ai';

// Example usage
const { messages, addMessage, askQuestion, isLoading } = useAiConversation(
  courseId,
  lessonId
);
```

### AI API Client

```typescript
import { aiApiClient } from '@/services/ai';

// Ask question (streaming)
const stream = await aiApiClient.askQuestion(
  courseId,
  lessonId,
  question,
  true
);
for await (const chunk of stream) {
  console.log(chunk);
}

// Generate assignment
const assignment = await aiApiClient.generateAssignment(courseId, prompt);

// Enhance question
const enhanced = await aiApiClient.enhanceQuestion(courseId, question);

// Get pre-grade
const preGrade = await aiApiClient.getPreGrade(submissionId);

// Get statistics
const stats = await aiApiClient.getUsageStatistics(dateRange);
```

---

## 🧪 Testing Patterns

### Testing Hooks

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMyHook } from './useMyHook';

const { result } = renderHook(() => useMyHook());

act(() => {
  result.current.doSomething();
});

await waitFor(() => {
  expect(result.current.state).toBe(expectedValue);
});
```

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

render(<MyComponent />);

const button = screen.getByRole('button', { name: /click/i });
await userEvent.click(button);

expect(screen.getByText('Result')).toBeInTheDocument();
```

### Mocking API Calls

```typescript
import { vi } from 'vitest';
import { apiClient } from '@/services/api';

vi.mock('@/services/api', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: { id: 1 } }),
  },
}));
```

---

## 📊 State Management Patterns

### Using React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { courseService } from '@/services/api';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['courses'],
  queryFn: courseService.getCourses,
});

// Mutate data
const { mutate } = useMutation({
  mutationFn: courseService.createCourse,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['courses'] });
  },
});
```

### Using Context

```typescript
import { useContext } from 'react';
import { AiContext } from '@/context/AiContext';

function MyComponent() {
  const { state, dispatch } = useContext(AiContext);
  return <div>{state.value}</div>;
}
```

### Using Custom Hooks

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  return <div>{user?.name}</div>;
}
```

---

## 🔐 Authentication & Authorization

### Check Authentication

```typescript
import { useAuth } from '@/hooks/useAuth';

function ProtectedComponent() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome {user.name}</div>;
}
```

### Check Authorization (AI Features)

```typescript
import { useAiAuth } from '@/hooks/ai';

function AiFeature() {
  const { canUseStudentQA, canUseTeacherTools } = useAiAuth();

  if (!canUseStudentQA) {
    return <div>Feature not available</div>;
  }

  return <AskAiComponent />;
}
```

### Protected Routes

```typescript
// src/routes/index.tsx
import { AuthRouteWrapper } from './AuthRouteWrapper';

{
  path: '/dashboard',
  element: <AuthRouteWrapper element={<DashboardPage />} />,
}
```

---

## 🚀 Performance Tips

### Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const AiComponent = lazy(() => import('@/components/ai/AskAiComponent'));

function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AiComponent />
    </Suspense>
  );
}
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

const MyComponent = memo(function MyComponent({ data }) {
  const processed = useMemo(() => processData(data), [data]);
  const handleClick = useCallback(() => doSomething(), []);

  return <div onClick={handleClick}>{processed}</div>;
});
```

### Debouncing

```typescript
import { useDebounce } from '@/hooks/useDebounce';

function SearchComponent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    // API call with debouncedSearch
  }, [debouncedSearch]);

  return <input onChange={(e) => setSearch(e.target.value)} />;
}
```

---

## 📝 Naming Conventions

### Files & Folders

- **Components:** PascalCase (e.g., `MyComponent.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useMyHook.ts`)
- **Services:** camelCase (e.g., `courseService.ts`)
- **Utils:** camelCase (e.g., `dateUtils.ts`)
- **Types:** PascalCase (e.g., `Course.ts`)
- **Folders:** kebab-case (e.g., `my-feature/`)

### Variables & Functions

- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Functions:** camelCase (e.g., `handleClick`)
- **React Components:** PascalCase (e.g., `MyComponent`)
- **Interfaces:** PascalCase with `I` prefix (e.g., `ICourse`)
- **Types:** PascalCase (e.g., `CourseType`)

---

## 🐛 Debugging

### Browser DevTools

```typescript
// Log component renders
console.log('Component rendered', props);

// Log state changes
console.log('State updated:', newState);

// Log API calls
console.log('API call:', method, url, data);
```

### React DevTools

- Install React DevTools browser extension
- Inspect component tree
- View props and state
- Track re-renders

### Vitest Debugging

```bash
# Run tests with debugging
node --inspect-brk ./node_modules/vitest/vitest.mjs run

# Then open chrome://inspect in Chrome
```

---

## 📚 Useful Resources

### Documentation

- `/docs/` — Detailed architecture documentation
- `/src/components/ai/README.md` — AI components guide
- `/src/components/ai/DEVELOPER_GUIDE.md` — Development guide
- `/src/components/ai/KEYBOARD_NAVIGATION.md` — Accessibility guide

### External Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [React Query](https://tanstack.com/query/latest)
- [React Router](https://reactrouter.com)
- [Vitest](https://vitest.dev)

---

## 🔗 Important Files

| File                             | Purpose                  |
| -------------------------------- | ------------------------ |
| `src/App.tsx`                    | Root component           |
| `src/main.tsx`                   | Entry point              |
| `src/routes/index.tsx`           | Route definitions        |
| `src/services/api/apiClient.ts`  | Base API client          |
| `src/services/ai/aiApiClient.ts` | AI API client            |
| `src/hooks/useAuth.tsx`          | Authentication hook      |
| `src/context/AiContext.tsx`      | AI context provider      |
| `tailwind.config.ts`             | Tailwind configuration   |
| `vite.config.ts`                 | Vite configuration       |
| `tsconfig.json`                  | TypeScript configuration |
| `package.json`                   | Dependencies & scripts   |

---

## ⚡ Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run tests once
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report

# Code Quality
npm run lint           # Check linting
npm run format         # Auto-format code

# Utilities
npm run build:dev      # Build in dev mode
```

---

**Last Updated:** May 2026  
**Version:** 1.0.0
