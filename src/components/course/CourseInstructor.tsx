import { User, Star, Video, GraduationCap, Award } from 'lucide-react';

interface Education {
  degree: string;
  institution: string;
  year: number;
}

interface Certification {
  name: string;
  year: number;
}

interface Teacher {
  specialization: string;
  qualification: string;
  expertise: string;
  education: Education[];
  certifications: Certification[];
  rating: string;
  years_of_experience: number;
}

interface CourseInstructorProps {
  instructor: {
    name: string;
    avatar?: string;
    bio?: string;
    teacher: Teacher;
  };
}

export const CourseInstructor = ({ instructor }: CourseInstructorProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Your Instructor</h2>
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-shrink-0">
          <img
            src={instructor.avatar || `https://ui-avatars.com/api/?name=${instructor.name}&size=128&background=random`}
            alt={instructor.name}
            className="rounded-full w-24 h-24 object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{instructor.name}</h3>
          <p className="text-gray-500 mb-4">{instructor.teacher.qualification}</p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center">
              <Star className="text-yellow-400 fill-yellow-400 h-5 w-5 mr-1" />
              <span className="font-medium">{instructor.teacher.rating} Instructor Rating</span>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-1 text-gray-500" />
              <span>{instructor.teacher.years_of_experience}+ Years Experience</span>
            </div>
            <div className="flex items-center">
              <Video className="h-5 w-5 mr-1 text-gray-500" />
              <span>Expert in {instructor.teacher.expertise}</span>
            </div>
          </div>

          <p className="mb-4">{instructor.bio}</p>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Education</h4>
            <div className="space-y-2">
              {instructor.teacher.education.map((edu, index) => (
                <div key={index} className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{edu.degree} from {edu.institution} ({edu.year})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Certifications</h4>
            <div className="space-y-2">
              {instructor.teacher.certifications.map((cert, index) => (
                <div key={index} className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{cert?.name} ({cert?.year})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
