
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// Mock data for categories
const categories = [
  {
    id: "web-development",
    title: "Web Development",
    count: 425,
    icon: "💻",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "data-science",
    title: "Data Science",
    count: 380,
    icon: "📊",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "business",
    title: "Business",
    count: 510,
    icon: "📈",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "design",
    title: "Design",
    count: 320,
    icon: "🎨",
    color: "bg-pink-100 text-pink-800",
  },
  {
    id: "marketing",
    title: "Marketing",
    count: 290,
    icon: "🚀",
    color: "bg-orange-100 text-orange-800",
  },
  {
    id: "photography",
    title: "Photography",
    count: 210,
    icon: "📷",
    color: "bg-teal-100 text-teal-800",
  },
  {
    id: "health",
    title: "Health & Fitness",
    count: 180,
    icon: "🏋️‍♂️",
    color: "bg-red-100 text-red-800",
  },
  {
    id: "music",
    title: "Music",
    count: 160,
    icon: "🎵",
    color: "bg-yellow-100 text-yellow-800",
  },
];

const CategorySection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse Top Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our most popular course categories. Find the perfect skills 
            to advance your career or pursue your passions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link 
              key={category.id} 
              to={`/categories/${category.id}`}
              className="block"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={`rounded-lg p-6 ${category.color} h-full course-card-shadow transition-all duration-300 ${
                hoveredIndex === index ? "transform -translate-y-1" : ""
              }`}>
                <div className="flex flex-col h-full">
                  <div className="mb-4 text-3xl">{category.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="mb-3 text-sm opacity-90">{category.count} courses</p>
                  <div className="mt-auto">
                    <span className={`flex items-center text-sm font-medium`}>
                      Explore Category
                      <ChevronRight size={16} className={`ml-1 transition-transform ${
                        hoveredIndex === index ? "transform translate-x-1" : ""
                      }`} />
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
  );
};

export default CategorySection;
