# Chapter 4: Authentication & Authorization System

Welcome back, CoursePalette explorers! In our [previous chapter](03_application_routing___navigation_.md), we learned about **Application Routing & Navigation**, which acts like the roadmap for our application, guiding users between different pages. But what if some roads are only for certain travelers? What if you need a "driver's license" to access some areas, or a "special pass" to get into the "staff only" lounge?

This is exactly where the **Authentication & Authorization System** comes in! Think of it as the **bouncer and passport control** for the entire CoursePalette website.

### The Problem: Not Everyone Should See Everything

Imagine a student trying to create a new course, or a teacher trying to see the overall analytics of the entire platform. That wouldn't be right! We need a way to:

1.  **Verify Identity (Authentication):** Who are you? Are you really John Doe, the student, or Jane Smith, the administrator? This usually happens when you log in.
2.  **Control Access (Authorization):** Once we know who you are, what are you allowed to do and see? Can a student access the "Admin Dashboard"? Can a teacher grade assignments?

Without this system, our application would be a free-for-all, leading to security breaches, sensitive data exposure, and a chaotic user experience.

### The Solution: A Secure Identity & Access Management System

CoursePalette solves this with a robust system that:

- **Identifies Users:** When you log in, it confirms you are who you say you are.
- **Assigns Roles:** Each user (student, teacher, admin) gets a specific role.
- **Restricts Access:** It uses these roles to determine which parts of the application you can see or interact with.

### Key Concepts: Authentication vs. Authorization

These two terms are often used together but mean slightly different things:

| Concept            | What it Answers                    | Analogy                    | CoursePalette Example                      |
| :----------------- | :--------------------------------- | :------------------------- | :----------------------------------------- |
| **Authentication** | "Are you who you say you are?"     | Showing your passport      | Logging in with email and password         |
| **Authorization**  | "What are you allowed to do here?" | Bouncer checking your pass | A student cannot access `/admin/dashboard` |

### Our Use Case: Protecting the Admin Dashboard

Let's take a common scenario: we want the `/admin/dashboard` page to be accessible **only to users with the 'ADMIN' or 'TEACHER' roles**. Students should be redirected if they try to visit it.

### How CoursePalette Implements Authentication & Authorization

CoursePalette uses a combination of React Context, hooks, and routing wrappers to manage this system.

#### 1. The `useAuth` Hook and `AuthProvider`

At the heart of our system is the `AuthContext` and the `useAuth` hook (defined in `src/hooks/useAuth.tsx`).

- **`AuthProvider`**: This component wraps our entire application (as seen in `src/App.tsx`). Its job is to manage the user's login state, keep track of who the current user is, and provide functions for logging in, registering, and logging out. It also fetches the user's details, including their `role`, from the backend.
- **`useAuth` Hook**: This is what any component in CoursePalette uses to check the current user's status. It provides:
  - `isAuthenticated`: A boolean that tells us if a user is currently logged in.
  - `user`: An object containing the current user's details (like `name`, `email`, and most importantly, `role`).
  - `isLoading`: A boolean to indicate if the authentication status is still being determined (e.g., checking for a saved login token).
  - Helper booleans like `isAdmin`, `isTeacher`, `isStudent` for easy role checks.
  - Functions like `login`, `register`, `logout`.

Let's look at a simplified `AuthContextType` and how `useAuth` is defined:

```typescript
// src/types/index.ts (simplified for AuthContextType)
export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role; // This is crucial for authorization!
  // ... other user details
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean; // Convenience boolean
  isTeacher: boolean; // Convenience boolean
  isStudent: boolean; // Convenience boolean
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  // ... other authentication-related functions
}
```

And how the `useAuth` hook is used in a component:

```typescript
// src/components/layout/Navbar.tsx (simplified)
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin, isTeacher } = useAuth(); // Get auth state

  return (
    <nav>
      {/* ... other navigation links ... */}
      {isAuthenticated ? (
        <>
          <span>
            Welcome, {user?.name} ({user?.role})
          </span>
          <Button onClick={logout}>Log Out</Button> {/* Call logout function */}
        </>
      ) : (
        <Link to="/login">
          <Button>Log In</Button>
        </Link>
      )}

      {/* Show Admin Dashboard link only if user is admin or teacher */}
      {(isAdmin || isTeacher) && (
        <Link to="/admin/dashboard">Admin Dashboard</Link>
      )}
    </nav>
  );
};
```

This snippet shows how simple it is to check `isAuthenticated` and `user.role` to conditionally display UI elements.

#### 2. Route Protection with `RouteWrapper` and `AuthRouteWrapper`

The most critical part of authorization happens at the routing level. In [Chapter 3: Application Routing & Navigation](03_application_routing___navigation_.md), we briefly mentioned `RouteWrapper`. Now we'll dive deeper!

**`RouteWrapper` (from `src/routes/RouteWrapper.tsx`)**

This component's job is to sit in front of a page component and decide if the current user is _authorized_ to see it. It uses the `useAuth` hook to check the user's authentication status and their role.

It takes an `accessType` prop, which can be:

- `'PUBLIC'`: Anyone can see this page (e.g., home page, course listings).
- `'ALL'`: Any **authenticated** user can see this page (e.g., user dashboard, profile page).
- A specific `Role` string (e.g., `'ADMIN'`) or an `Array<Role>` (e.g., `['TEACHER', 'ADMIN']`): Only users with these specific roles can access.

Let's look at how it's used in `src/routes/index.tsx` for our Admin Dashboard use case:

```typescript
// src/routes/index.tsx (simplified)
import { RouteWrapper } from "./RouteWrapper";
import { SuspenseWrapper } from "./utils"; // Placeholder for lazy loading

// ... other lazy loaded pages ...
const AdminDashboardPage = lazy(() => import("@/pages/admin/dashboard"));

const AppRoutes = () => (
  <Routes>
    {/* Public Route Example */}
    <Route
      path="/courses"
      element={
        <RouteWrapper accessType="PUBLIC">
          {" "}
          {/* Anyone can view */}
          <SuspenseWrapper>
            <CoursesPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />

    {/* Authenticated User Route Example */}
    <Route
      path="/dashboard"
      element={
        <RouteWrapper accessType="ALL">
          {" "}
          {/* Any logged-in user can view */}
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />

    {/* Protected Admin/Teacher Route for our use case! */}
    <Route
      path="/admin/dashboard"
      element={
        <RouteWrapper accessType={["TEACHER", "ADMIN"]}>
          {" "}
          {/* ONLY Teacher or Admin */}
          <SuspenseWrapper>
            <AdminDashboardPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    {/* ... other routes ... */}
  </Routes>
);
```

When a user tries to go to `/admin/dashboard`, the `RouteWrapper` will be invoked _before_ `AdminDashboardPage` is even loaded.

**`AuthRouteWrapper` (from `src/routes/AuthRouteWrapper.tsx`)**

This is a specialized wrapper used specifically for login, register, and password reset pages. Its main purpose is to **redirect an already authenticated user away** from these pages. If you're already logged in, why would you need to see the login page again?

```typescript
// src/routes/index.tsx (simplified)
import { AuthRouteWrapper } from "./AuthRouteWrapper";
// ... other lazy loaded pages ...
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));

const AppRoutes = () => (
  <Routes>
    {/* Auth Routes */}
    <Route
      path="/login"
      element={
        <AuthRouteWrapper>
          {" "}
          {/* Redirects if already logged in */}
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        </AuthRouteWrapper>
      }
    />
    {/* ... other routes ... */}
  </Routes>
);
```

### Authentication & Authorization Flow in CoursePalette

Let's trace what happens when a user logs in and then tries to access a protected page.

#### Step 1: Logging In (Authentication)

```mermaid
sequenceDiagram
    participant User
    participant Frontend (LoginPage)
    participant useAuth Hook
    participant AuthProvider
    participant API Service (authService)
    participant Backend API

    User->>Frontend (LoginPage): Enters email/password, Clicks "Log In"
    Frontend (LoginPage)->>useAuth Hook: Calls login(email, password)
    useAuth Hook->>API Service (authService): Sends login request
    API Service (authService)->>Backend API: POST /login with credentials
    Backend API->>Backend API: Verifies credentials, generates token
    Backend API-->>API Service (authService): Returns { token, user_data }
    API Service (authService)-->>AuthProvider: Returns response
    AuthProvider->>AuthProvider: Stores token in localStorage
    AuthProvider->>AuthProvider: Stores user data (User object) in state
    AuthProvider->>u…
```
