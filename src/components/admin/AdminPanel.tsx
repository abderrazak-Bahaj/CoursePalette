
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookText, Users, BarChart3, GraduationCap } from "lucide-react";
import CoursesTabContent from "./CoursesTabContent";
import CategoriesTabContent from "./CategoriesTabContent";
import LessonsTabContent from "./LessonsTabContent";

interface AdminPanelProps {
  className?: string;
}

const AdminPanel = ({ className }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState("courses");

  return (
    <div className={className}>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Link to="/admin/courses">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                <BookText className="h-6 w-6" />
                <span>Courses</span>
              </Button>
            </Link>
            <Link to="/admin/lessons">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                <GraduationCap className="h-6 w-6" />
                <span>Lessons</span>
              </Button>
            </Link>
            <Link to="/admin/students">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                <Users className="h-6 w-6" />
                <span>Students</span>
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                <BarChart3 className="h-6 w-6" />
                <span>Reports</span>
              </Button>
            </Link>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="courses" className="flex-1">Courses</TabsTrigger>
              <TabsTrigger value="categories" className="flex-1">Categories</TabsTrigger>
              <TabsTrigger value="lessons" className="flex-1">Lessons</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses" className="space-y-4">
              <CoursesTabContent />
            </TabsContent>
            
            <TabsContent value="categories" className="space-y-4">
              <CategoriesTabContent />
            </TabsContent>
            
            <TabsContent value="lessons" className="space-y-4">
              <LessonsTabContent />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
