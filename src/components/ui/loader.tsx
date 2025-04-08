import { Loader2 } from 'lucide-react';

interface LoaderProps {
  fullPage?: boolean;
}

export const Loader = ({ fullPage = false }: LoaderProps) => {
  if (fullPage) {
    return (
      <div
        className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm z-[9999]"
        style={{ minHeight: '100vh' }}
      >
        <div className="relative w-12 h-12">
          {/* Gray background circle */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-200/30" />

          {/* Blue spinning progress */}
          <div className="absolute inset-0 rounded-full border-4 border-t-course-blue border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>

        {/* Loading text */}
        <div className="mt-4 text-white text-sm font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-3 border-gray-200/30" />
        <div className="absolute inset-0 rounded-full border-3 border-t-course-blue border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      <div className="mt-2 text-sm font-medium text-gray-600">Loading...</div>
    </div>
  );
};
