
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lesson } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Edit, ArrowLeft, ChevronLeft, CheckCircle, Clock, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/AdminLayout";
import LessonModal from "@/components/admin/LessonModal";
import { mockCourses } from "@/data/mockData";

const LessonDetailPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Find course and lesson from mockData
  const course = courseId ? mockCourses.find(c => c.id === courseId) : null;
  const lesson = course?.lessons?.find(l => l.id === lessonId);
  
  // If missing IDs
  if (!courseId || !lessonId) {
    navigate("/admin/lessons");
    toast({
      title: "Error",
      description: "Missing course or lesson ID",
      variant: "destructive"
    });
    return null;
  }
  
  const isLoading = false;
  
  const [lessonState, setLessonState] = useState({
    completed: lesson?.completed || false,
  });
  
  const handleStatusToggle = () => {
    setLessonState(prev => ({ ...prev, completed: !prev.completed }));
    
    toast({
      title: "Success",
      description: lessonState.completed 
        ? "Lesson unpublished successfully" 
        : "Lesson published successfully"
    });
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
  
  if (!course || !lesson) {
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
            <p className="text-destructive mb-4">Failed to load lesson details</p>
            <Button onClick={() => navigate("/admin/lessons")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Lessons
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  // Merge lesson data with state
  const lessonWithState = {
    ...lesson,
    completed: lessonState.completed,
    content: lesson.content || '<p>This is sample lesson content.</p>',
    description: lesson.description || 'This is a sample lesson description.'
  };

  return (
    <AdminLayout title="Lesson Details">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{lessonWithState.title}</h1>
          <Badge variant={lessonWithState.completed ? "default" : "outline"}>
            {lessonWithState.completed ? "Published" : "Draft"}
          </Badge>
          {lessonWithState.isPreview && <Badge className="bg-blue-500">Preview</Badge>}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={lessonWithState.completed ? "outline" : "default"}
            onClick={handleStatusToggle}
          >
            {lessonWithState.completed ? "Unpublish" : "Publish"}
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
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="mt-4">
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: lessonWithState.content || "No content available" }} />
                  </div>
                </TabsContent>
                <TabsContent value="preview" className="mt-4">
                  {lessonWithState.videoUrl ? (
                    <div className="aspect-video">
                      <iframe 
                        src={lessonWithState.videoUrl}
                        className="w-full h-full border rounded-md"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
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
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Duration</h3>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{lessonWithState.duration}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Order</h3>
                <span>{lessonWithState.order || "Not set"}</span>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p className="text-sm">{lessonWithState.description}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <div className="flex items-center">
                  {lessonWithState.completed ? (
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
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Visibility</h3>
                <span>{lessonWithState.isPreview ? "Free Preview" : "Premium Content"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {courseId && (
        <LessonModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          courseId={courseId}
          lesson={lessonWithState as Lesson}
        />
      )}
    </AdminLayout>
  );
};

export default LessonDetailPage;
