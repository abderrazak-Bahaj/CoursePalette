import { Button } from '@/components/ds/primitives/Button';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Sparkles,
  Users,
  BookOpen,
  Award,
} from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#0a0e1a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(244,63,94,0.08),transparent_50%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Floating orbs */}
      <div className="absolute top-20 right-[15%] w-72 h-72 bg-violet-500/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-20 left-[10%] w-56 h-56 bg-amber-500/8 rounded-full blur-[80px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[120px]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300 font-medium">
              AI-Powered Learning Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-neutral-50 mb-6 leading-[1.1] tracking-tight">
            Master New Skills,{' '}
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-violet-400 via-violet-300 to-amber-400 bg-clip-text text-transparent">
                Shape Your Future
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-violet-500/20 rounded-full blur-sm" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners advancing their careers with expert-led
            courses, AI-assisted learning, and industry-recognized certificates.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button variant="action" size="lg" asChild>
              <Link to="/courses" className="flex items-center gap-2 px-8">
                Explore Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link
                to="/register"
                className="flex items-center gap-2 text-neutral-300 hover:text-neutral-50"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                Start Free Trial
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-400" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-neutral-50">15K+</p>
                <p className="text-xs text-neutral-500">Active Learners</p>
              </div>
            </div>
            <div className="w-px h-8 bg-neutral-700 hidden md:block" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-coral-500/10 border border-coral-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-coral-400" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-neutral-50">500+</p>
                <p className="text-xs text-neutral-500">Expert Courses</p>
              </div>
            </div>
            <div className="w-px h-8 bg-neutral-700 hidden md:block" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-neutral-50">10K+</p>
                <p className="text-xs text-neutral-500">Certificates Issued</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f172a] to-transparent" />
    </section>
  );
};

export default HeroSection;
