import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { Search, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/api/categoryService";
import { categoryStyles } from "@/lib/utils";
import WrapperLoading from "@/components/ui/wrapper-loading";
import { useDebounce } from "@/hooks/useDebounce";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLoading, setFilterLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAllCategories(),
  });

  const mappedCategories = useMemo(() => {
    return data?.categories?.map((category) => ({
      ...category,
      icon: categoryStyles[category.slug as keyof typeof categoryStyles]?.icon,
      color: categoryStyles[category.slug as keyof typeof categoryStyles]?.color,
    }));
  }, [data]);

  // Show loading state briefly when filter changes
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setFilterLoading(true);
    } else {
      const timer = setTimeout(() => {
        setFilterLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, debouncedSearchTerm]);

  const filteredCategories = useMemo(() => mappedCategories?.filter((category) =>
    category.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  ), [debouncedSearchTerm, mappedCategories])

  return (
    <MainLayout>
      <WrapperLoading isLoading={isLoading} skeletonCount={8} useSkeletonLoader={true} skeletonVariant="grid" >
        <div className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Categories</h1>
            <p className="text-gray-600 mb-8">
              Browse courses by category to find the right topics for you
            </p>

            <div className="max-w-md mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filterLoading ? (
              <SkeletonLoader
                isLoading={true}
                variant="grid"
                count={Math.max(filteredCategories?.length || 0, 4)}
              >
                <></>
              </SkeletonLoader>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCategories?.map((category) => (
                  <Link key={category.id} to={`/categories/${category.id}`}>
                    <Card className="h-full course-card-shadow course-card-hover">
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full">
                          <div className="mb-4 text-4xl">
                            {category.icon}
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                          <p className="mb-4 text-sm text-gray-500">{category.count} courses</p>
                          <div className="mt-auto">
                            <Button
                              variant="ghost"
                              className="p-0 hover:bg-transparent hover:text-course-blue flex items-center text-sm font-medium"
                            >
                              Explore Category
                              <ChevronRight size={16} className="ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </WrapperLoading>
    </MainLayout>
  );
};

export default CategoriesPage;
