import { UsersRound, GraduationCap, Globe, BookOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const stats = [
  {
    value: 15000,
    display: '15K+',
    label: 'Active Learners',
    sublabel: 'From 50+ countries',
    icon: UsersRound,
    color: 'violet',
    accent: '#8b5cf6',
  },
  {
    value: 500,
    display: '500+',
    label: 'Expert Courses',
    sublabel: 'Across all domains',
    icon: BookOpen,
    color: 'coral',
    accent: '#f43f5e',
  },
  {
    value: 10000,
    display: '10K+',
    label: 'Certificates Earned',
    sublabel: 'Industry-recognized',
    icon: GraduationCap,
    color: 'amber',
    accent: '#f59e0b',
  },
  {
    value: 50,
    display: '50+',
    label: 'Partner Institutions',
    sublabel: 'Universities & companies',
    icon: Globe,
    color: 'violet',
    accent: '#8b5cf6',
  },
];

const colorMap = {
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    glow: 'rgba(139,92,246,0.2)',
  },
  coral: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    glow: 'rgba(244,63,94,0.15)',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    glow: 'rgba(245,158,11,0.15)',
  },
};

// Animated counter hook
const useCounter = (target: number, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

const StatCard = ({
  stat,
  index,
  inView,
}: {
  stat: (typeof stats)[0];
  index: number;
  inView: boolean;
}) => {
  const Icon = stat.icon;
  const c = colorMap[stat.color as keyof typeof colorMap];
  const count = useCounter(stat.value, 2200, inView);

  const formatCount = (n: number) => {
    if (stat.value >= 1000) return `${Math.floor(n / 1000)}K+`;
    return `${n}+`;
  };

  return (
    <div
      className="relative group"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? 'translateY(0) scale(1)'
          : 'translateY(50px) scale(0.9)',
        transition: `all 0.7s cubic-bezier(0.34,1.2,0.64,1) ${index * 0.12}s`,
      }}
    >
      <div
        className={`relative p-8 rounded-2xl border ${c.border} bg-white/[0.02] text-center overflow-hidden cursor-default`}
        style={{
          transition:
            'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(-8px)';
          el.style.boxShadow = `0 20px 60px ${c.glow}, 0 0 0 1px ${c.glow}`;
          el.style.borderColor = c.glow
            .replace('rgba', 'rgba')
            .replace('0.2', '0.4')
            .replace('0.15', '0.3');
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = 'none';
          el.style.borderColor = '';
        }}
      >
        {/* Background glow on hover */}
        <div
          className={`absolute inset-0 ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
          style={{
            background: `radial-gradient(ellipse at center, ${c.glow} 0%, transparent 70%)`,
          }}
        />

        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center mx-auto mb-5 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon className={`w-7 h-7 ${c.text}`} />
        </div>

        {/* Animated number */}
        <p className="font-serif text-4xl md:text-5xl font-bold text-neutral-50 mb-2 relative z-10 tabular-nums">
          {inView ? formatCount(count) : '0'}
        </p>

        <p className="text-sm font-semibold text-neutral-200 mb-1 relative z-10">
          {stat.label}
        </p>
        <p className="text-xs text-neutral-500 relative z-10">
          {stat.sublabel}
        </p>

        {/* Bottom accent */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-500"
          style={{
            width: inView ? '60%' : '0%',
            background: `linear-gradient(90deg, transparent, ${stat.accent}80, transparent)`,
            transitionDelay: `${index * 0.12 + 0.5}s`,
          }}
        />
      </div>
    </div>
  );
};

const StatisticsSection = () => {
  const ref = useRef<HTMLElement>(null);
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
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @keyframes statsGlow {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.12; }
        }
      `}</style>

      <section ref={ref} className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0a0e1a] to-[#0f172a]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 70%)',
            animation: 'statsGlow 5s ease-in-out infinite',
          }}
        />

        {/* Horizontal lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-700/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-700/40 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div
            className="text-center mb-16"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.7s ease',
            }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-5">
              Our Impact
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-50 mb-4">
              Trusted by Learners{' '}
              <span className="text-neutral-400 font-normal">Worldwide</span>
            </h2>
            <p className="text-neutral-400 max-w-md mx-auto">
              Numbers that reflect our commitment to quality education and real
              career outcomes.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} inView={inView} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default StatisticsSection;
