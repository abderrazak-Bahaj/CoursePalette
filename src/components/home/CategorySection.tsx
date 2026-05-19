import { useMemo, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ds/primitives/Button';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/api/categoryService';
import WrapperLoading from '../ui/wrapper-loading';
import { categoryStyles } from '@/lib/utils';

const CategorySection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Fetch data first so isLoading is available for the second useEffect
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories({ per_page: '8' }),
  });

  // Fire as soon as any pixel of the section enters the viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // When data finishes loading and the section is already visible, trigger animation
  useEffect(() => {
    if (!isLoading && !inView && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        setInView(true);
      }
    }
  }, [isLoading, inView]);

  const mappedCategories = useMemo(() => {
    return data?.categories?.map((category) => ({
      ...category,
      icon: categoryStyles[category.slug as keyof typeof categoryStyles]?.icon,
      color:
        categoryStyles[category.slug as keyof typeof categoryStyles]?.color,
    }));
  }, [data]);

  return (
    <>
      <style>{`
        .category-card {
          transition: transform 0.3s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease;
        }
        .category-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px rgba(139,92,246,0.15), 0 0 0 1px rgba(139,92,246,0.2);
          border-color: rgba(139,92,246,0.35);
          background: rgba(139,92,246,0.05);
        }
        .category-icon {
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .category-card:hover .category-icon {
          transform: scale(1.2) rotate(5deg);
        }
        .category-arrow {
          transition: transform 0.3s ease, opacity 0.3s ease;
          opacity: 0.6;
        }
        .category-card:hover .category-arrow {
          transform: translateX(6px);
          opacity: 1;
        }
      `}</style>

      {/* Outer wrapper holds the ref — always in the DOM regardless of loading state */}
      <div className="py-24 relative overflow-hidden" ref={ref}>
        {/* Section background */}
        <div className="absolute inset-0 bg-[#0f172a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(30,41,59,0.8),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-700/40 to-transparent" />

        <WrapperLoading
          isLoading={isLoading}
          skeletonCount={4}
          useSkeletonLoader={true}
          skeletonVariant="list"
        >
          <div className="container mx-auto px-4 relative z-10">
            {/* Header */}
            <div
              className="text-center mb-14"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.7s ease',
              }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-widest mb-5">
                Categories
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-50 mb-4">
                Browse Top{' '}
                <span className="text-neutral-400 font-normal">Categories</span>
              </h2>
              <p className="text-neutral-400 max-w-xl mx-auto leading-relaxed">
                Explore our most popular course categories. Find the perfect
                skills to advance your career or pursue your passions.
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {mappedCategories?.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/courses?category_id=${category.id}&sort_by=created_at&sort_order=desc`}
                  className="block"
                  style={{
                    opacity: inView ? 1 : 0,
                    transform: inView
                      ? 'translateY(0) scale(1)'
                      : 'translateY(30px) scale(0.95)',
                    transition: `all 0.6s cubic-bezier(0.34,1.2,0.64,1) ${index * 0.07}s`,
                  }}
                >
                  <div className="category-card rounded-2xl p-6 bg-white/[0.02] border border-white/5 h-full">
                    {/* Icon */}
                    <div className="category-icon mb-5 text-4xl w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center justify-center">
                      {category.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-neutral-100 mb-1.5">
                      {category.title}
                    </h3>

                    {/* Course count */}
                    <p className="text-sm text-neutral-500 mb-4">
                      {category.count} courses
                    </p>

                    {/* CTA */}
                    <div className="flex items-center text-sm font-medium text-violet-400">
                      <span>Explore</span>
                      <ChevronRight className="category-arrow w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View all */}
            <div
              className="text-center mt-12"
              style={{
                opacity: inView ? 1 : 0,
                transition: 'opacity 0.7s ease 0.6s',
              }}
            >
              <Button asChild variant="secondary">
                <Link to="/categories" className="px-8">
                  View All Categories
                </Link>
              </Button>
            </div>
          </div>
        </WrapperLoading>
      </div>
    </>
  );
};

export default CategorySection;
