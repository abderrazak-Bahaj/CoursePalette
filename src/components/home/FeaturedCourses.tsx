import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import CourseCard from '../course/CourseCard';
import { Course } from '@/types/course';
import { courseService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import WrapperLoading from '../ui/wrapper-loading';

interface FeaturedCoursesProps {
  title?: string;
  description?: string;
}

const FeaturedCourses = ({
  title = 'Featured Courses',
  description = 'Discover our most popular courses',
}: FeaturedCoursesProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['featuredCourses', { perPage: '8' }],
    queryFn: () => courseService.getAllCourses({ per_page: '8' }),
  });

  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth } = containerRef.current;
      setMaxScroll(scrollWidth - clientWidth);
    }
  }, [data?.courses]);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current;
      const scrollAmount = clientWidth * 0.8;
      const newPosition =
        direction === 'left'
          ? Math.max(scrollPosition - scrollAmount, 0)
          : Math.min(scrollPosition + scrollAmount, maxScroll);

      containerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth',
      });

      setScrollPosition(newPosition);
    }
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">{title}</h2>
            <p className="text-gray-600 max-w-2xl mb-4 md:mb-0">
              {description}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              disabled={scrollPosition <= 0}
              aria-label="Scroll left"
            >
              <ArrowLeft size={20} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              disabled={scrollPosition >= maxScroll}
              aria-label="Scroll right"
            >
              <ArrowRight size={20} />
            </Button>
            <Button asChild>
              <Link to="/courses">View All</Link>
            </Button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex overflow-x-auto scrollbar-hide pb-6 -mx-4 px-4 gap-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <WrapperLoading
            isLoading={isLoading}
            skeletonCount={2}
            skeletonVariant="list"
            useSkeletonLoader
          >
            {data?.courses?.map((course) => (
              <div key={course.id} className="min-w-[280px] sm:min-w-[320px]">
                <CourseCard {...course} />
              </div>
            ))}
          </WrapperLoading>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCourses;
