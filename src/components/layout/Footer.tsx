import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { href: 'https://facebook.com', icon: Facebook },
    { href: 'https://twitter.com', icon: Twitter },
    { href: 'https://linkedin.com', icon: Linkedin },
    { href: 'https://instagram.com', icon: Instagram },
    { href: 'https://youtube.com', icon: Youtube },
  ];

  const exploreLinks = [
    { to: '/courses', label: 'All Courses' },
    { to: '/categories', label: 'Categories' },
    { to: '/check-certificate', label: 'Check Certificate' },
    { to: '/blog', label: 'Blog' },
  ];

  const supportLinks = [
    { to: '/help', label: 'Help Center' },
    { to: '/contact', label: 'Contact Us' },
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms of Service' },
  ];

  return (
    <footer className="bg-[#0f172a] border-t border-neutral-700 pt-12 pb-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-lg font-semibold text-neutral-50 mb-4">
              CoursePalette
            </h3>
            <p className="text-neutral-400 text-sm mb-4 leading-relaxed">
              Expand your skills with professional courses and certificates.
              Learn from industry experts and transform your career.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ href, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-violet-400 transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-neutral-50 mb-4">
              Explore
            </h3>
            <ul className="space-y-2">
              {exploreLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-neutral-400 hover:text-violet-400 text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-neutral-50 mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {supportLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-neutral-400 hover:text-violet-400 text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-12 pt-8">
          <p className="text-center text-neutral-500 text-sm">
            © {new Date().getFullYear()} CoursePalette. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
