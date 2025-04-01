
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CourseCard from "../course/CourseCard";
import { Course } from "@/types/course";

interface FeaturedCoursesProps {
  courses: Course[];
  title?: string;
  description?: string;
}

const FeaturedCourses = ({
  courses,
  title = "Featured Courses",
  description = "Discover our most popular courses"
}: FeaturedCoursesProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth } = containerRef.current;
      setMaxScroll(scrollWidth - clientWidth);
    }
  }, [courses]);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current;
      const scrollAmount = clientWidth * 0.8;
      const newPosition =
        direction === "left"
          ? Math.max(scrollPosition - scrollAmount, 0)
          : Math.min(scrollPosition + scrollAmount, maxScroll);
      
      containerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth"
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
              onClick={() => scroll("left")}
              disabled={scrollPosition <= 0}
              aria-label="Scroll left"
            >
              <ArrowLeft size={20} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
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
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {courses.map((course) => (
            <div key={course.id} className="min-w-[280px] sm:min-w-[320px]">
              <CourseCard {...course} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCourses;
