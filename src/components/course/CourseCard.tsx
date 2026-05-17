import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  image_url: string;
  rating: number;
  reviewCount: number;
  price: number;
  category: any;
  level: string;
}

const levelColors: Record<string, string> = {
  BEGINNER: 'bg-emerald-500/90 text-white',
  INTERMEDIATE: 'bg-violet-500/90 text-white',
  ADVANCED: 'bg-amber-500/90 text-white',
};

const CourseCard = ({
  id,
  title,
  image_url,
  price,
  category,
  level,
  instructor,
}: CourseCardProps) => {
  return (
    <Link to={`/courses/${id}`} className="group block h-full">
      <div className="h-full rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 to-transparent" />
          {/* Level badge */}
          <span
            className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${levelColors[level] || 'bg-neutral-600/90 text-white'}`}
          >
            {level}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-neutral-100 line-clamp-2 mb-2 group-hover:text-violet-300 transition-colors">
            {title}
          </h3>

          {instructor && (
            <p className="text-xs text-neutral-500 mb-3">{instructor}</p>
          )}

          {category?.name && (
            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
              <BookOpen className="w-3 h-3" />
              {category.name}
            </span>
          )}

          {/* Price */}
          <div className="mt-auto pt-3 border-t border-white/5">
            <span className="text-lg font-bold text-neutral-50">
              {Number(price) === 0 ? (
                <span className="text-emerald-400">Free</span>
              ) : (
                `$${Number(price).toFixed(2)}`
              )}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
