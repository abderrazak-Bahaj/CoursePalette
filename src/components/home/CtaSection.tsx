import { Button } from '@/components/ds/primitives/Button';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Award, Users, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const perks = [
  { icon: BookOpen, text: '500+ expert courses', color: 'text-violet-400' },
  { icon: Award, text: 'Verified certificates', color: 'text-amber-400' },
  { icon: Users, text: '15K+ active learners', color: 'text-rose-400' },
  { icon: Zap, text: 'AI-powered feedback', color: 'text-violet-400' },
];

const CtaSection = () => {
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
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @keyframes ctaOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.1); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes ctaOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 20px) scale(1.08); }
        }
        @keyframes shimmerLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .cta-orb-1 { animation: ctaOrb1 8s ease-in-out infinite; }
        .cta-orb-2 { animation: ctaOrb2 10s ease-in-out infinite 1s; }
        .float-badge { animation: floatBadge 3s ease-in-out infinite; }
        .shimmer-btn {
          position: relative;
          overflow: hidden;
        }
        .shimmer-btn::before {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 60%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transform: translateX(-150%);
          transition: none;
        }
        .shimmer-btn:hover::before {
          transform: translateX(250%);
          transition: transform 0.55s ease;
        }
        .perk-chip {
          transition: transform 0.25s ease, background 0.25s ease;
        }
        .perk-chip:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.06);
        }
      `}</style>

      <section ref={ref} className="py-24 relative overflow-hidden">
        {/* Deep background */}
        <div className="absolute inset-0 bg-[#060b18]" />

        {/* Large ambient orbs */}
        <div
          className="cta-orb-1 absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          className="cta-orb-2 absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Top / bottom borders */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-700/30 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            {/* ── Left column: copy ── */}
            <div
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateX(0)' : 'translateX(-40px)',
                transition: 'all 0.8s cubic-bezier(0.34,1.1,0.64,1)',
              }}
            >
              {/* Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs text-violet-300 font-semibold uppercase tracking-widest">
                  Free to start
                </span>
              </div>

              {/* Headline */}
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-50 leading-[1.08] mb-6">
                Transform your
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-violet-400 to-amber-400 bg-clip-text text-transparent">
                    career today
                  </span>
                  {/* Underline accent */}
                  <span
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-amber-400 rounded-full"
                    style={{
                      width: inView ? '100%' : '0%',
                      transition: 'width 0.8s ease 0.6s',
                    }}
                  />
                </span>
              </h2>

              <p className="text-neutral-400 text-lg leading-relaxed mb-8 max-w-md">
                Join 15,000+ learners who are already building in-demand skills
                with expert-led courses and AI-powered tools.
              </p>

              {/* Perk chips */}
              <div className="grid grid-cols-2 gap-2.5 mb-10">
                {perks.map(({ icon: Icon, text, color }, i) => (
                  <div
                    key={i}
                    className="perk-chip flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/8"
                    style={{
                      opacity: inView ? 1 : 0,
                      transform: inView ? 'translateY(0)' : 'translateY(12px)',
                      transition: `all 0.5s ease ${0.4 + i * 0.08}s`,
                    }}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                    <span className="text-xs text-neutral-300 font-medium">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div
                className="flex flex-wrap gap-3"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(16px)',
                  transition: 'all 0.6s ease 0.65s',
                }}
              >
                <Button variant="action" size="lg" asChild>
                  <Link
                    to="/register"
                    className="shimmer-btn flex items-center gap-2 px-8"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/courses" className="px-7">
                    Browse Courses
                  </Link>
                </Button>
              </div>

              <p
                className="text-xs text-neutral-600 mt-4"
                style={{
                  opacity: inView ? 1 : 0,
                  transition: 'opacity 0.6s ease 0.8s',
                }}
              >
                No credit card required · Cancel anytime
              </p>
            </div>

            {/* ── Right column: visual card stack ── */}
            <div
              className="relative hidden lg:flex items-center justify-center"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateX(0)' : 'translateX(40px)',
                transition: 'all 0.8s cubic-bezier(0.34,1.1,0.64,1) 0.15s',
              }}
            >
              {/* Background card (tilted) */}
              <div
                className="absolute w-72 h-80 rounded-3xl border border-violet-500/10 bg-white/[0.02]"
                style={{
                  transform: 'rotate(6deg) translateY(10px)',
                  transformOrigin: 'center bottom',
                }}
              />
              <div
                className="absolute w-72 h-80 rounded-3xl border border-amber-500/10 bg-white/[0.015]"
                style={{
                  transform: 'rotate(-4deg) translateY(6px)',
                  transformOrigin: 'center bottom',
                }}
              />

              {/* Main card */}
              <div className="relative w-72 rounded-3xl border border-white/10 bg-[#0d1220] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                {/* Card header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                      <Award className="w-4.5 h-4.5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-200">
                        Certificate
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        Issued today
                      </p>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>

                {/* Course title */}
                <div className="mb-5">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5">
                    Completed course
                  </p>
                  <p className="text-sm font-semibold text-neutral-100 leading-snug">
                    Full-Stack Web Development Bootcamp
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-[10px] text-neutral-500 mb-1.5">
                    <span>Progress</span>
                    <span className="text-violet-400 font-semibold">100%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-400"
                      style={{
                        width: inView ? '100%' : '0%',
                        transition: 'width 1.2s ease 0.9s',
                      }}
                    />
                  </div>
                </div>

                {/* Learner avatars */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['32', '44', '67', '28'].map((id) => (
                      <img
                        key={id}
                        src={`https://randomuser.me/api/portraits/men/${id}.jpg`}
                        className="w-6 h-6 rounded-full border border-[#0d1220] object-cover"
                        alt=""
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    <span className="text-neutral-300 font-medium">+2,400</span>{' '}
                    enrolled
                  </p>
                </div>

                {/* Shimmer line */}
                <div className="absolute bottom-0 left-6 right-6 h-px overflow-hidden rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"
                    style={{
                      animation: 'shimmerLine 2.5s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>

              {/* Floating badge — top right */}
              <div
                className="float-badge absolute -top-4 -right-4 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm shadow-lg"
                style={{
                  opacity: inView ? 1 : 0,
                  transition: 'opacity 0.5s ease 1s',
                }}
              >
                <span className="text-lg">🏆</span>
                <div>
                  <p className="text-[10px] font-bold text-amber-300">
                    Top Rated
                  </p>
                  <p className="text-[9px] text-neutral-500">4.9 / 5.0</p>
                </div>
              </div>

              {/* Floating badge — bottom left */}
              <div
                className="float-badge absolute -bottom-4 -left-4 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-violet-500/10 border border-violet-500/20 backdrop-blur-sm shadow-lg"
                style={{
                  opacity: inView ? 1 : 0,
                  transition: 'opacity 0.5s ease 1.1s',
                  animationDelay: '1.5s',
                }}
              >
                <span className="text-lg">⚡</span>
                <div>
                  <p className="text-[10px] font-bold text-violet-300">
                    AI Powered
                  </p>
                  <p className="text-[9px] text-neutral-500">Smart feedback</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CtaSection;
