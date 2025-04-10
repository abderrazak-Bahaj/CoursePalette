import { BookOpen, Award, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { userEnrolledCourses } from '@/data/mockData';
import { mockCertificates } from '@/data/mockData';

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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-course-blue bg-opacity-10 p-3 mr-4">
              <BookOpen className="h-6 w-6 text-course-blue" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Enrolled Courses</div>
              <div className="text-2xl font-bold">{enrolledCourses}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Certificates</div>
              <div className="text-2xl font-bold">{certificatesEarned}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Learning Hours</div>
              <div className="text-2xl font-bold">{learningHours}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
