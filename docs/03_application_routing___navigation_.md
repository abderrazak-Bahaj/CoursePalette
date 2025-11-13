# Chapter 3: Application Routing & Navigation

Welcome back, CoursePalette explorers! In our [first chapter](01_domain_data_models_.md), we learned about **Domain Data Models**, the blueprints for our application's information. Then, in [Chapter 2: UI Component Library (Shadcn UI)](02_ui_component_library__shadcn_ui__.md), we discovered how to build beautiful visual components using pre-made "LEGO bricks."

Now, imagine you have a fantastic website with many beautiful pages and components, but how do users actually _move_ between them? How does clicking a "View Course" button take you to the correct Course Detail page? And what if a user tries to access a page they're not allowed to see?

This is where **Application Routing & Navigation** comes in! Think of it as the **roadmap** of our application. It tells CoursePalette which paths (URLs) exist, what content to display for each path, and how users can travel between these different locations.

### The Problem: A Website Needs Directions

Without a routing system, our application would be like a house with many rooms but no hallways or doors. You'd have to reload the entire website every time you wanted to see a different piece of content. This is slow, clunky, and a terrible user experience.

### The Solution: A Smart Navigation System

Application Routing solves this by:

1.  **Defining Paths**: It maps specific URLs (like `/courses` or `/profile`) to specific parts of our application (pages or components).
2.  **Guiding Users**: When you click a link, the routing system smoothly takes you to the new page without reloading the entire browser. This makes CoursePalette feel fast and responsive.
3.  **Controlling Access**: Combined with an access control system (which we'll explore in the next chapter!), it can even prevent users from visiting pages they don't have permission for, redirecting them to a different page like a login screen or an "Unauthorized" message.

CoursePalette uses a popular library called **`react-router-dom`** to handle all its routing needs.

### Key Concepts in Routing

Here are the main ideas you'll encounter with routing:

- **URL (Uniform Resource Locator):** The address you see in your browser's address bar (e.g., `www.coursepalette.com/courses/intro-to-react`).
- **Route:** A rule that connects a specific URL pattern to a specific UI component that should be displayed. For example, the URL `/courses` might show the `CoursesPage` component.
- **Dynamic Route:** A route that includes a placeholder in its path, allowing it to match many similar URLs. For instance, `/courses/:courseId` matches `/courses/123`, `/courses/web-dev-basics`, etc. The `:courseId` part becomes a variable that our component can use.
- **Navigation:** The act of moving from one page/URL to another. This can happen when a user clicks a link or when our code tells the browser to go to a new URL.

### Our Use Case: Navigating to a Course Detail Page

Let's use our `CourseData` from [Chapter 1](01_domain_data_models_.md) and our `CourseCard` from [Chapter 2](02_ui_component_library__shadcn_ui__.md). Imagine a user is on the main `/courses` page, seeing a list of CourseCards. They click on a "View Course" button for "Introduction to React."

Our routing system needs to:

1.  Change the URL from `/courses` to something like `/courses/intro-to-react`.
2.  Display the `CourseDetailPage` component for "Introduction to React."

### How to Implement Routing in CoursePalette

CoursePalette uses `react-router-dom` to manage its application's roadmap.

#### 1. Setting Up the Router in `src/App.tsx`

First, our entire application needs to be "aware" of routing. This is done by wrapping our main `AppRoutes` component with `BrowserRouter`. Think of `BrowserRouter` as the brain that listens to URL changes and makes sure the right components are shown.

```typescript
// src/App.tsx (simplified)
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes"; // This is where all our paths are defined!

function App() {
  return (
    <BrowserRouter>
      {" "}
      {/* The main engine for routing */}
      <AppRoutes /> {/* Contains all the specific paths */}
    </BrowserRouter>
  );
}

export default App;
```

- `BrowserRouter`: This component makes `react-router-dom` work by using the browser's history API to keep our UI in sync with the URL.
- `AppRoutes`: This is a special component that we'll define next, and it will contain all the specific routes for our application.

#### 2. Defining All Our Routes in `src/routes/index.tsx`

This file is the core of our application's roadmap. It uses `<Routes>` to group all our individual `<Route>` definitions.

```typescript
// src/routes/index.tsx (simplified)
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { RouteWrapper } from "./RouteWrapper"; // More on this in Chapter 4!

// We use 'lazy' to load page components only when they are needed.
const CoursesPage = lazy(() => import("@/pages/public/courses/CoursesPage"));
const CourseDetailPage = lazy(
  () => import("@/pages/public/courses/CourseDetailPage")
);

// This wrapper shows a loading message while a page component is being fetched.
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div>Loading page...</div>}>{children}</Suspense>
);

const AppRoutes = () => (
  <Routes>
    {" "}
    {/* This container holds all the different paths in our app */}
    <Route
      path="/courses" // When the browser URL is exactly "/courses"
      element={
        // Display this component
        <RouteWrapper accessType="PUBLIC">
          {" "}
          {/* This page is visible to everyone */}
          <SuspenseWrapper>
            <CoursesPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    <Route
      path="/courses/:courseId" // When the URL is like "/courses/intro-to-js"
      element={
        // Display the CourseDetailPage component
        <RouteWrapper accessType="PUBLIC">
          <SuspenseWrapper>
            <CourseDetailPage />
          </SuspenseWrapper>
        </RouteWrapper>
      }
    />
    {/* ... many other routes for different pages like login, profile, admin dashboards ... */}
  </Routes>
);

export default AppRoutes;
```

- `lazy` and `Suspense`: These are React features for **code splitting**. They tell CoursePalette to only load the code for a specific page (like `CourseDetailPage`) _when_ a user actually navigates to that page, making the initial load of our application much faster. While the page code is loading, `SuspenseWrapper` shows a simple "Loading page..." message.
- `<Routes>`: This component looks at the current URL and tries to find the best matching `<Route>` inside it.
- `<Route path="/courses" element={<CoursesPage />} />`: This defines a specific route. If the browser's URL matches `/courses`, the `CoursesPage` component will be displayed.
- `<Route path="/courses/:courseId" element={<CourseDetailPage />} />`: This is a **dynamic route**. `:courseId` is a placeholder. So, if the URL is `/courses/react-basics`, `react-router-dom` knows to display `CourseDetailPage`, and the `CourseDetailPage` component can then extract `"react-basics"` to know which course to show.
- `RouteWrapper`: You might notice this component. It's a special wrapper we use to control who can access certain pages (e.g., only logged-in users, or only administrators). We'll dive into this in [Chapter 4: Authentication & Authorization System](04_authentication___authorization_system_.md).

#### 3. Navigating with `Link` and `useNavigate`

Now that we've defined our routes, how do we actually _move_ between them?

**Using `<Link>` for declarative navigation:**
The most common way is with the `<Link>` component from `react-router-dom`. It works just like a regular HTML `<a>` tag but prevents a full page reload.

```typescript
// src/components/layout/Navbar.tsx (simplified)
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // From Shadcn UI (Chapter 2!)

const Navbar = () => {
  return (
    <nav className="flex items-center space-x-4">
      <Link to="/" className="font-bold">
        CoursePalette
      </Link>{" "}
      {/* Link to the home page */}
      <Link to="/courses" className="text-gray-700">
        Courses
      </Link> {/* Link to the courses page */}
      {/* ... other menu items ... */}
      <Link to="/login">
        <Button variant="outline">Log In</Button>{" "}
        {/* A button that acts as a link */}
      </Link>
    </nav>
  );
};

export default Navbar;
```

- `<Link to="/courses">Courses</Link>`: When a user clicks "Courses," the URL changes to `/courses`, and the `CoursesPage` component is displayed, all without a full page refresh.

**Using `useNavigate` for programmatic navigation:**
Sometimes you need to navigate after an action, like submitting a form or logging out. For this, `react-router-dom` provides the `useNavigate` hook.

```typescript
// src/components/layout/Navbar.tsx (simplified example)
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate(); // This hook gives us a function to navigate

  const handleLogout = () => {
    // ... logout logic ...
    navigate("/login"); // After logging out, send the user to the login page
  };

  const handleSearch = (searchTerm: string) => {
    // ... search logic ...
    navigate(`/search?q=${searchTerm}`); // Go to search results page with a query
  };

  return (
    <div>
      {/* ... other navbar elements ... */}
      <Button onClick={handleLogout}>Logout</Button>
      {/* Example for search input (from original Navbar.tsx) */}
      <input
        placeholder="Search for courses..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch(e.currentTarget.value);
          }
        }}
      />
    </div>
  );
};

export default Navbar;
```

- `useNavigate()`: Returns a function that lets you change the URL from your code.
- `naviga…
