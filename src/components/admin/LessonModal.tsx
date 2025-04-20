import { useState, useEffect } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';

type LessonFormValues = {
  title: string;
  description: string;
  duration: number;
  video_url?: string;
  video_file?: File;
  order?: number;
  section: number;
  status: 'DRAFT' | 'PUBLISHED';
};

const createLessonSchema = (isUrl: boolean) => {
  return z.object({
    title: z
      .string()
      .min(5, { message: 'Title must be at least 5 characters' }),

    duration: z.coerce
      .number()
      .min(1, { message: 'Duration must be at least 1 minute' }),
    video_url: isUrl
      ? z
          .string()
          .url({ message: 'Please enter a valid video URL' })
          .optional()
          .or(z.literal(''))
      : z.any().optional(),
    video_file: isUrl ? z.any().optional() : z.instanceof(File).optional(),
    order: z.coerce.number().optional(),
    section: z.coerce
      .number()
      .min(1, { message: 'Section must be at least 1' }),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  });
};

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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSource, setVideoSource] = useState<'url' | 'file'>('url');
  const isEditing = !!lesson;
  const isUrl = videoSource === 'url';

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(createLessonSchema(isUrl)),
    defaultValues: {
      title: lesson?.title || '',
      duration: lesson ? parseInt(lesson.duration) : 0,
      video_url: lesson?.video_url || '',
      order: lesson?.order || 0,
      section: lesson?.section || 1,
      status: lesson?.status || 'DRAFT',
    },
  });

  useEffect(() => {
    if (lesson) {
      console.log('Lesson data:', lesson);
      form.reset({
        title: lesson.title,
        duration: parseInt(lesson.duration),
        video_url: lesson.video_url || '',
        order: lesson.order || 0,
        section: lesson.section || 1,
        status: lesson.status || 'DRAFT',
      });
      setContent(lesson.content || '');

      // Check if the lesson has a video URL
      if (lesson.video_url) {
        setVideoSource('url');
      } else {
        setVideoSource('file');
      }
    }
  }, [lesson, form]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return lessonService.createLesson(courseId, data);
    },
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
    mutationFn: async ({
      lessonId,
      data,
    }: {
      lessonId: string;
      data: FormData;
    }) => {
      return lessonService.updateLesson(courseId, lessonId, data);
    },
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

  const handleSubmit = (values: LessonFormValues) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('content', content);
    formData.append('duration', values.duration.toString());
    formData.append('order', values.order?.toString() || '0');
    formData.append('section', values.section.toString());
    formData.append('status', values.status);

    // If we're using a URL and it's not empty, add it to the form data
    if (videoSource === 'url' && values.video_url) {
      formData.append('video_url', values.video_url);
    }
    // If we're using a file upload and there's a file, add it
    else if (videoSource === 'file' && videoFile) {
      formData.append('video_file', videoFile);
    }
    // If we're editing and switching from URL to file but no file selected, leave video_url blank
    else if (isEditing && videoSource === 'file') {
      formData.append('video_url', ''); // Clear the URL if switching to file upload
    }

    if (isEditing && lesson) {
      formData.append('_method', 'PUT');
      updateMutation.mutate({ lessonId: lesson.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleClose = () => {
    form.reset();
    setContent('');
    setVideoFile(null);
    setVideoSource('url');
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

            <div className="space-y-2">
              <FormLabel>Lesson Content</FormLabel>
              <TipTapEditor
                content={content}
                onChange={setContent}
                placeholder="Write lesson content here..."
              />
            </div>

            <div className="space-y-4">
              <FormLabel>Video Source</FormLabel>
              <RadioGroup
                value={videoSource}
                onValueChange={(value: 'url' | 'file') => setVideoSource(value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="url" id="url" />
                  <Label htmlFor="url">Video URL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="file" id="file" />
                  <Label htmlFor="file">Upload Video</Label>
                </div>
              </RadioGroup>

              {videoSource === 'url' ? (
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
                      {field.value && (
                        <div className="mt-2">
                          <video
                            src={field.value}
                            controls
                            className="w-full rounded-md"
                            style={{ maxHeight: '200px' }}
                          />
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-2">
                  <FormLabel>Video File</FormLabel>
                  <ImageUpload
                    value={
                      videoFile ? URL.createObjectURL(videoFile) : undefined
                    }
                    onChange={(file) => setVideoFile(file)}
                    accept="video/*"
                    maxSize={500 * 1024 * 1024} // 500MB
                    className="aspect-video"
                  />
                </div>
              )}
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
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
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
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                      </select>
                    </FormControl>
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
