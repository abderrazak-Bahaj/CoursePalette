import { useState, useEffect, useCallback } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Alex Johnson',
    role: 'Software Developer',
    company: 'Google',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    content:
      'CoursePalette completely changed my career path. I went from knowing basic HTML to becoming a full-stack developer in just 6 months. The AI-powered feedback on assignments was a game-changer.',
    course: 'Complete Web Development Bootcamp',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sarah Williams',
    role: 'Data Analyst',
    company: 'Microsoft',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    content:
      'As someone with no background in data science, I was amazed at how well-structured the courses were. The step-by-step approach and real projects helped me land my dream job.',
    course: 'Data Science Specialization',
    rating: 5,
  },
  {
    id: 3,
    name: 'Michael Chen',
    role: 'Marketing Manager',
    company: 'Shopify',
    image: 'https://randomuser.me/api/portraits/men/67.jpg',
    content:
      "The digital marketing courses here are top-notch. I implemented the strategies and saw a 200% increase in our company's conversion rate within the first quarter.",
    course: 'Digital Marketing Masterclass',
    rating: 5,
  },
  {
    id: 4,
    name: 'Emily Rodriguez',
    role: 'UI/UX Designer',
    company: 'Figma',
    image: 'https://randomuser.me/api/portraits/women/28.jpg',
    content:
      "I switched from graphic design to UX design after taking courses here. The instructors are industry professionals who share real-world insights you can't find anywhere else.",
    course: 'UI/UX Design Professional Certificate',
    rating: 5,
  },
];

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));
  }, []);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  }, []);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  const testimonial = testimonials[currentIndex];

  return (
    <section
      className="py-20 relative overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#0c1222]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Testimonials
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-50 mb-4">
            Loved by Learners
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto">
            Real stories from people who transformed their careers with us.
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8 md:p-12">
            {/* Quote icon */}
            <div className="absolute top-6 right-8 opacity-10">
              <Quote className="w-16 h-16 text-violet-400" />
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < testimonial.rating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-neutral-700'
                  }`}
                />
              ))}
            </div>

            {/* Quote text */}
            <blockquote className="text-lg md:text-xl text-neutral-200 leading-relaxed mb-8 font-light italic">
              "{testimonial.content}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-violet-500/20"
                />
                <div>
                  <p className="font-semibold text-neutral-100">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-neutral-400">
                    {testimonial.role} at{' '}
                    <span className="text-violet-400">
                      {testimonial.company}
                    </span>
                  </p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <p className="text-xs text-violet-300">{testimonial.course}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-violet-500'
                      : 'w-2 bg-neutral-700 hover:bg-neutral-600'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:border-white/20 transition-all"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:border-white/20 transition-all"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
