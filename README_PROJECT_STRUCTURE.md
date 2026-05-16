# CoursePalette Frontend - Project Structure & Overview

## 📋 Project Overview

**CoursePalette** is a modern, full-featured e-learning platform frontend built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**. It provides a comprehensive learning management system with support for students, teachers, and administrators.

### Key Features

- 🎓 **Course Management** — Browse, enroll, and manage courses
- 👨‍🏫 **Teacher Tools** — Create courses, assignments, and manage students
- 📊 **Admin Dashboard** — Analytics, user management, and platform statistics
- 🤖 **AI Integration** — AI-powered Q&A, assignment generation, and grading assistance
- 💳 **Payment Processing** — PayPal integration for course purchases
- 📜 **Certificates** — Generate and download course completion certificates
- 🔐 **Authentication** — Secure login with role-based access control
- 📱 **Responsive Design** — Mobile-first, works on all devices
- ♿ **Accessibility** — WCAG 2.1 AA compliant

---

## 📁 Project Structure

```
CoursePalette/
├── public/                          # Static assets
│   ├── favicon.ico
│   ├── Logo.png
│   ├── Logo.svg
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/                             # Application source code
│   ├── components/                  # React components (organized by feature)
│   │   ├── ai/                      # AI integration components
│   │   │   ├── AdminDashboard/      # AI usage statistics dashboard
│   │   │   ├── Common/              # Shared AI components
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── LoadingSkeletons.tsx
│   │   │   │   ├── MarkdownRenderer.tsx
│   │   │   │   └── RateLimitAlert.tsx
│   │   │   ├── Integrations/        # Page integrations
│   │   │   │   ├── AssignmentPageIntegration.tsx
│   │   │   │   ├── DashboardIntegration.tsx
│   │   │   │   ├── LessonPageIntegration.tsx
│   │   │   │   └── SubmissionPageIntegration.tsx
│   │   │   ├── StudentQA/           # Student Q&A components
│   │   │   │   ├── AskAiComponent.tsx
│   │   │   │   ├── ConversationHistory.tsx
│   │   │   │   └── StreamingResponse.tsx
│   │   │   ├── TeacherTools/        # Teacher AI tools
│   │   │   │   ├── AssignmentGenerator.tsx
│   │   │   │   ├── PreGradeReview.tsx
│   │   │   │   └── QuestionEnhancer.tsx
│   │   │   ├── CODE_SPLITTING.md    # Code splitting documentation
│   │   │   ├── DEVELOPER_GUIDE.md   # Developer guide
│   │   │   ├── KEYBOARD_NAVIGATION.md
│   │   │   ├── README.md            # AI components documentation
│   │   │   ├── index.ts             # Barrel export
│   │   │   ├── keyboardNavigation.test.ts
│   │   │   ├── lazy.test.ts
│   │   │   └── lazy.ts              # Lazy loading utilities
│   │   │
│   │   ├── admin/                   # Admin panel components
│   │   │   ├── AddUserModal.tsx
│   │   │   ├── AdminCourseList.tsx
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── CategoryForm.tsx
│   │   │   ├── CourseForm.tsx
│   │   │   ├── LessonForm.tsx
│   │   │   ├── StudentForm.tsx
│   │   │   ├── UsersTable.tsx
│   │   │   └── [other admin components]
│   │   │
│   │   ├── certificate/             # Certificate components
│   │   │   ├── DisplayCertificate.tsx
│   │   │   └── HideCertificate.tsx
│   │   │
│   │   ├── common/                  # Shared components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── LoadingFallback.tsx
│   │   │
│   │   ├── course/                  # Course-related components
│   │   │   ├── CourseCard.tsx
│   │   │   ├── CourseCurriculum.tsx
│   │   │   ├── CourseHeader.tsx
│   │   │   ├── CourseInstructor.tsx
│   │   │   ├── CourseList.tsx
│   │   │   ├── CourseOverview.tsx
│   │   │   └── CourseReviews.tsx
│   │   │
│   │   ├── dashboard/               # Dashboard components
│   │   │   ├── CertificateCard.tsx
│   │   │   ├── CertificatesSection.tsx
│   │   │   ├── CourseProgressCard.tsx
│   │   │   ├── CourseProgressTabs.tsx
│   │   │   └── DashboardStats.tsx
│   │   │
│   │   ├── home/                    # Home page components
│   │   │   ├── CategorySection.tsx
│   │   │   ├── CtaSection.tsx
│   │   │   ├── FeaturedCourses.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── StatisticsSection.tsx
│   │   │   └── TestimonialSection.tsx
│   │   │
│   │   ├── invoices/                # Invoice components
│   │   │   └── InvoiceTable.tsx
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── Navbar.tsx
│   │   │
│   │   ├── learning/                # Learning page components
│   │   │   ├── AssignmentItem.tsx
│   │   │   ├── LessonItem.tsx
│   │   │   └── ResourceItem.tsx
│   │   │
│   │   ├── profile/                 # Profile components
│   │   │   ├── AdminProfileInformation.tsx
│   │   │   ├── AvatarProfile.tsx
│   │   │   ├── SecuritySettings.tsx
│   │   │   ├── StudentProfileInformation.tsx
│   │   │   └── TeacherProfileInformation.tsx
│   │   │
│   │   ├── ui/                      # shadcn/ui components (60+ components)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── tiptap-editor.tsx    # Rich text editor
│   │   │   ├── video-player.tsx
│   │   │   ├── ReCaptcha.tsx
│   │   │   ├── image-upload.tsx
│   │   │   ├── date-range-picker.tsx
│   │   │   └── [40+ more UI components]
│   │   │
│   │   └── index.ts                 # Component barrel export
│   │
│   ├── context/                     # React Context
│   │   └── AiContext.tsx            # AI feature context provider
│   │
│   ├── contexts/                    # Additional contexts
│   │   ├── CartContext.tsx          # Shopping cart state
│   │   └── SidebarContext.tsx       # Sidebar state
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── ai/                      # AI-specific hooks
│   │   │   ├── index.ts
│   │   │   ├── useAiAuth.ts         # Authorization checks
│   │   │   ├── useAiConversation.ts # Q&A conversation state
│   │   │   ├── useAiConversation.test.ts
│   │   │   ├── useAssignmentGeneration.ts
│   │   │   ├── useAssignmentGeneration.test.ts
│   │   │   ├── usePerformanceMonitor.ts
│   │   │   ├── usePerformanceMonitoring.ts
│   │   │   ├── usePreGrade.ts       # Pre-grading state
│   │   │   └── useQuestionEnhancement.ts
│   │   │
│   │   ├── use-get-title.tsx        # Get page title
│   │   ├── use-grouped-lessons.ts   # Group lessons by section
│   │   ├── use-mobile.tsx           # Mobile detection
│   │   ├── use-toast.ts             # Toast notifications
│   │   ├── useAuth.tsx              # Authentication state
│   │   ├── useDebounce.ts           # Debounce hook
│   │   ├── useErrorHandler.ts       # Error handling
│   │   ├── useFilteredCourses.ts    # Course filtering
│   │   └── useUrlParams.ts          # URL parameter parsing
│   │
│   ├── lib/                         # Utility libraries
│   │   └── utils.ts                 # Common utilities
│   │
│   ├── pages/                       # Page components (organized by role)
│   │   ├── admin/                   # Admin pages
│   │   │   ├── AdminProfilePage.tsx
│   │   │   ├── analytics/           # Analytics pages
│   │   │   ├── categories/          # Category management
│   │   │   ├── courses/             # Course management
│   │   │   ├── dashboard/           # Admin dashboard
│   │   │   ├── invoices/            # Invoice management
│   │   │   └── users/               # User management
│   │   │
│   │   ├── auth/                    # Authentication pages
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   └── VerifyEmailPage.tsx
│   │   │
│   │   ├── public/                  # Public pages
│   │   │   ├── Home.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── UnauthorizedPage.tsx
│   │   │   ├── blog/                # Blog pages
│   │   │   ├── categories/          # Category browsing
│   │   │   ├── certificates/        # Certificate viewing
│   │   │   ├── checkout/            # Checkout pages
│   │   │   ├── courses/             # Course browsing
│   │   │   └── utility/             # Utility pages
│   │   │
│   │   └── user/                    # Student/Teacher pages
│   │       ├── DashboardPage.tsx
│   │       ├── ProfilePage.tsx
│   │       ├── certificates/        # Certificate management
│   │       ├── invoices/            # Invoice viewing
│   │       └── learning/            # Learning pages
│   │
│   ├── routes/                      # Routing configuration
│   │   ├── index.tsx                # Route definitions
│   │   ├── AuthRouteWrapper.tsx     # Protected route wrapper
│   │   ├── RouteWrapper.tsx         # Route wrapper
│   │   └── routes.test.tsx
│   │
│   ├── services/                    # API services
│   │   ├── ai/                      # AI API client
│   │   │   ├── aiApiClient.ts       # Main AI API client
│   │   │   ├── aiApiClient.test.ts
│   │   │   ├── config.ts            # AI configuration
│   │   │   ├── errors.ts            # Custom error classes
│   │   │   ├── index.ts
│   │   │   └── types.ts             # TypeScript types
│   │   │
│   │   ├── api/                     # REST API services
│   │   │   ├── apiClient.ts         # Base API client
│   │   │   ├── assignmentService.ts
│   │   │   ├── authService.ts
│   │   │   ├── categoryService.ts
│   │   │   ├── certificateService.ts
│   │   │   ├── courseService.ts
│   │   │   ├── dashboardService.ts
│   │   │   ├── enrollmentService.ts
│   │   │   ├── index.ts
│   │   │   ├── invoice.ts
│   │   │   ├── lessonService.ts
│   │   │   ├── paymentService.ts
│   │   │   ├── resourceService.ts
│   │   │   ├── roleService.ts
│   │   │   ├── submissionService.ts
│   │   │   └── userService.ts
│   │   │
│   │   └── pagination/              # Pagination service
│   │       └── PaginationService.ts
│   │
│   ├── test/                        # Test configuration
│   │   └── setup.ts                 # Vitest setup
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── category.ts
│   │   ├── course.ts
│   │   ├── index.ts
│   │   └── user.ts
│   │
│   ├── utils/                       # Utility functions
│   │   ├── ai/                      # AI utilities
│   │   │   ├── aiAuthMiddleware.ts  # Authorization middleware
│   │   │   ├── authorizationHandler.ts
│   │   │   ├── authorizationHandler.test.ts
│   │   │   ├── debounce.ts          # Debounce utility
│   │   │   ├── debounce.test.ts
│   │   │   ├── index.ts
│   │   │   ├── memoization.ts       # Memoization utilities
│   │   │   ├── performanceMonitor.ts
│   │   │   ├── performanceMonitor.test.ts
│   │   │   ├── retryHandler.ts      # Retry logic
│   │   │   ├── retryHandler.test.ts
│   │   │   ├── streamingHandler.ts  # Streaming utilities
│   │   │   └── streamingHandler.test.ts
│   │   │
│   │   └── dateLimit.ts             # Date utilities
│   │
│   ├── App.tsx                      # Root component
│   ├── App.css                      # Global styles
│   ├── index.css                    # Base styles
│   ├── main.tsx                     # Entry point
│   └── vite-env.d.ts                # Vite environment types
│
├── docs/                            # Documentation
│   ├── 01_domain_data_models_.md
│   ├── 02_ui_component_library__shadcn_ui__.md
│   ├── 03_application_routing___navigation_.md
│   ├── 04_authentication___authorization_system_.md
│   ├── 05_api_interaction_layer_.md
│   ├── 06_server_state_management__react_query__.md
│   ├── 07_form_management___validation_.md
│   ├── ASSIGNMENT_FEATURES.md
│   └── PERFORMANCE.md
│
├── coverage/                        # Test coverage reports
│   ├── index.html
│   ├── clover.xml
│   └── [coverage data]
│
├── dist/                            # Production build output
│   ├── assets/
│   ├── index.html
│   └── [static files]
│
├── .env                             # Environment variables (local)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── .prettierignore                  # Prettier ignore rules
├── .prettierrc                      # Prettier configuration
├── components.json                  # shadcn/ui configuration
├── eslint.config.js                 # ESLint configuration
├── index.html                       # HTML entry point
├── package.json                     # Dependencies & scripts
├── package-lock.json                # Locked dependencies
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.app.json                # App TypeScript config
├── tsconfig.node.json               # Node TypeScript config
├── vite.config.ts                   # Vite configuration
├── vercel.json                      # Vercel deployment config
├── yarn.lock                        # Yarn lock file
└── README.md                        # Main README
```

---

## 🏗️ Architecture Overview

### Technology Stack

| Layer                | Technology                     | Purpose                         |
| -------------------- | ------------------------------ | ------------------------------- |
| **UI Framework**     | React 18                       | Component-based UI              |
| **Language**         | TypeScript                     | Type-safe development           |
| **Build Tool**       | Vite                           | Fast development & builds       |
| **Styling**          | Tailwind CSS                   | Utility-first CSS               |
| **UI Components**    | shadcn/ui                      | Pre-built accessible components |
| **Forms**            | React Hook Form + Zod          | Form management & validation    |
| **State Management** | React Query + Context          | Server & client state           |
| **Routing**          | React Router v6                | Client-side routing             |
| **Testing**          | Vitest + React Testing Library | Unit & component tests          |
| **Code Quality**     | ESLint + Prettier              | Linting & formatting            |

### Key Directories Explained

#### `/src/components`

Contains all React components organized by feature:

- **ai/** — AI integration components (14 components)
- **admin/** — Admin panel components
- **course/** — Course display components
- **ui/** — shadcn/ui base components (60+)
- **layout/** — Layout wrapper components

#### `/src/services`

API integration layer:

- **ai/** — AI API client with streaming, retry, deduplication
- **api/** — REST API services for all features
- **pagination/** — Pagination utilities

#### `/src/hooks`

Custom React hooks for state management:

- **ai/** — AI-specific hooks (5 hooks)
- General hooks for auth, debouncing, filtering, etc.

#### `/src/pages`

Page components organized by role:

- **admin/** — Admin dashboard & management pages
- **auth/** — Authentication pages
- **public/** — Public-facing pages
- **user/** — Student/teacher pages

#### `/src/utils/ai`

AI feature utilities:

- Authorization handler
- Streaming handler
- Retry handler with exponential backoff
- Performance monitoring
- Debouncing

#### `/src/types`

TypeScript type definitions for domain models

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API endpoint and configuration
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📊 Key Features by Directory

### AI Integration (`/src/components/ai`)

- **StudentQA** — Student question answering with streaming responses
- **TeacherTools** — Assignment generation, question enhancement, pre-grading
- **AdminDashboard** — AI usage statistics and analytics
- **Common** — Shared components (error boundary, loading, markdown renderer)
- **Integrations** — Page-level integrations

**Tests:** 324 tests, 88–98% coverage on core logic

### Course Management (`/src/components/course`)

- Course browsing and filtering
- Course details and curriculum
- Instructor information
- Reviews and ratings

### Admin Panel (`/src/components/admin`)

- User management (create, edit, delete)
- Course management
- Category management
- Lesson management
- Student management

### Authentication (`/src/pages/auth`)

- Login/Register
- Email verification
- Password reset
- Forgot password

### Dashboard (`/src/pages/user`)

- Student progress tracking
- Certificate management
- Invoice viewing
- Profile management

---

## 🧪 Testing

### Test Structure

```
src/
├── components/ai/
│   ├── keyboardNavigation.test.ts
│   └── lazy.test.ts
├── hooks/ai/
│   ├── useAiConversation.test.ts
│   └── useAssignmentGeneration.test.ts
├── services/ai/
│   └── aiApiClient.test.ts
└── utils/ai/
    ├── authorizationHandler.test.ts
    ├── debounce.test.ts
    ├── performanceMonitor.test.ts
    ├── retryHandler.test.ts
    └── streamingHandler.test.ts
```

### Running Tests

```bash
npm run test              # Run all tests once
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
```

### Coverage Targets

- **Statements:** 80%+
- **Branches:** 80%+
- **Functions:** 80%+
- **Lines:** 80%+

---

## 📚 Documentation

Detailed documentation is available in `/docs`:

- Domain data models
- UI component library (shadcn/ui)
- Application routing
- Authentication & authorization
- API interaction layer
- State management (React Query)
- Form management & validation
- Assignment features
- Performance optimization

AI-specific documentation:

- `/src/components/ai/README.md` — AI components overview
- `/src/components/ai/DEVELOPER_GUIDE.md` — Development guide
- `/src/components/ai/KEYBOARD_NAVIGATION.md` — Accessibility guide
- `/src/components/ai/CODE_SPLITTING.md` — Performance optimization

---

## 🔐 Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_AI_API_BASE_URL=http://localhost:8000/api/ai

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_PAYMENTS=true

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_key_here

# PayPal
VITE_PAYPAL_CLIENT_ID=your_client_id_here
```

---

## 🎨 Design System

### Colors & Theming

- **Theme:** Light/Dark mode support via next-themes
- **Colors:** Tailwind CSS default palette + custom extensions
- **Typography:** Inter font family

### Component Library

- **60+ shadcn/ui components** pre-configured
- **Responsive design** — Mobile-first approach
- **Accessibility** — WCAG 2.1 AA compliant
- **Dark mode** — Full dark mode support

---

## 📈 Performance

### Optimizations Implemented

- **Code Splitting** — Lazy-loaded AI components
- **Memoization** — React.memo, useMemo, useCallback
- **Debouncing** — Input debouncing for search/filters
- **Performance Monitoring** — FCP, LCP, CLS metrics
- **Image Optimization** — Responsive images with next-gen formats

### Lighthouse Targets

- Performance: 80+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

---

## 🔄 State Management

### Server State (React Query)

- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

### Client State (Context + Hooks)

- AI conversation history
- Shopping cart
- Sidebar state
- Authentication state

### Local State (useState)

- Form inputs
- UI toggles
- Modal states

---

## 🚢 Deployment

### Build

```bash
npm run build
```

### Deployment Targets

- **Vercel** — Configured via `vercel.json`
- **Docker** — Can be containerized
- **Static Hosting** — Any static host (Netlify, GitHub Pages, etc.)

### Environment Setup

1. Set environment variables in deployment platform
2. Run `npm run build`
3. Deploy `dist/` folder

---

## 📝 Code Style

### Standards

- **ESLint** — Enforces code quality
- **Prettier** — Automatic code formatting
- **TypeScript** — Strict type checking
- **PSR-12** — PHP coding standard (for backend consistency)

### Commands

```bash
npm run lint      # Check code quality
npm run format    # Auto-format code
```

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch
2. Make changes
3. Run tests: `npm run test`
4. Check coverage: `npm run test:coverage`
5. Lint & format: `npm run lint && npm run format`
6. Commit & push
7. Create pull request

### Code Review Checklist

- [ ] Tests pass
- [ ] Coverage maintained (80%+)
- [ ] No linting errors
- [ ] TypeScript strict mode passes
- [ ] Accessibility verified
- [ ] Performance acceptable

---

## 📞 Support

For issues or questions:

1. Check existing documentation in `/docs`
2. Review AI documentation in `/src/components/ai`
3. Check test files for usage examples
4. Review component JSDoc comments

---

## 📄 License

[Add your license here]

---

## 🎯 Project Statistics

| Metric               | Value            |
| -------------------- | ---------------- |
| **Total Components** | 100+             |
| **UI Components**    | 60+ (shadcn/ui)  |
| **AI Components**    | 14               |
| **Custom Hooks**     | 15+              |
| **API Services**     | 13               |
| **Test Files**       | 13               |
| **Total Tests**      | 324              |
| **Code Coverage**    | 88–98% (AI core) |
| **TypeScript Files** | 150+             |
| **Lines of Code**    | 15,000+          |

---

## 🔗 Related Projects

- **Backend API** — Laravel 13 (elearning-api)
- **Mobile App** — React Native (if applicable)
- **Admin Dashboard** — Separate admin interface (if applicable)

---

**Last Updated:** May 2026  
**Version:** 1.0.0  
**Maintainer:** Development Team
