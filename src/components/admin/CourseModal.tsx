import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { categoryService } from '@/services/api/categoryService';
import { Category } from '@/types/category';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Logs } from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import { SkillsInput } from '@/components/ui/skills-input';
import { ImageUpload } from '@/components/ui/image-upload';

// Add CategoriesResponse interface
interface CategoriesResponse {
  data: Category[];
  success: boolean;
  message: string;
}

// Update the course schema to match backend types
const courseSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  category_id: z.string().min(1, { message: 'Category is required' }),
  price: z.coerce.number().min(0, { message: 'Price must be greater than 0' }),
  image: z.any().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'], {
    required_error: 'Status is required',
  }),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], {
    required_error: 'Level is required',
  }),
  skills: z.array(z.string()).default([]),
  language: z.string().min(1, { message: 'Language is required' }),
  duration: z.coerce
    .number()
    .min(1, { message: 'Duration must be at least 1' }),
});

// Update Course interface to include content
interface Course {
  id: number;
  title: string;
  description: string;
  category_id: number;
  price: string;
  image_url: string | null;
  duration: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration_readable: string;
  skills: string[];
  language: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  created_at: string;
  content?: string;
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    parent_id: number | null;
    icon: string;
    order: number;
    status: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    has_children: boolean;
  };
  last_Lesson: any | null;
  has_available_spots: boolean;
  is_active: boolean;
  is_enrolled: boolean;
  is_completed: boolean;
}

type CourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  course?: Course;
  categories?: CategoriesResponse;
};

interface ValidationError {
  success: boolean;
  message: string;
  data: {
    [key: string]: string[];
  };
}

const CourseModal = ({
  isOpen,
  onClose,
  course,
  categories,
}: CourseModalProps) => {
  console.log('course', course);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      price: 0,
      status: 'DRAFT',
      level: 'BEGINNER',
      skills: [],
      language: 'English',
      duration: 1,
      image: undefined,
    },
  });

  const isEditing = !!course;

  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description,
        category_id: course.category_id.toString(),
        price: parseFloat(course.price),
        status: course.status,
        level: course.level,
        skills: course.skills,
        language: course.language,
        duration: course.duration,
        image: undefined,
      });
    }
  }, [course]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => courseService.createCourse(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course created successfully',
      });
      queryClient.invalidateQueries({
        queryKey: ['my-courses', 'admin-courses'],
      });
      handleClose();
    },
    onError: (error: any) => {
      if (error.response?.data?.data) {
        const validationErrors = error.response.data as ValidationError;
        Object.entries(validationErrors.data).forEach(([field, messages]) => {
          form.setError(field as any, {
            type: 'manual',
            message: messages[0],
          });
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create course',
          variant: 'destructive',
        });
      }
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      courseService.updateCourse(id, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      handleClose();
    },
    onError: (error: any) => {
      if (error.response?.data?.data) {
        const validationErrors = error.response.data as ValidationError;
        Object.entries(validationErrors.data).forEach(([field, messages]) => {
          form.setError(field as any, {
            type: 'manual',
            message: messages[0],
          });
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update course',
          variant: 'destructive',
        });
      }
      console.error(error);
    },
  });

  const handleSubmit = async (values: z.infer<typeof courseSchema>) => {
    try {
      const formData = new FormData();

      // Handle skills array
      const skillsArray = Array.isArray(values.skills)
        ? values.skills
        : typeof values.skills === 'string'
          ? values.skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

      // Append all required fields
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('category_id', values.category_id);
      formData.append('price', values.price.toString());
      formData.append('status', values.status);
      formData.append('level', values.level);
      formData.append('language', values.language);
      formData.append('duration', values.duration.toString());

      // Handle skills array - append each skill individually
      skillsArray.forEach((skill, index) => {
        formData.append(`skills[${index}]`, skill);
      });

      // Handle optional image field
      if (values.image instanceof File) {
        formData.append('image', values.image);
      }

      if (isEditing && course) {
        await updateMutation.mutateAsync({
          id: course.id.toString(),
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter course description"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        {categories?.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
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
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
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
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="120"
                        {...field}
                      />
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
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input placeholder="English" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <SkillsInput
                      value={field.value}
                      onChange={(skills) => field.onChange(skills)}
                      placeholder="Type a skill and press space or comma"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Course Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={value}
                      onChange={onChange}
                      accept={[
                        'image/jpeg',
                        'image/png',
                        'image/gif',
                        'image/webp',
                      ]}
                      maxSize={5 * 1024 * 1024} // 5MB
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
