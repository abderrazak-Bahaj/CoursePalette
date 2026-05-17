import { UsersRound, GraduationCap, Globe, BookOpen } from 'lucide-react';

const stats = [
  {
    value: '15K+',
    label: 'Active Learners',
    sublabel: 'From 50+ countries',
    icon: UsersRound,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    value: '500+',
    label: 'Expert Courses',
    sublabel: 'Across all domains',
    icon: BookOpen,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    value: '10K+',
    label: 'Certificates Earned',
    sublabel: 'Industry-recognized',
    icon: GraduationCap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    value: '50+',
    label: 'Partner Institutions',
    sublabel: 'Universities & companies',
    icon: Globe,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
];

const StatisticsSection = () => {
  return (
    <section className="py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0c1222] to-[#0f172a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.05),transparent_70%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Our Impact
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-50 mb-4">
            Trusted by Learners Worldwide
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto">
            Numbers that reflect our commitment to quality education.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="relative p-6 md:p-8 rounded-2xl border border-white/5 bg-white/[0.02] text-center group hover:border-white/10 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="font-serif text-3xl md:text-4xl font-bold text-neutral-50 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-neutral-200 mb-0.5">
                  {stat.label}
                </p>
                <p className="text-xs text-neutral-500">{stat.sublabel}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
