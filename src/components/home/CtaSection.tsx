
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CtaSection = () => {
  return (
    <div className="bg-course-navy py-16 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Start Your Learning Journey?
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 opacity-90">
          Join our global community of learners and transform your future with in-demand 
          skills. Get started today with thousands of courses taught by expert instructors.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-white text-course-navy hover:bg-gray-100"
          >
            <Link to="/register">Get Started for Free</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white hover:bg-white/10"
          >
            <Link to="/courses">Explore Courses</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CtaSection;
