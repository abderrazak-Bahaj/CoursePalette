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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TipTapEditor } from '@/components/ui/tiptap-editor';
import { useToast } from '@/hooks/use-toast';
import { lessonService, LessonData } from '@/services/api/lessonService';
import { Lesson } from '@/types/course';

const lessonSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' }),
  duration: z.coerce
    .number()
    .min(1, { message: 'Duration must be at least 1 minute' }),
  video_url: z
    .string()
    .url({ message: 'Please enter a valid video URL' })
    .optional()
    .or(z.literal('')),
  is_preview: z.boolean().default(false),
  order: z.coerce.number().optional(),
});

type LessonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  lesson?: Lesson;
};

const LessonModal = ({
  isOpen,
  onClose,
  courseId,
  lesson,
}: LessonModalProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [content, setContent] = useState(lesson?.content || '');
  const isEditing = !!lesson;

  const form = useForm<z.infer<typeof lessonSchema>>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title || '',
      description: '', // No description in the Lesson type, we'll add it
      duration: lesson ? parseInt(lesson.duration) : 0,
      video_url: lesson?.videoUrl || '',
      is_preview: lesson?.isPreview || false,
      order: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: LessonData) =>
      lessonService.createLesson(courseId, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Lesson created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create lesson',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: LessonData }) =>
      lessonService.updateLesson(courseId, lessonId, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Lesson updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update lesson',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const handleSubmit = (values: z.infer<typeof lessonSchema>) => {
    const lessonData: LessonData = {
      title: values.title, // Ensure title is included
      description: values.description,
      content,
      duration: values.duration,
      video_url: values.video_url,
      is_preview: values.is_preview,
      order: values.order,
      status: 'draft',
    };

    if (isEditing && lesson) {
      updateMutation.mutate({ lessonId: lesson.id, data: lessonData });
    } else {
      createMutation.mutate(lessonData);
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
            {isEditing ? 'Edit Lesson' : 'Create New Lesson'}
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
                  <FormLabel>Lesson Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter lesson title" {...field} />
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
              <FormLabel>Lesson Content</FormLabel>
              <TipTapEditor
                content={content}
                onChange={setContent}
                placeholder="Write lesson content here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/video.mp4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_preview"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Make this lesson a free preview</FormLabel>
                    </div>
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
                    ? 'Update Lesson'
                    : 'Create Lesson'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LessonModal;
