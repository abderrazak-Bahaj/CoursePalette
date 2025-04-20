import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  Edit,
  ArrowLeft,
  ChevronLeft,
  CheckCircle,
  Clock,
  Video,
  ListOrdered,
  FileText,
  BookOpen,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import LessonModal from '@/components/admin/LessonModal';
import { lessonService } from '@/services/api/lessonService';

const LessonDetailPage = () => {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    data: lessonData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['lesson', courseId, lessonId],
    queryFn: () => lessonService.getLesson(courseId!, lessonId!),
    enabled: !!courseId && !!lessonId,
  });

  const lesson = lessonData?.lesson;

  // If missing IDs
  if (!courseId || !lessonId) {
    navigate('/admin/courses');
    toast({
      title: 'Error',
      description: 'Missing course or lesson ID',
      variant: 'destructive',
    });
    return null;
  }

  const handleStatusToggle = async () => {
    try {
      if (lesson.status === 'PUBLISHED') {
        await lessonService.unpublishLesson(courseId, lessonId);
      } else {
        await lessonService.publishLesson(courseId, lessonId);
      }
      refetch();
      toast({
        title: 'Success',
        description:
          lesson.status === 'PUBLISHED'
            ? 'Lesson unpublished successfully'
            : 'Lesson published successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lesson status',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Lesson Details">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="mt-6 animate-pulse">
          <div className="h-12 bg-muted rounded-md w-1/3 mb-4"></div>
          <div className="h-6 bg-muted rounded-md w-1/4 mb-6"></div>
          <div className="h-48 bg-muted rounded-md mb-4"></div>
          <div className="h-24 bg-muted rounded-md"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !lesson) {
    return (
      <AdminLayout title="Lesson Details">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-destructive mb-4">
              Failed to load lesson details
            </p>
            <Button onClick={() => navigate(`/admin/lessons`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Course
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Lesson Details">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <Badge
            variant={lesson.status === 'PUBLISHED' ? 'default' : 'outline'}
          >
            {lesson.status === 'PUBLISHED' ? 'Published' : 'Draft'}
          </Badge>
        </div>

        <div className="flex space-x-2">
          <Button
            variant={lesson.status === 'PUBLISHED' ? 'outline' : 'default'}
            onClick={handleStatusToggle}
          >
            {lesson.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Lesson
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="preview">Video</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="mt-4">
                  <div className="prose max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: lesson.content || 'No content available',
                      }}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="preview" className="mt-4">
                  {lesson.video_url ? (
                    <div className="aspect-video">
                      <video
                        src={lesson.video_url}
                        className="w-full h-full border rounded-md"
                        controls
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border rounded-md p-12 bg-muted/20">
                      <Video className="h-12 w-12 text-muted-foreground mb-4" />
                      <p>No video available for this lesson</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Lesson Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Duration
                </h3>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{lesson.duration_readable}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Section
                </h3>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Section {lesson.section}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Order
                </h3>
                <div className="flex items-center">
                  <ListOrdered className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{lesson.order || 'Not set'}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Status
                </h3>
                <div className="flex items-center">
                  {lesson.status === 'PUBLISHED' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Published</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2 text-amber-500" />
                      <span>Draft</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Created
                </h3>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {new Date(lesson.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Last Updated
                </h3>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {new Date(lesson.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {lesson.resources && lesson.resources.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Resources
                    </h3>
                    <ul className="text-sm space-y-1">
                      {lesson.resources.map((resource: any, index: number) => (
                        <li key={index}>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {resource.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {courseId && (
        <LessonModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            refetch();
          }}
          courseId={courseId}
          lesson={lesson}
        />
      )}
    </AdminLayout>
  );
};

export default LessonDetailPage;
