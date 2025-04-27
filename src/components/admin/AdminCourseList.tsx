import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, MoreHorizontal, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
import { courseService } from '@/services/api/courseService';
import CourseModal from './CourseModal';
import { Course, PaginationMeta } from '@/services/api/courseService';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { Pagination } from '@/components/ui/custom-pagination';
import { CategoriesResponse } from '@/types/category';
import { useAuth } from '@/hooks/useAuth';
interface AdminCourseListProps {
  courses: Course[];
  categories: CategoriesResponse;
  isLoading: boolean;
  pagination?: PaginationMeta;
  onPageChange: (page: number) => void;
  error?: string;
}

const AdminCourseList = ({
  courses,
  categories,
  isLoading,
  pagination,
  onPageChange,
  error,
}: AdminCourseListProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isTeacher } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(
    undefined
  );
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (courseId: string) => courseService.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast({
        title: 'Course Deleted',
        description: 'Course has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete course.',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = (courseId: string) => {
    deleteMutation.mutate(courseId);
    setCourseToDelete(null);
  };

  const handleAddNew = () => {
    setSelectedCourse(undefined);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="success">{status}</Badge>;
      case 'DRAFT':
        return <Badge variant="warning">{status}</Badge>;
      case 'ARCHIVED':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return <Badge className="bg-green-500">{level}</Badge>;
      case 'INTERMEDIATE':
        return <Badge className="bg-blue-500">{level}</Badge>;
      case 'ADVANCED':
        return <Badge className="bg-purple-500">{level}</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-500">
            Error loading courses. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {courses.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No courses found</p>
              <Button variant="outline" className="mt-4" onClick={handleAddNew}>
                Create your first course
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">
                      {course.title}
                    </TableCell>
                    <TableCell>{course.category.name}</TableCell>
                    <TableCell>{getLevelBadge(course.level)}</TableCell>
                    <TableCell>
                      {formatCurrency(parseFloat(course.price))}
                    </TableCell>
                    <TableCell>{course.duration_readable}</TableCell>
                    <TableCell>{getStatusBadge(course.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              to={`/courses/${course.id}`}
                              className="flex items-center"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View</span>
                            </Link>
                          </DropdownMenuItem>
                          {isTeacher && (
                            <DropdownMenuItem
                              onClick={() => handleEdit(course)}
                              className="flex items-center"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setCourseToDelete(course)}
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
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pagination && (
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.last_page}
          onPageChange={onPageChange}
        />
      )}

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={selectedCourse}
        categories={categories}
      />

      <AlertDialog
        open={!!courseToDelete}
        onOpenChange={(open) => !open && setCourseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              course "{courseToDelete?.title}" and all associated lessons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() =>
                courseToDelete && handleDelete(courseToDelete.id.toString())
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminCourseList;
