
import { useState } from "react";
import CourseCard from "./CourseCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/types/course";

interface CourseListProps {
  courses: Course[];
  title?: string;
  description?: string;
  showFilters?: boolean;
}

const CourseList = ({
  courses,
  title = "All Courses",
  description,
  showFilters = true,
}: CourseListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  // Get unique categories from courses
  const categories = [
    "all",
    ...Array.from(new Set(courses.map((course) => course.category))),
  ];

  // Filter courses based on search term and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Sort courses based on selected sort option
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "popularity":
        return b.reviewCount - a.reviewCount;
      case "rating":
        return b.rating - a.rating;
      case "priceAsc":
        return a.price - b.price;
      case "priceDesc":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
      {description && (
        <p className="text-gray-600 mb-6">{description}</p>
      )}

      {showFilters && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
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
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                <SelectItem value="priceDesc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="grid" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">
                {sortedCourses.length} courses
              </span>
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedCourses.map((course) => (
                  <CourseCard key={course.id} {...course} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <div className="space-y-4">
                {sortedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col md:flex-row border rounded-lg overflow-hidden course-card-shadow"
                  >
                    <div className="w-full md:w-64 h-48 md:h-auto">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <h3 className="font-semibold text-lg mb-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {course.instructor}
                      </p>
                      <div className="flex items-center space-x-1 mb-2">
                        <span className="font-medium">
                          {course.rating.toFixed(1)}
                        </span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${
                                i < Math.floor(course.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          ({course.reviewCount})
                        </span>
                      </div>
                      <div className="flex space-x-2 mb-2">
                        <Badge variant="outline" className="bg-gray-50">
                          {course.category}
                        </Badge>
                        <Badge className="bg-course-blue">{course.level}</Badge>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="font-bold text-lg">
                          ${course.price.toFixed(2)}
                        </span>
                        <a
                          href={`/courses/${course.id}`}
                          className="text-course-blue hover:underline font-medium"
                        >
                          View Course
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
