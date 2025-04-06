import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TipTapEditor } from '@/components/ui/tiptap-editor';
import { useToast } from '@/hooks/use-toast';
import { courseService, CourseData } from '@/services/api/courseService';
import { Course } from '@/types/course';

const courseSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' }),
  category_id: z.string().min(1, { message: 'Please select a category' }),
  price: z.coerce.number().min(0, { message: 'Price cannot be negative' }),
  level: z.string().min(1, { message: 'Please select a level' }),
  instructor_id: z.string().optional(),
  status: z.string().optional(),
});

type CourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  course?: Course;
};

const CourseModal = ({ isOpen, onClose, course }: CourseModalProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [content, setContent] = useState(course?.description || '');
  const isEditing = !!course;

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title || '',
      description: course?.description || '',
      category_id: course?.category || '',
      price: course?.price || 0,
      level: course?.level || '',
      status: 'draft',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CourseData) => courseService.createCourse(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create course',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourseData }) =>
      courseService.updateCourse(id, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update course',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const handleSubmit = (values: z.infer<typeof courseSchema>) => {
    const courseData: CourseData = {
      ...values,
      content,
    };

    if (isEditing && course) {
      updateMutation.mutate({ id: course.id, data: courseData });
    } else {
      createMutation.mutate(courseData);
    }
  };

  const handleClose = () => {
    form.reset();
    setContent('');
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter course title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a brief description"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Detailed Content</FormLabel>
              <TipTapEditor
                content={content}
                onChange={setContent}
                placeholder="Write detailed course content here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Web Development">
                          Web Development
                        </SelectItem>
                        <SelectItem value="Data Science">
                          Data Science
                        </SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'Saving...'
                  : isEditing
                    ? 'Update Course'
                    : 'Create Course'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseModal;
