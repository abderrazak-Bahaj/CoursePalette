import MainLayout from '@/components/layout/MainLayout';
import CourseList from '@/components/course/CourseList';

const CoursesPage = () => {
  return (
    <MainLayout>
      <div className="bg-[#0f172a] py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-50 mb-2">
            All Courses
          </h1>
          <p className="text-neutral-400 mb-6">
            Browse our extensive collection of courses across various categories
          </p>
        </div>
      </div>
      <CourseList title="" showFilters={true} />
    </MainLayout>
  );
};

export default CoursesPage;
