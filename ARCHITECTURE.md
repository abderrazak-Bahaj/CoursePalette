# CoursePalette Frontend - Architecture & Design

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / Client                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    React Application                      │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │              Pages (Route Components)              │  │   │
│  │  │  ┌──────────┬──────────┬──────────┬──────────┐    │  │   │
│  │  │  │  Admin   │  Auth    │  Public  │  User    │    │  │   │
│  │  │  │ Pages    │ Pages    │ Pages    │ Pages    │    │  │   │
│  │  │  └──────────┴──────────┴──────────┴──────────┘    │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                           ▲                               │   │
│  │                           │                               │   │
│  │  ┌────────────────────────┴────────────────────────────┐  │   │
│  │  │              Components Layer                       │  │   │
│  │  │  ┌──────────┬──────────┬──────────┬──────────┐    │  │   │
│  │  │  │  Admin   │  Course  │  Layout  │   AI     │    │  │   │
│  │  │  │Components│Components│Components│Components│    │  │   │
│  │  │  └──────────┴──────────┴──────────┴──────────┘    │  │   │
│  │  │  ┌──────────────────────────────────────────────┐  │  │   │
│  │  │  │  shadcn/ui Components (60+ base components)  │  │  │   │
│  │  │  └──────────────────────────────────────────────┘  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                           ▲                               │   │
│  │                           │                               │   │
│  │  ┌────────────────────────┴────────────────────────────┐  │   │
│  │  │              Hooks & State Management              │  │   │
│  │  │  ┌──────────┬──────────┬──────────┬──────────┐    │  │   │
│  │  │  │ useAuth  │useQuery  │useContext│ useAi*  │    │  │   │
│  │  │  │          │(React Q) │(Context) │ Hooks   │    │  │   │
│  │  │  └──────────┴──────────┴──────────┴──────────┘    │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                           ▲                               │   │
│  │                           │                               │   │
│  │  ┌────────────────────────┴────────────────────────────┐  │   │
│  │  │              Services Layer                        │  │   │
│  │  │  ┌──────────────────┬──────────────────────────┐  │  │   │
│  │  │  │  API Services    │  AI API Client           │  │  │   │
│  │  │  │  ┌────────────┐  │  ┌──────────────────┐   │  │  │   │
│  │  │  │  │ Auth       │  │  │ Streaming        │   │  │  │   │
│  │  │  │  │ Course     │  │  │ Retry Logic      │   │  │  │   │
│  │  │  │  │ Assignment │  │  │ Deduplication    │   │  │  │   │
│  │  │  │  │ Enrollment │  │  │ Error Handling   │   │  │  │   │
│  │  │  │  │ ... (13)   │  │  │ Authorization    │   │  │  │   │
│  │  │  │  └────────────┘  │  └──────────────────┘   │  │  │   │
│  │  │  └──────────────────┴──────────────────────────┘  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                           ▲                               │   │
│  │                           │                               │   │
│  │  ┌────────────────────────┴────────────────────────────┐  │   │
│  │  │              Utilities & Helpers                   │  │   │
│  │  │  ┌──────────┬──────────┬──────────┬──────────┐    │  │   │
│  │  │  │Streaming │  Retry   │  Auth    │Performance│   │  │   │
│  │  │  │Handler   │ Handler  │ Handler  │ Monitor  │   │  │   │
│  │  │  └──────────┴──────────┴──────────┴──────────┘    │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Server                            │
│                   (Laravel 13 - elearning-api)                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  REST API Endpoints                                      │   │
│  │  /api/auth, /api/courses, /api/assignments, /api/ai, ... │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Database (PostgreSQL)                                   │   │
│  │  Users, Courses, Lessons, Assignments, Submissions, ...  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Architecture

### User Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User enters credentials                                   │
│    ↓                                                          │
│ 2. LoginPage component captures input                        │
│    ↓                                                          │
│ 3. authService.login() called                               │
│    ↓                                                          │
│ 4. API request to /api/auth/login                           │
│    ↓                                                          │
│ 5. Backend validates & returns token                        │
│    ↓                                                          │
│ 6. Token stored in localStorage                             │
│    ↓                                                          │
│ 7. useAuth hook updates auth state                          │
│    ↓                                                          │
│ 8. User redirected to dashboard                             │
└─────────────────────────────────────────────────────────────┘
```

### Course Browsing Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User navigates to /courses                               │
│    ↓                                                          │
│ 2. CoursesPage component mounts                             │
│    ↓                                                          │
│ 3. useQuery hook fetches courses                            │
│    ↓                                                          │
│ 4. courseService.getCourses() called                        │
│    ↓                                                          │
│ 5. API request to /api/courses                              │
│    ↓                                                          │
│ 6. Backend returns paginated courses                        │
│    ↓                                                          │
│ 7. React Query caches data                                  │
│    ↓                                                          │
│ 8. CourseList component renders courses                     │
│    ↓                                                          │
│ 9. User clicks course → navigates to details                │
└─────────────────────────────────────────────────────────────┘
```

### AI Q&A Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Student types question in AskAiComponent                 │
│    ↓                                                          │
│ 2. useAiConversation hook captures input                    │
│    ↓                                                          │
│ 3. addMessage() adds user message to state                  │
│    ↓                                                          │
│ 4. askQuestion(question, streaming=true) called            │
│    ↓                                                          │
│ 5. aiApiClient.askQuestion() initiates streaming           │
│    ↓                                                          │
│ 6. API request to /api/ai/ask-question (SSE)               │
│    ↓                                                          │
│ 7. Backend streams response chunks                          │
│    ↓                                                          │
│ 8. streamingHandler accumulates chunks                      │
│    ↓                                                          │
│ 9. StreamingResponse component renders markdown             │
│    ↓                                                          │
│ 10. Final response added to conversation history            │
│    ↓                                                          │
│ 11. Persisted to localStorage                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Management Architecture

### Global State (Context)

```
AiContext
├── state
│   ├── conversationHistory: AiMessage[]
│   ├── isLoading: boolean
│   ├── isStreaming: boolean
│   ├── error: Error | null
│   └── rateLimitRetryAfter: number | null
└── dispatch
    ├── addMessage(role, content)
    ├── clearHistory()
    ├── setError(error)
    └── setRateLimit(retryAfter)
```

### Server State (React Query)

```
Query Keys
├── ['courses'] → courseService.getCourses()
├── ['courses', id] → courseService.getCourse(id)
├── ['assignments'] → assignmentService.getAssignments()
├── ['submissions'] → submissionService.getSubmissions()
├── ['ai', 'statistics'] → aiApiClient.getUsageStatistics()
└── ... (many more)

Mutations
├── createCourse → courseService.createCourse()
├── updateCourse → courseService.updateCourse()
├── deleteCourse → courseService.deleteCourse()
├── enrollCourse → enrollmentService.enrollCourse()
└── ... (many more)
```

### Local State (useState)

```
Component Level
├── Form inputs (text, select, checkbox)
├── Modal open/close state
├── Dropdown menu state
├── Pagination current page
├── Sort/filter preferences
└── UI toggles (sidebar, theme, etc.)
```

---

## 🔐 Authorization Architecture

### Role-Based Access Control (RBAC)

```
User Roles
├── ADMIN
│   ├── Access: All admin pages
│   ├── Permissions: Create/edit/delete courses, users, categories
│   └── AI Features: View usage statistics
│
├── TEACHER
│   ├── Access: Teacher dashboard, course management
│   ├── Permissions: Create/edit own courses, manage assignments
│   └── AI Features: Generate assignments, enhance questions, pre-grade
│
└── STUDENT
    ├── Access: Student dashboard, course browsing, learning
    ├── Permissions: Enroll in courses, submit assignments
    └── AI Features: Ask questions, view conversation history
```

### Authorization Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Component needs to check authorization                   │
│    ↓                                                          │
│ 2. useAiAuth() hook called                                  │
│    ↓                                                          │
│ 3. authorizationHandler.checkPermission(feature, role)      │
│    ↓                                                          │
│ 4. Permission cached in memory                              │
│    ↓                                                          │
│ 5. Return boolean (canUseFeature)                           │
│    ↓                                                          │
│ 6. Component renders or hides based on permission           │
│    ↓                                                          │
│ 7. If unauthorized, show permission denied message          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Hierarchy

### Page Level

```
App
├── Routes
│   ├── AuthRoutes
│   │   ├── LoginPage
│   │   ├── RegisterPage
│   │   ├── ForgotPasswordPage
│   │   └── ResetPasswordPage
│   │
│   ├── PublicRoutes
│   │   ├── HomePage
│   │   ├── CoursesPage
│   │   ├── CourseDetailPage
│   │   ├── CategoriesPage
│   │   └── CheckoutPage
│   │
│   ├── ProtectedRoutes (Admin)
│   │   ├── AdminDashboardPage
│   │   ├── AdminCoursesPage
│   │   ├── AdminUsersPage
│   │   ├── AdminCategoriesPage
│   │   └── AdminAnalyticsPage
│   │
│   ├── ProtectedRoutes (Teacher)
│   │   ├── TeacherDashboardPage
│   │   ├── MyCourses
│   │   └── CourseManagementPage
│   │
│   └── ProtectedRoutes (Student)
│       ├── StudentDashboardPage
│       ├── LessonPage (with AI Q&A)
│       ├── AssignmentPage (with AI enhancement)
│       ├── SubmissionPage (with AI pre-grading)
│       └── CertificatesPage
│
└── Layout
    ├── Navbar
    ├── Sidebar
    ├── MainContent
    └── Footer
```

### Component Composition

```
Page Component
├── Layout Wrapper
│   ├── Navbar
│   ├── Sidebar
│   └── MainContent
│       ├── PageHeader
│       ├── PageContent
│       │   ├── Feature Components
│       │   │   ├── SubComponent
│       │   │   └── SubComponent
│       │   └── AI Components (if applicable)
│       │       ├── AskAiComponent
│       │       └── ConversationHistory
│       └── PageFooter
│   └── Footer
└── Modals/Dialogs (if any)
```

---

## 🔌 API Integration Architecture

### API Client Pattern

```
┌─────────────────────────────────────────────────────────────┐
│ Component                                                    │
│   ↓                                                          │
│ Hook (useQuery/useMutation)                                │
│   ↓                                                          │
│ Service (courseService, aiApiClient, etc.)                 │
│   ↓                                                          │
│ API Client (apiClient, aiApiClient)                        │
│   ├── Request Interceptor                                  │
│   │   ├── Add Authorization header                         │
│   │   ├── Add Content-Type                                 │
│   │   └── Log request (dev mode)                           │
│   │                                                          │
│   ├── HTTP Call (fetch/axios)                              │
│   │                                                          │
│   └── Response Interceptor                                 │
│       ├── Parse response                                   │
│       ├── Handle errors                                    │
│       ├── Retry on failure                                 │
│       └── Log response (dev mode)                          │
│   ↓                                                          │
│ Backend API                                                │
└─────────────────────────────────────────────────────────────┘
```

### Error Handling Flow

```
API Call
├── Success (2xx)
│   └── Return data
│
└── Error
    ├── 400 Bad Request
    │   └── AiValidationError
    │
    ├── 401 Unauthorized
    │   └── AiAuthError → Redirect to login
    │
    ├── 403 Forbidden
    │   └── AiAuthError → Show permission denied
    │
    ├── 429 Too Many Requests
    │   └── AiRateLimitError → Show retry-after countdown
    │
    ├── 500+ Server Error
    │   └── AiApiError → Show error message + retry button
    │
    └── Network Error
        └── AiNetworkError → Show offline message
```

---

## 🚀 Performance Architecture

### Code Splitting Strategy

```
Initial Bundle
├── Core (React, React Router, Tailwind)
├── Layout Components
├── Auth Pages
└── Home Page

Lazy Loaded (on demand)
├── Admin Components (when user navigates to /admin)
├── AI Components (when user navigates to lesson/assignment)
├── Course Management (when teacher navigates to course editor)
└── Analytics (when admin navigates to analytics)
```

### Caching Strategy

```
Browser Cache
├── localStorage
│   ├── Auth token
│   ├── User preferences
│   └── AI conversation history
│
├── sessionStorage
│   ├── Temporary form data
│   └── Page state
│
└── Memory Cache (React Query)
    ├── API responses (configurable TTL)
    ├── Automatic background refetch
    └── Stale-while-revalidate pattern
```

### Optimization Techniques

```
Rendering
├── React.memo for expensive components
├── useMemo for expensive computations
├── useCallback for stable function references
└── Suspense for lazy loading

Data Fetching
├── Request deduplication (AI client)
├── Retry with exponential backoff
├── Streaming for large responses
└── Pagination for large datasets

Bundle Size
├── Code splitting by route
├── Tree-shaking unused code
├── Minification & compression
└── Dynamic imports for heavy libraries
```

---

## 🧪 Testing Architecture

### Test Pyramid

```
                    ▲
                   /│\
                  / │ \
                 /  │  \  E2E Tests (Cypress/Playwright)
                /   │   \
               /    │    \
              /     │     \
             /      │      \
            /       │       \
           /        │        \
          /         │         \
         /          │          \
        /           │           \
       /            │            \
      /             │             \
     /              │              \
    /               │               \
   /                │                \
  /                 │                 \
 /                  │                  \
/___________________│___________________\
Integration Tests (Component + API mocking)

Unit Tests (Hooks, Utils, Services)
```

### Test Organization

```
src/
├── components/
│   ├── MyComponent.tsx
│   └── MyComponent.test.tsx
│
├── hooks/
│   ├── useMyHook.ts
│   └── useMyHook.test.ts
│
├── services/
│   ├── myService.ts
│   └── myService.test.ts
│
└── utils/
    ├── myUtil.ts
    └── myUtil.test.ts
```

---

## 📈 Scalability Considerations

### Current Architecture Supports

- ✅ 100+ components
- ✅ 15+ custom hooks
- ✅ 13+ API services
- ✅ 324+ tests
- ✅ 80%+ code coverage
- ✅ Lazy loading & code splitting
- ✅ Caching & optimization
- ✅ Role-based access control

### Future Scaling Options

1. **Micro-frontends** — Split into independent apps (admin, student, teacher)
2. **State Management** — Migrate to Redux/Zustand if needed
3. **Component Library** — Extract components into separate package
4. **API Layer** — GraphQL for more efficient data fetching
5. **Monorepo** — Organize multiple packages with Turborepo/Nx
6. **PWA** — Add offline support and installability
7. **Mobile** — React Native for iOS/Android

---

## 🔗 Integration Points

### External Services

```
Frontend
├── Backend API (REST)
│   └── http://localhost:8000/api
│
├── PayPal (Payment Processing)
│   └── @paypal/react-paypal-js
│
├── reCAPTCHA (Bot Protection)
│   └── Google reCAPTCHA v3
│
└── Analytics (Optional)
    └── Google Analytics / Mixpanel
```

### Browser APIs

```
Frontend
├── localStorage (Persistence)
├── sessionStorage (Temporary storage)
├── IndexedDB (Large data storage)
├── Service Workers (Offline support)
├── Web Workers (Background processing)
├── Intersection Observer (Lazy loading)
├── Performance API (Metrics)
└── Notification API (Push notifications)
```

---

## 📋 Deployment Architecture

### Development Environment

```
Local Machine
├── npm run dev
├── Vite dev server (http://localhost:5173)
├── Backend API (http://localhost:8000)
└── Hot Module Replacement (HMR)
```

### Production Environment

```
Build Process
├── npm run build
├── TypeScript compilation
├── Vite bundling & optimization
├── Code splitting
├── Asset optimization
└── Output: dist/ folder

Deployment
├── Static hosting (Vercel, Netlify, etc.)
├── CDN for assets
├── Environment variables
└── HTTPS enabled
```

---

**Last Updated:** May 2026  
**Version:** 1.0.0
