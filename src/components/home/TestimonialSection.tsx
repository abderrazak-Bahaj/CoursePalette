import { useState } from 'react';
import { Avatar } from '@/components/ds/primitives/Avatar';
import { Card, CardContent } from '@/components/ds/primitives/Card';
import { Button } from '@/components/ds/primitives/Button';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Alex Johnson',
    role: 'Software Developer',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    content:
      'CoursePalette completely changed my career path. I went from knowing basic HTML to becoming a full-stack developer in just 6 months.',
    course: 'Complete Web Development Bootcamp',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sarah Williams',
    role: 'Data Analyst',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    content:
      'As someone with no background in data science, I was amazed at how well-structured the courses were. I landed my dream job at a Fortune 500 company.',
    course: 'Data Science Specialization',
    rating: 5,
  },
  {
    id: 3,
    name: 'Michael Chen',
    role: 'Marketing Manager',
    image: 'https://randomuser.me/api/portraits/men/67.jpg',
    content:
      "The digital marketing courses here are top-notch. I implemented the strategies and saw a 200% increase in our company's conversion rate.",
    course: 'Digital Marketing Masterclass',
    rating: 4,
  },
  {
    id: 4,
    name: 'Emily Rodriguez',
    role: 'UI/UX Designer',
    image: 'https://randomuser.me/api/portraits/women/28.jpg',
    content:
      'I switched from graphic design to UX design after taking courses here. I now work at a leading tech company designing user experiences.',
    course: 'UI/UX Design Professional Certificate',
    rating: 5,
  },
];

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonial = testimonials[currentIndex];

  return (
    <div className="py-16 bg-[#1e293b]/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-bold text-neutral-50 mb-4">
            What Our Students Say
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Hear from learners who have achieved their goals with CoursePalette
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <Card variant="elevated">
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <Avatar
                    src={testimonial.image}
                    alt={testimonial.name}
                    fallback={testimonial.name.charAt(0)}
                    size="xl"
                    className="mb-4"
                  />
                  <div className="flex mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < testimonial.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-600'
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xl md:text-2xl mb-4 italic text-neutral-300">
                    "{testimonial.content}"
                  </p>
                  <div className="mb-2">
                    <div className="font-semibold text-lg text-neutral-100">
                      {testimonial.name}
                    </div>
                    <div className="text-neutral-400">{testimonial.role}</div>
                  </div>
                  <div className="text-sm text-violet-400">
                    Course: {testimonial.course}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-violet-500 scale-110' : 'bg-neutral-600'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          <div className="flex justify-center mt-6 gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setCurrentIndex((i) =>
                  i === 0 ? testimonials.length - 1 : i - 1
                )
              }
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setCurrentIndex((i) =>
                  i === testimonials.length - 1 ? 0 : i + 1
                )
              }
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
