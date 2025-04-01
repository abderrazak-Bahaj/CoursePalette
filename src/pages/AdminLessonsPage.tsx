
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, PlusCircle } from "lucide-react";
import LessonsList from "@/components/admin/LessonsList";
import LessonModal from "@/components/admin/LessonModal";
import { courseService } from "@/services/api/courseService";

const AdminLessonsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => courseService.getCourses().then(res => res.data || []),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // This would ideally trigger a new API request with the search parameters
    console.log("Search parameters:", { searchQuery, selectedCourseId, statusFilter });
  };

  return (
    <AdminLayout title="Lesson Management">
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search lessons..."
              className="w-full rounded-md pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Courses</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">Search</Button>
          <Button onClick={() => setIsModalOpen(true)} disabled={!selectedCourseId}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        </form>
      </div>

      {!selectedCourseId ? (
        <div className="text-center p-10 border rounded-lg bg-muted/30">
          <h3 className="text-lg font-medium mb-2">Select a Course</h3>
          <p className="text-muted-foreground mb-4">
            Please select a course from the dropdown to view and manage its lessons.
          </p>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-[300px] mx-auto">
              <SelectValue placeholder="Select a course to continue" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingCourses ? (
                <SelectItem value="loading" disabled>Loading courses...</SelectItem>
              ) : courses.length === 0 ? (
                <SelectItem value="none" disabled>No courses available</SelectItem>
              ) : (
                courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <LessonsList courseId={selectedCourseId} />
      )}

      {selectedCourseId && (
        <LessonModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          courseId={selectedCourseId}
        />
      )}
    </AdminLayout>
  );
};

export default AdminLessonsPage;
