import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Search } from 'lucide-react';
import AdminCourseList from '@/components/admin/AdminCourseList';
import CourseModal from '@/components/admin/CourseModal';
import { courseService, CourseParams } from '@/services/api/courseService';
import { useAuth } from '@/hooks/useAuth';
import { categoryService } from '@/services/api/categoryService';
import { CategoriesResponse } from '@/types/category';

const AdminCoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { isAdmin, isTeacher } = useAuth();

  const params: CourseParams = {
    page,
    per_page: 12,
    sort_by: 'created_at',
    sort_order: 'desc',
    search: searchQuery || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };

  const {
    data: coursesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-courses', params],
    queryFn: async () =>
      isAdmin
        ? await courseService.getAdminCources(params)
        : await courseService.getMyCourses(params),
  });

  // Fetch categories with proper typing
  const { data: categoriesResponse } = useQuery<CategoriesResponse>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoryService.getAllCategories();
      return response?.categories || [];
    },
  });

  return (
    <AdminLayout title="Course Management">
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="w-full rounded-md pl-8 md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesResponse?.categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isTeacher && (
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          )}
        </div>
      </div>
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={null}
        categories={categoriesResponse}
      />
      <AdminCourseList
        courses={coursesResponse?.courses || []}
        isLoading={isLoading}
        pagination={coursesResponse?.meta}
        onPageChange={setPage}
        error={error?.message}
        categories={categoriesResponse}
      />
    </AdminLayout>
  );
};

export default AdminCoursesPage;
