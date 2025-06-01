import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, PlusCircle, Plus } from 'lucide-react';
import LessonsList from '@/components/admin/LessonsList';
import LessonModal from '@/components/admin/LessonModal';
import { courseService } from '@/services/api/courseService';
import { useAuth } from '@/hooks/useAuth';
import { useUrlParams } from '@/hooks/useUrlParams';

const AdminLessonsPage = () => {
  const { getParam, setParam } = useUrlParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isTeacher } = useAuth();

  const { data: coursesResponse = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => await courseService.getMyCourses(),
  });

  const courses = coursesResponse?.courses || [];

  // Initialize selected course from URL params on component mount
  useEffect(() => {
    const courseIdFromUrl = getParam('courseId');
    if (courseIdFromUrl && courses.length > 0) {
      const courseExists = courses.some(
        (course) => course.id === courseIdFromUrl
      );
      if (courseExists) {
        setSelectedCourseId(courseIdFromUrl);
      } else {
        // If course doesn't exist or user doesn't have access, clear the URL param
        setParam('courseId', null);
      }
    }
  }, [courses, getParam, setParam]);

  // Update URL when course selection changes
  const handleCourseSelection = (courseId: string) => {
    setSelectedCourseId(courseId);
    setParam('courseId', courseId);
  };

  return (
    <AdminLayout title="Lesson Management">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-muted-foreground">
              Manage and organize your course lessons
            </p>
            {selectedCourseId && (
              <div className="mt-2">
                <span className="text-sm text-muted-foreground">
                  Selected Course:{' '}
                </span>
                <span className="text-sm font-medium">
                  {courses.find((c) => c.id === selectedCourseId)?.title ||
                    'Unknown Course'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedCourseId}
              onValueChange={handleCourseSelection}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isTeacher && (
              <Button
                onClick={() => setIsModalOpen(true)}
                disabled={!selectedCourseId}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Lesson
              </Button>
            )}
          </div>
        </div>
      </div>

      {!selectedCourseId ? (
        <div className="text-center p-10 border rounded-lg bg-muted/30">
          <h3 className="text-lg font-medium mb-2">Select a Course</h3>
          <p className="text-muted-foreground mb-4">
            Please select a course from the dropdown to view and manage its
            lessons. Your selection will be saved in the URL for easy
            navigation.
          </p>
        </div>
      ) : (
        <LessonsList
          courseId={selectedCourseId}
          onAddNew={() => setIsModalOpen(true)}
        />
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
