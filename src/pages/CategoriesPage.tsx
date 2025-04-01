
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { mockCategories } from "@/data/mockData";

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter categories based on search term
  const filteredCategories = mockCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Categories</h1>
          <p className="text-gray-600 mb-8">
            Browse courses by category to find the right topics for you
          </p>
          
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search categories..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link key={category.id} to={`/categories/${category.id}`}>
                <Card className="h-full course-card-shadow course-card-hover">
                  <CardContent className="p-6">
                    <div className="flex flex-col h-full">
                      <div className="mb-4 text-4xl">
                        {/* Emoji based on category name */}
                        {category.name === "Web Development" && "💻"}
                        {category.name === "Data Science" && "📊"}
                        {category.name === "Business" && "📈"}
                        {category.name === "Design" && "🎨"}
                        {category.name === "Marketing" && "🚀"}
                        {category.name === "Photography" && "📷"}
                        {category.name === "Health & Fitness" && "🏋️‍♂️"}
                        {category.name === "Music" && "🎵"}
                        {category.name === "Personal Development" && "🧠"}
                        {category.name === "IT Certification" && "🔐"}
                        {category.name === "Language Learning" && "🗣️"}
                        {category.name === "Teaching & Academics" && "👨‍🏫"}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                      <p className="mb-4 text-sm text-gray-500">{category.count} courses</p>
                      <div className="mt-auto">
                        <Button 
                          variant="ghost" 
                          className="p-0 hover:bg-transparent hover:text-course-blue flex items-center text-sm font-medium"
                        >
                          Explore Category
                          <ChevronRight size={16} className="ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CategoriesPage;
