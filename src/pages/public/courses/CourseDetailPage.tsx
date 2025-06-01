import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import CourseCard from '@/components/course/CourseCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService, enrollmentService } from '@/services/api';
import WrapperLoading from '@/components/ui/wrapper-loading';
import { CourseHeader } from '@/components/course/CourseHeader';
import { CourseCurriculum } from '@/components/course/CourseCurriculum';
import { CourseOverview } from '@/components/course/CourseOverview';
import { CourseInstructor } from '@/components/course/CourseInstructor';
import { CourseReviews } from '@/components/course/CourseReviews';
import { useCart } from '@/contexts/CartContext';

const CourseDetailPage = () => {
  const { courseId: id } = useParams<{ courseId: string }>();

  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { addToCart } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => await courseService.getCourse(id),
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollmentService.enrollInCourse(id as string),
    onSuccess: () => {
      toast({
        title: 'Enrollment Successful',
        description: `You have successfully enrolled in "${course?.title}"`,
      });
      queryClient.invalidateQueries({ queryKey: ['course', id] });
    },
    onError: (error) => {
      toast({
        title: 'Enrollment Failed',
        description:
          'There was an error enrolling in this course. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const course = data?.course;
  const price = parseFloat(course?.price || '0');

  const handleEnroll = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in or register to enroll in this course.',
        variant: 'destructive',
      });
      return;
    }

    if (price === 0) {
      enrollMutation.mutate();
    } else {
      addToCart({
        id: course.id,
        title: course.title,
        price: price,
        image_url: course.image_url,
      });
      toast({
        title: 'Added to Cart',
        description: 'Course has been added to your cart.',
      });
    }
  };

  return (
    <WrapperLoading isLoading={isLoading}>
      <MainLayout>
        {!course ? (
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
            <p className="mb-6">
              The course you are looking for does not exist.
            </p>
            <Button asChild>
              <Link to="/courses">Back to Courses</Link>
            </Button>
          </div>
        ) : (
          <>
            <CourseHeader
              course={course}
              isEnrolled={course?.is_enrolled || false}
              onEnroll={handleEnroll}
            />

            <div className="container mx-auto px-4 py-12">
              <Tabs defaultValue="curriculum">
                <TabsList className="mb-8">
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="curriculum">
                  <CourseCurriculum
                    lessons={course?.lessons || []}
                    isPreview={!course?.is_enrolled}
                  />
                </TabsContent>

                <TabsContent value="overview">
                  <CourseOverview
                    description={course.description}
                    skills={course?.skills}
                    category={course.category?.name}
                  />
                </TabsContent>

                <TabsContent value="instructor">
                  <CourseInstructor instructor={course.instructor} />
                </TabsContent>

                <TabsContent value="reviews">
                  <CourseReviews category={course.category?.name} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Related courses */}
            {/* <div className="bg-gray-50 py-12">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-8">Related Courses</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {course.relatedCourses?.map((course) => (
                    <CourseCard key={course.id} {...course} />
                  ))}
                </div>
              </div>
            </div> */}
          </>
        )}
      </MainLayout>
    </WrapperLoading>
  );
};

export default CourseDetailPage;
