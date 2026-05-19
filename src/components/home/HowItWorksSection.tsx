import { UserPlus, BookOpen, Brain, Award } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description:
      'Sign up in seconds and set your learning goals. Our AI personalizes your experience from day one.',
    color: 'violet',
    accent: '#8b5cf6',
  },
  {
    number: '02',
    icon: BookOpen,
    title: 'Choose Your Path',
    description:
      'Browse courses by category, difficulty, or career goal. Enroll instantly with one click.',
    color: 'coral',
    accent: '#f43f5e',
  },
  {
    number: '03',
    icon: Brain,
    title: 'Learn & Practice',
    description:
      'Watch lessons, complete assignments, and get AI-powered feedback on your progress in real time.',
    color: 'amber',
    accent: '#f59e0b',
  },
  {
    number: '04',
    icon: Award,
    title: 'Earn Certificates',
    description:
      'Complete courses and earn verifiable certificates to showcase your skills to employers.',
    color: 'violet',
    accent: '#8b5cf6',
  },
];

const colorMap = {
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    number: 'text-violet-500/20',
    glow: '0 0 40px rgba(139,92,246,0.15)',
    hoverBorder: 'hover:border-violet-500/40',
    line: 'bg-gradient-to-r from-violet-500/40 to-transparent',
  },
  coral: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    number: 'text-rose-500/20',
    glow: '0 0 40px rgba(244,63,94,0.12)',
    hoverBorder: 'hover:border-rose-500/40',
    line: 'bg-gradient-to-r from-rose-500/40 to-transparent',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    number: 'text-amber-500/20',
    glow: '0 0 40px rgba(245,158,11,0.12)',
    hoverBorder: 'hover:border-amber-500/40',
    line: 'bg-gradient-to-r from-amber-500/40 to-transparent',
  },
};

const useInView = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
};

const HowItWorksSection = () => {
  const { ref, inView } = useInView();

  return (
    <>
      <style>{`
        @keyframes stepReveal {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lineGrow {
          from { width: 0; opacity: 0; }
          to { width: 100%; opacity: 1; }
        }
        @keyframes iconSpin {
          from { transform: rotate(-10deg) scale(0.8); opacity: 0; }
          to { transform: rotate(0deg) scale(1); opacity: 1; }
        }
        @keyframes numberFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .step-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .step-card:hover {
          transform: translateY(-6px);
        }
        .step-icon-wrap {
          transition: transform 0.3s ease;
        }
        .step-card:hover .step-icon-wrap {
          transform: scale(1.1) rotate(5deg);
        }
        .connector-line {
          animation: lineGrow 0.8s ease forwards;
        }
      `}</style>

      <section
        className="py-24 bg-[#0f172a] relative overflow-hidden"
        ref={ref}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(139,92,246,0.04),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(139,92,246,0.8) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div
            className="text-center mb-20"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.7s ease',
            }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-widest mb-5">
              How It Works
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-50 mb-5">
              Your Learning Journey
              <br />
              <span className="text-neutral-400 font-normal text-3xl md:text-4xl">
                in 4 simple steps
              </span>
            </h2>
            <p className="text-neutral-400 max-w-lg mx-auto text-base leading-relaxed">
              From sign-up to certification — here's how CoursePalette helps you
              grow faster.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((step, index) => {
              const colors = colorMap[step.color as keyof typeof colorMap];
              const Icon = step.icon;
              const delay = index * 0.15;

              return (
                <div
                  key={step.number}
                  className="relative group"
                  style={{
                    opacity: inView ? 1 : 0,
                    transform: inView
                      ? 'translateY(0) scale(1)'
                      : 'translateY(40px) scale(0.96)',
                    transition: `all 0.6s cubic-bezier(0.34,1.2,0.64,1) ${delay}s`,
                  }}
                >
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-[52px] left-[calc(50%+40px)] right-[-50%] h-px z-0 overflow-hidden">
                      <div
                        className={`h-full ${colors.line}`}
                        style={{
                          width: inView ? '100%' : '0%',
                          opacity: inView ? 1 : 0,
                          transition: `all 0.8s ease ${delay + 0.4}s`,
                        }}
                      />
                    </div>
                  )}

                  {/* Card */}
                  <div
                    className={`step-card relative p-7 rounded-2xl border ${colors.border} ${colors.hoverBorder} bg-white/[0.02] backdrop-blur-sm overflow-hidden`}
                    style={{
                      boxShadow: 'none',
                      transition:
                        'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        colors.glow;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    {/* Big number watermark */}
                    <span
                      className={`absolute -top-2 -right-1 text-7xl font-bold ${colors.number} font-serif select-none pointer-events-none`}
                      style={{
                        animation: inView
                          ? `numberFloat ${4 + index}s ease-in-out infinite ${index * 0.5}s`
                          : 'none',
                      }}
                    >
                      {step.number}
                    </span>

                    {/* Icon */}
                    <div
                      className={`step-icon-wrap w-14 h-14 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-6 relative z-10`}
                      style={{
                        opacity: inView ? 1 : 0,
                        transform: inView
                          ? 'rotate(0deg) scale(1)'
                          : 'rotate(-10deg) scale(0.8)',
                        transition: `all 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay + 0.2}s`,
                      }}
                    >
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-neutral-100 mb-3 relative z-10">
                      {step.title}
                    </h3>
                    <p className="text-sm text-neutral-400 leading-relaxed relative z-10">
                      {step.description}
                    </p>

                    {/* Bottom accent line */}
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 ${colors.bg.replace('/10', '/30')}`}
                      style={{
                        width: inView ? '100%' : '0%',
                        transition: `width 0.8s ease ${delay + 0.5}s`,
                        background: `linear-gradient(90deg, ${step.accent}60, transparent)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default HowItWorksSection;
