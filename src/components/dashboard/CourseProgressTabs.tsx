import { ReactElement, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userEnrolledCourses } from '@/data/mockData';
import CourseProgressCard from './CourseProgressCard';
import { Course, Enrollment } from '@/types';

interface CourseProgressTabsProps {
  inProgress: Enrollment[];
  completed: Enrollment[];
  all: Enrollment[];
}

const CourseProgressTabs: React.FC<CourseProgressTabsProps> = ({
  all,
  completed,
  inProgress,
}) => {
  const renderContent = (enrollments: Enrollment[], type: string) => {
    if (enrollments.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            You don't have any courses in {type}.
          </p>
          <Button asChild>
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      );
    }
    return enrollments?.map((enrollment) => (
      <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
    ));
  };

  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-6">
        <TabsTrigger value="all">All Courses</TabsTrigger>
        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-0">
        <div className="space-y-4">
          {all.map((enrollment) => (
            <>
              {console.log('all', enrollment)}
              <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
            </>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="completed" className="mt-0">
        {renderContent(completed, 'courses yet')}
      </TabsContent>

      <TabsContent value="in-progress" className="mt-0">
        {renderContent(inProgress, 'progress')}
      </TabsContent>

     

    
    </Tabs>
  );
};

export default CourseProgressTabs;
