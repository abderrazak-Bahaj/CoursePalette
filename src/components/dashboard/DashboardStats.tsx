import { BookOpen, Award, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ds/primitives/Card';

interface DashboardStatsProps {
  enrolledCourses: string;
  certificatesEarned: string;
  learningHours: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  enrolledCourses,
  certificatesEarned,
  learningHours,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-violet-600/10 p-3 mr-4">
              <BookOpen className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <div className="text-sm text-neutral-400">Enrolled Courses</div>
              <div className="font-serif text-2xl font-bold text-neutral-50">
                {enrolledCourses}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-amber-500/10 p-3 mr-4">
              <Award className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="text-sm text-neutral-400">Certificates</div>
              <div className="font-serif text-2xl font-bold text-neutral-50">
                {certificatesEarned}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-violet-600/10 p-3 mr-4">
              <Clock className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <div className="text-sm text-neutral-400">Learning Hours</div>
              <div className="font-serif text-2xl font-bold text-neutral-50">
                {learningHours}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
