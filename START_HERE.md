# 🎓 CoursePalette Frontend - START HERE

Welcome to **CoursePalette**, a modern e-learning platform frontend built with React, TypeScript, and Vite!

---

## 📚 What is CoursePalette?

CoursePalette is a comprehensive learning management system (LMS) frontend that provides:

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

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your API endpoint
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📖 Documentation Guide

We've created comprehensive documentation to help you understand and work with the project:

### 🎯 **Choose Your Path:**

#### **I'm New to This Project**

1. **Read:** [`README_PROJECT_STRUCTURE.md`](./README_PROJECT_STRUCTURE.md) (10 min)

   - Complete project overview
   - Full directory structure
   - Technology stack
   - Key features

2. **Read:** [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md) (5 min)

   - Quick lookup guide
   - Common tasks
   - Code patterns

3. **Explore:** `/src/` directory
   - See the actual code structure

#### **I Want to Understand the Architecture**

1. **Read:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) (15 min)

   - System architecture diagrams
   - Data flow patterns
   - State management
   - Component hierarchy

2. **Read:** `/docs/` directory
   - Detailed topic guides

#### **I Want to Start Coding**

1. **Read:** [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md) (5 min)

   - Common tasks section
   - Code patterns

2. **Look at:** Test files in `src/**/*.test.ts(x)`

   - Real usage examples

3. **Check:** Component source code
   - See implementations

#### **I Need to Find Something Specific**

1. **Use:** [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md)
   - Navigation guide
   - Search tips
   - Quick links by role

---

## 📁 Project Structure at a Glance

```
src/
├── components/          # React components (100+)
│   ├── ai/             # AI features (14 components)
│   ├── admin/          # Admin panel (30+ components)
│   ├── course/         # Course components
│   ├── ui/             # shadcn/ui (60+ components)
│   └── ...
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   ├── auth/           # Auth pages
│   ├── public/         # Public pages
│   └── user/           # Student/teacher pages
├── hooks/              # Custom hooks (15+)
│   └── ai/             # AI hooks (5 hooks)
├── services/           # API services
│   ├── api/            # REST API (13 services)
│   └── ai/             # AI API client
├── utils/              # Utilities
│   └── ai/             # AI utilities
├── types/              # TypeScript types
├── context/            # React Context
└── test/               # Test setup
```

---

## 🎯 Key Statistics

| Metric                  | Value            |
| ----------------------- | ---------------- |
| **Components**          | 100+             |
| **Custom Hooks**        | 15+              |
| **API Services**        | 13               |
| **Tests**               | 324              |
| **Code Coverage**       | 88–98% (AI core) |
| **Lines of Code**       | 15,000+          |
| **Documentation Files** | 12+              |

---

## 💻 Common Commands

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
```

---

## 🤖 AI Features Highlight

CoursePalette includes advanced AI integration:

### For Students

- **Ask AI** — Get instant answers to course questions
- **Conversation History** — Keep track of all Q&A interactions
- **Streaming Responses** — Real-time AI responses

### For Teachers

- **Assignment Generator** — AI-powered assignment creation
- **Question Enhancement** — Improve existing questions
- **Pre-Grade Review** — AI-assisted grading

### For Admins

- **Usage Statistics** — Track AI feature usage
- **Analytics Dashboard** — Monitor platform metrics

**Tests:** 324 tests, 88–98% coverage on AI core logic

---

## 🔐 Authentication & Roles

The platform supports three main roles:

### 👤 **Student**

- Browse and enroll in courses
- Complete assignments
- Ask AI questions
- View certificates

### 👨‍🏫 **Teacher**

- Create and manage courses
- Create assignments
- Use AI tools (generation, enhancement, pre-grading)
- Grade submissions

### 🛡️ **Admin**

- Manage users and courses
- View analytics
- Monitor AI usage
- System configuration

---

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm run test

# Watch mode (re-run on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Coverage Targets:** 80%+ on all code

---

## 📚 Documentation Files

| File                                                           | Purpose                   | Read Time |
| -------------------------------------------------------------- | ------------------------- | --------- |
| [`README_PROJECT_STRUCTURE.md`](./README_PROJECT_STRUCTURE.md) | Complete project overview | 10 min    |
| [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md)                   | Quick lookup guide        | 5 min     |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md)                         | System architecture       | 15 min    |
| [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md)           | Navigation guide          | 5 min     |
| `/docs/`                                                       | Detailed topic guides     | Varies    |
| `/src/components/ai/`                                          | AI feature docs           | Varies    |

---

## 🎨 Technology Stack

- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **shadcn/ui** — Component library (60+)
- **React Query** — Server state management
- **React Router** — Client-side routing
- **React Hook Form** — Form management
- **Vitest** — Testing framework
- **ESLint & Prettier** — Code quality

---

## 🚀 Next Steps

### For Developers

1. ✅ Install dependencies: `npm install`
2. ✅ Start dev server: `npm run dev`
3. ✅ Read: `README_PROJECT_STRUCTURE.md`
4. ✅ Read: `QUICK_REFERENCE.md`
5. ✅ Explore: `/src/` directory
6. ✅ Start coding!

### For Learning

1. ✅ Read: `README_PROJECT_STRUCTURE.md`
2. ✅ Read: `ARCHITECTURE.md`
3. ✅ Read: `/docs/` guides
4. ✅ Look at: Test files for examples
5. ✅ Explore: Component source code

### For Contributing

1. ✅ Read: `QUICK_REFERENCE.md`
2. ✅ Check: Naming conventions
3. ✅ Write: Tests for new code
4. ✅ Run: `npm run lint && npm run format`
5. ✅ Submit: Pull request

---

## 🆘 Need Help?

### Finding Information

- **Project structure:** [`README_PROJECT_STRUCTURE.md`](./README_PROJECT_STRUCTURE.md)
- **How to do X:** [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md)
- **Architecture:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Navigation:** [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md)
- **Specific topics:** `/docs/` directory

### Common Questions

- **How do I add a component?** → `QUICK_REFERENCE.md` → "Adding a New Component"
- **How do I write tests?** → `QUICK_REFERENCE.md` → "Testing Patterns"
- **How do I use AI features?** → `/src/components/ai/README.md`
- **How do I understand the architecture?** → `ARCHITECTURE.md`

---

## 📊 Project Overview

```
CoursePalette Frontend
├── 100+ Components
├── 15+ Custom Hooks
├── 13 API Services
├── 324 Tests (88–98% coverage)
├── 60+ shadcn/ui Components
├── 14 AI Components
├── Full TypeScript Support
├── WCAG 2.1 AA Accessibility
└── Production-Ready
```

---

## 🎯 Your First Task

### Option 1: Explore the Project

1. Run `npm run dev`
2. Open `http://localhost:5173`
3. Click around and explore the UI
4. Read `README_PROJECT_STRUCTURE.md`

### Option 2: Understand the Code

1. Read `README_PROJECT_STRUCTURE.md`
2. Read `ARCHITECTURE.md`
3. Explore `/src/` directory
4. Look at test files for examples

### Option 3: Start Coding

1. Read `QUICK_REFERENCE.md`
2. Pick a simple task (e.g., add a new component)
3. Follow the patterns in existing code
4. Write tests
5. Run `npm run lint && npm run format`

---

## 📞 Support Resources

### Documentation

- 📖 [`README_PROJECT_STRUCTURE.md`](./README_PROJECT_STRUCTURE.md) — Project overview
- 🚀 [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md) — Quick lookup
- 🏗️ [`ARCHITECTURE.md`](./ARCHITECTURE.md) — System design
- 🗺️ [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md) — Navigation

### In-Code Documentation

- 📝 JSDoc comments in source files
- 🧪 Test files with usage examples
- 📚 `/docs/` directory with detailed guides
- 🤖 `/src/components/ai/` with AI-specific docs

### External Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

## ✨ Key Features

### ✅ Production-Ready

- TypeScript strict mode
- Comprehensive testing (324 tests)
- Code coverage 88–98%
- ESLint & Prettier configured
- Accessibility compliant (WCAG 2.1 AA)

### ✅ Well-Documented

- 12+ documentation files
- JSDoc comments throughout
- Test files as examples
- Architecture diagrams
- Quick reference guides

### ✅ Scalable Architecture

- Component-based design
- Custom hooks for logic
- Service layer for API
- Context for global state
- React Query for server state

### ✅ Performance Optimized

- Code splitting & lazy loading
- Memoization & debouncing
- Streaming for large responses
- Request deduplication
- Performance monitoring

---

## 🎓 Learning Resources

### Beginner Path

1. `README_PROJECT_STRUCTURE.md` — Overview
2. `QUICK_REFERENCE.md` — Common tasks
3. Explore `/src/components/` — See examples

### Intermediate Path

1. `ARCHITECTURE.md` — System design
2. `/docs/` — Specific topics
3. Test files — Usage patterns

### Advanced Path

1. `/src/components/ai/` — Complex features
2. `/src/services/ai/` — API patterns
3. Performance guides — Optimization

---

## 🚀 Ready to Get Started?

### Step 1: Setup (2 minutes)

```bash
npm install
cp .env.example .env
npm run dev
```

### Step 2: Learn (10 minutes)

Read [`README_PROJECT_STRUCTURE.md`](./README_PROJECT_STRUCTURE.md)

### Step 3: Reference (5 minutes)

Bookmark [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md)

### Step 4: Code (∞ minutes)

Start building! 🚀

---

## 📝 Notes

- All documentation is up-to-date with the codebase
- Code examples are tested and working
- Test files serve as additional documentation
- JSDoc comments provide inline help
- Architecture decisions are documented

---

## 🎉 Welcome to CoursePalette!

You're now ready to explore and contribute to the project. Happy coding! 🚀

---

**Questions?** Check [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md) for navigation help.

**Last Updated:** May 2026  
**Version:** 1.0.0
