// src/components/features/course/CourseCard.tsx
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ds/primitives/Card';
import { Badge } from '@/components/ds/primitives/Badge';
import { Progress } from '@/components/ds/primitives/Progress';
import { Button } from '@/components/ds/primitives/Button';
import { Skeleton } from '@/components/ds/primitives/Skeleton';
import { cn } from '@/lib/utils';

export interface CourseCardProps {
  id: string;
  title: string;
  instructor?: string;
  image_url?: string;
  price?: number;
  category?: { name: string };
  level?: string;
  progress?: number;
  loading?: boolean;
}

export function CourseCard({
  id,
  title,
  instructor,
  image_url,
  price,
  category,
  level,
  progress,
  loading = false,
}: CourseCardProps) {
  if (loading) {
    return (
      <Card variant="elevated" className="overflow-hidden">
        <Skeleton height={160} className="rounded-none" />
        <CardContent className="pt-4 space-y-2">
          <Skeleton height={20} />
          <Skeleton height={16} width="60%" />
          <Skeleton height={16} width="40%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to={`/courses/${id}`} className="block group">
      <Card variant="interactive" className="overflow-hidden h-full">
        <div className="relative h-40 overflow-hidden">
          {image_url ? (
            <img
              src={image_url}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
              <span className="text-neutral-500 text-sm">No image</span>
            </div>
          )}
          {level && (
            <Badge
              variant="primary"
              size="sm"
              className="absolute top-2 right-2"
            >
              {level}
            </Badge>
          )}
        </div>
        <CardContent className="pt-4">
          <h3 className="font-serif font-semibold text-lg text-neutral-50 line-clamp-2 mb-1">
            {title}
          </h3>
          {instructor && (
            <p className="text-sm text-neutral-400 mb-2">{instructor}</p>
          )}
          {category?.name && (
            <Badge variant="outline" size="sm">
              {category.name}
            </Badge>
          )}
          {progress !== undefined && (
            <div className="mt-3">
              <Progress
                value={progress}
                variant="success"
                size="sm"
                showValue
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-neutral-700 pt-3 pb-4">
          <div className="w-full flex justify-between items-center">
            {price !== undefined && (
              <span className="font-bold text-lg text-amber-400">
                ${Number(price).toFixed(2)}
              </span>
            )}
            <Button variant="action" size="sm">
              Enroll
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
