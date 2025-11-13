# Chapter 6: Server State Management (React Query)

Welcome back, CoursePalette explorers! In our [previous chapter: API Interaction Layer](05_api_interaction_layer__.md), we learned how our frontend application acts like a "waiter," sending requests and receiving responses from the backend server. We now have a reliable way to talk to our server.

But imagine you're a busy chef in a restaurant. You get many orders for "courses" (our `Course` data from [Chapter 1: Domain Data Models](01_domain_data_models_.md)). You cook them, and the waiter brings them to the customer. What if:

- The customer asks for the _same_ course again a few minutes later? Do you cook it from scratch every time? That's slow!
- A new course is added, but the customer's menu (their current view) doesn't show it? They need an update!
- The customer's order is still "pending" (loading), or there's a problem in the kitchen (an error)? You need to keep them informed.

Manually handling all these scenarios – fetching data, showing loading states, catching errors, and keeping displayed data fresh – can become a huge headache and lead to bugs. This is especially true for data that lives on a server, which we call **Server State**.

### The Problem: Managing Server Data is Tricky

In a dynamic application like CoursePalette, data like courses, users, or assignments isn't static. It's constantly changing on the backend. When our UI needs to display this data, we run into challenges:

- **Repeated Fetches**: If multiple components on the same page (or even different pages) need the same course list, do they all fetch it separately? Inefficient!
- **Stale Data**: What if a teacher updates a course, but another teacher's open page still shows the old details? Inconsistent!
- **Loading & Error UI**: Manually adding loading spinners, error messages, and empty states for every data fetch is repetitive and error-prone.
- **Cache Invalidation**: How do we tell the application that the data it "remembers" (cached data) is now outdated and needs to be refetched?

### The Solution: A Smart Data Assistant (React Query)

This is where **Server State Management** with a library like **React Query** (officially `@tanstack/react-query`) comes to our rescue!

Think of React Query as a **smart personal assistant** for all the data that comes from your server. Instead of you constantly asking for updates and manually managing loading spinners or errors, React Query takes care of it automatically:

- **It fetches data**: You tell it _what_ data you need, and it goes and gets it.
- **It caches data**: It remembers data it has fetched so it can show it instantly next time, making your app feel super fast.
- **It knows when data is "stale"**: It has clever ways to guess when cached data might be outdated and automatically refetches it in the background.
- **It manages loading and error states**: It automatically tells your components if data is `isLoading`, `isError`, or `isSuccess`, so you can display appropriate UI without extra code.
- **It keeps things in sync**: When you change data (like creating or deleting a course), you can tell React Query, and it will automatically update other parts of your app that display related data.

This makes CoursePalette feel faster, more reliable, and less prone to bugs related to data handling.

### Key Concepts of React Query

Let's break down how this smart assistant works:

| Concept                      | Description                                                                                                                                                                                                    | Analogy                                                                                                                                                         |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Query** (`useQuery`)       | Used for `GET` requests – fetching data from the server. You give it a unique ID (`queryKey`) and a function to fetch the data (`queryFn`). It automatically handles loading, errors, caching, and refetching. | Asking your assistant to "Go get me the latest course list" and giving it a name for that request ("all-courses"). The assistant does all the work.             |
| **Mutation** (`useMutation`) | Used for `POST`, `PUT`, `DELETE` requests – changing data on the server (creating, updating, deleting). It helps you manage the side effects of these changes, like updating the cache.                        | Telling your assistant "Create this new course" or "Delete that old assignment." It's an action that changes something.                                         |
| **Caching**                  | React Query stores the data it fetches in memory. This means if you ask for the same data again soon, it can give it to you instantly without waiting for the server.                                          | Your assistant writing down all fetched information in a notebook for quick reference.                                                                          |
| **Stale Data**               | Data that _might_ be outdated. React Query considers data "stale" after a certain time (`staleTime`) or when you explicitly tell it to. It will then refetch this data in the background to keep it fresh.     | Your assistant looking at the notebook and thinking, "This course list is a bit old, I should check with the server if anything new has come in, just in case." |
| **Query Keys**               | Unique identifiers (arrays) for your queries. React Query uses these to store, refetch, and invalidate specific pieces of data in its cache.                                                                   | The unique "name tags" you give your assistant for each request (e.g., `['courses']`, `['course', courseId]`).                                                  |
| **Invalidation**             | The process of marking cached data as "stale" so React Query knows to refetch it on the next access. This is crucial after a mutation (e.g., creating a new course invalidates the "all courses" list).        | You telling your assistant, "That course list in your notebook is definitely out of date now, because I just added a new course. Please get a fresh one!"       |

### Our Use Case: Displaying and Managing Courses on the Admin Page

Let's see how CoursePalette uses React Query to display a list of courses in the admin dashboard (`AdminCoursesPage.tsx`) and then allows an administrator or teacher to create, edit, or delete those courses using a modal (`CourseModal.tsx`).

#### 1. Fetching a List of Courses (`AdminCoursesPage.tsx`)

On the `AdminCoursesPage`, we need to fetch all courses.

```typescript
// src/pages/admin/courses/AdminCoursesPage.tsx (simplified)
import { useState } from "react";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { courseService } from "@/services/api/courseService"; // Our API "waiter"
import AdminCourseList from "@/components/admin/AdminCourseList"; // Component to display courses
// ... other imports ...

const AdminCoursesPage = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  // ... other filters ...

  const params = { page, search: searchQuery || undefined /* ... */ };

  // Use useQuery to fetch courses
  const {
    data: coursesResponse, // The data we get back (e.g., { courses: [...], meta: {...} })
    isLoading, // true while fetching, false when done
    error, // Error object if something went wrong
  } = useQuery({
    queryKey: ["admin-courses", params], // Unique key for this query, includes params for re-fetching
    queryFn: async () => {
      // The function that actually fetches the data
      // This calls our API Interaction Layer (Chapter 5)
      return await courseService.getAdminCources(params);
    },
    // Other options like staleTime, refetchOnWindowFocus are set globally in App.tsx
  });

  return (
    <AdminLayout title="Course Management">
      {/* ... filters and add course button ... */}
      <AdminCourseList
        courses={coursesResponse?.courses || []}
        isLoading={isLoading}
        pagination={coursesResponse?.meta}
        onPageChange={setPage}
        error={error?.message}
        // ... other props ...
      />
    </AdminLayout>
  );
};
export default AdminCoursesPage;
```

**Explanation:**

- `useQuery`: This is the main hook for fetching data.
- `queryKey: ['admin-courses', params]`: This is the unique identifier for this particular data fetch. React Query uses it to store the data in its cache. If `params` (like `page` or `searchQuery`) change, React Query considers it a new query and fetches data again. If `params` are the same, it might return cached data.
- `queryFn`: This is the actual function that makes the API call to get the courses. It uses our `courseService` from [Chapter 5: API Interaction Layer](05_api_interaction_layer__.md).
- `data`, `isLoading`, `error`: These are properties returned by `useQuery` that automatically reflect the state of your data fetch. No more manual `useState` for `loading` or `error`!
- `AdminCourseList`: This component receives `courses`, `isLoading`, and `error` as props and renders the appropriate UI (skeletons for loading, error message, or the actual course list).

#### 2. Creating/Updating a Course (`CourseModal.tsx`)

When a teacher creates or updates a course using the `CourseModal`, we use `useMutation`. After the mutation is successful, we need to tell React Query that the cac…
