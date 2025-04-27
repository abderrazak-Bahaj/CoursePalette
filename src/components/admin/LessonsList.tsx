import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Plus,
  ChevronDown,
  PlayCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';
import { lessonService } from '@/services/api/lessonService';
import { useToast } from '@/hooks/use-toast';
import { Lesson } from '@/types/course';
import LessonModal from './LessonModal';
import { useAuth } from '@/hooks/useAuth';

interface LessonsListProps {
  courseId: string;
  onAddNew: () => void;
}

const LessonsList = ({ courseId, onAddNew }: LessonsListProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isTeacher } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | undefined>(
    undefined
  );
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({});

  const {
    data: lessonsResponse = { lessons: [] },
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: async () => await lessonService.getCourseLessons(courseId),
    enabled: !!courseId,
  });

  const lessons = lessonsResponse?.lessons || [];

  // Initialize all sections as expanded by default
  useEffect(() => {
    if (lessons.length > 0) {
      const initialExpandedState = lessons.reduce(
        (acc, lesson) => {
          const section = lesson.section || 1;
          acc[section] = true;
          return acc;
        },
        {} as Record<number, boolean>
      );
      setExpandedSections(initialExpandedState);
    }
  }, [lessons]);

  console.log('lessons', lessons);

  const deleteMutation = useMutation({
    mutationFn: (lessonId: string) =>
      lessonService.deleteLesson(courseId, lessonId),
    onSuccess: () => {
      toast({
        title: 'Lesson deleted',
        description: 'The lesson has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
      setLessonToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete lesson',
        variant: 'destructive',
      });
      console.error('Failed to delete lesson:', error);
    },
  });

  const handleEdit = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const handleView = (lesson: Lesson) => {
    navigate(`/admin/courses/${courseId}/lessons/${lesson.id}`);
  };

  const handleDelete = (lessonId: string) => {
    deleteMutation.mutate(lessonId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-green-500">Published</Badge>;
      case 'DRAFT':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Group and sort lessons by section and order
  const groupedLessons = lessons.reduce(
    (acc, lesson) => {
      const section = lesson.section || 1;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(lesson);
      return acc;
    },
    {} as Record<number, Lesson[]>
  );

  const sortedSections = Object.keys(groupedLessons)
    .map(Number)
    .sort((a, b) => a - b);

  sortedSections.forEach((section) => {
    groupedLessons[section].sort((a, b) => a.order - b.order);
  });

  const toggleSection = (section: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
          <div className="text-red-500">
            Error loading lessons. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {lessons.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">
                No lessons found for this course
              </p>
              <Button variant="outline" className="mt-4" onClick={onAddNew}>
                Create your first lesson
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSections.map((section) => (
                  <>
                    <TableRow
                      key={`section-${section}`}
                      className="bg-muted/50 cursor-pointer hover:bg-muted/70"
                      onClick={() => toggleSection(section)}
                    >
                      <TableCell colSpan={6} className="font-medium">
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              expandedSections[section]
                                ? 'rotate-0'
                                : '-rotate-90'
                            }`}
                          />
                          <span>Section {section}</span>
                          <Badge variant="secondary" className="ml-2">
                            {groupedLessons[section].length} lessons
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedSections[section] &&
                      groupedLessons[section].map((lesson, index) => (
                        <TableRow key={lesson.id}>
                          <TableCell className="font-medium">
                            {lesson.order}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {lesson.title}
                              </span>
                              {lesson.description && (
                                <span className="text-sm text-muted-foreground">
                                  {lesson.description}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{lesson.duration_readable}</TableCell>
                          <TableCell>
                            {lesson.video_url ? (
                              <Link to={lesson.video_url} target="_blank">
                                <Badge className="bg-blue-500">
                                  Video
                                  <PlayCircle className="ml-2 h-4 w-4" />
                                </Badge>
                              </Link>
                            ) : (
                              <Badge variant="outline">No Video</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(lesson.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleView(lesson)}
                                  className="flex items-center"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>View</span>
                                </DropdownMenuItem>
                                {isTeacher && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleEdit(lesson)}
                                      className="flex items-center"
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      <span>Edit</span>
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => setLessonToDelete(lesson)}
                                  className="flex items-center text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
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

      <AlertDialog
        open={!!lessonToDelete}
        onOpenChange={(open) => !open && setLessonToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              lesson "{lessonToDelete?.title}".
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
