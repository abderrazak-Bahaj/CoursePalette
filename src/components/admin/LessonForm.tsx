import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { TipTapEditor } from '@/components/ui/tiptap-editor';
import LessonFormBasicInfo from './LessonFormBasicInfo';
import LessonFormVideoDetails from './LessonFormVideoDetails';
import LessonFormResources from './LessonFormResources';
import { useNavigate } from 'react-router-dom';

const lessonFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  courseId: z.string().min(1, { message: 'Please select a course' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' }),
  videoUrl: z.string().url({ message: 'Please enter a valid video URL' }),
  duration: z.coerce
    .number()
    .min(1, { message: 'Duration must be at least 1 minute' }),
  resources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
  isPreview: z.boolean().optional(),
});

interface LessonFormProps {
  onCancel: () => void;
  courseId: string;
  editLesson?: any;
}

const LessonForm = ({ onCancel, courseId, editLesson }: LessonFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [content, setContent] = useState(editLesson?.content || '');
  const [resources, setResources] = useState<{ title: string; url: string }[]>(
    editLesson?.resources || []
  );

  // Initialize the form with default values or values from editLesson if provided
  const form = useForm<z.infer<typeof lessonFormSchema>>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: editLesson
      ? {
          title: editLesson.title,
          courseId: editLesson.courseId || courseId,
          description: editLesson.description,
          videoUrl: editLesson.videoUrl || '',
          duration: editLesson.duration ? parseInt(editLesson.duration) : 0,
          resources: editLesson.resources,
          isPreview: editLesson.isPreview || false,
        }
      : {
          title: '',
          courseId: courseId,
          description: '',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          duration: 30,
          resources: [],
          isPreview: false,
        },
  });

  const onSubmit = async (formData: z.infer<typeof lessonFormSchema>) => {
    // Simulate API call with mock data
    console.log('Submitting lesson data:', {
      ...formData,
      content,
      resources,
    });

    // Show toast and redirect
    setTimeout(() => {
      toast({
        title: editLesson ? 'Lesson Updated' : 'Lesson Created',
        description: editLesson
          ? 'The lesson has been updated successfully.'
          : 'The lesson has been created successfully.',
      });

      if (editLesson) {
        onCancel();
      } else {
        navigate(`/admin/courses/${courseId}/lessons`);
      }
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <LessonFormBasicInfo form={form} />
        <LessonFormVideoDetails form={form} />

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Lesson Content
          </label>
          <TipTapEditor
            content={content}
            onChange={setContent}
            placeholder="Write your lesson content here..."
          />
        </div>

        <LessonFormResources
          resources={resources}
          setResources={setResources}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {editLesson ? 'Update Lesson' : 'Create Lesson'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LessonForm;
