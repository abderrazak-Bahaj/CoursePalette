import { Button } from '@/components/ds/primitives/Button';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';

const CtaSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-[#0f172a] to-[#0f172a]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-600/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-violet-300 font-medium">
              Start learning today — it's free
            </span>
          </div>

          <h2 className="font-serif text-3xl md:text-5xl font-bold text-neutral-50 mb-5 leading-tight">
            Ready to Transform{' '}
            <span className="bg-gradient-to-r from-violet-400 to-amber-400 bg-clip-text text-transparent">
              Your Career?
            </span>
          </h2>

          <p className="text-lg text-neutral-400 mb-10 max-w-xl mx-auto">
            Join our community of learners and unlock your potential with
            world-class courses and AI-powered tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="action" size="lg" asChild>
              <Link to="/register" className="flex items-center gap-2 px-8">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
