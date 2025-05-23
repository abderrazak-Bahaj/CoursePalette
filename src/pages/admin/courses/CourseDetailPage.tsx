import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Clock,
  GraduationCap,
  Users,
  FileText,
  Video,
  Link,
  ChevronLeft,
  ArrowLeft,
  Edit,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { courseService } from '@/services/api/courseService';
import { useAuth } from '@/hooks/useAuth';

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState('lessons');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isTeacher } = useAuth();

  const {
    data: courseData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourse(courseId!),
    enabled: !!courseId,
  });

  const course = courseData?.course;

  // If missing ID
  if (!courseId) {
    navigate('/admin/courses');
    toast({
      title: 'Error',
      description: 'Missing course ID',
      variant: 'destructive',
    });
    return null;
  }

  if (isLoading) {
    return (
      <AdminLayout title="Course Details">
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

  if (error || !course) {
    return (
      <AdminLayout title="Course Details">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-destructive mb-4">Failed to load course details</p>
            <Button onClick={() => navigate('/admin/courses')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Courses
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Course Details">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <Badge variant={course.status === 'PUBLISHED' ? 'default' : 'outline'}>
            {course.status === 'PUBLISHED' ? 'Published' : 'Draft'}
          </Badge>
        </div>

        {isTeacher && (
          <div className="flex space-x-2">
            <Button onClick={() => navigate(`/admin/courses/${courseId}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Course
            </Button>
            <Button onClick={() => navigate(`/admin/courses/${courseId}/lessons/create`)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lesson
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Main Content Area - Spans 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          {/* Course Overview Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Course Overview</CardTitle>
              <Badge variant="outline" className="ml-2">
                {course.category?.name || 'Uncategorized'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
                <img 
                  src={course.image_url} 
                  alt={course.title} 
                  className="w-full aspect-video object-cover"
                />
              </div>
              <div className="prose max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: course.description || 'No description available',
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Course Content Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="lessons">Lessons</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="lessons" className="mt-4">
                  <div className="space-y-4">
                    {course.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                            <Video className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{lesson.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Section {lesson.section} • {lesson.duration_readable}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{lesson.status}</Badge>
                          <Button
                            variant="ghost"
                            onClick={() =>
                              navigate(`/admin/courses/${courseId}/lessons/${lesson.id}`)
                            }
                          >
                            View Lesson
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="assignments" className="mt-4">
                  <div className="space-y-4">
                    {course.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{assignment.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.type} • Due{' '}
                              {new Date(assignment.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {/* <div className="flex items-center space-x-2">
                          <Badge
                            variant={assignment.is_overdue ? 'destructive' : 'default'}
                          >
                            {assignment.is_overdue ? 'Overdue' : 'Active'}
                          </Badge>
                          <Button variant="ghost">View Details</Button>
                        </div> */}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-4">
                  <div className="space-y-4">
                    {course.resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                            {resource.is_video ? (
                              <Video className="h-6 w-6 text-primary" />
                            ) : resource.is_link ? (
                              <Link className="h-6 w-6 text-primary" />
                            ) : (
                              <FileText className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {resource.type} • {resource.file_size_formatted}
                            </p>
                          </div>
                        </div>
                        {resource.url && (
                          <Button variant="ghost" asChild>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Resource
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Spans 1 column */}
        <div className="space-y-6">
          {/* Course Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Level</p>
                  <div className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{course.level}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{course.duration_readable}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Language</p>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{course.language}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {course.is_free
                        ? 'Free'
                        : new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(Number(course.price))}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center">
                  {course.status === 'PUBLISHED' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Published</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                      <span>Draft</span>
                    </>
                  )}
                </div>
              </div>

              {course.skills && course.skills.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {course.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructor Card */}
          <Card>
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {course.instructor.avatar ? (
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium">
                      {course.instructor.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{course.instructor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.instructor.teacher.specialization}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p>{course.instructor.teacher.years_of_experience} years</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p>{course.instructor.teacher.rating}/5.0</p>
                </div>
              </div>

              {course.instructor.teacher.education && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Education</p>
                  <ul className="space-y-1">
                    {course.instructor.teacher.education.map((edu, index) => (
                      <li key={index} className="text-sm">
                        {edu.degree} in {edu.institution} ({edu.year})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.instructor.teacher.certifications && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Certifications</p>
                  <ul className="space-y-1">
                    {course.instructor.teacher.certifications.map((cert, index) => (
                      <li key={index} className="text-sm">
                        {cert.name} ({cert.year})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseDetailPage; 