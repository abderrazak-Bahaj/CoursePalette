
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userEnrolledCourses } from "@/data/mockData";
import CourseProgressCard from "./CourseProgressCard";

const CourseProgressTabs = () => {
  const [activeTab, setActiveTab] = useState("in-progress");

  // Filter courses based on active tab
  const filteredCourses = userEnrolledCourses.filter((course) => {
    if (activeTab === "in-progress") {
      return course.progress < 100;
    } else if (activeTab === "completed") {
      return course.progress === 100;
    }
    return true;
  });

  return (
    <Tabs defaultValue="in-progress" onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="all">All Courses</TabsTrigger>
      </TabsList>
      
      <TabsContent value="in-progress" className="mt-0">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              You don't have any courses in progress.
            </p>
            <Button asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <CourseProgressCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="completed" className="mt-0">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              You haven't completed any courses yet.
            </p>
            <Button asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <CourseProgressCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="all" className="mt-0">
        <div className="space-y-4">
          {userEnrolledCourses.map((course) => (
            <CourseProgressCard key={course.id} course={course} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CourseProgressTabs;
