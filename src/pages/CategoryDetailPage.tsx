
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import CourseList from "@/components/course/CourseList";
import { mockCategories, mockCourses } from "@/data/mockData";

const CategoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // Find the category by ID
  const category = mockCategories.find((cat) => cat.id === id);
  
  // Filter courses by category
  const categoryCourses = mockCourses.filter(
    (course) => course.category.toLowerCase() === (category?.name.toLowerCase() || "")
  );

  if (!category) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="mb-6">The category you are looking for does not exist.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{category.name} Courses</h1>
          <p className="text-gray-600 mb-6">
            Explore {category.count} courses in {category.name} from beginner to advanced
          </p>
        </div>
      </div>
      
      <CourseList
        courses={categoryCourses}
        title=""
        description={`Learn ${category.name} with these comprehensive courses.`}
        showFilters={true}
      />
    </MainLayout>
  );
};

export default CategoryDetailPage;
