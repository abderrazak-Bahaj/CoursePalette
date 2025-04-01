
import MainLayout from "@/components/layout/MainLayout";
import CourseList from "@/components/course/CourseList";
import { mockCourses } from "@/data/mockData";

const CoursesPage = () => {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">All Courses</h1>
          <p className="text-gray-600 mb-6">
            Browse our extensive collection of courses across various categories
          </p>
        </div>
      </div>
      <CourseList
        courses={mockCourses}
        title=""
        showFilters={true}
      />
    </MainLayout>
  );
};

export default CoursesPage;
