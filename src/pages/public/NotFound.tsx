import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';

const NotFound = () => {
  const location = useLocation();

  useSEO({
    title: 'Page Not Found',
    description:
      'The page you are looking for does not exist. Return to the homepage to continue browsing courses on Skillorai.',
    noIndex: true,
  });

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="text-center">
        <h1 className="font-serif text-8xl font-bold text-violet-400 mb-4">
          404
        </h1>
        <p className="text-xl text-neutral-300 mb-2">Oops! Page not found</p>
        <p className="text-neutral-500 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="text-violet-400 hover:text-violet-300 underline transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
