import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import CourseList from '@/components/course/CourseList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { mockCourses } from '@/data/mockData';
import { Course } from '@/types/course';

const SearchResultsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<Course[]>([]);

  // Function to handle search
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const results = mockCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(lowerCaseQuery) ||
        course.instructor.toLowerCase().includes(lowerCaseQuery) ||
        course.category.toLowerCase().includes(lowerCaseQuery) ||
        course.description?.toLowerCase().includes(lowerCaseQuery) ||
        course.skills?.some((skill) =>
          skill.toLowerCase().includes(lowerCaseQuery)
        )
    );

    setSearchResults(results);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
    // Update URL with query parameter
    const url = new URL(window.location.href);
    url.searchParams.set('q', searchQuery);
    window.history.pushState({}, '', url.toString());
  };

  // Load search results when query parameter changes
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

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

          {initialQuery ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  {searchResults.length === 0
                    ? 'No results found'
                    : `Showing ${searchResults.length} results for "${initialQuery}"`}
                </h2>
                {searchResults.length === 0 && (
                  <p className="text-gray-600">
                    Try different keywords or browse our categories below
                  </p>
                )}
              </div>

              {searchResults.length > 0 && (
                <CourseList
                  courses={searchResults}
                  title=""
                  showFilters={true}
                />
              )}

              {searchResults.length === 0 && (
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
              )}
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
