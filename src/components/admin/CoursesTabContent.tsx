import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CourseForm from './CourseForm';

interface CoursesTabContentProps {
  className?: string;
}

const CoursesTabContent = ({ className }: CoursesTabContentProps) => {
  const [isAddingCourse, setIsAddingCourse] = useState(false);

  return (
    <div className={className}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Courses</h3>
        <Button onClick={() => setIsAddingCourse(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      {isAddingCourse ? (
        <CourseForm onCancel={() => setIsAddingCourse(false)} />
      ) : (
        <p className="text-sm text-gray-500">
          Use this panel to add, edit, or remove courses from the platform.
        </p>
      )}
    </div>
  );
};

export default CoursesTabContent;
