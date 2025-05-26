# File Organization Guide - Assignment Features

This document outlines the proper file organization for assignment-related features in the CoursePalette project.

## Directory Structure

### Student-Facing Pages
**Location**: `src/pages/user/learning/`
- `AssignmentPage.tsx` - Student interface for taking assignments
- `LessonPage.tsx` - Student lesson interface

### Teacher/Admin Pages  
**Location**: `src/pages/admin/courses/`
- `CreateAssignmentPage.tsx` - Assignment creation interface for teachers
- `AssignmentManagementPage.tsx` - Assignment listing and management for teachers
- `SubmissionsReviewPage.tsx` - Submission review and grading interface for teachers
- `AdminCoursesPage.tsx` - Course management for admins
- `CreateLessonPage.tsx` - Lesson creation for teachers
- `LessonDetailPage.tsx` - Lesson details for teachers
- `CourseDetailPage.tsx` - Course details for admins

### API Services
**Location**: `src/services/api/`
- `courseService.ts` - Course and assignment API methods
- `submissionService.ts` - Submission-related API methods

### Routes Configuration
**Location**: `src/routes/index.tsx`
- Student routes: `/courses/:courseId/assignments/:assignmentId`
- Teacher routes: 
  - `/courses/:courseId/assignments` (management)
  - `/courses/:courseId/assignments/create` (creation)
  - `/courses/:courseId/assignments/:assignmentId/edit` (editing)
  - `/courses/:courseId/assignments/:assignmentId/submissions` (grading)

## Organization Principles

### 1. Role-Based Organization
- **Student features**: `src/pages/user/`
- **Teacher/Admin features**: `src/pages/admin/`
- **Public features**: `src/pages/public/`
- **Authentication**: `src/pages/auth/`

### 2. Feature-Based Subdirectories
- **Learning features**: `learning/` (lessons, assignments for students)
- **Course management**: `courses/` (admin/teacher course management)
- **User management**: `users/` (admin user management)
- **Analytics**: `analytics/` (reports and analytics)

### 3. Access Control
- **Student pages**: Accessible by all authenticated users
- **Teacher pages**: Accessible by teachers and admins (`['TEACHER', 'ADMIN']`)
- **Admin pages**: Accessible by admins only (`'ADMIN'`)

## File Naming Conventions

### Page Components
- Use PascalCase with descriptive names
- Include the purpose in the name (e.g., `CreateAssignmentPage`, `AssignmentManagementPage`)
- End with `Page.tsx` for page components

### Service Files
- Use camelCase with descriptive names
- End with `Service.ts` for API service files
- Group related API methods in the same service

### Type Definitions
- Use camelCase for file names
- Use PascalCase for interface/type names
- Group related types in the same file

## Import Path Examples

```typescript
// Student assignment page
import AssignmentPage from '@/pages/user/learning/AssignmentPage';

// Teacher assignment management
import CreateAssignmentPage from '@/pages/admin/courses/CreateAssignmentPage';
import AssignmentManagementPage from '@/pages/admin/courses/AssignmentManagementPage';
import SubmissionsReviewPage from '@/pages/admin/courses/SubmissionsReviewPage';

// API services
import { courseService } from '@/services/api/courseService';
import { submissionService } from '@/services/api/submissionService';

// Types
import { Assignment, Submission } from '@/types/course';
```

## Benefits of This Organization

1. **Clear Separation of Concerns**: Student and teacher features are clearly separated
2. **Role-Based Access**: Easy to apply different access controls based on directory
3. **Scalability**: Easy to add new features following the same pattern
4. **Maintainability**: Related files are grouped together
5. **Consistency**: Follows established patterns in the codebase

## Migration Notes

When moving files to follow this organization:
1. Update import paths in route configuration
2. Update any cross-references between components
3. Verify build process works correctly
4. Update documentation to reflect new paths

This organization ensures the codebase remains clean, scalable, and follows established patterns for role-based feature separation. 