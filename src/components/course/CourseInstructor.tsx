import { User, Star, Video } from 'lucide-react';

interface CourseInstructorProps {
  instructor: {
    name: string;
    avatar?: string;
  };
  category: string;
}

export const CourseInstructor = ({
  instructor,
  category,
}: CourseInstructorProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Your Instructor</h2>
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-shrink-0">
          <img
            src={`https://ui-avatars.com/api/?name=${instructor.name}&size=128&background=random`}
            alt={instructor.name}
            className="rounded-full w-24 h-24 object-cover"
          />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">{instructor.name}</h3>
          <p className="text-gray-500 mb-4">Expert in {category}</p>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center">
              <Star className="text-yellow-400 fill-yellow-400 h-5 w-5 mr-1" />
              <span className="font-medium">4.8 Instructor Rating</span>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-1 text-gray-500" />
              <span>50,000+ Students</span>
            </div>
            <div className="flex items-center">
              <Video className="h-5 w-5 mr-1 text-gray-500" />
              <span>10+ Courses</span>
            </div>
          </div>
          <p className="mb-4">
            {instructor.name} is a highly experienced educator with over 10
            years of professional experience in {category}. They've helped
            thousands of students achieve their learning goals through
            practical, hands-on courses.
          </p>
          <p>
            Their teaching approach focuses on real-world applications, making
            complex concepts easy to understand for students of all levels. With
            a passion for teaching and a deep understanding of industry best
            practices, they're committed to helping you succeed in your learning
            journey.
          </p>
        </div>
      </div>
    </div>
  );
};
