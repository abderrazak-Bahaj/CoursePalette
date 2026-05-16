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
    <div className="bg-[#1e293b] border border-neutral-700 rounded-xl p-6">
      <h2 className="font-serif text-2xl font-bold text-neutral-50 mb-6">
        Your Instructor
      </h2>
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-shrink-0">
          <img
            src={
              instructor.avatar ||
              `https://ui-avatars.com/api/?name=${instructor.name}&size=128&background=random`
            }
            alt={instructor.name}
            className="rounded-full w-24 h-24 object-cover ring-2 ring-violet-500/50"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-xl font-bold text-neutral-50 mb-1">
            {instructor.name}
          </h3>
          <p className="text-neutral-400 text-sm mb-4">
            {instructor.teacher.qualification}
          </p>

          <div className="flex flex-wrap gap-4 mb-4 text-sm text-neutral-300">
            <div className="flex items-center gap-1">
              <Star className="text-amber-400 fill-amber-400 h-4 w-4" />
              <span className="font-medium">
                {instructor.teacher.rating} Rating
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-neutral-500" />
              <span>
                {instructor.teacher.years_of_experience}+ Years Experience
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Video className="h-4 w-4 text-neutral-500" />
              <span>Expert in {instructor.teacher.expertise}</span>
            </div>
          </div>

          {instructor.bio && (
            <p className="text-neutral-300 text-sm mb-5 leading-relaxed">
              {instructor.bio}
            </p>
          )}

          <div className="mb-4">
            <h4 className="font-semibold text-neutral-200 mb-2 text-sm uppercase tracking-wide">
              Education
            </h4>
            <div className="space-y-2">
              {instructor.teacher.education.map((edu, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-neutral-300"
                >
                  <GraduationCap className="h-4 w-4 text-violet-400 flex-shrink-0" />
                  <span>
                    {edu.degree} from {edu.institution} ({edu.year})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-200 mb-2 text-sm uppercase tracking-wide">
              Certifications
            </h4>
            <div className="space-y-2">
              {instructor.teacher.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-neutral-300"
                >
                  <Award className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <span>
                    {cert?.name} ({cert?.year})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
