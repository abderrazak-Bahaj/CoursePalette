import { UserPlus, BookOpen, Brain, Award } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description:
      'Sign up in seconds and set your learning goals. Our AI will personalize your experience.',
    color: 'violet',
  },
  {
    number: '02',
    icon: BookOpen,
    title: 'Choose Your Path',
    description:
      'Browse courses by category, difficulty, or career goal. Enroll instantly.',
    color: 'coral',
  },
  {
    number: '03',
    icon: Brain,
    title: 'Learn & Practice',
    description:
      'Watch lessons, complete assignments, and get AI-powered feedback on your progress.',
    color: 'amber',
  },
  {
    number: '04',
    icon: Award,
    title: 'Earn Certificates',
    description:
      'Complete courses and earn verifiable certificates to showcase your skills.',
    color: 'violet',
  },
];

const colorMap = {
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    glow: 'shadow-violet-500/10',
    line: 'from-violet-500/50',
  },
  coral: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    glow: 'shadow-rose-500/10',
    line: 'from-rose-500/50',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/10',
    line: 'from-amber-500/50',
  },
};

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-[#0f172a] relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/3 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-50 mb-4">
            Your Learning Journey in 4 Steps
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto">
            From sign-up to certification — here's how CoursePalette helps you
            grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, index) => {
            const colors = colorMap[step.color as keyof typeof colorMap];
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative group">
                {/* Connector line (hidden on last item and mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[calc(100%-20%)] h-px">
                    <div
                      className={`h-full bg-gradient-to-r ${colors.line} to-transparent`}
                    />
                  </div>
                )}

                <div className="relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-300 hover:border-white/10 group-hover:shadow-lg group-hover:shadow-violet-500/5">
                  {/* Step number */}
                  <span className="absolute top-4 right-4 text-4xl font-bold text-white/[0.04] font-serif">
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-5 shadow-lg ${colors.glow}`}
                  >
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
