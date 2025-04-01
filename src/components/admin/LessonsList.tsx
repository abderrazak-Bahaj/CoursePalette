
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, MoreHorizontal, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { lessonService } from "@/services/api/lessonService";
import { useToast } from "@/hooks/use-toast";
import { Lesson } from "@/types/course";
import LessonModal from "./LessonModal";

interface LessonsListProps {
  courseId: string;
}

const LessonsList = ({ courseId }: LessonsListProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | undefined>(undefined);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  
  const { data: lessons = [], isLoading, error } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => lessonService.getCourseLessons(courseId).then(res => res.data || []),
    enabled: !!courseId,
  });

  const deleteMutation = useMutation({
    mutationFn: (lessonId: string) => lessonService.deleteLesson(courseId, lessonId),
    onSuccess: () => {
      toast({
        title: "Lesson deleted",
        description: "The lesson has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
      setLessonToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive",
      });
      console.error("Failed to delete lesson:", error);
    },
  });

  const handleAddNew = () => {
    setSelectedLesson(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const handleDelete = (lessonId: string) => {
    deleteMutation.mutate(lessonId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Loading lessons...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-500">Error loading lessons. Please try again later.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Lesson
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {lessons.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No lessons found for this course</p>
              <Button variant="outline" className="mt-4" onClick={handleAddNew}>
                Create your first lesson
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson: Lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>{lesson.duration}</TableCell>
                    <TableCell>
                      {lesson.isPreview ? 
                        <Badge className="bg-blue-500">Preview</Badge> : 
                        <Badge variant="outline">Premium</Badge>
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(lesson.completed ? "published" : "draft")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(lesson)} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setLessonToDelete(lesson)} className="flex items-center text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LessonModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        courseId={courseId}
        lesson={selectedLesson} 
      />

      <AlertDialog open={!!lessonToDelete} onOpenChange={(open) => !open && setLessonToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lesson
              "{lessonToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => lessonToDelete && handleDelete(lessonToDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LessonsList;
