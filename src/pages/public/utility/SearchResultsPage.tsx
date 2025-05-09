import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import CourseCard from '@/components/course/CourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { courseService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import WrapperLoading from '@/components/ui/wrapper-loading';
import { MetaPagination } from '@/components/ui/pagination';
import { Course } from '@/types/course';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  // Build query parameters for API request
  const queryParams = {
    search: debouncedSearchTerm || undefined,
    per_page: '12',
    page: page.toString(),
  };

  // Fetch courses from API using React Query
  const {
    data: coursesData = {
      courses: [],
      meta: { total: 0, page: 1, last_page: 1, per_page: 12 },
    },
    isLoading,
  } = useQuery({
    queryKey: ['searchCourses', queryParams],
    queryFn: async () => await courseService.getAllCourses(queryParams),
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams();
  };

  // Update URL parameters
  const updateUrlParams = () => {
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    if (page !== 1) newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  // Update URL when search term or page changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      setPage(1);
      updateUrlParams();
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      updateUrlParams();
    }
  }, [page]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Search Results</h1>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex max-w-lg">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  type="text"
                  placeholder="Search courses, instructors, or skills..."
                  className="pl-10 rounded-r-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="rounded-l-none bg-course-blue">
                Search
              </Button>
            </div>
          </form>

          {coursesData.courses.length ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  {isLoading
                    ? 'Searching...'
                    : coursesData.courses.length === 0
                      ? 'No results found'
                      : `Showing ${coursesData.meta.total} results for "${debouncedSearchTerm}"`}
                </h2>
                {!isLoading && coursesData.courses.length === 0 && (
                  <p className="text-gray-600">
                    Try different keywords or browse our categories below
                  </p>
                )}
              </div>

              <WrapperLoading isLoading={isLoading}>
                {coursesData.courses.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                      {coursesData.courses.map((course) => (
                        <CourseCard key={course.id} {...course} />
                      ))}
                    </div>

                    {coursesData.meta.last_page > 1 && (
                      <MetaPagination
                        meta={coursesData.meta}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                )}

                {/*   {!isLoading && coursesData.courses.length === 0 && (
                  <div className="mt-12">
                    <h3 className="text-xl font-semibold mb-4">
                      Popular Categories
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {[
                        'Web Development',
                        'Data Science',
                        'Business',
                        'Design',
                        'Marketing',
                        'Photography',
                      ].map((category) => (
                        <Link
                          key={category}
                          to={`/categories/${category.toLowerCase().replace(' ', '-')}`}
                          className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </div>
                )} */}
              </WrapperLoading>
            </>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Start your search</h2>
              <p className="text-gray-600 mb-8">
                Search for courses, instructors, or skills you're interested in
              </p>
              <div className="max-w-lg mx-auto">
                <Link to="/courses">
                  <Button variant="outline" className="mr-4">
                    Browse All Courses
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button>Explore Categories</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchResultsPage;
