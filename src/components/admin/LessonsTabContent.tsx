
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import LessonForm from "./LessonForm";
import LessonsList from "./LessonsList";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface LessonsTabContentProps {
  className?: string;
}

const LessonsTabContent = ({ className }: LessonsTabContentProps) => {
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("1"); // Default courseId

  // Mock courses - in a real app, these would come from an API
  const courses = [
    { id: "1", title: "Web Development Basics" },
    { id: "2", title: "React for Beginners" },
    { id: "3", title: "JavaScript Masterclass" }
  ];

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Manage Lessons</h3>
        {!isAddingLesson && (
          <Button onClick={() => setIsAddingLesson(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        )}
      </div>
      
      {!isAddingLesson && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">
            Select a course to manage its lessons:
          </p>
          <Select 
            value={selectedCourseId} 
            onValueChange={setSelectedCourseId}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {isAddingLesson ? (
        <LessonForm 
          onCancel={() => setIsAddingLesson(false)} 
          courseId={selectedCourseId}
        />
      ) : (
        <LessonsList courseId={selectedCourseId} />
      )}
    </div>
  );
};

export default LessonsTabContent;
