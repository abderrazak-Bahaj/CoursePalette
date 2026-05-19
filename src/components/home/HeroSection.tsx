import { Button } from '@/components/ds/primitives/Button';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Sparkles,
  Users,
  BookOpen,
  Award,
  Brain,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import AnimatedLogo from './AnimatedLogo';

// Floating particle component
const Particle = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute rounded-full pointer-events-none" style={style} />
);

const HeroSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated canvas background — flowing particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const dots: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
    }[] = [];
    for (let i = 0; i < 60; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${d.alpha})`;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(139,92,246,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const particles = [
    {
      width: 6,
      height: 6,
      top: '15%',
      left: '8%',
      background: 'rgba(139,92,246,0.6)',
      borderRadius: '50%',
      animation: 'float1 6s ease-in-out infinite',
      boxShadow: '0 0 12px rgba(139,92,246,0.8)',
    },
    {
      width: 4,
      height: 4,
      top: '25%',
      right: '12%',
      background: 'rgba(251,113,133,0.6)',
      borderRadius: '50%',
      animation: 'float2 8s ease-in-out infinite',
      boxShadow: '0 0 10px rgba(251,113,133,0.8)',
    },
    {
      width: 8,
      height: 8,
      bottom: '30%',
      left: '5%',
      background: 'rgba(251,191,36,0.5)',
      borderRadius: '50%',
      animation: 'float3 7s ease-in-out infinite',
      boxShadow: '0 0 14px rgba(251,191,36,0.7)',
    },
    {
      width: 5,
      height: 5,
      top: '60%',
      right: '8%',
      background: 'rgba(139,92,246,0.5)',
      borderRadius: '50%',
      animation: 'float1 9s ease-in-out infinite 1s',
      boxShadow: '0 0 10px rgba(139,92,246,0.7)',
    },
    {
      width: 3,
      height: 3,
      top: '40%',
      left: '20%',
      background: 'rgba(251,113,133,0.4)',
      borderRadius: '50%',
      animation: 'float2 5s ease-in-out infinite 2s',
    },
    {
      width: 4,
      height: 4,
      bottom: '20%',
      right: '25%',
      background: 'rgba(251,191,36,0.4)',
      borderRadius: '50%',
      animation: 'float3 10s ease-in-out infinite 0.5s',
    },
  ];

  return (
    <>
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(5deg); }
          66% { transform: translateY(8px) rotate(-3deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-22px) translateX(10px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-14px) scale(1.2); }
        }
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgeSlide {
          from { opacity: 0; transform: translateY(-20px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmerText {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        @keyframes scanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes statPop {
          from { opacity: 0; transform: scale(0.8) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .hero-badge { animation: badgeSlide 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; opacity: 0; }
        .hero-title { animation: heroReveal 0.8s ease forwards 0.2s; opacity: 0; }
        .hero-subtitle { animation: heroReveal 0.8s ease forwards 0.4s; opacity: 0; }
        .hero-cta { animation: heroReveal 0.8s ease forwards 0.6s; opacity: 0; }
        .hero-stat-0 { animation: statPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards 0.8s; opacity: 0; }
        .hero-stat-1 { animation: statPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards 0.95s; opacity: 0; }
        .hero-stat-2 { animation: statPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards 1.1s; opacity: 0; }
        .shimmer-text {
          background: linear-gradient(90deg, #a78bfa 0%, #f9a8d4 30%, #fbbf24 60%, #a78bfa 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 4s linear infinite;
        }
        .orb-pulse { animation: orbPulse 4s ease-in-out infinite; }
        .orb-pulse-delay { animation: orbPulse 4s ease-in-out infinite 2s; }
        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent);
          animation: scanLine 8s linear infinite;
          pointer-events: none;
        }
        .glow-card {
          position: relative;
          transition: all 0.3s ease;
        }
        .glow-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(139,92,246,0.3), transparent, rgba(251,113,133,0.2));
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }
        .glow-card:hover::before { opacity: 1; }
      `}</style>

      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        {/* Deep space background */}
        <div className="absolute inset-0 bg-[#060b18]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(244,63,94,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_10%_60%,rgba(251,191,36,0.05),transparent)]" />

        {/* Animated canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-60"
        />

        {/* Scan line effect */}
        <div className="scan-line" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-[10%] right-[10%] w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] orb-pulse" />
        <div className="absolute bottom-[10%] left-[5%] w-72 h-72 bg-rose-500/8 rounded-full blur-[100px] orb-pulse-delay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-800/5 rounded-full blur-[150px]" />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <Particle key={i} style={p as React.CSSProperties} />
        ))}

        {/* Top border glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* ── Left: copy ── */}
              <div className="text-center lg:text-left">
                {/* Badge */}
                <div className="hero-badge inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-violet-500/10 border border-violet-500/25 mb-10 backdrop-blur-md">
                  <div className="relative">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <div className="absolute inset-0 animate-ping">
                      <Sparkles className="w-4 h-4 text-violet-400 opacity-30" />
                    </div>
                  </div>
                  <span className="text-sm text-violet-300 font-medium tracking-wide">
                    AI-Powered Learning Platform
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                </div>

                {/* Main headline */}
                <h1 className="hero-title font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-50 mb-6 leading-[1.05] tracking-tight">
                  Master Skills, <br className="hidden md:block" />
                  <span className="shimmer-text">Shape Your Future</span>
                </h1>

                {/* Subtitle */}
                <p className="hero-subtitle text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl lg:max-w-xl leading-relaxed">
                  Join{' '}
                  <span className="text-violet-300 font-medium">
                    15,000+ learners
                  </span>{' '}
                  advancing their careers with expert-led courses,{' '}
                  <span className="text-amber-300 font-medium">
                    AI-assisted learning
                  </span>
                  , and industry-recognized certificates.
                </p>

                {/* CTA Buttons */}
                <div className="hero-cta flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-14">
                  <Button variant="action" size="lg" asChild>
                    <Link
                      to="/courses"
                      className="flex items-center gap-2.5 px-10 py-4 text-base font-semibold"
                    >
                      Explore Courses
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" asChild>
                    <Link
                      to="/register"
                      className="flex items-center gap-3 text-neutral-300 hover:text-neutral-50 px-6 py-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/8 border border-white/10 flex items-center justify-center backdrop-blur-sm transition-all hover:bg-white/15">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                      <span className="text-base">Start Free Trial</span>
                    </Link>
                  </Button>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  {[
                    {
                      icon: Users,
                      value: '15K+',
                      label: 'Active Learners',
                      color: 'violet',
                      delay: 0,
                    },
                    {
                      icon: BookOpen,
                      value: '500+',
                      label: 'Expert Courses',
                      color: 'coral',
                      delay: 1,
                    },
                    {
                      icon: Award,
                      value: '10K+',
                      label: 'Certificates',
                      color: 'amber',
                      delay: 2,
                    },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    const colorMap = {
                      violet: {
                        bg: 'bg-violet-500/10',
                        border: 'border-violet-500/20',
                        icon: 'text-violet-400',
                        glow: 'rgba(139,92,246,0.15)',
                      },
                      coral: {
                        bg: 'bg-rose-500/10',
                        border: 'border-rose-500/20',
                        icon: 'text-rose-400',
                        glow: 'rgba(244,63,94,0.12)',
                      },
                      amber: {
                        bg: 'bg-amber-500/10',
                        border: 'border-amber-500/20',
                        icon: 'text-amber-400',
                        glow: 'rgba(251,191,36,0.12)',
                      },
                    };
                    const c = colorMap[stat.color as keyof typeof colorMap];
                    return (
                      <div
                        key={i}
                        className={`hero-stat-${i} glow-card flex items-center gap-3 px-5 py-3.5 rounded-2xl border ${c.border} bg-white/[0.03] backdrop-blur-sm`}
                        style={{ boxShadow: `0 0 30px ${c.glow}` }}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className={`w-5 h-5 ${c.icon}`} />
                        </div>
                        <div className="text-left">
                          <p className="text-lg font-bold text-neutral-50 leading-none">
                            {stat.value}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI badge */}
                <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/8">
                  <Brain className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-xs text-neutral-500">
                    Powered by Bahaj
                  </span>
                  <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400">Live</span>
                </div>
              </div>

              {/* ── Right: animated logo ── */}
              <div className="hidden lg:flex items-center justify-center relative">
                {/* Outer glow halo behind the logo */}
                <div
                  className="absolute w-80 h-80 rounded-full blur-[80px] pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(217,185,90,0.12) 0%, rgba(139,92,246,0.08) 50%, transparent 70%)',
                  }}
                />
                <AnimatedLogo size={340} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0f172a] to-transparent" />
      </section>
    </>
  );
};

export default HeroSection;
