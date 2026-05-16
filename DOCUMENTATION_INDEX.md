# CoursePalette Frontend - Documentation Index

Welcome to the CoursePalette frontend documentation! This guide will help you navigate all available resources.

---

## 📚 Documentation Files

### 1. **README_PROJECT_STRUCTURE.md** ⭐ START HERE

**Purpose:** Complete project overview with full directory tree and feature breakdown

**Contains:**

- Project overview and key features
- Complete directory structure (tree view)
- Architecture overview
- Technology stack
- Getting started guide
- Testing information
- Environment variables
- Design system details
- Performance information
- State management patterns
- Project statistics

**Best for:** Understanding the overall project structure and getting oriented

---

### 2. **QUICK_REFERENCE.md** 🚀 QUICK LOOKUP

**Purpose:** Fast lookup guide for common tasks and patterns

**Contains:**

- Quick navigation table
- Component organization by feature
- Common tasks (adding pages, components, services, hooks, tests)
- shadcn/ui component usage patterns
- AI features usage
- Testing patterns
- State management patterns
- Authentication & authorization
- Performance tips
- Naming conventions
- Debugging tips
- Important files reference
- Quick commands

**Best for:** Finding how to do something quickly without reading long docs

---

### 3. **ARCHITECTURE.md** 🏗️ DEEP DIVE

**Purpose:** Detailed system architecture and design patterns

**Contains:**

- System architecture diagram
- Data flow architecture (auth, courses, AI Q&A)
- State management architecture (Context, React Query, useState)
- Authorization architecture (RBAC)
- Component hierarchy
- API integration architecture
- Error handling flow
- Performance architecture (code splitting, caching, optimization)
- Testing architecture (test pyramid)
- Scalability considerations
- Integration points
- Deployment architecture

**Best for:** Understanding how everything fits together and design decisions

---

### 4. **README.md** (Original)

**Purpose:** Main project README with setup instructions

**Contains:**

- Project description
- Installation steps
- Development commands
- Build & deployment info

**Best for:** Initial setup and basic commands

---

## 📖 In-Code Documentation

### AI Components Documentation

Located in `/src/components/ai/`:

- **README.md** — AI components overview and usage
- **DEVELOPER_GUIDE.md** — Development guide for AI features
- **KEYBOARD_NAVIGATION.md** — Accessibility guide
- **CODE_SPLITTING.md** — Performance optimization details

### Architecture Documentation

Located in `/docs/`:

- **01*domain_data_models*.md** — Data model definitions
- **02_ui_component_library**shadcn_ui**.md** — UI component library guide
- **03_application_routing*\_\_navigation*.md** — Routing architecture
- **04_authentication*\_\_authorization_system*.md** — Auth system details
- **05*api_interaction_layer*.md** — API integration patterns
- **06_server_state_management**react_query**.md** — React Query setup
- **07_form_management*\_\_validation*.md** — Form handling patterns
- **ASSIGNMENT_FEATURES.md** — Assignment system details
- **PERFORMANCE.md** — Performance optimization guide

---

## 🗺️ Navigation Guide

### I want to...

#### **Understand the Project**

1. Read: `README_PROJECT_STRUCTURE.md` (overview)
2. Read: `ARCHITECTURE.md` (deep dive)
3. Explore: `/docs/` (detailed topics)

#### **Get Started Developing**

1. Read: `README.md` (setup)
2. Read: `QUICK_REFERENCE.md` (common tasks)
3. Check: `/src/components/ai/DEVELOPER_GUIDE.md` (AI features)

#### **Find How to Do Something**

1. Check: `QUICK_REFERENCE.md` (quick lookup)
2. Search: `/docs/` (detailed guides)
3. Look at: Test files for examples

#### **Understand a Specific Feature**

1. **Courses:** `/docs/01_domain_data_models_.md`
2. **Assignments:** `/docs/ASSIGNMENT_FEATURES.md`
3. **AI Features:** `/src/components/ai/README.md`
4. **Authentication:** `/docs/04_authentication___authorization_system_.md`
5. **Forms:** `/docs/07_form_management___validation_.md`
6. **State Management:** `/docs/06_server_state_management__react_query__.md`

#### **Improve Performance**

1. Read: `/docs/PERFORMANCE.md`
2. Read: `/src/components/ai/CODE_SPLITTING.md`
3. Check: `ARCHITECTURE.md` (Performance Architecture section)

#### **Add Tests**

1. Check: `QUICK_REFERENCE.md` (Testing Patterns section)
2. Look at: Existing test files in `src/**/*.test.ts(x)`
3. Read: `ARCHITECTURE.md` (Testing Architecture section)

#### **Understand Authorization**

1. Read: `/docs/04_authentication___authorization_system_.md`
2. Check: `ARCHITECTURE.md` (Authorization Architecture section)
3. Look at: `src/hooks/ai/useAiAuth.ts` (example)

#### **Work with AI Features**

1. Read: `/src/components/ai/README.md`
2. Read: `/src/components/ai/DEVELOPER_GUIDE.md`
3. Check: `QUICK_REFERENCE.md` (Using AI Features section)
4. Look at: `/src/components/ai/` (component examples)

---

## 📊 Documentation Structure

```
CoursePalette/
├── README.md                          ← Setup & basic info
├── README_PROJECT_STRUCTURE.md        ← Project overview & structure
├── QUICK_REFERENCE.md                 ← Quick lookup guide
├── ARCHITECTURE.md                    ← System architecture
├── DOCUMENTATION_INDEX.md             ← This file
│
├── docs/                              ← Detailed documentation
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
└── src/components/ai/                 ← AI-specific docs
    ├── README.md
    ├── DEVELOPER_GUIDE.md
    ├── KEYBOARD_NAVIGATION.md
    └── CODE_SPLITTING.md
```

---

## 🎯 Quick Links by Role

### For New Developers

1. **Start:** `README.md` (setup)
2. **Learn:** `README_PROJECT_STRUCTURE.md` (overview)
3. **Understand:** `ARCHITECTURE.md` (design)
4. **Reference:** `QUICK_REFERENCE.md` (how-to)

### For Frontend Engineers

1. **Components:** `QUICK_REFERENCE.md` (component patterns)
2. **State:** `/docs/06_server_state_management__react_query__.md`
3. **Forms:** `/docs/07_form_management___validation_.md`
4. **Performance:** `/docs/PERFORMANCE.md`

### For AI Feature Developers

1. **Overview:** `/src/components/ai/README.md`
2. **Guide:** `/src/components/ai/DEVELOPER_GUIDE.md`
3. **Accessibility:** `/src/components/ai/KEYBOARD_NAVIGATION.md`
4. **Performance:** `/src/components/ai/CODE_SPLITTING.md`

### For DevOps/Deployment

1. **Build:** `README.md` (build commands)
2. **Architecture:** `ARCHITECTURE.md` (deployment section)
3. **Environment:** `README_PROJECT_STRUCTURE.md` (env variables)

### For QA/Testing

1. **Testing:** `QUICK_REFERENCE.md` (testing patterns)
2. **Architecture:** `ARCHITECTURE.md` (testing architecture)
3. **Coverage:** `README_PROJECT_STRUCTURE.md` (testing info)

---

## 📈 Project Statistics

| Metric                  | Value            |
| ----------------------- | ---------------- |
| **Total Components**    | 100+             |
| **UI Components**       | 60+ (shadcn/ui)  |
| **AI Components**       | 14               |
| **Custom Hooks**        | 15+              |
| **API Services**        | 13               |
| **Test Files**          | 13               |
| **Total Tests**         | 324              |
| **Code Coverage**       | 88–98% (AI core) |
| **Documentation Files** | 12+              |
| **Lines of Code**       | 15,000+          |

---

## 🔍 Search Tips

### Finding Documentation

- **Project structure:** `README_PROJECT_STRUCTURE.md`
- **How to do X:** `QUICK_REFERENCE.md`
- **Why is it designed this way:** `ARCHITECTURE.md`
- **Specific feature details:** `/docs/`
- **AI features:** `/src/components/ai/`

### Finding Code

- **Pages:** `src/pages/{section}/`
- **Components:** `src/components/{feature}/`
- **Hooks:** `src/hooks/`
- **Services:** `src/services/`
- **Tests:** `src/**/*.test.ts(x)`

### Finding Examples

- **Component usage:** Look at test files
- **Hook usage:** Look at component files
- **API usage:** Look at service files
- **Pattern examples:** `QUICK_REFERENCE.md`

---

## 🚀 Getting Started Checklist

- [ ] Read `README.md` for setup
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Read `README_PROJECT_STRUCTURE.md` for overview
- [ ] Read `QUICK_REFERENCE.md` for common tasks
- [ ] Explore `/src/` directory structure
- [ ] Read `ARCHITECTURE.md` for deep understanding
- [ ] Check `/docs/` for specific topics
- [ ] Look at test files for examples
- [ ] Start developing!

---

## 📞 Documentation Maintenance

### Last Updated

- **README_PROJECT_STRUCTURE.md:** May 2026
- **QUICK_REFERENCE.md:** May 2026
- **ARCHITECTURE.md:** May 2026
- **DOCUMENTATION_INDEX.md:** May 2026

### Version

- **Project:** 1.0.0
- **Documentation:** 1.0.0

### Contributing to Documentation

When adding new features:

1. Update relevant documentation files
2. Add code comments and JSDoc
3. Add test files with examples
4. Update this index if adding new docs

---

## 🎓 Learning Path

### Beginner

1. `README.md` — Setup
2. `README_PROJECT_STRUCTURE.md` — Overview
3. `QUICK_REFERENCE.md` — Common tasks
4. Explore `/src/components/` — See examples

### Intermediate

1. `ARCHITECTURE.md` — System design
2. `/docs/` — Specific topics
3. Test files — Usage patterns
4. Component source code — Implementation

### Advanced

1. `/src/components/ai/` — Complex features
2. `/src/services/ai/` — API client patterns
3. `/src/utils/ai/` — Utility implementations
4. Performance optimization guides

---

## 🔗 External Resources

### Official Documentation

- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [React Query](https://tanstack.com/query/latest)
- [React Router](https://reactrouter.com)
- [Vitest](https://vitest.dev)

### Related Projects

- **Backend API:** `elearning-api` (Laravel 13)
- **Documentation:** This repository

---

## ❓ FAQ

**Q: Where do I find how to add a new component?**
A: Check `QUICK_REFERENCE.md` → "Adding a New Component" section

**Q: How do I understand the project structure?**
A: Read `README_PROJECT_STRUCTURE.md` for complete overview

**Q: Where are the AI features documented?**
A: Check `/src/components/ai/README.md` and related guides

**Q: How do I write tests?**
A: Check `QUICK_REFERENCE.md` → "Testing Patterns" section

**Q: Where's the deployment information?**
A: Check `ARCHITECTURE.md` → "Deployment Architecture" section

**Q: How do I improve performance?**
A: Check `/docs/PERFORMANCE.md` and `ARCHITECTURE.md` → "Performance Architecture"

**Q: Where do I find API integration examples?**
A: Check `/docs/05_api_interaction_layer_.md` and test files

**Q: How do I handle authentication?**
A: Check `/docs/04_authentication___authorization_system_.md`

---

## 📝 Notes

- All documentation is kept up-to-date with the codebase
- Code examples in documentation are tested and working
- Test files serve as additional documentation and examples
- JSDoc comments in source code provide inline documentation
- Architecture decisions are documented in `ARCHITECTURE.md`

---

**Happy coding! 🚀**

For questions or suggestions about documentation, please refer to the relevant documentation file or check the source code comments.

---

**Last Updated:** May 2026  
**Version:** 1.0.0  
**Maintainer:** Development Team
