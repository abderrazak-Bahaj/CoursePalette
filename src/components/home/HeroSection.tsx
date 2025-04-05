
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, CheckCircle } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-course-blue to-blue-500 text-white py-20 md:py-28 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
        <div className="absolute bottom-10 right-20 w-60 h-60 rounded-full bg-white"></div>
        <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-4">
              Start Your Learning Journey Today
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Learn Without <span className="text-yellow-300">Limits</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed">
              Start, switch, or advance your career with thousands of courses, 
              professional certificates, and degrees from world-class universities
              and companies.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-course-blue hover:bg-gray-100 font-medium shadow-lg shadow-blue-900/20"
              >
                <Link to="/courses" className="flex items-center">
                  Browse Courses <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/10  hover:border-white bg-white/10  text-white hover:text-white hover:bg-white/10 shadow-lg shadow-blue-900/10"
              >
                <Link to="/register">Join for Free</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-10">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/20 text-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-white">Why CoursePalette?</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-course-blue rounded-full p-1 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </span>
                  <span className="opacity-90">Access to 10,000+ top-rated courses</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-course-blue rounded-full p-1 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </span>
                  <span className="opacity-90">Earn certificates from leading institutions</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-course-blue rounded-full p-1 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </span>
                  <span className="opacity-90">Learn at your own pace, anytime, anywhere</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-course-blue rounded-full p-1 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </span>
                  <span className="opacity-90">Instructors from top global universities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
