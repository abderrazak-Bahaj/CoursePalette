import { Card, CardContent } from '@/components/ds/primitives/Card';
import { UsersRound, GraduationCap, Globe, BookOpen } from 'lucide-react';

const stats = [
  {
    title: 'Active Learners',
    value: '15M+',
    icon: <UsersRound className="h-10 w-10 text-violet-400" />,
    description: 'From 190+ countries',
  },
  {
    title: 'Courses',
    value: '10K+',
    icon: <BookOpen className="h-10 w-10 text-coral-400" />,
    description: 'Across all subjects',
  },
  {
    title: 'Certificates Earned',
    value: '2M+',
    icon: <GraduationCap className="h-10 w-10 text-amber-400" />,
    description: 'Career-advancing credentials',
  },
  {
    title: 'Partner Institutions',
    value: '250+',
    icon: <Globe className="h-10 w-10 text-violet-400" />,
    description: 'Universities & companies',
  },
];

const StatisticsSection = () => {
  return (
    <div className="py-16 bg-[#0f172a]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-bold text-neutral-50 mb-4">
            By The Numbers
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Join millions of learners from around the world who are achieving
            their goals with CoursePalette
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} variant="elevated">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <h3 className="font-serif text-3xl font-bold text-neutral-50 mb-1">
                  {stat.value}
                </h3>
                <p className="font-medium text-neutral-200 mb-1">
                  {stat.title}
                </p>
                <p className="text-neutral-500 text-sm">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;
