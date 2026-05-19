import { useState, useEffect, useCallback, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Alex Johnson',
    role: 'Software Developer',
    company: 'Google',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    content:
      'CoursePalette completely changed my career path. I went from knowing basic HTML to becoming a full-stack developer in just 6 months. The AI-powered feedback on assignments was a game-changer.',
    course: 'Complete Web Development Bootcamp',
    rating: 5,
    color: 'violet',
  },
  {
    id: 2,
    name: 'Sarah Williams',
    role: 'Data Analyst',
    company: 'Microsoft',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    content:
      'As someone with no background in data science, I was amazed at how well-structured the courses were. The step-by-step approach and real projects helped me land my dream job.',
    course: 'Data Science Specialization',
    rating: 5,
    color: 'coral',
  },
  {
    id: 3,
    name: 'Michael Chen',
    role: 'Marketing Manager',
    company: 'Shopify',
    image: 'https://randomuser.me/api/portraits/men/67.jpg',
    content:
      "The digital marketing courses here are top-notch. I implemented the strategies and saw a 200% increase in our company's conversion rate within the first quarter.",
    course: 'Digital Marketing Masterclass',
    rating: 5,
    color: 'amber',
  },
  {
    id: 4,
    name: 'Emily Rodriguez',
    role: 'UI/UX Designer',
    company: 'Figma',
    image: 'https://randomuser.me/api/portraits/women/28.jpg',
    content:
      "I switched from graphic design to UX design after taking courses here. The instructors are industry professionals who share real-world insights you can't find anywhere else.",
    course: 'UI/UX Design Professional Certificate',
    rating: 5,
    color: 'violet',
  },
];

const colorMap = {
  violet: {
    accent: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.2)',
    tag: 'bg-violet-500/10 border-violet-500/20 text-violet-300',
  },
  coral: {
    accent: '#f43f5e',
    bg: 'rgba(244,63,94,0.06)',
    border: 'rgba(244,63,94,0.15)',
    tag: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
  },
  amber: {
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.15)',
    tag: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  },
};

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
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

  const goTo = useCallback(
    (index: number, dir: 'left' | 'right') => {
      if (animating) return;
      setAnimating(true);
      setDirection(dir);
      setTimeout(() => {
        setCurrentIndex(index);
        setAnimating(false);
      }, 350);
    },
    [animating]
  );

  const next = useCallback(() => {
    goTo(
      currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1,
      'right'
    );
  }, [currentIndex, goTo]);

  const prev = useCallback(() => {
    goTo(
      currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1,
      'left'
    );
  }, [currentIndex, goTo]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  const t = testimonials[currentIndex];
  const c = colorMap[t.color as keyof typeof colorMap];

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-40px); }
        }
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(40px); }
        }
        .testimonial-enter-right { animation: slideInRight 0.35s ease forwards; }
        .testimonial-enter-left { animation: slideInLeft 0.35s ease forwards; }
        .testimonial-exit-right { animation: slideOutRight 0.35s ease forwards; }
        .testimonial-exit-left { animation: slideOutLeft 0.35s ease forwards; }
        .quote-mark {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 8rem;
          line-height: 0.8;
          color: rgba(139,92,246,0.12);
          user-select: none;
          pointer-events: none;
        }
        .avatar-ring {
          transition: box-shadow 0.3s ease;
        }
        .nav-btn {
          transition: all 0.2s ease;
        }
        .nav-btn:hover {
          transform: scale(1.1);
        }
        .nav-btn:active {
          transform: scale(0.95);
        }
      `}</style>

      <section
        ref={ref}
        className="py-24 relative overflow-hidden"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#0a0e1a]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-700/40 to-transparent" />

        {/* Dynamic color glow that follows the testimonial color */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[150px] pointer-events-none"
          style={{ background: c.bg, transition: 'background 0.8s ease' }}
        />

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
            <span className="inline-block px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-widest mb-5">
              Testimonials
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-50 mb-4">
              Loved by{' '}
              <span className="text-neutral-400 font-normal">Learners</span>
            </h2>
            <p className="text-neutral-400 max-w-md mx-auto">
              Real stories from people who transformed their careers with
              CoursePalette.
            </p>
          </div>

          {/* Main testimonial card */}
          <div
            className="max-w-4xl mx-auto"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 0.8s ease 0.2s',
            }}
          >
            <div
              className="relative rounded-3xl border bg-white/[0.02] backdrop-blur-sm p-8 md:p-12 overflow-hidden"
              style={{
                borderColor: c.border,
                boxShadow: `0 0 80px ${c.bg}, inset 0 1px 0 rgba(255,255,255,0.05)`,
                transition: 'border-color 0.8s ease, box-shadow 0.8s ease',
              }}
            >
              {/* Decorative quote mark */}
              <div className="quote-mark absolute top-4 right-8 select-none">
                "
              </div>

              {/* Accent line top */}
              <div
                className="absolute top-0 left-8 right-8 h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${c.accent}60, transparent)`,
                  transition: 'background 0.8s ease',
                }}
              />

              {/* Content */}
              <div
                className={
                  animating
                    ? direction === 'right'
                      ? 'testimonial-exit-right'
                      : 'testimonial-exit-left'
                    : direction === 'right'
                      ? 'testimonial-enter-right'
                      : 'testimonial-enter-left'
                }
                key={currentIndex}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-7">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'}`}
                      style={{ transitionDelay: `${i * 0.05}s` }}
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-lg md:text-xl text-neutral-200 leading-relaxed mb-10 font-light">
                  "{t.content}"
                </blockquote>

                {/* Author row */}
                <div className="flex items-center justify-between flex-wrap gap-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="avatar-ring w-14 h-14 rounded-full object-cover"
                        style={{
                          boxShadow: `0 0 0 2px ${c.accent}40, 0 0 20px ${c.bg}`,
                        }}
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: c.accent }}
                      >
                        <Star className="w-2.5 h-2.5 text-white fill-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-100 text-base">
                        {t.name}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {t.role} at{' '}
                        <span style={{ color: c.accent }}>{t.company}</span>
                      </p>
                    </div>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-xl border text-xs font-medium ${c.tag}`}
                  >
                    {t.course}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 px-2">
              {/* Dots */}
              <div className="flex gap-2 items-center">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      goTo(index, index > currentIndex ? 'right' : 'left')
                    }
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: index === currentIndex ? 28 : 8,
                      height: 8,
                      background:
                        index === currentIndex
                          ? c.accent
                          : 'rgba(255,255,255,0.15)',
                    }}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              {/* Arrow buttons */}
              <div className="flex gap-3">
                <button
                  onClick={prev}
                  className="nav-btn w-11 h-11 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:border-white/20 hover:bg-white/[0.06]"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="nav-btn w-11 h-11 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:border-white/20 hover:bg-white/[0.06]"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Thumbnail row */}
          <div
            className="flex items-center justify-center gap-4 mt-10"
            style={{
              opacity: inView ? 1 : 0,
              transition: 'opacity 0.8s ease 0.5s',
            }}
          >
            {testimonials.map((item, index) => (
              <button
                key={item.id}
                onClick={() =>
                  goTo(index, index > currentIndex ? 'right' : 'left')
                }
                className="relative rounded-full transition-all duration-300"
                style={{
                  transform:
                    index === currentIndex ? 'scale(1.15)' : 'scale(1)',
                  opacity: index === currentIndex ? 1 : 0.4,
                }}
                aria-label={`View ${item.name}'s testimonial`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover"
                  style={{
                    boxShadow:
                      index === currentIndex
                        ? `0 0 0 2px ${colorMap[item.color as keyof typeof colorMap].accent}`
                        : 'none',
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default TestimonialSection;
