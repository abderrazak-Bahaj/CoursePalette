import { Button } from '@/components/ds/primitives/Button';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle } from 'lucide-react';

const HeroSection = () => {
  const features = [
    'Access to 10,000+ top-rated courses',
    'Earn certificates from leading institutions',
    'Learn at your own pace, anytime, anywhere',
    'Instructors from top global universities',
  ];

  return (
    <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e1040] to-[#0f172a] py-20 md:py-28 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <span className="inline-block px-4 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-medium mb-6">
              Start Your Learning Journey Today
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-neutral-50 mb-6 leading-tight">
              Learn Without <span className="text-amber-400">Limits</span>
            </h1>
            <p className="text-lg text-neutral-400 mb-8 leading-relaxed">
              Start, switch, or advance your career with thousands of courses,
              professional certificates, and degrees from world-class
              universities and companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="action" size="lg" asChild>
                <Link to="/courses" className="flex items-center gap-1">
                  Browse Courses <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/register">Join for Free</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-[#1e293b]/80 backdrop-blur-lg rounded-xl border border-neutral-700 p-6 shadow-xl">
              <h3 className="font-serif text-xl font-semibold text-neutral-50 mb-4">
                Why CoursePalette?
              </h3>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
