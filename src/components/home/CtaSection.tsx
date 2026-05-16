import { Button } from '@/components/ds/primitives/Button';
import { Link } from 'react-router-dom';

const CtaSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-violet-900/40 via-[#1e1040] to-violet-900/40 py-16 border-t border-neutral-700">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-50 mb-4">
          Ready to Start Your Learning Journey?
        </h2>
        <p className="text-lg text-neutral-400 max-w-3xl mx-auto mb-8">
          Join our global community of learners and transform your future with
          in-demand skills.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="action" size="lg" asChild>
            <Link to="/register">Get Started for Free</Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/courses">Explore Courses</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CtaSection;
