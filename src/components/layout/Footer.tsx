import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Sparkles,
  ArrowRight,
  Mail,
  MapPin,
  BookOpen,
  Award,
  Shield,
  HelpCircle,
  BookText,
  Handshake,
} from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

const socialLinks = [
  {
    href: 'https://facebook.com',
    icon: Facebook,
    label: 'Facebook',
    color: '#1877f2',
  },
  {
    href: 'https://twitter.com',
    icon: Twitter,
    label: 'Twitter',
    color: '#1da1f2',
  },
  {
    href: 'https://linkedin.com',
    icon: Linkedin,
    label: 'LinkedIn',
    color: '#0a66c2',
  },
  {
    href: 'https://instagram.com',
    icon: Instagram,
    label: 'Instagram',
    color: '#e1306c',
  },
  {
    href: 'https://youtube.com',
    icon: Youtube,
    label: 'YouTube',
    color: '#ff0000',
  },
];

const columns = [
  {
    title: 'Platform',
    links: [
      { to: '/courses', label: 'All Courses', icon: BookOpen },
      { to: '/categories', label: 'Categories', icon: Sparkles },
      { to: '/check-certificate', label: 'Verify Certificate', icon: Award },
      { to: '/blog', label: 'Blog', icon: BookText },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/help', label: 'Help Center', icon: HelpCircle },
      { to: '/contact', label: 'Contact Us', icon: Mail },
      { to: '/privacy', label: 'Privacy Policy', icon: Shield },
      { to: '/terms', label: 'Terms of Service', icon: Handshake },
    ],
  },
];

const Footer = () => {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <>
      <style>{`
        @keyframes footerReveal {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes socialHover {
          from { transform: translateY(0) scale(1); }
          to { transform: translateY(-4px) scale(1.1); }
        }
        .footer-link {
          position: relative;
          transition: color 0.2s ease, padding-left 0.2s ease;
        }
        .footer-link::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: #8b5cf6;
          border-radius: 2px;
          transition: height 0.2s ease;
        }
        .footer-link:hover {
          color: #a78bfa;
          padding-left: 8px;
        }
        .footer-link:hover::before {
          height: 14px;
        }
        .social-btn {
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, background 0.25s ease;
        }
        .social-btn:hover {
          transform: translateY(-4px) scale(1.1);
        }
        .newsletter-input:focus {
          outline: none;
          border-color: rgba(139,92,246,0.5);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }
        .subscribe-btn {
          transition: all 0.2s ease;
        }
        .subscribe-btn:hover {
          transform: scale(1.05);
        }
        .subscribe-btn:active {
          transform: scale(0.97);
        }
        @keyframes checkPop {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .check-pop {
          animation: checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes gridFloat {
          0%, 100% { opacity: 0.015; }
          50% { opacity: 0.03; }
        }
      `}</style>

      <footer ref={ref} className="relative overflow-hidden mt-0 pt-10">
        {/* Top separator with glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

        {/* Background */}
        <div className="absolute inset-0 bg-[#060b18]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(139,92,246,0.06),transparent)]" />

        {/* Animated grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            animation: 'gridFloat 6s ease-in-out infinite',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          {/* Main footer grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16">
            {/* Brand column */}
            <div
              className="md:col-span-5"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.7s ease 0.1s',
              }}
            >
              {/* Logo */}
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 mb-5 group"
              >
                <img
                  src="/logo-skillorai-light.svg"
                  alt="skillorai"
                  width={300}
                />
              </Link>

              <p className="text-neutral-400 text-sm leading-relaxed mb-6 max-w-sm">
                Expand your skills with professional courses and certificates.
                Learn from industry experts and transform your career with
                AI-powered tools.
              </p>

              {/* Contact info */}
              <div className="flex flex-col gap-2 mb-7">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Mail className="w-3.5 h-3.5 text-violet-400/60" />
                  <span>skillorai@bahaj.dev</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <MapPin className="w-3.5 h-3.5 text-violet-400/60" />
                  <span>Available worldwide, 24/7</span>
                </div>
              </div>

              {/* Social links */}
              <div className="flex gap-2.5">
                {socialLinks.map(({ href, icon: Icon, label, color }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="social-btn w-9 h-9 rounded-xl bg-white/[0.04] border border-white/8 flex items-center justify-center text-neutral-500"
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = color;
                      (e.currentTarget as HTMLElement).style.borderColor =
                        color + '40';
                      (e.currentTarget as HTMLElement).style.background =
                        color + '15';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '';
                      (e.currentTarget as HTMLElement).style.borderColor = '';
                      (e.currentTarget as HTMLElement).style.background = '';
                    }}
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {columns.map((col, colIdx) => (
              <div
                key={col.title}
                className="md:col-span-3"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.7s ease ${0.15 + colIdx * 0.1}s`,
                }}
              >
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-widest mb-5">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map(({ to, label, icon: Icon }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        className="footer-link flex items-center gap-2 text-sm text-neutral-500 hover:text-violet-400 transition-colors"
                      >
                        {Icon && (
                          <Icon className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
                        )}
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div
            className="border-t border-white/8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              opacity: inView ? 1 : 0,
              transition: 'opacity 0.7s ease 0.5s',
            }}
          >
            <p className="text-xs text-neutral-600">
              © {new Date().getFullYear()} CoursePalette. All rights reserved.
            </p>

            <div className="flex items-center gap-1 text-xs text-neutral-600">
              <span>
                Pawerd By <a href="https://bahaj.dev/">Bahaj.dev</a>
              </span>
            </div>

            <div className="flex items-center gap-4">
              {[
                { to: '/privacy', label: 'Privacy' },
                { to: '/terms', label: 'Terms' },
                { to: '/sitemap', label: 'Sitemap' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
