import { useMemo, useState } from 'react';
import { Button } from '@/components/ds/primitives/Button';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/api/categoryService';
import WrapperLoading from '../ui/wrapper-loading';
import { categoryStyles } from '@/lib/utils';

const CategorySection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories({ per_page: '8' }),
  });

  const mappedCategories = useMemo(() => {
    return data?.categories?.map((category) => ({
      ...category,
      icon: categoryStyles[category.slug as keyof typeof categoryStyles]?.icon,
      color:
        categoryStyles[category.slug as keyof typeof categoryStyles]?.color,
    }));
  }, [data]);

  return (
    <WrapperLoading
      isLoading={isLoading}
      skeletonCount={4}
      useSkeletonLoader={true}
      skeletonVariant="list"
    >
      <div className="py-16 bg-[#1e293b]/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-neutral-50 mb-4">
              Browse Top Categories
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Explore our most popular course categories. Find the perfect
              skills to advance your career or pursue your passions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mappedCategories?.map((category, index) => (
              <Link
                key={category.id}
                to={`/courses?category_id=${category.id}&sort_by=created_at&sort_order=desc`}
                className="block"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={`rounded-lg p-6 bg-[#1e293b] border border-neutral-700 h-full shadow-md transition-all duration-300 hover:border-violet-500 hover:shadow-glow-violet ${
                    hoveredIndex === index ? 'transform -translate-y-1' : ''
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-4 text-3xl">{category.icon}</div>
                    <h3 className="text-xl font-semibold text-neutral-100 mb-2">
                      {category.title}
                    </h3>
                    <p className="mb-3 text-sm text-neutral-400">
                      {category.count} courses
                    </p>
                    <div className="mt-auto">
                      <span className="flex items-center text-sm font-medium text-violet-400">
                        Explore Category
                        <ChevronRight
                          size={16}
                          className={`ml-1 transition-transform ${
                            hoveredIndex === index
                              ? 'transform translate-x-1'
                              : ''
                          }`}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild>
              <Link to="/categories">View All Categories</Link>
            </Button>
          </div>
        </div>
      </div>
    </WrapperLoading>
  );
};

export default CategorySection;
