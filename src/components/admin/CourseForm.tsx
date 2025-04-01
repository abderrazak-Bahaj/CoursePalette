
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { TipTapEditor } from "@/components/ui/tiptap-editor";
import CourseFormBasicInfo from "./CourseFormBasicInfo";
import CourseFormCategories from "./CourseFormCategories";
import CourseFormDetails from "./CourseFormDetails";
import { courseService, CourseData } from "@/services/api/courseService";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const courseFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  instructor: z.string().min(3, { message: "Instructor name is required" }),
  category: z.string().min(1, { message: "Please select a category" }),
  level: z.string().min(1, { message: "Please select a level" }),
  price: z.coerce.number().min(0, { message: "Price cannot be negative" }),
  duration: z.coerce.number().min(1, { message: "Duration must be at least 1 hour" }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL" }),
});

interface CourseFormProps {
  onCancel: () => void;
  editCourse?: any;
}

const CourseForm = ({ onCancel, editCourse }: CourseFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [content, setContent] = useState(editCourse?.content || "");
  
  // Initialize the form with default values or values from editCourse if provided
  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: editCourse ? {
      title: editCourse.title,
      description: editCourse.description,
      instructor: editCourse.instructor,
      category: editCourse.category,
      level: editCourse.level,
      price: editCourse.price,
      duration: editCourse.duration,
      imageUrl: editCourse.image,
    } : {
      title: "",
      description: "",
      instructor: "",
      category: "",
      level: "",
      price: 0,
      duration: 0,
      imageUrl: "",
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: (data: CourseData) => courseService.createCourse(data),
    onSuccess: () => {
      toast({
        title: "Course Created",
        description: "The course has been created successfully.",
      });
      navigate("/admin/courses");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to create course:", error);
    }
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourseData }) => 
      courseService.updateCourse(id, data),
    onSuccess: () => {
      toast({
        title: "Course Updated",
        description: "The course has been updated successfully.",
      });
      navigate("/admin/courses");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update course. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update course:", error);
    }
  });

  const onSubmit = async (formData: z.infer<typeof courseFormSchema>) => {
    const courseData: CourseData = {
      title: formData.title,
      description: formData.description,
      content,
      category_id: formData.category,
      price: formData.price,
      level: formData.level,
      status: "draft",
    };

    if (editCourse) {
      updateCourseMutation.mutate({
        id: editCourse.id,
        data: courseData
      });
    } else {
      createCourseMutation.mutate(courseData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CourseFormBasicInfo form={form} />
        <CourseFormCategories form={form} />
        <CourseFormDetails form={form} />
        
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Course Content
          </label>
          <TipTapEditor 
            content={content} 
            onChange={setContent} 
            placeholder="Write your course content here..." 
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
          >
            {(createCourseMutation.isPending || updateCourseMutation.isPending) 
              ? "Saving..." 
              : editCourse 
                ? "Update Course" 
                : "Create Course"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CourseForm;
