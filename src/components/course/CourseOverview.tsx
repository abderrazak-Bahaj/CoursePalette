import { Check } from 'lucide-react';

interface CourseOverviewProps {
  description: string;
  skills: string[];
  category: string;
}

export const CourseOverview = ({
  description,
  skills,
  category,
}: CourseOverviewProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">About This Course</h2>
      <p className="mb-6">{description}</p>

      <h3 className="text-xl font-bold mb-4">What You'll Learn</h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {skills?.map((skill, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
            <span>{skill}</span>
          </li>
        ))}
      </ul>

      <h3 className="text-xl font-bold mb-4">Requirements</h3>
      <ul className="list-disc pl-5 mb-8 space-y-2">
        <li>
          No prior knowledge is required - we'll teach you everything you need
          to know
        </li>
        <li>A computer with internet access</li>
        <li>Enthusiasm and determination to learn</li>
      </ul>

      <h3 className="text-xl font-bold mb-4">Who this course is for:</h3>
      <ul className="list-disc pl-5 space-y-2">
        <li>Anyone interested in learning {category}</li>
        <li>Students looking to gain practical skills in {category}</li>
        <li>Professionals wanting to upskill or change careers</li>
      </ul>
    </div>
  );
};
