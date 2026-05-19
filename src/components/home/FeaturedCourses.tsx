import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ds/primitives/Button';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Flame } from 'lucide-react';
import CourseCard from '../course/CourseCard';
import { courseService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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

      containerRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scroll-btn {
          transition: all 0.2s ease;
        }
        .scroll-btn:hover:not(:disabled) {
          transform: scale(1.1);
        }
        .scroll-btn:active:not(:disabled) {
          transform: scale(0.95);
        }
      `}</style>

      <div className="py-20 relative overflow-hidden" ref={sectionRef}>
        {/* Background */}
        <div className="absolute inset-0 bg-[#0f172a]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-700/40 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.7s ease',
            }}
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-widest">
                  <Flame className="w-3 h-3" />
                  Top Rated
                </span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-50 mb-2">
                {title}
              </h2>
              <p className="text-neutral-400 max-w-xl">{description}</p>
            </div>

            <div className="flex items-center gap-3 mt-6 md:mt-0">
              <button
                className="scroll-btn w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => scroll('left')}
                disabled={scrollPosition <= 0}
                aria-label="Scroll left"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                className="scroll-btn w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => scroll('right')}
                disabled={scrollPosition >= maxScroll}
                aria-label="Scroll right"
              >
                <ArrowRight size={18} />
              </button>
              <Button variant="primary" asChild>
                <Link to="/courses" className="px-6">
                  View All
                </Link>
              </Button>
            </div>
          </div>

          {/* Courses carousel */}
          <div
            ref={containerRef}
            className="flex overflow-x-auto scrollbar-hide pb-6 -mx-4 px-4 gap-5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <WrapperLoading
              isLoading={isLoading}
              skeletonCount={2}
              skeletonVariant="list"
              useSkeletonLoader
            >
              {data?.courses?.map((course, index) => (
                <div
                  key={course.id}
                  className="min-w-[280px] sm:min-w-[320px]"
                  style={{
                    opacity: inView ? 1 : 0,
                    transform: inView ? 'translateY(0)' : 'translateY(30px)',
                    transition: `all 0.6s ease ${index * 0.08}s`,
                  }}
                >
                  <CourseCard {...course} />
                </div>
              ))}
            </WrapperLoading>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeaturedCourses;
