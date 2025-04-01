
import { User } from "@/types/user";

export enum UserRole {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student"
}

export const checkUserRole = (user: User | null, requiredRoles: UserRole[]): boolean => {
  if (!user) return false;
  
  if (requiredRoles.includes(UserRole.ADMIN)) {
    return true;
  }
  
  if (user.role) {
    return requiredRoles.includes(user.role as UserRole);
  }
  
  return false;
};
export const isAdmin = (user: User | null): boolean => {
  user?.role === UserRole.ADMIN;
};

export const isTeacher = (user: User | null): boolean => {
  return user?.role === UserRole.TEACHER;
};

export const isStudent = (user: User | null): boolean => {
  return user?.role === UserRole.STUDENT;
};

export const canManageCourses = (user: User | null): boolean => {
  return isAdmin(user) || isTeacher(user);
};

export const canViewReports = (user: User | null): boolean => {
  return isAdmin(user);
};
export const canManageUsers = (user: User | null): boolean => {
  return isAdmin(user);
};

