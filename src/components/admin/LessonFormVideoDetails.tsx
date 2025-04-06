import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface LessonFormVideoDetailsProps {
  form: UseFormReturn<any>;
}

const LessonFormVideoDetails = ({ form }: LessonFormVideoDetailsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/video.mp4" {...field} />
              </FormControl>
              <FormDescription>
                Enter a valid URL for the lesson video
              </FormDescription>
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
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lesson Content</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter the main content of the lesson..."
                rows={6}
                {...field}
              />
            </FormControl>
            <FormDescription>
              This will be displayed as the main content of the lesson
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default LessonFormVideoDetails;
