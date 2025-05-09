import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/layout/AdminLayout';
import { mockCourses } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import LessonForm from '@/components/admin/LessonForm';

const CreateLessonPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Find the course from mockData
  const course = courseId ? mockCourses.find((c) => c.id === courseId) : null;
  const isLoading = false;

  // If no courseId, redirect to the courses page
  if (!courseId) {
    toast({
      title: 'Error',
      description: 'No course selected. Please select a course first.',
      variant: 'destructive',
    });
    navigate('/admin/courses');
    return null;
  }

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Create New Lesson">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="h-6 bg-muted rounded-md w-1/4 animate-pulse"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded-md w-1/3"></div>
          <div className="h-32 bg-muted rounded-md"></div>
          <div className="h-64 bg-muted rounded-md"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!course) {
    return (
      <AdminLayout title="Create New Lesson">
        <div className="flex flex-col items-center justify-center p-6">
          <p className="text-destructive mb-4">
            Failed to load course information
          </p>
          <Button onClick={() => navigate('/admin/courses')}>
            Return to Courses
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Create New Lesson">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          Create New Lesson
          <span className="text-lg font-normal ml-2 text-muted-foreground">
            for {course.title}
          </span>
        </h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <LessonForm onCancel={handleCancel} courseId={courseId} />
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default CreateLessonPage;
