import { useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types/course';
import { categoryService, courseService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import WrapperLoading from '../ui/wrapper-loading';
import { MetaPagination } from '../ui/pagination';

interface CourseListProps {
  defaultFilter?: Record<string, string>;
  title?: string;
  description?: string;
  showFilters?: boolean;
}

const CourseList = ({
  defaultFilter,
  title = 'All Courses',
  description,
  showFilters = true,
}: CourseListProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get('category_id') || 'all'
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all'
  );
  const [levelFilter, setLevelFilter] = useState(
    searchParams.get('level') || 'all'
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get('sort_by') || 'created_at'
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get('sort_order') || 'desc'
  );
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const queryParams = {
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    ...(categoryFilter !== 'all' && { category_id: categoryFilter }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(levelFilter !== 'all' && { level: levelFilter }),
    sort_by: sortBy,
    sort_order: sortOrder,
    per_page: '12',
    page: page.toString(),
    ...defaultFilter,
  };

  const { data: categories = [], isLoading: categoriesIsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => await categoryService.getAllCategories(),
  });

  const {
    data: coursesData = {
      courses: [],
      meta: { total: 0, page: 1, last_page: 1, per_page: 20 },
    },
    isLoading: courseIsLoading,
  } = useQuery({
    queryKey: ['courses', queryParams],
    queryFn: async () => await courseService.getAllCourses(queryParams),
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (categoryFilter !== 'all') params.set('category_id', categoryFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (levelFilter !== 'all') params.set('level', levelFilter);
    params.set('sort_by', sortBy);
    params.set('sort_order', sortOrder);
    params.set('page', page.toString());
    setSearchParams(params);
  }, [
    debouncedSearchTerm,
    categoryFilter,
    statusFilter,
    levelFilter,
    sortBy,
    sortOrder,
    page,
    setSearchParams,
  ]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
      {description && <p className="text-gray-600 mb-6">{description}</p>}

      {showFilters && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search courses..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={levelFilter}
              onValueChange={(value) => setLevelFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="grid" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">
                {coursesData?.meta?.total} courses
              </span>
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="mt-0">
              <WrapperLoading
                isLoading={categoriesIsLoading || courseIsLoading}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {coursesData?.courses?.map((course) => (
                    <CourseCard key={course.id} {...course} />
                  ))}
                </div>
              </WrapperLoading>
            </TabsContent>
            <TabsContent value="list" className="mt-0">
              <WrapperLoading
                isLoading={categoriesIsLoading || courseIsLoading}
              >
                <div className="space-y-4">
                  {coursesData?.courses?.map((course) => (
                    <CourseCard key={course.id} {...course} variant="list" />
                  ))}
                </div>
              </WrapperLoading>
            </TabsContent>
          </Tabs>

          {coursesData?.meta?.last_page > 1 && (
            <MetaPagination
              meta={coursesData.meta}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      {!showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {coursesData?.courses?.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
