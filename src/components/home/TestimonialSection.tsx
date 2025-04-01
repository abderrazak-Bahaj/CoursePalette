
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

// Mock testimonials data
const testimonials = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Software Developer",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    content:
      "CoursePalette completely changed my career path. I went from knowing basic HTML to becoming a full-stack developer in just 6 months. The instructors are world-class and the community support is incredible!",
    course: "Complete Web Development Bootcamp",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "Data Analyst",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    content:
      "As someone with no background in data science, I was amazed at how well-structured the courses were. The step-by-step approach helped me land my dream job as a data analyst at a Fortune 500 company.",
    course: "Data Science Specialization",
    rating: 5,
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Marketing Manager",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
    content:
      "The digital marketing courses here are top-notch. I implemented the strategies I learned and saw a 200% increase in our company's conversion rate within just three months.",
    course: "Digital Marketing Masterclass",
    rating: 4,
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    role: "UI/UX Designer",
    image: "https://randomuser.me/api/portraits/women/28.jpg",
    content:
      "I switched from graphic design to UX design after taking courses here. The practical projects and portfolio reviews were invaluable. I now work at a leading tech company designing user experiences.",
    course: "UI/UX Design Professional Certificate",
    rating: 5,
  },
];

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const testimonial = testimonials[currentIndex];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from learners who have achieved their goals with CoursePalette
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-none shadow-xl">
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <Avatar className="w-20 h-20 md:w-24 md:h-24 mb-4">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${
                          i < testimonial.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="text-xl md:text-2xl mb-4 italic text-gray-700">
                    "{testimonial.content}"
                  </div>
                  <div className="mb-2">
                    <div className="font-semibold text-lg">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.role}</div>
                  </div>
                  <div className="text-sm text-course-blue">
                    Course: {testimonial.course}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-course-blue scale-110"
                    : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          
          <div className="flex justify-center mt-6 space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              aria-label="Previous testimonial"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              aria-label="Next testimonial"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;
