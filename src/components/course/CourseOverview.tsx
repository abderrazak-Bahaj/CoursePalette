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
    <div className="bg-[#1e293b] border border-neutral-700 rounded-xl p-6">
      <h2 className="font-serif text-2xl font-bold text-neutral-50 mb-6">
        About This Course
      </h2>
      <p className="text-neutral-300 mb-6 leading-relaxed">{description}</p>

      <h3 className="font-serif text-xl font-bold text-neutral-50 mb-4">
        What You'll Learn
      </h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {skills?.map((skill, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="text-neutral-300 text-sm">{skill}</span>
          </li>
        ))}
      </ul>

      <h3 className="font-serif text-xl font-bold text-neutral-50 mb-4">
        Requirements
      </h3>
      <ul className="list-disc pl-5 mb-8 space-y-2 text-neutral-300 text-sm">
        <li>
          No prior knowledge is required — we'll teach you everything you need
          to know
        </li>
        <li>A computer with internet access</li>
        <li>Enthusiasm and determination to learn</li>
      </ul>

      <h3 className="font-serif text-xl font-bold text-neutral-50 mb-4">
        Who this course is for:
      </h3>
      <ul className="list-disc pl-5 space-y-2 text-neutral-300 text-sm">
        <li>Anyone interested in learning {category}</li>
        <li>Students looking to gain practical skills in {category}</li>
        <li>Professionals wanting to upskill or change careers</li>
      </ul>
    </div>
  );
};
